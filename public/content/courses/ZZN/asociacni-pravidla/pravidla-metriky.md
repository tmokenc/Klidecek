---
title: "Asociační pravidla: podpora, spolehlivost, lift"
---

**Asociační pravidlo** má tvar `X → Y`, kde `X` (antecedent) a `Y` (konsekvent) jsou disjunktní množiny položek. Čte se "transakce, které obsahují `X`, mívají i `Y`". Cílem dolování je najít **silná pravidla** — taková, jejichž podpora i spolehlivost dosáhnou uživatelských prahů. Postup je dvoufázový: nejdřív najdi frekventované množiny (drahá fáze), pak z nich generuj pravidla podle minimální spolehlivosti.

**Podpora** pravidla je podíl transakcí obsahujících `X ∪ Y` (jak časté pravidlo je). **Spolehlivost** je podmíněná pravděpodobnost `Y` za podmínky `X` (jak je pravidlo spolehlivé). **Lift** porovnává spolehlivost s tím, co by dal čistě náhodný výskyt `Y` — měří sílu závislosti nad rámec frekvence samotného `Y`.

::: math
\mathrm{supp}(X{\Rightarrow}Y) = \mathrm{supp}(X\cup Y), \quad
\mathrm{conf}(X{\Rightarrow}Y) = \frac{\mathrm{supp}(X\cup Y)}{\mathrm{supp}(X)}, \quad
\mathrm{lift}(X{\Rightarrow}Y) = \frac{\mathrm{supp}(X\cup Y)}{\mathrm{supp}(X)\,\mathrm{supp}(Y)}
:::

Lift se interpretuje takto: `lift > 1` znamená pozitivní závislost (`X` a `Y` se vyskytují spolu častěji, než kdyby byly nezávislé), `lift = 1` nezávislost a `lift < 1` negativní závislost. Lift je proto opravou slepé skvrny spolehlivosti — vysoká spolehlivost u velmi častého `Y` (např. pečivo téměř v každém košíku) vůbec nemusí znamenat skutečnou souvislost.

::: viz zzn-rule-metrics "Vyber pravidlo nad malou DB; živě se spočítá support, confidence a lift. Posuvníky prahů ukazují, která pravidla projdou jako silná (zvýrazněná tlačítka)."
:::

Pozor na rozdíl spolehlivosti a liftu: pro pravidlo `A → B` nad ukázkovou databází je `conf(A→B) = supp(A,B)/supp(A) = 0,6 / 0,8 = 0,75`, ale `lift = 0,6 / (0,8 · 0,8) ≈ 0,94 < 1` — přestože tři čtvrtiny košíků s `A` obsahují i `B`, jde vlastně o mírně **negativní** závislost, protože `B` je samo o sobě velmi časté. Lift navíc není symetrický k záměně, ale je symetrický mezi `X → Y` a `Y → X` (čitatel i jmenovatel se nezmění), zatímco spolehlivost obecně symetrická není.

::: quiz "Pravidlo má vysokou spolehlivost 0,9, ale lift jen 0,8. Co to znamená?"
- [x] Konsekvent je sám o sobě velmi častý; pravidlo nepřináší nad náhodu nic navíc (negativní závislost)
  > lift < 1 znamená, že X a Y se objevují spolu méně, než by odpovídalo nezávislosti — vysoká spolehlivost je daná jen tím, že Y je samo o sobě časté.
- [ ] Pravidlo je velmi silná pozitivní závislost
  > Silnou pozitivní závislost by indikoval lift výrazně nad 1, nikoli pod 1.
- [ ] Je to nemožná kombinace hodnot
  > Naopak je to typický případ, který právě motivuje použití liftu vedle spolehlivosti.
:::

::: link "Association rule learning — support, confidence, lift (definice a vzorce)" "https://en.wikipedia.org/wiki/Association_rule_learning"
:::

*Zdroj: ZZN státnicové okruhy NBIO, VUT FIT. Externí reference: Wikipedia — Association rule learning, Agrawal & Srikant 1994 (Apriori, VLDB).*
