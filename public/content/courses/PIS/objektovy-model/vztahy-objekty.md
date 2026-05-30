---
title: Vztahy mezi objekty — 1:1, 1:N, inverzní
---

Vztahy umožňují **odkazovat z jedné strukturované hodnoty (*vlastníka*) na jinou (*člena*)**. To je v objektovém modelu klíčové — vyjadřujeme tím vazby jako *zákazník má objednávky*, *kniha má autory*, *pracovník patří do oddělení*. Na rozdíl od relačního modelu, kde se vztahy vytvářejí *až při dotazu* (JOIN), objektový model vztahy **ukládá přímo ve struktuře**.

Pro vyjádření vztahu potřebujeme datový typ, který **jednoznačně identifikuje cílovou strukturu** — to je [[objektovy-model-prehled|OID]] (*Object Identifier*).

## Dvě cesty: vnoření vs. odkaz

Vlastnost, jejíž hodnotou je *strukturovaná data*, může být implementována dvěma způsoby. Slidy přednášky shrnují čtyři kombinace, lišící se podle kardinality a podle toho, jestli je člen *prostá struktura* (vnořená) nebo *objekt* (odkazovaný přes OID):

::: svg "Čtyři kombinace: vnoření vs. odkaz × jeden vs. mnoho"
<svg viewBox="0 0 520 180" xmlns="http://www.w3.org/2000/svg">
  <text x="260" y="18" text-anchor="middle" font-size="13" font-weight="600" fill="var(--text)">Vlastník — typ člena: vnořený vs. odkazovaný</text>
  <rect x="10" y="32" width="245" height="135" rx="6" fill="oklch(0.62 0.14 200 / 0.08)" stroke="oklch(0.62 0.14 200)"/>
  <text x="132" y="52" text-anchor="middle" font-size="12" font-weight="600" fill="oklch(0.40 0.14 200)">VNOŘENÍ — Data=Value</text>
  <text x="22" y="74" font-size="12" fill="var(--text)">1.  Jediná struktura uvnitř</text>
  <text x="38" y="90" font-size="11" fill="var(--text-muted)">→ hierarchie struktur</text>
  <text x="22" y="112" font-size="12" fill="var(--text)">2.  Kolekce struktur</text>
  <text x="38" y="128" font-size="11" fill="var(--text-muted)">→ hierarchie s kolekcemi</text>
  <text x="22" y="152" font-size="11" font-style="italic" fill="var(--text-muted)">= kompozice (žije s vlastníkem)</text>
  <rect x="265" y="32" width="245" height="135" rx="6" fill="oklch(0.62 0.14 22 / 0.08)" stroke="oklch(0.62 0.14 22)"/>
  <text x="387" y="52" text-anchor="middle" font-size="12" font-weight="600" fill="oklch(0.42 0.14 22)">ODKAZ — Data=Ref</text>
  <text x="277" y="74" font-size="12" fill="var(--text)">3.  Jediný objekt přes OID</text>
  <text x="293" y="90" font-size="11" fill="var(--text-muted)">→ vztah 1:1</text>
  <text x="277" y="112" font-size="12" fill="var(--text)">4.  Kolekce objektů přes OID</text>
  <text x="293" y="128" font-size="11" fill="var(--text-muted)">→ vztah 1:N</text>
  <text x="277" y="152" font-size="11" font-style="italic" fill="var(--text-muted)">= asociace (žije nezávisle)</text>
</svg>
:::

## Vztah 1:1

Vlastník `B` má vlastnost `C` typu odkaz na objekt typu `TypD`. V přednáškové notaci `concept`:

```
concept TypD [Data=Ref]                -- TypD je objektový typ s OID
    properties …
end concept

concept TypB
    properties
        C: integer                     -- prostá hodnota
        D: TypD                        -- odkaz 1:1 na objekt typu TypD
end concept
```

Sémanticky to znamená:

* Z objektu `B` vede **jednoznačný odkaz** na **právě jeden** objekt typu `TypD`.
* Operace `B.D` vrátí daný objekt (resp. jeho proxy); operace `B.D.cokoliv` umožní pokračovat v navigaci přes vlastnosti cíle.
* Cíl není „vlastnictví" — týž objekt může být odkazován z jiných objektů.

```
   [B objekt]                        [D objekt]
   +-------+                         +-------+
   | A:int |                         | X:int |
   | C:int |          ──▶            | Y:str |
   | D     |─ OID ─▶  navigace       | Z:Y   |
   +-------+                         +-------+
       \                              extent[D]
        \____ B žije zde,           ─────────
              D žije zde            [D, …, …]
```

## Vztah 1:N

Místo *jednoho* odkazu drží vlastník **kolekci odkazů** na cílové objekty:

```
concept TypYB [Data=Ref]                -- objektový typ s OID
    properties …
end concept

concept Vlastnik
    properties
        A: integer
        B: TypYB                       -- kolekce odkazů; podle typu kolekce:
                                       --   List<TypYB> nebo Set<TypYB> apod.
end concept
```

Operace `item(B)` (přednášková notace) prochází jednotlivé prvky kolekce — to je *navigace po vztahu 1:N*. V Javě to bývá iterace `for (TypYB e : owner.getB()) …`.

Kardinality vyjadřujeme úmyslně **1:N**, ne *N:N* — pohlížíme z pohledu *vlastníka* (jeden vlastník, N členů). Vztah opačným směrem (z `TypYB` zpět na `Vlastnik`) řešíme přes **inverzi**.

## Inverzní vztahy

Často chceme, aby **vytvoření vztahu V z A na B** současně způsobilo **vytvoření vztahu W z B na A**, a *zrušení V* zrušilo i *W*. Tomu se říká **inverzní (obousměrný) vztah** a v notaci `concept` se vyjadřuje atributem `[Inverse=…]`:

```
concept A
    properties
        …
        V: B  [Inverse = W]            -- z A vede vztah V na B,
end concept                            -- a B má protisměrný vztah W zpět na A

concept B
    properties
        …
        W: A                           -- (může být i [Inverse = V] redundantně)
end concept
```

Sémantika:

* `a.V = b` (nastavit vztah z A na B) **automaticky** zařídí, že `b.W = a` (zpětný odkaz).
* `a.V = null` (zrušit) automaticky vyprázdní `b.W`.
* Databáze garantuje *konzistenci obou stran*.

### Tři typové kombinace inverze

::: svg "Tři možnosti inverzních vztahů — 1:1↔1:1, 1:N↔1:1, M:N (= 1:N↔1:N)"
<svg viewBox="0 0 520 170" xmlns="http://www.w3.org/2000/svg">
  <text x="87" y="18" text-anchor="middle" font-size="13" font-weight="600" fill="var(--text)">1:1 ↔ 1:1</text>
  <rect x="30" y="35" width="55" height="60" rx="5" fill="oklch(0.62 0.14 264 / 0.18)" stroke="oklch(0.62 0.14 264)"/>
  <text x="57" y="70" text-anchor="middle" font-size="14" font-weight="600" fill="var(--text)">A</text>
  <rect x="115" y="35" width="55" height="60" rx="5" fill="oklch(0.62 0.14 264 / 0.18)" stroke="oklch(0.62 0.14 264)"/>
  <text x="142" y="70" text-anchor="middle" font-size="14" font-weight="600" fill="var(--text)">B</text>
  <line x1="85" y1="65" x2="115" y2="65" stroke="var(--text)" stroke-width="1.4" marker-end="url(#a1)" marker-start="url(#a2)"/>
  <text x="100" y="120" text-anchor="middle" font-size="11" fill="var(--text-muted)">Manžel–Manželka</text>
  <text x="260" y="18" text-anchor="middle" font-size="13" font-weight="600" fill="var(--text)">1:N ↔ 1:1</text>
  <rect x="205" y="40" width="55" height="50" rx="5" fill="oklch(0.62 0.14 22 / 0.18)" stroke="oklch(0.62 0.14 22)"/>
  <text x="232" y="71" text-anchor="middle" font-size="14" font-weight="600" fill="var(--text)">A</text>
  <rect x="290" y="32" width="44" height="22" rx="3" fill="oklch(0.62 0.14 22 / 0.18)" stroke="oklch(0.62 0.14 22)"/>
  <text x="312" y="48" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">B1</text>
  <rect x="290" y="58" width="44" height="22" rx="3" fill="oklch(0.62 0.14 22 / 0.18)" stroke="oklch(0.62 0.14 22)"/>
  <text x="312" y="74" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">B2</text>
  <rect x="290" y="84" width="44" height="22" rx="3" fill="oklch(0.62 0.14 22 / 0.18)" stroke="oklch(0.62 0.14 22)"/>
  <text x="312" y="100" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">B3</text>
  <line x1="260" y1="65" x2="290" y2="43" stroke="var(--text)" stroke-width="1.2" marker-end="url(#a1)"/>
  <line x1="260" y1="65" x2="290" y2="69" stroke="var(--text)" stroke-width="1.2" marker-end="url(#a1)"/>
  <line x1="260" y1="65" x2="290" y2="95" stroke="var(--text)" stroke-width="1.2" marker-end="url(#a1)"/>
  <text x="270" y="135" text-anchor="middle" font-size="11" fill="var(--text-muted)">Oddělení–Pracovníci</text>
  <text x="450" y="18" text-anchor="middle" font-size="13" font-weight="600" fill="var(--text)">M:N</text>
  <rect x="375" y="32" width="44" height="18" rx="3" fill="oklch(0.62 0.14 142 / 0.18)" stroke="oklch(0.62 0.14 142)"/>
  <text x="397" y="45" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">A1</text>
  <rect x="375" y="55" width="44" height="18" rx="3" fill="oklch(0.62 0.14 142 / 0.18)" stroke="oklch(0.62 0.14 142)"/>
  <text x="397" y="68" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">A2</text>
  <rect x="375" y="78" width="44" height="18" rx="3" fill="oklch(0.62 0.14 142 / 0.18)" stroke="oklch(0.62 0.14 142)"/>
  <text x="397" y="91" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">A3</text>
  <rect x="460" y="32" width="44" height="18" rx="3" fill="oklch(0.62 0.14 142 / 0.18)" stroke="oklch(0.62 0.14 142)"/>
  <text x="482" y="45" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">B1</text>
  <rect x="460" y="55" width="44" height="18" rx="3" fill="oklch(0.62 0.14 142 / 0.18)" stroke="oklch(0.62 0.14 142)"/>
  <text x="482" y="68" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">B2</text>
  <rect x="460" y="78" width="44" height="18" rx="3" fill="oklch(0.62 0.14 142 / 0.18)" stroke="oklch(0.62 0.14 142)"/>
  <text x="482" y="91" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">B3</text>
  <line x1="419" y1="41" x2="460" y2="64" stroke="var(--text)" stroke-width="0.7"/>
  <line x1="419" y1="41" x2="460" y2="87" stroke="var(--text)" stroke-width="0.7"/>
  <line x1="419" y1="64" x2="460" y2="41" stroke="var(--text)" stroke-width="0.7"/>
  <line x1="419" y1="64" x2="460" y2="87" stroke="var(--text)" stroke-width="0.7"/>
  <line x1="419" y1="87" x2="460" y2="64" stroke="var(--text)" stroke-width="0.7"/>
  <text x="440" y="135" text-anchor="middle" font-size="11" fill="var(--text-muted)">Autor–Kniha</text>
  <text x="260" y="160" text-anchor="middle" font-size="11" font-style="italic" fill="var(--text-faint)">U 1:N v Inverse uvádíme jméno kolekce → inverze vznikne s každým prvkem.</text>
  <defs>
    <marker id="a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="var(--text)"/></marker>
    <marker id="a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="var(--text)"/></marker>
  </defs>
</svg>
:::

### Příklad — adresát a jeho adresy

Klasický příklad z přednášky: osoba `PrvekSAdr` má kolekci adres, a každá adresa zpětně ví, ke kterému adresátovi patří.

```
concept PrvekSAdr / PrvkySAdr            -- jméno typu / jméno kolekce
    properties
        Adresat:    string
        Adresy:     Adresy    [Inverse = CiAdresa]    -- vztah 1:N
end concept

concept Adresa / Adresy
    properties
        Ucel:       DruhAdr
        CiAdresa:   PrvekSAdr [Inverse = Adresy]      -- vztah 1:1 zpět
        Adresat:    string
        ObsahAdr:   ObsahAdr
end concept
```

Význam: každá nová `Adresa`, kterou přidám do `osoba.Adresy`, *automaticky* dostane `adresa.CiAdresa = osoba`. Když ji z kolekce odeberu, `CiAdresa` se vyprázdní. Konzistence je věcí systému, ne aplikace.

## Pozor: pojem „referenční integrita" ≠ vztah

V relačním modelu se občas zaměňuje **vztah** s **referenční integritou** (FK constraint). To jsou ale dvě různé věci:

* **Referenční integrita** je *integritní omezení* — pravidlo „hodnota cizího klíče musí existovat jako primární klíč v cílové tabulce". Vynucuje se *při zápisu*, ale samotný **vztah jako struktura není uložen** — vzniká až `JOIN`em při dotazu.
* **Vztah** v objektovém modelu je *uložený graf* — odkaz přes OID. Databáze ho udržuje *přímo* a navigace po něm je `O(1)`.

V praxi se v relačním modelu *píší dotazy s JOINy*, zatímco v objektovém modelu se *naviguje po vztazích*.

::: link "ODMG 3.0 — definice OQL a vztahů s `inverse`" "https://en.wikipedia.org/wiki/Object_Query_Language"
:::

::: link "Wikipedia: Foreign key (referenční integrita ≠ vztah)" "https://en.wikipedia.org/wiki/Foreign_key"
:::

::: quiz "Vlastnost `D: TypD` ve struktuře. Co rozhoduje o tom, zda jde o vnoření nebo o odkaz?"
- [x] Anotace u typu D: `[Data=Value]` znamená vnoření (žije s vlastníkem), `[Data=Ref]` znamená odkaz přes OID (žije nezávisle).
  > Přesně. Identita objektu D nezávisí na názvu vlastnosti u vlastníka, ale na deklaraci typu D.
- [ ] Typ D musí být jiné třídy než vlastník — pak je to vždy odkaz.
  > Ne. I struktura jiného typu může být vnořena (jako prostá hodnota).
- [ ] Vždy je to odkaz, vnoření se v objektovém modelu nepoužívá.
  > Naopak — vnoření modeluje *kompozici* a v praxi se používá hojně (`@Embedded` v JPA, vnořené struktury v MongoDB apod.).
:::

::: quiz "Pokud u vztahu `Adresy: Adresy [Inverse = CiAdresa]` smažu jednu adresu z kolekce, co se stane s `CiAdresa` u smazaného objektu?"
- [x] Vyprázdní se — systém zajišťuje konzistenci obou stran inverzního vztahu.
  > Ano, to je celý smysl `[Inverse=…]`: změna jedné strany se automaticky propaguje na druhou.
- [ ] Zůstane ukazovat na původního vlastníka, nutno mazat ručně.
  > Ne — pokud bych měl udržovat konzistenci ručně, neměla by se anotace `Inverse` vůbec používat.
- [ ] Vrátí se chybový kód, dokud nepřidám adresu jinému adresátovi.
  > Vztah s null je zcela legitimní stav (adresa bez adresáta). Systém nevynucuje povinnost vztahu, jen jeho konzistenci.
:::

---

*Zdroj: přednášky PIS — prof. T. Hruška & doc. R. Burget, VUT FIT, přednáška „Objektový model dat", část „Struktura objektů, vztahy" a „Inverzní vztahy" (slidy 8–23).*
