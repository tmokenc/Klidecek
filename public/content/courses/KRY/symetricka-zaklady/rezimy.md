---
title: Režimy činnosti blokových šifer
---

# Režimy činnosti blokových šifer

Bloková šifra zpracuje vždy *jediný* blok pevné velikosti (typicky 128 bitů u AES). Pro reálné zprávy, které jsou delší než blok, je třeba **režim činnosti** (mode of operation) — algoritmus, který určí, *jak* se postupně šifrují jednotlivé bloky a *jak* mezi nimi přetéká stav. Volba režimu je *zásadní* — špatný režim umožní útok i s perfektně bezpečnou šifrou. Příklad: AES je matematicky robustní, ale v ECB režimu uniká strukturu obrazu (slavný "ECB Tux").

## ECB — Electronic Codebook

Nejjednodušší (a *nebezpečný*) režim: každý blok plaintextu se nezávisle šifruje.

::: math
C_i = E_K(M_i).
:::

::: svg "ECB režim — slabost: identické bloky → identické šifrované bloky"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="20"  y="40" width="80"  height="40" rx="6"/>
    <rect x="120" y="40" width="80"  height="40" rx="6"/>
    <rect x="220" y="40" width="80"  height="40" rx="6"/>
    <rect x="20"  y="140" width="80" height="40" rx="6"/>
    <rect x="120" y="140" width="80" height="40" rx="6"/>
    <rect x="220" y="140" width="80" height="40" rx="6"/>
    <rect x="350" y="90" width="80" height="40" rx="6"/>
  </g>
  <g fill="var(--text)" font-family="var(--font-mono)" text-anchor="middle" font-size="13">
    <text x="60"  y="64">M_1</text>
    <text x="160" y="64">M_2</text>
    <text x="260" y="64">M_3</text>
    <text x="60"  y="164">C_1</text>
    <text x="160" y="164">C_2</text>
    <text x="260" y="164">C_3</text>
    <text x="390" y="114">E_K</text>
  </g>
  <g stroke="var(--accent)" fill="none">
    <path d="M60,80 L60,140"/>
    <path d="M160,80 L160,140"/>
    <path d="M260,80 L260,140"/>
  </g>
  <g fill="var(--text-muted)" font-size="10.5">
    <text x="80" y="105">↓ E_K</text>
    <text x="180" y="105">↓ E_K</text>
    <text x="280" y="105">↓ E_K</text>
    <text x="535" y="118" text-anchor="end">M_1 = M_3 ⇒ C_1 = C_3</text>
    <text x="535" y="134" text-anchor="end">⚠ Únik struktury!</text>
  </g>
</svg>
:::

### Slabosti ECB

* **Identické bloky → identické šifrované.** Plaintext s opakujícími se vzory (např. bitmapový obrázek, struktura souboru) viditelně prosvítá v ciphertextu. Slavný experiment: bitmapová podoba Tuxe v ECB zůstane snadno rozeznatelná.
* **Blok-pozice je nezávislá.** Útočník může bloky přeskupit, smazat, vložit — nedetekuje se.
* **Žádná autentizace.** Bit-flipping změní celý odpovídající blok plaintextu na náhodu, ale neslouží jako alarm.

> Pravidlo: **ECB nikdy nepoužívat pro zprávy delší než jeden blok.** Praktické scénáře, kde je akceptovatelný: 128-bitový hash nebo identifikátor, kde víme, že je *náhodný a unikátní*.

::: viz ecb-tux "Slavný \"ECB Tux\" demo. Přepínejte mezi režimy — v ECB plochy pozadí zachovají strukturu, v CBC/CTR/GCM vypadá ciphertext jako náhoda. AES je matematicky robustní, ale v ECB unikne strukturu obrazu."
:::

## CBC — Cipher Block Chaining

Standardní režim 80. a 90. let. Plaintext blok se *před* šifrováním XORuje s předchozím ciphertextem (pro první blok s *inicializačním vektorem* IV):

::: math
C_0 = \mathrm{IV}, \qquad C_i = E_K(M_i \oplus C_{i-1}).
:::

::: svg "CBC režim — řetězení bloků skrz XOR s předchozím C_{i-1}"
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <defs>
    <marker id="aCBC" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="20"  y="20" width="80" height="30" rx="4"/>
    <rect x="20"  y="70" width="80" height="30" rx="4"/>
    <rect x="20"  y="130" width="80" height="30" rx="4"/>
    <rect x="180" y="20" width="80" height="30" rx="4"/>
    <rect x="180" y="70" width="80" height="30" rx="4"/>
    <rect x="180" y="130" width="80" height="30" rx="4"/>
    <rect x="340" y="20" width="80" height="30" rx="4"/>
    <rect x="340" y="70" width="80" height="30" rx="4"/>
    <rect x="340" y="130" width="80" height="30" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-family="var(--font-mono)" font-size="12">
    <text x="60"  y="40">M_1</text>
    <text x="60"  y="90">M_2</text>
    <text x="60"  y="150">M_3</text>
    <text x="220" y="40">⊕ IV</text>
    <text x="220" y="90">⊕ C_1</text>
    <text x="220" y="150">⊕ C_2</text>
    <text x="380" y="40">E_K → C_1</text>
    <text x="380" y="90">E_K → C_2</text>
    <text x="380" y="150">E_K → C_3</text>
  </g>
  <g stroke="var(--accent)" fill="none" marker-end="url(#aCBC)">
    <path d="M100,35 L180,35"/>
    <path d="M100,85 L180,85"/>
    <path d="M100,145 L180,145"/>
    <path d="M260,35 L340,35"/>
    <path d="M260,85 L340,85"/>
    <path d="M260,145 L340,145"/>
  </g>
  <g stroke="var(--text-muted)" stroke-dasharray="3 3" fill="none" marker-end="url(#aCBC)">
    <path d="M420,40 Q470,60 220,75"/>
    <path d="M420,90 Q470,110 220,135"/>
  </g>
</svg>
:::

### Vlastnosti CBC

* **Identické plaintext bloky** se obvykle šifrují *jinak*, protože $C_{i-1}$ je různý. Únik struktury je eliminován.
* **Šifrování je inherentně sekvenční** — $C_i$ závisí na $C_{i-1}$. **Dešifrování lze paralelizovat** ($M_i = D_K(C_i) \oplus C_{i-1}$).
* **IV musí být nepředvídatelný.** Doslova: ne sekvenční čítač, ne časové razítko, ale výstup CSPRNG. Předvídatelný IV → CPA útok (BEAST proti TLS 1.0/SSL3).
* **Bit-flipping v $C_{i-1}$** převrátí odpovídající bit v $M_i$, ale **rozbije celý $M_{i-1}$**. To dělá CBC částečně užitečný pro detekci manipulace, ale není to formální MAC — viz [[mac-hmac]].

### Slavné útoky na CBC

* **Padding oracle** (Vaudenay 2002) — pokud server vrací informaci o tom, zda padding po dešifrování je platný, útočník po cca 128 dotazech na každý bajt (worst case 256), tj. ~128·|M| dotazech, dešifruje. Bezpečnostně katastrofa — POODLE (2014) proti SSL 3.0, Lucky 13 (2013) proti TLS-CBC.
* **BEAST** (2011) — útok na CBC s predikovatelným IV v TLS 1.0.
* **Bit-flipping** — pokud útočník zná plaintext bloku $i-1$, může cíleně přepsat bity v $C_{i-1}$ tak, aby $M_i$ vyšlo dle libosti.

> Důsledek: CBC se má používat **vždy s MAC** (Encrypt-then-MAC) — alespoň 256bitový HMAC. Moderní praxe ho nahrazuje [[padding-aead|AEAD režimy]].

## CTR — Counter

Bloková šifra se "promění" na proudovou: generuje keystream šifrováním sekvence čítačů.

::: math
z_i = E_K(\mathrm{nonce} \| i), \qquad C_i = M_i \oplus z_i.
:::

### Vlastnosti CTR

* **Plně paralelní** — každý blok ciphertextu lze generovat nezávisle. Ideální pro multicore, SIMD.
* **Bez paddingu** — pracuje na bitové úrovni (XOR), žádný "blokový padding" není třeba. (Implementačně se zaokrouhlí na blok; přebytek XORu je jednoduše odhozen.)
* **Náhodný přístup** — pro disk-encryption: dešifrování bloku $i$ vyžaduje pouze $E_K(\mathrm{nonce} \| i)$. Pro disk encryption se nicméně používá AES-XTS (XEX-based tweaked codebook), nikoli čistý CTR.
* **Nonce reuse je katastrofa** — pokud se použije stejný nonce s stejným klíčem dvakrát, dostáváme [[one-time-pad|two-time pad]] situaci.

> **Pravidlo CTR:** nonce *nikdy* znovu nepoužívat se stejným klíčem. Pokud má nonce 96 bitů, lze poslat $\approx 2^{48}$ (paradox narozenin) zpráv předtím, než se začneme bát kolize *při náhodném výběru* — pro praxi víc než dost. Pokud nonce má 64 bitů, hranice je $\approx 2^{32}$ zpráv (paradox narozenin) — opatrnost.

## OFB a CFB

* **OFB (Output Feedback):** $z_0 = \mathrm{IV}$, $z_i = E_K(z_{i-1})$, $C_i = M_i \oplus z_i$. Keystream je nezávislý na plaintextu. Bit-flipping není detekován. Stejné nonce reuse problémy jako CTR.
* **CFB (Cipher Feedback):** $z_0 = \mathrm{IV}$, $z_i = E_K(C_{i-1})$, $C_i = M_i \oplus z_i$. Self-synchronizing po $\lceil n / 8 \rceil$ chybách v ciphertextu.

OFB a CFB jsou historické režimy (před CTR). V moderní praxi vytlačeny CTR a GCM.

## GCM — Galois Counter Mode (AEAD)

Kombinace CTR (důvěrnost) + GHASH (autenticita) — **AEAD** režim. Standard pro TLS, IPsec, SSH.

* **Šifrování:** $C_i = M_i \oplus E_K(\mathrm{nonce} \| i)$ (jako CTR).
* **Autentizace:** spočítá se *autentizační tag* $T = \mathrm{GHASH}_H(A, C) \oplus E_K(\mathrm{nonce} \| 0)$, kde $H = E_K(0^{128})$ a $A$ je *additional data* (asociovaná data) — autentizovaná, ale **nešifrovaná**.
* **Verifikace:** příjemce spočítá $T'$ a porovná. Pokud $T' \neq T$, *odmítne* zprávu.

### Vlastnosti GCM

* **AEAD** — *jediným* voláním zajišťuje důvěrnost (AES) a integritu (GHASH).
* **Paralelizovatelný** šifrování i autentizace.
* **Hardwarová podpora** — Intel CLMUL / PCLMULQDQ pro GHASH; AES-NI pro AES. Dosahuje 10+ GB/s/jádro.
* **Tag** typicky 128 bitů. Kratší tag (96, 64) snižuje bezpečnost.

### Slabosti GCM

* **Nonce reuse je katastrofa** — Joux (2006) ukázal forgery útok proti GCM se 2 zprávami se stejným nonce. Pro krátké nonce (96 bitů) je třeba pečlivě řídit, aby se *nikdy* neopakoval.
* **GHASH je polynom v $\mathrm{GF}(2^{128})$** — pokud útočník získá *forgery* tag, může útokem na polynom získat **autentizační klíč** $H$.

> **AES-GCM SIV** (Gueron-Lindell 2017) je *nonce-misuse resistant* varianta — i kdyby se nonce opakoval, neztratíme integritu.

## CCM — Counter with CBC-MAC (AEAD)

Alternativa k GCM, používaná v 802.11i (WPA2), Bluetooth. Sériová (méně paralelizace než GCM), ale konceptuálně jednodušší.

* **Šifrování:** CTR.
* **Autentizace:** CBC-MAC (CBC řetězec s nulovým IV).

## Shrnutí — kdy co použít

| Režim | Důvěrnost | Autenticita | Paralelní | Použít |
| :--- | :-: | :-: | :-: | :--- |
| ECB | ✗ | ✗ | ✓ | **Nikdy** (pro >1 blok) |
| CBC | ✓ | ✗ | dešifrování ✓ | Legacy; vždy + MAC |
| CTR | ✓ | ✗ | ✓ | + MAC, nebo přesedlat na GCM |
| OFB/CFB | ✓ | ✗ | ✗ | Historické |
| **GCM** | ✓ | ✓ | ✓ | **Default** dnes |
| **CCM** | ✓ | ✓ | částečně | Bluetooth, WPA2 |
| **ChaCha20-Poly1305** | ✓ | ✓ | ✓ | TLS, SW (bez AES-NI) |

Detaily AEAD a padding — viz [[padding-aead]].

---

*Zdroj: KRY přednášky 2025/26, KRY 3 — Symetrické algoritmy. Externí reference: NIST SP 800-38A: Recommendation for Block Cipher Modes of Operation (2001); NIST SP 800-38D: Recommendation for GCM and GMAC (2007); Vaudenay, S.: "Security Flaws Induced by CBC Padding — Applications to SSL, IPSEC, WTLS …", EUROCRYPT 2002; Joux, A.: "Authentication Failures in NIST Version of GCM", 2006; Bernstein, D. J.: "ChaCha, a variant of Salsa20", SASC 2008.*
