---
title: Detekce anomálií — statistika a ML
---

# Detekce anomálií — když signatura nestačí

Signatury ([[signatury-snort]]) chytnou *známé* hrozby; flow monitoring ([[netflow-ipfix]]) vidí *agregát*. Co nový, dosud neviděný útok? Co subtilní změna chování naznačující kompromitaci? **Detekce anomálií** — *statistický* přístup, který modeluje "normálnost" a označuje odchylky. Klíčový pro APT (Advanced Persistent Threat) a zero-day detection.

## Definice anomálie

> **Anomálie** = událost odlišná od *typického* / *očekávaného* chování systému.

Definice úmyslně *vágní*: co je *typické*? Subjektivní, kontextové, časově závislé. Co bylo normální 2015 (HTTP) je dnes anomálie. Provoz v noci může být anomálie *nebo* zápočtový sprint.

Proto je první výzva: **definovat baseline**.

## Proč detekovat anomálie

Klasické use-cases:

- **Zero-day útoky** — neexistuje signatura; chování *liší* od normálu.
- **APT, insider threats** — útočník už *uvnitř*, malware běží *měsíce*; periodický beacon traffic je *anomalie* vůči baseline.
- **DDoS** — náhlý nárůst objemu traffic.
- **Hardware failure** — disk umírá → odchozí RAID resync flood.
- **Konfigurační chyba** — chybný router začne flapovat; flow rates skok.
- **Capacity planning** — anomalie poukazují na *kapacitní limit*.

## Co je "normální"

Tři přístupy:

### 1. Manuální baseline

Expert sleduje provoz, *ručně* nastaví thresholdy. Příklad:

```
if traffic_volume > 5 Gbps  → alert
if dns_queries > 10 000/s   → alert
```

Jednoduché, *přesné* (expert ví, co očekávat), ale:

- *Nekonsistentní* mezi sítěmi (5 Gbps je velký, pro páteř malý).
- *Statické* — síť roste, thresholdy musí.
- *Pracné* — neškáluje na tisíce metrik.

### 2. Statistický baseline

Spočítej *průměr* a *směrodatnou odchylku* z historického traffic. Anomalie = odchylka > N·σ.

**Rolling window**: posledních 7 dní → baseline. Sníží *seasonality* (pondělí ≠ neděle).

$$
\text{anomaly} = |x_t - \bar{x}_{[t-7d, t]}| > 3 \cdot \sigma_{[t-7d, t]}
$$

Lépe: **EWMA** (exponentially weighted moving average) — nedávná data váží víc.

### 3. ML model

Strojové učení modeluje *vícerozměrný* baseline. Typické přístupy:

- **Unsupervised** — Isolation Forest, One-Class SVM, autoencoder. *Bez anotací* — model se sám naučí "normální" rozdělení dat, ostatní = anomalie.
- **Supervised** — trained on labeled "normal" + "attack" dataset. Logistic regression, Random Forest, Gradient Boosting, deep nets.
- **Semi-supervised** — část dat anotována.

## Hlavní výzvy ML přístupů

### Anotovaná data

> *"Anotovaná data nikdo nemá, a pokud má, je to z jiné sítě."*

Klasický problém ML v IDS. Veřejné datasety:

- **KDD'99** (1999) — *legendárně* zastaralá. Stále se cituje.
- **NSL-KDD** — verbose verze, stále outdated.
- **CIC-IDS2017, CIC-IDS2018** (University of New Brunswick) — modernější, ale *syntheticky* generované.
- **UNSW-NB15** — University of New South Wales.

Problém: model trénovaný na CIC-IDS2017 dosáhne 99.9 % accuracy na *tom* datasetu, ale **selže** v reálném nasazení — síťová charakteristika je *jiná*.

Realistický postup: **u zákazníka** vytvořit dataset z jeho provozu. Cisco's old "Talos" intelligence collected from customer base.

### False positive rate

V praxi *nejdůležitější* metrika. False positive = "alert na normální chování". Když IDS hlásí *desítky* alertů za hodinu, *operátor je vypne*.

> *"Nepřijdeme o to, že nechytíme všechno, ale o to, když nás zaplaví false positives, je smrtelná."*

Typický enterprise SOC tolerovat *jednotky* alertů denně. ML model s precision 99 % na páteři s milionem flow/s generuje **10 000 false positives denně** — *nepoužitelné*.

Trade-off:

- *Sensitivity* (recall) — kolik *skutečných* anomálií chytíme.
- *Specificity* — kolik *normálních* správně nehlásíme.

V praxi preferujeme *vyšší specificity* na úkor *sensitivity* — radši propustíme některý útok, než zaplavili dashboard šumem.

### Concept drift

Síťový provoz *se mění v čase*:

- Nová aplikace nasazena.
- Software update mění *patterns* (HTTP/1 → HTTP/2 → HTTP/3).
- Maintenance window — anomálie *legitimní*.

Model musí být *přeučován*. Best practice: **online learning** s sliding window, nebo periodické retraining (daily, weekly).

### Vysvětlitelnost

Když IDS hlásí *"anomálie!"* — operátor se ptá *proč*? Black-box deep net to neřekne.

Explainable AI (LIME, SHAP) trochu pomáhá; v praxi se preferují *interpretable* modely (Random Forest s feature importance, decision trees).

## Statistické metody

Pro *parametrické* baseline, kde lze předpokládat distribuci:

### 3-sigma rule (Gaussian)

$$
P(|X - \mu| > 3\sigma) \approx 0{,}003
$$

Pokud `x` >3σ od průměru → 0,3 % šance → anomálie. Funguje *jen* pro Gaussian-distributed metriky. Network traffic *typicky není* — heavy-tailed distribuce.

### CUSUM (Cumulative Sum)

Detekuje *postupné drifty* — pomalé změny průměru. Akumuluje rozdíly $(x_t - \mu)$; když součet překročí threshold → změna.

### EWMA control chart

Exponential weighted MA s control limits. Klasický nástroj statistical process control.

### Median + MAD

Robustní vůči outliers v baseline (oproti mean+std). MAD = Median Absolute Deviation. Anomalie: $|x - \text{med}| / \text{MAD} > k$.

## ML modely v IDS

### Isolation Forest

[Liu, Ting, Zhou (2008)](https://dl.acm.org/doi/10.1109/ICDM.2008.17). *Anomalie se izoluje rychleji* než normální body — random partitioning trees.

Komplexita $\mathcal{O}(n \log n)$, paměťově nenáročné, *unsupervised*. Default volba pro mnoho IDS systémů.

### One-Class SVM

Naučí *hranici* normální množiny. Body za hranicí = anomalie. Sensitive na parametry, drahý trénink.

### Autoencoder

Neural net trained reconstructovat *normální* data. Pokud rekonstrukce má vysokou chybu → anomalie. Funguje dobře pro vysokorozměrná data (per-packet features).

### LSTM / Transformer pro sequence data

Pro time-series traffic. Modeluje *sekvenci* paketů (port-knocking, beaconing detection).

## Případ studie — IEC 104

Lecture cituje *konkrétní* případ: **IEC 60870-5-104** — průmyslový protokol pro SCADA/PLC v elektrických rozvodnách.

Charakteristiky:

- Master-slave protokol, *omezená* sada příkazů.
- Komunikuje *zařízení-zařízení*; uživatelské proměnnost minimální.
- Síť **stabilní** — počet zařízení se nemění, instalace fyzická.

To z IEC 104 dělá **ideální** scénář pro anomálie:

- Baseline = sekvence komunikací mezi `(master, slave)`.
- Z flow záznamů s aplikační metadatou (rozšířený IPFIX) lze získat *typu příkazu* per paket.
- Model = *konečný automat* legitimních sekvencí.
- Anomalie = příkaz, který v baseline neexistuje.

Pak v 2015/2016 — útok na **ukrajinskou energetiku**: útočníci se dostali do řídícího počítače phishingem. V roce 2015 (BlackEnergy 3) ovládli breakery *ručně* přes unesené operátorské stanice / HMI, ne přes vlastní IEC 104 provoz. V roce 2016 už malware **Industroyer** (CrashOverride) nativně mluvil IEC 60870-5-104 a *automaticky* posílal *legitimně vypadající* příkazy → výpadek dodávky elektřiny. **Měřená IEC anomalie** by to detekovala — *kombinace příkazů* (vypnutí breakeru bez předchozího warning) v baseline *neexistovala*.

Otázka cvičení: jak modelovat *množinu povolených sekvencí*? Odpověď: **konečný automat / regulární gramatika** — formální popis povolených string of commands. Skok do TIN (teorie automatů) tady okamžitý — to, čemu se učíte ve formálních jazycích, se přímo aplikuje na network anomaly detection.

## Důsledky a best practices

1. **Minimalizovat FP** — *primárně* metrika v enterprise.
2. **Trénovat na zákaznickém datasetu** — generic modely selhávají.
3. **Retraining periodický** — concept drift.
4. **Hybrid** — kombinuj signatury (známé) + anomalie (neznámé) + correlation rules (SIEM).
5. **Whitelist maintenance windows** — disable detection během plánované údržby.

## Co dál

IDS kapitola končí. Klíčové take-aways:

- *Identifikace* + *anomalie detection* = dva ortogonální nástroje.
- *Šifrování* posunulo focus z payload na **metadata** (JA4, behavioral patterns).
- *ML* není silver bullet — *false positives* vás zabijí.

Příští přednáška ([[zpracovani-uvod]]) se vrátí k *fyzice* — jak router skutečně zpracuje paket, queue management, scheduling, fast-path vs slow-path.

---

*Zdroj: PDS přednáška 8 (IDS), doc. Ing. Petr Matoušek, Ph.D., M.A., FIT VUT v Brně. Externí reference: Chandola, V., Banerjee, A., Kumar, V.: „Anomaly Detection: A Survey" (ACM Computing Surveys 41(3), 2009, [DOI 10.1145/1541880.1541882](https://doi.org/10.1145/1541880.1541882)); Liu, F.T., Ting, K.M., Zhou, Z.: „Isolation Forest" (IEEE ICDM 2008); [CIC-IDS2017 dataset](https://www.unb.ca/cic/datasets/ids-2017.html); Sharafaldin, I. et al.: „Toward Generating a New Intrusion Detection Dataset" (ICISSP 2018); Cherepanov, A.: *Industroyer: Threat to Critical Infrastructure* (ESET Whitepaper 2017); Matoušek, P. et al.: „Industrial Control System Traffic Data Sets for Intrusion Detection Research" (CSP 2020).*
