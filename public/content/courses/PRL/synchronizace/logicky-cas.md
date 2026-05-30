---
title: Logické hodiny — Lamport a vektorové hodiny
---

# Logické hodiny

Předchozí kapitola ([[fyzicky-cas]]) ukázala, že **synchronizace fyzického času** je nepřesná a vždy *aproximativní*. Pro mnoho distribuovaných algoritmů ale *fyzický* čas vlastně nepotřebujeme — stačí nám **kauzální uspořádání** událostí (kdo se stal před kým). **Logické hodiny** poskytují *přesné kauzální uspořádání* bez závislosti na fyzickém čase. Tato kapitola probírá **Lamportovy hodiny** (1978) — fundamentální skalární verzi — a **vektorové hodiny** (Mattern, Fidge 1988) — silnější variantu, která zachycuje *přesný* kauzální vztah.

## Happens-before relace

**Leslie Lamport** (1978) definoval **happens-before** relaci $\to$ na událostech v distribuovaném systému:

::: math
\begin{aligned}
&\text{1. Pokud } a \text{ a } b \text{ jsou ve *stejném* procesu a } a \text{ proběhlo *před* } b, \text{ pak } a \to b. \\
&\text{2. Pokud } a = \text{send}(m) \text{ a } b = \text{receive}(m), \text{ pak } a \to b. \\
&\text{3. Tranzitivita: pokud } a \to b \text{ a } b \to c, \text{ pak } a \to c.
\end{aligned}
:::

**Pokud $a \not\to b$ a $b \not\to a$**, pak $a$ a $b$ jsou **současné** ($a \parallel b$) — nejsou v kauzálním vztahu, mohly proběhnout *paralelně*.

::: svg "Happens-before vztah mezi událostmi v distribuovaném systému"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--text-faint)" stroke-width="0.8">
    <line x1="50" y1="40" x2="490" y2="40"/>
    <line x1="50" y1="100" x2="490" y2="100"/>
    <line x1="50" y1="160" x2="490" y2="160"/>
  </g>
  <text x="30" y="44" fill="var(--text-muted)">p1</text>
  <text x="30" y="104" fill="var(--text-muted)">p2</text>
  <text x="30" y="164" fill="var(--text-muted)">p3</text>
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <circle cx="100" cy="40" r="6"/>
    <circle cx="200" cy="40" r="6"/>
    <circle cx="320" cy="40" r="6"/>
    <circle cx="430" cy="40" r="6"/>
    <circle cx="150" cy="100" r="6"/>
    <circle cx="280" cy="100" r="6"/>
    <circle cx="380" cy="100" r="6"/>
    <circle cx="180" cy="160" r="6"/>
    <circle cx="350" cy="160" r="6"/>
    <circle cx="450" cy="160" r="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="9">
    <text x="100" y="32">a</text>
    <text x="200" y="32">b</text>
    <text x="320" y="32">c</text>
    <text x="430" y="32">d</text>
    <text x="150" y="92">e</text>
    <text x="280" y="92">f</text>
    <text x="380" y="92">g</text>
    <text x="180" y="180">h</text>
    <text x="350" y="180">i</text>
    <text x="450" y="180">j</text>
  </g>
  <g stroke="var(--accent)" stroke-width="0.9" fill="none" marker-end="url(#hba)">
    <line x1="200" y1="46" x2="150" y2="94"/>
    <line x1="280" y1="106" x2="320" y2="46"/>
    <line x1="150" y1="106" x2="180" y2="154"/>
  </g>
  <defs>
    <marker id="hba" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="var(--accent)"/>
    </marker>
  </defs>
  <text x="270" y="195" fill="var(--text-muted)" text-anchor="middle" font-size="10">a → b (process), b → e (send/receive), e → c, e → h, c → d</text>
  <text x="270" y="20" fill="var(--accent)" text-anchor="middle" font-size="10">g a c jsou paralelní — žádný kauzální vztah</text>
</svg>
:::

## Lamportovy logické hodiny

**Lamportovy hodiny** přiřazují každé události *logický čas* (celé číslo) takový, že:

::: math
a \to b \implies C(a) < C(b)
:::

(*Implikace*, ne *ekvivalence* — opačně neplatí.)

### Implementace

Každý proces $i$ má lokální čítač $C_i$ inicializován na 0.

**Pravidlo 1** (interní událost): před každou událostí $e$ proces zvýší svůj čítač:

::: math
C_i \leftarrow C_i + 1
:::

**Pravidlo 2** (odeslání zprávy): pošli *časové razítko* spolu se zprávou:

::: math
\text{send}(m, t_p) \text{ kde } t_p = C_i
:::

**Pravidlo 3** (přijetí zprávy): při příjmu nastav čítač:

::: math
C_i \leftarrow \max(C_i + 1,\ t_p + 1)
:::

(Vždy o 1 *vyšší* než *pozdější* z lokálního a přijatého času.)

### Příklad

::: svg "Lamportovy hodiny — místní čítače rostou + max při příjmu zprávy"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--text-faint)" stroke-width="0.8">
    <line x1="50" y1="60" x2="490" y2="60"/>
    <line x1="50" y1="140" x2="490" y2="140"/>
  </g>
  <text x="30" y="64" fill="var(--text-muted)">p1</text>
  <text x="30" y="144" fill="var(--text-muted)">p2</text>
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <circle cx="100" cy="60" r="6"/>
    <circle cx="180" cy="60" r="6"/>
    <circle cx="260" cy="60" r="6"/>
    <circle cx="340" cy="60" r="6"/>
    <circle cx="420" cy="60" r="6"/>
    <circle cx="120" cy="140" r="6"/>
    <circle cx="220" cy="140" r="6"/>
    <circle cx="320" cy="140" r="6"/>
    <circle cx="400" cy="140" r="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10" font-weight="600">
    <text x="100" y="48">1</text>
    <text x="180" y="48">2</text>
    <text x="260" y="48">3</text>
    <text x="340" y="48">4</text>
    <text x="420" y="48">5</text>
    <text x="120" y="158">1</text>
    <text x="220" y="158">2</text>
    <text x="320" y="158">3</text>
    <text x="400" y="158">5</text>
  </g>
  <g stroke="var(--accent)" stroke-width="0.9" fill="none" marker-end="url(#lcarr)">
    <line x1="340" y1="66" x2="400" y2="134"/>
  </g>
  <defs>
    <marker id="lcarr" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="var(--accent)"/>
    </marker>
  </defs>
  <text x="370" y="100" fill="var(--accent)" text-anchor="middle" font-size="10">send(m, t=4)</text>
  <text x="400" y="180" fill="var(--accent)" text-anchor="middle" font-size="10">max(3, 4) + 1 = 5</text>
</svg>
:::

Vidíme, že p2 při příjmu zprávy nastavil svůj čítač na 5 — což odráží *kauzální* návaznost.

### Vlastnosti

- Logický čas *monotónně roste* v každém procesu.
- Pokud $a \to b$, pak $C(a) < C(b)$ — **kauzalita respektována**.
- *Implikace neplatí opačně* — pokud $C(a) < C(b)$, není garantováno $a \to b$. Mohou být *paralelní*.

### Úplné uspořádání

Happens-before je **parciální** uspořádání. Pro **úplné** uspořádání rozšíříme čas o **ID procesu**:

::: math
C^+(a) = (C(a),\ \text{ID}(\text{process of } a))
:::

S lexikografickým uspořádáním. Pak *všechny* události jsou *uspořádány*. Toto se používá například v *Lamportově algoritmu vzájemného vyloučení* (viz [[vzajemne-vylouceni]]).

## Vektorové hodiny

Lamportovy hodiny mají *slabou stránku*: $C(a) < C(b)$ *neimplikuje* $a \to b$. Tj. nemůžeme z časových razítek odvodit, zda jsou události *kauzálně závislé*.

**Vektorové hodiny** (Mattern, Fidge 1988) tento problém řeší:

::: math
a \to b \iff V(a) < V(b)
:::

(Plná ekvivalence — vektory přesně zachycují kauzalitu.)

### Implementace

Každý proces $i$ má **vektor** $V_i$ délky $n$ (počet procesů), inicializován na $[0, 0, \dots, 0]$.

**Pravidlo 1** (interní událost): zvýší *svou* složku:

::: math
V_i[i] \leftarrow V_i[i] + 1
:::

**Pravidlo 2** (odeslání zprávy): pošle *celý vektor* s zprávou:

::: math
\text{send}(m, V_i)
:::

**Pravidlo 3** (přijetí zprávy): nastav každou složku na max + zvýší svou:

::: math
\forall k: V_i[k] \leftarrow \max(V_i[k],\ V_p[k]) \\
V_i[i] \leftarrow V_i[i] + 1
:::

### Porovnání vektorů

Dva vektory $V$ a $W$:

- $V \le W$: pro všechna $k$, $V[k] \le W[k]$.
- $V < W$: $V \le W$ *a* existuje $k$, kdy $V[k] < W[k]$.
- $V \parallel W$ (paralelní): ani $V \le W$ ani $W \le V$.

**Klíčová vlastnost**: $a \to b \iff V(a) < V(b)$. Pokud $V(a) \parallel V(b)$, pak $a$ a $b$ jsou *paralelní*.

### Příklad

::: svg "Vektorové hodiny — kompletně zachycují kauzalitu"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--text-faint)" stroke-width="0.8">
    <line x1="50" y1="60" x2="490" y2="60"/>
    <line x1="50" y1="140" x2="490" y2="140"/>
  </g>
  <text x="30" y="64" fill="var(--text-muted)">p1</text>
  <text x="30" y="144" fill="var(--text-muted)">p2</text>
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <circle cx="100" cy="60" r="6"/>
    <circle cx="220" cy="60" r="6"/>
    <circle cx="380" cy="60" r="6"/>
    <circle cx="150" cy="140" r="6"/>
    <circle cx="310" cy="140" r="6"/>
    <circle cx="440" cy="140" r="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="9" font-weight="600">
    <text x="100" y="48">(1,0)</text>
    <text x="220" y="48">(2,0)</text>
    <text x="380" y="48">(3,1)</text>
    <text x="150" y="158">(0,1)</text>
    <text x="310" y="158">(2,2)</text>
    <text x="440" y="158">(3,3)</text>
  </g>
  <g stroke="var(--accent)" stroke-width="0.9" fill="none" marker-end="url(#vca)">
    <line x1="220" y1="66" x2="310" y2="134"/>
    <line x1="310" y1="134" x2="380" y2="66"/>
  </g>
  <defs>
    <marker id="vca" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

Po obdržení zprávy od p1 v stavu (2,0): p2 nastaví na $(\max(0,2), \max(1,0)) = (2,1)$ a zvýší svou $\to (2,2)$.

### Příklad porovnání

Jsou tyto události paralelní nebo v kauzálním vztahu?

- $V(a) = (2, 1, 0)$ a $V(b) = (3, 2, 1)$: $V(a) < V(b)$, tedy $a \to b$.
- $V(a) = (2, 1, 0)$ a $V(c) = (1, 3, 0)$: ani $\le$ ani $\ge$, tedy $a \parallel c$.

## Použití vektorových hodin

- **Distribuované databáze** — verzi vector (Riak, DynamoDB) pro detekci konfliktních updateů.
- **Causal broadcast** — broadcast zachovávající kauzální uspořádání.
- **Conflict-free replicated data types (CRDTs)** — synchronizace replik bez koordinace.
- **Debugging distribuovaných aplikací** — sledování *kauzálních* závislostí mezi událostmi.

## Limity vektorových hodin

- **Velikost vektoru = $n$** (počet procesů). V *velkých* systémech může být problematické.
- **Optimalizace**: *matrix clocks* (sledování, co kdo o kom ví) — ještě silnější, ale ještě větší.
- **Plausible clocks** — heuristické aproximace s menší přesností.

## Lamport vs Vektorové — kdy co použít

| Kritérium | Lamport | Vektorové |
| :--- | :---: | :---: |
| Velikost razítka | $O(\log T)$ | $O(n \log T)$ |
| Kauzální shoda | jen $\Rightarrow$ | plně $\iff$ |
| Detekce paralelnosti | ne | ano |
| Použití | mutex, broadcast | CRDT, debugging |

**Lamport** stačí pro *uspořádání*. **Vektor** je nutný pro *detekci paralelnosti*.

## Co dál

[[volba-master]] probere algoritmy pro **volbu hlavního uzlu** (leader election) — *fundamentální* stavební blok pro distribuovaný konsensus. Klasické: **Chang-Roberts** (jednoduchý, O(n²)), **Hirschberg-Sinclair** (O(n log n) na kruhu). [[vzajemne-vylouceni]] potom probere algoritmy pro **distribuovanou mutex** — *Lamportův* algoritmus (postavený přímo na logických hodinách!), Ricart-Agrawala, Maekawa, Raymond.

---

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Lamport, L.: „Time, clocks, and the ordering of events in a distributed system" (CACM 21(7), 1978, [DOI 10.1145/359545.359563](https://doi.org/10.1145/359545.359563)) — *historický* článek; Mattern, F.: „Virtual time and global states of distributed systems" (Workshop on Parallel and Distributed Algorithms 1988); Fidge, C.J.: „Timestamps in message-passing systems that preserve the partial ordering" (Australian Computer Science Conference 1988); Schwarz, R., Mattern, F.: „Detecting causal relationships in distributed computations: In search of the holy grail" (Distributed Computing 7(3), 1994, [DOI 10.1007/BF02277859](https://doi.org/10.1007/BF02277859)); Coulouris et al.: *Distributed Systems* (5. vyd. 2011), kap. 14.4–14.5.*
