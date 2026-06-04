---
title: ESB a kontejner
---

**Enterprise Service Bus (ESB)** je integrační vrstva servisně orientované architektury (SOA): vystupuje jako **prostředník** (centrální sběrnice), který propojuje různorodé, navzájem nezávislé aplikace v síti a zjednodušuje jejich integraci. Místo aby každá aplikace znala detaily všech svých protějšků, mluví jen se sběrnicí.

## Špageta vs. sběrnice

V dobách před ESB se systémy propojovaly přímo, *point-to-point*. Pro $N$ vzájemně komunikujících systémů hrozí až **N·(N−1)** jednosměrných spojení — každé s vlastním protokolem, formátem a chybovým chováním. Této těsně provázané změti se říká **„špagetová architektura"**: jakákoli změna v jednom rozhraní láme všechny napojené aplikace a počet vazeb roste kvadraticky.

ESB tuto topologii převrací. Každá aplikace se napojí **jen jednou — na sběrnici**, a počet integračních bodů klesá z kvadratického na **lineární** ($N$ napojení). Sběrnice odděluje (decoupling) odesílatele a příjemce: ani jeden nemusí znát toho druhého.

::: svg "Point-to-point „špageta" (kvadratický počet vazeb) vs. centrální sběrnice ESB (lineární počet napojení)."
<svg viewBox="0 0 540 210" font-family="var(--font-mono)" font-size="10.5">
  <text x="135" y="16" text-anchor="middle" font-size="11.5" font-weight="600" fill="oklch(0.6 0.16 22)">point-to-point „špageta"</text>
  <text x="405" y="16" text-anchor="middle" font-size="11.5" font-weight="600" fill="oklch(0.6 0.14 142)">ESB — sběrnice</text>
  <!-- LEFT: full mesh of 5 nodes -->
  <g>
    <line x1="135" y1="50" x2="60"  y2="100" stroke="oklch(0.6 0.16 22 / 0.55)"/>
    <line x1="135" y1="50" x2="210" y2="100" stroke="oklch(0.6 0.16 22 / 0.55)"/>
    <line x1="135" y1="50" x2="90"  y2="170" stroke="oklch(0.6 0.16 22 / 0.55)"/>
    <line x1="135" y1="50" x2="180" y2="170" stroke="oklch(0.6 0.16 22 / 0.55)"/>
    <line x1="60"  y1="100" x2="210" y2="100" stroke="oklch(0.6 0.16 22 / 0.55)"/>
    <line x1="60"  y1="100" x2="90"  y2="170" stroke="oklch(0.6 0.16 22 / 0.55)"/>
    <line x1="60"  y1="100" x2="180" y2="170" stroke="oklch(0.6 0.16 22 / 0.55)"/>
    <line x1="210" y1="100" x2="90"  y2="170" stroke="oklch(0.6 0.16 22 / 0.55)"/>
    <line x1="210" y1="100" x2="180" y2="170" stroke="oklch(0.6 0.16 22 / 0.55)"/>
    <line x1="90"  y1="170" x2="180" y2="170" stroke="oklch(0.6 0.16 22 / 0.55)"/>
    <circle cx="135" cy="50"  r="13" fill="var(--bg-card)" stroke="oklch(0.6 0.16 22)"/>
    <circle cx="60"  cy="100" r="13" fill="var(--bg-card)" stroke="oklch(0.6 0.16 22)"/>
    <circle cx="210" cy="100" r="13" fill="var(--bg-card)" stroke="oklch(0.6 0.16 22)"/>
    <circle cx="90"  cy="170" r="13" fill="var(--bg-card)" stroke="oklch(0.6 0.16 22)"/>
    <circle cx="180" cy="170" r="13" fill="var(--bg-card)" stroke="oklch(0.6 0.16 22)"/>
    <text x="135" y="195" text-anchor="middle" font-size="9" fill="var(--text-faint)">~ N·(N−1) vazeb</text>
  </g>
  <!-- RIGHT: hub via bus -->
  <g>
    <rect x="320" y="108" width="170" height="20" rx="10" fill="oklch(0.62 0.14 142 / 0.18)" stroke="oklch(0.6 0.14 142)"/>
    <text x="405" y="122" text-anchor="middle" font-size="9" fill="oklch(0.45 0.14 142)">ESB</text>
    <line x1="405" y1="108" x2="405" y2="63"  stroke="oklch(0.6 0.14 142 / 0.7)"/>
    <line x1="350" y1="108" x2="335" y2="95"  stroke="oklch(0.6 0.14 142 / 0.7)"/>
    <line x1="460" y1="108" x2="475" y2="95"  stroke="oklch(0.6 0.14 142 / 0.7)"/>
    <line x1="360" y1="128" x2="345" y2="160" stroke="oklch(0.6 0.14 142 / 0.7)"/>
    <line x1="450" y1="128" x2="465" y2="160" stroke="oklch(0.6 0.14 142 / 0.7)"/>
    <circle cx="405" cy="50"  r="13" fill="var(--bg-card)" stroke="oklch(0.6 0.14 142)"/>
    <circle cx="330" cy="88"  r="13" fill="var(--bg-card)" stroke="oklch(0.6 0.14 142)"/>
    <circle cx="480" cy="88"  r="13" fill="var(--bg-card)" stroke="oklch(0.6 0.14 142)"/>
    <circle cx="340" cy="168" r="13" fill="var(--bg-card)" stroke="oklch(0.6 0.14 142)"/>
    <circle cx="470" cy="168" r="13" fill="var(--bg-card)" stroke="oklch(0.6 0.14 142)"/>
    <text x="405" y="195" text-anchor="middle" font-size="9" fill="var(--text-faint)">N napojení (lineární)</text>
  </g>
</svg>
:::

## Impedanční nesoulad a kanonický datový model

Připojené systémy si nerozumí — liší se protokoly (HTTP, SOAP, JMS, MQ, SFTP, EDI…) i datovými formáty (XML, JSON, fixed-width, EDIFACT…). Tomuto rozdílu se říká **impedanční nesoulad** (impedance mismatch). Naivní řešení — naučit každý systém formáty všech protějšků — vede zpět ke špagetě, navíc na úrovni dat.

ESB zavádí **kanonický datový model** (canonical data model): jeden společný, na nikom nezávislý formát „uvnitř" sběrnice. Systémy komunikují ve svých **nativních** formátech a sběrnice na hranici provádí překlad:

* **Adaptér (endpoint)** přijme/odešle zprávu v nativním protokolu konkrétního systému (např. čte z fronty, vystavuje HTTP endpoint).
* **Překladač (translator)** převede tělo zprávy z nativního formátu zdroje **do** kanonického modelu a z kanonického modelu **do** formátu cíle.

Klíčová výhoda: každý systém potřebuje znát jen převod **mezi sebou a kanonickým modelem** — ne mezi sebou a každým dalším systémem. Přidání nového systému je jeden nový adaptér + překladač, ne řada nových párových mapování.

## ESB kontejner — modularita přes OSGi

ESB se neprovozuje jako jeden velký monolit, ale jako **dynamické běhové prostředí** zvané *ESB kontejner*. Důvodem je potřeba **izolace a agility** integračních toků — jeden tok nesmí pádem nebo aktualizací shodit ostatní.

Průmyslovým standardem pro Java ESB kontejnery je specifikace **OSGi** (Open Services Gateway initiative). Software se v ní skládá z nezávislých modulů — **svazků (bundles)**, což jsou JARy s explicitně deklarovanými importy/exporty balíčků.

### Izolace classloaderů — řešení „JAR hell"

Standardní JVM načítá třídy hierarchicky (stromem classloaderů) a na classpath smí být **jen jedna verze** každé knihovny. Jakmile dva moduly chtějí *různé* verze téže knihovny, vzniká konflikt závislostí — **„JAR hell"**.

OSGi nahrazuje strom **grafem classloaderů**: každý bundle má **vlastní classloader** a vidí jen ty balíčky, které si explicitně naimportoval (s verzním rozsahem). Díky tomu mohou v jednom kontejneru běžet **různé verze stejné knihovny vedle sebe** bez konfliktu.

::: svg "OSGi: každý bundle má vlastní classloader a importuje balíčky podle verze; dvě verze téže knihovny mohou koexistovat."
<svg viewBox="0 0 520 168" font-family="var(--font-mono)" font-size="10">
  <rect x="20" y="40" width="150" height="100" rx="8" fill="oklch(0.62 0.14 264 / 0.08)" stroke="oklch(0.62 0.14 264)"/>
  <text x="95" y="32" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Bundle A</text>
  <text x="95" y="62" text-anchor="middle" fill="var(--text-muted)">classloader A</text>
  <rect x="40" y="78" width="110" height="22" rx="4" fill="var(--bg-card)" stroke="oklch(0.62 0.14 264)"/>
  <text x="95" y="93" text-anchor="middle" fill="var(--text)">import lib 1.0</text>
  <rect x="40" y="108" width="110" height="22" rx="4" fill="var(--bg-card)" stroke="var(--line)"/>
  <text x="95" y="123" text-anchor="middle" fill="var(--text-muted)">export api.a</text>

  <rect x="350" y="40" width="150" height="100" rx="8" fill="oklch(0.62 0.14 142 / 0.08)" stroke="oklch(0.6 0.14 142)"/>
  <text x="425" y="32" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Bundle B</text>
  <text x="425" y="62" text-anchor="middle" fill="var(--text-muted)">classloader B</text>
  <rect x="370" y="78" width="110" height="22" rx="4" fill="var(--bg-card)" stroke="oklch(0.6 0.14 142)"/>
  <text x="425" y="93" text-anchor="middle" fill="var(--text)">import lib 2.0</text>
  <rect x="370" y="108" width="110" height="22" rx="4" fill="var(--bg-card)" stroke="var(--line)"/>
  <text x="425" y="123" text-anchor="middle" fill="var(--text-muted)">export api.b</text>

  <rect x="205" y="62" width="110" height="24" rx="4" fill="oklch(0.7 0.13 90 / 0.18)" stroke="oklch(0.6 0.13 90)"/>
  <text x="260" y="78" text-anchor="middle" fill="var(--text)">lib 1.0</text>
  <rect x="205" y="100" width="110" height="24" rx="4" fill="oklch(0.7 0.13 90 / 0.18)" stroke="oklch(0.6 0.13 90)"/>
  <text x="260" y="116" text-anchor="middle" fill="var(--text)">lib 2.0</text>
  <line x1="150" y1="89" x2="205" y2="74" stroke="oklch(0.62 0.14 264)" stroke-dasharray="3 2"/>
  <line x1="370" y1="89" x2="315" y2="112" stroke="oklch(0.6 0.14 142)" stroke-dasharray="3 2"/>
  <text x="260" y="150" text-anchor="middle" font-size="9" fill="var(--text-faint)">dvě verze téže knihovny koexistují</text>
</svg>
:::

### Dynamický životní cyklus

Bundle prochází stavy **INSTALLED → RESOLVED → STARTING → ACTIVE → STOPPING → … → UNINSTALLED**. Klíčové je, že jednotlivé integrační trasy, komponenty i celé aplikace lze **za běhu nainstalovat, aktualizovat, spustit nebo smazat** — **bez restartu** celého kontejneru a bez ovlivnění ostatních běžících tras. Nasazení nové verze trasy tak nevyžaduje výpadek sběrnice.

### Škálování — Fuse Fabric {tier=practice}

Rozsáhlejší infrastruktury sdružují více ESB kontejnerů do clusteru. Nástroje typu **Fuse Fabric** (Fabric8) umožňují **centrální správu** a synchronizaci konfiguračních **profilů** napříč mnoha kontejnery, takže lze hromadně nasadit a udržovat tytéž trasy na celém poli běhových instancí.

::: quiz "Proč v OSGi mohou v jednom kontejneru koexistovat dvě různé verze téže knihovny, zatímco na klasické JVM classpath ne?"
- [x] Každý bundle má vlastní classloader a importuje balíčky podle verzního rozsahu — classloadery tvoří graf, ne strom s jedinou verzí na classpath.
  > Přesně. Verzované importy/exporty a per-bundle classloader izolují závislosti, takže lib 1.0 a lib 2.0 žijí vedle sebe — to je řešení „JAR hell".
- [ ] OSGi sloučí obě verze do jedné kompatibilní knihovny při startu.
  > Ne — verze se neslučují. Naopak zůstávají oddělené, každá ve svém classloaderu.
- [ ] Protože OSGi nepoužívá classloadery, ale reflexi.
  > OSGi naopak classloadery klíčově využívá — jen v grafovém, ne stromovém modelu.
:::

::: link "Enterprise Service Bus — Wikipedia (mediace, kanonický model, adaptéry)" "https://en.wikipedia.org/wiki/Enterprise_service_bus"
:::

::: link "Red Hat Fuse — Introduction to OSGi (bundles, classloader izolace, životní cyklus)" "https://docs.redhat.com/en/documentation/red_hat_fuse/7.9/html-single/deploying_into_apache_karaf/index"
:::

::: link "OSGi Core Specification — Module a Life Cycle Layer" "https://docs.osgi.org/specification/"
:::

---

*Zdroj: SZZ NADE — předmět Prostředí distribuovaných aplikací, VUT FIT. Externí reference: Enterprise Service Bus (Wikipedia); Red Hat Fuse / Apache Karaf dokumentace (OSGi); OSGi Core Specification; Hohpe, G. & Woolf, B.: Enterprise Integration Patterns (Canonical Data Model, Channel Adapter, Messaging Bridge).*
