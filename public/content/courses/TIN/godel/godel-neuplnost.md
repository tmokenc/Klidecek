---
title: Gödelovy věty o neúplnosti
---

# Gödelovy věty o neúplnosti

Po zavedení **Gödelova číslování** ([[godelovo-cislovani]]) můžeme nyní vyslovit *centrální výsledky* matematické logiky 20. století — **Gödelovy věty o neúplnosti** (1931). První věta dokazuje, že *žádný dostatečně silný, bezesporný a efektivní formální systém nemůže být úplný*. Druhá věta dokazuje, že *takový systém nemůže dokázat ani svou vlastní bezespornost*.

## Pojmy: bezesporná, efektivní, úplná teorie

* **Bezesporná** (konzistentní): neexistuje formule $\varphi$ taková, že $T \vdash \varphi$ *a* $T \vdash \neg\varphi$.
* **Efektivní**: množina axiomů je rozhodnutelná (algoritmicky lze ověřit, zda formule je axiom).
* **(Syntakticky) úplná**: pro každou *větu* (uzavřenou formuli) $\varphi$ platí $T \vdash \varphi$ *nebo* $T \vdash \neg\varphi$.

> **Pozor**: *syntaktická úplnost* (z této kapitoly) ≠ *sémantická úplnost* (z [[vlastnosti-pl]]). PL *je* sémanticky úplná (Gödelova věta 1929), ale konkrétní teorie nad PL (např. PA) *není* syntakticky úplná (Gödelova 1. věta 1931).

## První Gödelova věta o neúplnosti

**Věta (Gödel, 1931).** *Žádná efektivní, bezesporná teorie predikátové logiky zahrnující Peanovu aritmetiku TPA nemůže být (syntakticky) úplná.*

Formálně: existuje *věta* $G$ (později nazvaná **Gödelova věta**) taková, že:

::: math
T \nvdash G \quad \text{a zároveň} \quad T \nvdash \neg G.
:::

Tedy $G$ je *nezávislá* od $T$ — $T$ ji nedokáže ani nevyvrátí. Přitom $G$ je *pravdivá* v $\mathbb{N}$ ($\mathbb{N} \models G$) — tj. *existuje pravdivá tvrzení o $\mathbb{N}$, kterou $T$ nedokáže*.

## Důsledky

* **PA, ZFC, Principia Mathematica** — všechny *dostatečně silné* axiomatické systémy aritmetiky jsou neúplné.
* **Aritmetika je nerozhodnutelná** — pro každé efektivní rozhodovací schéma existují pravdivé formule, které toto schéma neoznačí.
* *Hilbertův program* (důkaz konzistence matematiky pomocí konečné syntax) je nemožný.

## Strategie důkazu — sebereference

Důkaz je založen na *sebereferenci* — větě, která mluví o vlastní dokazatelnosti. Klasický paradox:

> *"Tato věta není dokazatelná."*

* Pokud je tato věta *dokazatelná*, pak je *pravdivá*, takže *není dokazatelná* — spor.
* Pokud je *nedokazatelná*, pak je *pravdivá* (přesně to říká) — máme pravdivou nedokazatelnou větu.

Závěr: *druhý případ* musí nastat, pokud je systém *bezesporný*. Tj. existuje pravdivá, ale nedokazatelná formule.

## Tarskiho věta o nedefinovatelnosti pravdy

Před Gödelovou větou zformulujeme *snadnější* příbuzný výsledek:

**Věta (Tarski, 1933).** *Dostatečně expresivní formální systém nemůže vyjádřit pravdivost svých vlastních vět.*

Tj. neexistuje aritmetická formule $T(x)$ taková, že $T(n)$ by znamenala "$n$ je Gödelovým číslem pravdivé věty".

**Důkaz** (přes diagonalizaci). Předpokládejme, že $T$ vyjadřuje "pravdivost".

* Z **G2** (negace zachovává vyjádřitelnost) je $\tilde{T}$ ("nepravdivost") také vyjádřitelná.
* Z **G1** (substituce zachovává vyjádřitelnost) je $\tilde{T}^* = \{n \mid G(E_n(n)) \in \tilde{T}\}$ vyjádřitelná.
* Nechť $Z$ je formule vyjadřující $\tilde{T}^*$, $z = G(Z)$. Pak $Z(n)$ říká "$E_n(n)$ není pravdivá".
* Pak $Z(z)$ říká *"Nejsem pravdivá"* — paradox.

Z definice $Z$:
$$
Z(z) \in T \iff z \in \tilde{T}^* \iff G(Z(z)) \in \tilde{T} \iff G(Z(z)) \notin T \iff Z(z) \notin T.
$$

Spor. Tedy $T$ není vyjádřitelná. ∎

> Tarski říká: **pravda v $\mathbb{N}$ není vyjádřitelná v PA**. To je v rozporu s naivním očekáváním, že formule PA *přesně* charakterizují pravdivost.

## Gödelova 1. věta — důkaz (kostra)

Místo "pravdivosti" pracujeme s **dokazatelností**: $P = \{G(e) \mid T \vdash e\}$ — množina Gödelových čísel formulí dokazatelných v $T$.

**Předpoklad G3.** $P$ je *vyjádřitelná* v $T$ — existuje formule $\mathrm{Proof}(n)$ taková, že $T \vdash e \iff \mathbb{N} \models \mathrm{Proof}(\bar{G(e)})$.

> G3 je *netriviální* — vyžaduje aritmetizaci celého dokazovacího procesu. Bylo to *jádro* Gödelovy práce.

**Konstrukce Gödelovy věty $G$.** Z **G1** a **G2** existuje formule $H$ vyjadřující $\tilde{P}^*$ — tj. $H(n)$ tvrdí, že $E_n(n)$ *není* dokazatelná. Položme $h = G(H)$.

Pak $H(h)$ je formule říkající *"$E_h(h)$ není dokazatelná"*. Ale $E_h = H$, takže $H(h)$ říká *"$H(h)$ není dokazatelná"*. Tj. je to **sebereferenční formule**.

::: svg "Gödelova konstrukce: formule H(h), která říká o sobě 'nejsem dokazatelná'"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.4">
    <rect x="40" y="20" width="220" height="50" rx="8"/>
    <rect x="280" y="20" width="220" height="50" rx="8"/>
    <rect x="160" y="100" width="220" height="50" rx="8"/>
  </g>
  <g fill="var(--accent)" text-anchor="middle" font-size="11">
    <text x="150" y="40">predikát H(n):</text>
    <text x="150" y="58">"E_n(n) nedokazatelná"</text>
    <text x="390" y="40">h = G(H)</text>
    <text x="390" y="58">(Gödelovo číslo H)</text>
    <text x="270" y="120">H(h)  —  diagonal</text>
    <text x="270" y="138">"H(h) nedokazatelná"</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none">
    <line x1="150" y1="70" x2="270" y2="100" marker-end="url(#aGodel)"/>
    <line x1="390" y1="70" x2="270" y2="100" marker-end="url(#aGodel)"/>
  </g>
  <defs>
    <marker id="aGodel" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <text x="270" y="180" text-anchor="middle" fill="var(--text-muted)" font-size="10.5">H(h) ⟺ H(h) není dokazatelná</text>
</svg>
:::

**Analýza:**

* **Pokud $T \vdash H(h)$**: Pak $H(h) \in P$. Ale $H(h)$ podle své definice tvrdí $H(h) \in \tilde{P}^*$, tj. *není* dokazatelná. **Spor s korektností $T$**.

* **Pokud $T \nvdash H(h)$**: Pak $H(h) \notin P$. Podle definice $H$ je $H(h)$ *pravdivá* (= "nejsem dokazatelná"). Tedy *máme pravdivou nedokazatelnou formuli*.

Druhý případ *musí nastat* (pokud je $T$ bezesporný a obsahuje PA — splňuje G1, G2, G3). Tedy $T$ není úplný. ∎

## Co bylo třeba dokázat technicky

Pro úplnost důkazu Gödel musel:

1. **Dokázat G1**: aritmetizovat substituci čísla do formule. Vyžaduje aritmetické vyjádření *délky* slova jako funkce jeho Gödelova čísla, *exponenciálu* $x^y$ v PA (pomocí násobení a sčítání), atd.
2. **Dokázat G3**: aritmetizovat celý dokazovací proces. Definovat predikát $D(m, n)$ "$m$ je Gödelovo číslo důkazu formule s číslem $n$". Pak $P(n) \equiv \exists m\, D(m, n)$.

Bod 2 je *jádro* Gödelovy práce — desítky technických lemmat o aritmetizaci.

## Druhá Gödelova věta

**Věta (Gödel, 1931).** *V žádném bezesporném a efektivním logickém systému zahrnujícím Peanovu aritmetiku není možné dokázat jeho vlastní bezespornost.*

Formálně: nechť $\mathrm{Cons}(T)$ je aritmetická formule vyjadřující "$T$ je bezesporný". Pak

::: math
T \nvdash \mathrm{Cons}(T).
:::

**Idea důkazu.** Lze ukázat, že $T$ dokazuje *implikaci*

::: math
\mathrm{Cons}(T) \to \neg P(G(G)),
:::

kde $G$ je Gödelova věta z 1. věty. Tj. "$T$ je bezesporný → Gödelova věta je nedokazatelná".

Pokud by $T \vdash \mathrm{Cons}(T)$, pak $T \vdash \neg P(G(G))$, což implikuje $T \vdash G$ (díky tomu, jak je $G$ konstruována). Ale to je spor s 1. větou ($G$ není dokazatelná v bezesporné teorii).

Tedy $\mathrm{Cons}(T)$ není dokazatelná v $T$.

## Co to znamená

* **Pro PA**: nemůžeme uvnitř PA dokázat, že PA je bezesporná. Pokud bychom *mohli*, PA by byla *paradoxně mocná*.
* **Pro ZFC**: nemůžeme v ZFC dokázat, že ZFC je bezesporná. Otevírá to otázku: *věříme, že ZFC je bezesporná*? Hypotézu nelze formálně potvrdit *uvnitř* systému.
* **Praktický důsledek**: matematika spočívá na *neformálních základech* — bezespornost ZFC je *hypotéza*, kterou nelze dokázat *uvnitř* ZFC.

## Hilbertův program

V 1920s navrhl **David Hilbert** *program* — dokázat *uvnitř finitistické matematiky*, že libovolná silná teorie (např. ZFC) je *bezesporná*. Pokud by to vyšlo, "matematika by stála na pevných základech".

**Gödelova 2. věta** Hilbertův program *zlomila* — žádná finitistická metoda nemůže dokázat bezespornost dostatečně bohaté teorie.

> *Hilbert prohrál*, ale jeho program byl neuvěřitelně plodný — vyvolal *celou teorii vyčíslitelnosti* a *modelové teorie*.

## Cumming back: Sebereferenční paradoxy

Stejnou strukturu jako Gödel mají i další paradoxy:

* **Lžovský paradox** ("Toto je lež") — *Eubulides*, 4. stol. př. n. l.
* **Russellův paradox** — množina všech množin, které nejsou prvkem sama sebe.
* **Berryho paradox** — "nejmenší přirozené číslo, které nelze popsat méně než dvaceti slovy" (popsáno 10 slovy).
* **Cantorova diagonalizace** — neexistuje bijekce $\mathbb{N} \to 2^\mathbb{N}$.
* **Problém zastavení** ([[problem-zastaveni]]) — TS, který přijme přesně ty TS, které nepřijmou sebe samé.

Všechny tyto sebereferenční konstrukce mají *společnou strukturu*: objekt "mluví o sobě skrz dvojí kódování".

::: svg "Sebereferenční paradoxy mají společnou strukturu"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="20" width="120" height="36" rx="6"/>
    <rect x="160" y="20" width="120" height="36" rx="6"/>
    <rect x="300" y="20" width="120" height="36" rx="6"/>
    <rect x="20" y="80" width="120" height="36" rx="6"/>
    <rect x="160" y="80" width="120" height="36" rx="6"/>
    <rect x="300" y="80" width="120" height="36" rx="6"/>
  </g>
  <g fill="var(--accent)" text-anchor="middle" font-size="11">
    <text x="80" y="42">Lhář</text>
    <text x="220" y="42">Russell</text>
    <text x="360" y="42">Cantor diag</text>
    <text x="80" y="102">HP (Turing)</text>
    <text x="220" y="102">Gödel 1</text>
    <text x="360" y="102">Tarski pravda</text>
  </g>
  <text x="270" y="150" text-anchor="middle" fill="var(--accent)" font-size="11">Společná struktura: A "říká o sobě" něco, co rozporuje samo sebe.</text>
  <text x="270" y="170" text-anchor="middle" fill="var(--text-muted)" font-size="10">Mocnost: kódování objektů jako prvky, na nichž lze operovat.</text>
</svg>
:::

## Souvislost s problémem zastavení

[[problem-zastaveni]] dokázal nerozhodnutelnost HP **diagonalizací**. Gödelova 1. věta je *strukturálně stejná* — *paradox sebereference* skrz kódování.

Spojení:

| Aspekt | HP | Gödelova věta |
| :--- | :--- | :--- |
| Objekty | TS | formule |
| Kódování | $\langle M\rangle$ | $G(\varphi)$ |
| Predikát | $w \in L(M)$ | $\varphi$ dokazatelná |
| Sebereferenční konstrukce | TS $N$ s "$N$ zastaví ⟺ vstup nezastaví na sobě" | formule $G$: "$G$ nedokazatelná" |
| Závěr | HP nerozhodnutelný | PA neúplná |

[[pa-nerozhodnutelnost]] uzavře tuto symetrii — *Peanova aritmetika je nerozhodnutelná*, což lze chápat jako zobecnění HP do logiky.

[[rozhodnutelne-teorie]] paradoxně ukáže *opačné* situace — teorie, které **jsou** rozhodnutelné (a tedy i úplné), např. Presburgerova aritmetika nebo teorie reálných čísel.

---

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Gödel, K.: *Über formal unentscheidbare Sätze der Principia Mathematica und verwandter Systeme I* (Monatshefte Math. Phys., 1931) — originální práce; Tarski, A.: *Der Wahrheitsbegriff in den formalisierten Sprachen* (Studia Philosophica, 1936); Smullyan, R.: *Gödel's Incompleteness Theorems* (Oxford, 1991); Hofstadter, D.: *Gödel, Escher, Bach* (Basic Books, 1979) — populární expozice.*
