/**
 * Pure date helpers only — no database import. Client components must import
 * from here rather than from dates.ts: dates.ts pulls in getDb() (and
 * therefore better-sqlite3), which breaks if it ends up in the browser bundle.
 */
import { addDays, differenceInCalendarDays, format, parseISO, subDays } from "date-fns";

export type DateRange = { start: string; end: string };

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
