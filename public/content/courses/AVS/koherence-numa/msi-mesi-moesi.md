---
title: Protokoly MSI, MESI, MOESI a MESIF
---

# Protokoly koherence cache — MSI, MESI, MOESI, MESIF

Protokoly koherence cache (cache coherence) jsou *konečné automaty* udržované zvlášť pro každou řádku cache (cache line). Definují *stavy* a *přechody* mezi nimi, které se spouštějí při různých událostech (čtení nebo zápis procesoru, odposlech sběrnice — bus snoop). Tato sekce popisuje celou hierarchii: MSI (základ) → MESI (+E) → MOESI (+O) → MESIF (varianta).

## MSI — základní protokol

Má 3 stavy:

- **M (Modified, modifikovaný)** — vlastníme jedinou kopii, je „špinavá" (dirty), tedy data v paměti jsou zastaralá.
- **S (Shared, sdílený)** — kopie pouze pro čtení, kterou může mít *více* cache najednou. Paměť je aktuální (čistá).
- **I (Invalid, neplatný)** — žádná platná kopie zde není.

### Přechody (čtení/zápis na tomto jádru)

| Stav | Akce | Nový stav | Akce na sběrnici |
| :--- | :--- | :--- | :--- |
| I | čtení jádrem | S | BusRead (načtení z paměti nebo z jiné cache) |
| I | zápis jádrem | M | BusReadExclusive (zneplatnění ostatních) |
| S | čtení jádrem | S | (nic — zásah, hit) |
| S | zápis jádrem | M | BusUpgrade (zneplatnění cizích kopií ve stavu S) |
| M | čtení jádrem | M | (nic — zásah, hit) |
| M | zápis jádrem | M | (nic — již máme výhradní kopii) |

### Přechody (cizí akce na sběrnici)

| Stav | Cizí akce | Nový stav | Akce tohoto jádra |
| :--- | :--- | :--- | :--- |
| M | BusRead | S | zapsat „špinavá" data zpět a poslat je do paměti i žadateli |
| M | BusReadExclusive | I | zapsat „špinavá" data zpět, zneplatnit svou kopii |
| S | BusReadExclusive | I | zneplatnit svou kopii |
| S | BusRead | S | (nic) |
| I | jakákoli | I | (nic) |

### Omezení MSI

Vezměme **čistý** vzor „načti a uprav" (load + store) bez sdílení s jiným jádrem:

```c
// Core 1, no other cores hold A:
load A   → MSI: state I → S (BusRead)
store A  → MSI: state S → M (BusUpgrade — invalidate broadcast)
```

`BusUpgrade` je tu *zbytečný* — žádné jiné jádro kopii nemá, takže není koho zneplatňovat. MSI ho ale posílá vždy, čímž plýtvá propustností sběrnice (bandwidth).

## MESI — přidává E (Exclusive)

Má 4 stavy: MSI a navíc **E (Exclusive, výhradní)** — kopie pouze pro čtení, která je *jediná* v systému a paměť je čistá (jde tedy o čistou obdobu stavu M).

Klíčová myšlenka: pokud při čtení (load) *nikdo* jiný kopii nemá, řádka přejde do stavu E (ne S). Když pak jádro provede zápis, může tiše (bez vysílání na sběrnici) přejít na M.

### Přechody (čtení/zápis na tomto jádru)

| Stav | Akce | Nový stav | Akce na sběrnici |
| :--- | :--- | :--- | :--- |
| I | čtení jádrem (bez dalších držitelů) | **E** | BusRead, odpověď „no sharers" |
| I | čtení jádrem (existují další držitelé) | S | BusRead, odpověď „shared" |
| I | zápis jádrem | M | BusReadExclusive |
| **E** | zápis jádrem | M | **(nic — tiše!)** |
| S | zápis jádrem | M | BusUpgrade |
| M | jakákoli | M | (nic) |

Klíčová optimalizace je tedy **tichý přechod E → M**. U typického kódu (alokace, inicializace, použití) to věci usnadní:

```c
int *a = malloc(N * sizeof(int));    // allocate, no sharers
a[0] = 1;                             // I → E (load) → M (silent store)
a[1] = 2;                             // I → E → M
...
```

MSI by u každého zápisu vygeneroval BusUpgrade. MESI nepošle nic.

⇒ MESI je proto standardem ve většině moderních procesorů. Intel i AMD od éry Pentií používají MESI nebo jeho varianty.

::: svg "Stavový automat MESI (zjednodušený)"
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="10">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.5">
    <circle cx="120" cy="60" r="35"/>
    <circle cx="420" cy="60" r="35"/>
    <circle cx="120" cy="180" r="35"/>
    <circle cx="420" cy="180" r="35"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600" font-size="14">
    <text x="120" y="65">I</text>
    <text x="420" y="65">M</text>
    <text x="120" y="185">S</text>
    <text x="420" y="185">E</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9">
    <text x="120" y="78">Invalid</text>
    <text x="420" y="78">Modified</text>
    <text x="120" y="198">Shared</text>
    <text x="420" y="198">Exclusive</text>
  </g>
  <g stroke="var(--text)" fill="none" stroke-width="1">
    <path d="M155,60 L385,60" marker-end="url(#mesi-ar)"/>
    <path d="M120,95 L120,145" marker-end="url(#mesi-ar)"/>
    <path d="M420,145 L420,95" marker-end="url(#mesi-ar)"/>
    <path d="M155,75 Q270,150 385,165" marker-end="url(#mesi-ar)"/>
    <path d="M155,180 Q270,120 385,80" marker-end="url(#mesi-ar)"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="9">
    <text x="270" y="55">core write (no sharers)</text>
    <text x="100" y="125">load w/ sharers</text>
    <text x="300" y="108">core write (BusUpgrade)</text>
    <text x="445" y="125">core write (silent!)</text>
    <text x="190" y="135">load (none)</text>
    <text x="350" y="135">→ E</text>
  </g>
  <defs>
    <marker id="mesi-ar" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L5,3 L0,6 z" fill="var(--text)"/>
    </marker>
  </defs>
</svg>
:::

::: viz mesi-state-machine "Vyber protokol (MSI / MESI / MOESI). Klikni na „core 0 read", „core 0 write" atd. — obě jádra přepínají stavy podle pravidel a aktivita sběrnice se zobrazí dole."
:::

## MOESI — přidává O (Owned)

Má 5 stavů: MESI a navíc **O (Owned, vlastněný)** — kopie pouze pro čtení, která drží *nejaktuálnější* („špinavá") data; je odpovědná za zásobování čtenářů a za pozdější zápis dat zpět do paměti (write-back). Paměť je tedy zastaralá. Pro zápis musí vlastník (owner) nejprve zneplatnit sdílející kopie ve stavu S a přejít do M.

Klíčová výhoda: pokud má jádro P1 řádku ve stavu `M` a jádro P2 ji chce číst, pak *bez* MOESI musí P1 nejdřív data zapsat zpět do paměti a teprve potom je P2 přečte. To jsou **dvě** paměťové transakce.

S MOESI předá P1 kopii jádru P2 *přímo* (přenos z cache do cache, cache-to-cache), P1 přejde do stavu `O` a P2 do `S`. Paměť přitom zůstane *nedotčená* — za pozdější zápis zpět totiž odpovídá držitel stavu `O`.

⇒ MOESI tedy snižuje provoz vůči paměti u vzorů typu „sdílej po úpravě" (share-after-modify).

Použití: procesory AMD (Athlon → Zen). IBM POWER.

## MESIF — varianta od Intelu

Procesory Intel Core i7 a novější používají **MESIF**:

- Stavy M, E, S, I jsou stejné jako v MESI.
- **F (Forward, předávající)** — *jediná* z více kopií ve stavu S, která *odpovídá* na BusRead.

Bez stavu F by platilo: kdyby mělo kopii ve stavu S pět cache a další jádro by chtělo číst, *všechny* by odpověděly současně (souběh, race). MESIF to řeší tak, že odpovídá pouze kopie ve stavu F.

Jde o optimalizaci pro *velkou* sdílenou cache L3 a mnoho jader — snižuje soupeření (contention) na sběrnici.

## Srovnání protokolů

| Protokol | Stavy | Cache-to-cache | Optimalizováno pro |
| :--- | :--- | :--- | :--- |
| MSI | 3 | ne | základní použití |
| MESI | 4 | částečně | nesdílené zápisy |
| MOESI | 5 | ano | sdílení po úpravě |
| MESIF | 5 | ano (deterministicky) | čtení s mnoha sdílejícími |

Volba protokolu závisí na *topologii cache* a na *typickém vzoru sdílení* daných aplikací.

## Příklad: producent–konzument {tier=example}

Jádro P0 data produkuje, jádro P1 je spotřebovává:

```c
shared int buffer[1024];
shared int ready = 0;

// P0:
buffer[0..N-1] = data;
ready = 1;

// P1:
while (!ready);
use(buffer[0..N-1]);
```

S protokolem MESI:

1. P0 zapíše `buffer[0]`: I → E → M (tiše).
2. P0 zapisuje `buffer[1..N-1]`: zůstává M.
3. P0 zapíše `ready = 1`: I → E → M.
4. P1 čte `ready`: BusRead → P0 zapíše „špinavou" hodnotu `ready` zpět do paměti, P1 dostane S a P0 přejde na S. Paměť je aktualizovaná.
5. P1 čte `buffer[0..N-1]`: každé čtení přiměje P0 zapsat data zpět a sdílet je.

Z hlediska propustnosti je to v pořádku: každá řádka bufferu se přenese *jednou* z P0 do P1 a paměť se aktualizuje.

S protokolem MOESI mohou „špinavé" řádky cache jádra P0 jít *přímo* do P1 *bez* zápisu do paměti. To znamená úsporu přibližně 30 % propustnosti.

## False sharing z pohledu protokolu

Připomenutí ([[false-sharing-races]]): dvě jádra aktualizují *různé* položky ve *stejné* řádce cache.

Z pohledu protokolu:

1. P0 zapíše `counts[0]`: řádka → M.
2. P1 zapíše `counts[1]`: BusReadExclusive → P0 zapíše M zpět, P1 dostane M.
3. P0 znovu zapíše `counts[0]`: BusReadExclusive → P1 zapíše M zpět, P0 dostane M.
4. ...

Řádka cache se tak mezi stavy M neustále „pinká" (ping-pong) z jednoho jádra na druhé. Každý přenos stojí 100–300 cyklů. *Právě to* je zdroj zpomalení.

## Režie koherence s rostoucím rozsahem

Odposlech sběrnice (snooping — vysílání každého zneplatnění všem) škáluje špatně — viz [[snooping-directory]].

⇒ Pro velké systémy (Intel Xeon s 56 jádry, AMD EPYC s 96 jádry) se proto používají protokoly *založené na adresáři* (directory-based) ([[snooping-directory]]).

## Co dál

[[snooping-directory]] vysvětluje, *jak* hardware protokoly skutečně implementuje: odposlechem sběrnice (snooping, vysílání všem) versus pomocí adresáře (directory, komunikace bod-bod). [[uma-numa]] téma zobecňuje na *nejednotnou* (non-uniform) topologii paměti.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=r_ZE1XVT8Ao" "Cache Coherence Problem & Cache Coherency Protocols" "Neso Academy"
:::

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §5.2-5.4; Papamarcos, M.S., Patel, J.H.: „A Low-Overhead Coherence Solution for Multiprocessors with Private Cache Memories" (ISCA 1984, [DOI 10.1145/800015.808204](https://doi.org/10.1145/800015.808204)); Sorin, D.J., Hill, M.D., Wood, D.A.: „A Primer on Memory Consistency and Cache Coherence" (Morgan & Claypool 2011).*
