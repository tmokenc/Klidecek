---
title: Analýza rizik
---

# Analýza rizik — systematická identifikace a hodnocení

Analýza rizik (risk assessment) je *systematický* proces — identifikuje aktiva, hrozby (threats), zranitelnosti (vulnerabilities), dopady a pravděpodobnosti. Jejím výsledkem je *přehled rizik*, který slouží jako podklad pro ošetření rizik (risk treatment): zmírnění (mitigate), přenesení (transfer), akceptaci (accept) nebo vyhnutí se (avoid).

## Cíl analýzy rizik

1. **Identifikovat** aktiva, na kterých záleží.
2. **Identifikovat** hrozby a zranitelnosti.
3. **Odhadnout** pravděpodobnost a dopad pro každý scénář rizika.
4. **Seřadit** rizika podle priority.
5. **Rozhodnout**, jak každé z nich ošetřit (zavedením opatření, přenesením, akceptací).

Výstupem je **registr rizik (risk register)** — formální tabulka rizik, jejich vlastníků, opatření a stavu.

## Průběh procesu

::: svg "Risk assessment process"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="10">
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="60" width="90" height="40" rx="3"/>
    <rect x="120" y="60" width="90" height="40" rx="3"/>
    <rect x="220" y="60" width="90" height="40" rx="3"/>
    <rect x="320" y="60" width="90" height="40" rx="3"/>
    <rect x="420" y="60" width="90" height="40" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600" font-size="10">
    <text x="65" y="82">Identify</text>
    <text x="165" y="82">Analyze</text>
    <text x="265" y="82">Evaluate</text>
    <text x="365" y="82">Treat</text>
    <text x="465" y="82">Monitor</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9">
    <text x="65" y="96">assets, threats</text>
    <text x="165" y="96">likelihood, impact</text>
    <text x="265" y="96">prioritize</text>
    <text x="365" y="96">mitigate, accept</text>
    <text x="465" y="96">review periodically</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none">
    <line x1="110" y1="80" x2="120" y2="80" marker-end="url(#ra-ar)"/>
    <line x1="210" y1="80" x2="220" y2="80" marker-end="url(#ra-ar)"/>
    <line x1="310" y1="80" x2="320" y2="80" marker-end="url(#ra-ar)"/>
    <line x1="410" y1="80" x2="420" y2="80" marker-end="url(#ra-ar)"/>
  </g>
  <text x="270" y="140" text-anchor="middle" fill="var(--text-muted)" font-size="10">ISO 27005 framework — repeat periodically</text>
  <text x="270" y="160" text-anchor="middle" fill="var(--text-faint)" font-size="9">Quantitative (ALE = SLE × ARO) nebo Qualitative (low/medium/high)</text>
  <defs>
    <marker id="ra-ar" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L5,3 L0,6 z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

## Kvantitativní analýza rizik {tier=practice}

Číselný přístup. Vyžaduje *číselné* odhady — je nákladný, ale přesný.

### Single Loss Expectancy (SLE)

Dopad *jediné* události.

$$
\text{SLE} = \text{Asset Value} \times \text{Exposure Factor}
$$

- **Asset Value (AV)** — hodnota aktiva ($).
- **Exposure Factor (EF)** — procento, kolik z hodnoty aktiva se ztratí (0–100 %).

Příklad: zákaznická databáze má AV = $1M. Při úniku dat (data breach) je EF = 60 % (ztráta reputace, pokuty). SLE = $600k.

### Annualized Rate of Occurrence (ARO)

Pravděpodobnost neboli frekvence za rok.

- 1× za 10 let → ARO = 0,1.
- 5× ročně → ARO = 5.

Odhad se opírá o historická data, expertní názor a oborové statistiky.

### Annualized Loss Expectancy (ALE)

$$
\text{ALE} = \text{SLE} \times \text{ARO}
$$

Očekávaná *roční* ztráta.

Příklad: SLE = $600k, ARO = 0,2 (jednou za 5 let) → ALE = $120k za rok.

### Analýza nákladů a přínosů (cost-benefit analysis)

Pro opatření, které sníží ALE z $120k na $20k:

$$
\text{Value of Control} = \text{ALE}_{\text{before}} - \text{ALE}_{\text{after}} - \text{Cost of Control}
$$

$120k − $20k − $50k (roční náklad na opatření) = ušetřených $50k za rok → opatření se *vyplatí*.

Pokud náklad na opatření převýší úsporu, opatření nezavádějte.

::: viz risk-matrix-ale "Slidery AV, EF, ARO → SLE → ALE; risk matrix highlight. Posuň control cost / reduction — saved = ALE − ALE' − cost rozhodne, zda zavést."
:::

## Kvalitativní analýza rizik {tier=practice}

Méně přesná, ale jednodušší. Používá *kategorické* škály (nízká / střední / vysoká) místo peněžních hodnot.

### Matice rizik (risk matrix)

| | Dopad: nízký | Dopad: střední | Dopad: vysoký |
| :--- | :---: | :---: | :---: |
| Pravděpodobnost: vysoká | střední | vysoké | **kritické** |
| Pravděpodobnost: střední | nízké | střední | vysoké |
| Pravděpodobnost: nízká | zanedbatelné | nízké | střední |

### Výhody a nevýhody

| | Kvantitativní | Kvalitativní |
| :--- | :--- | :--- |
| Přesnost | vysoká | nízká |
| Potřebná data | náročná ($, frekvence) | snadná (úsudek) |
| Čas | dlouhý | krátký |
| Vhodné pro | velké a regulované firmy | startupy, malé organizace |

V praxi se používá *hybridní* přístup — kvantitativní pro velká rizika, kvalitativní pro malá.

## Modelování hrozeb (threat modeling) {tier=practice}

Před analýzou rizik musíme znát *hrozby*. Používané frameworky:

### STRIDE (Microsoft)

U každé komponenty systému zkontrolujeme:

- **S**poofing — podvržení identity (spoofing).
- **T**ampering — neoprávněná úprava dat.
- **R**epudiation — popření provedené akce.
- **I**nformation disclosure — únik informací.
- **D**enial of service — zablokování dostupnosti.
- **E**levation of privilege — získání neoprávněných oprávnění.

### PASTA (Process for Attack Simulation and Threat Analysis)

Sedm fází vedoucích od obchodních cílů až k simulaci útoku. Propracovanější než STRIDE.

### OCTAVE

Operationally Critical Threat, Asset, and Vulnerability Evaluation. Pochází z Carnegie Mellon. Je samořízený (self-directed) a určený pro organizace.

### Strom útoku (attack tree)

Hierarchický graf útoku ([[model-incidentu]]).

## Registr rizik (risk register)

Formální dokumentace. Každý řádek obsahuje:

| ID | Aktivum | Hrozba | Zranitelnost | Pravděpodobnost | Dopad | Riziko | Ošetření | Vlastník | Stav |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| R-001 | Zákaznická DB | SQL injection | neošetřený vstup | vysoká | vysoký | kritické | zmírnit (WAF + revize kódu) | vedoucí DevOps | probíhá |
| R-002 | Serverovna | požár | chybějící hasicí systém | nízká | vysoký | střední | zmírnit (instalace plynového hašení — FM-200 / Novec 1230) | správa budov | hotovo |
| R-003 | E-mail | phishing | náchylnost uživatelů | vysoká | střední | vysoké | zmírnit (školení + e-mailový filtr) | IT manažer | průběžně |

Registr je třeba pravidelně revidovat — *minimálně čtvrtletně*, u nejvýznamnějších rizik ideálně měsíčně.

## Možnosti ošetření rizik (risk treatment)

Pro každé identifikované riziko:

### 1. Zmírnit (mitigate)

Zavést opatření, která sníží pravděpodobnost nebo dopad.

- Pravděpodobnost: zabránit útoku (firewall, záplata, MFA).
- Dopad: omezit škodu (šifrování, zálohy, segmentace).

### 2. Přenést (transfer)

- **Pojištění** — kybernetické pojištění kryje ztráty.
- **Outsourcing** — poskytovatel spravované služby (managed service provider) přebírá provozní riziko.
- **Smlouva** — SLA dodavatele se sankcemi.

Pozor: pojištění nepřenese *reputační* škodu.

### 3. Akceptovat (accept)

Riziko je příliš malé nebo je cena zmírnění příliš vysoká. Vyžaduje dokumentaci a schválení vedením.

Akceptace je *informované* rozhodnutí, nikoli nevědomost.

### 4. Vyhnout se (avoid)

Ukončit činnost, která riziko vytváří. Je to drastický krok — volí se jen tehdy, když ostatní možnosti nejsou schůdné.

Příklad: přestat zpracovávat určitá osobní data (PII).

## Zbytkové riziko (residual risk)

Po ošetření vždy nějaké riziko *zůstává*:

$$
\text{Residual Risk} = \text{Inherent Risk} - \text{Risk Mitigation}
$$

Vedení zbytkové riziko *akceptuje* (formálním schválením).

Pokud je zbytkové riziko *příliš vysoké*, je třeba doplnit opatření, přenést riziko, nebo se mu vyhnout.

## Průběžné monitorování

Analýza rizik *není* jednorázová. Probíhá periodicky:

- **Změny v krajině hrozeb** — nové zranitelnosti, noví útočníci.
- **Změny v podnikání** — nové systémy, nová aktiva.
- **Účinnost opatření** — opatření časem degradují.
- **Změny v souladu s předpisy** — nové regulace.

ISO 27005 a NIST SP 800-30 doporučují alespoň *roční* úplnou revizi a průběžné monitorování.

## Konkrétní frameworky pro rizika

- **NIST SP 800-30** — analýza rizik pro federální systémy.
- **ISO 27005** — řízení rizik informační bezpečnosti.
- **FAIR** (Factor Analysis of Information Risk) — kvantitativní model.
- **CRAMM** — analýza rizik britské vlády.
- **OCTAVE Allegro** — provozní rizika.

Vyberte framework odpovídající organizaci.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=0oeD2Wf25wY" "Mastering AI Risk: NIST’s Risk Management Framework Explained" "IBM Technology"
:::

*Zdroj: BIS přednášky 2025/26, Ing. Kamil Malinka, Ph.D., FIT VUT v Brně. Externí reference: NIST SP 800-30 Rev 1 — Guide for Conducting Risk Assessments ([nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-30r1.pdf)); ISO/IEC 27005:2022 — Information Security Risk Management; Open FAIR Standard ([opengroup.org](https://www.opengroup.org/forum/security/openfair)); Whitman, M.E., Mattord, H.J.: „Management of Information Security" (5th ed., Cengage 2017), §4-5.*
