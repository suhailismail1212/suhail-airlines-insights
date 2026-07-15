import { getDefaultDateRange, type DateRange } from "./dates";

export function resolveRange(params: { start?: string; end?: string }): DateRange {
  const fallback = getDefaultDateRange();
  return {
    start: params.start || fallback.start,
    end: params.end || fallback.end,
  };
}
