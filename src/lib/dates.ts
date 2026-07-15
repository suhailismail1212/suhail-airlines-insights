import { addDays, differenceInCalendarDays, format, parseISO, subDays } from "date-fns";
import { getDb } from "./db";

export type DateRange = { start: string; end: string };

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

export function getPreviousPeriod(range: DateRange): DateRange {
  const lengthDays = differenceInCalendarDays(parseISO(range.end), parseISO(range.start)) + 1;
  const prevEnd = format(subDays(parseISO(range.start), 1), "yyyy-MM-dd");
  const prevStart = format(subDays(parseISO(prevEnd), lengthDays - 1), "yyyy-MM-dd");
  return { start: prevStart, end: prevEnd };
}

export function addDaysStr(dateStr: string, days: number): string {
  return format(addDays(parseISO(dateStr), days), "yyyy-MM-dd");
}

export function formatDisplayDate(dateStr: string): string {
  return format(parseISO(dateStr), "d MMM yyyy");
}

export function dayOfWeekName(dateStr: string): string {
  return format(parseISO(dateStr), "EEEE");
}
