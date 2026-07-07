export const GRAPH_HELPERS = `
function buildAdjacencyList(edges, n) {
  const graph = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    graph[u].push(v);
    graph[v].push(u);
  }
  return graph;
}

function buildDirectedAdjacencyList(edges, n) {
  const graph = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    graph[u].push(v);
  }
  return graph;
}

function buildWeightedAdjacencyList(edges, n) {
  const graph = Array.from({ length: n }, () => []);
  for (const [u, v, w] of edges) {
    graph[u].push({ node: v, weight: w });
    graph[v].push({ node: u, weight: w });
  }
  return graph;
}
`;
