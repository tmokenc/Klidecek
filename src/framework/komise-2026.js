// komise-2026.js — static MSZ June 2026 committee schedule ("Číslo komise" lookup).
//
// Transcribed from the official roster (materials: "MSZ 2026 ALL KOMISE" sheet,
// columns Číslo komise / Datum / Místnost / Specializace / Předseda / Místopředseda /
// Členové). Each person carries the member key(s) used by the committee-question
// repositories (public/repos/fit-msz.json, built by tools/committee-data/build.py),
// so entering a committee number can fill the min-max board directly.
//
// `keys` is an array because the historical data sometimes can't tell two people
// apart: most "Zbořil" records were recorded surname-only and merged under `zboril`,
// with only a hand-resolved few under `zboril-sr` — so "Zbořil st." maps to BOTH
// pools (better to over-study than miss his questions), while "Zbořil ml." maps to
// the merged pool. New examiners with no historical records get `keys: []`; they are
// listed in the UI as "no data" instead of being added to the board.

export const SEASON_2026 = "MSZ červen 2026";

const P = (name, keys, role) => ({ name, keys, ...(role ? { role } : {}) });

export const COMMITTEES_2026 = [
  {
    numbers: [60, 61, 62], date: "22. 6. 2026", room: "L314", spec: "NCPS+NHPC+NADE",
    people: [
      P("Jaroš J.", ["jaros"], "předseda"),
      P("Vašíček", ["vasicek"], "místopředseda"),
      P("Lengál", ["lengal"]),
      P("Novák", []),
      P("Strnadel", ["strnadel"]),
      P("Bartík", ["bartik"]),
    ],
  },
  {
    numbers: [63, 64], date: "22. 6. 2026", room: "L304", spec: "NMAT+NVER",
    people: [
      P("Rogalewicz", ["rogalewicz"], "předseda"),
      P("Češka", ["ceska"], "místopředseda"),
      P("Hrubý", ["hruby"]),
      P("Smrčka", ["smrcka"]),
      P("Peringer", ["peringer"]),
      P("Rozman", ["rozman"]),
    ],
  },
  {
    numbers: [65], date: "22. 6. 2026", room: "M104", spec: "NSEC",
    people: [
      P("Malinka", ["malinka"], "předseda"),
      P("Ryšavý", ["rysavy"], "místopředseda"),
      P("Křivka", ["krivka"]),
      P("Homoliak", ["homoliak"]),
      P("Polčák", ["polcak"]),
      P("Hranický", ["hranicky"]),
    ],
  },
  {
    numbers: [66], date: "22. 6. 2026", room: "M105", spec: "NMAL",
    people: [
      P("Černocký", ["cernocky"], "předseda"),
      P("Čadík", ["cadik"], "místopředseda"),
      P("Janoušek", ["janousek"]),
      P("Bidlo", ["bidlo"]),
      P("Zbořil ml.", ["zboril"]),
      P("Veigend", []),
    ],
  },
  {
    numbers: [70, 71, 72], date: "23. 6. 2026", room: "L314", spec: "NISD+NBIO+NNET",
    people: [
      P("Matoušek P.", ["matousek"], "předseda"),
      P("Martínek", ["martinek"], "místopředseda"),
      P("Křivka", ["krivka"]),
      P("Burgetová", ["burgetova"]),
      P("Grégr", ["gregr"]),
      P("Květoňová", ["kvetonova"]),
    ],
  },
  {
    numbers: [73], date: "23. 6. 2026", room: "L304", spec: "NADE",
    people: [
      P("Meduna", ["meduna"], "předseda"),
      P("Kreslíková", ["kreslikova"], "místopředseda"),
      P("Bartík", ["bartik"]),
      P("Hynek", ["hynek"]),
      P("Pluskal", ["pluskal"]),
      P("Jaroš M.", []),
    ],
  },
  {
    numbers: [74], date: "23. 6. 2026", room: "M104", spec: "NSEC",
    people: [
      P("Malinka", ["malinka"], "předseda"),
      P("Homoliak", ["homoliak"], "místopředseda"),
      P("Havlena", ["havlena"]),
      P("Ryšavý", ["rysavy"]),
      P("Veselý V.", ["vesely"]),
      P("Goldmann", ["goldmann"]),
    ],
  },
  {
    numbers: [75], date: "23. 6. 2026", room: "M105", spec: "NMAL",
    people: [
      P("Beran V.", ["beran"], "předseda"),
      P("Heřmanský", [], "místopředseda"),
      P("Lengál", ["lengal"]),
      P("Zbořil ml.", ["zboril"]),
      P("Bidlo", ["bidlo"]),
      P("Rychlý", ["rychly"]),
    ],
  },
  {
    numbers: [80, 81], date: "24. 6. 2026", room: "L314", spec: "NNET+NSEN",
    people: [
      P("Matoušek P.", ["matousek"], "předseda"),
      P("Kreslíková", ["kreslikova"], "místopředseda"),
      P("Janoušek", ["janousek"]),
      P("Polčák", ["polcak"]),
      P("Pluskal", ["pluskal"]),
      P("Grégr", ["gregr"]),
    ],
  },
  {
    numbers: [82], date: "24. 6. 2026", room: "L304", spec: "NISD",
    people: [
      P("Meduna", ["meduna"], "předseda"),
      P("Burget R.", ["burget-r"], "místopředseda"),
      P("Rychlý", ["rychly"]),
      P("Květoňová", ["kvetonova"]),
      P("Veselý V.", ["vesely"]),
      P("Hynek", ["hynek"]),
    ],
  },
  {
    numbers: [83, 84], date: "24. 6. 2026", room: "M104", spec: "NVIZ+NGRI",
    people: [
      P("Herout", ["herout"], "předseda"),
      P("Čadík", ["cadik"], "místopředseda"),
      P("Češka", ["ceska"]),
      P("Zemčík", ["zemcik"]),
      P("Bařina", ["barina"]),
      P("Milet", ["milet"]),
    ],
  },
  {
    numbers: [85], date: "24. 6. 2026", room: "M105", spec: "NMAL",
    people: [
      P("Černocký", ["cernocky"], "předseda"),
      P("Beran V.", ["beran"], "místopředseda"),
      P("Lengál", ["lengal"]),
      P("Zbořil ml.", ["zboril"]),
      P("Hradiš", ["hradis"]),
      P("Fajčík", []),
    ],
  },
  {
    numbers: [90, 91], date: "25. 6. 2026", room: "L314", spec: "NISY+NIDE",
    people: [
      P("Zbořil st.", ["zboril-sr", "zboril"], "předseda"),
      P("Janoušek", ["janousek"], "místopředseda"),
      P("Hrubý", ["hruby"]),
      P("Rozman", ["rozman"]),
      P("Peringer", ["peringer"]),
      P("Goldmann", ["goldmann"]),
    ],
  },
  {
    // source sheet lists the spec as "NEMB+NEMB" — two parallel NEMB committees
    numbers: [92, 93], date: "25. 6. 2026", room: "L304", spec: "NEMB",
    people: [
      P("Vašíček", ["vasicek"], "předseda"),
      P("Bidlo", ["bidlo"], "místopředseda"),
      P("Rogalewicz", ["rogalewicz"]),
      P("Zachariášová", []),
      P("Fučík", ["fucik"]),
      P("Strnadel", ["strnadel"]),
    ],
  },
  {
    numbers: [94, 95], date: "25. 6. 2026", room: "M104", spec: "MIT-EN+NGRI",
    people: [
      P("Herout", ["herout"], "předseda"),
      P("Zemčík", ["zemcik"], "místopředseda"),
      P("Češka", ["ceska"]),
      P("Bařina", ["barina"]),
      P("Beran V.", ["beran"]),
      P("Milet", ["milet"]),
    ],
  },
  {
    numbers: [96, 97], date: "25. 6. 2026", room: "M105", spec: "NMAL+NSPE",
    people: [
      P("Černocký", ["cernocky"], "předseda"),
      P("Heřmanský", [], "místopředseda"),
      P("Meduna", ["meduna"]),
      P("Hradiš", ["hradis"]),
      P("Grézl", ["grezl"]),
      P("Fajčík", []),
    ],
  },
];

// "60, 61, 62" → "60–62"; single numbers stay as-is.
export function formatNumbers(numbers) {
  const ns = [...numbers].sort((a, b) => a - b);
  const runs = [];
  for (const n of ns) {
    const last = runs[runs.length - 1];
    if (last && n === last[1] + 1) last[1] = n;
    else runs.push([n, n]);
  }
  return runs.map(([a, b]) => (a === b ? String(a) : `${a}–${b}`)).join(", ");
}

// All valid committee numbers as compact ranges — for hints/error messages.
export function numbersHint() {
  return formatNumbers(COMMITTEES_2026.flatMap((c) => c.numbers));
}

// Find the committee a number belongs to. Accepts free-form input ("73", "komise 73");
// the first run of digits counts. Returns null when nothing matches.
export function findCommittee2026(input) {
  const m = String(input == null ? "" : input).match(/\d+/);
  if (!m) return null;
  const n = parseInt(m[0], 10);
  return COMMITTEES_2026.find((c) => c.numbers.includes(n)) || null;
}

// A committee's `spec` tag split into individual specialization codes
// ("NCPS+NHPC+NADE" → ["NCPS","NHPC","NADE"]). Used to filter the min-max ranking to
// the okruhy that actually belong to the committee's specialization.
export function committeeSpecCodes(committee) {
  return committee && committee.spec
    ? committee.spec.split("+").map((s) => s.trim()).filter(Boolean)
    : [];
}
