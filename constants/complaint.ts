export const REPORT_TABS = [
  { label: 'Reporte', value: 'report' },
  { label: 'Sugerencia', value: 'suggestion' },
];

export const REPORT_CATEGORIES = [
  { label: 'Mantenimiento', value: 'MAINTENANCE' },
  { label: 'Limpieza', value: 'CLEANING' },
  { label: 'Seguridad', value: 'SECURITY' },
  { label: 'Servicios', value: 'SERVICES' },
  { label: 'Infraestructura', value: 'INFRASTRUCTURE' },
  { label: 'Otro', value: 'OTHER' },
];

export const SUGGESTION_CATEGORIES = [
  { label: 'Mantenimiento', value: 'MAINTENANCE' },
  { label: 'Limpieza', value: 'CLEANING' },
  { label: 'Seguridad', value: 'SECURITY' },
  { label: 'Servicios', value: 'SERVICES' },
  { label: 'Infraestructura', value: 'INFRASTRUCTURE' },
  { label: 'General', value: 'GENERAL' },
];

/**
 * Map from category value to its display label.
 * Merges REPORT_CATEGORIES and SUGGESTION_CATEGORIES so every known value is covered.
 */
export const CATEGORY_LABEL_MAP: Record<string, string> = [
  ...REPORT_CATEGORIES,
  ...SUGGESTION_CATEGORIES,
].reduce<Record<string, string>>((acc, { value, label }) => {
  if (!acc[value]) acc[value] = label;
  return acc;
}, {});

export function getCategoryLabel(value: string): string {
  return CATEGORY_LABEL_MAP[value] ?? value;
}

export const REPORT_BUILDINGS = [
  { id: 1, label: 'Edificio B' },
  { id: 2, label: 'Edificio L' },
  { id: 3, label: 'Edificio U' },
  { id: 4, label: 'Edificio C' },
  { id: 5, label: 'Edificio G' },
  { id: 6, label: 'Edificio I' },
  { id: 7, label: 'Edificio J' },
  { id: 8, label: 'Edificio F' },
  { id: 9, label: 'Edificio E' },
  { id: 10, label: 'Edificio H' },
  { id: 11, label: 'Edificio A' },
  { id: 12, label: 'Edificio V' },
  { id: 13, label: 'Edificio Q' },
  { id: 14, label: 'Edificio M' },
  { id: 15, label: 'Edificio X' },
  { id: 16, label: 'Edificio D' },
  { id: 17, label: 'Nodo' },
  { id: 18, label: 'Extraescolares' },
];
