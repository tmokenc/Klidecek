---
title: Příklady reputačních systémů a jejich rizika
tier: example
---

# Příklady reputačních systémů a rizika

Teorie ([[vypocet-skore]], [[sitovy-system]]) ožívá v reálných systémech. Projdeme čtyři významné — PageRank, Cisco Talos, NERD — a pak rizika, která reputační systémy přinášejí, včetně čínského sociálního kreditního systému.

## PageRank — hodnocení webových stránek

Propojení webových stránek odkazy URL lze zobrazit jako **orientovaný graf**. PageRank vyjadřuje, že *důležitost stránky odpovídá důležitosti stránek, které na ni odkazují* — je to **model toku** (flow model) z [[vypocet-skore]].

Nechť **B_u** je množina stránek, které *odkazují na* *u*, a **N_v** je počet odkazů vycházejících ze stránky *v*. Hodnocení (ranking) stránky *u*:

::: math
R(u) = c \sum_{v \in B_u} \frac{R(v)}{N_v}
:::

Klíčové myšlenky vzorce:

- **Váha odkazu závisí na hodnocení** stránky, ze které vede — odkaz z důležité stránky váží víc.
- **Váha je normalizována počtem odkazů** stránky (N_v) — stránka, která odkazuje na sto míst, předá každému jen setinu.
- *c* je **normalizační faktor**. Vzorec je **rekurzivní** (R závisí na R), což přináší problém s inicializací a cyklickými odkazy — řeší se iterací.

Prostý počet odkazů nestačí: dvě stránky se stejným počtem příchozích odkazů mohou mít velmi rozdílnou důležitost podle toho, *odkud* odkazy vedou. Implementováno v roce **1998 na Stanfordu** do jednoduchého vyhledávacího stroje zvaného **Google**.

Vyzkoušej iteraci PageRanku na malém grafu — sleduj, jak se skóre rekurzivně ustaluje:

::: viz pds-pagerank
:::

## Cisco Talos Reputation Center

Systém vyvinula firma **IronPort**, dnes je součástí **Cisco Talos Intelligence** (dříve *SenderBase*). Je to reputační databáze pro hodnocení **e-mailů, webových služeb a malwaru**.

- Sbírá data z více než **100 000 sítí** ve světě (IPS, firewally, e-mail/web appliances).
- Vstupní parametry: objem přenesené pošty, open-proxy IP, URL pro spamy a viry, špatně doručené e-maily, konfigurace DNS, blacklisty, whitelisty, počet hopů, webcrawler, země původu — celkem **přibližně 200 vážených atributů**.
- **Reputační skóre odesílatele (dle IP adresy): −10 až +10** (čím dál od nuly, tím průkaznější; −10 = „zaručeně spam", +10 = „zaručeně legitimní").
- **Filtr** e-maily s hodnotou **< −3** (z bad senderů se pošta jednoduše odmítne).

## NERD — Network Entity Reputation Database

**NERD** je síťový reputační systém ([[sitovy-system]]) vyvinutý na **CESNETu** (provozovatel české národní výzkumné a vzdělávací sítě). Obsahuje hodnocení škodlivých zařízení na síti na základě **IP adresy** a počítá *predikci škodlivého chování* — **FMP (Future Misbehaviour Probability)**.

- **Vstupní data:** alerty z detektorů v síti CESNET, primárně systém **Warden** (sdílení bezpečnostních incidentů, formát **IDEA**) a **MISP**; doplňková data z honeypotů, registrace domény, číslo AS, whois, geolokace, blacklisty (DShield), Shodan, TOR exit node.
- **IP address record** drží: timestamp, hlášené události, hostname, zemi/město, ASN, abuse kontakt, blacklisty, typ zařízení a reputační skóre.
- **Výpočet FMP:** pro entitu se sestaví **vektor atributů** *x⃗* (počet alertů, počet detektorů, čas poslední události, interval mezi událostmi přes **EWMA** — Exponentially Weighted Moving Average, …). Systém používá celkem ~58 atributů.
- **Klasifikace strojovým učením:** FMP je výstup klasifikátoru predikujícího, zda entita v okně *w_p* nastane škodlivá událost. Model se trénuje s učitelem — **neuronové sítě (NN)** a **rozhodovací stromy (GBDT)**.

Typické dotazy: „Vypiš škodlivé IP z mé podsítě `147.229.0.0/16`." nebo „Vypiš otevřené DNS resolvery podílející se na DNS amplification útoku."

### Další systémy

| Systém | Co hodnotí | Škála |
| :--- | :--- | :--- |
| **McAfee URL Ticketing** | reputace souborů, webu a e-mailů; IP, porty, protokoly | — |
| **Barracuda BRBL** | IP a doménová jména odesílatelů (Barracuda Reputation Block List) | spam/virový filtr |
| **SenderScore** | profil odesílatele e-mailů (return path), 30denní plovoucí okno | 0 (nejhorší) – 100 (nejlepší) |

## Rizika reputačních systémů

### Soukromí (privacy)

Reputace má i temnou stranu — sběr dat o chování člověka:

- Současné technologie umožňují **sběr velkého množství dat** o aktivitách člověka („*track everything*").
- Data se získávají i ze **spolupráce státních orgánů a soukromých společností**.
- Proces sběru **není vždy viditelný a transparentní** — uživatel neví, kdo sbírá jaká data, za jakým účelem, jak dlouho je uchovává.
- Možná „využití": hodnocení „spolehlivosti" člověka, cílená reklama, sledování politických názorů, **profilování** a personalizovaný přístup.

Tato dystopická logika není nová — varovali před ní George Orwell (*1984*) i Ray Bradbury (*451° Fahrenheita*).

### Čínský sociální kreditní systém

Nejviditelnější realizací „reputace člověka" je **čínský sociální kreditní systém (Social Credit System, SCS)**:

- Koncept finanční spolehlivosti (2007, Čínská lidová banka) se rozšířil na **hodnocení nejen finančního kreditu, ale i společenského chování** (plán 2014–2020, Státní rada ČLR).
- Pilotní projekty (2005–2019) běžely **komerčně** (Sesame Credit od Alibaby, Tencent Credit) i **státně** (města Šen-čen, Šanghaj, …).
- Systém kombinuje **finanční i nefinanční data**: platby, daně, půjčky, obchod, ale i *crime records*, cestování a *social media*.
- Vyhodnocení vede k **odměnám (red list)** — vládní podpora, půjčky, slevy — nebo **postihům (black list)** — omezený přístup k podpoře, cestování, nákupu nemovitostí, vzdělání.
- Charakteristika: **centralizace** datových zdrojů na státní úrovni, navázání na služby státu i komerčních subjektů.

Z hlediska architektury ([[architektura-reputace]]) je to **silně centralizovaný** reputační systém, kde hodnocenou entitou je *člověk* a důsledky skóre zasahují do reálného života — což je přesně to riziko, na které upozorňuje sekce o soukromí.

::: link "Brin, Page: The Anatomy of a Large-Scale Hypertextual Web Search Engine (1998)" "https://snap.stanford.edu/class/cs224w-readings/Brin98Anatomy.pdf"
:::

::: link "Cisco Talos Reputation Center" "https://talosintelligence.com/reputation_center/"
:::

::: link "NERD — Network Entity Reputation Database (CESNET)" "https://nerd.cesnet.cz/"
:::

*Zdroj: PDS — přednáška Reputační systémy, doc. Ing. Petr Matoušek, Ph.D., M.A., FIT VUT v Brně. Externí reference: Page, L., Brin, S., Motwani, R., Winograd, T.: „The PageRank Citation Ranking" (Stanford InfoLab 1999) a Brin, S., Page, L.: „The Anatomy of a Large-Scale Hypertextual Web Search Engine" (WWW 1998); [Cisco Talos Reputation Center](https://talosintelligence.com/reputation_center/); Bartoš, V. et al.: „Network entity characterization and attack prediction" (Future Generation Computer Systems 97, 2019, [DOI 10.1016/j.future.2019.03.016](https://doi.org/10.1016/j.future.2019.03.016)) a [NERD (CESNET)](https://nerd.cesnet.cz/); Creemers, R.: „China's Social Credit System: An Evolving Practice of Control" (SSRN 2018).*
