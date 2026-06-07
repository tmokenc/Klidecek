---
title: Spotřeba procesoru — P = CV²f
---

# Spotřeba CPU — dynamická vs. statická, P = CV²f

Příkon je *druhým* zásadním omezením vedle výkonu (performance). Moderní CPU je výkonově omezený (power-limited): nelze přidat víc jader ani zvýšit frekvenci, *aniž* by se čip přehřál a vyhořel. Návrh ohlížející se na příkon (power-aware design) je proto *nezbytný* zhruba od roku 2005, kdy začalo váznout Dennardovo škálování (Dennard scaling).

## Tři složky příkonu

Celkový ztrátový výkon jednoho tranzistoru:

$$
P_{\text{device}} = \frac{1}{2} C V_{DD} V_{\text{swing}} \alpha f + I_{\text{leakage}} V_{DD} + I_{SC} V_{DD}
$$

- **Přepínací (dynamický, switching)**: $P_{\text{sw}} = \frac{1}{2} C V_{DD} V_{\text{swing}} \alpha f$. Dominantní u starších technologií (větších než 90 nm).
- **Klidový proud (svodový, leakage / static)**: $P_{\text{leak}} = I_{\text{leakage}} V_{DD}$. Roste s teplotou a se zmenšujícími se rozměry tranzistorů.
- **Zkratový proud (short-circuit)**: $P_{SC} = I_{SC} V_{DD}$. Vzniká v krátkém okamžiku přepínání, kdy jsou *oba* tranzistory PMOS i NMOS otevřené. S nižším $V_{DD}$ je méně významný.

U typického 7nm čipu připadá zhruba 60 % na přepínací, 35 % na svodovou a 5 % na zkratovou složku. U 5nm čipů svodová složka roste — u některých návrhů již svodová převyšuje přepínací.

## Zjednodušený vzorec

Často uváděná podoba:

$$
P_{\text{dyn}} = \alpha \cdot C \cdot V^2 \cdot f
$$

- $\alpha$ — faktor aktivity (activity factor, 0–1). Udává, kolik bitů se přepne v každém cyklu. Nečinná ALU: 0,05. Vytížená smyčka (hot loop): 0,5.
- $C$ — kapacita.
- $V$ — napětí.
- $f$ — frekvence.

Klíčová zjištění:

- **Dvojnásobná frekvence → dvojnásobný příkon.**
- **Dvojnásobné napětí → čtyřnásobný příkon.**
- Navíc *vyšší* napětí umožňuje *vyšší* frekvenci (tranzistor přepíná rychleji). Dohromady to znamená zhruba 8× vyšší příkon za zhruba 2× vyšší výkon. *Špatný kompromis (trade-off)*.

## Příkon vs. výkon

Pro danou architekturu (s pevným IPC) platí:

$$
P \propto f \cdot V^2 \propto f^3
$$

(Vyšší $f$ vyžaduje úměrně vyšší $V$, takže příkon roste s třetí mocninou frekvence.)

To je *zásadní výkonově-frekvenční bariéra* (power-frequency wall). Nelze přejít ze 3 GHz na 6 GHz, aniž by se příkon zvedl 8×. Proto frekvence v posledních 15 letech *stagnuje* — jedno jádro běží zhruba na 3–5 GHz a dál se neposouvá.

## Energie vs. příkon

- **Příkon** [W] — *okamžitá* ztráta energie. Omezuje ho chladicí systém.
- **Energie** [J] — *příkon integrovaný v čase*. Omezuje ji baterie a účet za elektřinu.

$$
E = P \cdot t
$$

Pro úlohu trvající $T$ na CPU s průměrným příkonem $P$ je celková spotřebovaná energie $E = P \cdot T$.

### Race-to-idle (rychle hotovo, pak do klidu)

Pokud úlohu spustím na 4GHz procesoru (s dvojnásobným příkonem) místo na 2GHz, *ale* skončí 2× rychleji, je celková spotřebovaná energie *stejná*. Pokud po dokončení může procesor přejít do klidového stavu (idle, zhruba 10× nižší příkon), stráví v něm *více času*.

⇒ **Strategie „rychle hotovo, pak do klidu" (race-to-idle) vyhrává**, pokud je klidový příkon mnohem menší než příkon při zátěži.

Strategie Apple M1: úlohu dokončit *velmi rychle* a poté *velmi rychle* přejít do klidu. Energie na jednu úlohu je tak nižší než u konkurence.

## Termodynamický limit

Landauerův princip (1961): smazání jednoho bitu informace stojí $kT \ln 2 \approx 3 \cdot 10^{-21}$ J při pokojové teplotě.

Žravost moderního CPU je 1 nJ na instrukci, tedy $3 \cdot 10^{11}\times$ víc, než činí Landauerova mez. Stále jsme tedy *daleko* od fyzikálního limitu.

Praktickým limitem je chladicí kapacita. *Vzduchové chlazení* zvládne zhruba 150 W, *kapalinové* asi 300 W, *fázová změna* či *imerzní chlazení* zhruba 500 W. Extrémní přetaktování s *kapalným dusíkem* zvládne krátkodobě i přes 1 kW.

Běžný serverový CPU má 200–400 W TDP (Thermal Design Power, návrhový tepelný výkon). Datacentrový cluster spotřebuje 50–150 kW na jeden rack.

## Příkon v moderním CPU

Intel Core i9-13900K (24jádrový Raptor Lake, 2022):

- Základní: 125 W TDP.
- Příkon v režimu „Maximum Turbo": 253 W.
- Energie na instrukci: zhruba 3 nJ (200 W / (32 vláken × 2 × 10⁹ instrukcí/s)).

AMD Ryzen 9 7950X (16jádrový Zen 4): 170 W TDP, špička 230 W.

Apple M2 Max (12jádrový, 2023): 30 W při plné zátěži. *5× lepší výkon na watt* než desktopové x86.

## Spotřeba po částech jádra

V moderním jádře s přeskupováním instrukcí (OoO, out-of-order; Intel Skylake, simulační data):

| Komponenta | % příkonu |
| :--- | :---: |
| L1 cache | 15 % |
| L2 cache | 10 % |
| Prediktor skoků (branch predictor) | 7 % |
| Dekódování + přejmenování registrů | 12 % |
| OoO plánovač + RS + ROB | 15 % |
| Funkční jednotky (ALU, FPU) | 18 % |
| Registrové pole (register file) | 8 % |
| Paměťový subsystém (L/S, MSHR) | 10 % |
| Svodový proud všude | 5 % |

OoO plánovač je *přepychový* — prohledávání rezervační stanice (RS), rozdělování instrukcí a logika dokončení (retire) — a spotřebuje 15 % příkonu.

**Jádra Apple M** šetří příkon tím, že OoO plánovač je *jednodušší* (in-order zadní část pipeline pro některé μops) a *dekódování je širší* (8 instrukcí najednou oproti 6 u Intelu). K tomu se přidávají další návrhové kompromisy.

## Páky pro řízení příkonu

Hardware může nastavit:

1. **Frekvence** — DVFS (Dynamic Voltage and Frequency Scaling, dynamické škálování napětí a frekvence). Nižší $f$ → nižší příkon.
2. **Napětí** — vždy společně s $f$ (nižší $f$ umožňuje nižší $V$).
3. **Aktivita (clock gating)** — odpojení hodinového signálu od nečinné ALU.
4. **Power gating** — *úplné* odpojení napájení od neaktivních bloků.
5. **C-stavy (C-states)** — režimy spánku procesoru, řízené operačním systémem.

Podrobnosti v [[dvfs-power-mgmt]].

## Programování ohlížející se na příkon

Programátor může příkon ovlivnit takto:

- **Spát, když není co dělat** — `sleep()` či `cv_wait()` jsou lepší než aktivní čekání ve smyčce (spin-loop).
- **Dávkovat vstupy/výstupy (IO)** — vyrovnávat zápisy a čtení do bufferu a snížit tak počet nákladných přechodů.
- **Vektorové instrukce** — udělají *více práce* na instrukci → potřeba *méně* instrukcí → nižší příkon.
- **Přístupy přívětivé pro cache** — méně přístupů do DRAM (jeden přístup do DRAM stojí 100× víc příkonu než přístup do L1).

⇒ Ohled na výkon = ohled na příkon. Optimalizace, která zkracuje čas, *zároveň* šetří energii.

Výjimka: AVX-512 *žere* příkon (širší ALU, vyšší aktivita). Některé procesory proto *automaticky* sníží frekvenci, jakmile se AVX-512 použije, takže přínos je menší, než se čeká. Sapphire Rapids (2023) tento problém zmírňuje.

## Reálná data o nákladech {tier=practice}

Jeden 250W procesor běžící nepřetržitě 24/7:

- Denně: 250 W × 24 h = 6 kWh
- Ročně: 2200 kWh

Při průměrné komerční ceně elektřiny 0,10 $/kWh to dělá **220 $ na jeden procesor ročně** jen za napájení. *K tomu* je třeba připočítat režii chlazení (zhruba o 50 % víc = 330 $).

Datacentrum s 10 000 servery: 3,3 milionu $ ročně za elektřinu. Náklady na výpočetní výkon tvoří *podstatnou část celkových nákladů na vlastnictví (TCO)*.

## Co dál

[[dvfs-power-mgmt]] popisuje, *jak* CPU za běhu mění frekvenci a napětí — DVFS, clock gating, C-stavy. [[nizkoprikon-arch]] popisuje *architektury* navržené od základu pro nízký příkon — VLIW, ARM big.LITTLE, vestavěné RISC-V.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §1.5; Dennard, R.H. et al.: „Design of Ion-Implanted MOSFET's with Very Small Physical Dimensions" (IEEE JSSC SC-9(5), 1974); Esmaeilzadeh, H. et al.: „Dark Silicon and the End of Multicore Scaling" (ISCA 2011, [DOI 10.1145/2024723.2000108](https://doi.org/10.1145/2024723.2000108)).*
