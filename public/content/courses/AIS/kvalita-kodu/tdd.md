---
title: Návrh řízený testem (TDD)
---

**Návrh řízený testem** (*Test-Driven Development*, TDD) obrací obvyklé pořadí činností: nejdřív vznikne automatizovaný test popisující požadované chování a teprve potom kód, který ho splní. Vývoj postupuje v malých, neustále se opakujících krocích, kde každý cyklus přidá jen kousek funkčnosti. TDD vzniklo jako jedna z praktik *Extreme Programming* a je dnes běžnou součástí agilních metodik.

Klíčové je, že test se píše **dřív, než existuje implementace**. Tím se z testu stává specifikace — vývojář musí ještě před psaním kódu odpovědět na otázku „jak poznám, že to funguje?", což ho nutí ujasnit si rozhraní a očekávané chování komponenty.

## Cyklus red-green-refactor

Srdcem TDD je krátká smyčka tří fází. Jeden průchod by měl trvat řádově **minuty** (Kent Beck mluví o „baby steps"); pokud se vývojář ve fázi *red* nebo *green* zdrží přes deset minut, vzal si příliš velký krok a má ho rozdělit.

::: viz ais-tdd-cycle "Proklikej fáze cyklu. Po dokončení refaktoru začíná nový cyklus a sada testů se rozrůstá."
:::

1. **Red** — napiš selhávající test. Test popisuje malý kousek chování, které kód ještě nemá. Spustí se a *musí* selhat. Selhání není formalita: ověřuje, že test skutečně něco testuje a že funkcionalita opravdu chybí.
2. **Green** — napiš minimální kód. Doplní se co nejjednodušší implementace, která test rozsvítí na zeleno. V této fázi je povolené i „ošklivé" řešení — jediným kritériem je, že test prochází.
3. **Refactor** — vyčisti kód. Se zelenou sadou testů jako záchrannou sítí se odstraní duplicity, zlepší se pojmenování a struktura. Vnější chování zůstává stejné a testy musí zůstat zelené po každé úpravě.

Nejčastější chybou je vynechání třetí fáze. Bez průběžného refaktoru z TDD zůstane jen rostoucí hromada nahodile poslepovaných fragmentů.

## Worked example — kalkulátor (JUnit) {tier=example}

Ukázka jednoho cyklu pro metodu `add`. Nejdřív test, který se odkazuje na neexistující kód (nezkompiluje se / selže — fáze **red**):

```java
@Test
void scitaDveCisla() {
    Calculator c = new Calculator();
    assertEquals(5, c.add(2, 3));   // Calculator.add zatím neexistuje → RED
}
```

Minimální implementace, která test rozsvítí na zeleno (fáze **green**):

```java
public class Calculator {
    public int add(int a, int b) {
        return a + b;          // nejjednodušší kód, který projde
    }
}
```

Teprve teď, se zeleným testem, lze beze strachu vyčistit strukturu — to je fáze **refactor**. Další chování (odčítání, dělení nulou) přidá až nový cyklus s vlastním testem.

## Přínos pro kvalitu softwaru

Hlavním výstupem TDD je **neustále se rozšiřující sada automatizovaných testů**, která funguje jako *regresní záchranná síť*. Při každé pozdější změně testy okamžitě odhalí, jestli se něco rozbilo — to dává vývojářům důvěru zasahovat do kódu a refaktorovat ho, místo aby se cizího nebo staršího kódu báli dotknout.

Druhým přínosem je **lepší návrh rozhraní**. Protože se test píše dřív než implementace, vývojář se na komponentu dívá zvnějšku, očima jejího volajícího. Špatně navržené, těžko testovatelné API se projeví už při psaní testu — testovatelnost a dobrý návrh (volná provázanost, jasné zodpovědnosti) jdou ruku v ruce.

| Aspekt | Přínos TDD | Související riziko / nevýhoda |
|---|---|---|
| Regrese | testy zachytí rozbití při změně | testy je nutné udržovat spolu s kódem |
| Návrh API | rozhraní vzniká z pohledu volajícího | nevynucuje dobrou architekturu samo o sobě |
| Tempo | rychlejší ladění, méně manuálního testování | počáteční zpomalení, režie na psaní testů |
| Spolehlivost | provedené testy dokumentují chování | chyba v testu může předstírat funkčnost |

## Nevýhody a hranice

TDD není zdarma. Na začátku **zpomaluje vývoj** — místo „jen napsat funkci" se píše funkce i test, a než si tým zvykne, působí to jako režie navíc. Návratnost přichází později, při údržbě a změnách.

Druhým rizikem jsou **chyby v testech samotných**. Test je také kód a může být napsaný špatně — testovat něco jiného, než vývojář zamýšlel, nebo projít i u vadné implementace. Zelená sada testů proto dává *důvěru úměrnou kvalitě testů*, ne absolutní jistotu. Sada testů, která se píše předem, navíc snadno sklouzne k testování implementačních detailů místo chování; takové testy se pak rozbíjejí při každém refaktoru, i když se chování nezměnilo.

::: quiz "Proč musí test ve fázi *red* skutečně selhat, než napíšeme implementaci?"
- [x] Selhání ověří, že test opravdu něco testuje a že funkcionalita zatím chybí.
  > Přesně. Kdyby test prošel ještě před napsáním kódu, testoval by buď něco jiného, nebo nic — zelená by byla falešná.
- [ ] Je to jen formalita, na pořadí kroků nezáleží.
  > Záleží. Bez ověřeného selhání nemáme jistotu, že nový test má vůbec nějakou výpovědní hodnotu.
- [ ] Aby se vynutil refaktor existujícího kódu.
  > Refaktor přichází až ve třetí fázi, se zelenou sadou testů. Fáze *red* slouží k validaci testu.
:::

::: link "Martin Fowler — Test Driven Development" "https://martinfowler.com/bliki/TestDrivenDevelopment.html"
:::

::: link "Kent Beck — Canon TDD" "https://tidyfirst.substack.com/p/canon-tdd"
:::

::: link "IBM — What is Test-Driven Development (TDD)?" "https://www.ibm.com/think/topics/test-driven-development"
:::

---

*Zdroj: SZZ NADE — předmět Analýza a návrh informačních systémů, VUT FIT. Externí reference: Kent Beck (Test-Driven Development by Example), Martin Fowler (martinfowler.com), IBM Think.*
