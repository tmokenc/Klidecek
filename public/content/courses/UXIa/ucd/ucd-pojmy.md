---
title: Klíčové pojmy UCD
---

**Návrh zaměřený na uživatele** (User Centered Design, UCD) je strukturovaný, multidisciplinární a silně iterativní inženýrský přístup k vývoji interaktivních systémů. Jeho podstatou je, že potřeby, schopnosti, cíle a omezení koncových uživatelů stojí v centru každé fáze návrhu — ne až na konci jako kontrola, ale od první schůzky. Než se ponoříme do procesu a metod evaluace, je nutné přesně rozlišit několik pojmů, které zkoušející rád zaměňuje: použitelnost vs. UX vs. UI, mentální model vs. kognitivní zátěž a wireframe vs. prototyp.

## Použitelnost (usability) podle ISO 9241-11

Mezinárodní norma **ISO 9241-11** definuje použitelnost jako *míru, do jaké může specifikovaný uživatel produkt používat k dosažení specifikovaných cílů s **efektivností**, **účinností** a **spokojeností** ve specifikovaném **kontextu použití***.

Tři měřitelné složky — a u zkoušky se ptá hlavně na to, čím se liší:

| Složka | Anglicky | Co měří | Typická metrika |
|---|---|---|---|
| **Efektivnost** | effectiveness | přesnost a úplnost dosažení cíle | % úspěšně dokončených úkolů |
| **Účinnost** | efficiency | vynaložené zdroje vs. dosažený výsledek | čas, počet kroků, počet chyb |
| **Spokojenost** | satisfaction | komfort a přijatelnost pro uživatele | dotazník (např. SUS), hodnocení |

Klíčový poznatek normy: použitelnost **není vlastnost produktu samotného**, ale výsledek *interakce* konkrétního uživatele s produktem v konkrétním kontextu. Stejné rozhraní může být vysoce použitelné pro experta a nepoužitelné pro začátečníka. Proto je ve všech třech složkách slovo „specifikovaný" — bez určení uživatele, cíle a kontextu nelze použitelnost vůbec měřit.

::: svg "Tři složky použitelnosti podle ISO 9241-11 a jejich ukotvení v kontextu použití"
<svg viewBox="0 0 520 180" xmlns="http://www.w3.org/2000/svg">
  <rect x="14" y="12" width="492" height="156" rx="10" fill="var(--bg-inset)" stroke="var(--line)"/>
  <text x="260" y="32" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text-muted)">kontext použití (uživatel · cíl · prostředí · omezení)</text>
  <rect x="34" y="52" width="140" height="96" rx="8" fill="oklch(0.62 0.15 142 / 0.12)" stroke="oklch(0.55 0.16 142)"/>
  <text x="104" y="78" text-anchor="middle" font-size="13" font-weight="700" fill="oklch(0.4 0.16 142)">Efektivnost</text>
  <text x="104" y="98" text-anchor="middle" font-size="10.5" fill="var(--text)">dosáhne uživatel</text>
  <text x="104" y="113" text-anchor="middle" font-size="10.5" fill="var(--text)">cíle? (přesnost)</text>
  <text x="104" y="135" text-anchor="middle" font-size="9.5" font-family="var(--font-mono)" fill="var(--text-faint)">% úkolů</text>
  <rect x="190" y="52" width="140" height="96" rx="8" fill="oklch(0.62 0.15 80 / 0.12)" stroke="oklch(0.55 0.15 80)"/>
  <text x="260" y="78" text-anchor="middle" font-size="13" font-weight="700" fill="oklch(0.42 0.15 80)">Účinnost</text>
  <text x="260" y="98" text-anchor="middle" font-size="10.5" fill="var(--text)">za kolik zdrojů?</text>
  <text x="260" y="113" text-anchor="middle" font-size="10.5" fill="var(--text)">(úsilí, čas)</text>
  <text x="260" y="135" text-anchor="middle" font-size="9.5" font-family="var(--font-mono)" fill="var(--text-faint)">čas · kroky · chyby</text>
  <rect x="346" y="52" width="140" height="96" rx="8" fill="oklch(0.62 0.15 264 / 0.12)" stroke="oklch(0.55 0.16 264)"/>
  <text x="416" y="78" text-anchor="middle" font-size="13" font-weight="700" fill="oklch(0.42 0.16 264)">Spokojenost</text>
  <text x="416" y="98" text-anchor="middle" font-size="10.5" fill="var(--text)">jak se uživatel</text>
  <text x="416" y="113" text-anchor="middle" font-size="10.5" fill="var(--text)">cítí? (komfort)</text>
  <text x="416" y="135" text-anchor="middle" font-size="9.5" font-family="var(--font-mono)" fill="var(--text-faint)">dotazník SUS</text>
</svg>
:::

## UX vs. UI — co to NENÍ totéž

**User Experience (UX)** zahrnuje veškeré emoce, přesvědčení, preference, vjemy a fyzické i psychologické reakce uživatele **před, během i po** použití systému, produktu nebo služby. Je to celkový prožitek včetně očekávání, kontextu značky, snadnosti učení i pocitu po dokončení úkolu.

**User Interface (UI)** je naproti tomu **vizuální a interaktivní plocha** — tlačítka, ikony, typografie, barvy, layout, mikrointerakce. Je to *to, čeho se uživatel dotýká*, ale jen jeden ze vstupů do širšího prožitku.

Vztah lze shrnout takto: UI je podmnožina UX. Krásné UI ještě nezaručuje dobré UX (formulář může být esteticky dokonalý, ale ptát se na zbytečná pole). A naopak — i strohé rozhraní může poskytovat výborné UX, pokud rychle, spolehlivě a srozumitelně splní uživatelův cíl. ISO 9241-210 ostatně řadí *použitelnost* mezi nezbytné, nikoli postačující předpoklady dobrého UX.

::: svg "UX jako celkový prožitek; UI jako jeho vizuálně-interaktivní vrstva"
<svg viewBox="0 0 460 150" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="16" width="420" height="118" rx="12" fill="oklch(0.62 0.15 264 / 0.10)" stroke="oklch(0.55 0.16 264)"/>
  <text x="36" y="38" font-size="12" font-weight="700" fill="oklch(0.42 0.16 264)">UX — celkový prožitek</text>
  <text x="36" y="56" font-size="10" fill="var(--text-muted)">před · během · po použití · očekávání · emoce · důvěra</text>
  <rect x="250" y="62" width="172" height="58" rx="8" fill="oklch(0.62 0.15 22 / 0.14)" stroke="oklch(0.55 0.18 22)"/>
  <text x="336" y="84" text-anchor="middle" font-size="12" font-weight="700" fill="oklch(0.45 0.18 22)">UI</text>
  <text x="336" y="100" text-anchor="middle" font-size="9.5" fill="var(--text)">tlačítka · barvy</text>
  <text x="336" y="113" text-anchor="middle" font-size="9.5" fill="var(--text)">layout · ikony</text>
  <text x="46" y="100" font-size="10" fill="var(--text)">použitelnost</text>
  <text x="46" y="116" font-size="10" fill="var(--text)">přístupnost · obsah</text>
</svg>
:::

## Mentální modely a kognitivní zátěž

**Mentální model** je vnitřní představa uživatele o tom, jak systém funguje — vychází z jeho dřívějších zkušeností s podobnými systémy a z očekávání. Když uživatel vidí ikonu diskety, čeká „uložit"; když přetáhne soubor do koše, čeká smazání.

**Kognitivní zátěž** je množství mentálního úsilí, které musí uživatel vynaložit při práci s rozhraním. Klíčový vztah pro UCD: pokud se chování systému **neshoduje s mentálním modelem** uživatele (tzv. *gulf of execution/evaluation* podle D. Normana), vzniká **zbytečná kognitivní zátěž** — uživatel musí přemýšlet o ovládání místo o úkolu, dělá víc chyb a je frustrovaný. Cílem UCD je tedy návrh, který se mentálnímu modelu uživatele *přizpůsobuje*, ne který nutí uživatele učit se nový model systému. Odtud plyne řada Nielsenových heuristik (shoda s reálným světem, rozpoznání místo vybavování).

::: quiz "Aplikace má esteticky vytříbené, moderní UI, ale uživatelé v testu nedokáží najít tlačítko pro odeslání objednávky. Co o produktu platí?"
- [ ] Má dobré UX, protože UI je vizuálně kvalitní.
  > UI je jen vizuálně-interaktivní vrstva. Pěkné UI nezaručuje dobré UX — pokud uživatel nesplní cíl, prožitek je špatný.
- [x] Má špatné UX a zároveň nízkou efektivnost použitelnosti, přestože UI vypadá dobře.
  > Přesně. Efektivnost (dosažení cíle) selhává, tím trpí použitelnost i celkový prožitek (UX). UI ≠ UX.
- [ ] UX a použitelnost spolu nesouvisí, takže o UX to nic neříká.
  > Použitelnost je jedním z hlavních předpokladů dobrého UX (viz ISO 9241-210); selhání úkolu se do UX promítá přímo.
:::

## Persony

**Persona** je fiktivní postava reprezentující typického uživatele produktu. Vzniká na základě výzkumu a slouží týmu k *empatickému* pochopení cílové skupiny — místo abstraktního „uživatele" se navrhuje pro konkrétní „Janu, 34 let, manažerku bez času". Podle míry opory ve výzkumu rozlišujeme:

| Typ persony | Základ | Spolehlivost |
|---|---|---|
| **Proto-persona** | domněnky a zkušenost týmu, bez výzkumu | nejnižší — rychlý odhad pro start |
| **Kvalitativní persona** | rozhovory, pozorování (malý vzorek) | střední — bohatý vhled, menší reprezentativnost |
| **Statistická persona** | kvantitativní data, segmentace velkého vzorku | nejvyšší reprezentativnost |
| **Přístupnostní persona** | zahrnuje omezení uživatelů se zdravotním postižením | pomáhá nezapomenout na přístupnost |

Přístupnostní persona (např. nevidomý uživatel se čtečkou obrazovky, uživatel s motorickým postižením) systematicky nutí tým zohlednit přístupnost (WCAG) už při návrhu, ne až dodatečně.

## Wireframe vs. prototyp

Oba slouží návrhu rozhraní, ale liší se účelem a věrností:

* **Wireframe** (drátěný model) je vizualizace **základní kostry a struktury** stránky — rozmístění bloků, navigace, hierarchie informací. Záměrně postrádá barvy, finální typografii a grafické detaily, aby diskuse zůstala u struktury, ne u estetiky.
* **Prototyp** je pokročilejší, **často interaktivní** verze, na níž lze otestovat, zda aplikace plní cíle a je uživatelsky přívětivá. Má různé úrovně věrnosti (*fidelity*):
  * **low-fidelity** — papírové skici, klikací drátěnky;
  * **high-fidelity** — vizuálně i funkčně blízké hotovému produktu.

Pravidlo: čím dříve ve vývoji, tím nižší věrnost — levné papírové prototypy se testují a zahazují rychle, dokud změna nestojí téměř nic.

::: svg "Růst věrnosti a nákladů na změnu: od wireframu k high-fidelity prototypu"
<svg viewBox="0 0 500 150" xmlns="http://www.w3.org/2000/svg">
  <rect width="500" height="150" fill="var(--bg-inset)" rx="8"/>
  <line x1="30" y1="120" x2="470" y2="120" stroke="var(--line-strong)" stroke-width="1"/>
  <text x="470" y="138" text-anchor="end" font-size="9" font-family="var(--font-mono)" fill="var(--text-faint)">věrnost / náklad na změnu →</text>
  <rect x="44" y="84" width="92" height="30" rx="4" fill="none" stroke="var(--text-muted)" stroke-dasharray="3 3"/>
  <text x="90" y="103" text-anchor="middle" font-size="10" fill="var(--text-muted)">wireframe</text>
  <text x="90" y="74" text-anchor="middle" font-size="8.5" font-family="var(--font-mono)" fill="var(--text-faint)">kostra, bez barev</text>
  <rect x="176" y="64" width="100" height="50" rx="4" fill="oklch(0.62 0.15 80 / 0.12)" stroke="oklch(0.55 0.15 80)"/>
  <text x="226" y="86" text-anchor="middle" font-size="10" fill="var(--text)">low-fidelity</text>
  <text x="226" y="100" text-anchor="middle" font-size="9" fill="var(--text-muted)">papír / klikací</text>
  <rect x="316" y="40" width="140" height="74" rx="4" fill="oklch(0.62 0.15 142 / 0.14)" stroke="oklch(0.55 0.16 142)"/>
  <text x="386" y="64" text-anchor="middle" font-size="10" fill="var(--text)">high-fidelity</text>
  <text x="386" y="80" text-anchor="middle" font-size="9" fill="var(--text-muted)">vizuálně i funkčně</text>
  <text x="386" y="94" text-anchor="middle" font-size="9" fill="var(--text-muted)">blízké produktu</text>
</svg>
:::

::: link "ISO 9241-11:2018 — Usability: Definitions and concepts" "https://www.iso.org/standard/63500.html"
:::

::: link "Nielsen Norman Group — UX vs. UI: What's the Difference?" "https://www.nngroup.com/articles/definition-user-experience/"
:::

::: link "Nielsen Norman Group — Personas: Study Guide" "https://www.nngroup.com/articles/persona/"
:::

---

### Videa

::: youtube "https://www.youtube.com/watch?v=LnaLPPmY3_Q" "Explain UX with User-Centered Design" "NNgroup"
:::

*Zdroj: SZZ NADE — předmět User Experience a návrh uživatelských rozhraní, VUT FIT. Externí reference: ISO 9241-11:2018, ISO 9241-210:2019, Nielsen Norman Group, D. Norman (The Design of Everyday Things).*
