export const FSC_NAMES = {
  1560: "Airframe structures",
  1620: "Landing gear",
  1680: "Aircraft accessories",
  2530: "Brake & steering",
  2840: "Gas turbine parts",
  2915: "Engine fuel systems",
  3110: "Bearings",
  4320: "Pumps",
  4710: "Pipe & tube",
  4720: "Hose & tubing",
  4730: "Hose & pipe fittings",
  4810: "Powered valves",
  4820: "Valves",
  5305: "Screws",
  5306: "Bolts",
  5307: "Studs",
  5310: "Nuts & washers",
  5315: "Nails, keys & pins",
  5320: "Rivets",
  5325: "Fastening devices",
  5330: "Packing & gaskets",
  5331: "O-rings",
  5340: "Hardware",
  5360: "Springs",
  5365: "Bushings & rings",
  5905: "Resistors",
  5910: "Capacitors",
  5925: "Circuit breakers",
  5930: "Switches",
  5935: "Connectors",
  5961: "Semiconductors",
  5975: "Electrical hardware",
  5999: "Electronic components",
  6105: "Motors",
  6150: "Wire & cable",
  6685: "Pressure gauges",
};

export const fscName = (code) => FSC_NAMES[code] ?? "";

const BUYING_ACTIVITIES = [
  ["SPE7", "Land & Maritime", "DLA Land and Maritime, Columbus OH"],
  ["SPE4", "Aviation", "DLA Aviation, Richmond VA"],
  ["SPE1", "Troop Support", "DLA Troop Support, Philadelphia PA"],
  ["SPE2", "Troop Support", "DLA Troop Support, Philadelphia PA"],
  ["SPE3", "Troop Support", "DLA Troop Support, Philadelphia PA"],
  ["SPE8", "Troop Support", "DLA Troop Support, Philadelphia PA"],
];

export function buyingActivity(solicitation) {
  const hit = BUYING_ACTIVITIES.find(([prefix]) => solicitation.startsWith(prefix));
  if (hit) return { short: hit[1], long: hit[2] };
  const code = solicitation.slice(0, 6) || "Other";
  return { short: code, long: code };
}
