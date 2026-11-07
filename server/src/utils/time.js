import { env } from '../config/env.js';

const offsetMs = () => env.TZ_OFFSET_MINUTES * 60_000;

/** Business-local "YYYY-MM-DD" + "HH:mm" → absolute Date (UTC instant). */
export const toInstant = (date, time) => {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  return new Date(Date.UTC(y, m - 1, d, hh, mm) - offsetMs());
};

export const addHours = (instant, hours) => new Date(instant.getTime() + Math.round(Number(hours) * 3_600_000));

/** Today's date in the business timezone. */
export const businessToday = () => new Date(Date.now() + offsetMs()).toISOString().slice(0, 10);
