import {
  CATEGORY_LABEL_MAP,
  REPORT_BUILDINGS,
  REPORT_CATEGORIES,
  REPORT_TABS,
  SUGGESTION_CATEGORIES,
  getCategoryLabel,
} from '../../constants/complaint';

describe('constants/complaint', () => {
  describe('REPORT_TABS', () => {
    it('has report and suggestion options', () => {
      expect(REPORT_TABS).toHaveLength(2);
      expect(REPORT_TABS.map((t) => t.value)).toEqual(['report', 'suggestion']);
    });
  });

  describe('REPORT_CATEGORIES', () => {
    it('contains expected categories', () => {
      const values = REPORT_CATEGORIES.map((c) => c.value);
      expect(values).toContain('MAINTENANCE');
      expect(values).toContain('CLEANING');
      expect(values).toContain('SECURITY');
      expect(values).toContain('INFRASTRUCTURE');
      expect(values).toContain('OTHER');
    });

    it('each category has a label and value', () => {
      REPORT_CATEGORIES.forEach((cat) => {
        expect(cat.label).toBeTruthy();
        expect(cat.value).toBeTruthy();
      });
    });
  });

  describe('SUGGESTION_CATEGORIES', () => {
    it('contains GENERAL category not in reports', () => {
      const suggestionValues = SUGGESTION_CATEGORIES.map((c) => c.value);
      const reportValues = REPORT_CATEGORIES.map((c) => c.value);
      expect(suggestionValues).toContain('GENERAL');
      expect(reportValues).not.toContain('GENERAL');
    });
  });

  describe('REPORT_BUILDINGS', () => {
    it('has buildings with id and label', () => {
      expect(REPORT_BUILDINGS.length).toBeGreaterThan(0);
      REPORT_BUILDINGS.forEach((building) => {
        expect(typeof building.id).toBe('number');
        expect(typeof building.label).toBe('string');
      });
    });

    it('has unique ids', () => {
      const ids = REPORT_BUILDINGS.map((b) => b.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('CATEGORY_LABEL_MAP', () => {
    it('contains all report and suggestion categories', () => {
      const allValues = [
        ...REPORT_CATEGORIES.map((c) => c.value),
        ...SUGGESTION_CATEGORIES.map((c) => c.value),
      ];
      const uniqueValues = [...new Set(allValues)];
      uniqueValues.forEach((value) => {
        expect(CATEGORY_LABEL_MAP[value]).toBeTruthy();
      });
    });
  });

  describe('getCategoryLabel', () => {
    it('returns the label for a known category value', () => {
      expect(getCategoryLabel('MAINTENANCE')).toBe('Mantenimiento');
      expect(getCategoryLabel('CLEANING')).toBe('Limpieza');
      expect(getCategoryLabel('GENERAL')).toBe('General');
    });

    it('returns the value itself for unknown categories', () => {
      expect(getCategoryLabel('UNKNOWN_CATEGORY')).toBe('UNKNOWN_CATEGORY');
    });
  });
});
