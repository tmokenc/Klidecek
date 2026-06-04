---
title: Attention a transformer
---

# Attention a transformer

Před transformery se sekvence zpracovávaly rekurentně (RNN/LSTM). U úloh **sequence-to-sequence** — překlad, sumarizace, rozpoznávání řeči — encoder zakódoval celý vstup do *jediného* vektoru pevné délky a decoder z něj autoregresivně generoval výstup. Toto úzké hrdlo (context vector) ztrácelo informaci u dlouhých vět. Řešením byl **attention mechanismus**, který nechá decoder „dívat se" na *všechny* skryté stavy encoderu a vybírat ty momentálně relevantní.

## Scaled dot-product attention

Každý token vytvoří tři projekce: **Query** $Q$ (co hledám), **Key** $K$ (čím se nabízím) a **Value** $V$ (co předávám dál). Podobnost query a každého key dá skóre; softmax z něj udělá rozdělení vah, kterými se zprůměrují hodnoty $V$:

::: math
$$
\mathrm{Attention}(Q, K, V) = \mathrm{softmax}\!\left(\frac{QK^{\top}}{\sqrt{d_k}}\right) V
$$
:::

Dělení $\sqrt{d_k}$ (kde $d_k$ je dimenze klíčů) zabrání tomu, aby u velkých dimenzí skalární součiny příliš narostly a softmax se „nasytil" do téměř one-hot rozdělení s mizivými gradienty. Výsledek je pro každý token vážený součet hodnot ostatních tokenů — model tak pracuje s celým kontextem najednou.

::: viz knn-attention "FLAGSHIP: self-attention nad pár tokeny. Vidíš Q,K,V vektory a matici softmax(QK^T/√d). Klikni token → zvýrazní jeho řádek = na co attenduje. Zapni kauzální masku."
:::

## Self-attention, multi-head a poziční kódování

V **self-attention** pochází $Q$, $K$ i $V$ ze stejné sekvence — každý token se porovnává s každým jiným, takže dlouhé závislosti jsou na *konstantní* vzdálenosti (na rozdíl od RNN, kde signál putuje přes mnoho kroků). **Multi-head attention** spustí výpočet paralelně v $h$ hlavách s vlastními projekcemi; různé hlavy se učí různé vztahy (sousednost, shoda rodu/čísla, koreference) a jejich výstupy se zřetězí a promítnou zpět.

Protože attention nemá žádnou rekurenci ani konvoluci, je **permutačně invariantní** — sama o sobě „neví", v jakém pořadí tokeny jsou. Pořadí se proto dodá explicitně **pozičním kódováním** přičteným k embeddingům (v původní práci pomocí sinů/kosinů různých frekvencí).

## Transformer a strojový překlad

**Transformer** poskládá tyto bloky do encoder–decoder architektury: každý blok obsahuje multi-head attention a feed-forward vrstvu, obojí obalené **residual connection** a **layer normalization**. Encoder čte celý zdroj naráz; decoder generuje cíl autoregresivně a přes **cross-attention** (kde $Q$ jde z decoderu a $K,V$ z encoderu) se dívá na zdrojovou větu — to je přímý nástupce zarovnání (alignment) z Bahdanauova attention pro neuronový strojový překlad. Kvalita překladu se měří např. metrikou **BLEU**.

V decoderu se používá **causal (kauzální) masking**: token smí attendovat jen na sebe a předchozí tokeny, nikdy na budoucí — jinak by při tréninku „viděl odpověď" a autoregresivní generování by ztratilo smysl. Hlavní výhody transformeru oproti RNN: paralelní zpracování celé sekvence, lepší zachycení dlouhých závislostí a vynikající škálovatelnost — proto jsou dnešní velké jazykové modely většinou **decoder-only** transformery.

::: quiz "K čemu slouží dělení skóre faktorem √d_k ve scaled dot-product attention?"
- [x] Brání tomu, aby u velkých dimenzí narostly skalární součiny tak, že softmax zsaturuje a gradient zmizí
> Pro velké d_k má QKᵀ velký rozptyl; bez škálování by softmax dával téměř one-hot výstup s malými gradienty.
- [ ] Normalizuje váhy tak, aby každý řádek sčítal na jedna
> To zajišťuje softmax, ne dělení √d_k.
- [ ] Zavádí informaci o pořadí tokenů
> Pořadí dodává poziční kódování, ne škálovací faktor.
- [ ] Maskuje budoucí tokeny u autoregresivního decoderu
> To dělá kauzální maska, nezávisle na škálování.
:::

::: link "Vaswani et al., Attention Is All You Need (arXiv 1706.03762)" "https://arxiv.org/abs/1706.03762"
:::

::: link "Bahdanau, Cho, Bengio: NMT by Jointly Learning to Align and Translate (arXiv 1409.0473)" "https://arxiv.org/abs/1409.0473"
:::

---

*Zdroj: KNN státnicové okruhy NBIO, VUT FIT. Externí reference: Vaswani et al., „Attention Is All You Need" (NeurIPS 2017, [arXiv 1706.03762](https://arxiv.org/abs/1706.03762)); Bahdanau, Cho, Bengio, „Neural Machine Translation by Jointly Learning to Align and Translate" ([arXiv 1409.0473](https://arxiv.org/abs/1409.0473)); Sutskever, Vinyals, Le, „Sequence to Sequence Learning with Neural Networks" ([arXiv 1409.3215](https://arxiv.org/abs/1409.3215)).*
