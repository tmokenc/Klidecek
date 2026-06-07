# Workflow patterns — vzory řízení toku

Když máme BPMN notaci ([[bpmn-notace]]) s aktivitami, branami a událostmi, vyvstává otázka: *jaké kanonické vzory řízení toku (workflow patterns) se v procesech vlastně objevují?* Tuto otázku zodpověděla skupina kolem **Wil van der Aalsta** ve výzkumu *Workflow Patterns* (TU Eindhoven & QUT, od roku 1999 dodnes). Katalog na [workflowpatterns.com](http://workflowpatterns.com) obsahuje desítky vzorů; přednáška se soustřeďuje na **sedm základních** vzorů řízení toku.

## Rozdělení, spojení, sloučení (Split, Join, Merge) — terminologie

Kromě konkrétních vzorů zavádí přednáška obecnou terminologii:

- **Rozdělení (Split)** — rozdělení toku na více větví.
- **Spojení / sloučení (Join / Merge)** — sloučení více větví do jedné.
- Typy bran: **XOR** (vzájemné vyloučení větví), **AND** (paralelní zpracování), **OR** (inkluzivní, tedy „jedna nebo více").

Jednotlivé vzory pak odpovídají kombinacím rozdělení/sloučení (split/merge) a typů bran.

## 7 základních vzorů

### 1. Sekvence (Sequence)

Pracovní úkol je povolen teprve tehdy, *až je dokončen předcházející úkol*. Je to nejzákladnější vzor a tvoří *základ všech procesů*.

```
A → B → C
```

### 2. Paralelní rozdělení (Parallel Split, AND-split)

Rozděluje tok do **dvou a více paralelních vláken**. Všechny větve jsou spuštěny *současně*. V BPMN existují tři varianty zápisu — nekontrolovaný tok ze startovní události (start event), nekontrolovaný tok z aktivity, nebo explicitní brána **+**.

```
        ┌→ B
A → AND ┤
        └→ C
```

### 3. Synchronizace (Synchronization, AND-join)

Navazující úkol začne teprve tehdy, *až jsou dokončena všechna* předchozí vlákna. Jde o **párový vzor k paralelnímu rozdělení (AND-split)** — tedy o jeho protějšek, který paralelní větve opět spojí.

```
B ─┐
   AND → D
C ─┘
```

### 4. Výlučné rozhodnutí (Exclusive Choice, XOR-split)

Rozděluje tok na **vzájemně výlučné** větve. Na základě podmínky se vstupuje do *právě jedné* z nich. V BPMN se kreslí jako brána s **X**.

```
        ┌ [a < 100] → B
A → XOR ┤
        └ [a ≥ 100] → C
```

### 5. Jednoduché spojení (Simple Merge, XOR-merge)

Spojení dvou nebo více *nezávislých* větví do jedné. Navazující aktivita začne *okamžitě, jakmile **jedno** vlákno dosáhne konce* — **nemusí čekat** na ostatní větve.

```
A ─┐
   XOR → C
B ─┘
```

Jednoduché spojení (XOR-merge) je párový vzor k výlučnému rozhodnutí (XOR-split): pokud po výlučném rozhodnutí běží *právě jedna* větev, jednoduché spojení dostane *právě jeden* token (značku procházející sítí) a okamžitě pokračuje dále.

### 6. Vícenásobná volba (Multi-Choice, OR-split)

Rozdělení toku do **jedné nebo více** větví. Výběr probíhá na základě podmínek, a to **neexkluzivně** — může se splnit více podmínek najednou.

V BPMN se kreslí jako brána s **O** (inkluzivní rozhodovací brána, Inclusive Decision Gate).

### 7. Synchronizující sloučení (Synchronizing Merge, OR-join)

Čeká na ukončení **všech větví, které byly spuštěny** (ne nutně všech *možných*). Jde o párový vzor k vícenásobné volbě (OR-split) — platí pro něj pravidlo *„skončí vše, co začalo".*

Implementace je netriviální — vykonávací engine (běhové jádro procesu) musí vědět, *které větve byly aktivovány*, aby věděl, na které z nich má čekat. Právě proto některé starší enginy synchronizující sloučení (OR-join) řádně nepodporují a místo něj doporučují kombinaci bran XOR a AND.

::: viz workflow-patterns "Vyber vzor, pak klikni na zvýrazněný obdélník nebo tlačítko ▶ pro spuštění přechodu (fire transition). Sleduj, jak se tokeny pohybují."
:::

## Souhrnná tabulka

| # | Vzor | Anglicky | Brána | Sémantika |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Sekvence | Sequence | — | krok po kroku |
| 2 | Parallel Split | AND-split | AND ⊕ | rozdělí na *všechny* paralelní větve |
| 3 | Synchronizace | AND-join | AND ⊕ | čeká na *všechny* vstupní |
| 4 | Výlučné rozhodnutí | XOR-split | XOR ⊗ | vstupuje do *právě jedné* větve |
| 5 | Jednoduché spojení | XOR-merge | XOR ⊗ | první příchozí pokračuje |
| 6 | Vícenásobná volba | OR-split | OR ○ | vstupuje do *jedné nebo více* větví |
| 7 | Synchronizující sloučení | OR-join | OR ○ | čeká na *všechny aktivované* větve |

## Sémantika tokenů — Petriho sítě

Formálně se sémantika BPMN modelů popisuje pomocí **Petriho sítí**. Každá aktivita drží *tokeny* (značky, které procházejí sítí). Přechod (brána) se *aktivuje*, jakmile má dostatek vstupních tokenů, a podle pravidla dané brány vyrobí výstupní tokeny.

- **Paralelní rozdělení (AND-split)** vyrobí *tokeny pro každou výstupní větev*.
- **Synchronizace (AND-join)** spotřebuje *po jednom tokenu z každé vstupní větve* a vyrobí jeden výstupní.
- **Výlučné rozhodnutí (XOR-split)** vyrobí *jeden token do jedné větve* podle podmínky.
- **Jednoduché spojení (XOR-merge)** *přepošle* token z libovolné vstupní větve.

Tato sémantika založená na Petriho sítích je teoretickým základem **verifikace** workflow modelů — viz [[flexibilita-workflow]].

---

*Zdroj: PIS přednáška 7, doc. Ing. Radek Burget, Ph.D., FIT VUT v Brně. Externí reference: [workflowpatterns.com](http://workflowpatterns.com) — van der Aalst et al., kanonický katalog workflow patterns; OMG BPMN 2.0.2, kap. 13 (Gateways).*
