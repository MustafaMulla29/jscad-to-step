import { test, expect } from "bun:test"
import { jscadPlanner } from "jscad-planner"
import type { CubeOperation } from "jscad-planner"
import { convertCubeToStep } from "../../lib/converters/cube-converter"

test("convertCubeToStep - converts default cube (size=2)", () => {
  const cube = jscadPlanner.primitives.cube() as CubeOperation
  const stepData = convertCubeToStep(cube)

  // Verify STEP file structure
  expect(stepData).toContain("ISO-10303-21")
  expect(stepData).toContain("MANIFOLD_SOLID_BREP")
  expect(stepData).toContain("CLOSED_SHELL")
  expect(stepData).toContain("ADVANCED_FACE")
  expect(stepData).toContain("VERTEX_POINT")
  expect(stepData).toContain("EDGE_CURVE")
  expect(stepData).toContain("END-ISO-10303-21")
})

test("convertCubeToStep - converts cube with specific size", () => {
  const cube = jscadPlanner.primitives.cube({ size: 10 }) as CubeOperation
  const stepData = convertCubeToStep(cube)

  // Should contain vertices at appropriate positions
  // For a 10x10x10 cube centered at origin, vertices should be at ±5
  expect(stepData).toContain("CARTESIAN_POINT")
  expect(stepData).toContain("ISO-10303-21")
  expect(stepData).toContain("MANIFOLD_SOLID_BREP")
})

test("convertCubeToStep - converts cube with array size", () => {
  const cube = jscadPlanner.primitives.cube({
    size: [5, 10, 15],
  }) as CubeOperation
  const stepData = convertCubeToStep(cube)

  expect(stepData).toContain("ISO-10303-21")
  expect(stepData).toContain("MANIFOLD_SOLID_BREP")
  expect(stepData).toContain("END-ISO-10303-21")
})

test("convertCubeToStep - converts cube with custom center", () => {
  const cube = jscadPlanner.primitives.cube({
    size: 10,
    center: [10, 20, 30],
  }) as CubeOperation
  const stepData = convertCubeToStep(cube)

  expect(stepData).toContain("ISO-10303-21")
  expect(stepData).toContain("MANIFOLD_SOLID_BREP")
  // Vertices should be offset from origin
  expect(stepData).toContain("CARTESIAN_POINT")
})

test("convertCubeToStep - produces valid STEP with product structure", () => {
  const cube = jscadPlanner.primitives.cube({ size: 10 }) as CubeOperation
  const stepData = convertCubeToStep(cube)

  // Verify product structure entities
  expect(stepData).toContain("PRODUCT")
  expect(stepData).toContain("PRODUCT_DEFINITION")
  expect(stepData).toContain("PRODUCT_DEFINITION_SHAPE")
  expect(stepData).toContain("SHAPE_DEFINITION_REPRESENTATION")
  expect(stepData).toContain("ADVANCED_BREP_SHAPE_REPRESENTATION")
})

test("convertCubeToStep - creates 6 faces for cube", () => {
  const cube = jscadPlanner.primitives.cube({ size: 10 }) as CubeOperation
  const stepData = convertCubeToStep(cube)

  // Count ADVANCED_FACE occurrences (should be 6 for a cube)
  const faceCount = (stepData.match(/ADVANCED_FACE/g) || []).length
  expect(faceCount).toBe(6)
})
