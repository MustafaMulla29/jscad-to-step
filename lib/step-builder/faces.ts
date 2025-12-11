import {
  AdvancedFace,
  FaceOuterBound,
  EdgeLoop,
  OrientedEdge,
  Plane,
  Axis2Placement3D,
  CartesianPoint,
  Direction,
  Repository,
  EdgeCurve,
} from "stepts"
import type { Ref } from "stepts"

/**
 * Create a planar face from a loop of edges.
 *
 * @param repo - The STEP repository to add entities to
 * @param edges - Array of edges forming the boundary loop
 * @param planeOrigin - Origin point of the plane [x, y, z]
 * @param planeNormal - Normal vector of the plane [x, y, z]
 * @param planeRefDirection - Reference direction (x-axis) [x, y, z]
 * @returns Reference to the created AdvancedFace
 */
export function createPlanarFace(
  repo: Repository,
  edges: Ref<EdgeCurve>[],
  planeOrigin: [number, number, number],
  planeNormal: [number, number, number],
  planeRefDirection: [number, number, number],
): Ref<AdvancedFace> {
  // Create oriented edges (all forward direction)
  const orientedEdges = edges.map((edge) =>
    repo.add(new OrientedEdge("", edge, true)),
  )

  // Create edge loop
  const edgeLoop = repo.add(new EdgeLoop("", orientedEdges))

  // Create face bound
  const faceBound = repo.add(new FaceOuterBound("", edgeLoop, true))

  // Create plane geometry
  const origin = repo.add(
    new CartesianPoint("", planeOrigin[0], planeOrigin[1], planeOrigin[2]),
  )
  const normal = repo.add(
    new Direction("", planeNormal[0], planeNormal[1], planeNormal[2]),
  )
  const refDir = repo.add(
    new Direction(
      "",
      planeRefDirection[0],
      planeRefDirection[1],
      planeRefDirection[2],
    ),
  )

  const placement = repo.add(new Axis2Placement3D("", origin, normal, refDir))
  const plane = repo.add(new Plane("", placement))

  // Create the face
  return repo.add(new AdvancedFace("", [faceBound], plane, true))
}
