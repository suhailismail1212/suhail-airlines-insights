import { getDb } from "./db";
import { addDaysStr, type DateRange, getPreviousPeriod } from "./dates";

const db = () => getDb();

export interface KpiSummary {
  totalVisits: number;
  uniqueVisitors: number;
  avgHappiness: number;
  peakHour: number | null;
}

export function getKpiSummary(range: DateRange): KpiSummary {
  const totals = db()
    .prepare(
      `SELECT COUNT(*) as totalVisits, COUNT(DISTINCT visitor_id) as uniqueVisitors, AVG(happiness_score) as avgHappiness
       FROM visits WHERE date BETWEEN ? AND ?`
    )
    .get(range.start, range.end) as { totalVisits: number; uniqueVisitors: number; avgHappiness: number | null };

  const peak = db()
    .prepare(
      `SELECT CAST(strftime('%H', start_time) AS INTEGER) as hour, COUNT(*) as c
       FROM visits WHERE date BETWEEN ? AND ? GROUP BY hour ORDER BY c DESC LIMIT 1`
    )
    .get(range.start, range.end) as { hour: number } | undefined;

  return {
    totalVisits: totals.totalVisits,
    uniqueVisitors: totals.uniqueVisitors,
    avgHappiness: totals.avgHappiness ?? 0,
    peakHour: peak?.hour ?? null,
  };
}

export interface KpiComparison {
  current: KpiSummary;
  previous: KpiSummary;
  deltaPct: { totalVisits: number | null; uniqueVisitors: number | null; avgHappiness: number | null };
}

function pctDelta(curr: number, prev: number): number | null {
  if (!prev) return null;
  return ((curr - prev) / prev) * 100;
}

export function getKpiComparison(range: DateRange): KpiComparison {
  const current = getKpiSummary(range);
  const previous = getKpiSummary(getPreviousPeriod(range));
  return {
    current,
    previous,
    deltaPct: {
      totalVisits: pctDelta(current.totalVisits, previous.totalVisits),
      uniqueVisitors: pctDelta(current.uniqueVisitors, previous.uniqueVisitors),
      avgHappiness: pctDelta(current.avgHappiness, previous.avgHappiness),
    },
  };
}

export interface ZoneBreakdownRow {
  id: number;
  name: string;
  category: string;
  visits: number;
  percent: number;
}

/** Visits attributed to each zone's *primary* zone (where most time was spent
 * on that visit) — this is what "total visits" sums to exactly, unlike raw
 * zone footfall which double-counts pass-through zones. */
export function getZoneBreakdown(range: DateRange): ZoneBreakdownRow[] {
  const rows = db()
    .prepare(
      `SELECT z.id, z.name, z.category, COUNT(*) as visits
       FROM visits v JOIN zones z ON z.id = v.primary_zone_id
       WHERE v.date BETWEEN ? AND ?
       GROUP BY z.id ORDER BY visits DESC`
    )
    .all(range.start, range.end) as { id: number; name: string; category: string; visits: number }[];

  const total = rows.reduce((s, r) => s + r.visits, 0) || 1;
  return rows.map((r) => ({ ...r, percent: (r.visits / total) * 100 }));
}

export interface ZoneFootfallRow {
  id: number;
  name: string;
  category: string;
  entries: number;
  avgHappiness: number;
  avgDurationMinutes: number;
}

/** Raw zone entries (footfall) — a visitor passing through 4 zones counts as
 * 4 entries. This is intentionally a different, larger number than the
 * visits-by-zone breakdown; it measures movement, not unique people. */
export function getZoneFootfall(range: DateRange): ZoneFootfallRow[] {
  return db()
    .prepare(
      `SELECT z.id, z.name, z.category, COUNT(*) as entries,
              AVG(zv.happiness_score) as avgHappiness, AVG(zv.duration_minutes) as avgDurationMinutes
       FROM zone_visits zv
       JOIN zones z ON z.id = zv.zone_id
       JOIN visits v ON v.id = zv.visit_id
       WHERE v.date BETWEEN ? AND ?
       GROUP BY z.id ORDER BY entries DESC`
    )
    .all(range.start, range.end) as ZoneFootfallRow[];
}

export interface HeatmapCell {
  zoneId: number;
  zoneName: string;
  hour: number;
  entries: number;
}

/** zone x hour-of-day grid, zero-filled, for the Zone Analytics heatmap. */
export function getZoneHourHeatmap(range: DateRange): HeatmapCell[] {
  const rows = db()
    .prepare(
      `SELECT z.id as zoneId, z.name as zoneName, CAST(strftime('%H', zv.enter_time) AS INTEGER) as hour, COUNT(*) as entries
       FROM zone_visits zv
       JOIN zones z ON z.id = zv.zone_id
       JOIN visits v ON v.id = zv.visit_id
       WHERE v.date BETWEEN ? AND ?
       GROUP BY z.id, hour`
    )
    .all(range.start, range.end) as HeatmapCell[];

  const byKey = new Map<string, number>();
  for (const r of rows) byKey.set(`${r.zoneId}-${r.hour}`, r.entries);

  const zones = db().prepare("SELECT id, name FROM zones ORDER BY id").all() as { id: number; name: string }[];
  const grid: HeatmapCell[] = [];
  for (const z of zones) {
    for (let hour = 0; hour < 24; hour++) {
      grid.push({ zoneId: z.id, zoneName: z.name, hour, entries: byKey.get(`${z.id}-${hour}`) ?? 0 });
    }
  }
  return grid;
}

export interface HappinessTrendPoint {
  date: string;
  visits: number;
  avgHappiness: number;
}

export function getHappinessTrend(range: DateRange): HappinessTrendPoint[] {
  return db()
    .prepare(
      `SELECT date, COUNT(*) as visits, AVG(happiness_score) as avgHappiness
       FROM visits WHERE date BETWEEN ? AND ? GROUP BY date ORDER BY date`
    )
    .all(range.start, range.end) as HappinessTrendPoint[];
}

export interface HappinessByZoneRow {
  id: number;
  name: string;
  avgHappiness: number;
  samples: number;
}

export function getHappinessByZone(range: DateRange): HappinessByZoneRow[] {
  return db()
    .prepare(
      `SELECT z.id, z.name, AVG(zv.happiness_score) as avgHappiness, COUNT(*) as samples
       FROM zone_visits zv
       JOIN zones z ON z.id = zv.zone_id
       JOIN visits v ON v.id = zv.visit_id
       WHERE v.date BETWEEN ? AND ?
       GROUP BY z.id ORDER BY avgHappiness DESC`
    )
    .all(range.start, range.end) as HappinessByZoneRow[];
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

export type TimeOfDay = "all" | "morning" | "afternoon" | "evening";

/** Morning/afternoon are contiguous; evening wraps past midnight to cover
 * red-eye departures that belong to the previous evening's rhythm. */
function timeOfDaySql(tod: TimeOfDay, column: string): string {
  switch (tod) {
    case "morning":
      return `AND CAST(strftime('%H', ${column}) AS INTEGER) BETWEEN 5 AND 11`;
    case "afternoon":
      return `AND CAST(strftime('%H', ${column}) AS INTEGER) BETWEEN 12 AND 17`;
    case "evening":
      return `AND (CAST(strftime('%H', ${column}) AS INTEGER) >= 18 OR CAST(strftime('%H', ${column}) AS INTEGER) <= 4)`;
    default:
      return "";
  }
}

/** Builds an Entry -> zones -> Exit flow graph from visit entry/exit zones
 * plus consecutive zone-to-zone transitions within each visit. */
export function getJourneyFlows(range: DateRange, tod: TimeOfDay = "all"): SankeyLink[] {
  const todFilter = timeOfDaySql(tod, "v.start_time");

  const entries = db()
    .prepare(
      `SELECT z.name as zoneName, COUNT(*) as count
       FROM visits v JOIN zones z ON z.id = v.entry_zone_id
       WHERE v.date BETWEEN ? AND ? ${todFilter} GROUP BY z.id`
    )
    .all(range.start, range.end) as { zoneName: string; count: number }[];

  const exits = db()
    .prepare(
      `SELECT z.name as zoneName, COUNT(*) as count
       FROM visits v JOIN zones z ON z.id = v.exit_zone_id
       WHERE v.date BETWEEN ? AND ? ${todFilter} GROUP BY z.id`
    )
    .all(range.start, range.end) as { zoneName: string; count: number }[];

  const transitions = db()
    .prepare(
      `SELECT zFrom.name as fromZone, zTo.name as toZone, COUNT(*) as count
       FROM zone_visits zv1
       JOIN zone_visits zv2 ON zv2.visit_id = zv1.visit_id AND zv2.sequence_index = zv1.sequence_index + 1
       JOIN zones zFrom ON zFrom.id = zv1.zone_id
       JOIN zones zTo ON zTo.id = zv2.zone_id
       JOIN visits v ON v.id = zv1.visit_id
       WHERE v.date BETWEEN ? AND ? ${todFilter}
       GROUP BY zFrom.id, zTo.id`
    )
    .all(range.start, range.end) as { fromZone: string; toZone: string; count: number }[];

  const links: SankeyLink[] = [];
  for (const e of entries) links.push({ source: "Entry", target: e.zoneName, value: e.count });
  for (const t of transitions) links.push({ source: t.fromZone, target: t.toZone, value: t.count });
  for (const x of exits) links.push({ source: x.zoneName, target: "Exit", value: x.count });
  return links;
}

export interface AtRiskVisitor {
  visitorId: string;
  visitCount: number;
  avgHappiness: number;
  minHappiness: number;
  maxDurationMinutes: number;
  lastVisitDate: string;
  firstSeen: string;
  lowHappinessFlag: boolean;
  longDurationFlag: boolean;
}

const LOW_HAPPINESS_THRESHOLD = 4.5;
const LONG_DURATION_THRESHOLD_MINUTES = 120;

/** As-of-END-DATE by design: only considers visits up to range.end, so the
 * list reflects the state of the world at the end of the selected period
 * rather than "today". */
export function getAtRiskVisitors(range: DateRange): AtRiskVisitor[] {
  const rows = db()
    .prepare(
      `SELECT v.visitor_id as visitorId, COUNT(*) as visitCount, AVG(v.happiness_score) as avgHappiness,
              MIN(v.happiness_score) as minHappiness, MAX(v.total_duration_minutes) as maxDurationMinutes,
              MAX(v.date) as lastVisitDate, vi.first_seen as firstSeen
       FROM visits v
       JOIN visitors vi ON vi.id = v.visitor_id
       WHERE v.date BETWEEN ? AND ?
       GROUP BY v.visitor_id
       HAVING avgHappiness <= ? OR maxDurationMinutes >= ?
       ORDER BY avgHappiness ASC`
    )
    .all(range.start, range.end, LOW_HAPPINESS_THRESHOLD, LONG_DURATION_THRESHOLD_MINUTES) as Omit<
    AtRiskVisitor,
    "lowHappinessFlag" | "longDurationFlag"
  >[];

  return rows.map((r) => ({
    ...r,
    lowHappinessFlag: r.avgHappiness <= LOW_HAPPINESS_THRESHOLD,
    longDurationFlag: r.maxDurationMinutes >= LONG_DURATION_THRESHOLD_MINUTES,
  }));
}

export interface Alert {
  zoneId: number;
  zoneName: string;
  metric: "happiness" | "traffic";
  direction: "drop" | "spike";
  deviationPct: number;
  latestValue: number;
  baselineValue: number;
  date: string;
}

const ANOMALY_THRESHOLD = 0.2;
const BASELINE_LOOKBACK_DAYS = 14;
const RECENT_WINDOW_DAYS = 7;

/** Flags a zone if any day in the last week deviates >20% from its own
 * trailing 14-day baseline (as of that day) — happiness drops only, traffic
 * either direction. Scans a window rather than just the single latest day,
 * since a plausible incident (a bad shift, a spike) rarely lands on exactly
 * "today"; keeps only the worst deviation per zone+metric. */
export function getAnomalyAlerts(range: DateRange): Alert[] {
  const zones = db().prepare("SELECT id, name FROM zones ORDER BY id").all() as { id: number; name: string }[];

  const happinessStmt = db().prepare(
    `SELECT AVG(zv.happiness_score) as avgHappiness
     FROM zone_visits zv JOIN visits v ON v.id = zv.visit_id
     WHERE zv.zone_id = ? AND v.date = ?`
  );
  const happinessBaselineStmt = db().prepare(
    `SELECT AVG(zv.happiness_score) as avgHappiness
     FROM zone_visits zv JOIN visits v ON v.id = zv.visit_id
     WHERE zv.zone_id = ? AND v.date BETWEEN ? AND ?`
  );
  const trafficStmt = db().prepare(
    `SELECT COUNT(*) as entries
     FROM zone_visits zv JOIN visits v ON v.id = zv.visit_id
     WHERE zv.zone_id = ? AND v.date = ?`
  );
  const trafficBaselineStmt = db().prepare(
    `SELECT COUNT(*) as entries, COUNT(DISTINCT v.date) as days
     FROM zone_visits zv JOIN visits v ON v.id = zv.visit_id
     WHERE zv.zone_id = ? AND v.date BETWEEN ? AND ?`
  );

  const bestByKey = new Map<string, Alert>();

  function considerAlert(key: string, candidate: Alert) {
    const existing = bestByKey.get(key);
    if (!existing || Math.abs(candidate.deviationPct) > Math.abs(existing.deviationPct)) {
      bestByKey.set(key, candidate);
    }
  }

  for (let i = 0; i < RECENT_WINDOW_DAYS; i++) {
    const checkDate = addDaysStr(range.end, -i);
    if (checkDate < range.start) break;

    const baselineStart = addDaysStr(checkDate, -BASELINE_LOOKBACK_DAYS);
    const baselineEnd = addDaysStr(checkDate, -1);

    for (const zone of zones) {
      const latestHappiness = (happinessStmt.get(zone.id, checkDate) as { avgHappiness: number | null })
        .avgHappiness;
      const baselineHappiness = (
        happinessBaselineStmt.get(zone.id, baselineStart, baselineEnd) as { avgHappiness: number | null }
      ).avgHappiness;

      if (latestHappiness != null && baselineHappiness) {
        const deviation = (latestHappiness - baselineHappiness) / baselineHappiness;
        if (deviation <= -ANOMALY_THRESHOLD) {
          considerAlert(`${zone.id}-happiness`, {
            zoneId: zone.id,
            zoneName: zone.name,
            metric: "happiness",
            direction: "drop",
            deviationPct: deviation * 100,
            latestValue: latestHappiness,
            baselineValue: baselineHappiness,
            date: checkDate,
          });
        }
      }

      const latestTraffic = (trafficStmt.get(zone.id, checkDate) as { entries: number }).entries;
      const baselineTraffic = trafficBaselineStmt.get(zone.id, baselineStart, baselineEnd) as {
        entries: number;
        days: number;
      };
      const baselinePerDay = baselineTraffic.days > 0 ? baselineTraffic.entries / baselineTraffic.days : 0;

      if (baselinePerDay > 0) {
        const deviation = (latestTraffic - baselinePerDay) / baselinePerDay;
        if (Math.abs(deviation) >= ANOMALY_THRESHOLD) {
          considerAlert(`${zone.id}-traffic`, {
            zoneId: zone.id,
            zoneName: zone.name,
            metric: "traffic",
            direction: deviation < 0 ? "drop" : "spike",
            deviationPct: deviation * 100,
            latestValue: latestTraffic,
            baselineValue: baselinePerDay,
            date: checkDate,
          });
        }
      }
    }
  }

  return Array.from(bestByKey.values()).sort((a, b) => Math.abs(b.deviationPct) - Math.abs(a.deviationPct));
}

export interface ForecastDay {
  date: string;
  dayLabel: string;
  predictedVisits: number;
  peakHour: number | null;
}

const FORECAST_LOOKBACK_DAYS = 28;

/** Trend-adjusted weekday averages, not a real ML model: for each of the
 * next few days, average historical footfall on that weekday over the last
 * 4 weeks, then scale by recent-vs-prior 2-week momentum. */
export function getForecast(fromDate: string, daysAhead = 5): ForecastDay[] {
  const lookbackStart = addDaysStr(fromDate, -(FORECAST_LOOKBACK_DAYS - 1));

  const dailyRows = db()
    .prepare(
      `SELECT date, CAST(strftime('%w', date) AS INTEGER) as dow, COUNT(*) as c
       FROM visits WHERE date BETWEEN ? AND ? GROUP BY date ORDER BY date`
    )
    .all(lookbackStart, fromDate) as { date: string; dow: number; c: number }[];

  const byDow = new Map<number, number[]>();
  for (const row of dailyRows) {
    if (!byDow.has(row.dow)) byDow.set(row.dow, []);
    byDow.get(row.dow)!.push(row.c);
  }
  const avgByDow = new Map<number, number>();
  for (const [dow, values] of byDow) {
    avgByDow.set(dow, values.reduce((s, v) => s + v, 0) / values.length);
  }
  const overallAvg = dailyRows.reduce((s, r) => s + r.c, 0) / (dailyRows.length || 1);

  const recent14 = dailyRows.slice(-14).reduce((s, r) => s + r.c, 0);
  const prior14 = dailyRows.slice(-28, -14).reduce((s, r) => s + r.c, 0);
  const trendMultiplier = prior14 > 0 ? Math.min(1.15, Math.max(0.85, recent14 / prior14)) : 1;

  const peakHourStmt = db().prepare(
    `SELECT CAST(strftime('%H', start_time) AS INTEGER) as hour, COUNT(*) as c
     FROM visits WHERE date BETWEEN ? AND ? AND CAST(strftime('%w', date) AS INTEGER) = ?
     GROUP BY hour ORDER BY c DESC LIMIT 1`
  );

  const days: ForecastDay[] = [];
  for (let i = 1; i <= daysAhead; i++) {
    const date = addDaysStr(fromDate, i);
    const dow = new Date(`${date}T00:00:00Z`).getUTCDay();
    const base = avgByDow.get(dow) ?? overallAvg;
    const predictedVisits = Math.round(base * trendMultiplier);
    const peak = peakHourStmt.get(lookbackStart, fromDate, dow) as { hour: number } | undefined;
    days.push({
      date,
      dayLabel: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dow],
      predictedVisits,
      peakHour: peak?.hour ?? null,
    });
  }
  return days;
}

export function listZones(): { id: number; name: string; category: string }[] {
  return db().prepare("SELECT id, name, category FROM zones ORDER BY id").all() as {
    id: number;
    name: string;
    category: string;
  }[];
}

export interface GenderBreakdownRow {
  gender: string;
  count: number;
  percent: number;
}

export function getGenderBreakdown(range: DateRange): GenderBreakdownRow[] {
  const rows = db()
    .prepare(
      `SELECT vi.gender as gender, COUNT(DISTINCT vi.id) as count
       FROM visitors vi JOIN visits v ON v.visitor_id = vi.id
       WHERE v.date BETWEEN ? AND ?
       GROUP BY vi.gender`
    )
    .all(range.start, range.end) as { gender: string; count: number }[];
  const total = rows.reduce((s, r) => s + r.count, 0) || 1;
  return rows.map((r) => ({ ...r, percent: (r.count / total) * 100 }));
}

const AGE_BAND_ORDER = ["10s", "20s", "30s", "40s", "50s", "60s", "70s", "80s"];

export interface AgeBreakdownRow {
  ageBand: string;
  count: number;
  percent: number;
}

export function getAgeBreakdown(range: DateRange): AgeBreakdownRow[] {
  const rows = db()
    .prepare(
      `SELECT vi.age_band as ageBand, COUNT(DISTINCT vi.id) as count
       FROM visitors vi JOIN visits v ON v.visitor_id = vi.id
       WHERE v.date BETWEEN ? AND ?
       GROUP BY vi.age_band`
    )
    .all(range.start, range.end) as { ageBand: string; count: number }[];
  const total = rows.reduce((s, r) => s + r.count, 0) || 1;
  const byBand = new Map(rows.map((r) => [r.ageBand, r.count]));
  return AGE_BAND_ORDER.filter((band) => byBand.has(band)).map((band) => ({
    ageBand: band,
    count: byBand.get(band)!,
    percent: (byBand.get(band)! / total) * 100,
  }));
}

export interface DayHourCell {
  dow: number;
  hour: number;
  visits: number;
  avgHappiness: number | null;
}

const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export { DOW_LABELS };

/** day-of-week x hour-of-day grid, zero-filled, for the weekly rhythm heatmaps. */
export function getDayHourHeatmap(range: DateRange): DayHourCell[] {
  const rows = db()
    .prepare(
      `SELECT CAST(strftime('%w', date) AS INTEGER) as dow, CAST(strftime('%H', start_time) AS INTEGER) as hour,
              COUNT(*) as visits, AVG(happiness_score) as avgHappiness
       FROM visits WHERE date BETWEEN ? AND ?
       GROUP BY dow, hour`
    )
    .all(range.start, range.end) as DayHourCell[];

  const byKey = new Map(rows.map((r) => [`${r.dow}-${r.hour}`, r]));
  const grid: DayHourCell[] = [];
  for (let dow = 0; dow < 7; dow++) {
    for (let hour = 0; hour < 24; hour++) {
      const found = byKey.get(`${dow}-${hour}`);
      grid.push(found ?? { dow, hour, visits: 0, avgHappiness: null });
    }
  }
  return grid;
}

export interface WaitTimePoint {
  hour: number;
  avgWaitMinutes: number;
}

/** Avg time spent in transition zones (security/immigration) by hour, as a wait-time proxy. */
export function getWaitTimeByHour(range: DateRange): WaitTimePoint[] {
  const rows = db()
    .prepare(
      `SELECT CAST(strftime('%H', zv.enter_time) AS INTEGER) as hour, AVG(zv.duration_minutes) as avgWaitMinutes
       FROM zone_visits zv
       JOIN zones z ON z.id = zv.zone_id
       JOIN visits v ON v.id = zv.visit_id
       WHERE v.date BETWEEN ? AND ? AND z.category = 'transition'
       GROUP BY hour ORDER BY hour`
    )
    .all(range.start, range.end) as WaitTimePoint[];
  const byHour = new Map(rows.map((r) => [r.hour, r.avgWaitMinutes]));
  return Array.from({ length: 24 }, (_, hour) => ({ hour, avgWaitMinutes: byHour.get(hour) ?? 0 }));
}

export interface JourneyStats {
  avgZonesPerJourney: number;
  avgTotalDwellMinutes: number;
  departureSharePct: number;
  longJourneySharePct: number;
}

const LONG_JOURNEY_THRESHOLD_MINUTES = 120;

export function getJourneyStats(range: DateRange, tod: TimeOfDay = "all"): JourneyStats {
  const todFilter = timeOfDaySql(tod, "start_time");
  const visitStats = db()
    .prepare(
      `SELECT COUNT(*) as totalVisits, AVG(total_duration_minutes) as avgDwell,
              SUM(CASE WHEN flow = 'departure' THEN 1 ELSE 0 END) as departureCount,
              SUM(CASE WHEN total_duration_minutes >= ? THEN 1 ELSE 0 END) as longCount
       FROM visits WHERE date BETWEEN ? AND ? ${todFilter}`
    )
    .get(LONG_JOURNEY_THRESHOLD_MINUTES, range.start, range.end) as {
    totalVisits: number;
    avgDwell: number | null;
    departureCount: number;
    longCount: number;
  };

  const zoneCountStats = db()
    .prepare(
      `SELECT AVG(cnt) as avgZones FROM (
         SELECT zv.visit_id, COUNT(*) as cnt FROM zone_visits zv
         JOIN visits v ON v.id = zv.visit_id
         WHERE v.date BETWEEN ? AND ? ${timeOfDaySql(tod, "v.start_time")} GROUP BY zv.visit_id
       )`
    )
    .get(range.start, range.end) as { avgZones: number | null };

  const total = visitStats.totalVisits || 1;
  return {
    avgZonesPerJourney: zoneCountStats.avgZones ?? 0,
    avgTotalDwellMinutes: visitStats.avgDwell ?? 0,
    departureSharePct: (visitStats.departureCount / total) * 100,
    longJourneySharePct: (visitStats.longCount / total) * 100,
  };
}

export interface ZoneTimeSeriesPoint {
  date: string;
  zoneName: string;
  entries: number;
}

export function getZoneTimeSeries(range: DateRange, includeWeekends: boolean): ZoneTimeSeriesPoint[] {
  const weekendFilter = includeWeekends ? "" : "AND CAST(strftime('%w', v.date) AS INTEGER) NOT IN (0, 6)";
  return db()
    .prepare(
      `SELECT v.date as date, z.name as zoneName, COUNT(*) as entries
       FROM zone_visits zv
       JOIN visits v ON v.id = zv.visit_id
       JOIN zones z ON z.id = zv.zone_id
       WHERE v.date BETWEEN ? AND ? ${weekendFilter}
       GROUP BY v.date, z.id ORDER BY v.date`
    )
    .all(range.start, range.end) as ZoneTimeSeriesPoint[];
}
