// komise-page.jsx — "Komise" feature page.
//
// Shows what each examiner historically asked at the state exam (MSZ), mapped onto
// concrete exam topics, with a "min-max by commission" view: pick who will sit on
// your board and get a ranked list of what to prioritise. The data is fetched from
// external repositories (see komise.js) — nothing here is bundled.

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  addRepo, removeRepo, setRepoEnabled, restoreDefault,
  rankForCommission, topicsForMember, buildSpecFilter, recordInSpec,
  buildCommissionExport, exportToCSV, parseBoardParam, downloadText,
} from "./komise.js";
import { useKomise } from "./komise-context.jsx";
import { SEASON_2026, findCommittee2026, formatNumbers, numbersHint, committeeSpecCodes } from "./komise-2026.js";

/* small line icons, sized to sit inline with button text (matches the app's 24-grid stroke set) */
const Ic = (d, sw = 2) => (p) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>{d}</svg>
);
const IconDownload = Ic(<><path d="M12 3v11" /><path d="m8 11 4 4 4-4" /><path d="M5 21h14" /></>);
const IconLink = Ic(<><path d="M9 15 15 9" /><path d="M11 6.5 12 5.5a4 4 0 0 1 5.7 5.7l-1 1" /><path d="M13 17.5 12 18.5a4 4 0 0 1-5.7-5.7l1-1" /></>);
const IconUsers = Ic(<><path d="M15 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1" /><circle cx="8.5" cy="8" r="3.2" /><path d="M16 5a3.2 3.2 0 0 1 0 6.2M22 19v-1a4 4 0 0 0-3-3.8" /></>);
const IconChevron = Ic(<path d="m9 6 6 6-6 6" />, 2.4);

/* Save / share / export bar for the selected commission. When a spec filter is active
 * the export mirrors the on-screen list (only in-specialization questions). */
function ExportBar({ index, board, filter }) {
  const [copied, setCopied] = useState(false);
  const stamp = () => new Date().toISOString().slice(0, 10);
  const data = () => buildCommissionExport(index, board, { exportedAt: new Date().toISOString() }, filter);
  const dlJSON = () => downloadText(JSON.stringify(data(), null, 2), `komise-${stamp()}.json`, "application/json");
  const dlCSV = () => downloadText(exportToCSV(data()), `komise-${stamp()}.csv`, "text/csv;charset=utf-8");
  const copyLink = async () => {
    const link = location.href;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.toast && window.toast("Odkaz zkopírován — ulož si ho");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      window.toast && window.toast("Schránka není dostupná — zkopíruj si odkaz ručně");
      window.prompt("Zkopíruj si odkaz:", link);
    }
  };
  const n = index.records.filter((r) => board.includes(r.memberKey) && recordInSpec(r, filter)).length;
  return (
    <div className="komise-export">
      <span className="komise-export-label">
        Ulož / sdílej výběr <b className="komise-export-count">{n} otázek</b>
      </span>
      <div className="komise-export-actions">
        <button className="komise-xbtn" data-on={copied} onClick={copyLink} title="Odkaz s tvojí komisí — ulož do záložek nebo pošli dál">
          <IconLink /> {copied ? "Zkopírováno" : "Odkaz"}
        </button>
        <span className="komise-xsep" aria-hidden="true" />
        <button className="komise-xbtn dl" onClick={dlCSV} title="Export otázek jako tabulku (CSV pro Excel)">
          <IconDownload /> CSV
        </button>
        <button className="komise-xbtn dl" onClick={dlJSON} title="Export otázek jako JSON">
          <IconDownload /> JSON
        </button>
      </div>
    </div>
  );
}

/* ─── helpers ─────────────────────────────────────────────── */
function resolveTopic(content, course, topic, fallbackTitle) {
  const c = content.findCourse(course);
  const t = c && (c.topics || []).find((x) => x.id === topic);
  return {
    exists: !!t,
    title: fallbackTitle || (t && t.title) || topic,
    route: t ? `/c/${course}/${topic}` : null,
  };
}

function ConfBadge({ low }) {
  if (!low) return null;
  return (
    <span className="komise-approx" title="Přibližné přiřazení — ověř podle textu dotazu">≈</span>
  );
}

// Expandable list of the raw "what was asked" notes.
function QuestionNotes({ records, memberNameOf }) {
  return (
    <ul className="komise-notes">
      {records.map((r) => (
        <li key={r.id}>
          <span className="komise-note-meta">
            <span className="search-chip">{r.course}</span>
            {memberNameOf && r.memberKey && <b>{memberNameOf(r.memberKey)}</b>}
            <span className="komise-note-session">{r.session}</span>
          </span>
          <span className="komise-note-text">{r.text || r.title || "—"}</span>
        </li>
      ))}
    </ul>
  );
}

/* ─── member picker (min-max) — type-ahead combobox ───────── */
const fold = (s) => (s || "").normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();

function MemberPicker({ members, board, onAdd }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef(null);
  const boardSet = new Set(board);

  // suggest members not already on the board; rank earliest name match first, then
  // by how often they examine. Empty query shows the most frequent examiners.
  const suggestions = useMemo(() => {
    const f = fold(q.trim());
    const pool = members.filter((m) => !boardSet.has(m.key));
    let list;
    if (!f) {
      list = pool; // already sorted by count
    } else {
      list = pool
        .map((m) => ({ m, idx: fold(m.display).indexOf(f), course: (m.courses || []).some((c) => c.toLowerCase().includes(f)) }))
        .filter((x) => x.idx >= 0 || x.course)
        .sort((a, b) => (a.idx < 0 ? 99 : a.idx) - (b.idx < 0 ? 99 : b.idx) || b.m.count - a.m.count)
        .map((x) => x.m);
    }
    return list.slice(0, 8);
  }, [members, q, board]);

  useEffect(() => { setActive(0); }, [q]);
  useEffect(() => {
    const onDoc = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const add = (m) => { if (!m) return; onAdd(m.key); setQ(""); setActive(0); setOpen(true); };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((i) => Math.min(suggestions.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); add(suggestions[active]); }
    else if (e.key === "Escape") { e.preventDefault(); setOpen(false); }
  };

  return (
    <div className="komise-combo" ref={boxRef}>
      <input
        className="komise-picker-input"
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Přidej komisaře — piš jméno nebo zkratku předmětu…"
        spellCheck={false}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
      />
      {open && (
        <ul className="komise-suggest" role="listbox">
          {suggestions.length === 0 ? (
            <li className="komise-suggest-empty">{q.trim() ? `Nikdo neodpovídá „${q}“.` : "Všichni komisaři už jsou ve výběru."}</li>
          ) : suggestions.map((m, i) => (
            <li
              key={m.key}
              role="option"
              aria-selected={i === active}
              className="komise-suggest-item"
              data-active={i === active}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => { e.preventDefault(); add(m); }}
            >
              <span className="komise-suggest-name">{m.display}</span>
              {m.titles && <span className="komise-suggest-titles">{m.titles}</span>}
              <span className="komise-suggest-meta">
                {(m.courses || []).slice(0, 4).map((c) => <span key={c} className="search-chip">{c}</span>)}
                <span className="komise-chip-n">{m.count}×</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ─── committee-number lookup (static 2026 schedule) ──────────
 * Enter the "číslo komise" from the official roster and the whole committee lands on
 * the board. Members the data knows nothing about are reported instead of added; if
 * the board already held people OUTSIDE the committee, an inline prompt asks whether
 * to drop them. The extras are SNAPSHOTTED at apply time (matched against every
 * committee key, with data or not) and the snapshot only ever SHRINKS: once a key
 * leaves the board — by "Odebrat" or by hand — it stops being this lookup's business,
 * so members the user deliberately (re-)adds afterwards are never nagged about. */
function CommitteeLookup({ index, board, setBoard, memberNameOf, onCommittee }) {
  const [q, setQ] = useState("");
  const [res, setRes] = useState(null); // {error} | {committee, addedN, anyData, noData, extrasAtApply, keepExtras}

  useEffect(() => {
    if (!res || res.error || !res.extrasAtApply.length) return;
    const pruned = res.extrasAtApply.filter((k) => board.includes(k));
    if (pruned.length !== res.extrasAtApply.length) setRes({ ...res, extrasAtApply: pruned });
  }, [board, res]);

  const extras = useMemo(() => {
    if (!res || res.error || res.keepExtras) return [];
    const snap = new Set(res.extrasAtApply);
    return board.filter((k) => snap.has(k));
  }, [res, board]);

  const apply = () => {
    const c = findCommittee2026(q);
    if (!c) {
      setRes({ error: q.trim()
        ? `Komisi „${q.trim()}“ v rozpisu nenajdeme — zkus číslo ${numbersHint()}.`
        : `Zadej číslo komise (${numbersHint()}).` });
      return;
    }
    const targetKeys = []; // addable: this index has records for them
    const noData = [];
    for (const p of c.people) {
      const ks = p.keys.filter((k) => index.byKey.has(k));
      if (ks.length) targetKeys.push(...ks);
      else noData.push(p.name);
    }
    const added = targetKeys.filter((k) => !board.includes(k));
    // committee membership ≠ having data: extras are judged against ALL committee
    // keys, so switching repositories can't declare real committee members "extra"
    const committee = new Set(c.people.flatMap((p) => p.keys));
    const extrasAtApply = board.filter((k) => !committee.has(k));
    if (added.length) setBoard([...board, ...added]);
    // a no-op re-apply of the same committee keeps an earlier "Nechat" dismissal
    const keepExtras = !!(res && !res.error && res.committee === c && !added.length && res.keepExtras);
    setRes({ committee: c, addedN: added.length, anyData: targetKeys.length > 0, noData, extrasAtApply, keepExtras });
    // entering a committee number is an explicit "show me THIS specialization" — turn
    // the spec filter on (and re-on, if the user had switched it off for a prior one).
    onCommittee && onCommittee(c);
  };

  const c = res && res.committee;
  return (
    <div className="komise-lookup">
      <div className="komise-lookup-row">
        <label className="komise-lookup-label" htmlFor="komise-cislo">
          Znáš číslo své komise?<span className="komise-lookup-season">{SEASON_2026}</span>
        </label>
        <input
          id="komise-cislo"
          className="komise-picker-input komise-lookup-input"
          value={q}
          onChange={(e) => { setQ(e.target.value); }}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); apply(); } }}
          placeholder="např. 73"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
        />
        <button className="btn primary komise-lookup-btn" onClick={apply}>Vyplnit komisi</button>
      </div>

      {res && (
        <div className="komise-lookup-result" aria-live="polite">
          {res.error ? (
            <div className="komise-lookup-err">{res.error}</div>
          ) : (
            <>
              <div className="komise-lookup-meta">
                <b>Komise {formatNumbers(c.numbers)}</b> · {c.date} · {c.room}
                <span className="search-chip">{c.spec}</span>
                <span className="komise-muted">
                  {res.addedN > 0 ? `přidáno ${res.addedN}`
                    : res.anyData ? "všichni už ve výběru byli"
                    : "nikdo z komise nemá v datech záznamy"}
                </span>
              </div>
              <div className="komise-lookup-people">
                {c.people.map((p) => (
                  <span key={p.name} className="komise-lookup-person" data-nodata={p.keys.length === 0 || !p.keys.some((k) => index.byKey.has(k))}>
                    {p.role && <em>{p.role === "místopředseda" ? "místopř." : p.role}</em>}
                    {p.name}
                  </span>
                ))}
              </div>
              {res.noData.length > 0 && (
                <div className="komise-lookup-note">
                  Bez záznamů v datech: <b>{res.noData.join(", ")}</b> — v žebříčku se neobjeví.
                </div>
              )}
              {extras.length > 0 && (
                <div className="komise-lookup-extras">
                  <span>
                    Ve výběru máš i komisaře mimo komisi {formatNumbers(c.numbers)}:{" "}
                    <b>{extras.map((k) => memberNameOf(k)).join(", ")}</b>
                  </span>
                  <span className="komise-lookup-extras-btns">
                    <button
                      className="btn komise-lookup-drop"
                      onClick={() => {
                        const drop = new Set(extras);
                        setBoard(board.filter((k) => !drop.has(k)));
                      }}
                    >
                      Odebrat ({extras.length})
                    </button>
                    <button className="btn ghost" onClick={() => setRes({ ...res, keepExtras: true })}>Nechat</button>
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── ranked topic row ────────────────────────────────────── */
function TopicRow({ content, t, memberNameOf, navigate, rank }) {
  const [open, setOpen] = useState(false);
  const r = resolveTopic(content, t.course, t.topic, t.examTitle);
  const memberLabel = t.members.map((m) => memberNameOf(m.key) + (m.count > 1 ? ` ×${m.count}` : "")).join(", ");
  return (
    <div className="komise-topic" data-open={open}>
      <div className="komise-topic-head">
        <span className="komise-rank" title={`${t.hits}× dotaz`}>{t.hits}</span>
        <div className="komise-topic-main">
          <button
            className="komise-topic-title"
            disabled={!r.route}
            onClick={() => r.route && navigate(r.route)}
            title={r.route ? "Otevřít látku" : "Látka zatím není v appce"}
          >
            <span className="search-chip">{t.course}</span>
            <span>{r.title}</span>
            <ConfBadge low={!t.anyHigh} />
            {r.route && <span className="komise-go">→</span>}
          </button>
          <div className="komise-topic-by">{memberLabel}</div>
        </div>
      </div>
      <button className="komise-expand" data-open={open} onClick={() => setOpen((v) => !v)}>
        <IconChevron className="komise-expand-ic" />
        {open ? "Skrýt dotazy" : `Zobrazit dotazy (${t.records.length})`}
      </button>
      {open && <QuestionNotes records={t.records} memberNameOf={memberNameOf} />}
    </div>
  );
}

/* ─── commission overview charts ──────────────────────────────
 * Two at-a-glance graphs over the spec-filtered ranking, for min-maxing:
 *  • a donut of which COURSES the board asks (where to focus), and
 *  • horizontal okruh bars whose length = how often asked and whose colour
 *    segments show WHO asked it (one colour per board member). */
const CHART_HUES = [264, 28, 150, 48, 200, 322, 96, 174, 292, 12, 222, 122, 338, 70];
const chartColor = (i) => `oklch(0.67 0.15 ${CHART_HUES[i % CHART_HUES.length]})`;

function CommissionCharts({ content, ranked, boardMembers, memberNameOf, navigate }) {
  // stable colour per board member (board order)
  const memberColor = useMemo(() => {
    const m = new Map();
    boardMembers.forEach((mem, i) => m.set(mem.key, chartColor(i)));
    return m;
  }, [boardMembers]);

  // course totals = mapped-topic hits + loose counts, ranked desc
  const courses = useMemo(() => {
    const c = new Map();
    for (const t of ranked.topics) c.set(t.course, (c.get(t.course) || 0) + t.hits);
    for (const g of ranked.loose) c.set(g.course, (c.get(g.course) || 0) + g.count);
    const arr = [...c.entries()].map(([course, count]) => ({ course, count }))
      .sort((a, b) => b.count - a.count || a.course.localeCompare(b.course));
    return { arr, total: arr.reduce((s, x) => s + x.count, 0) };
  }, [ranked]);

  // per-member ask totals across mapped topics (for the legend chips)
  const memberTotals = useMemo(() => {
    const m = new Map();
    for (const t of ranked.topics) for (const mm of t.members) m.set(mm.key, (m.get(mm.key) || 0) + mm.count);
    return m;
  }, [ranked]);

  const topTopics = ranked.topics.slice(0, 12);
  const maxHits = Math.max(1, ...topTopics.map((t) => t.hits));

  // donut conic-gradient
  let acc = 0;
  const stops = courses.arr.map((d, i) => {
    const a = (acc / courses.total) * 360; acc += d.count;
    return `${chartColor(i)} ${a.toFixed(2)}deg ${((acc / courses.total) * 360).toFixed(2)}deg`;
  });
  const pieBg = courses.total ? `conic-gradient(${stops.join(", ")})` : "var(--bg-inset)";
  const legendMembers = boardMembers.filter((m) => memberTotals.get(m.key));

  return (
    <div className="komise-charts">
      <div className="komise-chart">
        <div className="komise-chart-title">Předměty — kam zaměřit přípravu</div>
        <div className="komise-pie-wrap">
          <div className="komise-pie-fig">
            <div className="komise-pie" style={{ background: pieBg }} />
            <div className="komise-pie-center"><b>{courses.total}</b><span>dotazů</span></div>
          </div>
          <ul className="komise-legend">
            {courses.arr.slice(0, 9).map((d, i) => (
              <li key={d.course} className="komise-legend-item">
                <span className="komise-swatch" style={{ background: chartColor(i) }} />
                <span className="search-chip">{d.course}</span>
                <span className="komise-legend-n">{d.count}× · {Math.round((d.count / courses.total) * 100)} %</span>
              </li>
            ))}
            {courses.arr.length > 9 && <li className="komise-legend-more">+{courses.arr.length - 9} dalších</li>}
          </ul>
        </div>
      </div>

      {topTopics.length > 0 && (
        <div className="komise-chart komise-chart-wide">
          <div className="komise-chart-title">Okruhy podle komisaře <span className="komise-muted">— délka = kolikrát, barva = kdo</span></div>
          <div className="komise-memberlegend">
            {legendMembers.map((m) => (
              <span key={m.key} className="komise-ml-item">
                <span className="komise-swatch" style={{ background: memberColor.get(m.key) }} />
                {m.display} <span className="komise-legend-n">{memberTotals.get(m.key)}×</span>
              </span>
            ))}
          </div>
          <div className="komise-bars">
            {topTopics.map((t) => {
              const r = resolveTopic(content, t.course, t.topic, t.examTitle);
              return (
                <button key={t.id} className="komise-bar-row" disabled={!r.route}
                  onClick={() => r.route && navigate(r.route)} title={r.route ? "Otevřít látku" : r.title}>
                  <span className="komise-bar-label"><span className="search-chip">{t.course}</span> {r.title}</span>
                  <span className="komise-bar-track">
                    <span className="komise-bar-fill" style={{ width: `${(t.hits / maxHits) * 100}%` }}>
                      {t.members.map((mm) => (
                        <span key={mm.key} className="komise-bar-seg"
                          style={{ flex: `${mm.count} 1 0`, background: memberColor.get(mm.key) }}
                          title={`${memberNameOf(mm.key)}: ${mm.count}×`} />
                      ))}
                    </span>
                  </span>
                  <span className="komise-bar-n">{t.hits}</span>
                </button>
              );
            })}
          </div>
          {ranked.topics.length > topTopics.length && (
            <div className="komise-muted komise-bars-more">…a dalších {ranked.topics.length - topTopics.length} okruhů v seznamu níže</div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── min-max view ────────────────────────────────────────── */
function MinMaxView({ content, index, board, setBoard, navigate, memberNameOf }) {
  // Spec filter: when the board is filled from a committee NUMBER, restrict the ranking
  // to the okruhy of that committee's specialization (a member sits on several committees
  // and asks across specs — you usually want only THIS one). `filterCodes` holds the
  // committee's spec codes; `allowed` resolves them to course/topic keys (null when none
  // resolve, e.g. a MIT-EN-only committee); `filterOn` lets the user peek at everything.
  const [filterCodes, setFilterCodes] = useState(null);
  const [filterOn, setFilterOn] = useState(true);
  const allowed = useMemo(
    () => (filterCodes ? buildSpecFilter(content.EXAM_TOPICS, filterCodes) : null),
    [content, filterCodes]
  );
  const activeFilter = filterOn && allowed ? allowed : null;

  const onCommittee = useCallback((c) => {
    setFilterCodes(committeeSpecCodes(c));
    setFilterOn(true);
  }, []);

  const ranked = useMemo(() => rankForCommission(index, board, activeFilter), [index, board, activeFilter]);
  const boardMembers = board
    .map((k) => index.members.find((m) => m.key === k))
    .filter(Boolean);

  const toggle = (k) => setBoard(board.includes(k) ? board.filter((x) => x !== k) : [...board, k]);
  const clearAll = () => { setBoard([]); setFilterCodes(null); };
  const specLabel = allowed ? allowed.specs.join(" + ") : "";

  if (index.members.length === 0) {
    return <div className="komise-empty">Žádná data o komisích. Přidej nebo obnov repozitář v záložce <b>Repozitáře</b>.</div>;
  }

  return (
    <div>
      <p className="page-blurb" style={{ marginBottom: "var(--pad-4)" }}>
        Vyber komisaře, kteří tě budou zkoušet. Dole se seřadí okruhy podle toho, jak
        často je právě tihle lidé u státnic chtěli — co nahoře, to si dej do pořádku
        nejdřív.
      </p>

      <CommitteeLookup index={index} board={board} setBoard={setBoard} memberNameOf={memberNameOf} onCommittee={onCommittee} />

      <div className="komise-pick-row">
        <MemberPicker members={index.members} board={board} onAdd={toggle} />
        {index.members.length > board.length && (
          <button
            className="komise-addall"
            onClick={() => setBoard(index.members.map((m) => m.key))}
            title="Vybrat všechny komisaře — pak můžeš stáhnout úplně všechny otázky (CSV/JSON)"
          >
            <IconUsers /> Všichni komisaři <span className="komise-addall-n">{index.members.length}</span>
          </button>
        )}
      </div>

      {board.length > 0 && (
        <div className="komise-board">
          <span className="komise-muted">Tvoje komise:</span>
          {boardMembers.map((m) => (
            <button key={m.key} className="komise-chip" data-on onClick={() => toggle(m.key)}>
              {m.display}<span className="komise-chip-x">×</span>
            </button>
          ))}
          {board.length > boardMembers.length && (
            <span className="komise-muted">({board.length - boardMembers.length} mimo data)</span>
          )}
          <button className="btn ghost komise-clear" onClick={clearAll}>Vyčistit</button>
        </div>
      )}

      {board.length > 0 && allowed && (
        <div className="komise-specfilter" data-on={filterOn}>
          <span className="komise-specfilter-text">
            {filterOn ? (
              <>Jen okruhy specializace <b>{specLabel}</b>
                {ranked.filteredOut > 0 && <> — skryto <b>{ranked.filteredOut}</b> dotazů mimo ni</>}
              </>
            ) : (
              <>Filtr specializace <b>{specLabel}</b> vypnutý — zobrazeny všechny dotazy komise.</>
            )}
          </span>
          <button
            className="btn ghost komise-specfilter-toggle"
            onClick={() => setFilterOn((v) => !v)}
            title={filterOn ? "Zobrazit i dotazy, které tihle komisaři dávali u jiných specializací" : `Filtrovat zpět jen na ${specLabel}`}
          >
            {filterOn ? "Zobrazit vše" : `Filtrovat na ${specLabel}`}
          </button>
        </div>
      )}

      {board.length > 0 && <ExportBar index={index} board={board} filter={activeFilter} />}

      {board.length === 0 ? (
        <div className="komise-empty komise-empty-hint">
          <IconChevron className="komise-empty-arrow" />
          Zadej číslo komise, vyber komisaře výše — nebo přidej rovnou všechny.
        </div>
      ) : ranked.topics.length === 0 && ranked.loose.length === 0 ? (
        <div className="komise-empty">
          {ranked.filteredOut > 0
            ? <>Vybraní komisaři nemají žádné dotazy ve specializaci <b>{specLabel}</b> ({ranked.filteredOut} mají jinde) — zkus <b>Zobrazit vše</b> výše.</>
            : "Od vybraných komisařů zatím nemáme žádné záznamy."}
        </div>
      ) : (
        <>
          <div className="komise-summary">
            <b>{ranked.totalRecords}</b> záznamů · <b>{ranked.topics.length}</b> okruhů
            {ranked.loose.length > 0 && <> · {ranked.loose.reduce((n, g) => n + g.count, 0)} mimo zdejší látku</>}
          </div>
          <CommissionCharts content={content} ranked={ranked} boardMembers={boardMembers} memberNameOf={memberNameOf} navigate={navigate} />
          <div className="komise-topics">
            {ranked.topics.map((t, i) => (
              <TopicRow key={t.id} content={content} t={t} rank={i} navigate={navigate} memberNameOf={memberNameOf} />
            ))}
          </div>
          {ranked.loose.length > 0 && <LooseSection groups={ranked.loose} memberNameOf={memberNameOf} />}
        </>
      )}
    </div>
  );
}

function LooseSection({ groups, memberNameOf }) {
  const [open, setOpen] = useState(false);
  const total = groups.reduce((n, g) => n + g.count, 0);
  return (
    <div className="komise-loose">
      <button className="komise-expand" data-open={open} onClick={() => setOpen((v) => !v)}>
        <IconChevron className="komise-expand-ic" />
        {open ? "Skrýt" : "Zobrazit"} ostatní dotazy mimo zdejší látku ({total})
      </button>
      {open && groups.map((g) => (
        <div key={g.course} className="komise-loose-group">
          <div className="komise-loose-head"><span className="search-chip">{g.course}</span> {g.count}×</div>
          <QuestionNotes records={g.records} memberNameOf={memberNameOf} />
        </div>
      ))}
    </div>
  );
}

/* ─── browse view (per member) ────────────────────────────── */
function MemberCard({ content, index, m, navigate, inBoard, onToggleBoard }) {
  const [open, setOpen] = useState(false);
  const data = useMemo(() => (open ? topicsForMember(index, m.key) : null), [open, index, m.key]);
  return (
    <div className="komise-member" data-open={open}>
      <div className="komise-member-head">
        <button className="komise-member-toggle" onClick={() => setOpen((v) => !v)}>
          <IconChevron className="komise-member-ic" />
          <span className="komise-member-name">{m.display}</span>
          {m.titles && <span className="komise-member-titles">{m.titles}</span>}
          <span className="komise-member-count">{m.count}×</span>
          <span className="komise-member-courses">{(m.courses || []).map((c) => <span key={c} className="search-chip">{c}</span>)}</span>
        </button>
        <button className="komise-add" data-on={inBoard} onClick={onToggleBoard} title={inBoard ? "Odebrat z mé komise" : "Přidat do mé komise"}>
          {inBoard ? "✓ v komisi" : "+ do komise"}
        </button>
      </div>
      {open && data && (
        <div className="komise-member-body">
          {data.topics.map((t) => {
            const r = resolveTopic(content, t.course, t.topic, t.examTitle);
            return (
              <div key={t.id} className="komise-mt">
                <button className="komise-topic-title" disabled={!r.route} onClick={() => r.route && navigate(r.route)}>
                  <span className="search-chip">{t.course}</span>
                  <span>{r.title}</span>
                  <span className="komise-rank inline">{t.records.length}</span>
                  {r.route && <span className="komise-go">→</span>}
                </button>
                <QuestionNotes records={t.records} />
              </div>
            );
          })}
          {data.loose.length > 0 && (
            <div className="komise-mt">
              <div className="komise-muted" style={{ margin: "6px 0" }}>Mimo zdejší látku:</div>
              <QuestionNotes records={data.loose} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BrowseView({ content, index, board, setBoard, navigate }) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const f = fold(q.trim());
    if (!f) return index.members;
    return index.members.filter((m) => fold(m.display).includes(f) || (m.courses || []).some((c) => c.toLowerCase().includes(f)));
  }, [index.members, q]);
  const boardSet = new Set(board);
  const toggle = (k) => setBoard(board.includes(k) ? board.filter((x) => x !== k) : [...board, k]);
  return (
    <div>
      <p className="page-blurb" style={{ marginBottom: "var(--pad-4)" }}>
        Každý komisař a okruhy, na které se u státnic ptal. Rozklikni jméno; „+ do komise"
        ho přidá do tvého min-max výběru.
      </p>
      <input
        className="komise-picker-input"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Najdi komisaře…"
        spellCheck={false}
        autoComplete="off"
      />
      <div className="komise-members">
        {index.members.length === 0 ? (
          <div className="komise-empty">Žádní komisaři — přidej nebo obnov repozitář v záložce <b>Repozitáře</b>.</div>
        ) : list.map((m) => (
          <MemberCard key={m.key} content={content} index={index} m={m} navigate={navigate}
            inBoard={boardSet.has(m.key)} onToggleBoard={() => toggle(m.key)} />
        ))}
      </div>
    </div>
  );
}

/* ─── repositories view ───────────────────────────────────── */
function ReposView({ repos, setRepos, errors, index, reload }) {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState(null);
  const errByUrl = new Map(errors.map((e) => [e.repo.url, e.error]));
  // record counts per repo
  const counts = useMemo(() => {
    const m = new Map();
    if (index) for (const r of index.records) m.set(r.repoId, (m.get(r.repoId) || 0) + 1);
    return m;
  }, [index]);

  const onAdd = () => {
    setErr(null);
    try { setRepos(addRepo(url, name)); setUrl(""); setName(""); }
    catch (e) { setErr(e.message || String(e)); }
  };

  return (
    <div>
      <p className="page-blurb" style={{ marginBottom: "var(--pad-4)" }}>
        Data o komisích se sem <b>stahují z repozitářů</b> (URL vracející JSON ve formátu
        <code> klidecek-komise/v1</code>) — nejsou součástí appky. Výchozí seznam je
        předvyplněný, ale můžeš ho odebrat a přidat si vlastní (např. odkaz na cizí
        sdílený soubor). Seznam se pamatuje v tomto prohlížeči.
      </p>

      <div className="komise-repos">
        {repos.length === 0 && (
          <div className="komise-empty" style={{ padding: "var(--pad-4)" }}>
            Žádný repozitář. Přidej vlastní níže, nebo obnov výchozí seznam.
          </div>
        )}
        {repos.map((r) => {
          const e = errByUrl.get(r.url);
          const n = counts.get(r.id);
          return (
            <div key={r.id} className="komise-repo" data-off={r.enabled === false}>
              <label className="komise-repo-toggle">
                <input type="checkbox" checked={r.enabled !== false} onChange={(ev) => setRepos(setRepoEnabled(r.id, ev.target.checked))} />
              </label>
              <div className="komise-repo-main">
                <div className="komise-repo-name">
                  {r.builtin ? "FIT VUT — MSZ komise" : (r.name || "Repozitář")}
                  {r.builtin && <span className="komise-tag">výchozí</span>}
                  {e ? <span className="komise-tag err">chyba</span>
                     : n != null ? <span className="komise-tag ok">{n} záznamů</span> : null}
                </div>
                <div className="komise-repo-url">{r.url}</div>
                {e && <div className="komise-repo-err">{e}</div>}
              </div>
              <button className="btn ghost" style={{ color: "var(--warn)" }} onClick={() => setRepos(removeRepo(r.id))}>Odebrat</button>
            </div>
          );
        })}
      </div>

      {!repos.some((r) => r.builtin) && (
        <button className="btn komise-restore" style={{ marginTop: "var(--pad-3)" }} onClick={() => setRepos(restoreDefault())}>
          ↺ Obnovit výchozí seznam
        </button>
      )}

      <div className="komise-addrepo">
        <input className="komise-picker-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Název (volitelně)" />
        <input className="komise-picker-input" value={url} onChange={(e) => { setUrl(e.target.value); setErr(null); }} placeholder="https://…/komise.json" spellCheck={false} />
        <button className="btn primary" onClick={onAdd} disabled={!url.trim()}>Přidat</button>
        <button className="btn" onClick={() => reload(null, { fresh: true })}>Obnovit</button>
      </div>
      {err && <div className="komise-repo-err" style={{ marginTop: 8 }}>{err}</div>}
    </div>
  );
}

/* ─── page shell ──────────────────────────────────────────── */
export function KomisePage({ content, navigate, active = true }) {
  const { repos, setRepos, status, index, errors, reload, board, setBoard, ensureLoaded } = useKomise();
  const [tab, setTab] = useState("minmax");
  // Only fetch committee data once the page is actually visited. Under the keep-alive
  // shell this component stays mounted, so an unconditional fetch would download the
  // (~1 MB) committee data on every app load for users who never open Komise.
  useEffect(() => { if (active) ensureLoaded(); }, [active, ensureLoaded]);

  // Shareable/saveable selection. The URL carries "?komise=key1,key2". Capture it once at
  // mount (before the reflect effect can rewrite it), adopt it after the index loads so
  // keys are validated against real members (garbled/unknown keys are dropped), then keep
  // the URL in sync with the board.
  const initialSearch = useRef(null);
  if (initialSearch.current === null) initialSearch.current = location.search;
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (hydrated || !index) return; // wait for data so unknown/garbled keys can be dropped
    const keys = parseBoardParam(initialSearch.current);
    const valid = keys ? keys.filter((k) => index.byKey.has(k)) : [];
    if (valid.length) setBoard(valid);
    setHydrated(true);
  }, [index, hydrated, setBoard]);
  useEffect(() => {
    if (!hydrated || !active) return; // only reflect to the URL while Komise is the active page
    try {
      const params = new URLSearchParams(location.search);
      if (board.length) params.set("komise", board.join(",")); else params.delete("komise");
      const qs = params.toString();
      history.replaceState(history.state, "", location.pathname + (qs ? "?" + qs : "") + location.hash);
    } catch { /* replaceState can be blocked (sandboxed iframe / CSP) — non-fatal */ }
  }, [board, hydrated, active]);

  const memberNameOf = useCallback((key) => {
    const m = index && index.members.find((x) => x.key === key);
    return m ? m.display : key;
  }, [index]);

  const tabs = [
    { id: "minmax", label: "Tvoje komise" },
    { id: "browse", label: "Komisaři" },
    { id: "repos", label: "Repozitáře" },
  ];

  return (
    <div className="page komise-page">
      <div className="page-head">
        <button className="detail-back" onClick={() => navigate("/")}>← Domů</button>
        <div className="page-eyebrow">Státnice · co se ptají</div>
        <h1 className="page-title">Komise</h1>
        <p className="page-blurb">
          Z čeho zkoušeli jednotliví komisaři u státnic (MSZ 2018–2025), namapováno na
          okruhy. Zadáš, kdo tě bude zkoušet, a uvidíš, co si zopakovat přednostně.
        </p>
      </div>

      <div className="komise-tabs">
        {tabs.map((t) => (
          <button key={t.id} className="komise-tab" data-active={tab === t.id} onClick={() => setTab(t.id)}>
            {t.label}
            {t.id === "minmax" && board.length > 0 && <span className="komise-tab-badge">{board.length}</span>}
          </button>
        ))}
      </div>

      {!index && status !== "ready" ? (
        <div className="komise-empty"><span className="spinner" style={{ marginRight: 8 }} />Načítám data z repozitářů…</div>
      ) : !index ? (
        <div className="komise-empty">Data se nepodařilo načíst.</div>
      ) : (
        <>
          {errors.length > 0 && tab !== "repos" && (
            <div className="komise-banner">
              {errors.length} repozitář(ů) se nepodařilo načíst — viz záložka Repozitáře.
            </div>
          )}
          {tab === "minmax" && <MinMaxView content={content} index={index} board={board} setBoard={setBoard} navigate={navigate} memberNameOf={memberNameOf} />}
          {tab === "browse" && <BrowseView content={content} index={index} board={board} setBoard={setBoard} navigate={navigate} />}
          {tab === "repos" && <ReposView repos={repos} setRepos={setRepos} errors={errors} index={index} reload={reload} />}
        </>
      )}
    </div>
  );
}
