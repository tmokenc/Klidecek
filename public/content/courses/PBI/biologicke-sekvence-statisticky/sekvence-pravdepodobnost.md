---
title: Pravděpodobnostní modely sekvencí
---

Biologickou sekvenci (DNA, RNA, protein) lze chápat jako **realizaci náhodného procesu** nad konečnou abecedou — pro nukleotidy `{A, C, G, T}`. Pravděpodobnostní model přiřadí každé sekvenci `x = x_1 x_2 … x_L` číslo `P(x)`. To umožní dvě klíčové věci: **rozhodovat**, zda sekvence patří spíše do modelu A, nebo do modelu B (poměr věrohodností), a **skórovat** neznámé úseky genomu.

Nejjednodušší je **pozaďový (i.i.d.) model**: každá pozice je nezávislá a má stejné rozdělení daných čtyř pravděpodobností `p_A, p_C, p_G, p_T`. Pravděpodobnost celé sekvence je pak prostý součin pravděpodobností jednotlivých písmen.

::: math
P(x) = \prod_{i=1}^{L} p_{x_i}
:::

Pozaďový model ale ignoruje **závislosti mezi sousedy** — a právě ty nesou biologickou informaci. **Markovův řetězec 1. řádu** modeluje, že pravděpodobnost dalšího nukleotidu závisí na předchozím přes **přechodové pravděpodobnosti** `a_{st} = P(x_i = t \mid x_{i-1} = s)`. Řetězec **n-tého řádu** podmiňuje posledními `n` písmeny (kontext o velikosti `n`); za cenu `4^n × 3` volných parametrů zachytí delší motivy.

::: math
P(x) = P(x_1) \prod_{i=2}^{L} a_{x_{i-1}\,x_i}
:::

::: svg "Pozaďový (i.i.d.) model vs. Markovův řetězec a součin pravděpodobností sekvence."
<svg viewBox="0 0 520 250" style="width:100%;max-width:520px;display:block" xmlns="http://www.w3.org/2000/svg">
  <rect width="520" height="250" fill="var(--bg-inset)"/>
  <text x="14" y="20" font-size="12" font-family="var(--font-mono)" fill="var(--text-muted)">i.i.d. (pozaďový)</text>
  <text x="270" y="20" font-size="12" font-family="var(--font-mono)" fill="var(--text-muted)">Markov 1. řádu</text>
  <line x1="255" y1="10" x2="255" y2="240" stroke="var(--line)" stroke-width="0.7"/>

  <!-- i.i.d.: jeden zdroj, šipky na nezávislé pozice -->
  <circle cx="60" cy="70" r="20" fill="var(--bg-card)" stroke="var(--line-strong)" stroke-width="1"/>
  <text x="60" y="74" text-anchor="middle" font-size="11" font-family="var(--font-mono)" fill="var(--text)">p_b</text>
  <g font-size="13" font-family="var(--font-mono)" font-weight="700">
    <text x="40" y="135" fill="oklch(0.62 0.16 145)">A</text>
    <text x="80" y="135" fill="oklch(0.62 0.16 250)">C</text>
    <text x="120" y="135" fill="oklch(0.72 0.15 80)">G</text>
    <text x="160" y="135" fill="oklch(0.6 0.18 22)">T</text>
  </g>
  <g stroke="var(--accent-line)" stroke-width="1" opacity="0.7">
    <line x1="55" y1="88" x2="44" y2="122"/>
    <line x1="60" y1="90" x2="82" y2="122"/>
    <line x1="65" y1="88" x2="120" y2="122"/>
    <line x1="68" y1="86" x2="160" y2="122"/>
  </g>
  <text x="20" y="170" font-size="10.5" font-family="var(--font-mono)" fill="var(--text-faint)">každá pozice nezávislá</text>
  <text x="20" y="186" font-size="11" font-family="var(--font-mono)" fill="var(--text)">P = p_A·p_C·p_G·…</text>

  <!-- Markov: řetěz se závislostí na předchozím -->
  <g font-family="var(--font-mono)">
    <g>
      <rect x="285" y="55" width="34" height="30" rx="5" fill="var(--bg-card)" stroke="var(--line-strong)"/>
      <text x="302" y="75" text-anchor="middle" font-size="13" font-weight="700" fill="oklch(0.62 0.16 145)">A</text>
    </g>
    <g>
      <rect x="350" y="55" width="34" height="30" rx="5" fill="var(--bg-card)" stroke="var(--line-strong)"/>
      <text x="367" y="75" text-anchor="middle" font-size="13" font-weight="700" fill="oklch(0.72 0.15 80)">G</text>
    </g>
    <g>
      <rect x="415" y="55" width="34" height="30" rx="5" fill="var(--bg-card)" stroke="var(--line-strong)"/>
      <text x="432" y="75" text-anchor="middle" font-size="13" font-weight="700" fill="oklch(0.62 0.16 250)">C</text>
    </g>
  </g>
  <defs>
    <marker id="arr" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent)"/>
    </marker>
  </defs>
  <line x1="319" y1="70" x2="349" y2="70" stroke="var(--accent)" stroke-width="1.4" marker-end="url(#arr)"/>
  <line x1="384" y1="70" x2="414" y2="70" stroke="var(--accent)" stroke-width="1.4" marker-end="url(#arr)"/>
  <text x="334" y="48" text-anchor="middle" font-size="9.5" font-family="var(--font-mono)" fill="var(--text-muted)">a_AG</text>
  <text x="399" y="48" text-anchor="middle" font-size="9.5" font-family="var(--font-mono)" fill="var(--text-muted)">a_GC</text>
  <text x="285" y="120" font-size="10.5" font-family="var(--font-mono)" fill="var(--text-faint)">další písmeno závisí na předchozím</text>
  <text x="285" y="138" font-size="11" font-family="var(--font-mono)" fill="var(--text)">P = P(x1)·a_AG·a_GC·…</text>

  <!-- využití: CpG ostrovy -->
  <rect x="14" y="200" width="492" height="38" rx="6" fill="var(--bg-card)" stroke="var(--line)"/>
  <text x="24" y="216" font-size="10.5" font-family="var(--font-mono)" fill="var(--text-muted)">Využití: dva modely (uvnitř / vně CpG ostrova) → poměr</text>
  <text x="24" y="231" font-size="11" font-family="var(--font-mono)" fill="var(--text)">S(x) = log₂ [ P(x | uvnitř) / P(x | vně) ] &gt; 0 ⇒ CpG ostrov</text>
</svg>
:::

**Aplikace — CpG ostrovy.** V savčí DNA je dinukleotid `CG` (zapisuje se `CpG`) vzácný, protože podléhá metylaci a mutaci na `TG`. V krátkých oblastech kolem promotorů genů je ale `CG` chráněn a vyskytuje se mnohem častěji — to jsou **CpG ostrovy**. Postaví se proto **dva Markovovy modely 1. řádu**: jeden naučený „uvnitř" ostrova, druhý „vně". Pro testovanou sekvenci se spočítá **log-poměr věrohodností**; kladné skóre svědčí pro CpG ostrov. Klíčový rozdíl je v přechodu `a_{CG}` — uvnitř ostrova je výrazně vyšší (řádově 0,27 vs. 0,08 v parametrech odhadnutých v učebnici Durbina a kol.).

::: quiz "Markovův řetězec 1. řádu nad nukleotidy má kolik volných přechodových parametrů?"
- [ ] 4
- [x] 12
- [ ] 16
- [ ] 64
> Matice přechodů je 4×4 = 16 hodnot, ale každý řádek je rozdělení a musí dát součet 1, takže na řádek jsou 3 volné parametry: 4 × 3 = 12. (Plus počáteční rozdělení.)
:::

::: link "Durbin et al. — Biological Sequence Analysis (CpG ostrovy, kap. 3)" "https://www.cambridge.org/core/books/biological-sequence-analysis/921BB7B78B745198829EF96BC7E0F29D"
:::

::: link "CpG ostrovy & Markovovy řetězce (kurzové poznámky, Hunter College)" "https://www.cs.hunter.cuny.edu/~saad/courses/compbio/lectures/lecture9.pdf"
:::

*Zdroj: PBI státnicové okruhy NBIO, VUT FIT. Externí reference: Durbin, Eddy, Krogh, Mitchison — Biological Sequence Analysis (Cambridge Univ. Press, 1998); kurzové poznámky Hunter College (CpG islands, Markov chains, HMM).*
