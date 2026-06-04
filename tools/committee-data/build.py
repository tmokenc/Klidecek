#!/usr/bin/env python3
"""Convert the MSZ committee Excel into a Klideček "komise" repository JSON.

Input : materials/MSZ 2026 ALL KOMISE.xlsx  (sheets "List 1" = MSZ 2025, "2024")
        public/content/manifest.json         (for topic mapping)
Output: public/repos/fit-msz.json            (fetched at runtime by the app)

Each Excel row is one record: a committee member asked about some course topic and
the student wrote down what was asked / how it went. We:
  1. normalise the (very messy) member strings into canonical surnames,
  2. map each record onto a concrete {course, topic} exam question using a keyword
     matcher built from the app's own topic / sub-topic / exam-question titles,
  3. emit a compact, self-describing JSON "repository".

Run:  python3 tools/committee-data/build.py
"""
import json, re, sys, unicodedata
from pathlib import Path
from collections import Counter, defaultdict

ROOT = Path(__file__).resolve().parents[2]
XLSX = ROOT / "materials" / "MSZ 2026 ALL KOMISE.xlsx"
MANIFEST = ROOT / "public" / "content" / "manifest.json"
OUT = ROOT / "public" / "repos" / "fit-msz.json"

# Only "List 1" is read: it carries every year (MSZ 2023/2024/2025) with a per-row
# session label in column 0. The standalone "2024" sheet is an exact duplicate of
# List 1's MSZ-2024 block, so reading it too would double-count the frequencies.
SOURCE_SHEET = "List 1"


def fold(s: str) -> str:
    """lowercase + strip diacritics, for accent-insensitive matching."""
    s = unicodedata.normalize("NFKD", str(s))
    s = "".join(c for c in s if not unicodedata.combining(c))
    return s.lower().strip()


# ── Member normalisation ────────────────────────────────────────────────────
# Canonical people keyed by diacritic-folded surname. `first` / `titles` are the
# nicest display forms; `aka` lists folded alias tokens / nicknames that also map
# here (nicknames, FSI co-examiners, sr./jr. forms).
PEOPLE = {
    "burget":     ("Burget", "Lukáš / Radek", "doc. Ing., Ph.D.", []),
    "burgetova":  ("Burgetová", "", "Ing.", []),
    "malinka":    ("Malinka", "Kamil", "Mgr., Ph.D.", []),
    "vojnar":     ("Vojnar", "Tomáš", "prof. Ing., Ph.D.", []),
    "rogalewicz": ("Rogalewicz", "Adam", "doc. Mgr., Ph.D.", ["rogalo"]),
    "polcak":     ("Polčák", "Libor", "Ing., Ph.D.", []),
    "ceska":      ("Češka", "Milan", "prof. RNDr., CSc.", []),
    "peringer":   ("Peringer", "Petr", "Dr. Ing.", ["pepe"]),
    "hradis":     ("Hradiš", "Michal", "Ing., Ph.D.", []),
    "jaros":      ("Jaroš", "Jiří", "doc. Ing., Ph.D.", []),
    "janousek":   ("Janoušek", "Vladimír", "doc. Ing., Ph.D.", []),
    "cernocky":   ("Černocký", "Jan", "prof. Dr. Ing.", []),
    "beran":      ("Beran", "Vít", "Ing.", []),
    "bidlo":      ("Bidlo", "Michal", "doc. Ing., Ph.D.", []),
    "matousek":   ("Matoušek", "Petr", "doc. Ing., Ph.D., M.A.", []),
    "smrz":       ("Smrž", "Pavel", "doc. RNDr., Ph.D.", []),
    "hruska":     ("Hruška", "Tomáš", "prof. Ing., CSc.", []),
    "hruby":      ("Hrubý", "Martin", "Ing., Ph.D.", []),
    "mrazek":     ("Mrázek", "Vojtěch", "Ing., Ph.D.", []),
    "sekanina":   ("Sekanina", "Lukáš", "prof. Ing., Ph.D.", []),
    "milet":      ("Milet", "", "", []),
    "vesely":     ("Veselý", "Vladimír", "Ing., Ph.D.", []),
    "rysavy":     ("Ryšavý", "Ondřej", "doc. Ing., Ph.D.", []),
    "holik":      ("Holík", "Lukáš", "Mgr., Ph.D.", []),
    "barina":     ("Bařina", "David", "Ing., Ph.D.", []),
    "lengal":     ("Lengál", "Ondřej", "Ing., Ph.D.", []),
    "zboril":     ("Zbořil", "František", "doc. Ing.", ["zborilstarsi", "zborilst", "starsi"]),
    "rychly":     ("Rychlý", "Marek", "RNDr., Ph.D.", []),
    "bartik":     ("Bartík", "Vladimír", "Ing., Ph.D.", []),
    "krivka":     ("Křivka", "Zbyněk", "Ing., Ph.D.", []),
    "grezl":      ("Grézl", "František", "Ing., Ph.D.", []),
    "gregr":      ("Grégr", "Matěj", "Ing., Ph.D.", ["greg"]),
    "herout":     ("Herout", "Adam", "prof. Ing., Ph.D.", []),
    "hranicky":   ("Hranický", "Radek", "Ing., Ph.D.", []),
    "rozman":     ("Rozman", "Jaroslav", "Ing., Ph.D.", []),
    "kreslikova": ("Kreslíková", "Jitka", "doc. RNDr., CSc.", []),
    "kvetonova":  ("Květoňová", "Šárka", "Ing., Ph.D.", []),
    "cadik":      ("Čadík", "Martin", "doc. Ing., Ph.D.", []),
    "meduna":     ("Meduna", "Alexandr", "prof. RNDr., CSc.", []),
    "martinek":   ("Martínek", "Tomáš", "doc. Ing., Ph.D.", []),
    "ruzicka":    ("Růžička", "Richard", "doc. Ing., Ph.D., MBA", []),
    "smrcka":     ("Smrčka", "Aleš", "Ing., Ph.D.", []),
    "koci":       ("Kočí", "Radek", "Ing., Ph.D.", []),
    "dytrych":    ("Dytrych", "Jaroslav", "Ing., Ph.D.", []),
    "chudy":      ("Chudý", "Peter", "Ing., Ph.D., MBA", []),
    "drabek":     ("Drábek", "Vladimír", "doc. Ing., CSc.", []),
    "havlena":    ("Havlena", "Vojtěch", "Ing., Ph.D.", []),
    "goldmann":   ("Goldmann", "Tomáš", "Ing., Ph.D.", []),
    "pluskal":    ("Pluskal", "Jan", "Ing., Ph.D.", []),
    "kolar":      ("Kolář", "Dušan", "doc. Dr. Ing.", []),
    "hynek":      ("Hynek", "Jiří", "Ing., Ph.D.", []),
    "kanich":     ("Kanich", "Ondřej", "Ing., Ph.D.", []),
    "ocenasek":   ("Očenášek", "Pavel", "Mgr. Ing., Ph.D.", []),
    "strnadel":   ("Strnadel", "Josef", "Ing., Ph.D.", []),
    "materna":    ("Materna", "Zdeněk", "Ing., Ph.D.", []),
    "spanel":     ("Španěl", "Michal", "doc. Ing., Ph.D.", []),
    "fucik":      ("Fučík", "Otto", "doc. Ing., CSc.", []),
    "homoliak":   ("Homoliak", "Ivan", "Ing., Ph.D.", []),
    "hanacek":    ("Hanáček", "Petr", "doc. Dr. Ing.", []),
    "zemcik":     ("Zemčík", "Pavel", "prof. Dr. Ing.", []),
    "vasicek":    ("Vašíček", "Zdeněk", "doc. Ing., Ph.D.", []),
    "korenek":    ("Kořenek", "Jan", "doc. Ing., Ph.D.", []),
}
# folded alias token -> canonical key
ALIAS = {}
for key, (_s, _f, _t, akas) in PEOPLE.items():
    for a in akas:
        ALIAS[a] = key

TITLE_TOKENS = {
    "ing", "bc", "mgr", "rndr", "dr", "doc", "prof", "csc", "drsc", "phd",
    "mba", "ma", "msc", "dipl", "h", "c", "st", "ml", "phd.", "ph",
}
JUNK = {"", "nan", "?", "bleh", "vsichni", "pepe?"}


def member_key(raw: str):
    """raw member string -> (canonical_key|None, first_name|'')."""
    if raw is None:
        return None, ""
    s = str(raw).strip()
    if not s:
        return None, ""
    # drop parentheticals like "(předseda)", "(FSI)"
    s_clean = re.sub(r"\([^)]*\)", " ", s)
    low = fold(s_clean)
    if low in JUNK or low.startswith("zapomel") or low.startswith("ek,"):
        return None, ""
    # token list, diacritics folded, punctuation split
    raw_tokens = re.split(r"[\s,./]+", s_clean)
    toks = [fold(t).strip(".") for t in raw_tokens if t.strip()]
    toks = [t for t in toks if t]
    # 1) direct surname token match (longest-known wins)
    found = None
    for t in toks:
        if t in PEOPLE:
            found = t
            break
        if t in ALIAS:
            found = ALIAS[t]
            break
    # 2) substring match for glued forms ("zborilstarsi")
    if not found:
        joined = "".join(toks)
        for t, k in ALIAS.items():
            if t and t in joined:
                found = k
                break
    if not found:
        for k in PEOPLE:
            if k in toks:
                found = k
                break
    if not found:
        return None, ""
    # first name = a non-title, non-surname token (prefer a known first name form)
    surname_disp, known_first, _t, _a = PEOPLE[found]
    first = ""
    for orig in raw_tokens:
        ft = fold(orig).strip(".")
        if not ft or ft in TITLE_TOKENS or ft == found or ft in PEOPLE or ft in ALIAS:
            continue
        if re.match(r"^[a-z]{3,}$", ft):  # looks like a name word
            first = orig.strip()
            break
    return found, first


# ── Topic mapping ───────────────────────────────────────────────────────────
STOP = set(fold(w) for w in (
    "a i v ve na se si je to co ze za po pri pak ale nebo jako ktery ktera ktere "
    "jeho jejich tak tam uz k ke s o u the of and in for is are at jak pro od do "
    "neni nad pod mezi nez vsak dale tedy zde tato tento tyto jsou byt jeho dat "
    "popis popsat vysvetlit chtel ptal rekl zacal jsem jsme problematika "
    "system systemu zaklady zaklad uvod pojem pojmy vlastnosti princip principy "
    "model metody metoda navrh data typy zpracovani pomoci jejich vyuziti operace"
).split())

ACR_KEEP = set("xss csrf csp rsa aes dom http rest soap mpi tdd uml uma numa esb "
               "mom rpc cap acid base oid rdf owl sql cdn xhr uri url urn isr fsm "
               "gpio adc i2c spi mvc mvvm mvi pwa solid grasp gof crc sop hls dfg "
               "asic fpga vhdl simd simt omp pram svm cnn rnn gmm hmm za ka ts za".split())


def tokenize(text):
    out = []
    for tok in re.split(r"[^0-9a-zžščřďťňěáíéóúůýäöü]+", fold(text)):
        tok = tok.strip()
        if not tok:
            continue
        if tok in STOP:
            continue
        if len(tok) >= 4 or tok in ACR_KEEP:
            out.append(tok)
    return out


def build_topic_index(manifest):
    """course id -> [{topic, title, bag:set, weights:{term:w}}]; plus exam titles."""
    courses = {c["id"]: c for c in manifest["courses"]}
    # course-topic -> set of official exam-question titles
    exam_titles = defaultdict(set)
    for spec, topics in manifest.get("exam", {}).items():
        entries = topics.values() if isinstance(topics, dict) else topics
        for entry in entries:
            for ref in entry.get("refs", []) or []:
                if len(ref) >= 2:
                    exam_titles[(ref[0], ref[1])].add(entry.get("title", ""))
    index = {}
    canon_title = {}
    for cid, course in courses.items():
        topics = []
        df = Counter()
        for topic in course.get("topics", []):
            tid = topic["id"]
            parts = [topic.get("title", "")]
            parts += [s.get("title", "") for s in topic.get("subtopics", [])]
            parts += list(exam_titles.get((cid, tid), []))
            bag = set(tokenize(" ".join(parts)))
            topics.append({"topic": tid, "title": topic.get("title", ""), "bag": bag})
            ex = sorted(exam_titles.get((cid, tid), []), key=len, reverse=True)
            canon_title[(cid, tid)] = ex[0] if ex else topic.get("title", "")
            for term in bag:
                df[term] += 1
        n = max(1, len(topics))
        for t in topics:
            t["weights"] = {term: (1.0 + (0 if df[term] <= 1 else -0.0)) * (n / df[term])
                            for term in t["bag"]}
        index[cid] = topics
    return index, canon_title


# course-code aliases in the sheet -> app course id (only ones the app actually has)
COURSE_ALIAS = {"avs?": "AVS", "sui": "SUI", "mpr": None, "sdl ?": None, "zpo?": None}


def map_record(course, title, text, index, canon):
    course = (course or "").strip()
    cid = course if course in index else COURSE_ALIAS.get(course.lower(), course)
    if cid not in index:
        return None
    rec_tokens = tokenize((title or "") + " " + (text or ""))
    if not rec_tokens:
        return {"course": cid, "topic": None, "examTitle": None, "confidence": "course"}
    best, best_score, second = None, 0.0, 0.0
    for t in index[cid]:
        score = sum(t["weights"].get(tok, 0.0) for tok in rec_tokens if tok in t["bag"])
        # title-substring bonus
        if title and fold(t["title"]).split("(")[0].strip()[:12] and \
           fold(t["title"]).split()[0] in fold(title):
            score += 2.0
        if score > best_score:
            second = best_score
            best, best_score = t, score
        elif score > second:
            second = score
    if not best or best_score < 2.0:
        return {"course": cid, "topic": None, "examTitle": None, "confidence": "course"}
    conf = "high" if (best_score >= 5.0 and best_score >= second * 1.6) else "low"
    return {"course": cid, "topic": best["topic"],
            "examTitle": canon.get((cid, best["topic"])), "confidence": conf}


# ── Read Excel ──────────────────────────────────────────────────────────────
def read_rows():
    import openpyxl
    import warnings
    warnings.filterwarnings("ignore")
    wb = openpyxl.load_workbook(XLSX, data_only=True)
    rows = []
    ws = wb[SOURCE_SHEET]
    session = "MSZ"
    for r in ws.iter_rows(values_only=True):
        r = list(r) + [None] * (5 - len(r))
        if r[0] and str(r[0]).strip():
            session = str(r[0]).strip()      # forward-fill year blocks
        member, c2, course, text = r[1], r[2], r[3], r[4]
        if True:
            # col2 may be a topic number (float/int) or a topic title string
            title, num = "", None
            if c2 is not None:
                sc = str(c2).strip()
                if re.fullmatch(r"\d+(\.0)?", sc):
                    num = int(float(sc))
                elif sc:
                    title = sc
            text = "" if text is None else str(text).strip()
            if not (member or course or title or text):
                continue
            rows.append({"session": session, "member": member, "num": num,
                         "title": title, "course": (str(course).strip() if course else ""),
                         "text": text})
    wb.close()
    return rows


def main():
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    index, canon = build_topic_index(manifest)
    rows = read_rows()

    members = {}      # key -> aggregate
    first_seen = defaultdict(Counter)
    records = []
    n_map_high = n_map_low = n_map_course = n_unmapped = 0
    for i, row in enumerate(rows):
        key, first = member_key(row["member"])
        if key:
            m = members.setdefault(key, {
                "key": key, "surname": PEOPLE[key][0], "first": PEOPLE[key][1],
                "titles": PEOPLE[key][2], "aliases": set(), "count": 0})
            m["count"] += 1
            if row["member"]:
                m["aliases"].add(str(row["member"]).strip())
            if first:
                first_seen[key][first] += 1
        # skip rows with neither a real topic nor text (pure spacers)
        if not (row["title"] or row["text"]):
            continue
        mp = map_record(row["course"], row["title"], row["text"], index, canon)
        if mp is None:
            n_unmapped += 1
        elif mp["topic"] is None:
            n_map_course += 1
        elif mp["confidence"] == "high":
            n_map_high += 1
        else:
            n_map_low += 1
        records.append({
            "id": f"r{i:04d}",
            "session": row["session"],
            "memberKey": key,
            "course": row["course"],
            "num": row["num"],
            "title": row["title"] or None,
            "text": row["text"] or None,
            "map": mp,
        })

    member_list = []
    for key, m in members.items():
        m["aliases"] = sorted(m["aliases"])
        # if no curated first name, fall back to the most-seen extracted one
        if not m["first"] and first_seen[key]:
            m["first"] = first_seen[key].most_common(1)[0][0]
        m["display"] = (m["first"] + " " + m["surname"]).strip() if m["first"] else m["surname"]
        member_list.append(m)
    member_list.sort(key=lambda x: (-x["count"], x["surname"]))

    out = {
        "schema": "klidecek-komise/v1",
        "name": "FIT VUT — MSZ komise",
        "description": "Co se u státnic (MSZ) ptali jednotliví komisaři, namapováno na "
                       "okruhy. Zdroj: studentské zápisky z MSZ 2024–2025.",
        "sourceFile": XLSX.name,
        "version": "2026.06",
        "members": member_list,
        "records": records,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")

    # ── diagnostics ──
    total = len(records)
    print(f"rows read            : {len(rows)}")
    print(f"records emitted      : {total}")
    print(f"distinct members     : {len(member_list)}")
    print(f"  mapped high conf   : {n_map_high} ({100*n_map_high//max(1,total)}%)")
    print(f"  mapped low conf    : {n_map_low}")
    print(f"  course-only        : {n_map_course}")
    print(f"  course unknown     : {n_unmapped}")
    unknown = sum(1 for r in records if not r["memberKey"])
    print(f"records w/o member   : {unknown}")
    print(f"\noutput: {OUT.relative_to(ROOT)}  ({OUT.stat().st_size//1024} KB)")
    print("\nTop members:")
    for m in member_list[:12]:
        print(f"  {m['count']:3d}  {m['display']:24s} [{', '.join(sorted(set(a[:18] for a in m['aliases']))[:3])}]")


if __name__ == "__main__":
    sys.exit(main())
