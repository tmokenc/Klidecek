---
title: CSP a OCCAM — modelování komunikujících procesů
---

# CSP a OCCAM — jazyky komunikujících procesů

Předchozí kapitola ([[komunikace-modely]]) probrala *modely* komunikace mezi procesy. Tato kapitola představí *konkrétní* jazyky pro popis distribuovaných systémů. **CSP (Communicating Sequential Processes)** od C.A.R. Hoareho (1978) je *formální algebra* — matematický jazyk pro modelování paralelních systémů komunikujících předáváním zpráv. **OCCAM** je *praktický* jazyk založený na CSP, navržený pro transputery (HW i SW codesign 1980s). Oba používají *synchronní* komunikaci po pojmenovaných kanálech.

## CSP — Communicating Sequential Processes

**C.A.R. Hoare**, 1978: *„Communicating Sequential Processes"*, CACM 21(8), 666–677.

CSP je *formální algebra* (process calculus) pro modelování paralelních systémů:

- **Procesy** jsou *sekvenční* — uvnitř každého procesu se vykonávají kroky postupně.
- **Komunikace** mezi procesy je *synchronní* po *pojmenovaných* kanálech.
- **Souběžnost** je vyjádřena *paralelní kompozicí*: $P \mathbin{\|} Q$ znamená $P$ a $Q$ běží paralelně.

CSP je *výchozí* pro pozdější algebry: **π-calculus** (Milner), **OCCAM** (HW), **Erlang** (programovací jazyk), **Go channels** (programovací paradigma).

## OCCAM — jazyk pro transputery

**OCCAM** (David May, INMOS 1983): *praktický* programovací jazyk založený na CSP. Cílem byly **transputery** — speciální MIMD procesory s vestavěnými kanály komunikace.

- Původně inspirován CSP.
- Pozdější rozšíření (OCCAM-π) přidalo prvky z π-kalkulu.
- Navržen pro *automatickou transformaci* programu (formální sémantika).
- Programy v OCCAMu se *přímo* kompilovaly do hardwaru.
- Některé moderní jazyky (Java, Erlang, Go) mají OCCAM-like rozšíření pro paralelní procesy.

### Pět základních primitiv

| Primitivum | Syntax | Význam |
| :--- | :--- | :--- |
| **Přiřazení** | `x := y + 2` | uložení do proměnné |
| **Vstup** | `keyboard ? char` | čtení z kanálu |
| **Výstup** | `screen ! char` | zápis do kanálu |
| **SKIP** | `SKIP` | NOP — neudělá nic, hned skončí |
| **STOP** | `STOP` | NOP — neskončí nikdy |

**Kanály**:

- **point-to-point** (jeden odesilatel, jeden příjemce).
- **synchronní** (rendezvous — odesílatel čeká na příjemce).
- **nebufferované** (zpráva se přenese *přímo*).
- *typované* — kanál má definovaný typ přenášených dat.

```
        Channel c
   c!x  ─────────→  c?y
```

### Konstrukce — SEQ, PAR, ALT

#### SEQ — sekvenční vykonání

```occam
SEQ
  keyboard ? char    -- načti znak
  screen ! char      -- napiš znak
```

Replikovaná SEQ:

```occam
SEQ i = 0 FOR array.size
  stream ! data.array[i]
```

= sekvenční smyčka odeslání všech prvků pole na kanál `stream`.

#### PAR — paralelní vykonání

```occam
PAR
  keyboard(kbd.to.ed)
  editor(kbd.to.ed, ed.to.screen)
  screen(ed.to.screen)
```

Tři procesy běží paralelně, propojené dvěma kanály.

::: svg "OCCAM PAR — tři paralelní procesy spojené kanály"
<svg viewBox="0 0 540 150" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <rect x="60" y="50" width="100" height="50" rx="3"/>
    <rect x="220" y="50" width="100" height="50" rx="3"/>
    <rect x="380" y="50" width="100" height="50" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="110" y="80">keyboard</text>
    <text x="270" y="80">editor</text>
    <text x="430" y="80">screen</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#paroccam)">
    <line x1="165" y1="75" x2="215" y2="75"/>
    <line x1="325" y1="75" x2="375" y2="75"/>
  </g>
  <defs>
    <marker id="paroccam" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="var(--accent)"/>
    </marker>
  </defs>
  <text x="190" y="65" fill="var(--accent)" text-anchor="middle" font-size="10">kbd.to.ed</text>
  <text x="350" y="65" fill="var(--accent)" text-anchor="middle" font-size="10">ed.to.screen</text>
  <text x="270" y="135" fill="var(--text-muted)" text-anchor="middle" font-size="10">Tři procesy běží paralelně; kanály jsou jejich jediná interakce</text>
</svg>
:::

**Omezení**: proměnná modifikovaná v jedné větvi `PAR` *nesmí* být čtená/zapisovaná v jiné větvi. Toto pravidlo *odstraňuje race conditions* na úrovni jazyka.

Replikovaný PAR:

```occam
PAR
  farmer()
  PAR i = 0 FOR 4               -- 4 dělníci
    worker(i)
```

#### ALT — alternativa (nedeterministický výběr)

```occam
ALT
  left ? packet      -- guard input
    out ! packet
  right ? packet     -- guard input
    out ! packet
```

`ALT` čeká, dokud *libovolný* z **strážců** (guards) není splněn. Pak provede *odpovídající* akci.

**Typy strážců**:

- **vstup**: `in ? data` — vyplní data z kanálu.
- **bool podmínka & vstup**: `not.empty & in ? data` — kombinace.
- **bool podmínka & SKIP**: `not.empty & SKIP` — proběhne, pokud podmínka platí.

ALT je *zásadní* pro nedeterministické chování — proces volí *cestu* podle dostupnosti vstupu.

### Pipeline — příklad

```occam
WHILE next <> EOF
  SEQ
    x := next
    PAR
      in ? next      -- nový vstup paralelně s
      out ! x * x    -- výstupem druhé mocniny
```

Klasický **pipeline pattern**: zatímco posíláme aktuální výsledek, *paralelně* čteme další vstup. Zvyšuje propustnost.

### Buffer

```occam
WHILE TRUE
  BYTE b:
  SEQ
    in ? b
    out ! b
```

Triviální buffer — opakovaně přijme byte a pošle ho dál.

### Double buffer

```occam
CHAN OF BYTE ch:
PAR
  WHILE TRUE              -- producer-side buffer
    BYTE b:
    SEQ
      in ? b
      ch ! b
  WHILE TRUE              -- consumer-side buffer
    BYTE b:
    SEQ
      ch ? b
      out ! b
```

Dva paralelní procesy propojené interním kanálem. **Bufferuje** zprávu — zvyšuje propustnost, snižuje *latency*.

### Procedure deklarace

```occam
PROC buff(CHAN OF BYTE in, out)
  WHILE TRUE
    BYTE x:
    SEQ
      in ? x
      out ! x :          -- konec procedury

CHAN OF BYTE comms, buffer.in, buffer.out:
PAR
  buff(buffer.in, comms)
  buff(comms, buffer.out)
```

Procedury jsou *parameterizované* procesy, lze je libovolně instancovat.

## Reálné implementace OCCAM {tier=practice}

- **INMOS Transputery** — 1980s–90s. Hardware s vestavěnými kanály a OCCAM kompilátorem.
- **KRoC** (Kent Retargetable occam Compiler) — open-source kompilátor.
- **OCCAM-π** — moderní varianta s prvky π-kalkulu, podporuje *mobilní* kanály.

OCCAM se *prakticky* nepoužívá, ale jeho *koncepty* (kanály, SEQ/PAR/ALT) přežívají v:

- **Go** — channels, `select` (= ALT), `go` (= PAR start).
- **Erlang** — message passing, processes (lightweight).
- **Rust** (rust-channel, tokio) — mpsc channels.
- **Clojure core.async** — channels + alts!.

## CSP jako algebra

Mimo programovací jazyk je CSP **matematický model**. Klíčové operátory:

- $P \to Q$ — *sekvenční* (po události $P$ následuje $Q$).
- $P \mathbin{\|} Q$ — *paralelní* kompozice.
- $P \mathbin{\square} Q$ — *external* choice (vnější volba — operátor *deterministický*).
- $P \mathbin{\sqcap} Q$ — *internal* choice (vnitřní volba — *nedeterministický*).
- $P \setminus A$ — *hide* (skrytí akcí ze sady $A$).
- $a \to P$ — *prefix* (akce $a$ následovaná procesem $P$).

Pomocí těchto operátorů lze popsat *trace*, *failures* a *divergence* každého procesu — *tři* sémantiky CSP.

CSP je *implementován* v nástroji **FDR** (Failures-Divergences Refinement) pro *formální verifikaci* paralelních systémů.

## Co dál

[[pi-calculus]] zobecní CSP na **π-kalkul** — proces algebra s *mobilními* procesy a *přenosem jmen kanálů* jako dat. Tato schopnost umožňuje modelovat *dynamická* systémová prostředí (cloudy, mikroservisy). [[simulace-bisimulace]] potom probere *teorii* ekvivalence procesů — *bisimulaci*, *barbed bisimulaci*, *kongruence* — formální nástroje pro porovnání chování procesů.

---

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Hoare, C.A.R.: „Communicating Sequential Processes" (CACM 21(8), 1978, [DOI 10.1145/359576.359585](https://doi.org/10.1145/359576.359585)) — originální článek; Hoare, C.A.R.: *Communicating Sequential Processes* (Prentice Hall 1985, [free PDF](http://www.usingcsp.com/cspbook.pdf)) — kanonický text; INMOS Ltd.: *OCCAM Programming Manual* (Prentice Hall 1984); Welch, P.H., Barnes, F.R.M.: „Communicating mobile processes — introducing occam-pi" (CPA 2005, [DOI 10.1007/11423348_10](https://doi.org/10.1007/11423348_10)); Roscoe, A.W.: *Understanding Concurrent Systems* (Springer 2010) — moderní CSP; *Go Programming Language Specification* — channels & select ([oficiální stránky](https://go.dev/ref/spec)).*
