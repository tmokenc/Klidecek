---
title: Superpipelining a výpočet zrychlení
---

# Superpipelining a výpočet zrychlení s pokutami

S forwardingem a predikcí skoků (branch) dosahuje 5stupňová pipeline reálného CPI ≈ 1,2–1,5. Nabízí se otázka: jak ji ještě zrychlit? Vedou k tomu dvě cesty — **hlubší** pipeline (více stupňů s kratším taktem) a **širší** pipeline (více instrukcí zpracovávaných paralelně, viz [[ilp-superskalar]]).

## Vzorec zrychlení k-stupňové synchronní linky

Mějme **k**-stupňovou pipeline s dobou jednoho taktu $\tau$, zpožděním oddělovacího registru $t_d$ a *průměrnou pokutou* $q$ taktů na instrukci (tj. zdržení způsobená stally a flushy).

Doba zpracování $N$ instrukcí pak je:

$$
T_k = (k + N - 1)(\tau + t_d)(1 + q)
$$

- $k - 1$ taktů zabere náběh pipeline (než první instrukce dorazí do fáze WB).
- $N$ taktů trvá ustálený stav (jedna instrukce za takt, pokud $q = 0$).
- Násobitel $(1 + q)$ přidává pokuty.

Sub-skalární procesor bez pipeliningu provede jednu instrukci za $t_1 = k \cdot \tau$ (jednotlivé fáze totiž skládá sériově za sebe).

**Zrychlení** je proto:

$$
S_N = \frac{N \cdot t_1}{T_k} = \frac{N \cdot k}{(k + N - 1)(1 + q)}
$$

Pro $N \to \infty$ (tedy pro dlouhý běh) dostáváme limitní hodnotu:

$$
\boxed{S_\infty = \frac{k}{(\tau + t_d)(1 + q)/\tau} = \frac{k}{1 + q} = \frac{k}{\text{CPI}}}
$$

kde **CPI = 1 + q** je průměrný počet taktů na instrukci v ustáleném stavu.

## Konkrétní příklad {tier=example}

Klasický příklad z přednášky (Týden 1):

**Sub-skalární procesor**: $t_1 = 20$ ns ⇒ $R = 1/t_1 = 50$ MIPS.

**Řetězený procesor**: 200 MHz, $\tau + t_d = 4 + 1 = 5$ ns, $k = 5$ stupňů, žádné stally (CPI = 1).

Pro $N = 100$:

$$
T_5 = (5 + 99) \cdot 5 = 520 \text{ ns}, \quad R = \frac{100}{520} = 192{,}3 \text{ MIPS}
$$

$$
S_{100} = \frac{N \cdot t_1}{T_5} = \frac{100 \cdot 20}{520} = 3{,}85
$$

Pro $N \to \infty$ vychází $S_\infty = k = 5$ (ideálně, bez stallů).

## Zrychlení s pokutami — příklad

Předpoklady:

- Četnost instrukcí `load`: 25 %, vždy s pokutou 1 takt (load-use).
- Četnost skoků: 20 %, z toho 2/3 se provedou s pokutou 3 takty.
- $k = 5$, $N \to \infty$, $\tau \gg t_d$.

Spočítáme průměrnou pokutu $q$:

$$
q = 0{,}25 \cdot 1 + 0{,}2 \cdot \frac{2}{3} \cdot 3 = 0{,}25 + 0{,}4 = 0{,}65
$$

$$
\text{CPI} = 1 + q = 1{,}65, \quad S = \frac{k}{\text{CPI}} = \frac{5}{1{,}65} = 3{,}03
$$

⇒ Reálná 5stupňová pipeline tedy dosáhne zhruba trojnásobného zrychlení místo ideálního pětinásobného.

Pokutu $q$ můžeme snížit těmito způsoby:

| Zdroj pokuty | Optimalizace | Vliv na $q$ |
| :--- | :--- | :--- |
| Load-use | forwarding MA→EX | $-0{,}1$ |
| Skoky | predikce 95 % | $\times 0{,}05$ |
| Strukturální (sdílený hardware) | duplikace ALU | $\to 0$ |

## Superpipelining (hluboká pipeline)

Superpipeline rozseká *každý* stupeň na **n** kratších částí. Doba taktu díky tomu klesne $n$-krát a počet stupňů vzroste na $k \cdot n$.

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
    <rect x="40" y="95" width="28" height="22" rx="2"/>
    <rect x="70" y="95" width="28" height="22" rx="2"/>
    <rect x="100" y="95" width="28" height="22" rx="2"/>
    <rect x="130" y="95" width="28" height="22" rx="2"/>
    <rect x="160" y="95" width="28" height="22" rx="2"/>
    <rect x="190" y="95" width="28" height="22" rx="2"/>
    <rect x="220" y="95" width="28" height="22" rx="2"/>
    <rect x="250" y="95" width="28" height="22" rx="2"/>
    <rect x="280" y="95" width="28" height="22" rx="2"/>
    <rect x="310" y="95" width="28" height="22" rx="2"/>
    <rect x="340" y="95" width="28" height="22" rx="2"/>
    <rect x="370" y="95" width="28" height="22" rx="2"/>
    <rect x="400" y="95" width="28" height="22" rx="2"/>
    <rect x="430" y="95" width="28" height="22" rx="2"/>
    <rect x="460" y="95" width="28" height="22" rx="2"/>
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

Zrychlení proti skalárnímu řetězení je:

$$
S_{\text{super}} = \frac{k \cdot n}{1 + q'}
$$

pokuta $q'$ je ale *vyšší*, a to z těchto důvodů:

- **Hlubší pipeline** → větší pokuta za špatnou predikci skoku (na flush jde více instrukcí).
- **Latence operací** (násobičky, dělení) zůstává v ns, ale teď zabere *více* taktů → větší pokuta load-use.
- **Datové konflikty** trvají déle (vyřeší se později v pipeline).

Pentium 4 mělo pipeline o 31 stupních. Pokuta za špatnou predikci činila zhruba 30 taktů. Výsledkem byl v některých benchmarcích nižší výkon než u Pentia 3. Intel se proto v jádře Core 2 vrátil k přibližně 14 stupňům.

## Optimální hloubka pipeline

Klasický výsledek (Hartstein, Puzak 2002):

$$
k_{\text{opt}} \approx \sqrt{\frac{t_1}{t_d}} \cdot f(q)
$$

Pro typický serverový kód vychází $k_{\text{opt}} \approx 8-12$. Pro dobře předvídatelný kód (zpracování signálů) vychází $k_{\text{opt}} \approx 25-35$. Reálné procesory dnes mají 14–20 stupňů — jde o kompromis pro různorodou zátěž.

::: viz superpipelining-depth "Posuvníky pro hloubku pipeline, míru chybných predikcí a četnost skoků. Křivka výkonu má vrchol (Hartstein-Puzak); Pentium 4 (31 stupňů) leží daleko za tímto vrcholem."
:::

## Superskalár (širší pipeline)

Druhá cesta není hlubší, ale *širší* — vícenásobné cesty pro fetch, ID, EX i WB. **m-cestný superskalární procesor** vydává až $m$ instrukcí za takt:

$$
\text{IPC}_{\max} = m, \quad S_{\text{super}} = \frac{m \cdot k}{(1 + q)}
$$

U reálných kódů je ale IPC menší než m, a to kvůli závislostem mezi instrukcemi. Intel Skylake načte (fetch) až 6 instrukcí a vydá až 8 mikroinstrukcí, v praxi však dosažený IPC bývá 2–3.

| Strategie | Páka | Limit | Reálný přínos |
| :--- | :--- | :---: | :---: |
| Hlubší pipeline | snížit takt | datové a řídicí hazardy | 2–3× nad in-order |
| Širší pipeline | více paralelních ALU | závislosti, propustnost fetche | 2–3× nad skalárním |
| Out-of-order | dynamické přeskupování instrukcí | velikost RS a ROB | +30–50 % |
| SIMD | vektorizace | týká se jen kódu s DLP | 4–16× nad skalárním |

## Modulární výkonová formule

V praxi je **čas do získání výsledku** (time-to-solution) dán vztahem:

$$
T = \text{IC} \cdot \text{CPI} \cdot T_{\text{takt}}
$$

Pipelining a superskalár tlačí dolů **CPI**. Vyšší takt tlačí dolů **T_takt**. SIMD tlačí dolů **IC** (jediná vektorová instrukce nahradí 8 skalárních). Také překladač (compiler) a algoritmus tlačí dolů **IC**.

Žádná z těchto pák ale není zadarmo:

- Hlubší pipeline → vyšší dynamický příkon $P \propto C V^2 f$ ([[spotreba-pcv2f]]).
- Širší superskalár → exponenciální složitost OoO logiky (procházení RS a ROB).
- SIMD → nároky na zarovnání dat (alignment) a pokuty za operace gather/scatter ([[gather-scatter]]).
- Multi-core → koherence cache ([[koherence-uvod]]) a synchronizace ([[synchronizace-bariery]]).

Předmět AVS si *všechny* tyto kompromisy postupně probere.

## Co dál

Tím končí Téma 1. Dále [[ilp-superskalar]] otevírá širší pipeline a *dynamické plánování* (scheduling) ([[scoreboard]], [[tomasulo]], [[renaming-rob]]), které dosahuje IPC > 1.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §C.3; Hartstein, A., Puzak, T.R.: „The Optimum Pipeline Depth for a Microprocessor" (ISCA 2002, [DOI 10.1145/545214.545224](https://doi.org/10.1145/545214.545224)); Sprangle, E., Carmean, D.: „Increasing Processor Performance by Implementing Deeper Pipelines" (ISCA 2002).*
