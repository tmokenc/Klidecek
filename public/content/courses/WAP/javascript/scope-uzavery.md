---
title: Rozsahy platnosti a uzávěry
---

Rozsah platnosti (*scope*) určuje, kde je proměnná v kódu **viditelná**. JavaScript používá **lexikální** (statické) scoping: viditelnost je dána **fyzickým umístěním** deklarace ve zdrojovém textu a je rozhodnuta už při kompilační fázi — ne až za běhu, ne podle toho, *odkud* je funkce volána.

## Scope chain a shadowing

Když engine narazí na čtení proměnné, hledá ji v **řetězci rozsahů platnosti** (*scope chain*): začne v nejvnitřnějším (aktuálním) prostředí a postupuje směrem k vnějším, dokud proměnnou nenajde nebo nedojde do globálního scope. Nenajde-li ji ani tam, je výsledkem `ReferenceError` (čtení), resp. vznik globální proměnné (zápis v nestriktním režimu).

Vnitřní deklarace se stejným jménem **překryje** (zastíní) stejnojmennou proměnnou z vnějšího rozsahu — *variable shadowing*. Vnitřní funkce na vnější proměnnou „nedohlédne", dokud ji sama nepřekrývá.

```js
const name = "globální";

function outer() {
  const name = "z outer";    // zastiňuje globální `name`
  function inner() {
    const local = "z inner";
    console.log(local);  // "z inner"   — vlastní scope
    console.log(name);   // "z outer"   — nejbližší nadřazený scope
  }
  inner();
}
outer();
```

::: svg "Scope chain — vyhledávání proměnné stoupá od vnitřního prostředí k vnějšímu"
<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="340" height="180" rx="8" fill="var(--bg-inset)" stroke="var(--line)"/>
  <text x="22" y="28" font-size="11" font-weight="600" fill="var(--text-muted)">global</text>
  <text x="22" y="44" font-size="11" font-family="monospace" fill="var(--text-faint)">name = "globální"</text>
  <rect x="40" y="54" width="300" height="120" rx="7" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="52" y="72" font-size="11" font-weight="600" fill="var(--text-muted)">outer()</text>
  <text x="52" y="88" font-size="11" font-family="monospace" fill="var(--text-faint)">name = "z outer"</text>
  <rect x="70" y="98" width="252" height="64" rx="6" fill="var(--bg-inset)" stroke="var(--accent)"/>
  <text x="82" y="116" font-size="11" font-weight="600" fill="var(--accent)">inner()</text>
  <text x="82" y="132" font-size="11" font-family="monospace" fill="var(--text)">local = "z inner"</text>
  <text x="82" y="150" font-size="10.5" font-family="monospace" fill="var(--text-muted)">čte name →</text>
  <path d="M 196 146 L 196 92" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="3 3" marker-end="url(#scarr)"/>
  <text x="230" y="120" font-size="9.5" fill="var(--text-faint)">najde v outer</text>
  <defs>
    <marker id="scarr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 Z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

## var vs. let / const

Deklarace se liší **rozsahem platnosti** a chováním při **hoistingu**.

| | `var` | `let` / `const` |
|---|---|---|
| Rozsah | funkční (*function-scoped*) | blokový (*block-scoped*) |
| Hoisting | ano — vynesena a inicializována na `undefined` | ano — vynesena, ale **neinicializována** |
| Přístup před deklarací | `undefined` (žádná chyba) | `ReferenceError` (TDZ) |
| Redeklarace ve stejném scope | povolena | `SyntaxError` |
| `const` přiřazení | — | jen jednou; vazbu nelze změnit |

**`var`** je *function-scoped*: ignoruje bloky (`if`, `for`) a „prosakuje" z nich ven do celé funkce. Při hoistingu se deklarace vynese na začátek funkce **a rovnou inicializuje na `undefined`** — proto čtení před řádkem deklarace vrací `undefined`, ne chybu.

**`let`** a **`const`** jsou *block-scoped* (platné jen ve `{ }` bloku, kde stojí). Také se hoistují, ale **bez inicializace** — pouze se „zaregistruje" jejich existence. Zóna od začátku bloku po řádek deklarace se jmenuje **Temporal Dead Zone (TDZ)**; přístup v ní vyhodí `ReferenceError`. TDZ záměrně proměňuje tichý `undefined` v hlasitou chybu.

```js
function ukazka() {
  console.log(a);  // undefined — var je hoistnutá a inicializovaná
  console.log(b);  // ReferenceError — b je v TDZ

  var a = 1;
  let b = 2;

  if (true) {
    var c = "var prosakuje";   // function-scoped
    let d = "let zůstává v bloku";
  }
  console.log(c);  // "var prosakuje"
  console.log(d);  // ReferenceError — d žije jen uvnitř if-bloku
}
```

### const váže referenci, ne hodnotu

`const` zakazuje **změnu vazby** (rebinding) proměnné — nelze ji přiřadit jinou hodnotu. **Nezamyká ale obsah** odkazovaného objektu nebo pole: vnitřek je dál měnitelný (*mutable*). U primitiv je rozdíl neviditelný (jsou stejně neměnná), u objektů je zásadní.

```js
const obj = { text: "ahoj" };
obj.text = "změněno";    // OK — měníme obsah, ne vazbu
obj.lang = "cs";         // OK — přidání vlastnosti
obj = {};                // TypeError — pokus o rebinding vazby

const arr = [1, 2];
arr.push(3);             // OK — [1, 2, 3]
```

Pro skutečné zmrazení obsahu slouží `Object.freeze(obj)`.

## Uzávěry (closures)

**Uzávěr** vzniká kombinací **funkce** a jejího **lexikálního prostředí** — tedy odkazů na proměnné rozsahů, ve kterých byla funkce *definována*. Vnitřní funkce si tak **pamatuje a nadále má přístup** ke svému vnějšímu rozsahu i poté, co vnější funkce skončila. V JavaScriptu tvoří uzávěr **každá** funkce automaticky.

Klíčové pro správné pochopení: uzávěr drží **živé propojení** (*live link*) na reálné místo v paměti, **ne snímek** (snapshot) hodnoty. Když se proměnná v uzávřeném prostředí změní, vnitřní funkce vidí novou hodnotu.

```js
function citac() {
  let x = 0;
  return function () {
    x++;             // čte a mění tutéž proměnnou x
    return x;
  };
}
const next = citac();
next();   // 1
next();   // 2   — x mezi voláními přežívá; není to snímek "0"
```

### Uzávěry a Garbage Collector

Lokální proměnné vnější funkce by normálně byly po jejím skončení uvolněny z paměti. Pokud ale existuje vnitřní funkce, která na ně odkazuje, a tato funkce **přežije** vnější volání (je vrácena `return`em, zaregistrována jako event listener, předána jako callback), **uzávěr drží její lexikální prostředí naživu** — Garbage Collector tyto proměnné neuvolní, dokud je dosažitelná samotná vnitřní funkce.

::: viz wap-closure-counter "Vytvoř dvě nezávislé instance čítače. Každá si drží vlastní soukromé x — uzávěr je živé propojení, ne snímek."
:::

### Praktická využití {tier=practice}

* **Soukromé proměnné / enkapsulace** — proměnná uvnitř uzávěru je nedosažitelná zvenčí, přístup jen přes vrácené funkce.
* **Továrny na funkce** (*function factories*) — funkce generující funkce předkonfigurované zachycenými hodnotami.
* **Currying** — postupné dosazování argumentů přes vnořené uzávěry.
* **Asynchronní callbacky a event listenery** — handler se spustí dlouho po skončení registrující funkce a díky uzávěru si pamatuje stav z okamžiku vzniku (např. `id` tlačítka), aniž by se znečišťoval globální prostor.

```js
// Továrna na funkce: každý "adder" si drží vlastní zachycené n
function adder(n) {
  return (x) => x + n;     // uzávěr nad n
}
const plus5  = adder(5);
const plus10 = adder(10);
plus5(1);   // 6
plus10(1);  // 11  — nezávislé prostředí
```

Klasický chyták spojuje uzávěr s `var` ve smyčce: protože `var` je function-scoped, **všechny** callbacky sdílejí jednu a tutéž proměnnou, a uvidí proto její *konečnou* hodnotu. `let` (block-scoped) vytvoří v každé iteraci **novou** vazbu, takže každý callback uzavře vlastní hodnotu.

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i));   // 3, 3, 3 — sdílené var i
}
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j));   // 0, 1, 2 — nové j v každé iteraci
}
```

::: quiz "Proč první smyčka s `var` vytiskne `3, 3, 3` a druhá s `let` vytiskne `0, 1, 2`?"
- [x] `var` je function-scoped — existuje jen jedno `i`, které uzávěry sdílejí a vidí jeho konečnou hodnotu; `let` vytvoří v každé iteraci novou vazbu.
  > Přesně. Uzávěr drží živé propojení na proměnnou, ne snímek. S jediným sdíleným `i` všechny callbacky čtou tutéž buňku (po skončení smyčky = 3). `let` dává každé iteraci vlastní `j`.
- [ ] `setTimeout` u `let` běží synchronně, u `var` asynchronně.
  > `setTimeout` je v obou případech asynchronní. Rozdíl je v rozsahu platnosti proměnné, ne v časování.
- [ ] `var` zachytí snímek hodnoty, `let` živé propojení.
  > Naopak — oba zachytávají živé propojení. Liší se počet proměnných: jedna sdílená vs. nová v každé iteraci.
:::

::: link "MDN — Closures" "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures"
:::

::: link "MDN — let (Temporal Dead Zone)" "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let#temporal_dead_zone_tdz"
:::

::: link "MDN — Hoisting" "https://developer.mozilla.org/en-US/docs/Glossary/Hoisting"
:::

---

*Zdroj: SZZ NADE — předmět Internetové aplikace, VUT FIT. Externí reference: MDN Web Docs, ECMAScript Language Specification (TC39).*
