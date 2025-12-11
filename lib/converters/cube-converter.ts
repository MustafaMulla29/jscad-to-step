import {
  Repository,
  ClosedShell,
  ManifoldSolidBrep,
  AdvancedBrepShapeRepresentation,
  Product,
  ProductDefinitionFormation,
  ProductDefinition,
  ProductDefinitionContext,
  ApplicationContext,
  ProductContext,
  ProductDefinitionShape,
  ShapeDefinitionRepresentation,
  Unknown,
} from "stepts"
import type { Ref } from "stepts"
import type { CubeOperation } from "jscad-planner"
import { createVertices } from "../step-builder/vertices"
import { createLineEdge } from "../step-builder/edges"
import { createPlanarFace } from "../step-builder/faces"

/**
 * Convert a jscad-planner cube operation to STEP format.
 *
 * A cube consists of:
 * - 8 vertices (corners)
 * - 12 edges (lines connecting vertices)
 * - 6 faces (one per side)
 * - 1 closed shell
 * - 1 solid B-rep
 *
 * @param operation - The cube operation from jscad-planner
 * @returns STEP file content as string
 */
export function convertCubeToStep(operation: CubeOperation): string {
  const repo = new Repository()

  // Parse cube parameters
  const size = Array.isArray(operation.size)
    ? operation.size
    : [operation.size ?? 2, operation.size ?? 2, operation.size ?? 2]
  const width = size[0] ?? 2
  const height = size[1] ?? 2
  const depth = size[2] ?? 2

  // Calculate center position
  const center = operation.center ?? [0, 0, 0]
  const cx = center[0]
  const cy = center[1]
  const cz = center[2]

  // Calculate half dimensions for vertices around center
  const hw = width / 2
  const hh = height / 2
  const hd = depth / 2

  // Create 8 vertices of the cube
  // Bottom face (z = cz - hd)
  const v0 = createVertices(repo, [
    [cx - hw, cy - hh, cz - hd], // 0: bottom-left-back
    [cx + hw, cy - hh, cz - hd], // 1: bottom-right-back
    [cx + hw, cy + hh, cz - hd], // 2: bottom-right-front
    [cx - hw, cy + hh, cz - hd], // 3: bottom-left-front
    // Top face (z = cz + hd)
    [cx - hw, cy - hh, cz + hd], // 4: top-left-back
    [cx + hw, cy - hh, cz + hd], // 5: top-right-back
    [cx + hw, cy + hh, cz + hd], // 6: top-right-front
    [cx - hw, cy + hh, cz + hd], // 7: top-left-front
  ])

  // Create 12 edges of the cube
  // Bottom face edges
  const e0 = createLineEdge(repo, v0[0]!, v0[1]!) // bottom-back
  const e1 = createLineEdge(repo, v0[1]!, v0[2]!) // bottom-right
  const e2 = createLineEdge(repo, v0[2]!, v0[3]!) // bottom-front
  const e3 = createLineEdge(repo, v0[3]!, v0[0]!) // bottom-left

  // Top face edges
  const e4 = createLineEdge(repo, v0[4]!, v0[5]!) // top-back
  const e5 = createLineEdge(repo, v0[5]!, v0[6]!) // top-right
  const e6 = createLineEdge(repo, v0[6]!, v0[7]!) // top-front
  const e7 = createLineEdge(repo, v0[7]!, v0[4]!) // top-left

  // Vertical edges
  const e8 = createLineEdge(repo, v0[0]!, v0[4]!) // back-left
  const e9 = createLineEdge(repo, v0[1]!, v0[5]!) // back-right
  const e10 = createLineEdge(repo, v0[2]!, v0[6]!) // front-right
  const e11 = createLineEdge(repo, v0[3]!, v0[7]!) // front-left

  // Create 6 faces of the cube
  // Bottom face (normal pointing down: 0, 0, -1)
  const bottomFace = createPlanarFace(
    repo,
    [e0, e1, e2, e3],
    [cx, cy, cz - hd],
    [0, 0, -1],
    [1, 0, 0],
  )

  // Top face (normal pointing up: 0, 0, 1)
  const topFace = createPlanarFace(
    repo,
    [e4, e5, e6, e7],
    [cx, cy, cz + hd],
    [0, 0, 1],
    [1, 0, 0],
  )

  // Back face (normal pointing back: 0, -1, 0)
  const backFace = createPlanarFace(
    repo,
    [e0, e9, e4, e8],
    [cx, cy - hh, cz],
    [0, -1, 0],
    [1, 0, 0],
  )

  // Front face (normal pointing forward: 0, 1, 0)
  const frontFace = createPlanarFace(
    repo,
    [e2, e11, e6, e10],
    [cx, cy + hh, cz],
    [0, 1, 0],
    [1, 0, 0],
  )

  // Left face (normal pointing left: -1, 0, 0)
  const leftFace = createPlanarFace(
    repo,
    [e3, e8, e7, e11],
    [cx - hw, cy, cz],
    [-1, 0, 0],
    [0, 1, 0],
  )

  // Right face (normal pointing right: 1, 0, 0)
  const rightFace = createPlanarFace(
    repo,
    [e1, e10, e5, e9],
    [cx + hw, cy, cz],
    [1, 0, 0],
    [0, 1, 0],
  )

  // Create closed shell and solid
  const shell = repo.add(
    new ClosedShell("", [
      bottomFace,
      topFace,
      backFace,
      frontFace,
      leftFace,
      rightFace,
    ]),
  )
  const solid = repo.add(new ManifoldSolidBrep("cube", shell))

  // Create geometric context using Unknown entity for complex multi-inheritance
  // This follows the pattern from stepts test examples
  const lengthUnit = repo.add(
    new Unknown("", [
      "( LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT(.MILLI.,.METRE.) )",
    ]),
  )
  const angleUnit = repo.add(
    new Unknown("", [
      "( NAMED_UNIT(*) PLANE_ANGLE_UNIT() SI_UNIT($,.RADIAN.) )",
    ]),
  )
  const solidAngleUnit = repo.add(
    new Unknown("", [
      "( NAMED_UNIT(*) SI_UNIT($,.STERADIAN.) SOLID_ANGLE_UNIT() )",
    ]),
  )
  const uncertainty = repo.add(
    new Unknown("", [
      `UNCERTAINTY_MEASURE_WITH_UNIT(LENGTH_MEASURE(1.0E-5),${lengthUnit},'distance_accuracy_value','confusion accuracy')`,
    ]),
  )
  const geomContext = repo.add(
    new Unknown("", [
      `( GEOMETRIC_REPRESENTATION_CONTEXT(3) GLOBAL_UNCERTAINTY_ASSIGNED_CONTEXT((${uncertainty})) GLOBAL_UNIT_ASSIGNED_CONTEXT((${lengthUnit},${angleUnit},${solidAngleUnit})) REPRESENTATION_CONTEXT('cube','3D') )`,
    ]),
  )

  // Create shape representation
  const shapeRep = repo.add(
    new AdvancedBrepShapeRepresentation("cube", [solid], geomContext),
  )

  // Create product structure
  const appContext = repo.add(
    new ApplicationContext("core data for automotive mechanical design"),
  )
  const productContext = repo.add(
    new ProductContext("", appContext, "mechanical"),
  )
  const product = repo.add(new Product("cube", "cube", "", [productContext]))
  const productDefFormation = repo.add(
    new ProductDefinitionFormation("", "", product),
  )
  const productDefContext = repo.add(
    new ProductDefinitionContext("part definition", appContext, "design"),
  )
  const productDef = repo.add(
    new ProductDefinition("design", "", productDefFormation, productDefContext),
  )
  const productDefShape = repo.add(
    new ProductDefinitionShape("", "", productDef),
  )

  repo.add(new ShapeDefinitionRepresentation(productDefShape, shapeRep))

  // Export to STEP format
  return repo.toPartFile({
    name: "cube",
    author: "jscad-to-step",
    org: "tscircuit",
  })
}
