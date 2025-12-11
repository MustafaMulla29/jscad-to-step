import { test, expect } from "bun:test"
import { Repository } from "stepts"
import { createVertex, createVertices } from "../../lib/step-builder/vertices"

test("createVertex - creates a vertex at specified coordinates", () => {
  const repo = new Repository()

  const vertex = createVertex(repo, 5, 10, 15)

  // Verify vertex was created
  expect(vertex).toBeDefined()

  // Resolve and check the coordinates
  const vertexPoint = vertex.resolve(repo)
  expect(vertexPoint).toBeDefined()
  expect(vertexPoint?.type).toBe("VERTEX_POINT")

  const cartesianPoint = vertexPoint?.pnt.resolve(repo)
  expect(cartesianPoint).toBeDefined()
  expect(cartesianPoint?.x).toBe(5)
  expect(cartesianPoint?.y).toBe(10)
  expect(cartesianPoint?.z).toBe(15)
})

test("createVertex - creates vertex at origin", () => {
  const repo = new Repository()

  const vertex = createVertex(repo, 0, 0, 0)

  const vertexPoint = vertex.resolve(repo)
  const cartesianPoint = vertexPoint?.pnt.resolve(repo)

  expect(cartesianPoint?.x).toBe(0)
  expect(cartesianPoint?.y).toBe(0)
  expect(cartesianPoint?.z).toBe(0)
})

test("createVertices - creates multiple vertices from coordinate array", () => {
  const repo = new Repository()

  const coordinates: Array<[number, number, number]> = [
    [0, 0, 0],
    [10, 0, 0],
    [10, 10, 0],
    [0, 10, 0],
  ]

  const vertices = createVertices(repo, coordinates)

  expect(vertices).toHaveLength(4)

  // Check first vertex
  const firstPoint = vertices[0]!.resolve(repo)?.pnt.resolve(repo)
  expect(firstPoint?.x).toBe(0)
  expect(firstPoint?.y).toBe(0)
  expect(firstPoint?.z).toBe(0)

  // Check last vertex
  const lastPoint = vertices[3]!.resolve(repo)?.pnt.resolve(repo)
  expect(lastPoint?.x).toBe(0)
  expect(lastPoint?.y).toBe(10)
  expect(lastPoint?.z).toBe(0)
})

test("createVertices - handles negative coordinates", () => {
  const repo = new Repository()

  const coordinates: Array<[number, number, number]> = [
    [-5, -10, -15],
    [5, 10, 15],
  ]

  const vertices = createVertices(repo, coordinates)

  const firstPoint = vertices[0]!.resolve(repo)?.pnt.resolve(repo)
  expect(firstPoint?.x).toBe(-5)
  expect(firstPoint?.y).toBe(-10)
  expect(firstPoint?.z).toBe(-15)

  const secondPoint = vertices[1]!.resolve(repo)?.pnt.resolve(repo)
  expect(secondPoint?.x).toBe(5)
  expect(secondPoint?.y).toBe(10)
  expect(secondPoint?.z).toBe(15)
})

test("vertices can be exported to STEP format", () => {
  const repo = new Repository()

  createVertex(repo, 1, 2, 3)

  const stepText = repo.toPartFile({ name: "test-vertex" })

  // Verify STEP file structure
  expect(stepText).toContain("ISO-10303-21")
  expect(stepText).toContain("CARTESIAN_POINT")
  expect(stepText).toContain("VERTEX_POINT")
  expect(stepText).toContain("END-ISO-10303-21")
})
