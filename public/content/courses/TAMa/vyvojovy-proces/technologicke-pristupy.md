---
title: Technologické přístupy
---

Zásadním architektonickým rozhodnutím je **jak** aplikaci postavit. Volba určuje výkon, cenu, velikost týmu i to, jak rychle se dostanete k novým funkcím platformy. Existují čtyři hlavní přístupy, které leží na spektru podle toho, **kolik kódu se sdílí mezi platformami** — od nuly (nativní) po sto procent (PWA).

::: viz tama-sdileni-kodu "Přepínej přístup. Pruh ukazuje podíl sdíleného kódu mezi platformami, tečky kvalitativně výkon a přístup k hardwaru. Sdílení kódu a výkon jdou proti sobě."
:::

## Nativní vývoj

Aplikace se programuje přímo pro konkrétní OS nástroji jeho tvůrce:

| Platforma | Jazyk | IDE |
|---|---|---|
| Android | **Kotlin** (preferovaný), Java | Android Studio |
| iOS | **Swift** (preferovaný), Objective-C | Xcode |

Nativní cesta přináší **nekompromisní výkon**, plynulé animace a **okamžitý přístup k novému hardwaru** a API (nové senzory, widgety, systémové integrace jsou k dispozici v den vydání OS). Daní je **vyšší cena**: potřebujete dva dedikované týmy a udržujete **dvě oddělené codebase** — každá funkce se implementuje dvakrát.

## Cross-platform (multiplatformní) vývoj

Kód — obvykle byznys logika, často i UI — se napíše **jednou** a kompiluje pro více platforem. Sdílí se typicky **70–90 %** kódu, zbytek tvoří platformově specifické moduly a doladění vzhledu.

| Framework | Jazyk | Jak vykresluje UI |
|---|---|---|
| **React Native** | JavaScript/TypeScript | mapuje na *nativní* komponenty platformy |
| **Flutter** | Dart | vlastní grafický engine (vykresluje vše sám) |
| **Kotlin Multiplatform** | Kotlin | sdílí logiku, UI nativní (nebo Compose Multiplatform) |
| **.NET MAUI** | C# | nativní ovládací prvky přes abstrakci |

Klíčový rozdíl uvnitř kategorie: React Native renderuje **skutečné nativní komponenty** (vzhled se mění s platformou), zatímco Flutter si **kreslí UI sám** vlastním enginem (pixelově identické na obou platformách). Kompromis (trade-off) proti nativnímu vývoji je drobná ztráta výkonu a zpoždění u úplně nejnovějších HW funkcí výměnou za jednu codebase a jeden tým.

## Hybridní vývoj

Webová aplikace (HTML5, CSS, JavaScript) se spustí přes **WebView** — zabudovaný prohlížeč zabalený do nativní obálky (např. **Apache Cordova**, dnes spíše Capacitor). Vývoj je **extrémně rychlý a levný** (využije se web stack a hotová web aplikace), ale **výkon a plynulost silně brzdí vrstva prohlížeče** — animace a složitější UI nejsou tak svižné jako u nativního či cross-platform řešení.

::: svg "Co kreslí UI: nativní engine vs. WebView vs. prohlížeč"
<svg viewBox="0 0 520 130" xmlns="http://www.w3.org/2000/svg">
  <!-- nativní/cross -->
  <rect x="14" y="22" width="150" height="92" rx="6" fill="var(--bg-card)" stroke="oklch(0.6 0.14 142)"/>
  <text x="89" y="16" text-anchor="middle" font-size="10.5" font-weight="600" fill="var(--text)">Nativní / cross</text>
  <rect x="28" y="36" width="122" height="20" rx="3" fill="oklch(0.6 0.14 142 / 0.18)" stroke="oklch(0.6 0.14 142)"/>
  <text x="89" y="50" text-anchor="middle" font-size="9" fill="var(--text)">aplikační kód</text>
  <rect x="28" y="62" width="122" height="44" rx="3" fill="var(--bg-inset)" stroke="var(--line)"/>
  <text x="89" y="80" text-anchor="middle" font-size="9" fill="var(--text-muted)">nativní UI engine</text>
  <text x="89" y="96" text-anchor="middle" font-size="8.5" fill="var(--text-faint)">přímo na GPU/OS</text>

  <!-- hybridní -->
  <rect x="186" y="22" width="150" height="92" rx="6" fill="var(--bg-card)" stroke="oklch(0.62 0.14 264)"/>
  <text x="261" y="16" text-anchor="middle" font-size="10.5" font-weight="600" fill="var(--text)">Hybridní (Cordova)</text>
  <rect x="200" y="36" width="122" height="18" rx="3" fill="oklch(0.62 0.14 264 / 0.18)" stroke="oklch(0.62 0.14 264)"/>
  <text x="261" y="49" text-anchor="middle" font-size="9" fill="var(--text)">web (HTML/JS)</text>
  <rect x="200" y="58" width="122" height="20" rx="3" fill="var(--bg-inset)" stroke="var(--line)"/>
  <text x="261" y="71" text-anchor="middle" font-size="9" fill="var(--text-muted)">WebView</text>
  <rect x="200" y="82" width="122" height="24" rx="3" fill="var(--bg-inset)" stroke="var(--line)"/>
  <text x="261" y="98" text-anchor="middle" font-size="8.5" fill="var(--text-faint)">nativní obálka</text>

  <!-- PWA -->
  <rect x="358" y="22" width="150" height="92" rx="6" fill="var(--bg-card)" stroke="oklch(0.62 0.14 80)"/>
  <text x="433" y="16" text-anchor="middle" font-size="10.5" font-weight="600" fill="var(--text)">PWA</text>
  <rect x="372" y="36" width="122" height="18" rx="3" fill="oklch(0.62 0.14 80 / 0.18)" stroke="oklch(0.62 0.14 80)"/>
  <text x="433" y="49" text-anchor="middle" font-size="9" fill="var(--text)">web + service worker</text>
  <rect x="372" y="58" width="122" height="48" rx="3" fill="var(--bg-inset)" stroke="var(--line)"/>
  <text x="433" y="78" text-anchor="middle" font-size="9" fill="var(--text-muted)">systémový prohlížeč</text>
  <text x="433" y="94" text-anchor="middle" font-size="8.5" fill="var(--text-faint)">bez obchodu</text>
</svg>
:::

## Progresivní webové aplikace (PWA)

PWA běží přímo **v prohlížeči**, ale díky moderním webovým API (*service worker* pro mezipaměť a offline režim, *manifest* pro instalaci) je lze **nainstalovat na domovskou obrazovku** a používat **offline**, čímž uživateli simulují nativní zážitek bez nutnosti obchodu. Omezení je v **přístupu k hardwaru a systémovým API** — prohlížeč zpřístupňuje jen podmnožinu možností a na iOS je podpora historicky slabší než na Androidu.

::: quiz "Čím se liší vykreslování UI ve Flutteru a v React Native?"
- [ ] Oba mapují kód na nativní komponenty platformy.
  > To platí jen pro React Native. Flutter si kreslí UI sám.
- [x] React Native renderuje nativní komponenty platformy; Flutter kreslí vše vlastním grafickým enginem.
  > Přesně. Proto vypadá Flutter aplikace pixelově stejně na Androidu i iOS, kdežto RN přebírá vzhled platformy.
- [ ] Flutter používá WebView, React Native nativní engine.
  > WebView je znak hybridního přístupu (Cordova), ne Flutteru ani React Native.
:::

::: link "React Native — How It Works (architektura)" "https://reactnative.dev/architecture/landing-page"
:::

::: link "Flutter — Architectural overview" "https://docs.flutter.dev/resources/architectural-overview"
:::

::: link "web.dev — What are Progressive Web Apps?" "https://web.dev/articles/what-are-pwas"
:::

---

### Videa

::: youtube "https://www.youtube.com/watch?v=X8ipUgXH6jw" "React Native vs Flutter - I built the same chat app with both" "Fireship"
:::

*Zdroj: SZZ NADE — předmět Tvorba aplikací pro mobilní zařízení, VUT FIT. Externí reference: oficiální dokumentace React Native, Flutter, Kotlin Multiplatform, .NET MAUI a Apache Cordova; web.dev (PWA).*
