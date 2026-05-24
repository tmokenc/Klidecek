// MSP statistics helpers — verified PDFs, CDFs, quantiles, samplers.
// Shared by all MSP viz components. Correctness here is critical:
// wrong values would actively miseducate.
//
// References:
//   Abramowitz & Stegun (1972), Handbook of Mathematical Functions
//   Press et al., Numerical Recipes in C (2nd ed., 1992)
//   Lanczos (1964) for log-gamma
//   Beasley-Springer (1977) + Moro (1995) for inverse normal CDF

// ===== Constants =====
export const SQRT_2PI = Math.sqrt(2 * Math.PI);
export const SQRT_2 = Math.sqrt(2);
export const LN_2PI = Math.log(2 * Math.PI);
export const EPS = 1e-14;

// ===== Seeded PRNG (mulberry32) for reproducible simulations =====
export function mulberry32(seed) {
  let s = (seed | 0) >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ===== erf — Abramowitz & Stegun 7.1.26, max abs err ~1.5e-7 =====
export function erf(x) {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const t = 1 / (1 + p * ax);
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return sign * y;
}

// ===== log Γ(z) — Lanczos g=7, n=9, relative err < 2e-10 for z > 0 =====
export function gammaLn(z) {
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - gammaLn(1 - z);
  z -= 1;
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return 0.5 * LN_2PI + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

// log B(a, b)
export function betaLn(a, b) {
  return gammaLn(a) + gammaLn(b) - gammaLn(a + b);
}

// ===== Regularized lower incomplete gamma P(a, x) ==================
// Numerical Recipes 6.2 — series for x < a+1, continued fraction otherwise.
export function regGammaP(a, x) {
  if (x < 0 || a <= 0) return NaN;
  if (x === 0) return 0;
  if (x < a + 1) {
    let term = 1 / a;
    let sum = term;
    for (let n = 1; n < 200; n++) {
      term *= x / (a + n);
      sum += term;
      if (Math.abs(term) < Math.abs(sum) * 1e-12) break;
    }
    return sum * Math.exp(-x + a * Math.log(x) - gammaLn(a));
  } else {
    return 1 - regGammaQ(a, x);
  }
}

export function regGammaQ(a, x) {
  if (x < 0 || a <= 0) return NaN;
  if (x === 0) return 1;
  if (x < a + 1) return 1 - regGammaP(a, x);
  // continued fraction (Lentz)
  let b = x + 1 - a;
  let c = 1 / 1e-300;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i < 200; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < 1e-300) d = 1e-300;
    c = b + an / c;
    if (Math.abs(c) < 1e-300) c = 1e-300;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-12) break;
  }
  return h * Math.exp(-x + a * Math.log(x) - gammaLn(a));
}

// ===== Regularized incomplete beta I_x(a, b) ==================
// Numerical Recipes 6.4 — continued fraction.
function betacf(x, a, b) {
  const MAXIT = 200;
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1, d = 1 - (qab * x) / qap;
  if (Math.abs(d) < 1e-300) d = 1e-300;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < 1e-300) d = 1e-300;
    c = 1 + aa / c;
    if (Math.abs(c) < 1e-300) c = 1e-300;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < 1e-300) d = 1e-300;
    c = 1 + aa / c;
    if (Math.abs(c) < 1e-300) c = 1e-300;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-12) break;
  }
  return h;
}

export function regBeta(x, a, b) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const lbeta = a * Math.log(x) + b * Math.log(1 - x) - betaLn(a, b);
  if (x < (a + 1) / (a + b + 2)) {
    return (Math.exp(lbeta) * betacf(x, a, b)) / a;
  }
  return 1 - (Math.exp(lbeta) * betacf(1 - x, b, a)) / b;
}

// ===== Normal N(μ, σ²) =====
export function normalPDF(x, mu = 0, sigma = 1) {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * SQRT_2PI);
}

export function normalCDF(x, mu = 0, sigma = 1) {
  return 0.5 * (1 + erf((x - mu) / (sigma * SQRT_2)));
}

// Inverse standard normal CDF — Beasley-Springer-Moro (max abs err ~3e-9).
export function normalQuantile(p, mu = 0, sigma = 1) {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.38357751867269e2, -3.066479806614716e1, 2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783,
  ];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const pLow = 0.02425, pHigh = 1 - pLow;
  let q, r, x;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    x = ((((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5])) /
        ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    x = ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
        (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    x = -((((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5])) /
        ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  return mu + sigma * x;
}

// ===== Student's t(ν) =====
export function tPDF(x, df) {
  const lc = gammaLn((df + 1) / 2) - gammaLn(df / 2) - 0.5 * Math.log(df * Math.PI);
  return Math.exp(lc) * Math.pow(1 + (x * x) / df, -(df + 1) / 2);
}

export function tCDF(x, df) {
  if (x === 0) return 0.5;
  const u = df / (df + x * x);
  const tail = 0.5 * regBeta(u, df / 2, 0.5);
  return x > 0 ? 1 - tail : tail;
}

export function tQuantile(p, df) {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p === 0.5) return 0;
  let lo = -1e3, hi = 1e3;
  for (let i = 0; i < 100; i++) {
    const m = (lo + hi) / 2;
    if (tCDF(m, df) < p) lo = m;
    else hi = m;
    if (hi - lo < 1e-9) break;
  }
  return (lo + hi) / 2;
}

// ===== χ²(k) =====
export function chi2PDF(x, df) {
  if (x <= 0) return 0;
  const k = df / 2;
  return Math.exp((k - 1) * Math.log(x) - x / 2 - k * Math.log(2) - gammaLn(k));
}

export function chi2CDF(x, df) {
  if (x <= 0) return 0;
  return regGammaP(df / 2, x / 2);
}

export function chi2Quantile(p, df) {
  if (p <= 0) return 0;
  if (p >= 1) return Infinity;
  let lo = 0, hi = Math.max(100, df * 10);
  while (chi2CDF(hi, df) < p) hi *= 2;
  for (let i = 0; i < 100; i++) {
    const m = (lo + hi) / 2;
    if (chi2CDF(m, df) < p) lo = m;
    else hi = m;
    if (hi - lo < 1e-9) break;
  }
  return (lo + hi) / 2;
}

// ===== F(d1, d2) =====
export function fPDF(x, d1, d2) {
  if (x <= 0) return 0;
  const log =
    0.5 * (d1 * Math.log(d1 * x) + d2 * Math.log(d2) - (d1 + d2) * Math.log(d1 * x + d2)) -
    Math.log(x) - betaLn(d1 / 2, d2 / 2);
  return Math.exp(log);
}

export function fCDF(x, d1, d2) {
  if (x <= 0) return 0;
  return regBeta((d1 * x) / (d1 * x + d2), d1 / 2, d2 / 2);
}

export function fQuantile(p, d1, d2) {
  if (p <= 0) return 0;
  if (p >= 1) return Infinity;
  let lo = 0, hi = 100;
  while (fCDF(hi, d1, d2) < p) hi *= 2;
  for (let i = 0; i < 100; i++) {
    const m = (lo + hi) / 2;
    if (fCDF(m, d1, d2) < p) lo = m;
    else hi = m;
    if (hi - lo < 1e-9) break;
  }
  return (lo + hi) / 2;
}

// ===== Beta(a, b) =====
export function betaPDF(x, a, b) {
  if (x <= 0 || x >= 1) return 0;
  return Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) - betaLn(a, b));
}

export function betaCDF(x, a, b) {
  return regBeta(x, a, b);
}

// ===== Gamma(k shape, θ scale) — mean kθ, var kθ² =====
export function gammaPDF(x, k, theta) {
  if (x <= 0) return 0;
  return Math.exp((k - 1) * Math.log(x) - x / theta - k * Math.log(theta) - gammaLn(k));
}

export function gammaCDF(x, k, theta) {
  if (x <= 0) return 0;
  return regGammaP(k, x / theta);
}

// ===== Exponential(λ) =====
export function expPDF(x, lambda) {
  if (x < 0) return 0;
  return lambda * Math.exp(-lambda * x);
}

export function expCDF(x, lambda) {
  if (x < 0) return 0;
  return 1 - Math.exp(-lambda * x);
}

// ===== Poisson(λ) =====
export function poissonPMF(k, lambda) {
  if (k < 0 || k !== Math.floor(k)) return 0;
  return Math.exp(k * Math.log(lambda) - lambda - gammaLn(k + 1));
}

// ===== Binomial(n, p) =====
export function binomialPMF(k, n, p) {
  if (k < 0 || k > n) return 0;
  if (p === 0) return k === 0 ? 1 : 0;
  if (p === 1) return k === n ? 1 : 0;
  return Math.exp(
    gammaLn(n + 1) - gammaLn(k + 1) - gammaLn(n - k + 1) +
    k * Math.log(p) + (n - k) * Math.log(1 - p)
  );
}

// ===== Samplers =====
export function sampleNormal(rng, mu = 0, sigma = 1) {
  const u1 = Math.max(rng(), 1e-15);
  const u2 = rng();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mu + sigma * z;
}

export function sampleExp(rng, lambda) {
  return -Math.log(1 - rng()) / lambda;
}

// Marsaglia-Tsang for Gamma — shape ≥ 1; uses boosting for shape < 1.
export function sampleGamma(rng, k, theta = 1) {
  if (k < 1) {
    const x = sampleGamma(rng, k + 1, 1);
    return theta * x * Math.pow(rng(), 1 / k);
  }
  const d = k - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  while (true) {
    let x, v;
    do {
      x = sampleNormal(rng);
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    const u = rng();
    if (u < 1 - 0.0331 * x * x * x * x) return theta * d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return theta * d * v;
  }
}

export function sampleBeta(rng, a, b) {
  const x = sampleGamma(rng, a);
  const y = sampleGamma(rng, b);
  return x / (x + y);
}

export function samplePoisson(rng, lambda) {
  if (lambda < 30) {
    const L = Math.exp(-lambda);
    let k = 0, p = 1;
    do { k++; p *= rng(); } while (p > L);
    return k - 1;
  }
  return Math.max(0, Math.round(sampleNormal(rng, lambda, Math.sqrt(lambda))));
}

export function sampleBinomial(rng, n, p) {
  if (n < 50) {
    let k = 0;
    for (let i = 0; i < n; i++) if (rng() < p) k++;
    return k;
  }
  return Math.max(0, Math.min(n, Math.round(sampleNormal(rng, n * p, Math.sqrt(n * p * (1 - p))))));
}

export function sampleCategorical(rng, probs) {
  const u = rng();
  let acc = 0;
  for (let i = 0; i < probs.length; i++) {
    acc += probs[i];
    if (u < acc) return i;
  }
  return probs.length - 1;
}

// Mix of N(μ_j, σ²_j) with weights w_j — useful for "any distribution" CLT demos.
export function sampleMixture(rng, components) {
  // components: [{ w, mu, sigma }]
  const u = rng();
  let acc = 0;
  for (const c of components) {
    acc += c.w;
    if (u < acc) return sampleNormal(rng, c.mu, c.sigma);
  }
  return sampleNormal(rng, components[components.length - 1].mu, components[components.length - 1].sigma);
}

// ===== Common quantiles (precomputed) for fast UI labels =====
export const Z = {
  z90:  1.6448536269514722,
  z95:  1.6448536269514722,
  z975: 1.959963984540054,
  z99:  2.3263478740408408,
  z995: 2.5758293035489004,
};
