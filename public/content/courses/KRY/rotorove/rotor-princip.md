---
title: Princip rotorových strojů
---

# Princip rotorových strojů

Rotorový stroj je elektromechanická implementace polyalfabetické substituce s **velmi dlouhou periodou**. Vyřešil hlavní praktický problém papírové [[poly-substituce|Vigenèrovy šifry]] — krátký klíč → krátká perioda → Kasiského útok. Rotor v každém kroku *posouvá* substituci, takže efektivní *perioda* je $26^k$ pro stroj s $k$ rotory (a další faktory pro reflektor a plugboard u Enigmy).

## Co je rotor

Rotor je disk s 26 vstupními a 26 výstupními kontakty, propojenými uvnitř **pevně danou permutací** abecedy. Permutace je pevná pro daný rotor, ale **rotor se mezi kroky natáčí** o jednu pozici. Po každém zašifrovaném znaku se posune o 1; po 26 krocích se posune i další rotor (jako počítadlo).

::: svg "Rotor — propojení vstupů s výstupy"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <circle cx="270" cy="100" r="70"/>
  </g>
  <g fill="var(--text)" font-family="var(--font-mono)" font-size="10">
    <text x="270" y="30" text-anchor="middle">A</text>
    <text x="320" y="40" text-anchor="middle">B</text>
    <text x="355" y="65" text-anchor="middle">C</text>
    <text x="340" y="105" text-anchor="middle">…</text>
    <text x="270" y="178" text-anchor="middle">N</text>
    <text x="200" y="105" text-anchor="middle">…</text>
    <text x="180" y="60" text-anchor="middle">X</text>
    <text x="215" y="38" text-anchor="middle">Y</text>
    <text x="250" y="30" text-anchor="middle">Z</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.1" fill="none" opacity="0.7">
    <path d="M270,38 L240,170"/>
    <path d="M315,45 L213,160"/>
    <path d="M335,75 L210,140"/>
    <path d="M188,72 L350,135"/>
    <path d="M210,40 L350,100"/>
    <path d="M250,35 L298,170"/>
  </g>
  <g fill="var(--text-muted)" font-size="10.5">
    <text x="50"  y="100">vstup →</text>
    <text x="450" y="100">→ výstup</text>
    <text x="270" y="195" text-anchor="middle">jeden rotor = pevná substituce ABCDEFGHIJKLMNOPQRSTUVWXYZ → π(...)</text>
  </g>
</svg>
:::

Pokud zaznamenáme propojení rotoru jako *permutaci* $\pi$, pak při natočení o $k$ pozic dostaneme efektivní substituci $\sigma_k(x) = \pi((x + k) \bmod 26) - k$. Mezi sousedními znaky se *rotor pootočí o 1*, takže každý znak prochází *jinou variantou* substituce — proto polyalfabetická.

## Skládání rotorů — *velká* perioda

Stroj s několika sériově zapojenými rotory aplikuje jejich substituce za sebou: výstup prvního je vstup druhého. Pokud je $N = 3$ rotory, pak:

* Po každém znaku se *první* rotor posune o 1.
* Po 26 znacích se posune i *druhý* rotor o 1.
* Po $26^2 = 676$ znacích se posune i *třetí*.

Celková perioda je $26^N$. Pro Enigmu s $N = 3$ rotory by to bylo $26^3 = 17\,576$ — málo. Enigma proto má další mechanismy (reflektor, plugboard, výběr rotorů, počáteční nastavení) zvyšující efektivní stavový prostor na ~$10^{17}$.

::: viz rotor-period "Slider \"krok t\" posouvá rotory; sledujte, kolikrát se otočil R₁ vs. R₂ vs. R₃. Pro N rotorů je perioda 26^N."
:::

## Konstrukce: substituční řetězec

Při šifrování znaku $x$ stroj se třemi rotory $R_1, R_2, R_3$ a reflektorem $\rho$:

::: math
y = R_1^{-1}(R_2^{-1}(R_3^{-1}(\rho(R_3(R_2(R_1(x)))))))
:::

Cesta proudu probíhá *tam* (skrz $R_1, R_2, R_3, \rho$), pak *zpět* ($R_3^{-1}, R_2^{-1}, R_1^{-1}$). Tím vzniká **involutivní šifra** — zašifrování stejné jako dešifrování. Operátor stroj nastaví jednou; stejně se i dešifruje.

> Důsledek pro útok: $x$ se nikdy nemůže zašifrovat sám na sebe. *Žádné písmeno není svým vlastním obrazem*. Tato vlastnost se stala kritickou slabinou Enigmy — viz [[enigma-utok]].

## Historie rotorových strojů

| Stroj | Země | Doba | Rotorů | Použití |
| :--- | :--- | :--- | :-: | :--- |
| Hebernův rotorový stroj | USA | 1917 | 1 | první rotorový stroj — prototyp |
| Scherbiusova **Enigma** | Německo | 1923 | 3–4 | civilní, pak Wehrmacht |
| **SIGABA / ECM Mark II** | USA | 1940 | 5+5 | strategická US, nikdy nerozluštěná |
| Lorenz SZ40/42 | Německo | 1942 | 12 | telegram Hitler↔generálové (Tunny) |
| Typex | UK | 1937 | 5 | britská armáda — Enigma s reflektorem |
| Fialka | SSSR | 1956 | 10 | Varšavský pakt |

Lorenz SZ40 a Enigma byly prolomené spojeneckou kryptoanalýzou. SIGABA neprolomena — má **dva nezávislé pohyby rotorů** (jeden generuje "step pattern" pro druhý), čímž obchází pravidelný posun, který je u Enigmy zranitelný.

## Proč rotor → moderní bloková šifra

Filozoficky je rotorový stroj **iterovaná substituce** s posunutím vnitřního stavu po každém kroku. Moderní [[feistel-spn|bloková šifra (DES, AES)]] dělá totéž ve větším měřítku: každé "kolo" je *substituce* (S-box) + *permutace* (P-box), a stav se mezi koly mění (subkey, round key). Rozdíl je v *kvalitě nelinearity*: rotor je v podstatě jen permutace 26 prvků s pomalou rotací; AES S-box je nelineární afinní transformace v $\mathrm{GF}(2^8)$ s důkazatelnými diferenčními a lineárními vlastnostmi.

> Rotorové stroje jsou předchůdci [[proudove-sifry|proudových šifer]]. Lorenz SZ40 je *předchůdce* moderních proudových šifer jako RC4 nebo ChaCha20 — generuje "klíčový proud" XORovaný s plaintextem.

## Period vs. statistika

I při periodě $\approx 10^{17}$ má rotorový stroj **strukturální vlastnosti**, které ho ohrožují:

1. **Žádné písmeno se nezašifruje samo na sebe** (involutivní šifra, viz výše).
2. **Permutace rotorů jsou pevné** — jakmile útočník zná jejich propojení, redukuje úlohu na nalezení *konfigurace* (počáteční pozice, plugboard, výběr rotorů).
3. **Vstup do stroje produkuje strukturální výstup** — opakované sekvence v plaintextu se po určité periodě objeví jako shodné v ciphertextu.

Tyto strukturální slabiny Polish (1932) a britská (1939–1945) kryptoanalýza využila — viz [[enigma]] a [[enigma-utok]].

---

*Zdroj: KRY přednášky 2025/26, KRY 2 — Rotorové stroje. Externí reference: Bauer, F. L.: *Decrypted Secrets — Methods and Maxims of Cryptology* (4th ed., Springer 2007), kap. 7; Hodges, A.: *Alan Turing: The Enigma* (Princeton UP 2014); Hinsley, F. H., Stripp, A.: *Codebreakers: The Inside Story of Bletchley Park* (Oxford UP 1993).*
