import {
  generateId,
  formatDate,
  formatDateRange,
  isOverdue,
  cn,
  getPriorityColor,
  getPriorityLabel,
} from '@/app/lib/utils';

describe('generateId', () => {
  it('generates a unique string ID', () => {
    const id1 = generateId();
    const id2 = generateId();

    expect(typeof id1).toBe('string');
    expect(id1.length).toBeGreaterThan(0);
    expect(id1).not.toBe(id2);
  });
});

describe('formatDate', () => {
  it('formats a date string correctly', () => {
    const result = formatDate('2024-01-15');
    expect(result).toContain('Jan');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });
});

describe('formatDateRange', () => {
  it('formats a single date when end is null', () => {
    const result = formatDateRange('2024-01-15', null);
    expect(result).toContain('Jan');
    expect(result).toContain('15');
  });

  it('formats a date range when end is provided', () => {
    const result = formatDateRange('2024-01-15', '2024-01-20');
    expect(result).toContain('-');
    expect(result).toContain('15');
    expect(result).toContain('20');
  });

  it('formats single date when start equals end', () => {
    const result = formatDateRange('2024-01-15', '2024-01-15');
    expect(result.split('-').length).toBeLessThanOrEqual(2); // Date format may contain hyphens
  });
});

describe('isOverdue', () => {
  it('returns true for past dates', () => {
    const pastDate = { start: '2020-01-01', end: null };
    expect(isOverdue(pastDate)).toBe(true);
  });

  it('returns false for future dates', () => {
    const futureDate = { start: '2099-01-01', end: null };
    expect(isOverdue(futureDate)).toBe(false);
  });

  it('uses end date when provided', () => {
    const dateRange = { start: '2020-01-01', end: '2099-12-31' };
    expect(isOverdue(dateRange)).toBe(false);
  });
});

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('filters out falsy values', () => {
    expect(cn('foo', false, 'bar', null, undefined)).toBe('foo bar');
  });

  it('returns empty string for all falsy values', () => {
    expect(cn(false, null, undefined)).toBe('');
  });
});

describe('getPriorityColor', () => {
  it('returns red for urgent priority (8-10)', () => {
    expect(getPriorityColor(10)).toBe('text-red-500');
    expect(getPriorityColor(8)).toBe('text-red-500');
  });

  it('returns orange for high priority (5-7)', () => {
    expect(getPriorityColor(7)).toBe('text-orange-500');
    expect(getPriorityColor(5)).toBe('text-orange-500');
  });

  it('returns yellow for medium priority (3-4)', () => {
    expect(getPriorityColor(4)).toBe('text-yellow-500');
    expect(getPriorityColor(3)).toBe('text-yellow-500');
  });

  it('returns zinc for low priority (0-2)', () => {
    expect(getPriorityColor(2)).toBe('text-zinc-400');
    expect(getPriorityColor(0)).toBe('text-zinc-400');
  });
});

describe('getPriorityLabel', () => {
  it('returns Urgent for high priority', () => {
    expect(getPriorityLabel(10)).toBe('Urgent');
    expect(getPriorityLabel(8)).toBe('Urgent');
  });

  it('returns High for medium-high priority', () => {
    expect(getPriorityLabel(7)).toBe('High');
    expect(getPriorityLabel(5)).toBe('High');
  });

  it('returns Medium for medium priority', () => {
    expect(getPriorityLabel(4)).toBe('Medium');
    expect(getPriorityLabel(3)).toBe('Medium');
  });

  it('returns Low for low priority', () => {
    expect(getPriorityLabel(2)).toBe('Low');
    expect(getPriorityLabel(0)).toBe('Low');
  });
});
