---
title: Prolomení Enigmy — Bombe a Bletchley Park
---

# Prolomení Enigmy

Prolomení [[enigma|Enigmy]] bylo jedním z největších kryptoanalytických triumfů 20. století. Spojenecké úsilí trvalo od poloviny 30. let (polská *Biuro Szyfrów*) přes vojenskou operaci v Bletchley Park (1939–1945) až po pomoc CSAW a US Navy (1942–1945). Klíčové techniky využily *strukturálních slabin* stroje a *operátorské nedisciplinovanosti*, nikoli brute-force.

## Polská kryptoanalýza (1932–1939)

**Marian Rejewski**, Henryk Zygalski a Jerzy Różycki ve Varšavě prolomili Enigmu jako první. Trojici pomohly:

1. **Matematické vzdělání.** Rejewski byl matematik, ne lingvista — zavedl *grupově-teoretický* přístup. Většina kryptoanalytiků té doby pracovala s lingvistickými hádankami.
2. **Dokumenty od Francouzů.** Hans-Thilo Schmidt (krycí jméno *Asché*) prodal Francouzské *Deuxième Bureau* obsluhu Enigmy a denní klíče za červen–prosinec 1932. Francie informaci sdílela s Poláky.
3. **Vlastní replika stroje.** Polská AVA vyrobila kopii Enigmy. Bez fyzického stroje by se útok provádět nedal.

### Cyklometr

Rejewski využil **opakování indikátoru** (do 1940): operátor šifroval klíč zprávy `WAG` dvakrát → 6 znaků ciphertextu `BLAVZX`. Pozice 1–4 a 2–5 a 3–6 jsou tedy *stejná písmena* zašifrovaná na různých pozicích rotoru. 

Rejewski analyzoval **permutaci** $\sigma = (1 \to 4)(2 \to 5)(3 \to 6)$ jako kompozici 6 Enigmí substitucí. Strukturu této permutace (cyklus délek) bylo možné předpočítat pro všech $26^3 \cdot 6$ kombinací rotorů a počátečních pozic — **cyklometr** (1934) byl mechanické zařízení, které tuto strukturu hledalo.

### Bomba Kryptologiczna (1938)

Mechanický nástupce cyklometru — šest sériově zapojených Enigem simulujících všech $6 \cdot 26^3 = 105\,456$ konfigurací rotorů, automaticky hledající *charakteristiky cyklu*. Bomba (od názvu zmrzliny *bomba* podle Rejewského vzpomínek, nebo prostě onomatopoea tikajících rotorů) byla v provozu ~2 hodiny pro jednu konfiguraci dne.

V červenci 1939 — pouhých 5 týdnů před vypuknutím války — Polsko předalo *kopie strojů* a popis Bomby Britům a Francouzům. Bez tohoto transferu by britské úsilí v Bletchley Parku začínalo od nuly.

## Bletchley Park — britská kryptoanalýza

**Government Code and Cypher School (GC&CS)**, později **Bletchley Park** (1939–1945), zaměstnával v vrcholu války ~9 000 lidí. Klíčové postavy:

* **Alan Turing** — matematik, navrhl koncept Bombe (pojem *crib*); Hut 8.
* **Gordon Welchman** — vyšlechtil diagonal board pro Bombu (klíčové vylepšení); Hut 6.
* **Dilly Knox** — kryptoanalytik z 1. války; rozbil italskou námořní Enigmu a španělskou Enigmu Civil War.
* **John Tiltman, Bill Tutte** — Lorenz SZ40 ("Tunny").
* **Joan Clarke** — Hut 8, matematicka.

### Bombe Turing-Welchman (1940)

Britská Bombe využila **odlišnou metodiku** než polská. Polská Bomba se opírala o opakování indikátoru; Britové potřebovali metodu po roce 1940, kdy operátoři přestali indikátor opakovat.

**Idea Bombe:**

1. Předpokládáme *crib* — fragment plaintextu, který v dané zprávě určitě je (např. `WETTERVORHERSAGE` = předpověď počasí, pravidelné hlášení).
2. Crib se přiřadí do ciphertextu na různé pozice. *Známe* dvojice ($M_i$, $C_i$) na ~16+ pozicích.
3. Pro každou trojici (Walzenlage, počáteční pozice) Bombe simuluje 26 paralelních Enigem (jedna pro každé možné nastavení plugboardu) a testuje, zda crib je konzistentní.
4. *Konzistentní* znamená: žádný kontradikt — žádné dvě dvojice ne-implikují, že stejný písmenkový pár je *zároveň* propojený i nepropojený plugboardem.
5. Když Bombe najde konzistentní nastavení, **zastaví se**. Operátor zaznamenal *stop* a předal nastavení k ověření; ostatní pozice se ručně rekonstruovaly.

Bombe běžela ~20 minut na jedno nastavení (1 Walzenlage). Pro 60 Walzenlagí denně bylo třeba mnoho Bomb — koncem války Bletchley provozoval **211 Bomb** najednou. Operátorky (WRNS, *Wrens*) je obsluhovaly nepřetržitě.

::: svg "Bombe — schema (zjednodušeno)"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="20"  y="30" width="500" height="140" rx="8"/>
  </g>
  <g fill="var(--text)" font-size="11">
    <text x="40" y="55">Crib:  WETTERVORHERSAGE</text>
    <text x="40" y="73">Ciph:  HBXWPMJKLNQRSEUR</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.1" fill="none">
    <path d="M44,82 Q60,95 76,82"/>
    <path d="M62,82 Q80,98 100,82"/>
    <path d="M80,82 Q100,98 120,82"/>
  </g>
  <g fill="var(--text-muted)" font-size="10.5">
    <text x="40" y="105">↓ pro každou trojici (Walzenlage, pozice) testovat:</text>
    <text x="40" y="123">  • simulace 26 paralelních Enigm (různé plugboard hypotézy)</text>
    <text x="40" y="139">  • hledá KONTRADIKCI (žádná → nastavení je platné)</text>
    <text x="40" y="158">~211 Bomb v Bletchley běželo paralelně na různé Walzenlage</text>
  </g>
</svg>
:::

### Klíčové zranitelnosti, které Bombe využila

1. **Reflektor → involuce** → A nemůže být zašifrované jako A. Pokud útočník vidí pozici, kde plaintext i ciphertext mají stejné písmeno, *není to crib na této pozici*.
2. **Crib disponuje smyčkami.** Pokud v cribu máme dvojice $(A, B)$, $(B, C)$, $(C, A)$ na pozicích 1, 5, 9, vytváří se *uzavřená smyčka* — Bombe ji testuje současně všemi 26 hypotézami plugboardu pro A a hledá konzistenci.
3. **Operátorská kázeň.** "Crib" se získal díky tomu, že:
   * Wetterbericht měl pravidelný formát.
   * Pozdravná `HEIL HITLER` na konci zpráv.
   * Bezvýznamné testy `LLLLLLLLLL` při ladění Enigmy.
   * Předvídatelné odpovědi na otázky velitelství.

## Mavis Batey a italská Enigma

**Mavis Batey** (výzkumná sekce Dillyho Knoxe, tzv. Cottage) ve Bletchley prolomila italskou námořní Enigmu (1941). Klíčový moment: Itálie používala Enigmu bez plugboardu (komerční varianta) — ten dramaticky snižuje stavový prostor. Bateyová si všimla pravidelné struktury indikátoru a využila ji.

Důsledek: bitva u mysu Matapan (28.–29. března 1941). Britská flotila pod admirálem Cunninghamem zachytila a potopila tři italské těžké křižníky díky předpovědi italských pohybů z dešifrovaných zpráv.

## Námořní Enigma a "Shark"

Kriegsmarine Enigma M4 (čtyřrotorová, od února 1942) zablokovala britské dešifrování — *Shark blackout*. Po 10 měsících (prosinec 1942) získal HMS Petard z potopené U-559 kódové knihy *Wetterkurzschlüssel* a *Kurzsignal*. To umožnilo:

* **Nové Bombe** — 4-rotorové (US Navy Bombe od 1943, 100+ kusů ve Washingtonu DC).
* **Crib z počasí** — krátké zprávy o počasí byly *standardizované* a tvořily ideální cribs.

Dešifrování přispělo k vítězství v Bitvě o Atlantik (1943) — německé ponorky byly *směrovány* spojeneckými konvoji, ne naopak.

## Lorenz SZ40 / "Tunny" — Colossus

Strojem *Lorenz SZ40* (12 rotorů, vyšší úroveň než Enigma) komunikovala německá vrchní generalita. Bill Tutte odvodil vnitřní strukturu stroje **bez fyzické kopie** — jen z statistické analýzy ciphertextu (jedna z největších individuálních kryptoanalytických prací v historii).

**Colossus** (Tommy Flowers, 1943) byl první **elektronický programovatelný počítač** — sestaven pro útok na Lorenz. Mark 1: 1500 elektronek; Mark 2: 2400 elektronek. 10 jednotek do konce války.

> Colossus *není Turing-complete* (byla to specializovaný procesor pro Booleanské operace), ale jeho architektonický odkaz inspiroval poválečné stroje (Manchester Mark 1, EDSAC).

## Důsledek a poučení

Prolomení Enigmy zkrátilo válku **o cca 2 roky** podle odhadů Hinsleyho (1979). Bletchley dešifroval cca *několik tisíc zpráv denně* (≈ 5 000 zpráv/den v polovině 1944, ≈ 3 000/den v 1943).

Z hlediska moderní kryptografie:

| Slabina Enigmy | Moderní obrana |
| :--- | :--- |
| Involutivní šifrování (reflektor) | Moderní šifry nejsou involutivní (E ≠ D operacemi) |
| Strukturální vlastnosti (notch) | AES má důkazatelné nelineární vlastnosti |
| Crib útok (známý plaintext) | Žádná šifra by neměla padnout pod KPA/CPA |
| Operátorská chyba (opakování) | Moderní protokoly *nikdy* nepřenáší klíč; používají [[dh-elgamal|key agreement]] |
| Manuální distribuce klíčů | Asymetrická kryptografie ([[pki-uvod|PKI]]) eliminuje fyzickou distribuci |

Enigma byla *bezpečnostně dobře navržena* na svou dobu — problém byl v *implementaci protokolu*: opakovaný indikátor, dostupný crib, omezené plugboard kombinace. Stejné kategorie problémů se opakují v moderních systémech (např. WEP, IVy v WPA, padding oracles v TLS).

---

*Zdroj: KRY přednášky 2025/26, KRY 2 — Rotorové stroje. Externí reference: Hinsley, F. H.: *British Intelligence in the Second World War*, sv. 1–3 (HMSO 1979–88); Welchman, G.: *The Hut Six Story* (M&M Baldwin 1997); Hodges, A.: *Alan Turing: The Enigma* (Princeton UP 2014); Copeland, B. J. (ed.): *Colossus: The Secrets of Bletchley Park's Codebreaking Computers* (Oxford UP 2006); Rejewski, M.: "How Polish Mathematicians Deciphered the Enigma", Annals of the History of Computing 3(3), 1981.*
