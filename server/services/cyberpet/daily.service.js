export function getDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function getYesterdayDateKey(date = new Date()) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() - 1);
  return getDateKey(d);
}
