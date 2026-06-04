---
title: Entropie ve fyzice a informatice
---

# Entropie ve fyzice a informatice

**Entropie** je míra *neurčitosti* (resp. neuspořádanosti) systému. Ve fyzice popisuje, kolika mikroskopickými způsoby lze realizovat daný makroskopický stav; v informatice měří, kolik informace v průměru chybí k tomu, abychom stav systému *přesně* určili. Obě pojetí spojuje stejná logaritmická myšlenka — počítáme logaritmus počtu možností.

## Fyzikální entropie

**Statistická (Boltzmannova) entropie** váže entropii na počet *mikrostavů* `W`, které odpovídají danému *makrostavu*:

::: math
S = k_B \ln W \qquad [\mathrm{J \cdot K^{-1}}]
:::

* **Mikrostav** — konkrétní přesné rozmístění všech částic (poloha, hybnost).
* **Makrostav** — souhrnný popis globálními veličinami (teplota, tlak, počet molekul v polovinách nádoby). Nejpravděpodobnější makrostav je ten, který lze realizovat *nejvíce* mikrostavy, a má proto *nejvyšší* entropii — to je stav termodynamické rovnováhy.

**Termodynamická entropie** je makroskopický pohled: změnu entropie definuje teplo `Q` vyměněné při teplotě `T`.

::: math
\Delta S = \frac{Q}{T} \qquad [\mathrm{J \cdot K^{-1}}]
:::

Podle **2. termodynamického zákona** entropie izolovaného systému při nevratném ději *roste* a při vratném se *nemění* — nikdy sama od sebe neklesá.

## Informační (Shannonova) entropie

Množství informace o stavu `s` se kvůli *aditivitě* (informace dvou nezávislých zdrojů se sčítá) měří logaritmicky: `I(s) = -log₂ P(s)` bitů. Vzácnější jev (menší `P`) nese více informace.

Pro systém s konečnou množinou stavů `Q = {q₁, …, qₙ}` a rozdělením `P(qᵢ)` je **Shannonova entropie** střední (očekávané) množství informace na jeden stav:

::: math
H(Q) = -\sum_{i=1}^{n} P(q_i)\,\log_2 P(q_i)
:::

Konvenčně se klade `0·log₂ 0 ≡ 0`. Při základu logaritmu 2 vychází `H` v **bitech**.

::: viz bin-entropy "Rozdělení pravděpodobnosti se 4 stavy: posuvníky mění p_i, entropie H se počítá živě. Maximum nastane u rovnoměrného rozdělení."
:::

### Klíčové vlastnosti

* **Maximum** — pro *rovnoměrné* rozdělení `P(sᵢ) = 1/n` platí `H = log₂ n`. Tehdy je neurčitost největší, zprávu nelze komprimovat. Paradox: *nejvíce informace* (z hlediska entropie) nese náhodný šum.
* **Minimum** — zcela *deterministický* systém (jeden stav s `P = 1`) má `H = 0`; o jeho stavu nepotřebujeme žádnou informaci.
* `H` měří jen *množství*, nikoli *význam* či užitečnost zprávy.

**Informace získaná** přijetím zprávy je úbytek entropie — o kolik se snížila naše neurčitost:

::: math
I = H_{\text{před}} - H_{\text{po}}
:::

## Algoritmická entropie (Kolmogorovova složitost) {tier=extra}

**Algoritmická entropie** `K(J, Z)` zprávy `Z` je délka *nejkratšího* programu v jazyce `J`, který tuto zprávu vygeneruje. Jde o jiný pohled na neuspořádanost: zpráva je „náhodná", pokud ji nelze popsat ničím kratším, než je ona sama.

* Žádná zpráva nemůže být *složitější* než systém, který ji generuje.
* Určení `K` je **nerozhodnutelný** problém (neexistuje algoritmus, který by ji obecně spočítal).
* Souvislost s chaosem: posloupnost z [[chaoticke-systemy|logistické rovnice v chaotickém režimu]] má Shannonovu entropii blízkou 1 (klasické kompresory ji „nezmáčknou"), ale algoritmickou má *malou* — stačí krátký program, který ji deterministicky dopočítá.

::: quiz "Kdy je Shannonova entropie diskrétního zdroje s n stavy maximální?"
- [ ] Když je jeden stav jistý (P = 1).
- [x] Když jsou všechny stavy stejně pravděpodobné (P = 1/n).
- [ ] Když má zdroj co nejméně stavů.
- [ ] Když zpráva nese co největší význam.
> Maxima H = log₂ n dosahuje rovnoměrné rozdělení; deterministický zdroj má naopak H = 0 a význam zprávy entropie vůbec neměří.
:::

::: link "C. E. Shannon — A Mathematical Theory of Communication (Bell System Technical Journal, 1948)" "https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf"
:::

::: link "Entropy (information theory) — Wikipedia" "https://en.wikipedia.org/wiki/Entropy_(information_theory)"
:::

*Zdroj: BIN státnicové okruhy NBIO, VUT FIT. Externí reference: Shannon, C. E.: A Mathematical Theory of Communication (1948); MacKay, D. J. C.: Information Theory, Inference, and Learning Algorithms (2003); Wikipedia — Entropy (information theory), Boltzmann's entropy formula.*
