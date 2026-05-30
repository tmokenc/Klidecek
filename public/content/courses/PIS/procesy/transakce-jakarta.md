# Transakce v Jakarta EE — JTA, @Transactional, @TransactionAttribute

Teoretické modely transakcí z předchozích sekcí ([[transakce-acid]], [[modely-transakci]]) mají v Jakarta EE konkrétní obraz. Veškerou *infrastrukturní* práci za nás dělá platforma — od běhu commit/rollback po koordinaci více zdrojů. Programátor zůstává odpovědný za **konzistenci** (viz [[transakce-acid]]) — anotace nahradí jen mechanická volání `begin` / `commit` / `rollback`.

## JTA — Java Transaction API

**Java Transaction API** (balíček `jakarta.transaction`) je standardní rozhraní mezi aplikací, kontejnerem a TPS. Pod kapotou se opírá o **XA protokol** od The Open Group, který umožňuje *jedné transakci* koordinovat *více nezávislých zdrojů* (databáze + JMS broker + …) — k tomu se dostaneme v [[distribuovane-transakce]].

Jakarta EE definuje **tři úrovně správy transakcí**:

| Úroveň | Mechanismus | Kdy se používá |
| :--- | :--- | :--- |
| **CMT** — Container-Managed Transactions | implicitní v EJB; kontejner spustí transakci před metodou, commit/rollback po návratu | výchozí pro `@Stateless`, `@Stateful`, `@Singleton` (viz [[ejb-cdi]]) |
| **BMT** — Bean-Managed Transactions | explicitní volání `UserTransaction.begin() / commit() / rollback()` | jen výjimečně — když potřebujeme jemnější kontrolu |
| **CDI interceptor** | anotace `@Transactional` (od Jakarta Transactions 2.0) | běžné v CDI beanech, které nejsou EJB |

V této přednášce se nezabýváme BMT, ale dvěma deklarativními variantami: **CMT pro EJB** a **`@Transactional` pro CDI beany**.

## @Transactional — deklarativní správa v CDI

Anotace `@Transactional` z `jakarta.transaction` umí *jakákoli* CDI bean (nemusí to být EJB) udělat transakční. Kontejner vloží před metodu **interceptor**, který:

1. před vstupem do metody zahájí transakci (nebo se napojí na existující),
2. po úspěšném návratu provede `commit()`,
3. po `RuntimeException` provede automaticky `rollback()`.

```java
@ApplicationScoped
public class ObjednavkaService {

    @Inject
    EntityManager em;

    @Transactional
    public void vytvorObjednavku(Objednavka o) {
        em.persist(o);
        // kontejner: begin před metodou, commit po návratu
        // RuntimeException → rollback automaticky
    }
}
```

Důležité: `@Transactional` na CDI beanu *přebíjí* fakt, že nejde o EJB. Ve smyslu transakcí se chová jako EJB s CMT, jen s **odlišným výchozím chováním pro výjimky**: u `@Transactional` se rollbacknou všechny *unchecked* (RuntimeException), ostatní (checked) výjimky defaultně rollback **NEvyvolají** — transakce se commituje — což lze změnit parametry `rollbackOn` a `dontRollbackOn`.

## @TransactionAttribute — řízení propagace

Co se má stát, **když transakční metoda volá jinou transakční metodu**? Tj. má se podtransakce připojit k probíhající transakci, nebo si založit novou? Tento výběr řídí atribut `value` u `@Transactional` (parametr `Transactional.TxType`) v CDI, resp. anotace `@TransactionAttribute(TransactionAttributeType.*)` v EJB:

| Hodnota | Chování volané metody |
| :--- | :--- |
| `REQUIRED` *(výchozí)* | Připojí se k existující transakci; není-li, vytvoří novou. |
| `REQUIRES_NEW` | **Vždy** vytvoří novou nezávislou transakci; stávající *pozastaví*. |
| `MANDATORY` | Transakce už *musí* běžet; jinak výjimka. |
| `SUPPORTS` | Připojí se k existující; pokud neběží, pracuje *bez* transakce. |
| `NOT_SUPPORTED` | *Vždy* mimo transakci; stávající pozastaví. |
| `NEVER` | Aktivní transakce *nesmí* být; jinak výjimka. |

Z těchto šesti je v praxi nejdůležitější rozdíl `REQUIRED` (jedna velká transakce přes několik metod) vs. `REQUIRES_NEW` (nezávislá podtransakce, jejíž *rollback nezruší* volající transakci).

### REQUIRES_NEW — nezávislá podtransakce

```java
@Transactional   // implicitně REQUIRED
public void zpracujObjednavku(long id) {
    ulozObjednavku(id);     // v téže transakci
    odesliPotvrzeni(id);    // ↓ nová nezávislá transakce
}

@Transactional(Transactional.TxType.REQUIRES_NEW)
private void odesliPotvrzeni(long id) {
    // commit/rollback této metody neovlivní volající transakci
}
```

> **Pozor:** v této podobě se `REQUIRES_NEW` *neuplatní* — metoda `odesliPotvrzeni` je `private` a je volaná self-invocation (`this`) ze stejné beany, takže CDI/EJB interceptor obejde proxy a žádná nová transakce nevznikne. Aby to fungovalo, musí být `odesliPotvrzeni` v jiné (injektované) beaně a volaná `public` metodou přes injektovaný odkaz.

Tento vzor odpovídá **zřetězené transakci**, kde se kontejner postará o `chain()` — viz [[zretezene-transakce]] pro teoretický pohled.

## EJB s CMT — implicitní REQUIRED

U EJB (`@Stateless`, `@Stateful`, `@Singleton`) je transakční chování zapnuté **implicitně**: každá business metoda je automaticky `REQUIRED`. Anotace `@TransactionAttribute` přebíjí jen tam, kde to chceme změnit:

```java
@Stateless
public class SkladBean {
    // implicitně REQUIRED na každé metodě

    @TransactionAttribute(TransactionAttributeType.REQUIRES_NEW)
    public void zarezervujZbozi(long polozkaId) { /* … */ }
}
```

Zodpovědnost za **konzistenci** dat zůstává na programátorovi — *anotace nenahrazují správný návrh logiky*.

## Shrnutí: teorie ↔ Jakarta EE

| Teorie | Jakarta EE |
| :--- | :--- |
| Plochá transakce | `@Transactional` / CMT — kontejner zajistí begin/commit/rollback |
| `chain()` — zřetězená transakce | `REQUIRES_NEW` — kontejner spustí nezávislou podtransakci |
| XA protokol (dále) | JTA koordinuje více zdrojů (DB + JMS broker) v jedné transakci |
| Konzistence = zodpovědnost programátora | Anotace nenahrazují správný návrh logiky |

V dalších sekcích uvidíme, že JTA + XA spolu se zotavitelnými frontami tvoří **infrastrukturní základ celé „cesty k workflow“** — viz [[distribuovane-transakce]], [[zotavitelne-fronty]] a [[jakarta-messaging]].

---

*Zdroj: PIS přednáška 6, doc. Ing. Radek Burget, Ph.D., FIT VUT v Brně. Externí reference: [Jakarta Transactions 2.0 specifikace](https://jakarta.ee/specifications/transactions/2.0/), [Jakarta EE Tutorial — Transactions](https://jakarta.ee/learn/docs/jakartaee-tutorial/current/), The Open Group: [XA Specification](https://pubs.opengroup.org/onlinepubs/009680699/toc.pdf).*
