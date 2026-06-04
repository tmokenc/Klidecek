---
title: Implementace stavového automatu
---

Aby hlavní smyčka zůstala rychlá a responzivní, nesmí žádná úloha **aktivně čekat** (busy-wait). Když potřebuje program počkat — třeba na odeslání bajtu po sběrnici nebo na vypršení časovače — nemůže si dovolit zacyklit se ve smyčce a držet tím procesor. Řešením je **konečný stavový automat** (*Finite State Machine*, FSM): program si uloží, v jakém je **stavu**, vrátí řízení hlavní smyčce a při *dalším* průchodu jen zkontroluje, zda už může přejít do stavu nového.

Tím se z dlouhé blokující operace stane posloupnost krátkých neblokujících kroků, mezi nimiž běží ostatní úlohy. Stav je obvykle proměnná (typicky `enum`) a logika přechodů se vykonává v každém průchodu smyčkou.

```c
typedef enum { IDLE, START, SENDING, WAIT_ACK, DONE } tx_state_t;

static tx_state_t state = IDLE;

void tx_step(void) {            // voláno z hlavní smyčky každý průchod
    switch (state) {
        case IDLE:
            if (have_data())      state = START;
            break;
        case START:
            uart_begin();         state = SENDING;
            break;
        case SENDING:
            if (uart_done())      state = WAIT_ACK;   // neblokující dotaz
            break;                                     // jinak rovnou ven
        case WAIT_ACK:
            if (ack_received())   state = DONE;
            break;
        case DONE:
            cleanup();            state = IDLE;
            break;
    }
}
```

Všimni si, že žádná `case` větev nečeká ve smyčce — buď udělá jeden krok a přejde, nebo rovnou skončí (`break`) a počká na příští volání. To je celé tajemství neblokujícího kódu nad super-loopem (viz [[super-loop]]).

::: svg "Neblokující FSM: každý průchod smyčkou udělá nejvýše jeden přechod"
<svg viewBox="0 0 520 130" xmlns="http://www.w3.org/2000/svg">
  <g font-size="10.5" fill="var(--text)" text-anchor="middle">
    <circle cx="50"  cy="60" r="24" fill="var(--bg-card)" stroke="oklch(0.6 0.14 264)" stroke-width="1.4"/>
    <text x="50"  y="64">IDLE</text>
    <circle cx="170" cy="60" r="24" fill="var(--bg-card)" stroke="oklch(0.6 0.14 264)" stroke-width="1.4"/>
    <text x="170" y="64">START</text>
    <circle cx="290" cy="60" r="24" fill="oklch(0.65 0.13 65 / 0.3)" stroke="oklch(0.6 0.14 65)" stroke-width="1.4"/>
    <text x="290" y="58">SEND</text>
    <text x="290" y="69" font-size="8" fill="var(--text-muted)">·ING</text>
    <circle cx="410" cy="60" r="24" fill="oklch(0.65 0.13 65 / 0.3)" stroke="oklch(0.6 0.14 65)" stroke-width="1.4"/>
    <text x="410" y="58">WAIT</text>
    <text x="410" y="69" font-size="8" fill="var(--text-muted)">_ACK</text>
    <circle cx="490" cy="60" r="22" fill="oklch(0.65 0.13 142 / 0.35)" stroke="oklch(0.6 0.14 142)" stroke-width="1.4"/>
    <text x="490" y="64">DONE</text>
  </g>
  <g stroke="var(--line-strong)" stroke-width="1.3" fill="none">
    <line x1="74"  y1="60" x2="142" y2="60" marker-end="url(#fsmA)"/>
    <line x1="194" y1="60" x2="262" y2="60" marker-end="url(#fsmA)"/>
    <line x1="314" y1="60" x2="382" y2="60" marker-end="url(#fsmA)"/>
    <line x1="434" y1="60" x2="464" y2="60" marker-end="url(#fsmA)"/>
  </g>
  <g font-size="8" fill="var(--text-muted)" text-anchor="middle">
    <text x="108" y="50">have_data()</text>
    <text x="228" y="50">begin</text>
    <text x="348" y="50">done()</text>
  </g>
  <path d="M 472 78 C 360 122, 120 122, 38 80" fill="none" stroke="var(--line)" stroke-width="1" stroke-dasharray="3 3" marker-end="url(#fsmA)"/>
  <text x="255" y="120" text-anchor="middle" font-size="8" fill="var(--text-faint)">cleanup → IDLE</text>
  <defs>
    <marker id="fsmA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 Z" fill="var(--line-strong)"/>
    </marker>
  </defs>
</svg>
:::

## Jak vybrat obsluhu aktuálního stavu

Jádro každého FSM je **dispatch** — výběr kódu, který se má pro aktuální stav vykonat. Liší se režií i bezpečností; rozdíl je pozorovatelný hlavně u automatů s mnoha stavy.

**Konstrukce `switch`-`case`** je nejběžnější a nejčitelnější. Pokud jsou stavy definovány jako po sobě jdoucí celočíselné hodnoty (`enum` od nuly), překladač `switch` typicky přeloží na **tabulku skoků** (*jump table*) — pole adres indexované hodnotou stavu. Vyhodnocení pak proběhne v **konstantním čase $O(1)$** bez ohledu na počet stavů. (Pokud jsou hodnoty řídké nebo jich je málo, překladač zvolí jiný plán, např. řetěz porovnání nebo binární vyhledávání.)

**Pole ukazatelů na funkce** je explicitní varianta téhož principu: každý stav je index do pole, ve kterém je uložen **ukazatel na obslužnou funkci**. Dispatch je opět $O(1)$ a kód je modulární. Pozor ale na bezpečnost — pokud se index spočítá chybně a *neověří se rozsah*, procesor skočí na neplatnou adresu. Proto je nutná **kontrola mezí** (*bounds checking*) před každým voláním přes ukazatel.

```c
typedef void (*state_fn)(void);
static const state_fn TABLE[] = { st_idle, st_start, st_sending, st_wait, st_done };

void tx_step(void) {
    if (state < (sizeof TABLE / sizeof TABLE[0]))   // !! kontrola mezí
        TABLE[state]();                              // O(1) skok přes ukazatel
}
```

**Řetěz `if`-`else`** je naopak nejhorší volba pro velký počet stavů: porovnává stavy po jednom, takže pro vzdálený stav udělá až *N* porovnání — výkon $O(n)$ a se vzrůstajícím počtem stavů i horší čitelnost.

::: viz nav-fsm-dispatch "Posouvej počet stavů a cílový stav. If-else testuje stavy po řadě (O(n)); switch i pole ukazatelů skočí přímo přes index (O(1)), nezávisle na N."
:::

| Přístup | Složitost výběru | Čitelnost | Pozn. |
|---|---|---|---|
| `if`-`else` řetěz | $O(n)$ | klesá s počtem stavů | jednoduché, ale pomalé pro mnoho stavů |
| `switch`-`case` | $O(1)$ při souvislých `enum` | dobrá | překladač generuje jump table |
| pole ukazatelů na funkce | $O(1)$ | velmi dobrá (modulární) | **nutná kontrola mezí indexu** |

## Hierarchický koordinátor {tier=extra}

Když systém roste, jeden plochý automat s desítkami stavů přestane být udržitelný. Osvědčuje se proto **hierarchické řízení**: jeden nadřazený **koordinátor** (hlavní stavový automat) spravuje a aktivuje **podřízené automaty** — pro komunikaci, pro displej, pro řízení motoru. Každý podřízený automat řeší svou doménu nezávisle a koordinátor jen rozhoduje, který je právě aktivní. Tím se zachová modularita a každý dílčí automat zůstane malý a otestovatelný.

::: svg "Koordinátor aktivuje podřízené automaty podle režimu zařízení"
<svg viewBox="0 0 480 150" xmlns="http://www.w3.org/2000/svg">
  <rect x="170" y="14" width="140" height="38" rx="8" fill="oklch(0.62 0.14 264 / 0.18)" stroke="oklch(0.6 0.14 264)" stroke-width="1.3"/>
  <text x="240" y="32" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">koordinátor</text>
  <text x="240" y="46" text-anchor="middle" font-size="8.5" fill="var(--text-muted)">hlavní FSM (režim)</text>
  <g stroke="var(--line-strong)" stroke-width="1.2" fill="none">
    <path d="M 200 52 L 90 92" marker-end="url(#hcA)"/>
    <path d="M 240 52 L 240 92" marker-end="url(#hcA)"/>
    <path d="M 280 52 L 390 92" marker-end="url(#hcA)"/>
  </g>
  <g font-size="9.5" fill="var(--text)" text-anchor="middle">
    <rect x="30"  y="92" width="120" height="42" rx="6" fill="oklch(0.65 0.13 22 / 0.3)" stroke="oklch(0.6 0.14 22)"/>
    <text x="90"  y="112">FSM: komunikace</text>
    <text x="90"  y="126" font-size="8" fill="var(--text-muted)">UART/SPI</text>
    <rect x="180" y="92" width="120" height="42" rx="6" fill="oklch(0.65 0.13 65 / 0.3)" stroke="oklch(0.6 0.14 65)"/>
    <text x="240" y="112">FSM: displej</text>
    <text x="240" y="126" font-size="8" fill="var(--text-muted)">menu</text>
    <rect x="330" y="92" width="120" height="42" rx="6" fill="oklch(0.65 0.13 142 / 0.3)" stroke="oklch(0.6 0.14 142)"/>
    <text x="390" y="112">FSM: pohon</text>
    <text x="390" y="126" font-size="8" fill="var(--text-muted)">PWM</text>
  </g>
  <defs>
    <marker id="hcA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 Z" fill="var(--line-strong)"/>
    </marker>
  </defs>
</svg>
:::

::: quiz "U pole ukazatelů na funkce indexovaného hodnotou stavu je oproti `switch` navíc nutné…"
- [ ] …aby stavy byly definované jako řetězce, ne jako `enum`.
  > Index do pole musí být celé číslo; `enum` je ideální. Řetězce by naopak dispatch zpomalily.
- [x] …explicitně ověřit, že index je v mezích pole, jinak hrozí skok na neplatnou adresu.
  > Ano. `switch` má pro neznámé hodnoty `default`, ale `TABLE[state]()` slepě skočí kamkoliv — chybný index = volání na náhodnou adresu. Kontrola mezí je povinná.
- [ ] …aby byl počet stavů mocninou dvojky.
  > Žádné takové omezení neplatí; pole může mít libovolnou délku. Důležitá je jen kontrola rozsahu indexu.
:::

::: link "Optimal state machine implementation in C — Embedded.com" "https://www.embedded.com/programming-embedded-systems-optimal-state-machine-implementation-in-c/"
:::

::: link "Implementing finite state machines in embedded systems — Embedded.com" "https://www.embedded.com/implementing-finite-state-machines-in-embedded-systems/"
:::

---

*Zdroj: SZZ NADE — předmět Návrh vestavěných systémů, VUT FIT. Externí reference: Embedded.com (state-machine implementace v C).*
