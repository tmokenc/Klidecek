---
title: Monoalfabetická substituce
---

# Monoalfabetická substituce

Monoalfabetická substituční šifra nahrazuje každý znak otevřeného textu *stejným* znakem podle pevné tabulky (substituční abecedy). Je to nejjednodušší netriviální šifra; její konstrukce je intuitivní a její *prolomení* je rovněž — frekvenční analýzou. Z hlediska historie šlo o dominantní typ šifry do středověku; z hlediska kryptografie ji studujeme proto, že jasně ukazuje, *proč* je třeba polyalfabetické a moderní šifry.

## Caesarova šifra

Nejjednodušší monoalfabetická substituce — *posun* o pevné $k$ pozic v abecedě. Julius Caesar podle Suetonia používal $k = 3$:

::: math
E_k(x) = (x + k) \bmod 26, \qquad D_k(y) = (y - k) \bmod 26,
:::

kde $x, y \in \{0, 1, \dots, 25\}$ reprezentují písmena A–Z. Klíčový prostor $|\mathcal{K}| = 26$ (resp. $25$, pokud vyřadíme triviální $k = 0$). Brute force je triviální — 25 možností.

::: viz caesar-shift "Posuňte slider 'shift k' a sledujte, jak se mění substituční tabulka Caesarovy šifry."
:::

> Historicky se *ROT13* (Caesar s $k=13$) používá pro skrývání pointy vtipu, klíče k hádance ap. — symetrické: $\mathrm{ROT13}(\mathrm{ROT13}(x)) = x$.

## Obecná monoalfabetická substituce

Místo posunu je klíčem **libovolná permutace** abecedy. Pro angličtinu je $|\mathcal{K}| = 26! \approx 4 \cdot 10^{26}$ — řádově $2^{88}$. Brute force je nedostupný i pro moderní hardware. Přesto šifra padne během minut.

```
Plaintext:  ABCDEFGHIJKLMNOPQRSTUVWXYZ
Klíč:       PDUIRMFOHSBNCGVKTJWEYAQXZL

Plaintext:  monoalphabeticsubstitution
Ciphertext: CVGVPNKOPDREHUWYDWEHEYEHVG
```

V praxi se klíč zvolí podle **hesla** (keyphrase): zapíše se klíčové slovo bez opakování písmen, doplní se zbylými písmeny abecedy:

```
Klíč: "STARWARS" + ABCDEFGHIJKLMNOPQRSTUVWXYZ
              ↓ vyřazení opakování (zleva doprava)
       STARWBCDEFGHIJKLMNOPQUVXYZ
```

## Frekvenční analýza — útok COA

Klíčové pozorování: **monoalfabetická substituce zachovává frekvence znaků**. Pokud v angličtině je nejčastější písmeno $E$ (12,3 %), pak v ciphertextu bude nejčastější písmeno reprezentující $E$. Stejné platí pro digramy (`TH`, `HE`), trigramy (`THE`, `ING`), opakované slovní vzory (`THE` → `XYZ`).

### Frekvence v angličtině

```
e 12.31%   l 4.03%   b 1.62%
t  9.59    d 3.65    g 1.61
a  8.05    c 3.20    v 0.93
o  7.94    u 3.10    k 0.52
n  7.19    p 2.29    q 0.20
i  7.18    f 2.28    x 0.20
s  6.59    m 2.25    j 0.10
r  6.03    w 2.03    z 0.09
h  5.14    y 1.88
```

Skupiny dle praktické heuristiky ze Singhovy knihy The Code Book:

* **E, T** (vysoké, > 9 %)
* **A, O, I, N, S, H, R** (4–8 %)
* **D, L, U** (2,5–4 %)
* **C, M, F, Y, W, G, P, B** (1,5–3 %)
* **V, K, X, J, Q, Z** (< 1 %)

### Pro češtinu

| Znak | % | Znak | % | Znak | % |
| :-: | :-: | :-: | :-: | :-: | :-: |
| o | 9,06 | n | 6,16 | r | 3,79 |
| e | 8,67 | t | 5,21 | u | 3,12 |
| a | 6,79 | s | 4,57 | y | 1,76 |
| i | 6,21 | í | 4,15 | č | 1,30 |

V češtině mají vysokou frekvenci samohlásky (o, e, a, i) a souhláska *n*. Diakritická písmena rozkládají frekvence šířeji než angličtina — k odlišení češtiny od angličtiny stačí podívat se na frekvenci „o“ a „i“.

### Postup útoku

1. **Spočítej frekvenci** každého písmene ciphertextu.
2. **Připodobni** nejčastější písmeno ciphertextu k *E*, druhé k *T*, atd. Tato hypotéza nemusí být přesná, frekvence ve vzorku se liší od ideálu.
3. **Použij digramy/trigramy.** Nejčastější trigram v angličtině je `THE`. Pokud v ciphertextu identifikujeme nejčastější trigram `XGU`, máme silné pravidlo $X \to T, G \to H, U \to E$.
4. **Pracuj se vzory slov.** Slovo s vzorcem $1\;2\;2\;1$ (4 znaky, prostřední dva stejné) je v angličtině typicky `NOON` nebo `PAPA`. *Porovnávání vzorů* (pattern matching) zužuje možnosti.
5. **Iteruj.** Po každé hypotéze proveď částečné dosazení do ciphertextu — to ti odhalí kontextové slova.

::: svg "Frekvenční rozdělení znaků: angličtina vs. mono-substituovaný ciphertext"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="0.5">
    <line x1="40" y1="180" x2="510" y2="180"/>
    <line x1="40" y1="60" x2="40" y2="180"/>
  </g>
  <g fill="var(--text-muted)" font-size="10">
    <text x="32" y="184" text-anchor="end">0%</text>
    <text x="32" y="120" text-anchor="end">6%</text>
    <text x="32" y="64" text-anchor="end">12%</text>
  </g>
  <g fill="var(--accent)" opacity="0.7">
    <rect x="42" y="100" width="14" height="80"/>
    <rect x="60" y="92"  width="14" height="88"/>
    <rect x="78" y="60"  width="14" height="120"/>
    <rect x="96" y="125" width="14" height="55"/>
    <rect x="114" y="105" width="14" height="75"/>
    <rect x="132" y="170" width="14" height="10"/>
    <rect x="150" y="110" width="14" height="70"/>
    <rect x="168" y="120" width="14" height="60"/>
    <rect x="186" y="100" width="14" height="80"/>
    <rect x="204" y="175" width="14" height="5"/>
    <rect x="222" y="175" width="14" height="5"/>
    <rect x="240" y="140" width="14" height="40"/>
  </g>
  <g fill="var(--text-muted)" font-size="10" text-anchor="middle">
    <text x="49"  y="195">A</text>
    <text x="67"  y="195">N</text>
    <text x="85"  y="195">E</text>
    <text x="103" y="195">I</text>
    <text x="121" y="195">O</text>
    <text x="139" y="195">P</text>
    <text x="157" y="195">R</text>
    <text x="175" y="195">S</text>
    <text x="193" y="195">T</text>
    <text x="211" y="195">U</text>
    <text x="229" y="195">V</text>
    <text x="247" y="195">L</text>
  </g>
  <g fill="var(--text)" font-size="11.5">
    <text x="300" y="80">Z ciphertextu lze přečíst:</text>
    <text x="310" y="100" fill="var(--text-muted)">• nejčastější znak → E</text>
    <text x="310" y="116" fill="var(--text-muted)">• druhý nejčastější → T</text>
    <text x="310" y="132" fill="var(--text-muted)">• nejčastější digram → TH/HE</text>
    <text x="310" y="148" fill="var(--text-muted)">• nejčastější trigram → THE</text>
    <text x="310" y="180" fill="var(--accent)">Stačí ~ 200–500 znaků textu.</text>
  </g>
</svg>
:::

::: viz freq-analysis "Frekvenční analýza monoalfabetické substituce — klikněte na cipher znak v histogramu, pak na cílový plaintext znak. Sledujte, jak se rozluštění upřesňuje."
:::

### Důsledek

Monoalfabetická substituce je **bezpodmínečně nedostatečná** pro jakoukoli reálnou komunikaci. Útok je proveditelný *ručně, na papír, během odpoledne*. Otázka pro středověký kryptosystém zněla "kolik znaků útočník nasbírá", nikoli zda šifru prolomí — odpověď byla *prolomí, vždy*.

## Homofonní šifry — částečné protiopatření

Idea: ploché frekvence znaků. **Homofonní substituce** mapuje jeden znak plaintextu na *více* znaků ciphertextu, přičemž častá písmena dostanou více symbolů:

```
A: 17 19 34 41 56 60 67 83        (8 symbolů — A je časté)
I: 08 22 53 65 88 90              (6 symbolů)
P: 33 91                          (2 symboly — P je řídké)
T: 05 10 20 29 45 58 64 78 99     (9 symbolů — T je velmi časté)
```

Při šifrování *náhodně volíme* jeden ze symbolů přiřazených danému písmenu. Výsledek: každý ze symbolů ciphertextu má frekvenci $\approx 1/N$, kde $N$ je celkový počet symbolů (např. 100 v dvouciferné kódové knize).

Útok je *podstatně* obtížnější — vyžaduje delší ciphertext a digramovou/n-gramovou analýzu. Příklad: **Mary Stuartová** (1586) používala homofonní šifru — Walsinghamův kryptolog ji přesto prolomil a postavil ji před soud. Slabost zůstala v digramech.

## Nomenklátor — od substituce ke kódové knize

Nomenklátor (15.–18. století) přidává nad homofonní substituci **kódová slova** pro frekventované termíny: jména, města, čísla. Příklad:

```
attack    = 1701       at        = 5003
begins    = 7803       the       = 3243
...
```

Plaintext "The attack begins at dawn" → `3243 1701 7803 5003 9912` (pokud `dawn = 9912`). Útok vyžaduje delší korpus a znalost domény (politické vztahy, identita účastníků). Dreyfusův telegram (Panizzardi 1894), Zimmermanův telegram (1917) — historicky významné prolomené nomenklátory.

> Limit nomenklátoru: vyžaduje sdílenou kódovou knihu, jejíž distribuce je problém (a kompromitace katastrofa). Stejný problém má i moderní [[kdc-needham|distribuce klíčů KDC]] — řeší se *protokolem*, ne tabulkou.

---

*Zdroj: KRY přednášky 2025/26, KRY 1 — Klasická kryptografie. Externí reference: Singh, S.: *The Code Book* (Anchor Books 1999), kap. 1–2; Kahn, D.: *The Codebreakers* (Macmillan 1967); Menezes, A., van Oorschot, P., Vanstone, S.: *Handbook of Applied Cryptography* (CRC Press 1996), §7.2.*
