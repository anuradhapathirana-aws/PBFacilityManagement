// Single source of truth for enums and limits. Used by client AND server.
// Changing a value here changes validation everywhere — keep Prisma enums in sync.

export const STAFF_ROLES = ['CLEANER', 'DRIVER'];
export const STAFF_ROLE_LABELS = { CLEANER: 'Cleaner', DRIVER: 'Driver' };

export const AREAS = ['Ajman', 'Sharjah', 'Dubai', 'Umm Al Quwain', 'Other'];

export const SERVICES = [
  'Standard Home Cleaning',
  'Deep Cleaning',
  'Villa Cleaning',
  'Office Cleaning',
  'Move In / Move Out',
];

// Stored as enum keys in DB; labels shown in UI.
export const BOOKING_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'ASSIGNED',
  'ON_THE_WAY',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
];
export const BOOKING_STATUS_LABELS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  ASSIGNED: 'Assigned',
  ON_THE_WAY: 'On the Way',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const PAYMENT_STATUSES = ['UNPAID', 'PARTIAL', 'PAID'];
export const PAYMENT_STATUS_LABELS = { UNPAID: 'Unpaid', PARTIAL: 'Partial', PAID: 'Paid' };

export const CURRENCY = 'AED';

export const LIMITS = {
  nameMin: 2,
  nameMax: 100,
  addressMax: 500,
  notesMax: 1000,
  hoursMin: 0.5,
  hoursMax: 12,
  hoursStep: 0.5,
  cleanerCountMin: 1,
  cleanerCountMax: 20,
  driversMax: 10,
  rateMin: 0,
  rateMax: 10000,
  passwordMin: 8,
  passwordMax: 128,
  searchMax: 100,
};

export const BOOKING_DEFAULTS = {
  area: 'Ajman',
  service: 'Standard Home Cleaning',
  time: '09:00',
  hours: 3,
  rate: 35,
  status: 'PENDING',
  paymentStatus: 'UNPAID',
};
