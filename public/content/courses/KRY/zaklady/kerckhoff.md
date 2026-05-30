---
title: Kerckhoffův princip a perfektní bezpečnost
---

# Kerckhoffův princip a perfektní bezpečnost

Dvě teoretická tvrzení tvoří filozofický rám moderní kryptografie. **Kerckhoffův princip** říká, *kde* může bezpečnost spočívat (v klíči, nikoli v utajení algoritmu). **Shannonova teorie** říká, *co* je nejvyšší možná bezpečnost a *za jakou cenu*.

## Kerckhoffův princip

V šesti pravidlech, která Auguste Kerckhoffs publikoval v *Journal des sciences militaires* (1883), je pro nás stěžejní pravidlo 2:

> *"Il faut qu'il n'exige pas le secret, et qu'il puisse sans inconvénient tomber entre les mains de l'ennemi."*
>
> Algoritmus nesmí vyžadovat utajení a nesmí způsobit problém, pokud padne do rukou nepřítele.

Moderně přeformulováno (Shannonova verze):

> **Návrh systému musí předpokládat, že útočník zná všechny detaily algoritmu. Bezpečnost spočívá výhradně v utajení klíče.**

::: svg "Kerckhoffův princip — útočník zná vše kromě klíče"
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="12">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="20" width="500" height="140" rx="10"/>
  </g>
  <g fill="var(--text)" font-size="12.5">
    <text x="40" y="50">Útočník zná:</text>
    <text x="60" y="74" fill="var(--text-muted)">• algoritmus E, D (zdrojový kód, implementaci, hardware)</text>
    <text x="60" y="92" fill="var(--text-muted)">• statistiku otevřeného textu (jazyk, formát)</text>
    <text x="60" y="110" fill="var(--text-muted)">• přístup k šifrovaným zprávám (a možná i k oraclu)</text>
    <text x="40" y="134" fill="var(--accent)">Útočník nezná: klíč K</text>
  </g>
</svg>
:::

### Proč to platí — argumenty

1. **Algoritmy se rozšiřují.** Software se reverse-engineeruje, hardware lze rozebrat, papírové instrukce se kopírují. Předpokládat trvalé utajení algoritmu napříč organizací po roky není reálné.
2. **Veřejné posouzení odhaluje chyby.** AES prošel mezinárodní soutěží NIST 1997–2000 s desítkami kryptoanalytiků. RC4 zveřejněný v 1994 (anonymně) byl důkladně prošetřen — chyby se objevily a šifra byla vyřazena. Vlastní šifra, kterou nikdy nikdo neviděl, není "více bezpečná" — *je nedůvěryhodná*.
3. **Klíč se snadno mění, algoritmus ne.** Pokud klíč unikne, vygeneruje se nový. Pokud algoritmus unikne a zavisela na jeho utajení bezpečnost, je třeba *přeprogramovat* celý systém.
4. **Klíč je krátký, algoritmus dlouhý.** 256bitový klíč si lze pamatovat, vygenerovat, uložit do HSM. Tisíce řádků kódu nikoli.

### Antiteze — "security through obscurity"

*Security through obscurity* je strategie zatajování implementačních detailů s cílem zvýšit bezpečnost. Příklady:

* Vlastní "patentovaná" šifra firmy bez zveřejnění specifikace (CSS u DVD, A5/2 v GSM — obě prolomené).
* Schování klíče v binárce ("nikdo to nenajde").
* Skryté URL pro administraci ("nikdo neuhodne").

Tato strategie *není sama o sobě špatná* — vrstvenou obranou v praxi funguje (defense in depth). Špatné je *spoléhat se* na ni jako na hlavní bezpečnost. Pokud bezpečnost stojí pouze na utajení detailu, jeho odhalení znamená totální průlom.

> **Praktické pravidlo.** Kerckhoff *nezakazuje* mít tajné detaily. Vyžaduje, aby systém zůstal bezpečný *i kdyby* o nich útočník věděl. Tajné URL adresy admina jsou neškodné; tajný šifrovací algoritmus s 40bitovým klíčem je problém.

## Shannonova teorie a perfektní bezpečnost

Claude Shannon ve *Communication Theory of Secrecy Systems* (Bell System Technical Journal 28(4), 1949) zavedl pojmovou kostru moderní kryptografie.

### Definice perfektní bezpečnosti

Šifra je **perfektně bezpečná** (perfect secrecy), pokud pro každý plaintext $M$ a každý ciphertext $C$ platí

::: math
\Pr[M \mid C] = \Pr[M].
:::

Slovně: znalost ciphertextu *nezmění* útočníkovu apriorní pravděpodobnost ohledně plaintextu. Útočník se odpozorováním $C$ nedozví o $M$ *nic* — žádný bit, žádnou statistiku.

> Ekvivalentní formulace: pro každé $M_1, M_2 \in \mathcal{M}$ a každý $C \in \mathcal{C}$:
> $$\Pr[E_K(M_1) = C] = \Pr[E_K(M_2) = C].$$
> Ciphertext nese stejnou pravděpodobnost pro každý možný plaintext.

### Shannonova věta

> **Věta (Shannon 1949).** Pokud šifra dosahuje perfektní bezpečnosti, pak $|\mathcal{K}| \geq |\mathcal{M}|$.

*Důkaz (náčrt).* Předpokládejme $|\mathcal{K}| < |\mathcal{M}|$. Vezmi konkrétní $C$ a vyber libovolný $M_1$ s $\Pr[M_1] > 0$. Existuje $K$ s $E_K(M_1) = C$. Zobrazení $K \mapsto D_K(C)$ má obraz velikosti $\leq |\mathcal{K}| < |\mathcal{M}|$, takže *nějaký* $M_2 \in \mathcal{M}$ tam nepatří — pro něj $\Pr[E_K(M_2) = C] = 0$. Ale pro $M_1$ je tato pravděpodobnost nenulová. Spor s definicí.

### Důsledek

Perfektní bezpečnost je *informačně-teoretická* — vyžaduje stejně dlouhý klíč jako zpráva. To je důvod, proč moderní praxe **necílí** na perfektní bezpečnost (vyžadovala by neúnosně velké klíče), ale na **výpočetní bezpečnost**: útok existuje, ale je výpočetně nedostupný (AES-256: $2^{256}$ operací). Výpočetní bezpečnost je *podmíněna* dosaženou výpočetní kapacitou útočníka a předpokladem, že nějaký matematický problém zůstává obtížný.

## One-time pad — jediná dosažitelná perfektní šifra

**Vernamova šifra / one-time pad** ([[one-time-pad]]) splňuje Shannonovu hranici: $K$ je rovnoměrně náhodný řetězec stejné délky jako $M$, šifrování je $C = M \oplus K$. Lze ukázat, že je *perfektně bezpečná*. Cena: pro každou zprávu je třeba čerstvý klíč stejné délky. Klíč musí být skutečně náhodný, použít *pouze jednou*, a být bezpečně distribuován dopředu. Použití dvakrát stejný klíč (two-time pad) okamžitě prolomí šifru — útočník získá $C_1 \oplus C_2 = M_1 \oplus M_2$ a využije statistiku jazyka.

## Konfuze a difúze

Shannon ve stejné práci zavedl dva návrhové principy pro výpočetně bezpečné šifry, které jsou stále základem návrhu blokových šifer:

* **Konfuze** (confusion) — vztah mezi *klíčem* a *ciphertextem* musí být co nejsložitější. Statistická analýza ciphertextu nesmí vést k informacím o klíči. Realizace: nelineární substituce (*S-boxy*).
* **Difúze** (diffusion) — statistická struktura *plaintextu* se musí rozptýlit napříč ciphertextem. Změna jednoho bitu plaintextu by měla ovlivnit přibližně polovinu bitů ciphertextu (*lavinový efekt*). Realizace: lineární permutace, MixColumns v AES.

[[feistel-spn|Feistelova a SP síť]] iterují konfuzi (S-boxy) a difúzi (P-permutace) v desítkách kol; po dostatečném počtu kol není možné kompozici útokem rozkrýt.

## Praktický dopad

| Principle | Když ho dodržujeme | Když ho porušujeme |
| :--- | :--- | :--- |
| Kerckhoff | RSA, AES, TLS — vše veřejné | A5/2 GSM, CSS DVD — prolomeny po odhalení |
| Perfektní bezp. | OTP pro horké linky | Naivní cíl pro běžnou komunikaci (nereálný) |
| Konfuze | S-boxy v DES, AES | Lineární šifry (Hill) podlehnou KPA |
| Difúze | MixColumns AES, lavinový test | ECB režim ([[rezimy]]) — *nehnízdí* difúzi |

---

*Zdroj: KRY přednášky 2025/26, KRY 1 — Klasická kryptografie. Externí reference: Kerckhoffs, A.: "La cryptographie militaire", Journal des sciences militaires IX, 1883; Shannon, C. E.: "Communication Theory of Secrecy Systems", Bell System Technical Journal 28(4):656–715, 1949; Katz, J., Lindell, Y.: *Introduction to Modern Cryptography* (3rd ed., CRC Press 2020), kap. 2.*
