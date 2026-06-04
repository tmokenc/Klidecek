---
title: Asynchronní programování
---

Asynchronní kód v JavaScriptu prošel zřetelnou evolucí: od prostých *callbacků* přes *Promises* až k modernímu syntaktickému cukru *async/await*. Všechny tři přístupy běží nad toutéž smyčkou událostí — liší se jen v tom, jak čitelně zapisují *co se má stát, až operace doběhne*.

## Callbacks a „callback hell"

Nejstarší vzor: funkci předáme *zpětné volání* (callback), které se zavolá po dokončení operace. U jediné operace je to v pořádku. Jakmile ale potřebujeme operace **řetězit** (po stažení dat je zpracovat, pak uložit, pak oznámit), callbacky se zanořují do sebe a vznikne těžko čitelná „pyramida zkázy" — *callback hell*. Chybové stavy se přitom musí ošetřovat v každé úrovni zvlášť.

```js
// Callback hell — odsazení roste s každou další operací
nactiUzivatele(id, (err, user) => {
  if (err) return zpracujChybu(err);
  nactiObjednavky(user, (err, orders) => {
    if (err) return zpracujChybu(err);
    nactiPolozky(orders, (err, items) => {
      if (err) return zpracujChybu(err);
      zobraz(items);            // … a takhle to roste donekonečna
    });
  });
});
```

## Promises

`Promise` je objekt reprezentující **budoucí výsledek** asynchronní operace. Je v jednom ze tří stavů: *pending* (čeká), *fulfilled* (splněn s hodnotou) nebo *rejected* (zamítnut s chybou). Jakmile přejde z *pending* do koncového stavu, už ho nezmění (je *settled*). Na výsledek se reaguje metodami `.then(onFulfilled)`, `.catch(onRejected)` a `.finally()`, které se dají **řetězit naplocho** — každá vrací nový Promise.

```js
nactiUzivatele(id)
  .then(user  => nactiObjednavky(user))
  .then(orders => nactiPolozky(orders))
  .then(items => zobraz(items))
  .catch(zpracujChybu);            // jediné místo pro chybu z celého řetězce
```

Callbacky předané do `.then`/`.catch` se neprovedou ihned — zařadí se do **fronty mikroúloh** a smyčka je odbaví v nejbližším microtask checkpointu.

## async/await

`async/await` je syntaktický cukr nad Promises: zápis vypadá jako synchronní, ale neblokuje vlákno. Funkce označená `async` vždy vrací Promise; `await` *pozastaví* její běh, dokud se awaitovaný Promise nevyřeší, a vrátí jeho hodnotu (nebo vyhodí jeho chybu, takže lze použít `try/catch`).

```js
async function nactiVse(id) {
  try {
    const user   = await nactiUzivatele(id);
    const orders = await nactiObjednavky(user);
    const items  = await nactiPolozky(orders);
    zobraz(items);
  } catch (err) {
    zpracujChybu(err);
  }
}
```

Klíčové je pochopit, **že `await` funkci rozdělí.** Kód *před* prvním `await` běží synchronně až do něj. Na `await` se funkce vrátí volajícímu (uvolní zásobník) a **veškerý kód za `await` se chová jako callback v `.then` — naplánuje se jako mikroúloha** poté, co se awaitovaný Promise vyřeší. Funkce tedy neběží „v kuse"; je to stavový automat poskládaný z mikroúloh.

## Priorita: mikroúlohy před makroúlohami

Toto je nejčastěji zkoušená past. Protože smyčka v každé otáčce vyprázdní *celou* frontu mikroúloh, **vykoná se `.then` (resp. kód po `await`) dříve než `setTimeout(…, 0)`** — i když měl časovač nulové zpoždění. `setTimeout` je makroúloha; ta přijde na řadu až po kompletním microtask checkpointu.

```js
console.log("start");

setTimeout(() => console.log("timeout (makroúloha)"), 0);

Promise.resolve()
  .then(() => console.log("then (mikroúloha)"));

(async () => {
  await null;                              // funkce se zde rozdělí
  console.log("po await (mikroúloha)");
})();

console.log("end");

// Výpis: start, end, then (mikroúloha), po await (mikroúloha), timeout (makroúloha)
```

::: viz wap-microtask-queue "Postav scénář ze synchronního kódu, Promise.then a setTimeout(0) a sleduj, v jakém pořadí se výpisy objeví. Mikroúlohy předbíhají časovač."
:::

## Hladovění mikroúlohami (zamrznutí UI)

Síla mikroúloh je zároveň jejich rizikem. Microtask checkpoint **nedovolí smyčce pokračovat, dokud není fronta mikroúloh prázdná.** Pokud mikroúloha naplánuje další mikroúlohu, a ta zase další (rekurzivně), fronta se nikdy nevyprázdní — smyčka se *zasekne* před krokem render i před makroúlohami. Výsledkem je *hladovění* (*microtask starvation*): UI přestane reagovat na vstup a vykreslování, prohlížeč „zamrzne", přestože hlavní vlákno horečně pracuje.

```js
// ⚠ NEDĚLAT — nekonečná smyčka mikroúloh: render ani makroúlohy se nikdy nedostanou ke slovu
function hlad() {
  Promise.resolve().then(hlad);   // každá mikroúloha naplánuje další
}
hlad();                            // UI zamrzne, ač je „kód jen asynchronní"

// Bezpečnější: dlouhou práci krájet na makroúlohy, mezi nimi smyčka může renderovat
function poDavkach(zbyva) {
  if (zbyva <= 0) return;
  /* … kousek práce … */
  setTimeout(() => poDavkach(zbyva - 1), 0);   // makroúloha → mezi nimi render
}
```

Rekurze přes `setTimeout` (makroúlohy) tento problém nemá: mezi každými dvěma makroúlohami smyčka stihne microtask checkpoint *i* render, takže UI zůstává responzivní.

## Srovnání s C# / .NET (TPL) {tier=extra}

V C# stojí asynchronní programování na *Task Parallel Library*. `Task`y se často odbavují **paralelně** z thread poolu na více vláknech — to je principiální rozdíl proti jednovláknovému JS. S tím souvisí i odlišný způsob, jak se dá čekat na výsledek.

| | JavaScript | C# / .NET (TPL) |
|---|---|---|
| Model souběhu | jedno vlákno + smyčka událostí | thread pool, skutečná paralelita |
| Čekání na výsledek | `await` (neblokuje vlákno) | `await`, *nebo* `.Wait()` / `.Result` (**blokuje** vlákno) |
| Blokující čekání | jazyk ho neumožňuje | `.Wait()` může vést k **deadlocku** |

V C# lze vlákno *natvrdo zablokovat* do vyřešení úkolu zavoláním `.Wait()` nebo čtením `.Result`. Pokud se to udělá na vlákně, na které se má daný `Task` vrátit (klasicky UI vlákno se `SynchronizationContext`em), vznikne **deadlock**: vlákno čeká na dokončení tasku, ale task čeká, až se uvolní totéž vlákno. JavaScript tuto třídu chyb ze své podstaty nemá — **blokující čekání na hlavním vlákně neumožňuje**. `await` vždy jen pozastaví danou funkci a vrátí řízení smyčce; hlavní vlákno tak zůstává volné pro další události.

::: quiz "Co se vypíše dřív: callback v `setTimeout(fn, 0)`, nebo `.then` na již vyřešeném Promise — a proč?"
- [x] `.then`, protože je to mikroúloha a ty se vyprazdňují celé před každou makroúlohou.
  > Správně. `setTimeout(…,0)` je makroúloha; smyčka nejdřív dokončí microtask checkpoint (všechny `.then`), teprve pak vezme jednu makroúlohu.
- [ ] `setTimeout`, protože má nulové zpoždění a běží okamžitě.
  > Nulové zpoždění neznamená „hned" — je to spodní mez, a navíc makroúloha čeká za celou frontou mikroúloh.
- [ ] Záleží na pořadí zápisu v kódu.
  > Pořadí zápisu zde nerozhoduje; rozhoduje typ úlohy (mikro vs makro) a jejich priorita.
:::

::: link "MDN — Using promises" "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises"
:::

::: link "MDN — await" "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await"
:::

::: link "Microsoft Learn — Async programming: Avoid blocking (don't block on async code)" "https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/"
:::

---

### Videa

::: youtube "https://www.youtube.com/watch?v=vn3tm0quoqE" "The Async Await Episode I Promised" "Fireship"
:::

*Zdroj: SZZ NADE — předmět WAP — Internetové aplikace, VUT FIT. Externí reference: MDN Web Docs, ECMAScript Language Specification, Microsoft Learn (.NET TPL).*
