import { dueStyle, fmtLong } from "../lib/format";

export default function DetailDrawer({ r, saved, onClose, onStar, onCopyNsn }) {
  const due = dueStyle(r.left);
  const fields = [
    ["NSN", r.nsn, true],
    ["Supply class", r.fscLine],
    ["Quantity", r.qty != null ? `${r.qty.toLocaleString()} ${r.ui}`.trim() : null, true],
    ["Set-aside", r.setAside],
    ["Buying activity", r.officeLong],
    ["Issued", fmtLong(r.issued)],
    ["Return by", fmtLong(r.due)],
    ["Purchase request", r.pr, true],
    ["Tech documents", r.docs == null ? null : r.docs ? "Available on DIBBS" : "None listed"],
    ["AMSC", r.amsc, true],
    ["FOB", r.fob],
    ["Inspection", r.insp],
    ["Required delivery", r.delivery ? `${r.delivery} days ARO` : null],
  ].filter(([, v]) => v != null && v !== "");

  return (
    <div className="drawer">
      <div className="drawer-head">
        <div className="drawer-title-row">
          <div className="drawer-title">
            <span className="mono-13 muted">{r.sol}</span>
            <span className="drawer-nom">{r.nom || r.nsn}</span>
          </div>
          <button className="icon-btn" title="Close (Esc)" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="drawer-due" style={{ background: due.bg, color: due.fg }}>
          <span className="strong-600">{due.head}</span>
          {r.due && <span>· Return by {fmtLong(r.due)}</span>}
        </div>
        <div className="drawer-actions">
          <a className="btn-primary btn-link" href={r.url} target="_blank" rel="noopener noreferrer">
            Open on DIBBS ↗
          </a>
          <button className="btn-outline" onClick={() => onStar(r.id)}>
            {saved ? "★ Saved" : "☆ Save"}
          </button>
          <button className="btn-outline" onClick={() => onCopyNsn(r.nsn)}>
            Copy NSN
          </button>
        </div>
      </div>
      <div className="drawer-body">
        {fields.map(([k, v, mono]) => (
          <div key={k} className="kv">
            <span className="muted">{k}</span>
            <span className={mono ? "kv-value mono-13" : "kv-value"}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
