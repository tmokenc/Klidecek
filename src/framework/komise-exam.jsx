// komise-exam.jsx — committee insights surfaced inside the final-exam-prep pages.
//
//  ExamSpecHistogram  — on a specialization's topic list: when a commission is set,
//                       a histogram of how often each okruh was asked (My / Všichni).
//  ExamTopicAskedBy   — on a single okruh: who asked it (global by default, with a
//                       My-commission / Všichni toggle).
//
// Both read the shared board + index from KomiseContext and load it lazily.

import { useState, useEffect, useMemo } from "react";
import { useKomise } from "./komise-context.jsx";
import { askHistogram, whoAsked, examTopicRecords, buildExamTopicExport, exportToCSV, downloadText } from "./komise.js";

/* The raw "what was asked" notes for one examiner on this okruh — same shape as the
 * Komise page's detail, but scoped to the topic you're currently viewing. */
function MemberNotes({ records }) {
  return (
    <ul className="komise-notes">
      {records.map((r) => (
        <li key={r.id}>
          <span className="komise-note-meta">
            <span className="search-chip">{r.course || (r.map && r.map.course) || "?"}</span>
            {r.num && <span className="komise-note-session">#{r.num}</span>}
            <span className="komise-note-session">{r.session}</span>
          </span>
          <span className="komise-note-text">{r.text || r.title || "—"}</span>
        </li>
      ))}
    </ul>
  );
}

function ScopeToggle({ scope, setScope }) {
  return (
    <div className="komise-scope" role="tablist">
      <button role="tab" aria-selected={scope === "board"} data-active={scope === "board"} onClick={() => setScope("board")}>Moje komise</button>
      <button role="tab" aria-selected={scope === "global"} data-active={scope === "global"} onClick={() => setScope("global")}>Všichni</button>
    </div>
  );
}

/* Histogram of asked okruhy for a whole specialization. Gated on a commission being
 * set (that's the "min-max" lens); a toggle widens it to all examiners. */
export function ExamSpecHistogram({ specId, topics, navigate }) {
  const k = useKomise();
  const [scope, setScope] = useState("board");
  const hasBoard = !!(k && k.board.length);
  useEffect(() => { if (hasBoard && k) k.ensureLoaded(); }, [hasBoard, k]);

  if (!hasBoard || !k.index) return null; // no commission set → no histogram
  const rows = askHistogram(k.index, topics, k.board, scope)
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count || a.n - b.n);
  const max = Math.max(1, ...rows.map((d) => d.count));

  return (
    <section className="komise-hist">
      <div className="komise-hist-head">
        <div>
          <h2 className="komise-hist-title">Nejčastěji zkoušené okruhy</h2>
          <p className="komise-hist-sub">
            {scope === "board" ? "Podle tvé komise" : "Napříč všemi komisaři"} — co nahoře, to opakuj přednostně.
          </p>
        </div>
        <ScopeToggle scope={scope} setScope={setScope} />
      </div>
      {rows.length === 0 ? (
        <div className="komise-muted" style={{ padding: "var(--pad-3) 0" }}>
          {scope === "board" ? "Z tvé komise u téhle specializace nemáme žádné záznamy — přepni na Všichni." : "Žádné záznamy."}
        </div>
      ) : (
        <div className="komise-hist-bars">
          {rows.map((d) => (
            <button key={d.id} className="komise-hist-row" onClick={() => navigate(`/x/${specId}/${d.id}`)} title={d.title}>
              <span className="komise-hist-fill" style={{ width: `${(100 * d.count) / max}%` }} />
              <span className="komise-hist-n">{String(d.n).padStart(2, "0")}</span>
              <span className="komise-hist-label">{d.title}</span>
              <span className="komise-hist-count">{d.count}×</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

/* Who asked this single okruh. Global by default; toggle to your commission only.
 * Board members are highlighted even in the global view. */
export function ExamTopicAskedBy({ topic }) {
  const k = useKomise();
  const [scope, setScope] = useState("global");
  const [openKey, setOpenKey] = useState(null); // which examiner's detail is expanded
  useEffect(() => { if (k) k.ensureLoaded(); }, [k]);
  useEffect(() => { setOpenKey(null); }, [scope]); // collapse detail when switching scope

  // records for this okruh grouped by examiner — for the expandable detail (like the
  // Komise page), scoped to what each person asked on THIS topic.
  const recsByMember = useMemo(() => {
    const map = new Map();
    if (k && k.index) {
      for (const r of examTopicRecords(k.index, topic)) {
        if (!r.memberKey) continue;
        (map.get(r.memberKey) || map.set(r.memberKey, []).get(r.memberKey)).push(r);
      }
    }
    return map;
  }, [k && k.index, topic]);

  if (!k || !k.index) return null;
  const { members, total, boardTotal } = whoAsked(k.index, topic, k.board);
  if (total === 0) return null; // nobody on record asked this → nothing to show

  const hasBoard = k.board.length > 0;
  const shown = scope === "board" ? members.filter((m) => m.mine) : members;
  const openMember = shown.find((m) => m.key === openKey);
  const openRecs = openMember ? recsByMember.get(openMember.key) : null;
  const dlCount = scope === "board" ? boardTotal : total;

  // download this okruh's questions, honouring the current scope (Moje komise / Všichni)
  const slug = topic.id || `okruh-${topic.n}`;
  const expData = () => buildExamTopicExport(k.index, topic, k.board, scope, { exportedAt: new Date().toISOString() });
  const dlCSV = () => downloadText(exportToCSV(expData()), `komise-${slug}-${scope}.csv`, "text/csv;charset=utf-8");
  const dlJSON = () => downloadText(JSON.stringify(expData(), null, 2), `komise-${slug}-${scope}.json`, "application/json");

  return (
    <section className="komise-asked">
      <div className="komise-asked-head">
        <span className="komise-asked-title">
          Kdo se na tohle ptal
          <span className="komise-asked-total">{scope === "board" ? boardTotal : total}×</span>
        </span>
        <div className="komise-asked-actions">
          {hasBoard && <ScopeToggle scope={scope} setScope={setScope} />}
          {dlCount > 0 && (
            <span className="komise-asked-dl" title={scope === "board" ? "Stáhnout otázky tvé komise k tomuto okruhu" : "Stáhnout všechny otázky k tomuto okruhu"}>
              <span className="komise-asked-dl-label">Stáhnout</span>
              <button type="button" className="komise-asked-dl-btn" onClick={dlCSV}>CSV</button>
              <button type="button" className="komise-asked-dl-btn" onClick={dlJSON}>JSON</button>
            </span>
          )}
        </div>
      </div>
      {shown.length === 0 ? (
        <div className="komise-muted">Z tvé komise se na tohle zatím nikdo neptal.</div>
      ) : (
        <div className="komise-asked-list">
          {shown.map((m) => {
            const open = openKey === m.key;
            return (
              <button
                key={m.key}
                type="button"
                className="komise-asked-chip"
                data-mine={m.mine}
                data-open={open}
                aria-expanded={open}
                title={(m.mine ? "Ve tvé komisi · " : "") + "rozklikni jeho dotazy"}
                onClick={() => setOpenKey(open ? null : m.key)}
              >
                {m.display}
                <span className="komise-asked-n">{m.count}×</span>
              </button>
            );
          })}
        </div>
      )}
      {openMember && openRecs && openRecs.length > 0 && (
        <div className="komise-asked-detail">
          <div className="komise-asked-detail-head">
            <span><b>{openMember.display}</b> <span className="komise-muted">— co se ptal/a u tohoto okruhu</span></span>
            <button type="button" className="komise-asked-detail-close" onClick={() => setOpenKey(null)} aria-label="Zavřít detail">×</button>
          </div>
          <MemberNotes records={openRecs} />
        </div>
      )}
    </section>
  );
}
