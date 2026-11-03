/** Fill "{name}" placeholders in a translated string. */
export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

type DurationUnits = { hoursMinutes: string; hours: string; minutes: string };

/** "1 h 15 min", "2 h" or "45 min", in the words of the current language. */
export function formatDuration(totalMinutes: number, units: DurationUnits) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return fill(units.minutes, { m });
  if (m === 0) return fill(units.hours, { h });
  return fill(units.hoursMinutes, { h, m });
}
