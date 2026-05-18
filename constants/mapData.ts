import type {
  BuildingData,
  GpsReference,
  PointOfInterestData,
  RouteEdge,
  RouteNode,
} from '@/types/map';

export const MAP_WIDTH = 10068;
export const MAP_HEIGHT = 6644;

// ~1 m per 26 px based on campus GPS reference spread (~400 m wide)
export const METERS_PER_PIXEL = 0.038;

// Building positions measured manually from the map image.
// IDs match the backend seed order (1-18).
export const BUILDINGS: BuildingData[] = [
  {
    id: 1,
    code: 'B',
    label: 'Edificio B',
    position: { x: 2926, y: 5677 },
    radius: 110,
    category: 'edificio',
  },
  {
    id: 2,
    code: 'L',
    label: 'Edificio L',
    position: { x: 2196, y: 5317 },
    radius: 110,
    category: 'laboratorio',
  },
  {
    id: 3,
    code: 'U',
    label: 'Edificio U',
    position: { x: 3867, y: 3418 },
    radius: 110,
    category: 'edificio',
  },
  {
    id: 4,
    code: 'C',
    label: 'Edificio C',
    position: { x: 4560, y: 3661 },
    radius: 110,
    category: 'edificio',
  },
  {
    id: 5,
    code: 'G',
    label: 'Edificio G',
    position: { x: 5063, y: 3291 },
    radius: 110,
    category: 'edificio',
  },
  {
    id: 6,
    code: 'I',
    label: 'Edificio I',
    position: { x: 5862, y: 2936 },
    radius: 110,
    category: 'edificio',
  },
  {
    id: 7,
    code: 'J',
    label: 'Edificio J',
    position: { x: 6365, y: 2291 },
    radius: 110,
    category: 'edificio',
  },
  {
    id: 8,
    code: 'F',
    label: 'Edificio F',
    position: { x: 5206, y: 3936 },
    radius: 110,
    category: 'edificio',
  },
  {
    id: 9,
    code: 'E',
    label: 'Edificio E',
    position: { x: 6227, y: 3317 },
    radius: 110,
    category: 'edificio',
  },
  {
    id: 10,
    code: 'H',
    label: 'Edificio H',
    position: { x: 6999, y: 2793 },
    radius: 110,
    category: 'edificio',
  },
  {
    id: 11,
    code: 'A',
    label: 'Edificio A',
    position: { x: 4582, y: 4809 },
    radius: 110,
    category: 'edificio',
  },
  {
    id: 12,
    code: 'V',
    label: 'Edificio V',
    position: { x: 5084, y: 4539 },
    radius: 110,
    category: 'edificio',
  },
  {
    id: 13,
    code: 'Q',
    label: 'Edificio Q',
    position: { x: 6079, y: 3973 },
    radius: 110,
    category: 'laboratorio',
  },
  {
    id: 14,
    code: 'M',
    label: 'Edificio M',
    position: { x: 7079, y: 3709 },
    radius: 110,
    category: 'edificio',
  },
  {
    id: 15,
    code: 'X',
    label: 'Edificio X',
    position: { x: 7693, y: 3090 },
    radius: 110,
    category: 'edificio',
  },
  {
    id: 16,
    code: 'D',
    label: 'Edificio D',
    position: { x: 5751, y: 4677 },
    radius: 110,
    category: 'edificio',
  },
  {
    id: 17,
    code: 'Nodo',
    label: 'Nodo',
    position: { x: 9100, y: 2963 },
    radius: 120,
    category: 'otro',
  },
  {
    id: 18,
    code: 'Extra',
    label: 'Extraescolares',
    position: { x: 1989, y: 4502 },
    radius: 120,
    category: 'deporte',
  },
];

export const POINTS_OF_INTEREST: PointOfInterestData[] = [
  {
    id: 1,
    name: 'Plaza Bicentenario',
    position: { x: 3420, y: 3700 },
    radius: 120,
  },
  {
    id: 2,
    name: 'Cancha Basketball',
    position: { x: 1200, y: 2800 },
    radius: 120,
  },
];

// Route graph: nodes placed along the visible yellow walkways in the map.
// Positions derived from measured building positions.
export const ROUTE_NODES: RouteNode[] = [
  // Main horizontal spine (walkway running diagonally across campus)
  { id: 'w1', position: { x: 2196, y: 5317 } }, // near L
  { id: 'w2', position: { x: 2926, y: 5677 } }, // near B
  { id: 'w3', position: { x: 3500, y: 4900 } }, // junction
  { id: 'w4', position: { x: 3867, y: 4200 } }, // junction
  { id: 'w5', position: { x: 3867, y: 3418 } }, // near U
  { id: 'w6', position: { x: 4560, y: 3661 } }, // near C
  { id: 'w7', position: { x: 4582, y: 4200 } }, // junction C-A
  { id: 'w8', position: { x: 4582, y: 4809 } }, // near A
  { id: 'w9', position: { x: 5063, y: 3291 } }, // near G
  { id: 'w10', position: { x: 5084, y: 3936 } }, // junction G-F
  { id: 'w11', position: { x: 5084, y: 4539 } }, // near V
  { id: 'w12', position: { x: 5206, y: 3936 } }, // near F
  { id: 'w13', position: { x: 5751, y: 4677 } }, // near D
  { id: 'w14', position: { x: 5862, y: 2936 } }, // near I
  { id: 'w15', position: { x: 5862, y: 3600 } }, // junction I-E
  { id: 'w16', position: { x: 6079, y: 3973 } }, // near Q
  { id: 'w17', position: { x: 6227, y: 3317 } }, // near E
  { id: 'w18', position: { x: 6365, y: 2291 } }, // near J
  { id: 'w19', position: { x: 6365, y: 2800 } }, // junction J-H
  { id: 'w20', position: { x: 6999, y: 2793 } }, // near H
  { id: 'w21', position: { x: 7079, y: 3709 } }, // near M
  { id: 'w22', position: { x: 7693, y: 3090 } }, // near X
  { id: 'w23', position: { x: 9100, y: 2963 } }, // near Nodo
  { id: 'w24', position: { x: 1989, y: 4502 } }, // near Extraescolares
  { id: 'w25', position: { x: 2560, y: 4900 } }, // junction Extra-L
  { id: 'w26', position: { x: 4800, y: 3100 } }, // junction U-G
  { id: 'w27', position: { x: 6700, y: 2550 } }, // junction J-H-X
  { id: 'w28', position: { x: 7200, y: 2900 } }, // junction H-X
  { id: 'w29', position: { x: 8000, y: 2963 } }, // junction X-Nodo
  { id: 'w30', position: { x: 5500, y: 3100 } }, // junction G-I
  // Building entrance nodes
  { id: 'b1', position: { x: 2926, y: 5677 }, buildingId: 1 },
  { id: 'b2', position: { x: 2196, y: 5317 }, buildingId: 2 },
  { id: 'b3', position: { x: 3867, y: 3418 }, buildingId: 3 },
  { id: 'b4', position: { x: 4560, y: 3661 }, buildingId: 4 },
  { id: 'b5', position: { x: 5063, y: 3291 }, buildingId: 5 },
  { id: 'b6', position: { x: 5862, y: 2936 }, buildingId: 6 },
  { id: 'b7', position: { x: 6365, y: 2291 }, buildingId: 7 },
  { id: 'b8', position: { x: 5206, y: 3936 }, buildingId: 8 },
  { id: 'b9', position: { x: 6227, y: 3317 }, buildingId: 9 },
  { id: 'b10', position: { x: 6999, y: 2793 }, buildingId: 10 },
  { id: 'b11', position: { x: 4582, y: 4809 }, buildingId: 11 },
  { id: 'b12', position: { x: 5084, y: 4539 }, buildingId: 12 },
  { id: 'b13', position: { x: 6079, y: 3973 }, buildingId: 13 },
  { id: 'b14', position: { x: 7079, y: 3709 }, buildingId: 14 },
  { id: 'b15', position: { x: 7693, y: 3090 }, buildingId: 15 },
  { id: 'b16', position: { x: 5751, y: 4677 }, buildingId: 16 },
  { id: 'b17', position: { x: 9100, y: 2963 }, buildingId: 17 },
  { id: 'b18', position: { x: 1989, y: 4502 }, buildingId: 18 },
];

function dist(n1: RouteNode, n2: RouteNode): number {
  const dx = n1.position.x - n2.position.x;
  const dy = n1.position.y - n2.position.y;
  return Math.round(Math.sqrt(dx * dx + dy * dy));
}

function edge(from: string, to: string): RouteEdge {
  const n1 = ROUTE_NODES.find((n) => n.id === from)!;
  const n2 = ROUTE_NODES.find((n) => n.id === to)!;
  return { from, to, weight: dist(n1, n2) };
}

export const ROUTE_EDGES: RouteEdge[] = [
  // West cluster (Extraescolares, L, B)
  edge('b18', 'w24'),
  edge('w24', 'w25'),
  edge('w25', 'w1'),
  edge('w25', 'w2'),
  edge('w1', 'b2'),
  edge('w2', 'b1'),
  edge('w1', 'w3'),
  edge('w2', 'w3'),
  // West to center
  edge('w3', 'w4'),
  edge('w4', 'w5'),
  edge('w4', 'w7'),
  edge('w4', 'w8'),
  // North-west buildings
  edge('w5', 'b3'),
  edge('w5', 'w6'),
  edge('w5', 'w26'),
  edge('w6', 'b4'),
  edge('w7', 'b4'),
  edge('w7', 'w8'),
  edge('w8', 'b11'),
  // Center walkway
  edge('w26', 'b5'),
  edge('w26', 'w9'),
  edge('w9', 'b5'),
  edge('w9', 'w10'),
  edge('w9', 'w30'),
  edge('w10', 'b8'),
  edge('w10', 'w12'),
  edge('w10', 'w11'),
  edge('w11', 'b12'),
  edge('w11', 'w13'),
  edge('w12', 'b8'),
  edge('w13', 'b16'),
  // North-center to east
  edge('w30', 'b6'),
  edge('w30', 'w14'),
  edge('w14', 'b6'),
  edge('w14', 'w15'),
  edge('w14', 'w19'),
  edge('w15', 'b9'),
  edge('w15', 'w17'),
  edge('w15', 'w16'),
  edge('w16', 'b13'),
  edge('w17', 'b9'),
  // East cluster
  edge('w19', 'b7'),
  edge('w19', 'w18'),
  edge('w18', 'b7'),
  edge('w19', 'w27'),
  edge('w27', 'w20'),
  edge('w27', 'w28'),
  edge('w20', 'b10'),
  edge('w20', 'w21'),
  edge('w21', 'b14'),
  edge('w28', 'w22'),
  edge('w22', 'b15'),
  edge('w22', 'w29'),
  edge('w29', 'w23'),
  edge('w23', 'b17'),
];

// GPS reference points measured on campus.
// G, L, J give best spread; used for affine GPS → pixel transform.
export const GPS_REFERENCE_POINTS: GpsReference[] = [
  {
    gps: { latitude: 32.62112444228933, longitude: -115.39584426734908 },
    pixel: { x: 5063, y: 3291 },
  }, // Edificio G
  {
    gps: { latitude: 32.62081664960056, longitude: -115.39860642943313 },
    pixel: { x: 2196, y: 5317 },
  }, // Edificio L
  {
    gps: { latitude: 32.621167010910185, longitude: -115.39477491078955 },
    pixel: { x: 6365, y: 2291 },
  }, // Edificio J
];
