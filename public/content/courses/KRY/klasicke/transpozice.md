---
title: Transpoziční šifry
---

# Transpoziční šifry

Transpoziční šifry **přeskupují znaky** plaintextu podle nějakého schématu, aniž by jednotlivé znaky měnily. Statistika *jednotlivých* znaků (frekvence písmen) je tedy zachovaná — útok přes frekvenční analýzu jednotlivých znaků selže. Statistika *digramů* a *delších kombinací* se však mění; útok přes ně je standardní.

> **Geometricky:** plaintext se zapíše do nějaké matice / mřížky a vyčte se v jiném pořadí. Klíčem je *způsob přeskupení* (pořadí sloupců, geometrická transformace, route).

## Skytale — antická transpozice

Spartská **skytale** (cca 5. stol. př. n. l.): plaintext se napsal na proužek pergamenu omotaný kolem dřevěné tyčky daného průměru. Po sundání proužku se znaky promíchaly, ale příjemce s tyčkou stejného průměru je znovu uspořádal.

::: svg "Skytale — princip"
<svg viewBox="0 0 540 130" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="40"  y="30" width="220" height="70" rx="6"/>
    <rect x="300" y="30" width="220" height="70" rx="6"/>
  </g>
  <g fill="var(--text)" font-family="var(--font-mono)" font-size="13" text-anchor="middle">
    <text x="80"  y="56">H</text><text x="105" y="56">E</text><text x="130" y="56">L</text><text x="155" y="56">P</text><text x="180" y="56">M</text>
    <text x="80"  y="78">E</text><text x="105" y="78">I</text><text x="130" y="78">A</text><text x="155" y="78">M</text><text x="180" y="78">U</text>
    <text x="80"  y="100">N</text><text x="105" y="100">D</text><text x="130" y="100">E</text><text x="155" y="100">R</text><text x="180" y="100">A</text>

    <text x="340" y="56">H</text><text x="365" y="56">E</text><text x="390" y="56">N</text><text x="415" y="56">E</text><text x="440" y="56">I</text>
    <text x="465" y="56">D</text><text x="490" y="56">L</text>
    <text x="340" y="78">A</text><text x="365" y="78">E</text><text x="390" y="78">P</text><text x="415" y="78">M</text><text x="440" y="78">R</text>
    <text x="465" y="78">M</text><text x="490" y="78">U</text>
  </g>
  <g fill="var(--text-muted)" font-size="10.5" text-anchor="middle">
    <text x="150" y="22">plaintext zapsán po řádcích (5×3)</text>
    <text x="410" y="22">přečteno po sloupcích → ciphertext</text>
    <text x="150" y="116">"HELPMEIAMUNDERA(TTACK)"</text>
    <text x="410" y="116">"HEN EID LAEPM RMU"</text>
  </g>
</svg>
:::

Klíčem je *průměr tyčky* — odpovídá *počtu řádků* tabulky. Bezpečnost je triviální: útočník zkouší různé průměry. Pro zprávu délky $n$ tabulka rozměru $a \times b = n$ — kandidátů je počet *dělitelů* $n$. Útok: pro každého kandidáta zkusit dešifrovat a hledat smysluplný text.

## Sloupcová transpozice (columnar transposition)

Klasická transpoziční šifra v moderní formě. Plaintext se zapíše po řádcích do tabulky se *sloupcovým klíčem* — heslem, jehož písmena určují *permutaci sloupců* podle abecedního pořadí.

```
Klíč:    ZEBRAS
Pořadí:    6 3 2 4 1 5         (Z=6, E=3, B=2, R=4, A=1, S=5)

       Z E B R A S
       6 3 2 4 1 5
       --------------
       W E A R E D
       I S C O V E
       R E D F L E
       E A T O N C
       E *

Vyčtení po sloupcích v pořadí 1, 2, 3, 4, 5, 6:
  sl. 1 (A):  E V L N
  sl. 2 (B):  A C D T
  sl. 3 (E):  E S E A
  sl. 4 (R):  R O F O
  sl. 5 (S):  D E E C
  sl. 6 (Z):  W I R E E

Ciphertext: EVLN ACDT ESEA ROFO DEEC WIREE
```

::: viz columnar-transposition "Zadejte plaintext a klíč; sledujte plnění tabulky po řádcích a vyčítání po sloupcích v abecedním pořadí klíče."
:::

### Varianta s mřížkou (Fleißnerova mřížka)

Mechanická pomůcka: čtvercová deska s vyříznutými okénky. Při šifrování položíme desku na papír, vepíšeme znaky do okének, otočíme desku o 90° a opět vepíšeme, atd. Po čtyřech pootočeních pokrývá deska celou mřížku $n \times n$.

### Útok na sloupcovou transpozici

* **Známá délka klíče** (může být odhadnuta z délky zprávy / hledáním dělitelů): zkusíme všechny permutace sloupců a hodnotíme **digramové skóre** kandidátního plaintextu (na základě statistiky digramů jazyka).
* **Hill-climbing / simulated annealing** — moderní automatizovaný přístup: začneme s náhodnou permutací, opakovaně provádíme malé úpravy (swap dvojice sloupců), přijímáme pokud zlepší skóre.
* **Slovníkový útok** — pokud klíč pochází ze slovníku, projedeme slovník.

> Sloupcová transpozice byla *masově nasazovaná v 1. světové válce* (německá ADFGX šifra, **sovětská VIC šifra** — používaná KGB, agent Reino Häyhänen). Statistická kryptoanalýza ji dokáže prolomit, ale s podstatně větším úsilím než monoalfabetickou substituci.

## Dvojitá transpozice

Aplikace sloupcové transpozice **dvakrát po sobě** s různými klíči. Zlepšuje difúzi: znaky se rozprostřou ještě více. Útok je výrazně náročnější — jednu transpozici lze útokem typu hill-climbing rozluštit, dvě se zacyklí (každá změna v první ovlivní celé rozložení druhé).

ADFGVX šifra (Německo, 1918) kombinovala substituci (převedení znaků do dvojic z {A,D,F,G,V,X}) a *dvojitou* sloupcovou transpozici — francouzský kryptolog Painvin ji prolomil za několik týdnů.

## Route ciphery

Místo permutace sloupců se *vyčtení* tabulky provádí podle nějaké **trasy** — spirálou od středu, diagonálou, zigzagem. Klíčem je pak právě tato trasa.

```
Plaintext zapsán po řádcích:
  W E A R E
  D I S C O
  V E R E D
  F L E E I

Trasa "spirála zvnějšku po směru hodinových ručiček":
  W E A R E O D I E E L F V D
```

V praxi je trasa část klíče (klíč říká "spirála zvenku po řádcích, otočená o 90° po každé fázi"). Cílem je být *nepředpokládatelný* pro útočníka.

## Cardanovy "okenní" šifry a rail fence

* **Rail fence cipher** — plaintext se napíše do zigzagového vzoru o $k$ "kolejích":

```
Plaintext: WEAREDISCOVERED  (k = 3)

W . . . E . . . C . . . R
. E . R . D . S . O . E . E
. . A . . . I . . . V . . . D

Vyčtení po řádcích: WECR ERDSOEE AIVD
```

* **Cardanova mřížka** — viz Fleißnerova mřížka výše; vznikla už v 16. stol. (Cardano).

## Limit transpozičních šifer

Transpoziční šifry mají dvě fundamentální slabiny:

1. **Zachovávají frekvence znaků** — útočník hned vidí, že "možná je to angličtina, jen pomíchaná".
2. **Krátké zprávy poskytují málo dat** pro statistický útok přes digramy. *Naopak* — krátká zpráva má málo informace, takže transpozice s dobrým klíčem může být v krátkém kanálu *přijatelná*.

Moderní blokové šifry ([[feistel-spn|Feistel/SPN]]) kombinují *substituci* (konfuze) a *transpozici* (difúze) v iteraci, čímž získávají kvalitativně silnější bezpečnost než kterákoli z těchto operací zvlášť. Shannonovo doporučení: *produktové šifry s mnoha koly*.

---

*Zdroj: KRY přednášky 2025/26, KRY 1 — Klasická kryptografie. Externí reference: Bauer, F. L.: *Decrypted Secrets — Methods and Maxims of Cryptology* (4th ed., Springer 2007), §3.6; Lasry, G., Kopal, N., Wacker, A.: "Automated Cryptanalysis of Columnar Transposition Ciphers", Cryptologia 40(4), 2016; Kahn, D.: *The Codebreakers* (Macmillan 1967), kap. 9 (ADFGVX).*
