---
title: 'Metody sekvenace'
---

# Metody sekvenace DNA

**Sekvenace** určuje pořadí nukleotidů (A, C, G, T) v molekule DNA. Žádná dnešní technologie nepřečte celý chromozom najednou — všechny produkují **krátká čtení** (*reads*), která se až dodatečně skládají dohromady. Klíčové jsou proto dvě veličiny: **délka čtení** (kolik bází přečteme v jednom kuse) a **pokrytí** (*coverage* — kolikrát je v průměru každá báze přečtena).

## Sangerova metoda (sekvenace ukončením řetězce)

**Sangerova metoda** (1977) je založena na řízeném **přerušení replikace**. Do reakce se kromě běžných deoxynukleotidů (dNTP) přidají i **dideoxynukleotidy (ddNTP)** — analogy postrádající 3'-OH skupinu. Jakmile DNA-polymeráza zařadí ddNTP, řetězec již nelze prodloužit a syntéza se v daném místě **ukončí**. Vznikne tak směs fragmentů **všech možných délek**, z nichž každý končí na konkrétní bázi.

- Klasicky se reakce dělila do **4 zkumavek** (po jedné pro ddA, ddC, ddG, ddT); moderní varianta používá **fluorescenčně značené** ddNTP a jednu reakci.
- Fragmenty se **seřadí podle velikosti** kapilární elektroforézou a z pořadí terminujících bází se přečte sekvence.
- Přesná, ale s krátkým dosahem: jedno čtení má jen přibližně **500–1000 bp**.

::: svg "Sangerova metoda (vlevo): ddNTP ukončí řetězec → fragmenty různých délek seřazené elektroforézou. NGS (vpravo): genom rozsekán na miliony fragmentů sekvenovaných masivně paralelně, krátká čtení s vysokým pokrytím."
<svg viewBox="0 0 540 220" style="width:100%;display:block">
  <rect width="540" height="220" fill="var(--bg-inset)"/>
  <text x="135" y="20" text-anchor="middle" font-size="13" font-family="var(--font-mono)" fill="var(--text)">Sanger</text>
  <text x="405" y="20" text-anchor="middle" font-size="13" font-family="var(--font-mono)" fill="var(--text)">NGS</text>
  <line x1="270" y1="30" x2="270" y2="205" stroke="var(--line)" stroke-width="1" stroke-dasharray="3 3"/>

  <!-- Sanger: fragment ladder ordered by length -->
  <text x="30" y="44" font-size="10" font-family="var(--font-mono)" fill="var(--text-faint)">fragmenty různých délek</text>
  <g font-family="var(--font-mono)" font-size="10">
    <rect x="30" y="54"  width="40"  height="11" rx="2" fill="var(--bg-card)" stroke="var(--line-strong)"/>
    <rect x="74" y="54"  width="9"   height="11" rx="2" fill="var(--accent)"/>
    <rect x="30" y="72"  width="70"  height="11" rx="2" fill="var(--bg-card)" stroke="var(--line-strong)"/>
    <rect x="104" y="72" width="9"   height="11" rx="2" fill="var(--accent)"/>
    <rect x="30" y="90"  width="100" height="11" rx="2" fill="var(--bg-card)" stroke="var(--line-strong)"/>
    <rect x="134" y="90" width="9"   height="11" rx="2" fill="var(--accent)"/>
    <rect x="30" y="108" width="130" height="11" rx="2" fill="var(--bg-card)" stroke="var(--line-strong)"/>
    <rect x="164" y="108" width="9"  height="11" rx="2" fill="var(--accent)"/>
  </g>
  <text x="30" y="138" font-size="9" font-family="var(--font-mono)" fill="var(--text-muted)">▲ ddNTP ukončí řetězec</text>
  <line x1="30" y1="150" x2="180" y2="150" stroke="var(--line-strong)" stroke-width="1" marker-end="url(#mst-a)"/>
  <text x="105" y="164" text-anchor="middle" font-size="9" font-family="var(--font-mono)" fill="var(--text-faint)">seřazení dle délky → sekvence</text>
  <text x="30" y="190" font-size="10" font-family="var(--font-mono)" fill="var(--text-muted)">délka čtení ~500–1000 bp</text>
  <text x="30" y="204" font-size="10" font-family="var(--font-mono)" fill="var(--text-muted)">1 čtení / reakce</text>

  <!-- NGS: many parallel short reads stacked over a reference -->
  <text x="300" y="44" font-size="10" font-family="var(--font-mono)" fill="var(--text-faint)">miliony čtení paralelně</text>
  <line x1="296" y1="120" x2="516" y2="120" stroke="var(--line-strong)" stroke-width="2"/>
  <g stroke="var(--accent)" stroke-width="5" stroke-linecap="round" opacity="0.9">
    <line x1="298" y1="56" x2="338" y2="56"/>
    <line x1="332" y1="66" x2="372" y2="66"/>
    <line x1="366" y1="56" x2="406" y2="56"/>
    <line x1="400" y1="66" x2="440" y2="66"/>
    <line x1="434" y1="56" x2="474" y2="56"/>
    <line x1="468" y1="66" x2="508" y2="66"/>
    <line x1="310" y1="78" x2="350" y2="78"/>
    <line x1="344" y1="88" x2="384" y2="88"/>
    <line x1="378" y1="78" x2="418" y2="78"/>
    <line x1="412" y1="88" x2="452" y2="88"/>
    <line x1="446" y1="78" x2="486" y2="78"/>
  </g>
  <text x="406" y="135" text-anchor="middle" font-size="9" font-family="var(--font-mono)" fill="var(--text-faint)">referenční / sestavená sekvence</text>
  <text x="296" y="166" font-size="10" font-family="var(--font-mono)" fill="var(--text-muted)">délka čtení ~50–300 bp</text>
  <text x="296" y="180" font-size="10" font-family="var(--font-mono)" fill="var(--text-muted)">vysoké pokrytí (překryvy)</text>
  <text x="296" y="194" font-size="10" font-family="var(--font-mono)" fill="var(--text-muted)">cena/báze řádově nižší</text>

  <defs>
    <marker id="mst-a" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto" markerUnits="userSpaceOnUse">
      <path d="M0,0 L6,3 L0,6 Z" fill="var(--line-strong)"/>
    </marker>
  </defs>
</svg>
:::

## NGS — masivně paralelní sekvenace

**Sekvenace nové generace** (NGS, sekvenace 2. generace) opustila čtení jednoho fragmentu po druhém. Genom se rozseká na **miliony krátkých fragmentů**, ty se navážou na pevný nosič, lokálně namnoží (vznikne klastr stejných molekul kvůli síle signálu) a poté se sekvenují **současně** — typicky metodou *sequencing-by-synthesis*, kde se v každém cyklu zaznamenává fluorescence zařazené báze.

- **Mnohem vyšší propustnost** a nižší cena na bázi, ale **kratší čtení** (řádově desítky až stovky bp) a vyšší chybovost na konci čtení.
- Krátká čtení nutně překrývají originál vícekrát — proto se NGS pojí s vysokým pokrytím a s **výpočetním** sestavováním.
- **Sekvenace 3. generace** (SMRT, nanopórová) přečte naopak **dlouhá** čtení (tisíce až desetitisíce bp) za cenu vyšší chybovosti, což zjednodušuje sestavování přes opakující se úseky.

## Pokrytí a shotgun sekvenace

**Shotgun** přístup vsadil na náhodu: DNA se rozseká na náhodně se překrývající fragmenty, ty se nezávisle přečtou a původní sekvence se rekonstruuje **výpočetně z překryvů**. Kolik čtení je potřeba, odhaduje **Lander-Watermanova** statistika — průměrné pokrytí je

::: math
C = \frac{N \cdot L}{G}
:::

kde $N$ je počet čtení, $L$ jejich délka a $G$ velikost genomu. Při náhodném rozmístění čtení se počet přečtení jedné báze řídí Poissonovým rozdělením, takže pravděpodobnost, že báze **není** pokryta, je $P_0 = e^{-C}$. Vyšší pokrytí tedy snižuje mezery a tlumí náhodné chyby čtení (chyba v jednom čtení je přehlasována správnými čteními téhož místa).

::: quiz "Proč moderní (NGS) sekvenace nutně vyžaduje výpočetní sestavování, zatímco u Sangerovy metody bylo méně kritické?"
- [x] NGS produkuje obrovské množství velmi krátkých čtení, která pokrývají genom mnohonásobně a musí se poskládat z překryvů
  > Krátká čtení samostatně nedávají souvislou sekvenci; teprve překryvy mezi miliony čtení rekonstruují originál.
- [ ] NGS čte celé chromozomy najednou, takže stačí je jen zřetězit
  > Naopak — žádná technologie nečte celý chromozom; NGS čtení jsou kratší než Sangerova.
- [ ] Sangerova metoda nepoužívá pokrytí, protože je bezchybná
  > I Sanger má chyby a používá pokrytí; rozdíl je v měřítku a délce čtení, ne v bezchybnosti.
:::

::: link "Sanger sequencing — Wikipedia (princip terminace ddNTP)" "https://en.wikipedia.org/wiki/Sanger_sequencing"
:::

::: link "Illumina — Estimating Sequencing Coverage (Lander-Waterman C = LN/G)" "https://www.illumina.com/documents/products/technotes/technote_coverage_calculation.pdf"
:::

*Zdroj: BIF státnicové okruhy NBIO, VUT FIT. Externí reference: Sanger, Nicklen & Coulson (1977) PNAS; Lander & Waterman (1988) Genomics; Illumina technote — Estimating Sequencing Coverage; EMBL-EBI Training — Next-Generation Sequencing.*
