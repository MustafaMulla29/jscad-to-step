# JSCAD to STEP Implementation Plan

## Current Status
✅ Test infrastructure working (cube.test.ts passing)
✅ Dependencies installed (jscad-planner, stepts, occt-import-js, poppygl)
✅ Snapshot testing with PNG comparison working
🔨 `lib/index.ts` has hardcoded STEP cube stub

## Goal
Implement `jscadToStep()` function to convert jscad-planner operations to actual STEP files.

---

## Phase 1: Foundation (Steps 1-3)

### Step 1: Create STEP Entity Helper Functions ⏳
**Goal**: Create utility functions to build STEP entities using stepts library

**Files to create**:
- `lib/step-builder/vertices.ts` - Create vertices from coordinates
- `lib/step-builder/edges.ts` - Create edges (lines, circles)
- `lib/step-builder/faces.ts` - Create faces with surface geometry

**Example**:
```typescript
// lib/step-builder/vertices.ts
import { Repository, CartesianPoint, VertexPoint } from "stepts"

export function createVertex(repo: Repository, x: number, y: number, z: number) {
  const point = repo.add(new CartesianPoint("", x, y, z))
  return repo.add(new VertexPoint("", point))
}
```

**Test**: Create `tests/step-builder/vertices.test.ts` to verify vertex creation

---

### Step 2: Implement Cube Converter ⏳
**Goal**: Convert jscad-planner cube operation to STEP

**Files to create/modify**:
- `lib/converters/cube-converter.ts` - Convert cube operation to STEP entities
- Modify `lib/index.ts` to use cube converter

**Key Logic**:
1. Parse cube parameters (size, center)
2. Calculate 8 corner vertices
3. Create 12 edges (lines connecting vertices)
4. Create 6 faces (one per side, using planes)
5. Combine into closed shell
6. Create solid BREP
7. Add product structure
8. Export using `repo.toPartFile()`

**Test**: Verify `tests/cube.test.ts` still passes with real conversion

---

### Step 3: Add Basic Validation ⏳
**Goal**: Ensure generated STEP files are valid

**Files to create**:
- `lib/validation/validate-step.ts` - Validate STEP output

**Implementation**:
```typescript
import { readStepFile } from "occt-import-js"

export async function validateStep(stepData: string): Promise<boolean> {
  try {
    const buffer = Buffer.from(stepData)
    const result = await readStepFile(buffer)
    return result.success && result.meshes.length > 0
  } catch {
    return false
  }
}
```

**Test**: Add validation check to cube test

---

## Phase 2: More Primitives (Steps 4-6)

### Step 4: Implement Sphere Converter ⏳
**Goal**: Convert sphere operations to STEP

**Challenges**: Spheres require complex curved surfaces
**Approach**: Tessellate sphere into triangular faces or use spherical surface entity

**Files**:
- `lib/converters/sphere-converter.ts`
- `tests/sphere.test.ts`

---

### Step 5: Implement Cylinder Converter ⏳
**Goal**: Convert cylinder operations to STEP

**Key Elements**:
- Use `CylindricalSurface` for curved sides
- Use `Circle` entities for top/bottom edges
- Create planar faces for top/bottom

**Files**:
- `lib/converters/cylinder-converter.ts`
- `tests/cylinder.test.ts`

---

### Step 6: Implement Cuboid Converter ⏳
**Goal**: Convert cuboid (rectangular box) to STEP

**Similar to cube but**:
- Different width/height/depth
- Calculate vertices based on size array [width, height, depth]

**Files**:
- `lib/converters/cuboid-converter.ts`
- `tests/cuboid.test.ts`

---

## Phase 3: Transformations (Steps 7-9)

### Step 7: Implement Translation ⏳
**Goal**: Handle translate operations

**Key Logic**:
- Detect translate wrapper around shapes
- Apply offset to all vertex coordinates
- Example: `translate([10, 0, 0], cube)`

**Files**:
- `lib/converters/transformations.ts`
- `tests/translate.test.ts`

---

### Step 8: Implement Rotation ⏳
**Goal**: Handle rotate operations

**Key Logic**:
- Apply rotation matrix to vertices
- Update direction vectors for geometry

**Files**:
- Add to `lib/converters/transformations.ts`
- `tests/rotate.test.ts`

---

### Step 9: Implement Scale ⏳
**Goal**: Handle scale operations

**Key Logic**:
- Multiply vertex coordinates by scale factors
- Update geometric parameters (radii, etc.)

**Files**:
- Add to `lib/converters/transformations.ts`
- `tests/scale.test.ts`

---

## Phase 4: Boolean Operations (Steps 10-12)

### Step 10: Implement Union ⏳
**Goal**: Combine multiple shapes

**Approach**:
- Convert each shape to STEP
- Merge into single complex solid
- Challenge: May require mesh boolean operations or complex B-rep merging

**Files**:
- `lib/converters/boolean-operations.ts`
- `tests/union.test.ts`

---

### Step 11: Implement Subtract ⏳
**Goal**: Cut one shape from another

**Approach**:
- Generate both shapes
- Perform CSG subtraction
- Convert result to STEP B-rep

**Files**:
- Add to `lib/converters/boolean-operations.ts`
- `tests/subtract.test.ts`

---

### Step 12: Implement Intersect ⏳
**Goal**: Keep only overlapping volume

**Files**:
- Add to `lib/converters/boolean-operations.ts`
- `tests/intersect.test.ts`

---

## Phase 5: Extrusions (Steps 13-14)

### Step 13: Implement Linear Extrusion ⏳
**Goal**: Extrude 2D profiles into 3D

**Key Logic**:
1. Parse base 2D polygon/shape
2. Create top and bottom faces at different Z heights
3. Create side faces connecting edges

**Files**:
- `lib/converters/extrusion-converter.ts`
- `tests/extrude-linear.test.ts`

---

### Step 14: Implement Rotational Extrusion ⏳
**Goal**: Revolve 2D profile around axis

**Key Elements**:
- Use cylindrical or toroidal surfaces
- Handle angular segments

**Files**:
- Add to `lib/converters/extrusion-converter.ts`
- `tests/extrude-rotate.test.ts`

---

## Phase 6: Refinement (Steps 15-17)

### Step 15: Optimize STEP Output ⏳
**Goal**: Reduce file size and improve structure

**Tasks**:
- Reuse shared vertices/edges
- Minimize duplicate geometry
- Proper naming conventions

---

### Step 16: Add Error Handling ⏳
**Goal**: Graceful handling of unsupported operations

**Tasks**:
- Detect unsupported operations
- Return informative error messages
- Add fallback behaviors

---

### Step 17: Documentation & Examples ⏳
**Goal**: Document usage and API

**Tasks**:
- Update README.md with usage examples
- Add JSDoc comments
- Create example scripts

---

## Quick Reference: File Structure

```
jscad-to-step/
├── lib/
│   ├── index.ts (main entry point)
│   ├── step-builder/
│   │   ├── vertices.ts
│   │   ├── edges.ts
│   │   └── faces.ts
│   ├── converters/
│   │   ├── cube-converter.ts
│   │   ├── sphere-converter.ts
│   │   ├── cylinder-converter.ts
│   │   ├── cuboid-converter.ts
│   │   ├── transformations.ts
│   │   ├── boolean-operations.ts
│   │   └── extrusion-converter.ts
│   └── validation/
│       └── validate-step.ts
├── tests/
│   ├── cube.test.ts (existing)
│   ├── sphere.test.ts
│   ├── cylinder.test.ts
│   └── ... (more tests)
└── IMPLEMENTATION_PLAN.md (this file)
```

---

## Next Action

**Start with Step 1**: Create the step-builder utility functions for vertices.

Run this command when ready:
```bash
# Create the directory structure
mkdir -p lib/step-builder lib/converters lib/validation tests/step-builder
```

Then I'll help you implement Step 1!
