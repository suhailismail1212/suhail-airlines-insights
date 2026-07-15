export type ZoneCategory = "landside" | "transition" | "airside";

export interface ZoneDef {
  key: string;
  name: string;
  category: ZoneCategory;
  /** Typical minutes a visitor spends here per pass-through. */
  durationRange: [number, number];
  /** Baseline happiness score (1-10) before per-visit noise. */
  baseHappiness: number;
}

export const ZONES: ZoneDef[] = [
  { key: "checkin", name: "Check-in Hall", category: "landside", durationRange: [8, 20], baseHappiness: 6.4 },
  { key: "security", name: "Security Screening", category: "transition", durationRange: [6, 15], baseHappiness: 5.6 },
  { key: "immigration", name: "Immigration", category: "transition", durationRange: [4, 12], baseHappiness: 5.9 },
  { key: "duty_free", name: "Duty Free", category: "airside", durationRange: [10, 30], baseHappiness: 7.3 },
  { key: "food_court", name: "Food Court", category: "airside", durationRange: [12, 30], baseHappiness: 7.1 },
  { key: "vip_lounge", name: "VIP Lounge", category: "airside", durationRange: [15, 35], baseHappiness: 8.4 },
  { key: "departure_lounge", name: "Departure Lounge", category: "airside", durationRange: [15, 40], baseHappiness: 6.8 },
  { key: "gate_area", name: "Gate Area", category: "airside", durationRange: [8, 20], baseHappiness: 6.2 },
  { key: "baggage_claim", name: "Baggage Claim", category: "landside", durationRange: [10, 25], baseHappiness: 5.4 },
  { key: "arrivals_hall", name: "Arrivals Hall", category: "landside", durationRange: [5, 15], baseHappiness: 7.0 },
];

/**
 * Two plausible passenger flows through the terminal. Each step is either a
 * fixed zone key or a list of alternatives the generator branches between.
 */
export const JOURNEY_FLOWS: { name: string; weight: number; steps: (string | string[])[] }[] = [
  {
    name: "departure",
    weight: 0.62,
    steps: [
      "checkin",
      "security",
      "immigration",
      ["duty_free", "food_court", "vip_lounge"],
      "departure_lounge",
      "gate_area",
    ],
  },
  {
    name: "arrival",
    weight: 0.38,
    steps: ["immigration", "baggage_claim", "arrivals_hall"],
  },
];

export function zoneByKey(key: string): ZoneDef {
  const zone = ZONES.find((z) => z.key === key);
  if (!zone) throw new Error(`Unknown zone key: ${key}`);
  return zone;
}
