// komise-page.jsx — "Komise" feature page.
//
// Shows what each examiner historically asked at the state exam (MSZ), mapped onto
// concrete exam topics, with a "min-max by commission" view: pick who will sit on
// your board and get a ranked list of what to prioritise. The data is fetched from
// external repositories (see komise.js) — nothing here is bundled.

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  loadRepos, addRepo, removeRepo, setRepoEnabled, restoreDefault,
  loadBoard, saveBoard, fetchAll, buildIndex, clearRepoCache,
  rankForCommission, topicsForMember,
} from "./komise.js";

/* ─── data hook ───────────────────────────────────────────── */
function useKomiseData() {
  const [repos, setRepos] = useState(() => loadRepos());
  const [state, setState] = useState({ status: "loading", index: null, errors: [] });

  const reload = useCallback((repoList, { fresh = false } = {}) => {
    const list = repoList || loadRepos();
    if (fresh) clearRepoCache();
    setState((s) => ({ ...s, status: "loading" }));
    fetchAll(list).then(({ payloads, errors }) => {
      const index = buildIndex(payloads);
      setState({ status: "ready", index, errors });
    });
  }, []);

  useEffect(() => { reload(repos); /* eslint-disable-next-line */ }, []);

  const mutate = useCallback((next, opts) => { setRepos(next); reload(next, opts); }, [reload]);
  return { repos, setRepos: mutate, ...state, reload };
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
            <li className="komise-suggest-empty">{q.trim() ? `Nikdo neodpovídá „${q}".` : "Všichni komisaři už jsou ve výběru."}</li>
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
      <button className="komise-expand" onClick={() => setOpen((v) => !v)}>
        {open ? "Skrýt dotazy" : `Zobrazit dotazy (${t.records.length})`}
      </button>
      {open && <QuestionNotes records={t.records} memberNameOf={memberNameOf} />}
    </div>
  );
}

/* ─── min-max view ────────────────────────────────────────── */
function MinMaxView({ content, index, board, setBoard, navigate, memberNameOf }) {
  const ranked = useMemo(() => rankForCommission(index, board), [index, board]);
  const boardMembers = board
    .map((k) => index.members.find((m) => m.key === k))
    .filter(Boolean);

  const toggle = (k) => setBoard(board.includes(k) ? board.filter((x) => x !== k) : [...board, k]);

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

      <MemberPicker members={index.members} board={board} onAdd={toggle} />

      {boardMembers.length > 0 && (
        <div className="komise-board">
          <span className="komise-muted">Tvoje komise:</span>
          {boardMembers.map((m) => (
            <button key={m.key} className="komise-chip" data-on onClick={() => toggle(m.key)}>
              {m.display}<span className="komise-chip-x">×</span>
            </button>
          ))}
          <button className="btn ghost komise-clear" onClick={() => setBoard([])}>Vyčistit</button>
        </div>
      )}

      {board.length === 0 ? (
        <div className="komise-empty">Vyber alespoň jednoho komisaře výše.</div>
      ) : ranked.topics.length === 0 && ranked.loose.length === 0 ? (
        <div className="komise-empty">Od vybraných komisařů zatím nemáme žádné záznamy.</div>
      ) : (
        <>
          <div className="komise-summary">
            <b>{ranked.totalRecords}</b> záznamů · <b>{ranked.topics.length}</b> okruhů
            {ranked.loose.length > 0 && <> · {ranked.loose.reduce((n, g) => n + g.count, 0)} mimo zdejší látku</>}
          </div>
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
      <button className="komise-expand" onClick={() => setOpen((v) => !v)}>
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
          <span className="komise-member-name">{m.display}</span>
          {m.titles && <span className="komise-member-titles">{m.titles}</span>}
          <span className="komise-member-count">{m.count}×</span>
          <span className="komise-member-courses">{(m.courses || []).map((c) => <span key={c} className="search-chip">{c}</span>)}</span>
        </button>
        <button className="btn ghost komise-add" data-on={inBoard} onClick={onToggleBoard} title={inBoard ? "Odebrat z mé komise" : "Přidat do mé komise"}>
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
export function KomisePage({ content, navigate }) {
  const { repos, setRepos, status, index, errors, reload } = useKomiseData();
  const [tab, setTab] = useState("minmax");
  const [board, setBoardState] = useState(() => loadBoard());
  const setBoard = useCallback((keys) => { setBoardState(keys); saveBoard(keys); }, []);

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
          Z čeho zkoušeli jednotliví komisaři u státnic (MSZ 2023–2025), namapováno na
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

      {status === "loading" && !index ? (
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
