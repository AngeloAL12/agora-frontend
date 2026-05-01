import {
  normalizeComplaintStatus,
  getComplaintStatusMeta,
  isStaffRole,
  isWithinDateFilter,
  DateFilter,
} from '../../utils/complaints';

describe('normalizeComplaintStatus', () => {
  it('maps Spanish status names to English constants', () => {
    expect(normalizeComplaintStatus('En Proceso')).toBe('IN_PROGRESS');
    expect(normalizeComplaintStatus('Resuelto')).toBe('RESOLVED');
    expect(normalizeComplaintStatus('Rechazado')).toBe('REJECTED');
    expect(normalizeComplaintStatus('Pendiente')).toBe('PENDING');
  });

  it('passes through valid English constants', () => {
    expect(normalizeComplaintStatus('PENDING')).toBe('PENDING');
    expect(normalizeComplaintStatus('IN_PROGRESS')).toBe('IN_PROGRESS');
    expect(normalizeComplaintStatus('RESOLVED')).toBe('RESOLVED');
    expect(normalizeComplaintStatus('REJECTED')).toBe('REJECTED');
  });

  it('handles case insensitivity and whitespace', () => {
    expect(normalizeComplaintStatus('  pending  ')).toBe('PENDING');
    expect(normalizeComplaintStatus('en proceso')).toBe('IN_PROGRESS');
    expect(normalizeComplaintStatus('EN PROCESO')).toBe('IN_PROGRESS');
  });

  it('defaults to PENDING for unknown values', () => {
    expect(normalizeComplaintStatus('UNKNOWN')).toBe('PENDING');
    expect(normalizeComplaintStatus('')).toBe('PENDING');
    expect(normalizeComplaintStatus(undefined)).toBe('PENDING');
  });
});

describe('getComplaintStatusMeta', () => {
  it('returns metadata for each valid status', () => {
    const pending = getComplaintStatusMeta('PENDING');
    expect(pending.label).toBe('Pendiente');
    expect(pending.bg).toBeDefined();
    expect(pending.text).toBeDefined();

    const inProgress = getComplaintStatusMeta('IN_PROGRESS');
    expect(inProgress.label).toBe('En proceso');

    const resolved = getComplaintStatusMeta('RESOLVED');
    expect(resolved.label).toBe('Resuelto');

    const rejected = getComplaintStatusMeta('REJECTED');
    expect(rejected.label).toBe('Rechazado');
  });

  it('normalizes Spanish status names before lookup', () => {
    const meta = getComplaintStatusMeta('En Proceso');
    expect(meta.label).toBe('En proceso');
  });

  it('defaults to Pendiente for unknown values', () => {
    const meta = getComplaintStatusMeta('something_invalid');
    expect(meta.label).toBe('Pendiente');
  });
});

describe('isStaffRole', () => {
  it('returns true for staff and admin roles', () => {
    expect(isStaffRole('staff')).toBe(true);
    expect(isStaffRole('admin')).toBe(true);
    expect(isStaffRole('Staff')).toBe(true);
    expect(isStaffRole('ADMIN')).toBe(true);
  });

  it('returns true with leading/trailing whitespace', () => {
    expect(isStaffRole('  staff  ')).toBe(true);
  });

  it('returns false for non-staff roles', () => {
    expect(isStaffRole('user')).toBe(false);
    expect(isStaffRole('student')).toBe(false);
    expect(isStaffRole('')).toBe(false);
  });

  it('returns false for null/undefined', () => {
    expect(isStaffRole(null)).toBe(false);
    expect(isStaffRole(undefined)).toBe(false);
  });
});

describe('isWithinDateFilter', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-05-01T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns true for "all" filter regardless of date', () => {
    expect(isWithinDateFilter('2020-01-01T00:00:00Z', 'all')).toBe(true);
    expect(isWithinDateFilter('2025-05-01T12:00:00Z', 'all')).toBe(true);
  });

  it('returns false for invalid date strings', () => {
    expect(isWithinDateFilter('not-a-date', 'today')).toBe(false);
  });

  it('filters for today correctly', () => {
    // Use local timezone dates to match the implementation
    const todayMorning = new Date(2025, 4, 1, 8, 0, 0).toISOString();
    const todayNoon = new Date(2025, 4, 1, 11, 59, 59).toISOString();
    const yesterday = new Date(2025, 3, 30, 23, 59, 59).toISOString();
    expect(isWithinDateFilter(todayMorning, 'today')).toBe(true);
    expect(isWithinDateFilter(todayNoon, 'today')).toBe(true);
    expect(isWithinDateFilter(yesterday, 'today')).toBe(false);
  });

  it('filters for this week correctly', () => {
    expect(isWithinDateFilter('2025-04-25T00:00:00Z', 'week')).toBe(true);
    expect(isWithinDateFilter('2025-04-23T00:00:00Z', 'week')).toBe(false);
  });

  it('filters for this month correctly', () => {
    const thisMonth = new Date(2025, 4, 1, 8, 0, 0).toISOString();
    const lastMonth = new Date(2025, 3, 30, 0, 0, 0).toISOString();
    expect(isWithinDateFilter(thisMonth, 'month')).toBe(true);
    expect(isWithinDateFilter(lastMonth, 'month')).toBe(false);
  });

  it('filters for last 30 days correctly', () => {
    const filter: DateFilter = 'thirtyDays';
    expect(isWithinDateFilter('2025-04-02T00:00:00Z', filter)).toBe(true);
    expect(isWithinDateFilter('2025-03-31T00:00:00Z', filter)).toBe(false);
  });
});
