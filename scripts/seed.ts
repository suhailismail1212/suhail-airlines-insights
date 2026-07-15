/**
 * Generates a multi-week mock analytics dataset into data/mock.db.
 * Deterministic (fixed RNG seed) so numbers stay stable across re-seeds.
 * Skips regeneration if the db already exists; set FORCE_SEED=1 to rebuild.
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { SCHEMA_SQL, DB_PATH } from "../src/lib/db";
import { ZONES, JOURNEY_FLOWS, zoneByKey } from "../src/lib/zones";
import { createRng, weightedPick, randInt, randFloat, clamp, type Rng } from "../src/lib/rng";

const WEEKS = 8;
const DAYS = WEEKS * 7;
const SEED = 42;

// Bimodal commuter-style curve: early morning and early evening peaks.
const HOUR_WEIGHTS = [1, 0.5, 0.4, 0.4, 1, 3, 6, 9, 8, 6, 5, 5, 5, 5, 5, 5, 6, 8, 9, 8, 6, 4, 2, 1.5];
const WEEKDAY_MULTIPLIER = [1.1, 1.0, 1.0, 1.0, 1.0, 1.15, 1.25]; // Sun..Sat

const BRANCH_BASE_WEIGHT: Record<string, number> = { duty_free: 3, food_court: 3, vip_lounge: 1.2 };

interface Anomaly {
  daysAgo: number;
  zoneKey: string;
  type: "happiness_drop" | "traffic_spike" | "traffic_drop";
}

// Planted deviations near the end of the range so the alerts panel always has
// something real to surface, on top of whatever organic variance shows up.
const ANOMALIES: Anomaly[] = [
  { daysAgo: 2, zoneKey: "security", type: "happiness_drop" },
  { daysAgo: 5, zoneKey: "duty_free", type: "traffic_spike" },
  { daysAgo: 1, zoneKey: "food_court", type: "traffic_drop" },
];

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function buildVisit(
  rng: Rng,
  dateStr: string,
  zoneIdByKey: Map<string, number>,
  visitorPool: string[],
  anomaly: Anomaly | undefined
) {
  const hour = weightedPick(rng, HOUR_WEIGHTS.map((w, h) => ({ value: h, weight: w })));
  const minute = randInt(rng, 0, 59);
  const startTime = new Date(`${dateStr}T00:00:00.000Z`);
  startTime.setUTCHours(hour, minute, 0, 0);

  const flowDef = weightedPick(rng, JOURNEY_FLOWS.map((f) => ({ value: f, weight: f.weight })));

  let visitorId: string;
  if (visitorPool.length === 0 || rng() < 0.55) {
    visitorId = randomUUID();
    visitorPool.push(visitorId);
  } else {
    visitorId = visitorPool[Math.floor(rng() * visitorPool.length)];
  }

  const isRoughVisit = rng() < 0.08;
  const isExtendedVisit = rng() < 0.1;
  const durationMultiplier = isExtendedVisit ? randFloat(rng, 1.6, 2.3) : 1;

  let cursor = new Date(startTime);
  const zoneVisits: {
    zone_id: number;
    sequence_index: number;
    enter_time: string;
    exit_time: string;
    duration_minutes: number;
    happiness_score: number;
  }[] = [];

  let seq = 0;
  for (const step of flowDef.steps) {
    let zoneKey: string;
    if (Array.isArray(step)) {
      const weights = step.map((k) => {
        let w = BRANCH_BASE_WEIGHT[k] ?? 1;
        if (anomaly?.zoneKey === k && anomaly.type === "traffic_spike") w *= 3.2;
        if (anomaly?.zoneKey === k && anomaly.type === "traffic_drop") w *= 0.12;
        return { value: k, weight: w };
      });
      zoneKey = weightedPick(rng, weights);
    } else {
      zoneKey = step;
    }

    const zoneDef = zoneByKey(zoneKey);
    const duration = Math.max(
      3,
      Math.round(randInt(rng, zoneDef.durationRange[0], zoneDef.durationRange[1]) * durationMultiplier)
    );
    const enter = new Date(cursor);
    const exit = new Date(cursor.getTime() + duration * 60000);

    let happiness = clamp(randFloat(rng, zoneDef.baseHappiness - 1.1, zoneDef.baseHappiness + 1.1), 1, 10);
    if (isRoughVisit) happiness = clamp(happiness - randFloat(rng, 1.5, 3.0), 1, 10);
    if (anomaly?.zoneKey === zoneKey && anomaly.type === "happiness_drop") {
      happiness = clamp(happiness - 2.6, 1, 10);
    }

    zoneVisits.push({
      zone_id: zoneIdByKey.get(zoneKey)!,
      sequence_index: seq++,
      enter_time: enter.toISOString(),
      exit_time: exit.toISOString(),
      duration_minutes: duration,
      happiness_score: round1(happiness),
    });
    cursor = exit;
  }

  const totalDuration = zoneVisits.reduce((s, zv) => s + zv.duration_minutes, 0);
  const avgHappiness = zoneVisits.reduce((s, zv) => s + zv.happiness_score, 0) / zoneVisits.length;
  const primary = zoneVisits.reduce((max, zv) => (zv.duration_minutes > max.duration_minutes ? zv : max));

  return {
    visit: {
      visitor_id: visitorId,
      date: dateStr,
      start_time: startTime.toISOString(),
      end_time: cursor.toISOString(),
      total_duration_minutes: totalDuration,
      flow: flowDef.name,
      entry_zone_id: zoneVisits[0].zone_id,
      exit_zone_id: zoneVisits[zoneVisits.length - 1].zone_id,
      primary_zone_id: primary.zone_id,
      happiness_score: round1(avgHappiness),
    },
    zoneVisits,
  };
}

function main() {
  const force = process.env.FORCE_SEED === "1";
  if (fs.existsSync(DB_PATH) && !force) {
    console.log(`Mock database already exists at ${DB_PATH} — skipping. Set FORCE_SEED=1 to regenerate.`);
    return;
  }

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  if (fs.existsSync(DB_PATH)) fs.rmSync(DB_PATH);

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(SCHEMA_SQL);

  const insertZoneStmt = db.prepare("INSERT INTO zones (key, name, category) VALUES (?, ?, ?)");
  const zoneIdByKey = new Map<string, number>();
  for (const z of ZONES) {
    const info = insertZoneStmt.run(z.key, z.name, z.category);
    zoneIdByKey.set(z.key, info.lastInsertRowid as number);
  }

  const rng = createRng(SEED);
  const visitorPool: string[] = [];
  const visitorFirstSeen = new Map<string, string>();

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const startDate = new Date(today);
  startDate.setUTCDate(startDate.getUTCDate() - (DAYS - 1));

  const allVisits: ReturnType<typeof buildVisit>["visit"][] = [];
  const allZoneVisitLists: ReturnType<typeof buildVisit>["zoneVisits"][] = [];

  for (let dayIdx = 0; dayIdx < DAYS; dayIdx++) {
    const date = new Date(startDate);
    date.setUTCDate(date.getUTCDate() + dayIdx);
    const dateStr = toDateStr(date);
    const dow = date.getUTCDay();
    const daysAgo = DAYS - 1 - dayIdx;
    const anomaly = ANOMALIES.find((a) => a.daysAgo === daysAgo);

    const dailyVisits = Math.round(randInt(rng, 230, 290) * WEEKDAY_MULTIPLIER[dow]);

    for (let i = 0; i < dailyVisits; i++) {
      const poolSizeBefore = visitorPool.length;
      const { visit, zoneVisits } = buildVisit(rng, dateStr, zoneIdByKey, visitorPool, anomaly);
      if (visitorPool.length > poolSizeBefore) {
        visitorFirstSeen.set(visitorPool[visitorPool.length - 1], dateStr);
      }
      allVisits.push(visit);
      allZoneVisitLists.push(zoneVisits);
    }
  }

  const insertVisitor = db.prepare("INSERT OR IGNORE INTO visitors (id, first_seen) VALUES (?, ?)");
  const insertVisit = db.prepare(`
    INSERT INTO visits (visitor_id, date, start_time, end_time, total_duration_minutes, flow, entry_zone_id, exit_zone_id, primary_zone_id, happiness_score)
    VALUES (@visitor_id, @date, @start_time, @end_time, @total_duration_minutes, @flow, @entry_zone_id, @exit_zone_id, @primary_zone_id, @happiness_score)
  `);
  const insertZoneVisit = db.prepare(`
    INSERT INTO zone_visits (visit_id, zone_id, sequence_index, enter_time, exit_time, duration_minutes, happiness_score)
    VALUES (@visit_id, @zone_id, @sequence_index, @enter_time, @exit_time, @duration_minutes, @happiness_score)
  `);

  const insertAll = db.transaction(() => {
    for (const [id, firstSeen] of visitorFirstSeen) insertVisitor.run(id, firstSeen);
    for (let i = 0; i < allVisits.length; i++) {
      const info = insertVisit.run(allVisits[i]);
      const visitId = info.lastInsertRowid as number;
      for (const zv of allZoneVisitLists[i]) {
        insertZoneVisit.run({ ...zv, visit_id: visitId });
      }
    }
  });
  insertAll();

  db.close();

  console.log(`Seeded ${allVisits.length} visits across ${DAYS} days for ${visitorFirstSeen.size} unique visitors.`);
  console.log(`Database written to ${DB_PATH}`);
}

main();
