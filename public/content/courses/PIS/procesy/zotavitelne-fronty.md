# Zotavitelné fronty a reálné události

Předchozí modely ([[zretezene-transakce]], [[distribuovane-transakce]]) řešily *atomicitu*. Zotavitelné fronty řeší jiný problém: jak zajistit, aby **práce, kterou jsme se zavázali vykonat, byla *někdy* vykonána**, i kdyby mezitím systém zhavaroval, restartoval se, nebo akce trvala minuty až dny. Tento mechanismus je přímou cestou ke **workflow systémům** — odtud i podtitul přednášky *„cesta k workflow”*.

## Motivace — proč zotavitelné fronty

Motivaci lze shrnout elegantní formulací:

> *„Aplikace nevyžaduje úzké semknutí akcí do jedné izolované transakce. Stačí zaručit, že po dokončení jedné akce **bude někdy provedena další**.”*

Na rozdíl od zřetězených transakcí může být mezi akcemi **podstatná časová prodleva** — minuty, hodiny, dny. Klasický příklad:

```
objednávka → (časem) → expedice → (časem) → fakturace
```

Expedice a fakturace mohou proběhnout *kdykoli* po úspěšné objednávce — třeba za hodinu (až operátor zpracuje balík), nebo za den (až sklad zboží vychystá). Vázat všechno do jedné transakce by neúnosně blokovalo zdroje.

## Definice zotavitelné fronty

**Zotavitelná fronta** (*recoverable queue*) = mechanismus pro **plánování transakcí k budoucímu vykonání**.

Základní operace:

- **Vlož** — transakce při svém commitu vloží do fronty *záznam o práci*, kterou je třeba později vykonat.
- **Vyber** — jiná transakce (obvykle spouštěná serverem na pozadí) tento záznam **vyzvedne a práci provede**.

Záznam obsahuje *popis akce* a *data potřebná pro předání* (např. ID objednávky, kterou má expediční služba zpracovat).

::: viz recoverable-queue "Procházej krok po kroku producent → fronta → konzument. V libovolném kroku klikni „havárie zde\" a sleduj, co přežije díky XA transakci."
:::

## Vlastnosti zotavitelné fronty

Zotavitelná fronta má dvě klíčové vlastnosti:

1. **Trvanlivost** — fronta musí přežít havárii systému (jinak by se ztratily naplánované akce).
2. **Koordinace s transakcemi:**
   - Vloží-li transakce do fronty záznam a *později je zrušena* (rollback), musí být **záznam z fronty odstraněn**.
   - Vybere-li transakce z fronty záznam a *později je zrušena* (rollback), musí být **záznam do fronty navrácen**.
   - Záznamy od **nepotvrzené transakce** nesmí jiné transakce *vybírat* — viditelnost jen po commitu.

Tedy operace `Vlož` i `Vyber` jsou součástí transakční sémantiky producenta/konzumenta. Tento aspekt řeší v Jakarta EE buď **JMS XA** (broker se chová jako XA resource a JTA ho koordinuje s databází — viz [[jakarta-messaging]]) nebo **idempotentní konzumace** v reaktivních systémech.

## Organizace zotavitelné fronty

### Pipeline — řetěz s pevným uspořádáním

Sekvenční tok: objednávková transakce vloží do expediční fronty → expediční transakce zpracuje a vloží do fakturační fronty → fakturační transakce dokončí.

```
Objednávková  → [Exp. fronta] → Expediční  → [Fakt. fronta] → Fakturační
transakce                       transakce                      transakce
```

### Paralelismus přes fronty

Objednávková transakce vloží záznam do *obou* front najednou (expedice + fakturace). Expediční a fakturační transakce pak běží **paralelně** a nezávisle.

:::svg
<svg viewBox="0 0 540 200" xmlns="http://www.w3.org/2000/svg" style="max-width: 580px;">
  <rect x="0" y="0" width="540" height="200" fill="#f8fafc" rx="8"/>
  <defs>
    <marker id="arrF" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--text-muted)"/>
    </marker>
  </defs>
  <rect x="20"  y="70" width="120" height="50" rx="6" fill="#bfdbfe" stroke="#2563eb"/>
  <text x="80"  y="92" text-anchor="middle" font-family="ui-sans-serif" font-size="12" font-weight="bold" fill="#1e293b">Objednávková</text>
  <text x="80"  y="108" text-anchor="middle" font-family="ui-sans-serif" font-size="11" fill="#1e293b">transakce</text>
  <rect x="180" y="20"  width="100" height="40" rx="6" fill="#fef3c7" stroke="#ca8a04"/>
  <text x="230" y="38"  text-anchor="middle" font-family="ui-sans-serif" font-size="12" font-weight="bold" fill="#1e293b">Exp. fronta</text>
  <text x="230" y="52"  text-anchor="middle" font-family="ui-sans-serif" font-size="10" fill="#1e293b">(trvanlivá)</text>
  <rect x="180" y="135" width="100" height="40" rx="6" fill="#fef3c7" stroke="#ca8a04"/>
  <text x="230" y="153" text-anchor="middle" font-family="ui-sans-serif" font-size="12" font-weight="bold" fill="#1e293b">Fakt. fronta</text>
  <text x="230" y="167" text-anchor="middle" font-family="ui-sans-serif" font-size="10" fill="#1e293b">(trvanlivá)</text>
  <rect x="320" y="20"  width="120" height="40" rx="6" fill="#bbf7d0" stroke="#16a34a"/>
  <text x="380" y="44"  text-anchor="middle" font-family="ui-sans-serif" font-size="12" font-weight="bold" fill="#1e293b">Expediční T</text>
  <rect x="320" y="135" width="120" height="40" rx="6" fill="#fbcfe8" stroke="#be185d"/>
  <text x="380" y="159" text-anchor="middle" font-family="ui-sans-serif" font-size="12" font-weight="bold" fill="#1e293b">Fakturační T</text>
  <line x1="140" y1="80"  x2="178" y2="42"  stroke="var(--text-muted)" stroke-width="2" marker-end="url(#arrF)"/>
  <text x="155" y="62" font-family="ui-sans-serif" font-size="11" fill="#16a34a">vlož</text>
  <line x1="140" y1="108" x2="178" y2="150" stroke="var(--text-muted)" stroke-width="2" marker-end="url(#arrF)"/>
  <text x="155" y="138" font-family="ui-sans-serif" font-size="11" fill="#16a34a">vlož</text>
  <line x1="280" y1="40"  x2="318" y2="40"  stroke="var(--text-muted)" stroke-width="2" marker-end="url(#arrF)"/>
  <text x="295" y="33" font-family="ui-sans-serif" font-size="11" fill="#be185d">vyber</text>
  <line x1="280" y1="155" x2="318" y2="155" stroke="var(--text-muted)" stroke-width="2" marker-end="url(#arrF)"/>
  <text x="295" y="148" font-family="ui-sans-serif" font-size="11" fill="#be185d">vyber</text>
  <text x="475" y="44" font-family="ui-sans-serif" font-size="11" fill="var(--text-muted)">paralelně</text>
  <text x="475" y="159" font-family="ui-sans-serif" font-size="11" fill="var(--text-muted)">paralelně</text>
</svg>
:::

Zákazník tak může dostat fakturu *dříve než zboží* (nebo naopak) — obchodně zcela v pořádku. Fronta **odděluje producenta od konzumenta v čase i prostoru**: producent a konzument *nemusí běžet současně*, *nevědí o sobě navzájem* a komunikují *jen přes frontu*.

## Implementace trvanlivosti fronty

- **Nejjednodušší: tabulka v databázi.** Funkční, ale časté přístupy tvoří **výkonnostní slabinu** (bottleneck) — fronta se stává jediným bodem soutěže.
- **Vhodnější: oddělený aplikační modul (message broker)** — specializovaný systém s optimalizovaným úložištěm. Příklady: **RabbitMQ**, **Apache ActiveMQ Artemis**, **Apache Kafka**, **Amazon SQS**, **IBM MQ**.

Pro Jakarta EE je standardní cestou k message brokeru **Jakarta Messaging (JMS)** — viz [[jakarta-messaging]].

## Reálné události (real-world events)

Některé akce v transakci **nelze vrátit zpět** — když jednou nastanou ve fyzickém světě.

> *Příklad:* Bankomat vydá hotovost → systém zhavaruje před uložením do DB → TPS vrátí databázi do předchozího stavu, ale **bankovky už jsou v ruce klienta**.

Takovým akcím říkáme **reálné (fyzické) události** (*real-world events*). Nemají rollback — nelze logicky vrátit fyzickou změnu světa. **Atomičnost musí být dosažena jinak** — kombinací **dopředného návratu** (roll forward — viz [[zretezene-transakce]]) a **zotavitelné fronty**.

### Řešení s frontami

1. Transakce $T$ **vloží požadavek** na fyzickou akci do fronty $Q$.
2. Pokud je $T$ *zrušena* (rollback) → požadavek je odstraněn z $Q$ (díky koordinaci s transakcí).
3. Pokud je $T$ *potvrzena* (commit) → požadavek **zůstane v $Q$** a fyzická akce se **jistě provede**.
4. **Havárie po commitu**: fronta přežije (je trvanlivá), akce bude provedena po restartu.

### Detekce stavu fyzické události po havárii

Klíčový problém: jak po restartu poznat, zda fyzická akce *již proběhla*, či nikoli?

**Řešení s čítačem:**

- Fyzické zařízení (např. bankomat) obsahuje **čítač $C$** inkrementovaný *atomicky* s každou provedenou akcí.
- Transakce *před commitem* uloží aktuální hodnotu $C$ do databáze jako $D$.
- Po zotavení z havárie systém **porovná $C$ a $D$**:
  - $C = D$ → fyzická akce **nebyla** provedena → **provést znovu** (vzít záznam z fronty a poslat příkaz zařízení).
  - $C \neq D$ → fyzická akce **proběhla** před havárií → **odebrat záznam z fronty** (akce už je hotová).

Tento jednoduchý mechanismus zajistí *přesně jednoho* provedení i přes haváriii.

> **Alternativa: JMS XA transakce.** V Jakarta EE odpadá potřeba explicitního čítače, pokud používáme JMS broker jako XA resource v JTA transakci spolu s DB. Atomická operace „ulož do DB + vlož do fronty” se postará o vše — viz [[jakarta-messaging]].

## Shrnutí — cesta k workflow

Zotavitelné fronty jsou poslední krok před plnohodnotnými **workflow systémy**:

- Umožňují **sekvence i paralelismus** transakcí.
- Tvoří **základ pro složitější workflow** (BPMN, Camunda, Temporal — téma další přednášky).
- Klíčové vlastnosti:
  - **Trvanlivost plánovaných akcí** (přežijí havárii).
  - **Oddělení producenta a konzumenta v čase** (asynchronní zpracování).
  - **Podpora paralelního zpracování nezávislých větví**.

V Jakarta EE realizuje zotavitelné fronty knihovna **Jakarta Messaging** (JMS) a v reaktivních mikroslužbách **MicroProfile Reactive Messaging** — viz [[jakarta-messaging]] a [[messaging-fault-tolerance]].

---

*Zdroj: PIS přednáška 6, doc. Ing. Radek Burget, Ph.D., FIT VUT v Brně. Externí reference: Hohpe, G., Woolf, B.: *Enterprise Integration Patterns* (Addison-Wesley 2003) — *Guaranteed Delivery*, *Durable Subscriber*, *Idempotent Receiver*; AWS dokumentace [Amazon SQS — At-least-once delivery](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues.html).*
