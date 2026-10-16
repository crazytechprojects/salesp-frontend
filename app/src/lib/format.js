const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const fmt = (d) => (d ? `${MON[d.getMonth()]} ${d.getDate()}` : "—");
export const fmtLong = (d) => (d ? `${fmt(d)}, ${d.getFullYear()}` : "—");

export function dueStyle(left) {
  if (left == null) return { bg: "#F1F0EC", fg: "#4A4E57", label: "—", head: "No return date listed" };
  if (left < 0) return { bg: "#EFEEE9", fg: "#8B909A", label: "Closed", head: "Closed" };
  if (left <= 3) {
    return {
      bg: "oklch(0.95 0.04 35)",
      fg: "oklch(0.48 0.15 35)",
      label: left === 0 ? "Today" : `${left}d`,
      head: left === 0 ? "Closes today" : `Closes in ${left} ${left === 1 ? "day" : "days"}`,
    };
  }
  if (left <= 7) return { bg: "oklch(0.96 0.05 85)", fg: "oklch(0.46 0.1 70)", label: `${left}d`, head: `Closes in ${left} days` };
  return { bg: "#F1F0EC", fg: "#4A4E57", label: `${left}d`, head: `Closes in ${left} days` };
}

const SET_ASIDE_COLORS = {
  Unrestricted: ["#F1F0EC", "#4A4E57"],
  "Small Business": ["oklch(0.95 0.03 250)", "oklch(0.42 0.1 250)"],
  SDVOSB: ["oklch(0.95 0.03 300)", "oklch(0.42 0.1 300)"],
  HUBZone: ["oklch(0.95 0.03 165)", "oklch(0.4 0.09 165)"],
  "8(a)": ["oklch(0.95 0.035 60)", "oklch(0.44 0.1 60)"],
  WOSB: ["oklch(0.95 0.03 350)", "oklch(0.44 0.1 350)"],
};

export const setAsideColors = (setAside) => SET_ASIDE_COLORS[setAside] ?? SET_ASIDE_COLORS.Unrestricted;
