import {
  EdgeCurve,
  Line,
  CartesianPoint,
  Vector,
  Direction,
  Repository,
  VertexPoint,
} from "stepts"
import type { Ref } from "stepts"

/**
 * Create a straight line edge between two vertices.
 *
 * A line edge consists of:
 * - A Line (geometric curve)
 * - An EdgeCurve (topological edge connecting two vertices)
 *
 * @param repo - The STEP repository to add entities to
 * @param startVertex - Starting vertex
 * @param endVertex - Ending vertex
 * @returns Reference to the created EdgeCurve
 */
export function createLineEdge(
  repo: Repository,
  startVertex: Ref<VertexPoint>,
  endVertex: Ref<VertexPoint>,
): Ref<EdgeCurve> {
  // Get vertex coordinates to create the line
  const startPt = startVertex.resolve(repo)
  const endPt = endVertex.resolve(repo)

  if (!startPt || !endPt) {
    throw new Error("Cannot resolve vertex points")
  }

  const startCoords = startPt.pnt.resolve(repo)
  const endCoords = endPt.pnt.resolve(repo)

  if (!startCoords || !endCoords) {
    throw new Error("Cannot resolve cartesian points")
  }

  // Calculate direction vector from start to end
  const dx = endCoords.x - startCoords.x
  const dy = endCoords.y - startCoords.y
  const dz = endCoords.z - startCoords.z

  // Normalize direction
  const length = Math.sqrt(dx * dx + dy * dy + dz * dz)
  if (length === 0) {
    throw new Error("Cannot create edge between identical vertices")
  }

  const direction = repo.add(
    new Direction("", dx / length, dy / length, dz / length),
  )
  const vector = repo.add(new Vector("", direction, length))

  // Create the line starting at the start point
  const linePoint = repo.add(
    new CartesianPoint("", startCoords.x, startCoords.y, startCoords.z),
  )
  const line = repo.add(new Line("", linePoint, vector))

  // Create the edge curve
  return repo.add(new EdgeCurve("", startVertex, endVertex, line, true))
}

/**
 * Create multiple edges from pairs of vertices.
 *
 * @param repo - The STEP repository to add entities to
 * @param vertexPairs - Array of [startVertex, endVertex] tuples
 * @returns Array of references to the created EdgeCurves
 */
export function createLineEdges(
  repo: Repository,
  vertexPairs: Array<[Ref<VertexPoint>, Ref<VertexPoint>]>,
): Ref<EdgeCurve>[] {
  return vertexPairs.map(([start, end]) => createLineEdge(repo, start, end))
}
