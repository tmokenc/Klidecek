# Problém malého světa — motivace P2P

Předchozí přednášky ([[router-architektura]], [[klasifikace-uvod]]) řešily *centralizované zařízení* — switch, router. Tato přednáška jde opačnou cestou: ukáže, jak se *uživatelé sami* organizují do funkční sítě **bez centrálního prvku** — **peer-to-peer (P2P)** sítí. Teoretickým základem je *problém malého světa*, který má dlouhou historii v sociologii a sítí.

## Stanley Milgram a experiment 1967

V roce 1967 publikoval americký psycholog **Stanley Milgram** v *Psychology Today* studii „The Small World Problem". Výzkumné otázky:

- *Jaká je pravděpodobnost, že se dva náhodně vybraní lidé na světě znají?*
- *Pokud se neznají osobně, přes kolik známých je můžeme propojit?*

Jinak řečeno: jak dlouhý by byl řetězec X-a-b-c-...-y-Z pro propojení libovolných X a Z?

### Teoretická studie MIT (1961)

Pool, Kochen a Gurewich dotazníkovým způsobem zjistili, že *člověk má obvykle ~500 známých*. Pravděpodobnost, že se znají dva Američané, je tedy *1:200 000*. Závěr: *teoreticky* existuje možnost propojení dvou lidí přes okruhy svých známých.

## Dva pohledy na problém malého světa

1. **Optimistický:** Dvě libovolné osoby X a Z kdekoliv na světě lze propojit přes relativně *malý počet* známých.

2. **Pesimistický:** Existují *nepřekonatelné propasti* mezi různými skupinami lidí. Dvě libovolné osoby nelze propojit, neboť okruhy známých nemají *průnik*.

Kdo má pravdu? *Empirický experiment* odpovídal v roce 1967.

## Milgramův experiment

S výzkumným grantem 680 USD Milgram navrhl experiment:

- *Úkol:* doručit dopis příteli v městě **Sharon, Massachusetts**.
- *Odesilatelé:* 160 náhodně vybraných lidí z **Omaha, Nebraska**.
- Vzdálenost: ~2 322 km (zhruba Brno–Madrid).

### Pravidla doručení

- Dopis lze předávat *pouze osobně* skrze známé, které známe *křestním jménem*.
- Odesílatelé mají *dostatek znalostí o adresátech* — jméno, kde bydlí, povolání, kde studoval...
- Dopis předávají *jen na základě svých vlastních znalostí, vazeb a priorit*.
- Po každém předání se na *Harvard pošle potvrzení* o předání → sledování cesty.

### Výzkumné otázky

- *Bude to vůbec fungovat?* Dojde nějaký dopis k cíli?
- *Kolik lidí bude potřeba* pro nalezení adresáta?
- *Jaká bude vzdálenost* v km mezi jednotlivými předáními?

### Výsledek

- *Celkem* bylo odesláno 160 dopisů.
- *K cíli došlo* **44 dopisů**.
- *Některé* dopisy skončily blízko cíle.

Výsledky:

| Statistika | Hodnota |
| :--- | :--- |
| Nejkratší řetězec | **dva** prostředníci |
| Nejdelší řetězec | jedenáct prostředníků |
| **Medián cesty** | **pět** prostředníků |

→ *Malý svět* — stačí **pět prostředníků**.

V populární kultuře to vykrystalizovalo do *Six Degrees of Separation* (John Guare, drama, 1990).

## Další pozorování

Z navazujícího **Kansas Study**:

- *Poměr předávání mezi muži a ženami* — Female → Female 56 případů, Male → Male 58, Female → Male 18, Male → Female 13.
- *Přátelé : příbuzní = 123 : 22*.
- **48 % řetězců použilo *stejné poslední tři uzly*** — místní *gatekeeper* na konci cesty.
- *Vzdálenost předávání se zkracovala směrem k cíli* — *geografické* a *sociální* gradienty se kombinují.

## Shrnutí pro nás

Dvě klíčová pozorování:

1. **Jedinci, kteří využívají pouze lokální informace, jsou velmi efektivní ve vytvoření nejkratší cesty** mezi dvěma body v sociální síti. *Je možné* najít efektivní směrování *založené pouze na lokálních informacích*.
2. **Propojení mezi dvěma jedinci lze najít pomocí malé posloupnosti známých.**

## Aplikační otázky

Pro síťové vědce:

- *Existuje vždy* takový řetězec (cesta) spojující dva libovolné body?
- *Existuje decentralizovaný algoritmus*, který najde takové propojení?
- *Jaká je časová náročnost* výpočtu?

**Jon Kleinberg** (Cornell, 2000) v práci *The Small-world Phenomenon: An Algorithmic Perspective* dokázal, že takový **algoritmus existuje** a stanovil *podmínky pro jeho nalezení* a *hranice výpočtu*.

Kleinbergův výsledek: pokud má graf správnou strukturu (mix krátkých a *dlouhých* propojení s vhodnou distribucí), pak decentralizovaný greedy algoritmus najde cestu mezi libovolnými dvěma uzly v $\mathcal{O}(\log^2 N)$ krocích. To je *zásadní* — síť o miliardě uzlů má mediánovou cestu **~900 kroků**, ne miliardu.

## Sociální sítě v praxi

Moderní sociální sítě potvrzují *small-world* hypotézu:

- **Twitter, 2010:** 5,2 miliardy vztahů, *průměrný stupeň propojení 4,67* (Alex Cheng).
- **Facebook, 2016:** 1,59 miliardy uživatelů (~22 % světové populace), *průměrný stupeň propojení 3,57* (BBC).

Sociologický experiment z roku 1967 tedy dostal *digitální potvrzení* — dnes by tě s libovolným cílem propojily v průměru jen *~4 osoby*.

## Co to znamená pro P2P

Pokud lze vystavit *malý svět* z lokálních znalostí, lze *postavit P2P síť*, kde:

- Každý uzel zná *jen několik sousedů*.
- Vyhledávání objektů funguje *v logaritmickém čase*.
- *Žádné centrální* zařízení.

Toto je *teoretická základna* P2P. Dalo by se říct, že *Milgramův experiment byl 30 let před BitTorrentem*.

## Co dále

Přejdeme k **definici P2P sítí** — co je *overlay*, jak vypadá architektura, jaké jsou *vlastnosti vs. klient-server*. Viz [[p2p-uvod]].

---

*Zdroj: PDS přednáška 7 (Sítě peer-to-peer), doc. Ing. Petr Matoušek, Ph.D., M.A., FIT VUT v Brně. Externí reference: Milgram, S.: „The Small World Problem" (Psychology Today, 67(1):61–67, 1967); Kleinberg, J.: „The Small-world Phenomenon: An Algorithmic Perspective" (STOC 2000, [DOI 10.1145/335305.335325](https://doi.org/10.1145/335305.335325)); Guare, J.: *Six Degrees of Separation* (drama, 1990).*
