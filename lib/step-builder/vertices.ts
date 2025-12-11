import { CartesianPoint, VertexPoint, Repository } from "stepts"
import type { Ref } from "stepts"

/**
 * Create a STEP vertex at the specified coordinates.
 *
 * A vertex in STEP consists of:
 * - A CartesianPoint (geometric location)
 * - A VertexPoint (topological vertex referencing the point)
 *
 * @param repo - The STEP repository to add entities to
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param z - Z coordinate
 * @returns Reference to the created VertexPoint
 */
export function createVertex(
  repo: Repository,
  x: number,
  y: number,
  z: number,
): Ref<VertexPoint> {
  const point = repo.add(new CartesianPoint("", x, y, z))
  return repo.add(new VertexPoint("", point))
}

/**
 * Create multiple vertices from an array of coordinates.
 *
 * @param repo - The STEP repository to add entities to
 * @param coordinates - Array of [x, y, z] coordinate tuples
 * @returns Array of references to the created VertexPoints
 */
export function createVertices(
  repo: Repository,
  coordinates: Array<[number, number, number]>,
): Ref<VertexPoint>[] {
  return coordinates.map(([x, y, z]) => createVertex(repo, x, y, z))
}
