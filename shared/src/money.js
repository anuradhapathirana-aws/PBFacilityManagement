// Money math in integer cents (fils) — never sum floats directly.

export const toCents = (n) => Math.round(Number(n || 0) * 100);
export const fromCents = (c) => c / 100;

/** Booking total = cleaners × hours × hourly rate, in cents. */
export const bookingTotalCents = ({ cleanerCount, hours, rate }) =>
  Math.round(Number(cleanerCount || 0) * Number(hours || 0) * toCents(rate));

/**
 * Equal-share allocation. Returns Map<staffId, cents>.
 * Remainder cents go to the lowest ids first so shares always add to the total.
 */
export const equalShares = (totalCents, staffIds) => {
  const ids = [...new Set(staffIds)].sort((a, b) => a - b);
  const out = new Map();
  if (!ids.length) return out;
  const base = Math.floor(totalCents / ids.length);
  const remainder = totalCents - base * ids.length;
  ids.forEach((id, i) => out.set(id, base + (i < remainder ? 1 : 0)));
  return out;
};

export const formatMoney = (cents) => `AED ${(Number(cents || 0) / 100).toFixed(2)}`;
