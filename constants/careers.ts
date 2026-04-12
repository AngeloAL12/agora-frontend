export interface Career {
  id: string;
  careerId: number;
  name: string;
  icon: any;
}

export const CAREERS: Career[] = [
  {
    id: 'contador',
    careerId: 3,
    name: 'Contador Público',
    icon: require('@/assets/icons/careers/contador.svg'),
  },
  {
    id: 'administracion',
    careerId: 4,
    name: 'Ing. Administración',
    icon: require('@/assets/icons/careers/administracion.svg'),
  },
  {
    id: 'bioquimica',
    careerId: 1,
    name: 'Ing. Bioquímica',
    icon: require('@/assets/icons/careers/bioquimica.svg'),
  },
  {
    id: 'desarrollo_apps',
    careerId: 5,
    name: 'Ing. Desarrollo de Aplicaciones',
    icon: require('@/assets/icons/careers/desarrollo_apps.svg'),
  },
  {
    id: 'electrica',
    careerId: 6,
    name: 'Ing. Eléctrica',
    icon: require('@/assets/icons/careers/electrica.svg'),
  },
  {
    id: 'electronica',
    careerId: 7,
    name: 'Ing. Electrónica',
    icon: require('@/assets/icons/careers/electronica.svg'),
  },
  {
    id: 'energias_renovables',
    careerId: 8,
    name: 'Ing. Energías Renovables',
    icon: require('@/assets/icons/careers/energias_renovables.svg'),
  },
  {
    id: 'gestion_empresarial',
    careerId: 9,
    name: 'Ing. Gestión Empresarial',
    icon: require('@/assets/icons/careers/gestion_empresarial.svg'),
  },
  {
    id: 'industrial',
    careerId: 10,
    name: 'Ing. Industrial',
    icon: require('@/assets/icons/careers/industrial.svg'),
  },
  {
    id: 'logistica',
    careerId: 11,
    name: 'Ing. Logística',
    icon: require('@/assets/icons/careers/logistica.svg'),
  },
  {
    id: 'materiales',
    careerId: 12,
    name: 'Ing. Materiales',
    icon: require('@/assets/icons/careers/materiales.svg'),
  },
  {
    id: 'mecanica',
    careerId: 14,
    name: 'Ing. Mecánica',
    icon: require('@/assets/icons/careers/mecanica.svg'),
  },
  {
    id: 'mecatronica',
    careerId: 13,
    name: 'Ing. Mecatrónica',
    icon: require('@/assets/icons/careers/mecatronica.svg'),
  },
  {
    id: 'quimica',
    careerId: 15,
    name: 'Ing. Química',
    icon: require('@/assets/icons/careers/quimica.svg'),
  },
  {
    id: 'semiconductores',
    careerId: 2,
    name: 'Ing. Semiconductores',
    icon: require('@/assets/icons/careers/semiconductores.svg'),
  },
  {
    id: 'sistemas',
    careerId: 16,
    name: 'Ing. Sistemas Computacionales',
    icon: require('@/assets/icons/careers/sistemas_computacionales.svg'),
  },
];
