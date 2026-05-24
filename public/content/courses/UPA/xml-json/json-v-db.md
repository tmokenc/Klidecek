---
title: JSON v SQL a NoSQL databázích
---

# JSON v SQL a NoSQL databázích

JSON je dnes podporován prakticky každou moderní databází — od relačních (PostgreSQL, MySQL, Oracle, SQL Server) až po NoSQL (MongoDB, CouchDB, DynamoDB). V SQL byl JSON datový typ standardizován v **SQL:2016** (i když ne všude implementován jako typ — někde jen jako funkce nad textem). V NoSQL je JSON přirozený formát dokumentů — MongoDB ukládá BSON (binární JSON variant), Couchbase, DynamoDB rovněž. Pochopení JSON podpory v různých systémech je klíčové pro správný návrh moderních aplikací.

## SQL:2016 — JSON funkce

SQL:2016 zavedl rodinu funkcí pro práci s JSON daty *uvnitř* textových SQL typů (`VARCHAR`, `CLOB`). Nezavedl však zvláštní `JSON` datový typ (na rozdíl od XML, který byl zaveden v SQL:2003). SQL:2023 zavedl datový typ `JSON` explicitně.

### Funkce pro vytvoření JSON

```sql
-- json_object — tvorba objektu
SELECT json_object('id' VALUE 10, 'name' VALUE 'Anna') FROM dual;
-- → {"id":10,"name":"Anna"}

-- json_array — tvorba pole
SELECT json_array('a', 'b', 'c') FROM dual;
-- → ["a","b","c"]

-- složené tvoření
SELECT json_array(
  json_object('id' VALUE 10, 'name' VALUE 'Anna'),
  json_object('id' VALUE 20, 'name' VALUE 'Bob')
) FROM dual;
-- → [{"id":10,"name":"Anna"},{"id":20,"name":"Bob"}]
```

### Funkce pro dotazování JSON

```sql
-- json_exists — testuje, zda JSONPath najde uzel
SELECT * FROM t WHERE json_exists(jcol, '$.email');

-- json_value — extrakce skalární hodnoty
SELECT json_value(jcol, '$.name') FROM t;

-- json_query — extrakce JSON fragmentu (objekt/pole)
SELECT json_query(jcol, '$.address') FROM t;

-- json_table — JSON jako relační tabulka
SELECT jt.* FROM t,
  JSON_TABLE(jcol, '$[*]' COLUMNS (
    id   NUMERIC      PATH '$.id',
    name VARCHAR(255) PATH '$.name'
  )) jt
WHERE json_exists(jcol, '$.id');
```

### JSONPath v SQL

SQL:2016 standardizuje **SQL/JSON Path** — variantu JSONPath:
* `$` — kořen
* `.` — člen objektu
* `[]` — index pole
* `*` — wildcard
* `?(...)` — filter expression

## PostgreSQL — jsonb

PostgreSQL má dva JSON typy:

* **`json`** — text-based, zachovává původní bity (whitespace, pořadí klíčů, duplicity).
* **`jsonb`** — *binary*, parsovaný, indexovatelný, žádné duplicity klíčů, klíče seřazené. Preferován pro production.

```sql
CREATE TABLE products (
  id    SERIAL PRIMARY KEY,
  data  JSONB
);

INSERT INTO products (data) VALUES
  ('{"name":"Beer","price":50,"tags":["alcohol","pivo"]}'),
  ('{"name":"Wine","price":120,"tags":["alcohol","vino"]}');

-- operátory:
-- ->   získej JSON
-- ->>  získej text
-- @>   contains (substruktura)
-- ?    má klíč
-- ?|   má libovolný z klíčů
-- ?&   má všechny klíče

SELECT data->>'name' AS name, (data->>'price')::int AS price
FROM products
WHERE data @> '{"tags":["alcohol"]}';

-- GIN index pro JSONB — rychlé dotazy na obsah
CREATE INDEX idx_products_data ON products USING GIN (data jsonb_path_ops);

SELECT * FROM products WHERE data @> '{"price":50}';
   -- využije GIN index
```

PostgreSQL JSONB je *velmi výkonný* — kombinuje flexibilitu NoSQL s transakční konzistencí RDBMS. Často se používá místo dokumentové DB pro hybrid aplikace.

## MySQL — JSON typ

MySQL 5.7+ má **`JSON`** datový typ s validací při insertu. Funkce: `JSON_EXTRACT`, `JSON_SET`, `JSON_REMOVE`, `JSON_CONTAINS`, atd.

```sql
CREATE TABLE products (
  id   INT PRIMARY KEY,
  data JSON
);

INSERT INTO products VALUES (1, '{"name":"Beer","price":50}');

SELECT JSON_EXTRACT(data, '$.name'), data->>'$.price'
FROM products
WHERE data->'$.price' > 30;
```

MySQL JSON je *méně optimalizovaný* než PostgreSQL JSONB — chybí native indexy nad JSON polemi (lze obejít přes *generated columns*).

## SQL Server — JSON jako string + funkce

MS SQL Server od 2016 nemá samostatný JSON typ — JSON ukládá v `NVARCHAR(MAX)`. Funkce: `JSON_VALUE`, `JSON_QUERY`, `JSON_MODIFY`, `OPENJSON`.

```sql
SELECT JSON_VALUE(data, '$.name') AS name
FROM products
WHERE JSON_VALUE(data, '$.price') > 30
  AND ISJSON(data) = 1;
```

## Oracle — JSON datový typ

Oracle 21c+ má nativní `JSON` typ s binární reprezentací (OSON). Předtím se používal `BLOB CHECK (col IS JSON)`.

```sql
CREATE TABLE products (
  id   NUMBER PRIMARY KEY,
  data JSON
);

INSERT INTO products VALUES (1, '{"name":"Beer","price":50}');

SELECT data.name, data.price
FROM products
WHERE data.price > 30;
   -- Oracle "dot notation" — přístup přímo přes pole
```

## JSON v NoSQL databázích

### MongoDB

JSON (přesněji BSON — Binary JSON) je **primárním** datovým modelem MongoDB. Každý dokument je BSON objekt s `_id` polem (`ObjectId`).

```javascript
db.products.insertOne({
  name: "Beer",
  price: 50,
  tags: ["alcohol", "pivo"],
  inventory: { count: 200, warehouse: "Brno" }
});

db.products.find({
  "tags": "alcohol",
  "price": { $lt: 100 }
}, {
  name: 1, price: 1, _id: 0
});
```

MongoDB má bohaté dotazovací funkce přes JSON:
* `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, `$nin`
* `$and`, `$or`, `$not`, `$nor`
* `$exists`, `$type`
* `$regex` pro string matching
* `$elemMatch` pro pole
* `$expr` pro výrazy nad poli

### Couchbase

Couchbase používá JSON dokumenty + **N1QL** (NoSQL query language podobný SQL).

```sql
SELECT name, price FROM products
WHERE ARRAY_CONTAINS(tags, "alcohol") AND price < 100;
```

### DynamoDB

DynamoDB ukládá data jako JSON-like dokumenty s `DynamoDB JSON` (varianta s typovými prefixy):

```json
{
  "id": {"N": "1"},
  "name": {"S": "Beer"},
  "price": {"N": "50"},
  "tags": {"L": [{"S": "alcohol"}, {"S": "pivo"}]}
}
```

### Elasticsearch

Elasticsearch je *search engine*, ale primárně se chová jako dokumentová DB s JSON úložištěm:

```json
PUT /products/_doc/1
{
  "name": "Beer",
  "price": 50,
  "description": "A pale lager beer brewed in Plzen"
}

GET /products/_search
{
  "query": {
    "match": { "description": "lager beer" }
  }
}
```

## Schema-on-write vs. schema-on-read

JSON v databázích umožňuje *schema-on-read* — DB nevynucuje strukturu při zápisu, validuje až při čtení (pokud aplikace ji vyžaduje). Výhody:

* **Flexibilita** — různé dokumenty v jedné kolekci mohou mít různá pole.
* **Snadná evoluce** — přidání pole nevyžaduje `ALTER TABLE`.
* **Agile vývoj** — schéma se vyvíjí během vývoje.

Nevýhody:
* **Konzistence dat** — bez validace mohou vzniknout dokumenty s typovými chybami, chybějícími poli.
* **Optimalizace** — DB optimalizátor má méně informací (typy nejsou předdeklarované).
* **Reportingovou kompatibilita** — BI nástroje potřebují stabilní schéma.

V praxi se používá *gradient*: striktní validace pro kritická pole + flexibilita pro doplňková. MongoDB má **schema validation** (od 3.2), PostgreSQL JSONB má **CHECK constraints** s JSON Schema.

## JSON vs. relační schéma — výběr

| Use case | Doporučení |
| :--- | :--- |
| **Striktně strukturovaná data** | klasické tabulky |
| **Semi-strukturovaná, polymorfní** | JSON v RDBMS (JSONB) nebo dokumentová DB |
| **Dynamická pole (per-row)** | JSON |
| **Reporting nad daty** | klasické tabulky (lepší performance) |
| **API gateway pro různá data** | JSON (flexibilita) |
| **Logy / audit trail** | JSON Lines, JSONB s GIN |

## Hybrid přístup — PostgreSQL JSONB

PostgreSQL JSONB se *často* používá jako *náhrada* dokumentové DB. Kombinuje:
* ACID transakce — silnější garance než MongoDB.
* SQL — známý jazyk, JOIN, agregace.
* JSON — flexibilita strukturní.
* Indexy — GIN/GiST/B-tree, lze indexovat libovolné cesty.

Tato kombinace pokrývá ~80 % case-use, pro které by se jinak nasadila MongoDB. Pro extrémně velké datasety nebo write-heavy use cases je MongoDB stále lepší (sharding, kompaktnější BSON).

Více o XML alternativě v [[xml-v-db]] a o NoSQL volbě v [[typy-nosql]].

::: link "PostgreSQL JSON Functions and Operators" "https://www.postgresql.org/docs/current/functions-json.html"
:::

::: link "MongoDB JSON / BSON specification" "https://bsonspec.org/"
:::

::: link "SQL:2016 — What's New (Markus Winand)" "https://modern-sql.com/blog/2017-06/whats-new-in-sql-2016"
:::

---

*Zdroj: UPA přednáška *XML and JSON in Databases* (Rychlý, 25. listopadu 2025). Externí reference: ISO/IEC 9075-2:2016, SQL/Foundation, JSON; Karwin, B.: *Better JSON in PostgreSQL with JSONB*, 2014; Banker, K. et al.: *MongoDB in Action*, 2nd ed., Manning 2016; Winand, M.: *Modern SQL — JSON in SQL:2016*, 2017.*
