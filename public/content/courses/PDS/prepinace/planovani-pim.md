# Plánování — Take-a-Ticket a PIM

S VOQ ([[hol-voq]]) máme strukturu, která dovoluje vysokou propustnost. Zbývá *algoritmus*, kterým plánovač v každém časovém slotu zvolí maximální párování. Tato sekce probere dva: jednoduchý **Take-a-Ticket** a paralelní iterativní **PIM**.

## Take-a-Ticket — přidělování lístků

**Princip:** podobně jako u doktora — každý si vezme lístek, čeká se podle pořadí.

- Každý výstupní port $Q$ obsluhuje frontu požadavků na propojení.
- Vstupní požadavek $P$ dostane od $Q$ číslo $T_{QX}$ na obsloužení portu $Q$ s pořadím $X$.
- Výstupní porty jsou přiděleny žádostem s *nejnižším* $T_{QX}$ (nejdřív přihlášený má přednost).

Dvě sběrnice:

- **Datová** — pro přenos buněk.
- **Řídicí** — pro žádosti a oprávnění.

### Tři fáze

1. **Request** — vstupní port pošle žádost o přenos *na konkrétní výstup* (s lístkem).
2. **Grant** — výstupní port přidělí *nejnižší* lístek (FIFO).
3. **Connect & Transfer** — propojení vstupů a výstupů + přenos.

```
Request          Grant           Connect & Transfer
 321 A    →       321 A    →     T₁₁     1
  43  B    →        43  B    →    T₁₂     2
 431 C    →       431  C    →    T₁₃     3
 432 D    →       432  D    →    T₁₄     4
```

(Sloupce čísel = lístky pro výstupy 1–3 daného vstupu; po několika round se vykoná `Transfer`.)

### Vlastnosti

- *Asynchronní zpracování* — vstup nemusí čekat na úplnou shodu.
- *Přenáší rámce proměnné délky*.
- **Trpí HOL blokováním** — viz [[hol-voq]] — protože vychází z jedné fronty na vstupu.
- *Problémy s multicastem* — vyžaduje současný přenos na *všechny* multicast výstupy.

Take-a-Ticket je *jednoduchý*, ale **propustnost ≤ 58 %**. Moderní switchi proto používají PIM/iSLIP.

## PIM — Parallel Iterative Matching

**PIM** (Anderson et al., 1992) je *paralelní iterativní* algoritmus. Pracuje s VOQ a hledá maximal matching pomocí **náhodné volby**.

### Tři fáze

1. **Request** — vstupní port pošle žádosti na *všechny* výstupy, pro které má data ve VOQ.
2. **Grant** — výstupní port přidělí oprávnění:
   - Pokud má víc žádostí → *náhodně vybere* jednu.
3. **Accept & Transfer** — vstupní port zpracuje oprávnění:
   - Pokud dostal víc oprávnění → *náhodně vybere* jedno.
   - Dojde k přenosu.

```
Request          Grant            Accept & Transfer
A  ─┬→ 1         A  ──→ 1         A  ──→ 1
A  ─┴→ 2         A  ──→ 4         A  ──→ 2
B  ──→ 2         B  ──→ 2         B  ──→ 4
B  ──→ 3         …                C  ──→ 3
C  ──→ 3                          D  ──→ 4
C  ──→ 4         (rozdělení      (po dvou
D  ──→ 1         oprávnění)      iteracích)
D  ──→ 4
```

### Vlastnosti PIM

- *Paralelní* — všechny vstupy a výstupy se rozhodují *současně*.
- *Iterativní* — pokud první iterace nepokryje všechna VOQ, *opakuje* na zbývajících v dalších iteracích (téhož časového slotu).
- *Bez deterministického pořadí* — random choice řeší soutěž.

### Optimalizace pomocí více iterací

V jedné iteraci se *nemusí* podařit vyřešit všechny páry. Pokud zůstanou nepokrytá VOQ, PIM **opakuje** se zbývajícími požadavky.

| Iterace | Co zbývá vyřešit |
| :---: | :--- |
| 1 | Všechny VOQ |
| 2 | Jen ty, co nebyly v iteraci 1 |
| 3 | Jen ty, co nebyly v iteraci 1 a 2 |

Konvergence: PIM v průměru konverguje k maximal matching v $\mathcal{O}(\log N)$ iterací.

### Propustnost

- *Jedna iterace:* ~63 % pro velké $N$ a uniform traffic.
- *Dvě iterace:* ~75 %.
- *Tři iterace a více:* asymptoticky k 100 %.

V praxi: **2–4 iterace** stačí pro 95–99 % propustnosti.

### Zhodnocení PIM

- **Výhody:**
  - Paralelní, snadno implementovatelné v HW.
  - Spravedlivé v dlouhodobém průměru (random).
- **Nevýhody:**
  - **Problém generování náhodných čísel** — true random je drahé v HW.
  - Náhodná volba *nemusí* být férová v krátkodobém horizontu.

Tyto nedostatky řeší **iSLIP** ([[planovani-islip]]) — *deterministická rotace* místo náhody.

## Co dále

iSLIP nahrazuje náhodu rotujícími ukazateli — viz [[planovani-islip]].

---

*Zdroj: PDS přednáška 4, doc. Ing. Petr Matoušek, Ph.D., M.A., FIT VUT v Brně. Externí reference: Anderson, T.E., Owicki, S.S., Saxe, J.B., Thacker, C.P.: „High Speed Switch Scheduling for Local Area Networks" (ASPLOS V, 1992, [DOI 10.1145/143365.143380](https://doi.org/10.1145/143365.143380)).*
