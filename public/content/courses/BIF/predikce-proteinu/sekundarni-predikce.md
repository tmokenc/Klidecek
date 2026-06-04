---
title: Predikce sekundární struktury
---

**Predikce sekundární struktury** přiřazuje každé pozici v sekvenci jeden ze **tří stavů** — **H** (helix), **E/S** (β-vlákno, β-strand) a **C** (smyčka / coil). Je to jednodušší úloha než predikce celého 3D tvaru a často slouží jako **mezikrok** k němu. Kvalita se měří skóre **Q3** = podíl správně klasifikovaných pozic ze všech tří stavů.

Klíčová myšlenka: jednotlivé aminokyseliny mají různou **propensitu (sklon)** vyskytovat se v určitém motivu. Např. **Glu, Ala, Leu, Met** preferují helix, kdežto **Val, Ile, Tyr** β-list a **Gly, Pro** strukturu spíše „lámou" (často ve smyčkách).

## Chou-Fasman a GOR

První generace metod byla **statistická**, postavená na propensitách spočítaných z databáze známých struktur:

- **Chou-Fasman** (1974) — bere v úvahu **jen** propensitu každé aminokyseliny zvlášť. Najde **nukleační** úsek s vysokým sklonem k helixu/listu a ten rozšiřuje, dokud klouzavé okno neklesne pod práh. Pracuje tedy na úrovni jednotlivého rezidua.
- **GOR** (Garnier-Osguthorpe-Robson) — vychází z **teorie informace** a navíc bere v potaz **kontext sousedů** v okně (typicky ±8 reziduí): pravděpodobnost stavu pozice závisí i na okolních aminokyselinách, ne jen na té centrální.

Společný princip ukazuje viz: **klouzavé okno** sčítá propensity reziduí a klasifikuje **prostřední** pozici. Širší okno dává hladší predikci, ale rozmazává krátké motivy.

::: math
\text{score}(s) = \frac{1}{|W|}\sum_{i \in W} P_s(a_i), \qquad
\hat{s} = \arg\max_{s \in \{H,E,C\}} \text{score}(s)
:::

::: viz bif-secondary-struct "Klouzavé okno klasifikuje každou pozici sekvence na helix / β-list / smyčku ze zjednodušených Chou-Fasman propensit. Posuvník mění šířku okna: užší okno reaguje na lokální motivy, širší dává hladší a méně roztříštěnou predikci."
:::

## Neuronové prediktory: PSIPRED

Statistické metody dosahovaly přesnosti **Q3 jen kolem 60-65 %**. Skok přineslo použití **evoluční informace** a **strojového učení**. **PSIPRED** (1999) je dvoustupňová **neuronová síť**, jejímž vstupem není holá sekvence, ale **profil z PSI-BLAST** (pozičně-specifická skórovací matice, PSSM). Profil zachycuje, jak je daná pozice **konzervovaná** napříč příbuznými sekvencemi — a konzervace silně koreluje se strukturní rolí. PSIPRED tím dosahuje **Q3 kolem 80 %**.

Tento princip — *vstupem je evoluční profil, ne jediná sekvence* — je společný moderním prediktorům a stejnou myšlenku (mnohonásobné zarovnání jako vstup) později dovedl na vrchol i AlphaFold pro celý 3D tvar.

::: quiz "Proč PSIPRED dosahuje výrazně vyšší přesnosti (~80 % Q3) než klasický Chou-Fasman (~60 %)?"
- [x] Vstupem není holá sekvence, ale evoluční profil (PSSM) z PSI-BLAST
  > Profil zachycuje konzervaci pozic napříč příbuznými sekvencemi, což silně koreluje se strukturou.
- [x] Používá učící se neuronovou síť místo pevných propensit
  > Síť se naučí složitější závislosti, než dovolí pevně daná tabulka propensit.
- [ ] Predikuje rovnou celý 3D tvar místo tří stavů
  > PSIPRED stále řeší třístavovou sekundární strukturu, ne terciární fold.
- [ ] Nepotřebuje žádnou databázi známých struktur
  > Naopak — síť se trénuje na databázi známých struktur, jen lépe využívá vstupní informaci.
:::

::: link "Jones (1999), J. Mol. Biol. — PSIPRED: prediction based on PSSM" "https://doi.org/10.1006/jmbi.1999.3091"
:::

::: link "Chou-Fasman method — Wikipedia (propensity, nukleace, rozšiřování)" "https://en.wikipedia.org/wiki/Chou%E2%80%93Fasman_method"
:::

*Zdroj: BIF státnicové okruhy NBIO, VUT FIT. Externí reference: Chou & Fasman (1974); Garnier, Osguthorpe & Robson (1978) — GOR; Jones (1999) J. Mol. Biol. 292:195 — PSIPRED.*
