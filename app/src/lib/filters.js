export const QTY_BUCKETS = [
  ["any", "Any", 0, Infinity],
  ["s", "1–10", 1, 10],
  ["m", "11–100", 11, 100],
  ["l", "101–1K", 101, 1000],
  ["xl", "1K+", 1001, Infinity],
];

export const DUE_WINDOWS = [["any", "Any"], [7, "7d"], [14, "14d"], [30, "30d"]];

export const DEFAULT_FILTERS = {
  q: "",
  setAsides: [],
  offices: [],
  fscs: [],
  qty: "any",
  due: "any",
  docsOnly: false,
  showClosed: false,
};

export const isOpen = (r) => r.left == null || r.left >= 0;

export function applyFilters(rows, f) {
  const q = f.q.trim().toLowerCase().replace(/-/g, "");
  const [, , qMin, qMax] = QTY_BUCKETS.find((b) => b[0] === f.qty);
  return rows.filter((r) => {
    if (!f.showClosed && !isOpen(r)) return false;
    if (q && !r.haystack.includes(q)) return false;
    if (f.setAsides.length && !f.setAsides.includes(r.setAside)) return false;
    if (f.offices.length && !f.offices.includes(r.office)) return false;
    if (f.fscs.length && !f.fscs.includes(r.fsc)) return false;
    if (f.qty !== "any" && (r.qty == null || r.qty < qMin || r.qty > qMax)) return false;
    if (f.due !== "any" && (r.left == null || r.left > f.due)) return false;
    if (f.docsOnly && !r.docs) return false;
    return true;
  });
}

export const VIEWS = [
  { id: "all", label: "All open", test: () => true },
  { id: "new", label: "New today", test: (r) => r.ago === 0 },
  { id: "closing", label: "Closing ≤ 3 days", test: (r) => r.left != null && r.left >= 0 && r.left <= 3 },
  { id: "saved", label: "Saved", test: (r, saved) => saved.has(r.id) },
];

const SORT_KEYS = {
  due: (r) => r.due?.getTime() ?? Infinity,
  issued: (r) => r.issued?.getTime() ?? -Infinity,
  qty: (r) => r.qty ?? 0,
  sol: (r) => r.sol,
  nom: (r) => r.nom,
};

export function sortRows(rows, { key, dir }) {
  const k = SORT_KEYS[key];
  return [...rows].sort((a, b) => {
    const x = k(a);
    const y = k(b);
    return (x > y ? 1 : x < y ? -1 : 0) * dir;
  });
}

export function facetCounts(rows, key) {
  const counts = new Map();
  for (const r of rows) counts.set(r[key], (counts.get(r[key]) ?? 0) + 1);
  return [...counts.entries()].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count);
}
