import { startOfToday } from "./solicitations";

const DAY = 864e5;

const FSC_ITEMS = [
  ["5305", ["SCREW,CAP,HEXAGON HEAD", "SCREW,MACHINE", "SCREW,SHOULDER"]],
  ["5306", ["BOLT,MACHINE", "BOLT,INTERNALLY RELIEVED", "BOLT,CLOSE TOLERANCE"]],
  ["5310", ["NUT,SELF-LOCKING,HEXAGON", "WASHER,FLAT", "NUT,PLAIN,CASTELLATED"]],
  ["5330", ["GASKET", "PACKING,PREFORMED", "SEAL,NONMETALLIC"]],
  ["5961", ["TRANSISTOR", "SEMICONDUCTOR DEVICE,DIODE"]],
  ["5999", ["CONTACT,ELECTRICAL", "TERMINAL,LUG"]],
  ["4730", ["ADAPTER,STRAIGHT,TUBE TO HOSE", "ELBOW,TUBE", "COUPLING,QUICK DISCONNECT"]],
  ["2840", ["BLADE,TURBINE", "SHROUD,COMPRESSOR", "SEAL,AIR,AIRCRAFT ENGINE"]],
  ["3110", ["BEARING,BALL,ANNULAR", "BEARING,ROLLER,NEEDLE"]],
  ["4820", ["VALVE,CHECK", "VALVE,GATE", "VALVE,RELIEF"]],
  ["6150", ["CABLE ASSEMBLY,SPECIAL PURPOSE", "LEAD,ELECTRICAL"]],
  ["1560", ["BRACKET,DOUBLE ANGLE", "FAIRING,AIRCRAFT", "PANEL,STRUCTURAL"]],
  ["2530", ["SHOE,BRAKE", "ARM,STEERING"]],
  ["6685", ["GAGE,PRESSURE,DIAL INDICATING", "TRANSMITTER,PRESSURE"]],
  ["5340", ["CLAMP,LOOP", "BRACKET,MOUNTING", "HINGE,BUTT"]],
];
const SET_ASIDES = [["Unrestricted", 38], ["Small Business", 34], ["SDVOSB", 8], ["HUBZone", 8], ["8(a)", 6], ["WOSB", 6]];
const OFFICE_CODES = ["SPE7M1", "SPE4A7", "SPE1C1"];
const UNITS = ["EA", "EA", "EA", "PG", "BX", "FT", "SE", "KT"];

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function sampleSolicitations(count = 240) {
  const today = startOfToday();
  const yy = String(today.getFullYear()).slice(2);
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const pick = (a) => a[Math.floor(rand() * a.length)];
  const weighted = (a) => {
    let t = a.reduce((sum, [, w]) => sum + w, 0) * rand();
    for (const [v, w] of a) if ((t -= w) <= 0) return v;
    return a[0][0];
  };
  const digits = (len) => Array.from({ length: len }, () => Math.floor(rand() * 10)).join("");

  return Array.from({ length: count }, () => {
    const [fsc, items] = pick(FSC_ITEMS);
    const ago = Math.floor(Math.pow(rand(), 1.6) * 10);
    const issued = new Date(today - ago * DAY);
    const due = new Date(issued.getTime() + (5 + Math.floor(rand() * 30)) * DAY);
    const kind = rand() < 0.85 ? "T" : "Q";
    const bucket = rand();
    const quantity =
      bucket < 0.35 ? 1 + Math.floor(rand() * 10)
      : bucket < 0.7 ? 11 + Math.floor(rand() * 90)
      : bucket < 0.92 ? 101 + Math.floor(rand() * 900)
      : 1001 + Math.floor(rand() * 9000);

    return {
      solicitation_number: `${pick(OFFICE_CODES)}-${yy}-${kind}-${digits(4)}`,
      nsn: `${fsc}-${pick(["00", "01", "01", "01", "12", "21"])}-${digits(3)}-${digits(4)}`,
      nomenclature: pick(items),
      quantity,
      unit_of_issue: pick(UNITS),
      set_aside: weighted(SET_ASIDES),
      issue_date: iso(issued),
      return_by: iso(due),
      pr_number: `7${digits(9)}`,
      has_tech_docs: rand() < 0.62,
      amsc: pick(["B", "C", "G", "P", "D"]),
      fob: rand() < 0.6 ? "Destination" : "Origin",
      inspection: rand() < 0.55 ? "Origin" : "Destination",
      delivery_days: pick([60, 90, 120, 150, 180, 240]),
    };
  });
}
