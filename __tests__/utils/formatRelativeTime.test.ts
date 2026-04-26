import { formatRelativeTime } from '../../utils/formatRelativeTime';

describe('formatRelativeTime', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns empty string for invalid date', () => {
    expect(formatRelativeTime('not-a-date')).toBe('');
  });

  it('returns "Justo ahora" for less than 1 minute ago', () => {
    const thirtySecondsAgo = new Date('2024-01-15T11:59:40Z').toISOString();
    expect(formatRelativeTime(thirtySecondsAgo)).toBe('Justo ahora');
  });

  it('returns minutes for less than 60 minutes ago', () => {
    const thirtyMinutesAgo = new Date('2024-01-15T11:30:00Z').toISOString();
    expect(formatRelativeTime(thirtyMinutesAgo)).toBe('Hace 30 min');
  });

  it('returns hours for less than 24 hours ago', () => {
    const threeHoursAgo = new Date('2024-01-15T09:00:00Z').toISOString();
    expect(formatRelativeTime(threeHoursAgo)).toBe('3h atrás');
  });

  it('returns "Ayer" for exactly 1 day ago', () => {
    const yesterday = new Date('2024-01-14T12:00:00Z').toISOString();
    expect(formatRelativeTime(yesterday)).toBe('Ayer');
  });

  it('returns days for more than 1 day ago', () => {
    const fiveDaysAgo = new Date('2024-01-10T12:00:00Z').toISOString();
    expect(formatRelativeTime(fiveDaysAgo)).toBe('5 días atrás');
  });
});
