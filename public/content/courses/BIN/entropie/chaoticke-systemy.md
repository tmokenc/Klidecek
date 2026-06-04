---
title: Chaotické systémy
---

# Chaotické systémy

**Chaos** je chování *deterministického* dynamického systému, které **není dlouhodobě předvídatelné** kvůli extrémní citlivosti na počáteční podmínky. Systém se řídí přesnými pravidly (žádná náhoda), a přesto se chová „jako náhodný" — to je klíčový paradox chaosu.

## Podstata chaosu

Zvolíme-li dva *nekonečně blízké* počáteční body, jejich trajektorie se v čase **exponenciálně vzdalují**. Drobná nepřesnost v počáteční hodnotě (a změřit ji lze vždy jen konečně přesně) proto po čase zcela znehodnotí předpověď. Lidově *motýlí efekt* (*butterfly effect*) — mávnutí motýlích křídel může teoreticky ovlivnit počasí na druhém konci světa. Typickým příkladem jsou modely počasí.

I když je signál nepředvídatelný, *informačně* je velmi bohatý: jeho [[entropie-informace|Shannonova entropie]] se blíží maximu, takže klasickou kompresí ho nezkrátíme. Algoritmicky je ale jednoduchý — generuje ho krátké deterministické pravidlo.

## Atraktory

**Atraktor** je množina stavů ve *fázovém prostoru*, do nichž systém dlouhodobě směřuje poté, co odezní přechodový děj od inicializace.

* **Pevný bod** — systém se ustálí v konstantním stavu (tlumené kyvadlo skončí v klidu).
* **Periodický / kvaziperiodický** — systém osciluje v uzavřeném cyklu mezi několika stavy (netlumené ideální kyvadlo opisuje elipsu).
* **Podivný (strange) / chaotický atraktor** — složitá (fraktální) geometrická struktura. Trajektorie po něm bloudí, **nikdy se neprotne ani neopakuje**, a přesto zůstává v ohraničené oblasti. Každý chaotický atraktor je podivný; obráceně to neplatí.

## Bifurkace a cesta k chaosu

**Bifurkace** (rozdvojení) je *kvalitativní* skoková změna chování systému, vyvolaná jen *nepatrnou* změnou vstupního parametru. Když na sebe bifurkace začnou navazovat — typicky **zdvojováním periody** (perioda 1 → 2 → 4 → 8 → …) — cyklus se zkracuje, až systém přejde do chaosu.

**Bifurkační diagram** to zachycuje: na vodorovné ose je vstupní parametr, na svislé ose hodnoty stavu, kterých systém po ustálení nabývá. Z jedné větve se postupně stávají dvě, čtyři, … až houstnoucí „mlha" bodů = chaos.

## Příklad — logistická rovnice

Nelineární dynamický systém *bez analytického řešení*, popisující vývoj normované populace `0 ≤ x ≤ 1` v diskrétních generacích `k`:

::: math
x(k+1) = r \cdot x(k) \cdot \bigl(1 - x(k)\bigr)
:::

Chování kriticky závisí na parametru růstu `r`:

* `r < 3` → **pevný bod** (perioda 1): populace se ustálí v jediné hodnotě.
* `r ≈ 3` → **perioda 2**: hodnota překmitává mezi dvěma stavy.
* `r ≈ 3,449` → **perioda 4** (další bifurkace).
* `r ≈ 3,56995` → **nástup chaosu** na konci kaskády zdvojování period; `x(k)` se chová jako šum.

Intervaly mezi po sobě jdoucími bifurkacemi se zkracují v *univerzálním* poměru — **Feigenbaumově konstantě** `δ ≈ 4,6692`, která platí pro celou třídu map s jedním kvadratickým maximem (nezávisí na konkrétním tvaru funkce).

::: viz bin-logistic-map "Bifurkační diagram logistické mapy x_{n+1} = r·x·(1−x). Posuvník r od 2,5 do 4 zvýrazní atraktor pro dané r — sleduj zdvojování period a přechod do chaosu kolem r ≈ 3,57."
:::

::: quiz "Čím je dán chaotický (nikoli náhodný) charakter logistické rovnice při r ≈ 4?"
- [ ] Do rovnice se přidává náhodný šum.
- [x] Je deterministická, ale extrémně citlivá na počáteční podmínku x(0).
- [ ] Nemá žádné pravidlo přechodu mezi generacemi.
- [ ] Konverguje k jednomu pevnému bodu.
> Logistická rovnice je čistě deterministická; nepředvídatelnost plyne z exponenciálního rozbíhání blízkých trajektorií, nikoli z náhody.
:::

::: link "Logistic map — Wikipedia" "https://en.wikipedia.org/wiki/Logistic_map"
:::

::: link "Feigenbaum constants — Wikipedia" "https://en.wikipedia.org/wiki/Feigenbaum_constants"
:::

*Zdroj: BIN státnicové okruhy NBIO, VUT FIT. Externí reference: May, R. M.: Simple mathematical models with very complicated dynamics (Nature, 1976); Feigenbaum, M. J.: Quantitative universality for a class of nonlinear transformations (1978); Wikipedia — Logistic map, Feigenbaum constants, Attractor.*
