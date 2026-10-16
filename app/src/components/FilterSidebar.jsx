import { useState } from "react";
import { fscName } from "../lib/catalog";
import { DUE_WINDOWS, QTY_BUCKETS } from "../lib/filters";

function Checkbox({ on }) {
  return <div className={`checkbox${on ? " is-on" : ""}`}>{on ? "✓" : ""}</div>;
}

function Segmented({ options, value, onChange, className }) {
  return (
    <div className={className}>
      {options.map(([v, label]) => (
        <button key={v} className={`seg${value === v ? " is-on" : ""}`} onClick={() => onChange(v)}>
          {label}
        </button>
      ))}
    </div>
  );
}

function CheckList({ options, selected, onToggle }) {
  return options.map(({ value, count }) => (
    <div key={value} className="check-row" onClick={() => onToggle(value)}>
      <Checkbox on={selected.includes(value)} />
      <span className="check-label">{value}</span>
      <span className="count">{count}</span>
    </div>
  ));
}

function Toggle({ label, on, onChange }) {
  return (
    <div className="toggle-row" onClick={() => onChange(!on)}>
      <span>{label}</span>
      <div className={`switch${on ? " is-on" : ""}`}>
        <div className="switch-knob" />
      </div>
    </div>
  );
}

export default function FilterSidebar({ filters, facets, onChange, onToggle, onReset }) {
  const [fscQuery, setFscQuery] = useState("");
  const fq = fscQuery.trim().toLowerCase();
  const fscOptions = facets.fsc.filter(
    ({ value }) => !fq || value.includes(fq) || fscName(value).toLowerCase().includes(fq),
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <div className="sidebar-title">Filters</div>
        <button
          className="link-btn"
          onClick={() => {
            setFscQuery("");
            onReset();
          }}
        >
          Reset
        </button>
      </div>

      <div className="filter-group">
        <div className="filter-label">Return by</div>
        <Segmented
          className="seg-grid seg-grid-4"
          options={DUE_WINDOWS}
          value={filters.due}
          onChange={(due) => onChange({ due })}
        />
      </div>

      <div className="filter-group filter-group-tight">
        <div className="filter-label">Set-aside</div>
        <CheckList options={facets.setAside} selected={filters.setAsides} onToggle={(v) => onToggle("setAsides", v)} />
      </div>

      <div className="filter-group filter-group-tight">
        <div className="filter-label">Buying activity</div>
        <CheckList options={facets.office} selected={filters.offices} onToggle={(v) => onToggle("offices", v)} />
      </div>

      <div className="filter-group filter-group-tight">
        <div className="filter-label">Supply class (FSC)</div>
        <input
          className="input-sm"
          placeholder="Find class or code"
          value={fscQuery}
          onChange={(e) => setFscQuery(e.target.value)}
        />
        <div className="fsc-list">
          {fscOptions.map(({ value, count }) => (
            <div key={value} className="check-row" onClick={() => onToggle("fscs", value)}>
              <Checkbox on={filters.fscs.includes(value)} />
              <span className="fsc-code">{value}</span>
              <span className="check-label ellipsis">{fscName(value) || "Other"}</span>
              <span className="count">{count}</span>
            </div>
          ))}
          {fscOptions.length === 0 && <div className="filter-empty">No matching classes</div>}
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-label">Quantity</div>
        <Segmented
          className="seg-grid seg-grid-5"
          options={QTY_BUCKETS}
          value={filters.qty}
          onChange={(qty) => onChange({ qty })}
        />
      </div>

      <div className="filter-group">
        <Toggle label="Has tech documents" on={filters.docsOnly} onChange={(docsOnly) => onChange({ docsOnly })} />
        <Toggle label="Show closed" on={filters.showClosed} onChange={(showClosed) => onChange({ showClosed })} />
      </div>
    </aside>
  );
}
