---
title: Autoregresivní generativní modely
---

# Autoregresivní generativní modely

**Jazykový model** odhaduje pravděpodobnost posloupnosti tokenů a učí se predikovat *další* token z předchozího kontextu — např. $P(\texttt{sníh} \mid \texttt{šel domů přes velmi hluboký})$. **Autoregresivní** model jde dál: celou sekvenci generuje *postupně*, token po tokenu, kde každý nový token podmiňuje předchozím prefixem. Tento princip pohání moderní generativní jazykové modely (GPT a další).

## Faktorizace přes řetízkové pravidlo

Společnou pravděpodobnost věty rozložíme řetízkovým pravidlem (chain rule) na součin podmíněných pravděpodobností:

::: math
$$
P(x_1, x_2, \dots, x_n) = \prod_{t=1}^{n} P(x_t \mid x_1, \dots, x_{t-1}) = \prod_{t=1}^{n} P(x_t \mid x_{<t})
$$
:::

Rozklad je *exaktní* (žádná aproximace) — pouze přeskupuje pravděpodobnost do pořadí zleva doprava. Model se tedy učí jedinou věc: distribuci dalšího tokenu nad slovníkem, $P(x_t \mid x_{<t})$, typicky jako softmax přes výstupní logity. Trénuje se **self-supervised** maximalizací log-věrohodnosti (rovná se minimalizaci cross-entropy / perplexity) — data jsou sama sobě labelem, žádné ruční anotace.

::: viz knn-autoregressive "Krokuj generování token po tokenu: každý krok ukáže rozdělení P(x_t | x_<t) a vybraný token. Přepni teacher forcing vs. sampling a sleduj, jak se výběr odchýlí od gold tokenu."
:::

## Generování: sampling a dekódovací strategie

Při **inferenci** model spočítá $P(x_t \mid x_{<t})$, vybere token a *vloží ho zpět* jako vstup pro krok $t+1$ — odtud „auto-regresivní" (regrese na vlastní výstup). Jak token vybrat:

- **Greedy** — vždy argmax. Deterministické, ale snadno upadne do repetice.
- **Sampling s teplotou** $T$ — logity se dělí $T$ před softmaxem; $T<1$ rozdělení zostří (konzervativnější), $T>1$ zplošťuje (kreativnější), $T \to 0$ je greedy.
- **Top-k / top-p (nucleus)** — vzorkuje jen z nejpravděpodobnějších kandidátů, čímž odřízne dlouhý ocas nepravděpodobných tokenů.
- **Beam search** — drží $b$ nejlepších částečných hypotéz; vhodné tam, kde záleží na konzistenci (překlad).

## Teacher forcing a exposure bias

Kdyby se decoder během tréninku krmil vlastními (zpočátku špatnými) výstupy, jedna raná chyba by zkazila celý zbytek věty a konvergence by byla pomalá. Proto se používá **teacher forcing**: v každém kroku model dostane jako předchozí token *správný* token z ground truth, ne svůj vlastní odhad. To stabilizuje a zrychluje trénink a umožňuje počítat všechny kroky paralelně.

Cenou je **exposure bias** — nesoulad mezi tréninkem (vždy správný prefix) a inferencí (vlastní, možná chybný prefix). Jakmile se vygenerovaný prefix odchýlí od distribuce trénovacích dat, model se ocitne mimo to, co kdy viděl, a chyby se akumulují. Tento rozpor je inherentní vlastností autoregresivního tréninku přes teacher forcing.

::: quiz "Proč se decoder při tréninku krmí ground-truth tokeny (teacher forcing) místo vlastních predikcí?"
- [x] Zabraňuje propagaci rané chyby do celého zbytku sekvence a umožňuje paralelní výpočet kroků
> Decoder v kroku t dostane správný x_{t-1}, takže chyba v jednom kroku neotráví všechny následující; navíc lze všechny kroky spočítat naráz.
- [ ] Protože model bez něj nedokáže spočítat softmax nad slovníkem
> Softmax se počítá stejně v obou režimech; teacher forcing mění jen to, jaký předchozí token jde na vstup.
- [ ] Odstraňuje exposure bias
> Naopak — teacher forcing exposure bias způsobuje, protože trénink (gold prefix) se liší od inference (vlastní prefix).
- [ ] Aby model nemusel používat řetízkové pravidlo
> Faktorizace přes řetízkové pravidlo platí nezávisle na tréninkovém režimu.
:::

::: link "Autoregresivní jazykové modely a next-token prediction (přehled)" "https://www.emergentmind.com/topics/autoregressive-language-models-arms"
:::

::: link "Rethinking Exposure Bias in Language Modeling (arXiv 1910.11235)" "https://arxiv.org/abs/1910.11235"
:::

---

*Zdroj: KNN státnicové okruhy NBIO, VUT FIT. Externí reference: Bengio et al., „A Neural Probabilistic Language Model" (JMLR 2003); Radford et al., „Improving Language Understanding by Generative Pre-Training" (GPT, 2018); přehled autoregresivních jazykových modelů a next-token prediction; „Rethinking Exposure Bias in Language Modeling" ([arXiv 1910.11235](https://arxiv.org/abs/1910.11235)).*
