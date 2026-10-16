import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import useSolicitations from "../hooks/useSolicitations";
import useToast from "../hooks/useToast";
import { applyFilters, DEFAULT_FILTERS, facetCounts, isOpen, QTY_BUCKETS, sortRows, VIEWS } from "../lib/filters";
import { fmtLong } from "../lib/format";
import DetailDrawer from "./DetailDrawer";
import FilterSidebar from "./FilterSidebar";
import Header from "./Header";
import ResultsTable from "./ResultsTable";

const PER_PAGE = 25;

function exportCsv(rows) {
  const head = ["Solicitation", "NSN", "Nomenclature", "FSC", "Qty", "UI", "Set-aside", "Buying activity", "Issued", "Return by", "URL"];
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const body = rows.map((r) =>
    [r.sol, r.nsn, r.nom, r.fsc, r.qty, r.ui, r.setAside, r.office, fmtLong(r.issued), fmtLong(r.due), r.url]
      .map(esc)
      .join(","),
  );
  const blob = new Blob([[head.join(","), ...body].join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "dibbs-rfqs.csv";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 0);
}

export default function Browser({ session, onSignOut, onExpired }) {
  const { rows, status, source, syncedAt, error, reload } = useSolicitations(session.token, onExpired);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [view, setView] = useState("all");
  const [sort, setSort] = useState({ key: "due", dir: 1 });
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [saved, setSaved] = useLocalStorage(`bidline.saved.${session.email}`, []);
  const [toast, showToast] = useToast();
  const searchRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target.tagName || "").toLowerCase();
      if (e.key === "/" && tag !== "input" && tag !== "textarea") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const updateFilters = (patch) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(0);
  };
  const toggleIn = (key, value) => {
    setFilters((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((x) => x !== value) : [...f[key], value],
    }));
    setPage(0);
  };
  const resetFilters = () => updateFilters(DEFAULT_FILTERS);

  const savedSet = useMemo(() => new Set(saved), [saved]);
  const base = useMemo(() => applyFilters(rows, filters), [rows, filters]);
  const activeView = VIEWS.find((v) => v.id === view);
  const list = useMemo(
    () => sortRows(base.filter((r) => activeView.test(r, savedSet)), sort),
    [base, activeView, savedSet, sort],
  );
  const facets = useMemo(() => {
    const open = filters.showClosed ? rows : rows.filter(isOpen);
    return {
      setAside: facetCounts(open, "setAside"),
      office: facetCounts(open, "office"),
      fsc: facetCounts(open, "fsc"),
    };
  }, [rows, filters.showClosed]);

  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const currentPage = Math.min(page, pages - 1);
  const pageRows = list.slice(currentPage * PER_PAGE, (currentPage + 1) * PER_PAGE);
  const selected = rows.find((r) => r.id === selectedId);

  const toggleSave = useCallback(
    (id) => {
      const on = savedSet.has(id);
      setSaved((s) => (on ? s.filter((x) => x !== id) : [...s, id]));
      showToast(on ? "Removed from saved" : "Saved");
    },
    [savedSet, setSaved, showToast],
  );

  const onSort = (key) => {
    setSort((s) => (s.key === key ? { key, dir: -s.dir } : { key, dir: key === "issued" ? -1 : 1 }));
    setPage(0);
  };

  const refresh = async () => {
    const result = await reload();
    if (result) showToast(result.source === "sample" ? "DIBBS feed unavailable — showing sample data" : "Up to date with DIBBS");
  };

  const copyNsn = (nsn) => {
    navigator.clipboard?.writeText(nsn).catch(() => {});
    showToast(`Copied ${nsn}`);
  };

  const chips = [];
  if (filters.q) chips.push([`“${filters.q}”`, () => updateFilters({ q: "" })]);
  if (filters.due !== "any") chips.push([`Return by ≤ ${filters.due} days`, () => updateFilters({ due: "any" })]);
  filters.setAsides.forEach((v) => chips.push([v, () => toggleIn("setAsides", v)]));
  filters.offices.forEach((v) => chips.push([v, () => toggleIn("offices", v)]));
  filters.fscs.forEach((v) => chips.push([`FSC ${v}`, () => toggleIn("fscs", v)]));
  if (filters.qty !== "any") {
    chips.push([`Qty ${QTY_BUCKETS.find((b) => b[0] === filters.qty)[1]}`, () => updateFilters({ qty: "any" })]);
  }
  if (filters.docsOnly) chips.push(["Has tech docs", () => updateFilters({ docsOnly: false })]);
  if (filters.showClosed) chips.push(["Including closed", () => updateFilters({ showClosed: false })]);

  return (
    <div className="app">
      <Header
        user={session.email}
        sync={{ status, source, syncedAt, error, count: rows.length }}
        onRefresh={refresh}
        onSignOut={onSignOut}
      />

      <div className="app-body">
        <FilterSidebar
          filters={filters}
          facets={facets}
          onChange={updateFilters}
          onToggle={toggleIn}
          onReset={resetFilters}
        />

        <main className="main">
          <div className="toolbar">
            <div className="toolbar-row">
              <div className="search">
                <input
                  ref={searchRef}
                  className="input-search"
                  value={filters.q}
                  onChange={(e) => updateFilters({ q: e.target.value })}
                  placeholder="Search solicitation #, NSN, nomenclature, PR #"
                />
                <span className="kbd">/</span>
              </div>
              <button
                className="btn-outline btn-md"
                onClick={() => {
                  exportCsv(list);
                  showToast(`Exported ${list.length} rows`);
                }}
              >
                Export CSV
              </button>
            </div>
            <div className="tabs">
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  className={`tab${view === v.id ? " is-active" : ""}`}
                  onClick={() => {
                    setView(v.id);
                    setPage(0);
                  }}
                >
                  <span>{v.id === "all" && filters.showClosed ? "All" : v.label}</span>
                  <span className="tab-count">{base.filter((r) => v.test(r, savedSet)).length}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="results-bar">
            <span className="results-count">
              {list.length.toLocaleString()} {list.length === 1 ? "solicitation" : "solicitations"}
            </span>
            {chips.map(([label, onRemove]) => (
              <button key={label} className="chip" onClick={onRemove}>
                <span>{label}</span>
                <span className="chip-x">×</span>
              </button>
            ))}
          </div>

          <div className="results">
            <ResultsTable
              rows={pageRows}
              loading={status === "loading" && rows.length === 0}
              sort={sort}
              onSort={onSort}
              savedSet={savedSet}
              selectedId={selectedId}
              onSelect={(id) => setSelectedId((cur) => (cur === id ? null : id))}
              onStar={toggleSave}
              onReset={resetFilters}
            />

            <div className="pager">
              <span>
                {list.length
                  ? `Showing ${currentPage * PER_PAGE + 1}–${Math.min(list.length, (currentPage + 1) * PER_PAGE)} of ${list.length.toLocaleString()}`
                  : ""}
              </span>
              <div className="pager-controls">
                <button className="btn-outline btn-xs" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>
                  Previous
                </button>
                <span className="pager-label">
                  {currentPage + 1} / {pages}
                </span>
                <button
                  className="btn-outline btn-xs"
                  disabled={currentPage >= pages - 1}
                  onClick={() => setPage(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {selected && (
        <DetailDrawer
          r={selected}
          saved={savedSet.has(selected.id)}
          onClose={() => setSelectedId(null)}
          onStar={toggleSave}
          onCopyNsn={copyNsn}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
