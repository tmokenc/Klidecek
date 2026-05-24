---
title: Analýza rizik
---

# Analýza rizik — systematic identifikace + assessment

Analýza rizik (Risk Assessment) je *systematic* proces — identifikace aktiv, hrozeb, zranitelností, dopadů, pravděpodobností; výsledkem je *přehled rizik*, který slouží pro *risk treatment* (mitigate / transfer / accept / avoid).

## Cíl analýzy rizik

1. **Identify** assets that matter.
2. **Identify** threats and vulnerabilities.
3. **Estimate** likelihood + impact pro každý risk scenario.
4. **Rank** rizika podle priority.
5. **Decide** how to treat each (controls, transfer, accept).

Output: **Risk Register** — formal table of risks, owners, controls, status.

## Process flow

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

## Quantitative risk analysis

Numerical approach. Vyžaduje *číselné* odhady — drahé but precise.

### Single Loss Expectancy (SLE)

Dopad *jedné* události. 

$$
\text{SLE} = \text{Asset Value} \times \text{Exposure Factor}
$$

- **Asset Value (AV)** — hodnota aktiva ($).
- **Exposure Factor (EF)** — procento, kolik asset value se ztratí (0-100 %).

Příklad: zákaznická databáze AV = $1M. Při data breach EF = 60 % (loss of reputation, fines). SLE = $600k.

### Annualized Rate of Occurrence (ARO)

Pravděpodobnost / frekvence per rok.

- 1× za 10 let = ARO = 0.1.
- 5× ročně = ARO = 5.

Odhad podle historical data, expert opinion, industry stats.

### Annualized Loss Expectancy (ALE)

$$
\text{ALE} = \text{SLE} \times \text{ARO}
$$

Očekávaná *roční* ztráta. 

Příklad: SLE = $600k, ARO = 0.2 (jednou za 5 let) → ALE = $120k/year.

### Cost-benefit analysis

Pro control reducing ALE z $120k na $20k:

$$
\text{Value of Control} = \text{ALE}_{\text{before}} - \text{ALE}_{\text{after}} - \text{Cost of Control}
$$

$120k - $20k - $50k(control annual cost) = $50k/year saved → control *worth it*.

Pokud control cost > savings → don't implement.

::: viz risk-matrix-ale "Slidery AV, EF, ARO → SLE → ALE; risk matrix highlight. Posuň control cost / reduction — saved = ALE − ALE' − cost rozhodne, zda zavést."
:::

## Qualitative risk analysis

Less precise but easier. Use *categorical* scales (low / medium / high) místo dollar values.

### Risk matrix

| | Impact: Low | Impact: Med | Impact: High |
| :--- | :---: | :---: | :---: |
| Likelihood: High | Medium | High | **Critical** |
| Likelihood: Med | Low | Medium | High |
| Likelihood: Low | Trivial | Low | Medium |

### Pros and Cons

| | Quantitative | Qualitative |
| :--- | :--- | :--- |
| Precision | high | low |
| Data needed | hard ($, frequencies) | easy (judgment) |
| Time | long | short |
| Best for | enterprise, regulated | startups, small orgs |

V praxi *hybrid* — kvantitatif pro velký risk, kvalitativní pro malé.

## Threat modeling

Před risk analysis musíme znát *threats*. Frameworks:

### STRIDE (Microsoft)

Pro každý system component zkontroluj:

- **S**poofing — fake identity.
- **T**ampering — modify data.
- **R**epudiation — deny action.
- **I**nformation disclosure — leak data.
- **D**enial of service — block availability.
- **E**levation of privilege — gain unauthorized rights.

### PASTA (Process for Attack Simulation and Threat Analysis)

7 stages from business objectives to attack simulation. More elaborate than STRIDE.

### OCTAVE

Operationally Critical Threat, Asset, and Vulnerability Evaluation. Carnegie Mellon. Self-directed for orgs.

### Attack tree

Hierarchický graf útoku ([[model-incidentu]]).

## Risk register

Formal documentation. Each row:

| ID | Asset | Threat | Vulnerability | Likelihood | Impact | Risk | Treatment | Owner | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| R-001 | Customer DB | SQL injection | unvalidated input | High | High | Critical | Mitigate (WAF + code review) | DevOps lead | In progress |
| R-002 | Server room | Fire | no fire suppression | Low | High | Medium | Mitigate (install Halon system) | Facilities | Done |
| R-003 | Email | Phishing | user susceptibility | High | Medium | High | Mitigate (training + email filter) | IT Manager | Ongoing |

Pravidelně review — *minimum quarterly*, ideally monthly pro top risks.

## Risk treatment options

Pro každý identifikovaný risk:

### 1. Mitigate (snížit)

Implement controls reducing likelihood or impact.

- Likelihood: prevent attack (firewall, patch, MFA).
- Impact: reduce damage (encryption, backup, segmentation).

### 2. Transfer (přenést)

- **Insurance** — cybersecurity insurance covers losses.
- **Outsource** — managed service provider takes operational risk.
- **Contract** — vendor SLAs with penalties.

Caveat: insurance doesn't transfer *reputational* damage.

### 3. Accept (akceptovat)

Risk too small or cost of mitigation too high. Documented + management approval.

Acceptance is *informed* decision, not ignorance.

### 4. Avoid (vyhnout)

Discontinue activity creating risk. Drastic — only when other options not viable.

Příklad: discontinue handling certain PII data.

## Residual risk

Po treatment vždy *zbyde* nějaký risk:

$$
\text{Residual Risk} = \text{Inherent Risk} - \text{Risk Mitigation}
$$

Management *akceptuje* residual risk (formal sign-off).

If residual risk *too high* → more controls, transfer, or avoid.

## Continuous monitoring

Risk analysis *není* one-time. Periodic:

- **Threat landscape changes** — new vulnerabilities, new attackers.
- **Business changes** — new systems, new assets.
- **Control effectiveness** — controls degrade over time.
- **Compliance changes** — new regulations.

ISO 27005 + NIST SP 800-30 recommend at least *annual* full review + ongoing monitoring.

## Specific risk frameworks

- **NIST SP 800-30** — Risk Assessment for Federal Systems.
- **ISO 27005** — Information Security Risk Management.
- **FAIR** (Factor Analysis of Information Risk) — quantitative model.
- **CRAMM** — UK government risk analysis.
- **OCTAVE Allegro** — operational risk.

Pick framework matching organization.

---

*Zdroj: BIS přednášky 2025/26, Ing. Kamil Malinka, Ph.D., FIT VUT v Brně. Externí reference: NIST SP 800-30 Rev 1 — Guide for Conducting Risk Assessments ([nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-30r1.pdf)); ISO/IEC 27005:2022 — Information Security Risk Management; Open FAIR Standard ([opengroup.org](https://www.opengroup.org/forum/security/openfair)); Whitman, M.E., Mattord, H.J.: „Management of Information Security" (5th ed., Cengage 2017), §4-5.*
