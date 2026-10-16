import { buyingActivity, fscName } from "./catalog";

const DAY = 864e5;

export const startOfToday = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

function toDate(value) {
  if (!value) return null;
  let m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (m) return new Date(+m[1], m[2] - 1, +m[3]);
  m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value);
  if (m) return new Date(+m[3], m[1] - 1, +m[2]);
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatSolicitation(raw) {
  const s = raw.trim().toUpperCase();
  if (s.includes("-") || s.length !== 13) return s;
  return `${s.slice(0, 6)}-${s.slice(6, 8)}-${s.slice(8, 9)}-${s.slice(9)}`;
}

const daysFrom = (today, d) => (d ? Math.round((d - today) / DAY) : null);

export const dibbsUrl = (solRaw) => `https://www.dibbs.bsm.dla.mil/rfq/rfqrec.aspx?sn=${solRaw}`;

export function normalizeSolicitation(raw, today = startOfToday()) {
  const sol = formatSolicitation(raw.solicitation_number ?? "");
  const solRaw = sol.replace(/-/g, "");
  const nsn = raw.nsn ?? "";
  const fsc = raw.fsc ?? nsn.replace(/-/g, "").slice(0, 4);
  const fscLabel = raw.fsc_name ?? fscName(fsc);
  const office = buyingActivity(solRaw);
  const issued = toDate(raw.issue_date);
  const due = toDate(raw.return_by);
  const nom = raw.nomenclature ?? "";
  const pr = raw.pr_number ?? "";
  const qty = raw.quantity == null ? null : Number(raw.quantity);

  return {
    id: `${solRaw}:${nsn}`,
    sol,
    solRaw,
    nsn,
    nom,
    fsc,
    fscName: fscLabel,
    fscLine: fscLabel ? `${fsc} · ${fscLabel}` : fsc,
    office: raw.buying_office ?? office.short,
    officeLong: raw.buying_office_long ?? office.long,
    qty,
    ui: raw.unit_of_issue ?? "",
    setAside: raw.set_aside || "Unrestricted",
    issued,
    due,
    ago: issued ? -daysFrom(today, issued) : null,
    left: daysFrom(today, due),
    pr,
    docs: raw.has_tech_docs ?? null,
    amsc: raw.amsc ?? null,
    fob: raw.fob ?? null,
    insp: raw.inspection ?? null,
    delivery: raw.delivery_days ?? null,
    url: raw.url ?? dibbsUrl(solRaw),
    haystack: [sol, nsn, nom, pr, fscLabel].join(" ").toLowerCase().replace(/-/g, ""),
  };
}

export function normalizeAll(items) {
  const today = startOfToday();
  const seen = new Set();
  return items
    .map((raw) => normalizeSolicitation(raw, today))
    .filter((r) => r.solRaw && !seen.has(r.id) && seen.add(r.id));
}
