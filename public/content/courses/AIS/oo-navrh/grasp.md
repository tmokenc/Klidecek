---
title: Principy GRASP
---

**GRASP** (*General Responsibility Assignment Software Patterns / Principles*) je devět principů, které radí, **kam v objektovém návrhu přidělit zodpovědnost**. Neřeší syntaxi ani konkrétní vzory implementace — odpovídají na otázky typu *„která třída má počítat cenu objednávky?"*, *„kdo má vytvářet položku?"*, *„kdo má obsloužit požadavek z UI?"*, *„kam dát ukládání do databáze?"*. Cílem je vždy návrh s **nízkou vazbou** a **vysokou soudržností**.

Principy si ukážeme na jednoduchém **e-shopu** s třídami `Order`, `OrderLine`, `Product`, `Customer` a technickými třídami jako `PaymentGateway` či `ShippingMethod`.

::: viz ais-grasp-assign "Vyber otázku o zodpovědnosti — viz, který GRASP princip ji řeší a které třídě e-shopu zodpovědnost padne."
:::

## Information Expert

Zodpovědnost přiřaď třídě, která má **potřebná data** k jejímu splnění. Cenu objednávky má počítat ten, kdo zná položky — tedy `Order` (a mezisoučet počítá `OrderLine`, který zná produkt a počet).

```java
public class Order {
    private List<OrderLine> lines = new ArrayList<>();

    public double getTotalPrice() {            // Order zná své položky
        double total = 0;
        for (OrderLine line : lines) total += line.getSubtotal();
        return total;
    }
}

public class OrderLine {
    private Product product;
    private int quantity;

    public double getSubtotal() {               // OrderLine zná produkt a počet
        return product.getPrice() * quantity;
    }
}
```

Anti-vzor: `OrderService.calculateTotal(order)`, který „leze" přes gettery do položek a produktů — to je porušení experta i zapouzdření.

## Creator

Kdo má **vytvářet** objekt `A`? Třída `B`, pokud `B` agreguje/obsahuje `A`, úzce s `A` spolupracuje, zaznamenává `A` nebo má **inicializační data** pro `A`. Objednávka obsahuje položky, takže `OrderLine` vytváří `Order`:

```java
public class Order {
    private List<OrderLine> lines = new ArrayList<>();

    public void addProduct(Product product, int quantity) {
        lines.add(new OrderLine(product, quantity)); // tvorba schovaná uvnitř vlastníka
    }
}
```

Lepší než nechat vznikat `new OrderLine(...)` „venku" a pak ji ručně přidávat do seznamu — vytváření patří k tomu, kdo položku vlastní.

## Controller

První objekt **za vrstvou UI/API**, který zachytí systémovou operaci, **koordinuje** ji a deleguje dál. Sám nedělá složitou logiku (ceny, validace, DB, e-maily) — tu předá aplikační službě.

```java
@RestController
public class OrderController {
    private final OrderService orderService;
    public OrderController(OrderService s) { this.orderService = s; }

    @PostMapping("/orders")
    public OrderDto createOrder(@RequestBody CreateOrderRequest req) {
        return orderService.createOrder(req);   // jen přijme a deleguje
    }
}
```

Existují dvě varianty: **fasádní controller** (jeden objekt za celý systém/subsystém — vhodný při málo operacích) a **use-case controller** (jeden controller na případ užití — drží controllery lehké, když je operací mnoho).

## Low Coupling

**Hodnotící** princip: přiděluj zodpovědnosti tak, aby závislosti mezi třídami byly co nejmenší. Místo přímé vazby na `StripePaymentGateway` závisí `OrderService` na rozhraní `PaymentGateway`:

```java
public interface PaymentGateway { void pay(double amount); }

public class OrderService {
    private final PaymentGateway gateway;       // závislost na abstrakci
    public OrderService(PaymentGateway g) { this.gateway = g; }
    public void pay(Order order) { gateway.pay(order.getTotalPrice()); }
}
```

Záměna Stripe za PayPal pak nevyžaduje zásah do `OrderService`. Nízká vazba chrání systém při změnách.

## High Cohesion

**Hodnotící** princip: třída se má soustředit na **jeden úzce související soubor úkolů** a nebýt přetížená. „Bůh-třída" `OrderService`, která tvoří objednávky, platí, generuje PDF faktury, posílá e-maily *a* ukládá do DB, má nízkou soudržnost. Rozdělíme ji:

```java
public class OrderService   { /* logika objednávky */ }
public class PaymentService { /* logika platby */ }
public class InvoiceService { /* generování faktury */ }
public class EmailService   { /* odeslání potvrzení */ }
```

Low Coupling a High Cohesion jdou ruku v ruce — jsou to dvě měřítka kvality, podle kterých posuzujeme všechna ostatní rozhodnutí.

## Polymorphism

Když se chování **liší podle typu**, neřeš to obřím `if`/`switch`, ale **polymorfní metodou** v jednotlivých typech. Sleva podle typu zákazníka:

```java
public interface DiscountPolicy { double calculateDiscount(double price); }
public class StudentDiscount implements DiscountPolicy {
    public double calculateDiscount(double price) { return price * 0.10; }
}
public class VipDiscount implements DiscountPolicy {
    public double calculateDiscount(double price) { return price * 0.20; }
}
```

Nový typ slevy = nová třída, **žádný zásah** do existujícího kódu (přímá vazba na princip Open/Closed v [[solid]]).

## Pure Fabrication

Někdy je potřeba **umělá třída**, která neodpovídá ničemu z domény, ale zlepší návrh — typicky kvůli udržení vysoké soudržnosti a nízké vazby u doménových tříd. `OrderRepository` (ukládání do DB) není „reálná věc" e-shopu, ale dáme-li `save()` přímo do `Order`, smícháme doménu s perzistencí:

```java
public class OrderRepository {                  // čistá fabrikace
    public void save(Order order)   { /* uložení do DB */ }
    public Order findById(long id)  { /* načtení z DB */ }
}
```

`Order` tak zůstává čistě doménový a perzistence je v oddělené technické třídě.

## Indirection

Aby dvě části systému nebyly propojeny **přímo**, vlož mezi ně **prostředníka**. Místo aby `OrderService` sahal rovnou na platební bránu, prochází přes `PaymentService`:

```java
public class PaymentService {                   // prostředník
    private final PaymentGateway gateway;
    public PaymentService(PaymentGateway g) { this.gateway = g; }
    public void pay(Order order) { gateway.pay(order.getTotalPrice()); }
}
public class OrderService {
    private final PaymentService payments;
    public void completeOrder(Order order) { payments.pay(order); }
}
```

Mezilehlý objekt rozpojí přímou vazbu — controller sám je vlastně případem indirekce mezi UI a doménovou logikou.

## Protected Variations

Identifikuj **body předvídatelné změny** a obklop je **stabilním rozhraním**, které ochrání zbytek systému. Způsob dopravy (Česká pošta, PPL, Zásilkovna, DPD, osobní odběr) se mění — schovej ho za `ShippingMethod`:

```java
public interface ShippingMethod { double calculatePrice(double weight); }
public class PplShipping implements ShippingMethod {
    public double calculatePrice(double weight) { return weight * 50; }
}
public class ZasilkovnaShipping implements ShippingMethod {
    public double calculatePrice(double weight) { return 79; }
}
```

Zbytek aplikace pracuje jen s `ShippingMethod`; konkrétní dopravce se může měnit či přibývat bez dopadu jinam. *Protected Variations* je „zastřešující" princip — Low Coupling, Polymorphism, Indirection i Pure Fabrication jsou jeho konkrétní techniky.

## Tahák — jakou otázku si položit {tier=extra}

| Princip | Otázka |
|---|---|
| Information Expert | Kdo má potřebná data? |
| Creator | Kdo má objekt vytvářet? |
| Controller | Kdo přijme požadavek z UI/API? |
| Low Coupling | Není třída moc závislá na jiných? |
| High Cohesion | Nedělá třída moc nesouvisejících věcí? |
| Polymorphism | Nemám tu zbytečný `if`/`switch` podle typu? |
| Pure Fabrication | Nemám vytvořit technickou pomocnou třídu? |
| Indirection | Nemám vložit prostředníka mezi dvě části? |
| Protected Variations | Co se bude měnit a jak to schovat za rozhraní? |

::: quiz "Ve třídě DiscountCalculator je velký if-else podle typu zákazníka (STUDENT/VIP/EMPLOYEE). Který GRASP princip ji má nahradit a jak?"
- [x] Polymorphism — chování závislé na typu přesunout do polymorfních tříd implementujících společné rozhraní.
  > Ano. Každý typ slevy se stane vlastní třídou s metodou `calculateDiscount`; nový typ = nová třída, ne úprava existujícího kódu.
- [ ] Information Expert — `if` přesunout do třídy, která má nejvíc dat.
  > Information Expert řeší, kde data leží, ne odstranění větvení podle typu. Tady je problém samotný `switch` na typ.
- [ ] Controller — větvení patří do controlleru za UI.
  > Controller jen deleguje; přesunout `switch` do controlleru problém nevyřeší, jen přesune. Řešením je polymorfismus.
:::

::: link "Wikipedia — GRASP (object-oriented design)" "https://en.wikipedia.org/wiki/GRASP_(object-oriented_design)"
:::
::: link "Larman — Applying UML and Patterns (kap. 17–18, GRASP)" "https://www.craiglarman.com/wiki/index.php?title=Books_by_Craig_Larman"
:::

*Zdroj: SZZ NADE — předmět Analýza a návrh informačních systémů, VUT FIT. Externí reference: Larman (Applying UML and Patterns), Wikipedia.*
