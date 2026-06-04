---
title: Informační teorie a sekvenční loga
---

Informační teorie dává nástroj, jak **kvantifikovat konzervovanost** pozice v zarovnání. Základem je **Shannonova entropie**: měří nejistotu rozdělení frekvencí písmen na dané pozici. Pro nukleotidy (4 symboly) je entropie maximální `log₂ 4 = 2` bity, když jsou všechna písmena stejně pravděpodobná, a klesá k nule, když na pozici stojí vždy jediné písmeno.

::: math
H_i = -\sum_{b \in \{A,C,G,T\}} f_{b,i}\,\log_2 f_{b,i}
:::

**Informační obsah** (sequence conservation) pozice `i` je rozdíl maximální a skutečné entropie — tedy o kolik bitů jsme si „jistější" než u rovnoměrného šumu. Pro malé počty sekvencí se přidává korekce malého vzorku `e(n)`, která brání nadhodnocení konzervace.

::: math
R_i = \log_2 4 - \big(H_i + e(n)\big) = 2 - H_i - e(n), \qquad e(n) = \frac{1}{\ln 2}\cdot\frac{s-1}{2n}
:::

**Sekvenční logo** (Schneider & Stephens, 1990) zobrazí tato čísla graficky: na ose `x` jsou pozice zarovnání, **výška celého sloupce** odpovídá informačnímu obsahu `R_i` v bitech (0–2 pro DNA), a v rámci sloupce je **výška každého písmene** úměrná jeho frekvenci, takže `výška = f_{b,i} · R_i`. Vysoké, čisté sloupce = silně konzervované pozice (např. jádro vazebného místa); nízké, rozplizlé sloupce = variabilní pozice.

::: viz pbi-seqlogo "Z malého zarovnání sloupců nukleotidů se počítá entropie a vzniká sekvenční logo: výška sloupce = informační obsah v bitech (R = 2 − H), výška písmene = frekvence; konzervované pozice jsou zvýrazněny."
:::

Stejný aparát se používá i jinde: **relativní entropie** (Kullback–Leiblerova divergence) měří, jak se rozdělení na pozici liší od pozaďového, a stojí za skórovacími maticemi profilů a motivů. Pro proteiny je maximum `log₂ 20 ≈ 4,32` bitu na pozici. Suma `R_i` přes celé logo udává **celkový informační obsah motivu** — u vazebných míst zhruba odpovídá informaci potřebné k jeho nalezení v genomu.

::: quiz "Pozice v zarovnání DNA, kde se vyskytují všechny čtyři nukleotidy se stejnou frekvencí, má informační obsah R_i přibližně:"
- [x] 0 bitů
- [ ] 1 bit
- [ ] 2 bity
- [ ] 4 bity
> Entropie je maximální (H = log₂ 4 = 2), takže R = 2 − H ≈ 0. Pozice nenese žádnou konzervovanou informaci a ve sloupci loga je téměř neviditelná.
:::

::: link "Schneider & Stephens (1990) — Sequence logos (Nucleic Acids Research / PMC)" "https://pmc.ncbi.nlm.nih.gov/articles/PMC332411/"
:::

::: link "Sequence logo — odvození R_i a korekce e(n) (Wikipedia)" "https://en.wikipedia.org/wiki/Sequence_logo"
:::

*Zdroj: PBI státnicové okruhy NBIO, VUT FIT. Externí reference: Schneider & Stephens (1990) — Sequence logos, Nucleic Acids Research; Crooks et al. — WebLogo; přehled Sequence logo (Wikipedia).*
