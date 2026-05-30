---
title: Implementace business vrstvy — EJB, CDI, injekce
---

**Business vrstva** je srdcem informačního systému — implementuje *aplikační logiku* (pravidla, operace, výpočty), která dělá z databáze fungující IS. Klíčové vlastnosti, které od ní očekáváme:

* **Nezávislost na prezentační vrstvě** — tytéž business operace volá web UI, REST API, dávkový import i scheduler. Logika nesmí být *uvězněná* v servletu.
* **Opakovaně použitelné metody** — operace jsou veřejné, mají jasné rozhraní (parametry + návratová hodnota), lze je řetězit a komponovat.
* **Správa transakcí** — řada operací musí být atomická („vytvoř objednávku + odečti zboží + zaúčtuj platba" — všechno, nebo nic). Tuto starost si nechceme řešit ručně.
* **Případná distribuce na aplikační servery** — pro velké systémy běží různé komponenty na různých serverech a komunikují přes sítí.

Jakarta EE pro tyto cíle nabízí dva komplementární mechanismy — **EJB** (těžké business komponenty s automatickými službami) a **CDI** (lehčí obecná injekce závislostí). Tématu se podrobně věnoval subtopic [[ejb-cdi]]; zde se zaměříme na **vzorce použití**, které jsou pro business vrstvu klíčové.

## EJB — komponenty business vrstvy

[[ejb-cdi|Enterprise Java Beans]] zapouzdřují business logiku a poskytují *definované rozhraní* — veřejné metody, které mohou volat ostatní vrstvy. EJB kontejner kolem nich automaticky řeší řadu věcí, které byste jinak museli psát ručně:

* **Dependency injection** mezi EJB navzájem,
* **Transakční zpracování** — každé volání metody EJB *automaticky* tvoří JTA transakci, není-li nastaveno jinak (`@TransactionAttribute`),
* **Pooling** instancí pro `@Stateless` beany (úspora paměti, lepší propustnost),
* **Vzdálené volání** pro distribuci přes `@Remote`,
* **Security** přes `@RolesAllowed`, kontext bezpečnosti.

::: svg "EJB v business vrstvě — kontejner přidává služby, vy píšete jen logiku"
<svg viewBox="0 0 540 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="20" width="520" height="170" rx="8" fill="oklch(0.62 0.14 264 / 0.06)" stroke="oklch(0.62 0.14 264)"/>
  <text x="270" y="42" text-anchor="middle" font-size="13" font-weight="600" fill="oklch(0.40 0.14 264)">EJB kontejner</text>
  <rect x="150" y="65" width="240" height="80" rx="6" fill="var(--bg-card)" stroke="oklch(0.62 0.14 142)" stroke-width="1.5"/>
  <text x="270" y="86" text-anchor="middle" font-size="13" font-weight="600" fill="oklch(0.40 0.14 142)">vaše třída @Stateless</text>
  <text x="270" y="105" text-anchor="middle" font-size="12" fill="var(--text)" font-family="var(--font-mono)">createOrder(...)</text>
  <text x="270" y="123" text-anchor="middle" font-size="12" fill="var(--text)" font-family="var(--font-mono)">cancelOrder(...)</text>
  <text x="270" y="141" text-anchor="middle" font-size="11" fill="var(--text-muted)" font-style="italic">pouze business logika</text>
  <text x="30" y="86" font-size="11" fill="var(--text-muted)">+ transakce</text>
  <text x="30" y="106" font-size="11" fill="var(--text-muted)">+ pool instancí</text>
  <text x="30" y="126" font-size="11" fill="var(--text-muted)">+ DI mezi EJB</text>
  <text x="430" y="86" font-size="11" fill="var(--text-muted)">+ security</text>
  <text x="430" y="106" font-size="11" fill="var(--text-muted)">+ remote calls</text>
  <text x="430" y="126" font-size="11" fill="var(--text-muted)">+ scheduling</text>
  <text x="270" y="178" text-anchor="middle" font-size="11" fill="var(--text-faint)" font-style="italic">Kontejner vám tyto služby dodá automaticky, vy je nemusíte programovat.</text>
</svg>
:::

### Typy EJB podle životnosti

* **`@Stateless`** — bezstavový bean. Kontejner drží *pool* instancí a sdílí je mezi klienty. Vhodné pro service classes, REST endpoint logiku, transakční operace.
* **`@Stateful`** — jedna instance *na klienta*, drží stav (typicky košík, multi-step formulář). Pozor — `@Stateful` se v dnešní praxi používá zřídka, protože konflikuje s HTTP bezstavovostí REST.
* **`@Singleton`** — jedna instance na celou aplikaci. Cache, počítadla, plánované úlohy.

### Použití — lokální vs. vzdálené volání

V téže aplikaci stačí jednoduchá anotace `@EJB`:

```java
@Stateless
public class OrderResource {
    @EJB
    private OrderService service;     // kontejner dodá instanci

    public Response create(OrderDto input) {
        long id = service.create(input);   // volání běží v transakci
        return Response.created(URI.create("/orders/" + id)).build();
    }
}
```

Pro **vzdálené volání** (distribuované systémy) se definuje rozhraní anotované `@Remote` — klient se k EJB připojí přes *JNDI lookup* po síti. Toto se v moderní praxi vytlačuje REST/gRPC, ale pro klasické enterprise IS to stále existuje.

## CDI — obecná injekce závislostí

**Contexts and Dependency Injection** (CDI) je obecný mechanismus DI pro Javu, který funguje **i mimo EJB**. Téměř libovolná Javovská třída s veřejným bezparametrovým konstruktorem může být *CDI bean* — netřeba EJB anotace, netřeba kontejneru.

Výhody CDI nad EJB:

* **Volnější propojení** — třídy závisejí na rozhraní, ne na konkrétní implementaci,
* **Flexibilní výměna implementace** (test mocky, různé profily),
* **Lepší testovatelnost**,
* **Lehčí životní cyklus** — žádné transakce ani pooly „zadarmo", ale i méně overhead.

### Tři způsoby injekce s `@Inject`

CDI umožňuje injektovat závislost do třídy *třemi způsoby*. Volba má vliv na testovatelnost a srozumitelnost kódu.

#### 1. Field injection (přímo na atribut)

```java
@WebServlet(urlPatterns = "/itemServlet")
public class ItemServlet extends HttpServlet {

    @Inject
    private NumberGenerator numberGenerator;        // CDI nastaví field
}
```

* **Plus**: nejstručnější, žádný boilerplate.
* **Mínus**: nejhůře *testovatelné* — bez CDI kontejneru (např. v JUnit testu) nelze pole nastavit jinak než přes reflection. Třída „skrývá" své závislosti.

#### 2. Constructor injection (parametry konstruktoru)

```java
@WebServlet(urlPatterns = "/itemServlet")
public class ItemServlet extends HttpServlet {

    private NumberGenerator numberGenerator;

    @Inject
    public ItemServlet(NumberGenerator numberGenerator) {
        this.numberGenerator = numberGenerator;
    }
}
```

* **Plus**: závislosti jsou *viditelné v signatuře* konstruktoru — třída je *self-documenting*. V testu lze instanci snadno vytvořit s mockem.
* **Plus**: pole může být `final`, což zaručí, že nikdy nebude `null` ani změněno.
* **Mínus**: CDI bean musí mít *buď* bezparametrový konstruktor, *nebo* právě jeden konstruktor anotovaný `@Inject`. To naráží u servletů — třídy dědící z `HttpServlet` instancuje servlet kontejner, který vyžaduje veřejný bezparametrový konstruktor. Proto je konstruktorová injekce na servletech nešikovná a u nich se častěji volí field/setter injekce (příklad výše tedy není typický servletový vzor).

#### 3. Setter injection (přes settery)

```java
@WebServlet(urlPatterns = "/itemServlet")
public class ItemServlet extends HttpServlet {

    private NumberGenerator numberGenerator;

    @Inject
    public void setNumberGenerator(NumberGenerator numberGenerator) {
        this.numberGenerator = numberGenerator;
    }
}
```

* **Plus**: závislost lze *vyměnit za běhu* (CDI to však nedělá automaticky).
* **Mínus**: pole nelze udělat `final`, závislost je „volitelná" v tom smyslu, že může nebýt nikdy nastavena. Méně časté.

### Která varianta zvolit

**Constructor injection** je dnes obecně preferovaná — díky `final` atributům, jasné signatuře a snadné testovatelnosti. Field injection je rozšířená v *starším* kódu a v rychle psaných prototypech.

### CDI scope — životnost bean

Stejný typ může mít *různé* životnosti podle anotace scope:

| Scope | Životnost |
|---|---|
| `@Dependent` (default) | shoduje se s vlastníkem |
| `@RequestScoped` | po dobu HTTP požadavku |
| `@SessionScoped` | po dobu HTTP session |
| `@ApplicationScoped` | po celou dobu aplikace |
| `@ConversationScoped` | déle než request, řízeno programátorem |

Detailní vizualizace scope je v subtopicu [[ejb-cdi]] z přednášky 2.

## CDI vs. EJB — kdy co?

Praktická volba:

* **CDI** stačí pro většinu business logiky bez transakcí (helpery, validace, view-modely, formátování).
* **EJB** (typicky `@Stateless`) volte tam, kde chcete **deklarativní transakce**, **pooling** nebo **vzdálené volání** zadarmo od kontejneru.
* V *MicroProfile* aplikacích se EJB obvykle vůbec nepoužívá — vystačíte si s CDI + `@Transactional` (Jakarta Transactions API), které dnes funguje i nad CDI beany.

::: link "Jakarta Enterprise Beans (EJB) — specifikace" "https://jakarta.ee/specifications/enterprise-beans/"
:::

::: link "Jakarta Contexts and Dependency Injection (CDI) — specifikace" "https://jakarta.ee/specifications/cdi/"
:::

::: link "Adam Bien — Field vs. Constructor Injection (analytická diskuse)" "https://adambien.blog/roller/abien/entry/field_constructor_method_injection_what"
:::

::: link "Vlado Mihalcea — Constructor injection vs setter vs field" "https://vladmihalcea.com/dependency-injection-types/"
:::

::: quiz "Píšete `OrderService` — business třídu, která zapisuje objednávky do DB a posílá emaily. Co volíte?"
- [x] `@Stateless` EJB — chcete automatické transakce, pooling a snadné injektování z REST endpointu.
  > Ano. Typický scénář pro `@Stateless`: transakce se commitne jen tehdy, pokud projdou *všechny* kroky (zápis + email). Při výjimce kontejner rollbackne.
- [ ] CDI `@ApplicationScoped` — bez kontejnerové režie.
  > Funguje, ale ztratíte automatické transakce (museli byste je dělat ručně přes `UserTransaction`). EJB je v tomto úkolu výhodnější.
- [ ] `@Stateful` EJB — drží stav objednávky napříč voláními.
  > Není potřeba. Každé volání `createOrder(dto)` je nezávislé, stav v DB. Stateful by zbytečně přidal komplexitu sticky session.
:::

::: quiz "Která varianta CDI injekce je nejlepší pro testovatelnost?"
- [x] Constructor injection — třída přijímá závislosti jako parametry konstruktoru, takže v testu lze přímo vytvořit instanci s mocky.
  > Ano. Bez reflection, bez CDI kontejneru, bez magie. Závislosti jsou viditelné v signatuře.
- [ ] Field injection — nejstručnější.
  > Stručnost má svou cenu: závislosti jsou skryté a v testu je nejde nastavit normální cestou (musíte přes reflection nebo CDI extension).
- [ ] Setter injection — flexibilní.
  > Lepší než field, ale stále horší než constructor — pole nemůže být `final` a třída umožňuje stav „bez nastavené závislosti".
:::

---

*Zdroj: přednášky PIS — doc. R. Burget, VUT FIT, část „Implementace business operací" v přednášce „Business vrstva a aplikační rozhraní" (slidy 1–10).*
