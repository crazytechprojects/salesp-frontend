import { dueStyle, fmt, setAsideColors } from "../lib/format";

const COLUMNS = [
  ["Solicitation", "sol"],
  ["NSN"],
  ["Item", "nom"],
  ["Qty", "qty", "flex-end"],
  ["Buyer"],
  ["Set-aside"],
  ["Issued", "issued"],
  ["Return by", "due"],
];

function Row({ r, saved, selected, onSelect, onStar }) {
  const due = dueStyle(r.left);
  const [saBg, saFg] = setAsideColors(r.setAside);
  const isNew = r.ago === 0;

  return (
    <div className={`rfq-grid rfq-row${selected ? " is-selected" : ""}`} onClick={() => onSelect(r.id)}>
      <button
        className={`star${saved ? " is-saved" : ""}`}
        title={saved ? "Remove from saved" : "Save"}
        onClick={(e) => {
          e.stopPropagation();
          onStar(r.id);
        }}
      >
        {saved ? "★" : "☆"}
      </button>
      <div className="cell-sol">
        <span className="mono-13 strong" style={{ color: r.left != null && r.left < 0 ? "#8B909A" : "#17191E" }}>
          {r.sol}
        </span>
        {isNew && <span className="badge-new">NEW</span>}
      </div>
      <span className="mono-13 ink-2">{r.nsn}</span>
      <div className="cell-item">
        <span className="ellipsis strong">{r.nom || "—"}</span>
        <span className="ellipsis sub">{r.fscLine}</span>
      </div>
      <span className="mono-13 text-right">
        {r.qty != null ? r.qty.toLocaleString() : "—"} <span className="faint">{r.ui}</span>
      </span>
      <span className="text-13 ink-2">{r.office}</span>
      <span className="pill" style={{ background: saBg, color: saFg }}>
        {r.setAside}
      </span>
      <span className="text-13 muted">{isNew ? "Today" : fmt(r.issued)}</span>
      <div className="cell-due">
        <span className="text-13">{fmt(r.due)}</span>
        <span className="due-pill" style={{ background: due.bg, color: due.fg }}>
          {due.label}
        </span>
      </div>
      <a
        className="open-link"
        href={r.url}
        target="_blank"
        rel="noopener noreferrer"
        title="Open on DIBBS"
        onClick={(e) => e.stopPropagation()}
      >
        ↗
      </a>
    </div>
  );
}

export default function ResultsTable({ rows, loading, sort, onSort, savedSet, selectedId, onSelect, onStar, onReset }) {
  return (
    <div className="table-card">
      <div className="table-inner">
        <div className="rfq-grid table-head">
          <span />
          {COLUMNS.map(([label, key, justify]) => (
            <span
              key={label}
              className={`th${key ? " is-sortable" : ""}`}
              style={{ justifyContent: justify || "flex-start" }}
              onClick={() => key && onSort(key)}
            >
              <span>{label}</span>
              <span className="th-arrow">{key && sort.key === key ? (sort.dir === 1 ? "↑" : "↓") : ""}</span>
            </span>
          ))}
          <span />
        </div>

        {rows.map((r) => (
          <Row
            key={r.id}
            r={r}
            saved={savedSet.has(r.id)}
            selected={selectedId === r.id}
            onSelect={onSelect}
            onStar={onStar}
          />
        ))}

        {rows.length === 0 && loading && (
          <div className="table-empty">
            <div className="table-empty-sub">Loading today’s solicitations…</div>
          </div>
        )}

        {rows.length === 0 && !loading && (
          <div className="table-empty">
            <div className="table-empty-title">No solicitations match</div>
            <div className="table-empty-sub">Try a broader return-by window or remove a filter.</div>
            <button className="btn-outline btn-sm" style={{ marginTop: 6 }} onClick={onReset}>
              Reset filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
