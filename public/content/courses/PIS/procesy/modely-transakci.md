# Modely transakcí — plochá transakce, body návratu, backtracking

Když známe ACID a víme, kdo co zajišťuje (viz [[transakce-acid]]), můžeme rozebrat **konkrétní modely** transakčního zpracování. Začínáme tím nejjednodušším — *plochou transakcí* — a postupně přidáváme strukturu, která umožňuje **částečné zotavení** bez ztráty celé dosavadní práce.

## Plochá transakce (flat transaction)

**Plochá transakce** je minimální model bez vnitřní struktury — odpovídá *obecnému procesu v programovacím jazyce* z dvouúrovňového schématu. Skládá se ze tří částí:

1. `begin_transaction()`
2. tělo transakce (sekvence operací)
3. `commit()` při úspěchu, nebo `rollback()` / `abort()` při chybě.

Žádné částečné zotavení, žádné body návratu — buď celá transakce, nebo nic. Lokální *nedatabázové* proměnné jsou součástí programu, ne DB kontextu (a v případě havárie se ztratí).

```text
begin_transaction();
    … blok programu …
    if (chyba) abort();
    …
commit();
```

### Problém ploché transakce — rezervace letu

Klasický příklad ukazující limity ploché transakce: zákazník chce rezervovat let z **A do E** přes mezizastávky. Existují dvě varianty: `A → B → C → E` a `A → B → D → E`.

:::svg
<svg viewBox="0 0 540 200" xmlns="http://www.w3.org/2000/svg" style="max-width: 580px;">
  <defs>
    <marker id="arrC" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--text)"/>
    </marker>
    <marker id="arrCRed" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#ef4444"/>
    </marker>
  </defs>
  <circle cx="60"  cy="100" r="22" fill="var(--bg-inset)" stroke="var(--text)"/>
  <circle cx="180" cy="100" r="22" fill="var(--bg-inset)" stroke="var(--text)"/>
  <circle cx="300" cy="50"  r="22" fill="var(--bg-inset)" stroke="var(--text)"/>
  <circle cx="300" cy="150" r="22" fill="var(--bg-inset)" stroke="var(--text)"/>
  <circle cx="430" cy="100" r="22" fill="var(--bg-inset)" stroke="var(--text)" stroke-width="3"/>
  <text x="60"  y="105" text-anchor="middle" font-family="ui-sans-serif" font-size="14" font-weight="bold" fill="var(--text)">A</text>
  <text x="180" y="105" text-anchor="middle" font-family="ui-sans-serif" font-size="14" font-weight="bold" fill="var(--text)">B</text>
  <text x="300" y="55"  text-anchor="middle" font-family="ui-sans-serif" font-size="14" font-weight="bold" fill="var(--text)">C</text>
  <text x="300" y="155" text-anchor="middle" font-family="ui-sans-serif" font-size="14" font-weight="bold" fill="var(--text)">D</text>
  <text x="430" y="105" text-anchor="middle" font-family="ui-sans-serif" font-size="14" font-weight="bold" fill="var(--text)">E</text>
  <line x1="82"  y1="100" x2="158" y2="100" stroke="var(--text)" stroke-width="2" marker-end="url(#arrC)"/>
  <line x1="198" y1="88"  x2="282" y2="60"  stroke="var(--text)" stroke-width="2" marker-end="url(#arrC)"/>
  <line x1="198" y1="112" x2="282" y2="140" stroke="var(--text)" stroke-width="2" marker-end="url(#arrC)"/>
  <line x1="322" y1="60"  x2="408" y2="92"  stroke="#ef4444" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#arrCRed)"/>
  <text x="370" y="62"  text-anchor="middle" font-family="ui-sans-serif" font-size="11" fill="#ef4444">obsazený</text>
  <line x1="322" y1="140" x2="408" y2="108" stroke="var(--text)" stroke-width="2" marker-end="url(#arrC)"/>
</svg>
:::

Plochá transakce zarezervuje `A→B`, pak `B→C`, ale **`C→E` je obsazené**. Nemůže provést částečný návrat jen na uzel B — musí **zrušit celou transakci**, takže přijde i o rezervaci `A→B`, kterou by potřebovala pro alternativní cestu přes D. Řešením je **bod návratu**.

## Body návratu (savepoints)

**Savepoint** je bod uvnitř jedné transakce, do kterého lze provést *částečný rollback*, aniž by se zrušila celá transakce. Sémantika:

- **Vytvoření**: `sp := create_savepoint()` — zapíše do žurnálu okamžitý stav databáze v rámci transakce.
- **Částečný návrat**: `rollback(sp)` — *obnoví DB kontext* do podoby v okamžiku `sp`, ale **lokální (nedatabázové) proměnné** zůstanou zachovány. Po provedení se **pokračuje za příkazem návratu**, transakce běží dál.
- Zrušené milníky *mezi cílem a místem návratu* zanikají (po `rollback(sp2)` neexistuje pozdější `sp3`).
- **`abort` vs `rollback`**: `abort` zastaví transakci úplně, kdežto `rollback(sp)` pokračuje za příkazem.

```text
begin_transaction();
    S1;
    sp1 := create_savepoint();
    S2;
    sp2 := create_savepoint();
    S3;
    if (podmínka) {
        rollback(sp2);   // vrátí S3, pokračuje dál
        S4;
    }
commit();
```

Savepoint *není* nová transakce — celá vnější transakce zůstává jednou logickou jednotkou. Atomičnost a izolovanost jsou stále celkové (commit potvrdí všechno, co bylo po posledním rollbacku); savepoint je jen *čistě interní mechanismus* pro vrácení části práce.

## Backtracking — strategie s body návratu

Rezervaci letu lze nyní řešit jako klasický **backtracking** (vyhledávání s návraty):

1. Na začátku a v každém větvení se vytvoří savepoint.
2. Při neúspěchu provede `rollback` na předchozí savepoint a zkusí jinou variantu.
3. Body návratu fungují jako **zásobník** — typický rys hierarchického procesu, kde se kontext nadřazené úrovně udržuje na zásobníku.

Příklad běhu (letový scénář z obrázku výše):

```
A → B            sp1
B → C            sp2
C → E ✗          obsazeno → rollback(sp1)
B → D            sp2
D → E ✓          commit
```

Backtracking přes savepoints umožňuje *prozkoumávat variantní cesty* bez ztráty již vykonané práce. Z hlediska teorie modelů procesů je to přechod od *plochého* k *hierarchickému* modelu — body návratu ovšem zůstávají v rámci jedné transakce, takže celkové ACID vlastnosti nejsou nijak oslabeny. To je důležité srovnání s [[zretezene-transakce]], kde se naopak izolovanost záměrně obětuje.

## Shrnutí — kdy který model

| Model | Kdy použít | Cena |
| :--- | :--- | :--- |
| **Plochá** | krátké, jednoznačné operace (zápis objednávky) | žádné částečné zotavení |
| **Savepoints + backtracking** | výpočet s variantami v rámci jedné transakce | drží zámky po celou dobu transakce |
| **Zřetězené** (viz [[zretezene-transakce]]) | dlouhé sekvence kroků, kde lze obětovat izolovanost | celek není izolovaný, nutno řešit kompenzace |

V Jakarta EE se savepoints prakticky používají skrze JDBC (`Connection.setSavepoint()`) nebo JPA-specifické rozšíření; deklarativní `@Transactional` model se savepoints nepracuje — má jen `REQUIRES_NEW` pro nezávislé podtransakce, což je *funkčně jiný* mechanismus (viz [[transakce-jakarta]]).

---

*Zdroj: PIS přednáška 6, doc. Ing. Radek Burget, Ph.D., FIT VUT v Brně. Externí reference: PostgreSQL dokumentace [`SAVEPOINT`](https://www.postgresql.org/docs/current/sql-savepoint.html); JDBC API — `Connection.setSavepoint(String name)`.*
