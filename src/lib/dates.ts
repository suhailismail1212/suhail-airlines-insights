import { format, parseISO, subDays } from "date-fns";
import { getDb } from "./db";
import { type DateRange, getPreviousPeriod, addDaysStr, formatDisplayDate, dayOfWeekName } from "./dateUtils";

export type { DateRange };
export { getPreviousPeriod, addDaysStr, formatDisplayDate, dayOfWeekName };

let cachedMaxDate: string | null = null;

/** The dataset's own "today" — the latest date present, so the app stays
 * sensible regardless of how long ago the mock data was generated. */
export function getDatasetMaxDate(): string {
  if (cachedMaxDate) return cachedMaxDate;
  const row = getDb().prepare("SELECT MAX(date) as maxDate FROM visits").get() as { maxDate: string };
  cachedMaxDate = row.maxDate;
  return cachedMaxDate;
}

export function getDatasetMinDate(): string {
  const row = getDb().prepare("SELECT MIN(date) as minDate FROM visits").get() as { minDate: string };
  return row.minDate;
}

export function getDefaultDateRange(): DateRange {
  const end = getDatasetMaxDate();
  const start = format(subDays(parseISO(end), 29), "yyyy-MM-dd");
  return { start, end };
}
