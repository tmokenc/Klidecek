---
title: Klasifikace vs. predikce, fáze
---

# Klasifikace a predikce — princip a fáze

**Klasifikace** a **predikce** jsou dvě formy *řízeného (supervised) učení*: z trénovací sady příkladů, u nichž *známe* správnou odpověď, se naučí model, který umí odpověď přiřadit i *novým, dosud neviděným* objektům. Rozdíl je v *typu* odpovědi:

- **Klasifikace** předpovídá **kategorickou (diskrétní) třídu** — např. „nádor maligní / benigní", „gen kódující / nekódující".
- **Predikce** (v užším smyslu **regrese**) předpovídá **spojitou číselnou hodnotu** — např. expresní hladinu genu, vazebnou afinitu, koncentraci.

Oba úkoly mají stejnou *strukturu*: vstupem je objekt popsaný vektorem *atributů (příznaků)* $\mathbf{x}$, výstupem je hodnota cílového atributu $y$. Liší se jen v tom, zda je $y$ z konečné množiny tříd, nebo z $\mathbb{R}$.

## Dvě fáze

Proces probíhá vždy ve dvou oddělených fázích, které **nesmí používat stejná data**:

1. **Fáze učení (trénink).** Algoritmus dostane *trénovací sadu* — dvojice $(\mathbf{x}_i, y_i)$ se *známým* cílem. Z nich „natrénuje" model (klasifikátor), tj. najde funkci $f$, která co nejlépe mapuje $\mathbf{x} \mapsto y$. Protože cíl je znám, jde o *učení s učitelem*.
2. **Fáze použití (klasifikace / predikce).** Naučený model se aplikuje na *nová* data bez známého cíle a vyprodukuje predikci $\hat{y} = f(\mathbf{x})$. Před nasazením se kvalita modelu *otestuje* na oddělené *testovací sadě* (viz [[hodnoceni]]).

::: svg "Dvě fáze řízeného učení a rozdíl klasifikace (diskrétní třída) vs. predikce (spojitá hodnota)"
<svg viewBox="0 0 540 250" font-family="ui-sans-serif, system-ui" font-size="11">
  <rect width="540" height="250" fill="var(--bg-inset)"/>

  <!-- phase 1: training -->
  <text x="20" y="22" fill="var(--text-faint)" font-size="10" font-family="var(--font-mono)">1 — FÁZE UČENÍ</text>
  <rect x="20" y="32" width="130" height="58" rx="5" fill="var(--bg-card)" stroke="var(--line-strong)" stroke-width="0.8"/>
  <text x="85" y="50" text-anchor="middle" fill="var(--text)" font-size="10">trénovací sada</text>
  <text x="85" y="65" text-anchor="middle" fill="var(--text-muted)" font-size="9" font-family="var(--font-mono)">(x_i , y_i)</text>
  <text x="85" y="80" text-anchor="middle" fill="var(--text-faint)" font-size="9">cíl JE známý</text>

  <line x1="150" y1="61" x2="195" y2="61" stroke="var(--accent)" stroke-width="1.4" marker-end="url(#ar)"/>
  <text x="172" y="54" text-anchor="middle" fill="var(--text-faint)" font-size="8.5">učení</text>

  <rect x="197" y="38" width="110" height="46" rx="5" fill="var(--accent)" opacity="0.85"/>
  <text x="252" y="58" text-anchor="middle" fill="var(--bg-inset)" font-size="11" font-weight="700">algoritmus</text>
  <text x="252" y="73" text-anchor="middle" fill="var(--bg-inset)" font-size="9">indukce modelu</text>

  <line x1="307" y1="61" x2="352" y2="61" stroke="var(--accent)" stroke-width="1.4" marker-end="url(#ar)"/>

  <rect x="354" y="32" width="130" height="58" rx="5" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2"/>
  <text x="419" y="55" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="600">model f(x)</text>
  <text x="419" y="72" text-anchor="middle" fill="var(--text-muted)" font-size="9">klasifikátor</text>

  <!-- phase 2: use -->
  <text x="20" y="132" fill="var(--text-faint)" font-size="10" font-family="var(--font-mono)">2 — FÁZE POUŽITÍ</text>
  <rect x="20" y="142" width="130" height="50" rx="5" fill="var(--bg-card)" stroke="var(--line-strong)" stroke-width="0.8"/>
  <text x="85" y="162" text-anchor="middle" fill="var(--text)" font-size="10">nový objekt x</text>
  <text x="85" y="178" text-anchor="middle" fill="var(--text-faint)" font-size="9">cíl NENÍ znám</text>

  <line x1="150" y1="167" x2="352" y2="167" stroke="var(--accent-line)" stroke-width="1.4" marker-end="url(#ar)"/>
  <text x="250" y="160" text-anchor="middle" fill="var(--text-faint)" font-size="8.5">aplikace modelu f</text>

  <rect x="354" y="142" width="130" height="50" rx="5" fill="var(--accent-line)" opacity="0.85"/>
  <text x="419" y="172" text-anchor="middle" fill="var(--bg-inset)" font-size="11" font-weight="700">predikce ŷ</text>

  <!-- discrete vs continuous -->
  <line x1="20" y1="206" x2="520" y2="206" stroke="var(--line)" stroke-width="0.6"/>
  <text x="85" y="224" text-anchor="middle" fill="var(--accent)" font-size="10" font-weight="600">KLASIFIKACE</text>
  <text x="85" y="240" text-anchor="middle" fill="var(--text-muted)" font-size="9">ŷ ∈ { třída A, B, C }  (diskrétní)</text>
  <text x="370" y="224" text-anchor="middle" fill="var(--accent-line)" font-size="10" font-weight="600">PREDIKCE / REGRESE</text>
  <text x="370" y="240" text-anchor="middle" fill="var(--text-muted)" font-size="9">ŷ ∈ ℝ  (spojitá hodnota)</text>

  <defs>
    <marker id="ar" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

## Proč oddělené sady

Pokud se model testuje na *týchž* datech, na kterých se učil, kvalita se *nadhodnotí*: model si trénovací příklady může „zapamatovat" (*přeučení / overfitting*) a na nových datech selhat. Proto se data dělí na **trénovací** (učení), případně **validační** (ladění hyperparametrů) a **testovací** (finální odhad kvality). Robustnější odhad dává *křížová validace* — viz [[hodnoceni]].

Typické klasifikátory (rozhodovací strom, naivní Bayes, neuronová síť) i regresní modely (lineární, nelineární) rozebírá [[klasifikatory]].

::: quiz "Čím se klasifikace zásadně liší od predikce (regrese)?"
- [x] Klasifikace předpovídá diskrétní třídu, regrese spojitou číselnou hodnotu
  > Oba jsou řízené učení se stejnou strukturou (x → y); liší se typem výstupu y.
- [ ] Klasifikace je bez učitele, predikce s učitelem
  > Obě jsou s učitelem — trénují se na datech se známým cílem.
- [ ] Klasifikace nepotřebuje trénovací data
  > Naopak, učí se model právě z trénovací sady s anotovanými třídami.
- [ ] Predikce nikdy nepoužívá testovací sadu
  > Kvalita regrese se rovněž ověřuje na oddělených datech.
:::

::: link "Han, Kamber, Pei — Data Mining: Concepts and Techniques (kap. Classification)" "https://eecs.csuohio.edu/~sschung/CIS660/Data%20MiningJHan_Chapter8_Classification.pdf"
:::

---

*Zdroj: PBI státnicové okruhy NBIO, VUT FIT. Externí reference: J. Han, M. Kamber, J. Pei — Data Mining: Concepts and Techniques (3. vyd., Morgan Kaufmann), kap. 8 „Classification: Basic Concepts".*
