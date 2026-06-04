---
title: Signály a statistické metody
---

# Signály a statistické metody

**Rozpoznávání genů** (*gene finding*) hledá v anonymní genomové sekvenci úseky, které kódují produkt — tedy kde gen začíná, kde končí a jak je u eukaryot rozčleněn na **exony** (kódující úseky zůstávající ve zralé mRNA) a **introny** (vystřižené při sestřihu). Jediná statistická metoda problém nevyřeší spolehlivě: signály se vyskytují ve více variantách a jen s určitou pravděpodobností, a introny uvnitř kódujících oblastí svou skladbou kodonů připomínají mezigenovou DNA. Proto se kombinuje více zdrojů informace.

Metody se dělí na dvě třídy podle toho, co popisují:

- **Signální senzory** (*signal sensors*) — rozpoznávají **bodové signály** na konkrétní pozici: start kodon `ATG`, stop kodony `TAA`/`TAG`/`TGA`, **donorové** místo sestřihu (5′ konec intronu, kanonicky dinukleotid `GT`) a **akceptorové** místo (3′ konec intronu, dinukleotid `AG`), promotor, polyadenylační signál.
- **Obsahové senzory** (*content sensors*) — hodnotí **statistiku celého úseku** (okénka): četnost kodonů, GC obsah, periodicitu po trojicích. Slouží k odlišení kódující sekvence od nekódující.

::: svg "Struktura eukaryotického genu: ORF od start kodonu ATG po stop kodon, přerušený intronem. Donorové místo (GT) a akceptorové místo (AG) ohraničují intron. Obsahové senzory hodnotí statistiku celých úseků (exon vs. intron), signální senzory bodové signály na hranicích."
<svg viewBox="0 0 540 200" style="width:100%;max-width:540px;display:block" font-family="var(--font-mono)">
  <rect width="540" height="200" fill="var(--bg-inset)"/>
  <!-- gene track -->
  <rect x="20" y="60" width="500" height="26" fill="var(--bg-card)" stroke="var(--line-strong)" stroke-width="0.8"/>
  <!-- exon 1 -->
  <rect x="70" y="54" width="120" height="38" fill="var(--accent)" opacity="0.85" stroke="var(--accent-line)" stroke-width="1"/>
  <text x="130" y="78" text-anchor="middle" font-size="12" fill="white">exon 1</text>
  <!-- intron (thin connector) -->
  <line x1="190" y1="73" x2="320" y2="73" stroke="var(--line-strong)" stroke-width="1.5"/>
  <text x="255" y="68" text-anchor="middle" font-size="11" fill="var(--text-muted)">intron</text>
  <!-- exon 2 -->
  <rect x="320" y="54" width="120" height="38" fill="var(--accent)" opacity="0.85" stroke="var(--accent-line)" stroke-width="1"/>
  <text x="380" y="78" text-anchor="middle" font-size="12" fill="white">exon 2</text>
  <!-- start codon -->
  <line x1="70" y1="40" x2="70" y2="100" stroke="var(--text)" stroke-width="1" stroke-dasharray="3 2"/>
  <text x="70" y="34" text-anchor="middle" font-size="11" fill="var(--text)">ATG</text>
  <text x="70" y="116" text-anchor="middle" font-size="9" fill="var(--text-faint)">start</text>
  <!-- stop codon -->
  <line x1="440" y1="40" x2="440" y2="100" stroke="var(--text)" stroke-width="1" stroke-dasharray="3 2"/>
  <text x="440" y="34" text-anchor="middle" font-size="11" fill="var(--text)">TAA</text>
  <text x="440" y="116" text-anchor="middle" font-size="9" fill="var(--text-faint)">stop</text>
  <!-- donor / acceptor -->
  <text x="190" y="108" text-anchor="middle" font-size="11" fill="var(--accent)">GT</text>
  <text x="190" y="120" text-anchor="middle" font-size="9" fill="var(--text-faint)">donor</text>
  <text x="320" y="108" text-anchor="middle" font-size="11" fill="var(--accent)">AG</text>
  <text x="320" y="120" text-anchor="middle" font-size="9" fill="var(--text-faint)">akceptor</text>
  <!-- ORF brace -->
  <line x1="70" y1="46" x2="440" y2="46" stroke="var(--text-muted)" stroke-width="0.8"/>
  <text x="255" y="44" text-anchor="middle" font-size="10" fill="var(--text-muted)">ORF (start … stop, na mRNA)</text>
  <!-- sensor legend -->
  <text x="20" y="150" font-size="11" fill="var(--accent)">▮ obsahové senzory</text>
  <text x="20" y="166" font-size="10" fill="var(--text-muted)">statistika úseku: četnost kodonů, GC%, periodicita</text>
  <text x="300" y="150" font-size="11" fill="var(--text)">┊ signální senzory</text>
  <text x="300" y="166" font-size="10" fill="var(--text-muted)">bodové signály: ATG, GT/AG, stop</text>
  <text x="20" y="190" font-size="9" fill="var(--text-faint)">pozn.: introny mohou nést stop kodony — ORF se vyhodnocuje až po sestřihu</text>
</svg>
:::

## Naivní metoda: hledání ORF

**ORF** (*Open Reading Frame*, otevřený čtecí rámec) je úsek od start kodonu `ATG` po nejbližší stop kodon ve stejném rámci. Naivní algoritmus vyhledá všechny ORF mezi start a stop kodonem. Háček: dopředu nevíme, kde kodon začíná, ani zda gen leží na přímém, nebo reverzním (komplementárním) vlákně. DNA má proto **šest čtecích rámců** — tři na přímém vlákně (posun o 0/1/2 báze) a tři na reverzním komplementu — a všechny je nutno prohledat. Délkové kritérium samo (dlouhý ORF = pravděpodobně gen) je slabé a u krátkých genů selhává.

## Statistika kodonů a posuvné okénko

Lepší **obsahový senzor** sleduje **četnost kodonů** v kódujících oblastech: kodony nejsou v genech rozloženy rovnoměrně (organismus preferuje určité synonymní kodony — *codon usage bias*), zatímco nekódující DNA má rozložení blízké náhodnému. **Posuvné okénko** postupně analyzuje sekvenci, spočítá v něm frekvenci kodonů a porovná je s referenční tabulkou kódujících vs. nekódujících oblastí. Toto dosahuje výrazně lepších výsledků než pouhé testování délky ORF.

Skóre se přirozeně vyjadřuje jako **log-odds** — logaritmus poměru pravděpodobnosti okénka za modelu kódující oblasti k pravděpodobnosti za modelu pozadí; kladná hodnota svědčí pro kódující úsek:

::: math
S = \log \frac{P(\text{okénko} \mid \text{kódující})}{P(\text{okénko} \mid \text{nekódující})}
:::

Silnějším senzorem je **in-frame hexamer**: počítá frekvenci **dvojic po sobě jdoucích kodonů** (šestic bází ve čtecím rámci), čímž zachytí závislosti mezi sousedními kodony, které samostatná četnost kodonů ignoruje. Tento přístup tvoří jádro obsahových senzorů moderních prediktorů.

## Proč to nestačí

- **Volba velikosti okénka** je kompromis: malé okénko = zašuměné skóre, velké okénko = rozmazané hranice.
- **Krátké geny** neposkytnou dost dat pro statisticky významné porovnání.
- **Introny** u eukaryot svou skladbou kodonů odpovídají mezigenovým oblastem, takže je obsahový senzor snadno splete s nekódující DNA.

Závěr: je třeba sledovat **víc signálů najednou** a kombinovat signální i obsahové senzory v jednom konzistentním pravděpodobnostním rámci. Tím rámcem jsou skryté Markovovy modely.

::: quiz "Proč obsahový senzor založený jen na četnosti kodonů nestačí na eukaryotické geny?"
- [x] Introny mají skladbu kodonů podobnou mezigenovým oblastem, takže je senzor splete s nekódující DNA
  > To je hlavní komplikace — kódující exony jsou přerušené introny, jejichž statistika připomíná pozadí, a hranice (sestřihová místa) musí dodat signální senzory.
- [ ] Kodony se v genech vyskytují přesně rovnoměrně, takže žádná statistika neexistuje
  > Naopak — codon usage bias existuje a je to právě signál, který obsahový senzor využívá; problém je v intronech a krátkých genech.
- [ ] ORF nelze v eukaryotech vůbec definovat
  > ORF lze definovat, ale až na sestřižené mRNA — v genomové DNA mohou introny nést stop kodony a měnit rámec.
:::

::: link "GENSCAN: Burge & Karlin (1997) Prediction of complete gene structures in human genomic DNA, J. Mol. Biol." "https://doi.org/10.1006/jmbi.1997.0951"
:::

::: link "Open reading frame — Wikipedia (start/stop kodony, šest rámců)" "https://en.wikipedia.org/wiki/Open_reading_frame"
:::

*Zdroj: BIF státnicové okruhy NBIO, VUT FIT. Externí reference: Burge & Karlin (1997) GENSCAN, J. Mol. Biol.; Wikipedia: Open reading frame; EMBL-EBI Training — gene prediction; kanonické sestřihové dinukleotidy GT–AG.*
