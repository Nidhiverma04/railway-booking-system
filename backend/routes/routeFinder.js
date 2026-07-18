const { MinPriorityQueue } = require('@datastructures-js/priority-queue');

const MIN_TRANSFER_MINUTES = 30;
const MAX_LAYOVER_MINUTES  = 360;
const MAX_HOPS             = 3;
const K                    = 10;

// ── time helpers ──────────────────────────────────────────────────────────────

function timeToMinutes(t) {
  if (!t) return null;
  const parts = t.split(':').map(Number);
  return parts[0] * 60 + parts[1];
}

function minutesToTime(m) {
  if (m == null) return '—';
  const h   = Math.floor(m / 60) % 24;
  const min = m % 60;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

function duration(depMin, arrMin) {
  if (depMin == null || arrMin == null) return Infinity;
  let diff = arrMin - depMin;
  if (diff < 0) diff += 24 * 60;
  return diff;
}

function connectionRisk(minLayover) {
  if (minLayover < 60) return 'HIGH';
  if (minLayover < 90) return 'MEDIUM';
  return 'LOW';
}

// ── graph builder ─────────────────────────────────────────────────────────────

const MAX_EDGES_PER_NODE = 50; // only keep 50 fastest edges per station

function buildGraph(rows) {
  const graph = new Map();
  for (const r of rows) {
    if (!graph.has(r.from_station_id)) graph.set(r.from_station_id, []);
    graph.get(r.from_station_id).push({
      toStationId : r.to_station_id,
      trainId     : r.train_id,
      trainName   : r.train_name,
      trainNumber : r.train_number,
      trainType   : r.train_type,
      fromName    : r.from_name,
      toName      : r.to_name,
      fromCode    : r.from_code,
      toCode      : r.to_code,
      depMin      : timeToMinutes(r.departure_time),
      arrMin      : timeToMinutes(r.arrival_time),
    });
  }
  for (const [node, edges] of graph) {
    if (edges.length > MAX_EDGES_PER_NODE) {
      graph.set(node, edges
        .sort((a, b) => duration(a.depMin, a.arrMin) - duration(b.depMin, b.arrMin))
        .slice(0, MAX_EDGES_PER_NODE)
      );
    }
  }

  return graph;
}

// ── Dijkstra ──────────────────────────────────────────────────────────────────

function dijkstra(graph, srcId, dstId, blockedEdges, blockedNodes) {
  const pq   = new MinPriorityQueue((x) => x.cost);
  const dist = new Map();

  pq.enqueue({
    cost       : 0,
    node       : srcId,
    nodes      : [srcId],
    edges      : [],
    costTo     : [0],
    lastArrMin : null,
    lastTrainId: null,  // null = not on any train yet
  });

  while (!pq.isEmpty()) {
    const cur = pq.dequeue();

    if (dist.has(cur.node)) continue;
    dist.set(cur.node, cur.cost);

    if (cur.node === dstId) return cur;

    if (cur.nodes.length >= MAX_HOPS) continue;

    for (const edge of (graph.get(cur.node) || [])) {
      const edgeKey = `${cur.node}-${edge.toStationId}-${edge.trainId}`;

      if (blockedEdges.has(edgeKey))          continue;
      if (blockedNodes.has(edge.toStationId)) continue;
      if (dist.has(edge.toStationId))         continue;

      // ✅ FIX: only enforce train change at intermediate hops
      // lastTrainId is null on first leg — always allow boarding
      // on subsequent legs — must board a DIFFERENT train
      if (cur.lastTrainId !== null && edge.trainId === cur.lastTrainId) continue;

      // transfer buffer — only after first leg
      if (cur.lastArrMin !== null) {
        const layover = duration(cur.lastArrMin, edge.depMin);
        if (layover < MIN_TRANSFER_MINUTES) continue;
        if (layover > MAX_LAYOVER_MINUTES)  continue;
      }

      const legDur  = duration(edge.depMin, edge.arrMin);
      const layover = cur.lastArrMin !== null
        ? duration(cur.lastArrMin, edge.depMin)
        : 0;
      const newCost = cur.cost + layover + legDur;

      pq.enqueue({
        cost       : newCost,
        node       : edge.toStationId,
        nodes      : [...cur.nodes, edge.toStationId],
        edges      : [...cur.edges, edge],
        costTo     : [...cur.costTo, newCost],
        lastArrMin : edge.arrMin,
        lastTrainId: edge.trainId,
      });
    }
  }

  return null;
}

// ── Yen's K-Shortest Paths ────────────────────────────────────────────────────

function yenKShortest(graph, srcId, dstId) {
  const firstPath = dijkstra(graph, srcId, dstId, new Set(), new Set());
  if (!firstPath) return [];

  const kPaths     = [firstPath];
  const candidates = [];
  const seen       = new Set([firstPath.nodes.join('-')]);

  for (let k = 1; k < K; k++) {
    const prevPath = kPaths[k - 1];

    for (let i = 0; i < prevPath.nodes.length - 1; i++) {
      const spurNode = prevPath.nodes[i];
      const rootPath = prevPath.nodes.slice(0, i + 1);
      const rootCost = prevPath.costTo[i];

      const blockedEdges = new Set();
      for (const p of kPaths) {
        if (p.nodes.length > i &&
            p.nodes.slice(0, i + 1).join('-') === rootPath.join('-')) {
          const e = p.edges[i];
          if (e) blockedEdges.add(`${spurNode}-${e.toStationId}-${e.trainId}`);
        }
      }

      const blockedNodes = new Set(rootPath.slice(0, -1));

      const spurPath = dijkstra(graph, spurNode, dstId, blockedEdges, blockedNodes);
      if (!spurPath) continue;

      const combinedNodes = [...rootPath, ...spurPath.nodes.slice(1)];
      const combinedKey   = combinedNodes.join('-');
      if (seen.has(combinedKey)) continue;
      seen.add(combinedKey);

      const combinedEdges  = [...prevPath.edges.slice(0, i), ...spurPath.edges];

      const combinedCostTo = [0];
      let runningCost = 0;
      let lastArr     = null;
      for (const edge of combinedEdges) {
        const layover  = lastArr !== null ? duration(lastArr, edge.depMin) : 0;
        runningCost   += layover + duration(edge.depMin, edge.arrMin);
        combinedCostTo.push(runningCost);
        lastArr = edge.arrMin;
      }

      candidates.push({
        cost  : rootCost + spurPath.cost,
        nodes : combinedNodes,
        edges : combinedEdges,
        costTo: combinedCostTo,
        key   : combinedKey,
      });
    }

    if (candidates.length === 0) break;
    candidates.sort((a, b) => a.cost - b.cost);
    kPaths.push(candidates.shift());
  }

  return kPaths;
}

// ── convert raw Yen path → UI route object ────────────────────────────────────

function pathToRoute(path) {
  const { edges, cost } = path;
  if (!edges || edges.length === 0) return null;

  const firstEdge = edges[0];
  const lastEdge  = edges[edges.length - 1];

  const intermediate = edges.slice(0, -1).map(e => ({
    name: e.toName,
    code: e.toCode,
  }));

  const layoverMinutes = [];
  for (let i = 0; i < edges.length - 1; i++) {
    layoverMinutes.push(duration(edges[i].arrMin, edges[i + 1].depMin));
  }

  const minLayover = layoverMinutes.length > 0
    ? Math.min(...layoverMinutes)
    : Infinity;

  return {
    type          : edges.length === 1 ? 'direct' : 'indirect',
    hops          : edges.length - 1,
    totalDuration : cost,
    legs          : edges,
    intermediate,
    layoverMinutes,
    departure     : minutesToTime(firstEdge.depMin),
    arrival       : minutesToTime(lastEdge.arrMin),
    connectionRisk: edges.length === 1 ? 'LOW' : connectionRisk(minLayover),
  };
}

// ── main entry ────────────────────────────────────────────────────────────────

async function findRoutes(db, srcId, dstId) {
  // ✅ FIX: fetch only legs starting at src OR ending at dst
  // This gives us:
  //   direct edges:       src → dst
  //   leg 1 of indirect:  src → any_mid
  //   leg 2 of indirect:  any_mid → dst
  const [rows] = await db.execute(`
    (
      -- all legs departing FROM src station
      SELECT
        ts1.train_id, t.train_name, t.train_number, t.train_type,
        ts1.station_id AS from_station_id, s1.station_name AS from_name, s1.station_code AS from_code,
        ts2.station_id AS to_station_id,   s2.station_name AS to_name,   s2.station_code AS to_code,
        ts1.departure_time, ts2.arrival_time
      FROM train_stops ts1
      JOIN train_stops ts2 ON ts1.train_id = ts2.train_id AND ts2.stop_order > ts1.stop_order
      JOIN trains    t  ON t.train_id    = ts1.train_id
      JOIN stations  s1 ON s1.station_id = ts1.station_id
      JOIN stations  s2 ON s2.station_id = ts2.station_id
      WHERE ts1.station_id = ?
      LIMIT 3000
    )
    UNION
    (
      -- all legs arriving AT dst station
      SELECT
        ts1.train_id, t.train_name, t.train_number, t.train_type,
        ts1.station_id AS from_station_id, s1.station_name AS from_name, s1.station_code AS from_code,
        ts2.station_id AS to_station_id,   s2.station_name AS to_name,   s2.station_code AS to_code,
        ts1.departure_time, ts2.arrival_time
      FROM train_stops ts1
      JOIN train_stops ts2 ON ts1.train_id = ts2.train_id AND ts2.stop_order > ts1.stop_order
      JOIN trains    t  ON t.train_id    = ts1.train_id
      JOIN stations  s1 ON s1.station_id = ts1.station_id
      JOIN stations  s2 ON s2.station_id = ts2.station_id
      WHERE ts2.station_id = ?
      LIMIT 3000
    )
  `, [srcId, dstId]);

  console.log(`Fetched ${rows.length} legs for src=${srcId} dst=${dstId}`);

  if (rows.length === 0) {
    return { direct: [], indirect: [], hasAlternatives: false };
  }

  const graph = buildGraph(rows);
  console.log(`Graph nodes: ${graph.size}`);
  console.log(`Edges from src: ${(graph.get(srcId) || []).length}`);

  const allPaths = yenKShortest(graph, srcId, dstId);
  console.log(`Yen's found ${allPaths.length} paths`);

  const direct   = [];
  const indirect = [];

  for (const path of allPaths) {
    const route = pathToRoute(path);
    if (!route) continue;
    if (route.type === 'direct') direct.push(route);
    else indirect.push(route);
  }

  return { direct, indirect, hasAlternatives: indirect.length > 0 };
}

module.exports = { findRoutes, timeToMinutes, minutesToTime };