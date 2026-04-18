export const CAREER_ICONS: Record<number, number> = {
  1: require('@/assets/icons/careers/bioquimica.svg'),
  2: require('@/assets/icons/careers/semiconductores.svg'),
  3: require('@/assets/icons/careers/contador.svg'),
  4: require('@/assets/icons/careers/administracion.svg'),
  5: require('@/assets/icons/careers/desarrollo_apps.svg'),
  6: require('@/assets/icons/careers/electrica.svg'),
  7: require('@/assets/icons/careers/electronica.svg'),
  8: require('@/assets/icons/careers/energias_renovables.svg'),
  9: require('@/assets/icons/careers/gestion_empresarial.svg'),
  10: require('@/assets/icons/careers/industrial.svg'),
  11: require('@/assets/icons/careers/logistica.svg'),
  12: require('@/assets/icons/careers/materiales.svg'),
  13: require('@/assets/icons/careers/mecatronica.svg'),
  14: require('@/assets/icons/careers/mecanica.svg'),
  15: require('@/assets/icons/careers/quimica.svg'),
  16: require('@/assets/icons/careers/sistemas_computacionales.svg'),
};

export const getCareerIcon = (careerId: number) => CAREER_ICONS[careerId];
