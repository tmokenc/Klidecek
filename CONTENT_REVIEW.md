# Content review report

Automated subject-matter review of all 561 study subtopics (120 topics, 13 courses), followed by self-verifying fixes.

## Summary

- **Total findings:** 526  ·  by type: factual-error 353, readability 113, redundancy 47, broken-reference 13
- **By severity:** medium 226, low 221, high 79  ·  **by confidence:** high 270, medium 236, low 20
- **Fixes applied:** ~466 (high/medium-confidence findings, each independently re-verified before editing)
- **Rejected on re-verification:** 34 (finding judged wrong, or fix would lose unique info / target a different file)
- **Low-confidence findings NOT auto-applied (left for human review):** 20

## Findings per course

| Course | findings |
| :-- | --: |
| AVS | 44 |
| BIO | 47 |
| BIS | 30 |
| BZA | 50 |
| FLP | 16 |
| KRY | 54 |
| MSP | 41 |
| PDS | 53 |
| PIS | 24 |
| PRL | 49 |
| SUI | 35 |
| TIN | 41 |
| UPA | 42 |

## Low-confidence findings left for human review

These were surfaced by the review but had low confidence, so they were **not** auto-applied. Each is worth a human glance.

- **PRL/vyhledavani-trideni/vyhledavani.md** — _factual-error/low_: The reason a parallel algorithm's cost cannot be asymptotically smaller than the best sequential running time is the work/cost lower bound (a cost-C parallel computation can be simulated sequentially 
  - suggested: Replace ‚kvůli Brentově teorému‘ with a reference to the work/cost lower bound, e.g. ‚protože cena = Omega(T_sekv): paralelní výpočet s cenou C lze sekvenčně simulovat v O(C), takže C nemůže být asymp
- **PDS/routery/router-kategorie.md** — _factual-error/low_: Internal inconsistency about Mikrotik. The intro cites Mikrotik as the example of the cheapest end ('zařízení za 100 Kč'), but the SOHO examples list Mikrotik at '12–80 Gb/s (specifické modely)', i.e.
  - suggested: Make the two mentions consistent: either cite a low-end Mikrotik model (e.g. hAP/hEX, ~1 Gb/s) in the SOHO list, or change the intro example for the cheap end to a genuinely sub-1Gb/s SOHO device and 
- **TIN/godel/rozhodnutelne-teorie.md** — _factual-error/low_: Presburger arithmetic's decision complexity is given as '2-EXPTIME (dvojitě exponenciální)' as the algorithm's time complexity. The doubly-exponential result is the LOWER bound (Fischer–Rabin 1974) / 
  - suggested: Clarify: 'Problém je dvojnásobně exponenciálně těžký (dolní mez Fischer–Rabin 1974); nejlepší známý deterministický algoritmus běží v trojnásobně exponenciálním čase (Oppen 1978). Přesná charakterizac
- **TIN/godel/godel-neuplnost.md** — _factual-error/low_: Date inconsistency for Tarski's truth-undefinability theorem: the body states 'Věta (Tarski, 1933)' but the source footer cites it as '(Studia Philosophica, 1936)'. Both years exist in the literature 
  - suggested: Use one date consistently, e.g. body 'Věta (Tarski, 1933/1936)' or note '(polský originál 1933, něm. překlad 1936)' to reconcile with the footer.
- **KRY/symetricka-zaklady/delka-klice.md** — _factual-error/low_: The EFF 'Deep Crack' machine is consistently documented as containing 1,856 custom ASIC chips (29 boards × 64 chips), not 1,728. The cost (~$250K) and time (~56 hours) are correct.
  - suggested: Change "1 728 ASIC čipů" to "1 856 ASIC čipů (29 desek × 64 čipů)".
- **KRY/asymetricka-algoritmy/elipticke.md** — _factual-error/low_: secp256k1 is described as a 'Koblitzova křivka'. secp256k1 is a Weierstrass curve over a prime field F_p (p = 2^256 - 2^32 - 977); true Koblitz curves are defined over binary fields F_{2^m}. The SEC '
  - suggested: Replace '"Koblitzova křivka"' with a correct description, e.g. 'a=0 (j-invariant 0), což umožňuje efektivní GLV endomorfismus' and drop the Koblitz label (or note that the 'k' in secp256k1 only refere
- **KRY/klice-asymetricka/pki-uvod.md** — _factual-error/low_: States EV browser indicators were removed '~2018'. The dedicated EV UI (company name / green address bar) was removed in 2019: Chrome 77 (September 2019) and Firefox 70 (October 2019) moved EV info ou
  - suggested: Change '~2018' to '~2019' (Chrome 77 a Firefox 70 přesunuly EV indikátory mimo adresní řádek v roce 2019).
- **KRY/klice-asymetricka/revokace.md** — _factual-error/low_: CRLite is described as a single Bloom filter that 'má false positives (cert může vypadat revoked, i když není)' for which the client falls back to OCSP. The published CRLite design (Larisch et al., IE
  - suggested: Clarify that CRLite uses a Bloom filter *cascade* (filter cascade) engineered to give zero false positives/negatives over the set of known certificates; OCSP fallback is only needed for certificates n
- **BZA/rng/linux-rng.md** — _factual-error/low_: Neither identifier appears to be a real Linux mechanism. There is no sysctl named crng_init_wait; the blocking-until-seeded behavior is provided by getrandom(2) itself / the CRNG init state, not a sys
  - suggested: Remove the crng_init_wait sysctl bullet (or replace with the real mechanism: getrandom() blocking on CRNG init). Replace LinuxLoaderRandomSeed with the actual mechanism (EFI random-seed config table /
- **BZA/rng/linux-rng.md** — _factual-error/low_: The pre-5.18 legacy input pool was 4096 bits = 512 bytes (the value reported by /proc/sys/kernel/random/poolsize), not 128 bytes. The modern BLAKE2s-based pool keeps a 256-bit (32-byte) hash digest as
  - suggested: State the legacy input pool as 4096 bits (512 bytes) of LFSR state, and describe the post-5.18 pool as a BLAKE2s hash with a 256-bit state, rather than "128 bajtů".
- **BZA/hsm/utoky-na-api.md** — _broken-reference/low_: The link labeled "Bond 2001 útok" points to Survey.pdf (Mike Bond's general survey), not to the specific 2001 API-level attacks paper that the source footer cites (Bond & Anderson, "API-Level Attacks 
  - suggested: Point the link to the Bond & Anderson 2001 paper URL used in the footer (keymgt.pdf), or relabel the link as a survey reference.
- **BIO/oblicej/eigenfaces-pca.md** — _factual-error/low_: The complexity claim 'Pro N = 100 a d = 10000: redukce z 10^8 na 10^4 ops' is mislabeled. The numbers 10^8 and 10^4 correspond to the matrix sizes (d^2 = 10^8 entries for C, N^2 = 10^4 entries for L),
  - suggested: Either relabel as matrix size ('redukce velikosti matice z 10^8 na 10^4 prvků') or give the eigendecomposition cost (≈10^12 vs ≈10^6 operací), but do not label the matrix-entry counts as 'ops'.
- **BIO/duhovka-sitnice/daugman.md** — _factual-error/low_: Under 'Limity Daugman algoritmu' the bullet 'Pathology — diabetic retinopathy, glaucoma affect iris too' implies these affect the iris. Diabetic retinopathy and glaucoma are primarily RETINAL/optic-ne
  - suggested: Replace with iris-relevant pathology, e.g. 'Pathology — surgery (cataract/lens replacement), trauma, or diabetes-related iridopathy (rubeosis iridis) can alter the iris', and drop the diabetic-retinop
- **BIO/duhovka-sitnice/sitnice-cevy.md** — _readability/low_: '320 reference *coronal* features' uses 'coronal' (a body/anatomical plane term) for retinal scan features. The EyeDentify retinal scanner used an annular/circular scan around the optic disc and encod
  - suggested: Replace 'coronal' with the correct descriptor, e.g. '320 reference points sampled along a circular (annular) scan around the optic disc'.
- **SUI/nn-zaklady/gradient-descent.md** — _factual-error/low_: The L2/weight-decay update note in the regularization section (cross-file: stated in nn-generalizace) omits the learning rate: it says the optimizer 'adds −λ·W to the update', but the actual contribut
  - suggested: State '−α·λ·W' (or note that λW is added to the gradient before the α-scaled step), to keep the learning-rate factor consistent with the GD update rule.
- **SUI/nn-zaklady/gradient-descent.md** — _redundancy/low_: The 'automatic differentiation / computational graph' explanation (forward pass builds graph, frameworks know per-op derivatives, backward traverses graph applying chain rule, PyTorch/TF/JAX) is given
  - suggested: Keep the detailed treatment in gradient-descent.md and trim the neuron-vrstvy.md version to a one-line pointer ('autograd/backprop viz [[gradient-descent]]') to avoid the duplicated 3-point list.
- **MSP/mle-vlastnosti/exponencialni-rodina.md** — _factual-error/low_: The log-partition function A(η) is described as the 'moment generating function v převlečené formě'. A(η) is actually the cumulant generating function (log-normalizer): its derivatives give cumulants 
  - suggested: State that A(η) is the cumulant generating function (kumulantová vytvořující funkce) of T: its first two derivatives yield the mean and variance of T; the MGF of T is exp(A(η+s)−A(η)).
- **UPA/nosql-dotazovani/mapreduce.md** — _factual-error/low_: States Cassandra 'GROUP BY pouze na partition key'. In CQL, GROUP BY operates on the partition key AND clustering columns (in their defined prefix order), not only the partition key — e.g. you can GRO
  - suggested: Change to '(Cassandra GROUP BY jen na partition key a clustering columns v pořadí jejich definice)'.
- **BIS/access-control/bell-lapadula.md** — _factual-error/low_: The BLP lattice SVG is drawn as a Hasse diagram but contains edges between non-covering pairs, which misrepresents the lattice structure. It draws TS,{N}→S,{} and TS,{C}→S,{} (skipping S,{N} / S,{C} w
  - suggested: Remove the skip-level edges and draw only covering edges: connect S,{N}→S,{} and S,{C}→S,{} so the only edge into U,{} comes from S,{}; likewise route TS,{N}/TS,{C} only to S,{N}/S,{C} (their covers),
- **BIS/sec-ops/audit-forensics.md** — _factual-error/low_: The framing claims both audit and forensics answer the question "what happened?". A security audit does not primarily reconstruct what happened; it assesses whether security controls are adequately de
  - suggested: Reword to contrast the two questions, e.g.: "Audit plánovaně odpovídá na otázku 'jsou kontroly adekvátní / jsme v souladu?', forensics reaktivně na otázku 'co se stalo?'."

## Method

1. One reviewer agent per topic read all its subtopics and reported factual errors, missing info, readability issues, redundancy, and broken references (findings only).
2. One fix agent per file independently re-verified each high/medium-confidence finding against domain knowledge and applied only confirmed, surgical corrections; the rest were rejected.
3. The site was rebuilt and the markdown re-parsed in a headless browser to confirm no rendering regressions.

_Generated by the content-review + content-fix workflows. The blue ✓ verified badge in the UI still marks only human-reviewed material; these automated fixes raise the floor but do not replace human verification._