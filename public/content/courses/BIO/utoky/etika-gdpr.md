---
title: Etika a GDPR pro biometriky
---

# Etika a GDPR pro biometriky

Biometrika *není* běžná data. Je *neměnná*, *trvalá*, *vysoce identifikující*. Tyto vlastnosti znamenají, že biometrické systémy *vyžadují* zvláštní právní a etický rámec. EU GDPR explicitně klasifikuje biometriku jako *special category data* s nejvyšší úrovní ochrany. Pochopení této ochrany je *povinné* pro deployment.

## Klíčové etické otázky

### 1. Neměnnost

* Heslo lze *změnit*.
* Biometrický rys **nelze**:
  * Obličej: chirurgie možná, drahá, viditelná.
  * Otisky prstů: trvalé, neměnné.
  * DNA: nemožné změnit.
  * Iris: nemožné změnit.

**Důsledek:** kompromitované biometrické data jsou *trvale* kompromitované. Útočník, který získá *templates*, je má *navždy*.

### 2. Bohatství informací

DNA, iris, obličej obsahují *víc* než identifikační informace:

* **Zdravotní status** (DNA, retinal images, gait).
* **Pohlaví, věk, etnicita** (face).
* **Emoce, stres, mentální stav** (face, voice).
* **Reprodukční stav** (voice — pregnancy).

Mass biometric surveillance znamená *mass* mining personálních informací.

### 3. Surveillance and consent

* **CCTV face recognition** v veřejném prostoru.
* **Voice biometric** in call centers (often without explicit consent).
* **Gait recognition** for surveillance.
* **Cross-camera tracking** building person re-identification.

Question: *consent* in public spaces is virtually impossible to obtain meaningfully.

### 4. Discrimination

* **Algorithmic bias** — face recognition consistently worse for darker skin, women (Buolamwini-Gebru 2018).
* **False positives** disproportionately affect marginalized communities.
* **High-profile wrongful arrests** based on face recognition (Robert Williams 2020, Detroit).

### 5. Function creep

* Originally collected for *one purpose* (passport).
* Later used for *another* (criminal investigation, immigration enforcement, surveillance).
* **Schengen Information System** — originally border, expanded scope.
* **Aadhaar** — originally welfare, now ubiquitous in India.

## GDPR (Regulation EU 2016/679)

### Klíčový rámec

* **Effective:** May 25, 2018.
* **Applies:** all EU residents + companies processing EU resident data.
* **Penalties:** up to **€20M** or **4 % global revenue** (whichever higher).

### Article 4 — Definice

**Biometric data** (Art. 4(14)):
> "Personal data resulting from specific technical processing relating to the physical, physiological or behavioural characteristics of a natural person, which allow or confirm the unique identification of that natural person, such as facial images or dactyloscopic data."

### Article 9 — Special category data

Biometric data is **special category** (along with health data, racial origin, religious beliefs, etc.).

**Processing prohibited** unless one of these legal bases applies:

* **(a)** Explicit consent.
* **(b)** Employment, social security obligations.
* **(c)** Protect vital interests.
* **(d)** Legitimate activities of non-profit body.
* **(e)** Data made public by data subject.
* **(f)** Legal claims.
* **(g)** Substantial public interest, proportionate.
* **(h)** Healthcare.
* **(i)** Public health.
* **(j)** Archiving, research, statistical (with safeguards).

### Specific requirements

#### Consent

* Must be **explicit** (Art. 9), not just opt-in.
* **Freely given, specific, informed, unambiguous**.
* **Easily withdrawable**.
* **Documented**.

#### Data minimization

* Collect only *necessary* biometric data.
* No "may be useful later" reasoning.

#### Storage limitation

* Retain only *as long as necessary*.
* Define retention period.
* Automatic deletion.

#### Security

* **Appropriate technical and organizational measures** (Art. 32):
  * Encryption.
  * Pseudonymization.
  * Confidentiality, integrity, availability, resilience.
  * Restore capability after incident.
  * Regular testing.

#### Data subject rights

* **Right to access** (Art. 15) — what data held, why.
* **Right to rectification** (Art. 16) — correct inaccuracies.
* **Right to erasure** (Art. 17) — "right to be forgotten".
* **Right to restriction** (Art. 18) — limit processing.
* **Right to data portability** (Art. 20) — export data.
* **Right to object** (Art. 21) — to certain processing.

#### Automated decision-making (Art. 22)

* Restrictions on *fully automated* decisions with significant effect.
* **Right to human review.**

#### DPIA — Data Protection Impact Assessment

Required (Art. 35) for:
* Systematic + extensive evaluation.
* **Large-scale special category processing** (includes biometric).
* Systematic monitoring of public area.

Most biometric systems require DPIA.

### Penalties

* **Tier 1:** up to €10M or 2 % revenue (lesser violations).
* **Tier 2:** up to €20M or 4 % revenue (Art. 9 violations).

#### Notable fines

* **Clearview AI:** €20M each from France (CNIL), Italy (Garante) and Greece (HDPA); £7.5M from the UK ICO.
* **Facebook (Meta):** €1.2B for transatlantic data transfers.
* **Several face recognition** vendors fined.

## EU AI Act (Regulation 2024/1689)

**Effective:** August 2024 (phased).

### Biometric provisions

* **Real-time remote biometric identification** in public spaces — **PROHIBITED** with narrow exceptions (terrorism, serious crime, missing children) and authorization.
* **Post-remote biometric identification** — high-risk, regulated.
* **Emotion recognition** in workplace, education — **PROHIBITED**.
* **Biometric categorization** (race, political views, sexual orientation) — **PROHIBITED**.
* **Mass scraping of facial images** for face databases — **PROHIBITED**.

### High-risk biometric systems

* Border control biometric.
* Law enforcement biometric.
* Employment biometric.

Require:
* **Risk management system.**
* **Data governance.**
* **Technical documentation.**
* **Logging.**
* **Transparency.**
* **Human oversight.**
* **Accuracy + robustness.**
* **Cybersecurity.**

### Penalties

* **Tier 1:** €35M or 7 % revenue (prohibited practices).
* **Tier 2:** €15M or 3 % revenue.

## Czech specific

### Zákon o ochraně osobních údajů (110/2019 Sb.)

* Implements GDPR in CZ.
* **ÚOOÚ** (Úřad pro ochranu osobních údajů) — supervisory authority.

### Zákon o policii (273/2008 Sb.)

* Regulates police biometric collection (DNA, fingerprints).
* **Retention periods** specified.
* **Deletion procedures** after acquittal.

### Specific guidance

* **ÚOOÚ** has issued multiple guidances on biometric processing.
* **Schools** cannot generally use biometric attendance systems (children).
* **Workplaces** — strict consent + proportionality.

## Globalní pohledy

### USA — patchwork

* **No federal biometric law.**
* **Illinois BIPA (2008)** — strong law, $1000–$5000 per violation.
* **Texas, Washington, California** — similar laws.
* **Several class actions** against tech companies.

### Asia

* **China** — laws focus on government surveillance, less protection from companies.
* **India** — Aadhaar surveillance + DPDP Act (2023).
* **Japan** — APPI (Act on Protection of Personal Information).

### Russia

* Strict laws but enforcement variable.
* Mass surveillance documented.

## Ethical guidelines for designers

### Build for privacy

* **Privacy by design** — embed protections from start.
* **Privacy by default** — strictest settings by default.
* **Data minimization** — collect only what's necessary.
* **Local processing** — keep biometric on device where possible.
* **Cancelable biometrics** — transformed templates that can be rotated.

### Build for fairness

* **Diverse training data.**
* **Demographic parity testing.**
* **Bias mitigation algorithms.**
* **Transparent performance reporting** across demographics.

### Build for accountability

* **Audit logging.**
* **Explainability** — why was decision made.
* **Human review** for important decisions.
* **Easy redress** for affected individuals.

### Build for security

* **Encryption everywhere.**
* **Strong key management.**
* **Regular security testing.**
* **Incident response plans.**

## Wrongful biometric decisions

### Robert Williams (Detroit, 2020)

* **First publicly known** wrongful arrest from face recognition.
* Detroit Police arrested Williams (Black man).
* Face recognition matched him to shoplifting suspect.
* Wrong match — Williams had alibi.
* **Lawsuit settled** $300 000.

### Other cases

* Multiple wrongful arrests documented globally.
* **Disproportionately affects** people of color.
* Disclosure: many jurisdictions don't reveal use of face recognition.

## Trends

### Privacy-enhancing technologies

* **Homomorphic encryption** for biometric matching without revealing data.
* **Federated learning** — train models without centralizing data.
* **Secure multi-party computation.**
* **Differential privacy** for aggregate analytics.

### Regulation expansion

* **State-level laws** proliferating (US).
* **AI-specific regulation** beyond GDPR (EU AI Act).
* **International cooperation** on standards.

### Consumer awareness

* Growing public concern about face recognition.
* Some cities **banning** government face recognition (San Francisco, Boston).
* Companies **withdrawing** from problematic uses (IBM exited face recognition 2020).

## Recommendations pro projekty

1. **DPIA early** — assess privacy risks before deployment.
2. **Consent properly** — explicit, documented.
3. **Minimize** — only what's needed.
4. **Local processing** — keep biometric on device.
5. **Audit access** — log everything.
6. **Test fairness** — across demographics.
7. **Plan for breach** — incident response.
8. **Regular review** — laws change.

---

*Zdroj: BIO přednášky 2025/26, BIO 13 — Biometrické systémy v praxi. Externí reference: Regulation (EU) 2016/679 (GDPR); Regulation (EU) 2024/1689 (AI Act); Buolamwini, J., Gebru, T.: *Gender Shades: Intersectional Accuracy Disparities in Commercial Gender Classification* (FAccT 2018); Illinois Biometric Information Privacy Act (740 ILCS 14); ÚOOÚ guidance — [uoou.cz](https://uoou.gov.cz/).*
