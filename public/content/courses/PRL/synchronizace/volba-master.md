---
title: Volba master uzlu — Chang-Roberts a Hirschberg-Sinclair
---

# Volba hlavního uzlu (leader election)

Mnoho distribuovaných algoritmů vyžaduje **vůdce** (leader, master) — uzel s *unikátní* rolí: koordinuje, rozhoduje, kandiduje na zdroje. **Volba leadera** je *fundamentální* problém: jak ze stejně schopných uzlů *spravedlivě* a *deterministicky* vybrat jednoho? Tato kapitola probírá dva klasické algoritmy pro **kruhovou** topologii: **Chang-Roberts** (jednoduchý, $O(n^2)$ zpráv) a **Hirschberg-Sinclair** ($O(n \log n)$).

## Předpoklady

- Procesy jsou **korektní** (nikdy neselžou).
- Každý proces má **unikátní ID** (UID).
- Topologie je *kruh* (typicky obousměrný).
- Algoritmus hledá proces s **maximálním** (nebo minimálním) UID.

## Chang-Roberts algoritmus (1979)

### Princip

- Procesy posílají zprávy *pouze jedním směrem* (např. po směru hodinových ručiček).
- Každý proces si může označit za *účastníka* (participant) nebo *neúčastníka*.
- **Pravidlo**:
  - Uzel iniciující volbu se označí za účastníka a pošle svůj UID dál.
  - Při přijetí zprávy s UID $u$:
    - Pokud $u > \text{mé UID}$ → přepošlu jak je.
    - Pokud $u < \text{mé UID}$:
      - Jsem-li *účastník*: zahodím (kolize).
      - Nejsem-li účastník: nahradím UID svým a pošlu dál, označím se za účastníka.
    - Pokud $u = \text{mé UID}$ → vyhrál jsem volbu. Spustím *druhou fázi* (oznámení).

### Druhá fáze (oznámení vítěze)

- Vítěz se *odznačí* a pošle svůj UID dál.
- Každý uzel, který zprávu přijme, si UID *poznačí*, *odznačí* se, a přepošle.
- Vítěz zprávu po kompletním kruhu zahodí.

### Příklad {tier=example}

Pro kruh 5 uzlů s UID $\{2, 3, 5, 1, 4\}$:

```
Uzel 1 (UID=2) iniciuje volbu, pošle 2 → uzlu 2
  Uzel 2 (UID=3) má 3 > 2: nahradí, pošle 3 → uzlu 3, označí se
    Uzel 3 (UID=5) má 5 > 3: nahradí, pošle 5 → uzlu 4
      Uzel 4 (UID=1) má 1 < 5: přepošle 5 → uzlu 5
        Uzel 5 (UID=4) má 4 < 5: přepošle 5 → uzlu 1
          Uzel 1 přepošle 5 → uzlu 2 → ... → uzlu 3
            Uzel 3 vidí UID = 5 (= sebe) → vyhrává.
```

::: svg "Chang-Roberts — zpráva s UID se posílá v kruhu, maximum vyhrává"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <circle cx="270" cy="40" r="18"/>
    <circle cx="380" cy="100" r="18"/>
    <circle cx="335" cy="170" r="18"/>
    <circle cx="205" cy="170" r="18"/>
    <circle cx="160" cy="100" r="18"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="270" y="44">2</text>
    <text x="380" y="104">3</text>
    <text x="335" y="174">5</text>
    <text x="205" y="174">1</text>
    <text x="160" y="104">4</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#cra)">
    <path d="M 287,46 Q 350,60 367,90"/>
    <path d="M 382,118 Q 390,150 351,165"/>
    <path d="M 319,176 Q 270,190 221,176"/>
    <path d="M 189,165 Q 160,150 162,118"/>
    <path d="M 165,90 Q 180,60 253,46"/>
  </g>
  <defs>
    <marker id="cra" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="var(--accent)"/>
    </marker>
  </defs>
  <text x="270" y="110" fill="var(--accent)" text-anchor="middle" font-size="10">Zpráva (5) putuje kruhem</text>
  <text x="270" y="125" fill="var(--text-muted)" text-anchor="middle" font-size="9">— maximum vyhrává, zpráva se vrátí</text>
</svg>
:::

### Analýza

**Nejlepší případ**: volbu zahájí *jen* uzel s nejvyšším UID. Po kruhu se zpráva vrátí v $n$ krocích, druhá fáze v dalších $n$. Celkem **$2n$ zpráv**.

**Nejhorší případ**: uzel s maximálním UID je *hned za* iniciátorem. Iniciátor pošle své menší UID, druhý ho přepíše svým, atd. *Každý* uzel zahájí volbu před tím, než dostane vyšší.

- Nejhorší počet zpráv: $\Theta(n^2)$ — všichni iniciátoři vytvoří zprávy.
- Konkrétně: $n + (n-1) + \dots + 1 = n(n-1)/2 + n$ zpráv jen pro fázi 1.

Plus $n$ zpráv pro fázi 2 (oznámení vítěze).

**Celkem**: $O(n^2)$ zpráv v worst case.

## Hirschberg-Sinclair algoritmus (1980)

### Idea

Místo *jednosměrného* posílání zpráv kruhem Hirschberg-Sinclair posílá *obousměrně*, ale jen *do exponenciálně rostoucí vzdálenosti*. Tím dosahuje **$O(n \log n)$** zpráv.

### Princip

Každý uzel periodicky *kandiduje* — pošle zprávu `ELECTION(UID, round, distance)` *oběma směry* na vzdálenost $2^r$ (v kole $r$). Sousedé:

- **Pokud přijatý UID > vlastní UID**: zahodí.
- **Pokud UID = vlastní**: pošle `ELECTED(UID)` levému sousedovi (vyhrávám).
- **Pokud UID < vlastní, distance < $2^r$**: přepošle `ELECTION` dál se zvýšenou `distance`.
- **Pokud UID < vlastní, distance ≥ $2^r$**: pošle zpět `REPLY(UID, r)` (vrať odpověď).

Když uzel *obdrží `REPLY` z obou směrů*, znamená to, že je *vítězem* na okolí vzdálenosti $2^r$ → zvedne kolo na $r+1$ a pokračuje na vzdálenost $2^{r+1}$.

### Algoritmus

```
Všechny uzly začínají ELECTION(UID, 0, 1) oběma směry.

Při přijetí ELECTION(UID, r, d) procesem i s UID_i:
  if UID < UID_i then drop
  elseif UID = UID_i then send ELECTED(UID) levému sousedovi
  elseif d < 2^r: forward ELECTION(UID, r, d+1) po směru zprávy
  elseif d >= 2^r: send REPLY(UID, r) zpět odkud přišla

Při přijetí REPLY(UID, r):
  if UID ≠ UID_i then forward REPLY(UID, r) po směru zprávy
  elseif uzel obdržel REPLY z obou směrů:
    send ELECTION(UID, r+1, 1) oběma směry

Při přijetí ELECTED(UID):
  if UID ≠ UID_i then poznač UID a přepošli ELECTED(UID)
```

### Analýza

V každém *kole* $r$:

- Aktivní uzly posílají na vzdálenost $2^r$ a *zpět* — $4 \cdot 2^r$ zpráv na uzel.
- *Vyřazení* uzly: aspoň polovina aktivních uzlů (pro vyrovnaný case).

Po $\log_2 n$ kol zbude *jediný* uzel = vítěz.

**Počet zpráv**:

- V kole $r$: $\le 8n$ zpráv (každý uzel může poslat $4 \cdot 2^r$ zpráv, ale aktivních je $n/2^r$).
- Suma přes $\log n$ kol: $O(n \log n)$.

Plus $n$ zpráv pro `ELECTED` oznámení.

**Celkem**: $O(n \log n)$ zpráv — **lepší** než Chang-Roberts pro velký $n$.

::: viz volba-master "Vyber best-case nebo worst-case scénář a iniciátora. Krokuj a počítej zprávy — uvidíš proč nejhorší případ je O(n²): když je maximum těsně před iniciátorem, každý uzel pošle vlastní volbu."
:::

### Porovnání

| Algoritmus | Topologie | Best case | Worst case | Komentář |
| :--- | :--- | :---: | :---: | :--- |
| Chang-Roberts | jednosměrný kruh | $O(n)$ | $O(n^2)$ | jednoduchý |
| Hirschberg-Sinclair | obousměrný kruh | $O(n \log n)$ | $O(n \log n)$ | efektivnější |

Pro **velký** $n$ je Hirschberg-Sinclair *asymptoticky lepší* — Chang-Roberts ale v *průměru* běží rychle, pokud je iniciátor "blízko" maximu.

## Jiné algoritmy volby

- **Bully algorithm** (Garcia-Molina 1982): pro obecnou topologii (ne kruh). Když uzel zjistí, že leader neodpovídá, vyhlásí *bully election* — pošle zprávu *všem uzlům s vyšším UID*. Pokud žádný neodpoví, vyhrává sám.
- **Leader-election ve stromech**: variant pro stromové topologie, $O(n)$ zpráv.
- **Randomizované volby**: pro situace, kdy nejsou unikátní UIDs (každý uzel hodí kostkou, pak nejvyšší výsledek). *Nedeterministické*.

## Použití v praxi {tier=practice}

- **ZooKeeper** (Apache) — implementuje *Zab* protokol, který obsahuje variant leader election.
- **Raft consensus** ([[raft-praxe]]) — leader election je první fáze Raft konsensu.
- **Etcd, Consul** — distribuované konfigurační stores. Leader = master pro zápisy.
- **Cassandra** — *gossip* protokol pro výběr coordinatoru každé operace.

## Robustnost

Naše analýza předpokládá *korektní* procesy (žádné selhání). V realitě:

- **Crash failures**: pokud leader selže, je nutné spustit *novou volbu*.
- **Network partitions**: část sítě se odřízne — vznikne *více* leadrů (split-brain)? Konsensus algoritmy (Paxos, Raft) tomuto problému zabraňují přes *quora*.
- **Byzantine failures**: leader může lhát — vyžaduje *Byzantine-fault-tolerant* protokoly (PBFT, HotStuff).

Pro skutečné distribuované systémy je leader election *jeden* z mnoha komponent — *vlastní* algoritmy konsensu (Topic 9) obvykle zahrnují *jakousi* variantu volby.

## Co dál

[[vzajemne-vylouceni]] probere **distribuované vzájemné vyloučení** (mutex) — algoritmy pro zaručení, že jen jeden uzel je v *kritické sekci* (chrání sdílený zdroj). Klasické: **Lamportův algoritmus** (postaven na logických hodinách z [[logicky-cas]]), **Ricart-Agrawala** (optimalizace), **Maekawa** (quorum-based), **Raymond** (token-based stromový).

---

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Chang, E., Roberts, R.: „An improved algorithm for decentralized extrema-finding in circular configurations of processes" (CACM 22(5), 1979, [DOI 10.1145/359104.359108](https://doi.org/10.1145/359104.359108)); Hirschberg, D.S., Sinclair, J.B.: „Decentralized extrema-finding in circular configurations of processors" (CACM 23(11), 1980, [DOI 10.1145/359024.359029](https://doi.org/10.1145/359024.359029)); Garcia-Molina, H.: „Elections in a distributed computing system" (IEEE Trans. Computers C-31(1), 1982, [DOI 10.1109/TC.1982.1675885](https://doi.org/10.1109/TC.1982.1675885)) — Bully algorithm; Lynch, N.A.: *Distributed Algorithms* (Morgan Kaufmann 1996), kap. 3; Tel, G.: *Introduction to Distributed Algorithms* (2. vyd., Cambridge UP 2000), kap. 7.*
