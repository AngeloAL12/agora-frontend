import type { MapPosition, RouteEdge, RouteNode } from '@/types/map';

interface PathResult {
  path: MapPosition[];
  distance: number;
}

export function findPath(
  nodes: RouteNode[],
  edges: RouteEdge[],
  startId: string,
  endId: string,
): PathResult | null {
  if (startId === endId) {
    const node = nodes.find((n) => n.id === startId);
    return node ? { path: [node.position], distance: 0 } : null;
  }

  const adjacency = new Map<string, { to: string; weight: number }[]>();
  for (const node of nodes) {
    adjacency.set(node.id, []);
  }
  for (const edge of edges) {
    adjacency.get(edge.from)?.push({ to: edge.to, weight: edge.weight });
    adjacency.get(edge.to)?.push({ to: edge.from, weight: edge.weight });
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const endNode = nodeMap.get(endId);
  if (!endNode || !nodeMap.has(startId)) return null;

  const heuristic = (id: string) => {
    const n = nodeMap.get(id)!;
    const dx = n.position.x - endNode.position.x;
    const dy = n.position.y - endNode.position.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  const cameFrom = new Map<string, string>();
  const openSet = new Set<string>([startId]);
  const closedSet = new Set<string>();

  gScore.set(startId, 0);
  fScore.set(startId, heuristic(startId));

  while (openSet.size > 0) {
    let current = '';
    let lowestF = Infinity;
    for (const id of openSet) {
      const f = fScore.get(id) ?? Infinity;
      if (f < lowestF) {
        lowestF = f;
        current = id;
      }
    }

    if (current === endId) {
      const path: MapPosition[] = [];
      let node = current;
      while (node) {
        path.unshift(nodeMap.get(node)!.position);
        node = cameFrom.get(node)!;
      }
      return { path, distance: gScore.get(endId)! };
    }

    openSet.delete(current);
    closedSet.add(current);

    const neighbors = adjacency.get(current) ?? [];
    for (const { to, weight } of neighbors) {
      if (closedSet.has(to)) continue;

      const tentativeG = (gScore.get(current) ?? Infinity) + weight;
      if (tentativeG < (gScore.get(to) ?? Infinity)) {
        cameFrom.set(to, current);
        gScore.set(to, tentativeG);
        fScore.set(to, tentativeG + heuristic(to));
        openSet.add(to);
      }
    }
  }

  return null;
}
