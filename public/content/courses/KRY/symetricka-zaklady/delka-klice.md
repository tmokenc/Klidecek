---
title: Délka klíče a bezpečnost
---

# Délka klíče a bezpečnost

Pro **dobře navrženou** symetrickou šifru je jediný známý útok **brute force** — proběhnout všechny klíče a hledat ten, který produkuje smysluplný plaintext. Bezpečnost je pak jednoduše určena $|\mathcal{K}|$, velikostí klíčového prostoru. Otázka *kolik bitů klíče stačí* je proto otázka *kolik výpočetní práce* je útočník schopen vykonat, a jak rychle ten odhad poroste.

## Útok hrubou silou — kalibrace

Pro klíč délky $k$ bitů je $|\mathcal{K}| = 2^k$. Očekávaný čas brute-force útoku:

::: math
T_{\text{brute}} = \frac{2^k}{2 v},
:::

kde $v$ je rychlost útočníka (klíčů testovaných za sekundu). Pro porovnání:

| Útočník | $v$ (klíčů/s) | $v \cdot$ rok |
| :--- | :-: | :-: |
| 1 CPU jádro (SW) | $10^7$ | $\approx 2^{48}$ |
| 1 GPU (RTX 4090) | $10^{10}$ | $\approx 2^{58}$ |
| 1 ASIC (EFF DES Cracker) | $9 \cdot 10^{10}$ | $\approx 2^{61}$ |
| Bitcoin síť 2024 (jako analogie SHA-256) | $4 \cdot 10^{20}$ | $\approx 2^{93}$ |
| Hypotetický kvantový (Grover) | — | $|\mathcal{K}|^{1/2}$ klíčů |

> **Důležité:** Bitcoin síť počítá SHA-256, ne AES. Zvládne sice cca $2^{93}$ SHA-256 operací za rok, ale to není práce na AES a po normalizaci na AES je řád výrazně nižší. AES-128 na úrovni $2^{128}$ tak zůstává zcela mimo dosah.

## Historie reálných útoků na DES

DES (1977, 56bitový klíč) zastaral už při návrhu — kritici z akademie (Diffie, Hellman 1977) tvrdili, že 56 bitů je *záměrně oslabený* vůči původním 64 bitům IBM. NSA potvrdila po desetiletích, že na zkrácení tlačila s ohledem na schopnost vlastních útoků.

| Datum | Délka klíče | Čas | Zařízení |
| :--- | :-: | :-: | :--- |
| 8/1995 | 40 b | 8 dní | 120 počítačů + 2 superpočítače |
| 1/1997 | 40 b | 3,5 hodiny | 250 počítačů |
| 2/1997 | 48 b | 13 dní | 3 500 počítačů |
| 6/1997 | 56 b | 4 měsíce | 78 000 počítačů (DESCHALL) |
| 2/1998 | 56 b | 39 dní | 22 000 lidí (distributed.net) |
| 7/1998 | 56 b | 56 hodin | **EFF DES Cracker** ($250 K, 1 728 ASIC čipů) |
| 1/1999 | 56 b | 22 hodin | EFF + distributed.net |

EFF DES Cracker definitivně ukázal, že 56 bitů *nestačí* — *jednorázové* zařízení za čtvrt milionu dolarů prolomilo klíč za den. NSA budovala kombinatorické DES crackery od 70. let; akademická demonstrace EFF z 1998 byla pouze publikací dlouho známé reality.

## Doporučené délky klíčů — moderní

NIST SP 800-57 Part 1 Rev. 5 (2020) doporučuje:

| Symetrická | Asymetrická (RSA) | ECC | Hash | Bezpečnostní úroveň | Doporučeno do |
| :-: | :-: | :-: | :-: | :-: | :-: |
| 80 b | 1024 b | 160 b | 160 b | $2^{80}$ | *Legacy, do 2030* |
| 112 b | 2048 b | 224 b | 224 b | $2^{112}$ | do 2030+ |
| 128 b | 3072 b | 256 b | 256 b | $2^{128}$ | dlouhodobé použití |
| 192 b | 7680 b | 384 b | 384 b | $2^{192}$ | high-assurance |
| 256 b | 15360 b | 512 b | 512 b | $2^{256}$ | top-secret, dlouhodobý archiv |

> Bezpečnostní úroveň $n$ bitů znamená: nejlepší známý útok vyžaduje cca $2^n$ operací. AES-128 má úroveň 128 b *protože* žádný útok lepší než brute force není znám. (Nejlepší známý: biclique útok 2011, sníží na $\approx 2^{126}$ — prakticky bezvýznamné.)

## Lov na klíč — meet-in-the-middle, time-memory tradeoff

Naivní brute force $|\mathcal{K}|$ operací lze někdy *zrychlit* na úkor paměti.

### Meet-in-the-middle (MITM)

Pro šifru typu $E_K(M) = E_{K_2}(E_{K_1}(M))$ (např. dvojitý DES) máme zdánlivě 112 bitů klíče = $2^{112}$ kombinací. Útok ale:

1. Pro každý $K_1$ spočti $X = E_{K_1}(M)$, ulož $(K_1, X)$ do hash-tabulky. Čas $2^{56}$, paměť $2^{56}$.
2. Pro každý $K_2$ spočti $Y = D_{K_2}(C)$, vyhledej $Y$ v tabulce. Pokud najdeš shodu, máš kandidát $(K_1, K_2)$.

Celkový čas: $2 \cdot 2^{56} = 2^{57}$ — prakticky stejně jako *jednoduchý* DES! Proto se 2DES nepoužívá; **3DES** s minimálně 2 nezávislými klíči ($K_1, K_2, K_3$ s $K_3 = K_1$ nebo všechny tři nezávislé) dává 112 nebo 168 bitů efektivní bezpečnosti.

### Time-Memory Trade-Off (TMTO)

Hellman (1980): předpočítaná tabulka pro rychlejší útok. **Rainbow tables** (Oechslin 2003) jsou praktická aplikace pro hashe hesel:

* Předzpracování: pro každý "začátek řetězce" iterativně aplikuj hash + redukční funkci $\to$ ulož pouze (začátek, konec) řetězce. Tabulka pokrývá miliony klíčů, ale paměťově je vejde do GB.
* Útok: dáno $h$, aplikuj redukční funkci a hashe, dokud nedosáhneš konce nějakého řetězce. Pak prošvitř ten řetězec od začátku a najdi konkrétní klíč.

TMTO snižuje "online" čas útoku na úkor "preprocesního" času a paměti. Pro 56bitový DES: 1.5 TB tabulka, online útok za sekundy.

> **Obrana:** sůl (salt). Pro každého uživatele unikátní `salt`, hash je $h(\mathrm{salt} \| \mathrm{password})$. Předpočítaná tabulka pro jeden salt je k ničemu pro jiný salt → útočník musí počítat tabulku zvlášť pro každého uživatele. Viz [[kdf]].

## Kvantové útoky

* **Groverův algoritmus** (1996) — kvantový search v $2^k$ prostoru za $2^{k/2}$ operací. Pro AES-128 to znamená $2^{64}$ kvantových operací — *teoreticky proveditelné, prakticky vyžaduje miliony stabilních qubits* — žádný takový stroj neexistuje a do 2040+ nebude.
* **Shorův algoritmus** (1994) — kvantová faktorizace v polynomiálním čase. *Ohrožuje RSA, DH a ECC*, nikoli symetrickou kryptografii.

**Důsledek pro symetrickou kryptografii:** zdvojit klíče. AES-256 dává s Groverem cca 128bitovou bezpečnost — stále dostatečnou pro dohlednou dobu. NSA Commercial National Security Algorithm Suite 2.0 (2022) doporučuje **AES-256** pro post-kvantový přechod.

## Když 128 bitů nestačí

Existují scénáře, kde i 128 bitů může být v budoucnu nedostatečné:

1. **Long-term archive.** Dokument zašifrovaný dnes musí zůstat tajný 50+ let. Pak je třeba předpokládat *exponenciální* růst výpočetní kapacity a Mooreův zákon (přestože zpomalil) → volba 256 bitů.
2. **Vysoká hodnota cíle.** Top-secret zprávy nemají úroveň "akceptabilní riziko 2^120" — vyžadují $> 2^{256}$ matematickou rezervu.
3. **Multi-target útoky.** Pokud útočník hledá *jakýkoli* klíč ze sady $N$ (např. všechny uživatele systému), úloha se zjednoduší o $\log_2 N$ bitů. Pro 1 mld. uživatelů ($N = 2^{30}$) AES-128 efektivně padne na 98 bitů. Obrana: per-user salting.

## Klíč ≠ hesla

Lidská hesla nejsou klíče. *Entropie* lidského hesla je typicky 30–50 bitů, i když je dlouhé. To je důvod, proč:

* **Klíče se generují CSPRNG** (cryptographically secure pseudo-random number generator) — `/dev/urandom`, `getentropy()`, `getrandom()`.
* **Z hesla se klíč odvozuje pomocí KDF** ([[kdf|Argon2, PBKDF2, scrypt]]) — záměrně pomalou funkcí. Brute force hesel je tak omezen rychlostí KDF, ne rychlostí AES.

---

*Zdroj: KRY přednášky 2025/26, KRY 3 — Symetrické algoritmy. Externí reference: NIST SP 800-57 Part 1 Rev. 5: Recommendation for Key Management — Part 1: General (2020); Diffie, W., Hellman, M.: "Exhaustive Cryptanalysis of the NBS Data Encryption Standard", Computer 10(6), 1977; Electronic Frontier Foundation: *Cracking DES* (O'Reilly 1998); Grover, L.: "A fast quantum mechanical algorithm for database search", STOC 1996; Oechslin, P.: "Making a Faster Cryptanalytic Time-Memory Trade-Off", CRYPTO 2003.*
