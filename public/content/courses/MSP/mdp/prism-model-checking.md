---
title: PRISM a stochastic model checking
---

# PRISM a stochastic model checking

**Probabilistic model checking** rozšiřuje klasický model checking (např. SPIN, NuSMV) o *kvantitativní* otázky: ne „je vlastnost vždy pravdivá?", ale „s jakou pravděpodobností je pravdivá v daném časovém okně?". Vznikla z toho samostatná oblast s teoretickými nástroji (PCTL/CSL/LTL+probs) a praktickými verifikátory (PRISM, Storm). Tato kapitola sumarizuje, *jaký druh otázky* lze v daném modelu položit a *jaké techniky* se k jejich zodpovězení používají.

## Kvantitativní specifikační logiky

Klasický CTL: „existuje cesta, kde nakonec platí φ?". Probabilistická varianta:

* **PCTL** (Probabilistic CTL) — `P_{⋈p}[φ]` = „pravděpodobnost cest splňujících `φ` je v relaci `⋈` s prahem `p`".
* **CSL** (Continuous Stochastic Logic) — pro CTMC, s časovými intervaly.
* **PLTL** (Probabilistic LTL) — `P[φ]` pro lineární temporální vlastnosti.

### Typické vlastnosti

* `P_{≥0.99}[F ≤ 100 delivered]` — pravděpodobnost doručení zprávy do 100 kroků je nejméně 99 %.
* `P_{≤10⁻⁶}[G error_state]` — pravděpodobnost trvalé chyby je nejvýše `10⁻⁶`.
* `P=?[F success]` — *spočítej* přesnou pravděpodobnost úspěchu (quantitative query).
* `R_{≤500}[F goal]` — *reward query*: očekávaná odměna do dosažení cíle je nejvýše 500.

V MDP se `P=?[F success]` *neptá na jedinou hodnotu* — odpověď závisí na plánovači. Verifikátor proto počítá `min_σ` a `max_σ` separátně.

## PRISM — overview

[PRISM](https://www.prismmodelchecker.org/) (Oxford / Birmingham) podporuje:

| Model | Popis | Otázky |
| :--- | :--- | :--- |
| DTMC | Discrete-time Markov chain | PCTL, expected reward |
| CTMC | Continuous-time Markov chain | CSL, expected time/reward |
| MDP | Markov Decision Process | PCTL (min/max), expected reward |
| PTA | Probabilistic Timed Automata | PCTL s časem |

Vstupní jazyk:

```
dtmc

module M
    s : [0..2] init 0;
    
    [] s=0 -> 0.9 : (s'=1) + 0.1 : (s'=2);
    [] s=1 -> 0.5 : (s'=0) + 0.5 : (s'=1);
    [] s=2 -> 1.0 : (s'=2);
endmodule

label "delivered" = s=2;
label "error" = s=1;
```

PCTL formule: `P=? [ F "delivered" ]` (pravděpodobnost eventuálního doručení), `P=? [ F<=10 "delivered" ]` (do 10 kroků).

## Storm — alternativa

[Storm](https://www.stormchecker.org/) (RWTH Aachen, později UTwente) je modernější verifikátor s lepší výkonností. Podporuje:

* Stejné vstupní jazyky jako PRISM (PRISM, JANI),
* Pokročilejší algoritmy (interval iteration, sound value iteration, BVI),
* Counterexample generation,
* Symbolickou reprezentaci (BDD/MTBDD) pro stavové prostory > `10¹⁰`.

## Algoritmy uvnitř

Probabilistic model checking se opírá o algoritmy, které už známe:

* **Reachability** ([[reachability]]) — pro `P_{⋈p}[F φ]` rozhodneme `P(s₀ → T) ⋈ p`.
* **Bounded reachability** — pro `F^{≤k}` použijeme [[transient-analyza|tranzientní distribuci]] `t⁽ᵏ⁾`.
* **MDP min/max** — [[value-iteration|value iteration]] (resp. PI/LP).
* **Steady-state** — pro `S_{⋈p}[φ]` v ergodickém DTMC.
* **Expected reward** — modifikace VI s odměnami.

### Numerická úskalí: VI vs. exaktní řešení

Pro DTMC s `|S|` stavy lze reachability spočítat *přesně* řešením systému `(I − P) x = b` v `O(|S|³)`. Pro `|S| > 10⁴` se ale používá *iterativní* VI.

**Háček VI**: standardní stopping criterion `||Vᵏ⁺¹ − Vᵏ||_∞ < ε` *nemusí* zaručit `||Vᵏ − V*||_∞ < ε`! Důvod: bez kontrahování (`γ = 1`) se chyba *nemusí zmenšovat*. Moderní řešení:

* **Interval Iteration** (Haddad, Monmege 2014) — iteruje dvojici `(V_low, V_high)`, garantuje konvergenci s explicitními chyby.
* **Sound Value Iteration** (Quatmann, Katoen 2018) — používá *grafové preprocessing* (BSCC) + IVI.
* **Optimistic Value Iteration** (Hartmanns, Kaminski 2020) — hybridní přístup, často nejrychlejší v praxi.

## State space explosion

Hlavní výzvou je *velikost stavového prostoru*. Pro `n` procesů, každý s `k` stavy: `kⁿ` globálních stavů. Pro `n = 30, k = 4`: `10¹⁸` — neunesitelné explicitní reprezentací.

Řešení:

* **Symbolické reprezentace** — BDD (Binary Decision Diagrams), MTBDD pro pravděpodobnosti.
* **Abstrakce** — *interval MDP*, predicate abstraction, CEGAR (counterexample-guided abstraction refinement).
* **Bounded model checking** — řešíme jen pro omezený horizont.
* **Statistical model checking** (SMC) — simulujeme cesty, kontrolujeme empirickou pravděpodobnost (sacrificing soundness for scalability). Nástroj: **UPPAAL SMC**.

## Související nástroje

* **PRISM** — klasický, dobře dokumentovaný, GUI + CLI.
* **Storm** — výkonnostně silný, modulární backend (engine selection).
* **UPPAAL SMC** — statistical model checking pro real-time systémy.
* **GreatSPN** — generalized stochastic Petri nets.
* **SARSOP, DESPOT, PAYNT** — POMDP solvery.

## Případové studie

* **FireWire root contention protocol** — analýza protokolu mediálního zařízení, ověření vlastností přes PRISM (Bouali et al., 1998–).
* **IEEE 802.11 MAC** — bezdrátový protokol s exponenciálním backoff, randomized.
* **Kryptografické protokoly** — Crowds anonymity protocol — analýza `P[F leak]`.
* **Biological systems** — molekulární modely (signaling pathways), populační genetika.
* **Cybersecurity** — analýza randomizovaných obran (probabilistic packet marking).

::: link "Kwiatkowska, M., Norman, G., Parker, D.: PRISM 4.0 — Verification of Probabilistic Real-Time Systems (CAV 2011)" "https://www.prismmodelchecker.org/papers/cav11.pdf"
:::

::: link "Hensel, C. et al.: The probabilistic model checker Storm (STTT 2022)" "https://link.springer.com/article/10.1007/s10009-021-00633-z"
:::

::: link "Baier, C., Katoen, J.-P.: Principles of Model Checking (MIT Press 2008)" "https://mitpress.mit.edu/9780262026499/principles-of-model-checking/"
:::

---

*Zdroj: MSP přednášky 2025/26, *MDP — Probabilistic Model Checking* (Češka). Externí reference: Baier, C., Katoen, J.-P.: *Principles of Model Checking* (MIT Press 2008), kap. 10–11; Kwiatkowska, M., Norman, G., Parker, D.: *PRISM 4.0*, CAV 2011; Hensel, C. et al.: *The probabilistic model checker Storm*, STTT (2022).*
