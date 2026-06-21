/**
 * Dijkstra-based intermediate route finder.
 * 
 * The rail network is a weighted directed graph:
 *   - Nodes  = station IDs
 *   - Edges  = train legs (train_id, departure, arrival, duration in minutes)
 * 
 * We build the graph lazily from the train_stops table.
 * When a direct train is not available (or is RAC/WL), we find
 * paths with at most ONE intermediate stop and a minimum transfer
 * buffer of MIN_TRANSFER_MINUTES.
 */

const MIN_TRANSFER_MINUTES = 30; // minimum layover at intermediate station

// Convert "HH:MM:SS" to total minutes from midnight
function timeToMinutes(t) {
  if (!t) return null;
  const parts = t.split(':').map(Number);
  return parts[0] * 60 + parts[1];
}

// Format minutes-from-midnight back to "HH:MM"
function minutesToTime(m) {
  const h = Math.floor(m / 60) % 24;
  const min = m % 60;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

// Duration in minutes between two times (handles midnight crossover)
function duration(depMin, arrMin) {
  if (depMin === null || arrMin === null) return Infinity;
  let diff = arrMin - depMin;
  if (diff < 0) diff += 24 * 60; // overnight
  return diff;
}

/**
 * Build adjacency map from DB rows.
 * Returns: Map<fromStationId, Array<{toStationId, trainId, trainName, trainNumber, depMin, arrMin, durationMin}>>
 */
function buildGraph(rows) {
  const graph = new Map();
  for (const r of rows) {
    if (!graph.has(r.from_station_id)) graph.set(r.from_station_id, []);
    graph.get(r.from_station_id).push({
      toStationId: r.to_station_id,
      trainId: r.train_id,
      trainName: r.train_name,
      trainNumber: r.train_number,
      trainType: r.train_type,
      fromName: r.from_name,
      toName: r.to_name,
      fromCode: r.from_code,
      toCode: r.to_code,
      depMin: timeToMinutes(r.departure_time),
      arrMin: timeToMinutes(r.arrival_time),
    });
  }
  return graph;
}

/**
 * Find DIRECT trains from src to dst.
 */
function findDirectRoutes(graph, srcId, dstId) {
  const edges = graph.get(srcId) || [];
  return edges
    .filter(e => e.toStationId === dstId)
    .map(e => ({
      type: 'direct',
      totalDuration: duration(e.depMin, e.arrMin),
      legs: [e],
      departure: minutesToTime(e.depMin),
      arrival: minutesToTime(e.arrMin),
    }));
}

/**
 * Find INDIRECT routes with exactly 1 intermediate stop.
 * Strategy: for each outgoing edge from src, check if that
 * intermediate station has an onward train to dst with adequate buffer.
 */
function findIndirectRoutes(graph, srcId, dstId) {
  const results = [];
  const leg1Options = graph.get(srcId) || [];

  for (const leg1 of leg1Options) {
    if (leg1.toStationId === dstId) continue; // skip direct
    const midId = leg1.toStationId;
    const leg2Options = graph.get(midId) || [];

    for (const leg2 of leg2Options) {
      if (leg2.toStationId !== dstId) continue;
      if (leg1.trainId === leg2.trainId) continue; // same train = handled by direct

      // Check transfer buffer
      const layoverMin = duration(leg1.arrMin, leg2.depMin);
      if (layoverMin < MIN_TRANSFER_MINUTES || layoverMin > 6 * 60) continue; // also skip insane waits

      const totalDur = duration(leg1.depMin, leg2.arrMin);
      results.push({
        type: 'indirect',
        totalDuration: totalDur,
        layoverMinutes: layoverMin,
        intermediate: { id: midId, name: leg1.toName, code: leg1.toCode },
        legs: [leg1, leg2],
        departure: minutesToTime(leg1.depMin),
        arrival: minutesToTime(leg2.arrMin),
        connectionRisk: layoverMin < 60 ? 'HIGH' : layoverMin < 90 ? 'MEDIUM' : 'LOW',
      });
    }
  }

  // Sort by total duration ascending (Dijkstra's optimal-first ordering)
  return results.sort((a, b) => a.totalDuration - b.totalDuration).slice(0, 5);
}

/**
 * Main entry: find all routes (direct + indirect) and return ranked list.
 * @param {*} db - mysql2 pool
 * @param {number} srcId - source station_id
 * @param {number} dstId - destination station_id
 */
async function findRoutes(db, srcId, dstId) {
  // Pull all relevant legs in ONE query:
  // Leg 1: src → any intermediate
  // Leg 2: any intermediate → dst
  // We also pull src → dst (direct)
  const [rows] = await db.execute(`
    SELECT
      ts1.train_id,
      t.train_name,
      t.train_number,
      t.train_type,
      ts1.station_id   AS from_station_id,
      s1.station_name  AS from_name,
      s1.station_code  AS from_code,
      ts2.station_id   AS to_station_id,
      s2.station_name  AS to_name,
      s2.station_code  AS to_code,
      ts1.departure_time,
      ts2.arrival_time
    FROM train_stops ts1
    JOIN train_stops ts2
      ON ts1.train_id = ts2.train_id
      AND ts1.stop_order < ts2.stop_order
    JOIN trains t ON t.train_id = ts1.train_id
    JOIN stations s1 ON s1.station_id = ts1.station_id
    JOIN stations s2 ON s2.station_id = ts2.station_id
    WHERE
      (ts1.station_id = ? OR ts2.station_id = ?)
    AND
      (ts1.station_id = ? OR ts2.station_id = ? OR ts1.station_id = ? OR ts2.station_id = ?)
    LIMIT 5000
  `, [srcId, dstId, srcId, srcId, dstId, dstId]);

  const graph = buildGraph(rows);

  const direct = findDirectRoutes(graph, srcId, dstId);
  const indirect = findIndirectRoutes(graph, srcId, dstId);

  return {
    direct: direct.sort((a, b) => a.totalDuration - b.totalDuration),
    indirect,
    hasAlternatives: indirect.length > 0,
  };
}

module.exports = { findRoutes, timeToMinutes, minutesToTime };
