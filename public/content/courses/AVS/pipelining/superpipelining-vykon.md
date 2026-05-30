---
title: Superpipelining a výpočet zrychlení
---

# Superpipelining a výpočet zrychlení s pokutami

S forwardingem a predikcí skoků dosahuje 5-stupňová pipeline reálné CPI ≈ 1,2-1,5. Otázka: jak ještě zrychlit? Dvě cesty — **hlubší** pipeline (více stupňů s kratším taktem) a **širší** pipeline (více instrukcí paralelně, viz [[ilp-superskalar]]).

## Vzorec zrychlení k-stupňové synchronní linky

Mějme **k**-stupňovou pipeline, dobu jednoho taktu $\tau$, zpoždění oddělovacího registru $t_d$, a *průměrnou pokutu* $q$ taktů na instrukci (stall, flush).

Doba zpracování $N$ instrukcí:

$$
T_k = (k + N - 1)(\tau + t_d)(1 + q)
$$

- $k - 1$ taktů náběhu pipeline (než první instrukce dosáhne WB).
- $N$ taktů ustáleného stavu (jedna instrukce per takt, pokud $q = 0$).
- Násobitel $(1 + q)$ za pokuty.

Sub-skalární CPU bez pipeliningu provede 1 instrukci za $t_1 = k \cdot \tau$ (paralelu skládal sériově).

**Zrychlení**:

$$
S_N = \frac{N \cdot t_1}{T_k} = \frac{N \cdot k}{(k + N - 1)(1 + q)}
$$

Limitní pro $N \to \infty$ (dlouhý běh):

$$
\boxed{S_\infty = \frac{k}{(\tau + t_d)(1 + q)/\tau} = \frac{k}{1 + q} = \frac{k}{\text{CPI}}}
$$

kde **CPI = 1 + q** je průměrný počet taktů na instrukci v ustáleném stavu.

## Konkrétní příklad

Klasický příklad z přednášky (Týden 1):

**Sub-skalární CPU**: $t_1 = 20$ ns ⇒ $R = 1/t_1 = 50$ MIPS.

**Řetězená CPU**: 200 MHz, $\tau + t_d = 4 + 1 = 5$ ns, $k = 5$ stupňů, žádné stally (CPI = 1).

Pro $N = 100$:

$$
T_5 = (5 + 99) \cdot 5 = 520 \text{ ns}, \quad R = \frac{100}{520} = 192{,}3 \text{ MIPS}
$$

$$
S_{100} = \frac{N \cdot t_1}{T_5} = \frac{100 \cdot 20}{520} = 3{,}85
$$

Pro $N \to \infty$: $S_\infty = k = 5$ (ideálně, bez stallů).

## Zrychlení s pokutami — příklad

Předpoklady:

- Četnost `load` instrukcí: 25 %, vždy pokuta 1 takt (load-use).
- Četnost skoků: 20 %, 2/3 se provedou s pokutou 3 takty.
- $k = 5$, $N \to \infty$, $\tau \gg t_d$.

Spočítáme průměrnou pokutu $q$:

$$
q = 0{,}25 \cdot 1 + 0{,}2 \cdot \frac{2}{3} \cdot 3 = 0{,}25 + 0{,}4 = 0{,}65
$$

$$
\text{CPI} = 1 + q = 1{,}65, \quad S = \frac{k}{\text{CPI}} = \frac{5}{1{,}65} = 3{,}03
$$

⇒ Reálný 5-stupňový pipeline dosáhne ~3× zrychlení místo ideálních 5×.

Možnosti, jak $q$ snížit:

| Zdroj pokuty | Optimalizace | Efekt na $q$ |
| :--- | :--- | :--- |
| Load-use | forwarding MA→EX | $-0{,}1$ |
| Skoky | predikce 95 % | $\times 0{,}05$ |
| Strukturální (sdílené HW) | duplikace ALU | $\to 0$ |

## Superpipelining (hluboká pipeline)

Superpipeline rozseká *každý* stupeň na **n** kratších částí. Doba taktu klesne $n$-krát, počet stupňů vzroste na $k \cdot n$.

::: svg "Superpipelining vs superskalár — různé strategie"
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="10">
  <text x="270" y="20" text-anchor="middle" font-weight="600" fill="var(--text)">Skalární (5 stupňů)</text>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="60" y="30" width="80" height="22" rx="2"/>
    <rect x="145" y="30" width="80" height="22" rx="2"/>
    <rect x="230" y="30" width="80" height="22" rx="2"/>
    <rect x="315" y="30" width="80" height="22" rx="2"/>
    <rect x="400" y="30" width="80" height="22" rx="2"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="9">
    <text x="100" y="44">IF</text><text x="185" y="44">ID</text><text x="270" y="44">EX</text><text x="355" y="44">MA</text><text x="440" y="44">WB</text>
  </g>
  <text x="270" y="85" text-anchor="middle" font-weight="600" fill="var(--text)">Superřetězená (n = 3, tj. 15 stupňů, takt τ/3)</text>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="40" y="95" width="32" height="22" rx="2"/>
    <rect x="75" y="95" width="32" height="22" rx="2"/>
    <rect x="110" y="95" width="32" height="22" rx="2"/>
    <rect x="145" y="95" width="32" height="22" rx="2"/>
    <rect x="180" y="95" width="32" height="22" rx="2"/>
    <rect x="215" y="95" width="32" height="22" rx="2"/>
    <rect x="250" y="95" width="32" height="22" rx="2"/>
    <rect x="285" y="95" width="32" height="22" rx="2"/>
    <rect x="320" y="95" width="32" height="22" rx="2"/>
    <rect x="355" y="95" width="32" height="22" rx="2"/>
    <rect x="390" y="95" width="32" height="22" rx="2"/>
    <rect x="425" y="95" width="32" height="22" rx="2"/>
    <rect x="460" y="95" width="32" height="22" rx="2"/>
  </g>
  <text x="270" y="140" text-anchor="middle" font-weight="600" fill="var(--text)">Superskalární (m = 3)</text>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="60" y="150" width="80" height="22" rx="2"/>
    <rect x="145" y="150" width="80" height="22" rx="2"/>
    <rect x="230" y="150" width="80" height="22" rx="2"/>
    <rect x="315" y="150" width="80" height="22" rx="2"/>
    <rect x="400" y="150" width="80" height="22" rx="2"/>
    <rect x="60" y="175" width="80" height="22" rx="2"/>
    <rect x="145" y="175" width="80" height="22" rx="2"/>
    <rect x="230" y="175" width="80" height="22" rx="2"/>
    <rect x="315" y="175" width="80" height="22" rx="2"/>
    <rect x="400" y="175" width="80" height="22" rx="2"/>
    <rect x="60" y="200" width="80" height="22" rx="2"/>
    <rect x="145" y="200" width="80" height="22" rx="2"/>
    <rect x="230" y="200" width="80" height="22" rx="2"/>
    <rect x="315" y="200" width="80" height="22" rx="2"/>
    <rect x="400" y="200" width="80" height="22" rx="2"/>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9">
    <text x="100" y="232">3 instrukce paralelně</text>
    <text x="270" y="232">↑ ve stejném taktu</text>
  </g>
</svg>
:::

Zrychlení proti skalárnímu řetězení:

$$
S_{\text{super}} = \frac{k \cdot n}{1 + q'}
$$

ale $q'$ je *vyšší*, protože:

- **Hlubší pipeline** → větší pokuta za špatnou predikci skoku (více instrukcí na flush).
- **Latence operací** (násobičky, dělení) zůstává v ns, ale teď trvá *více* taktů → větší pokuta load-use.
- **Datové konflikty** trvají déle (resolved later).

Pentium 4 měl pipeline 31 stupňů. Pokuta špatné predikce ~30 taktů. Výsledek: nižší výkon než Pentium 3 v některých benchmarcích. Intel se v Core 2 vrátil k ~14 stupňům.

## Optimální hloubka pipeline

Klasický výsledek (Hartstein, Puzak 2002):

$$
k_{\text{opt}} \approx \sqrt{\frac{t_1}{t_d}} \cdot f(q)
$$

Pro typický server kód: $k_{\text{opt}} \approx 8-12$. Pro velmi predictable kód (signal processing): $k_{\text{opt}} \approx 25-35$. Reálné CPU dnes: 14-20 stupňů — kompromis pro heterogenní zátěž.

::: viz superpipelining-depth "Slider pro hloubku pipeline + mispredict rate + branch frekvence. Křivka výkonu má vrchol (Hartstein-Puzak); Pentium 4 (31 stupňů) sedí daleko za peakem."
:::

## Superskalár (širší pipeline)

Druhá cesta: ne hlubší, ale *širší* — vícenásobné cesty fetch + ID + EX + WB. **m-cestný superskalární CPU** vydává až $m$ instrukcí za takt:

$$
\text{IPC}_{\max} = m, \quad S_{\text{super}} = \frac{m \cdot k}{(1 + q)}
$$

Pro reálné kódy ale IPC < m kvůli závislostem. Intel Skylake fetchne až 6 instrukcí, vydává až 8 mikroinstrukcí, ale dosažený IPC v praxi je 2-3.

| Strategie | Páka | Limit | Reálný benefit |
| :--- | :--- | :---: | :---: |
| Hlubší pipeline | snížit takt | data + control hazardy | 2-3× nad in-order |
| Širší pipeline | víc paralelních ALU | dependencies, fetch BW | 2-3× nad skalárním |
| Out-of-order | dynamic reordering | RS, ROB velikost | +30-50 % |
| SIMD | vektorizace | dopad jen na DLP kód | 4-16× nad skalárním |

## Modulární výkonová formule

V praxi je **time-to-solution** dán:

$$
T = \text{IC} \cdot \text{CPI} \cdot T_{\text{takt}}
$$

Pipelining + superskalár tlačí **CPI ↓**. Vyšší takt tlačí **T_takt ↓**. SIMD tlačí **IC ↓** (jedna vektorová instrukce nahradí 8 skalárních). Kompilátor a algoritmus tlačí **IC ↓**.

Žádná z těchto pák není zdarma:

- Hlubší pipeline → vyšší dynamic power $P \propto C V^2 f$ ([[spotreba-pcv2f]]).
- Širší superskalár → exponenciální složitost OoO logiky (RS, ROB scan).
- SIMD → požadavky na alignment, gather/scatter pokuty ([[gather-scatter]]).
- Multi-core → koherence cache ([[koherence-uvod]]), synchronizace ([[synchronizace-bariery]]).

AVS prozkoumá *všechny* tyto kompromisy postupně.

## Co dál

Tím končí Topic 1. Dále [[ilp-superskalar]] otevírá širší pipeline a *dynamické plánování* ([[scoreboard]], [[tomasulo]], [[renaming-rob]]), které dosahuje IPC > 1.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §C.3; Hartstein, A., Puzak, T.R.: „The Optimum Pipeline Depth for a Microprocessor" (ISCA 2002, [DOI 10.1145/545214.545224](https://doi.org/10.1145/545214.545224)); Sprangle, E., Carmean, D.: „Increasing Processor Performance by Implementing Deeper Pipelines" (ISCA 2002).*
