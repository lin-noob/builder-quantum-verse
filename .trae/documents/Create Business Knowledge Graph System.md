# Implementation Plan: Business Knowledge Graph System

I will build a completely new, isolated frontend system for the "Business Knowledge Graph" as requested, ensuring no reuse of existing components.

## 1. Directory Structure & Scaffolding
Create the following structure under `client/`:
- `client/pages/BusinessKnowledgeGraph.tsx`: The main entry page.
- `client/components/BusinessGraph/`: Core directory.
  - `types.ts`: Domain models (`ObjectType`, `Instance`, `Relation`) and Graph types.
  - `graphTheme.ts`: Centralized visual constants (colors, sizes, z-indices).
  - `GraphBuilder.ts`: The pure logic engine for `buildGraph`.
  - `BusinessGraphCanvas.tsx`: The wrapper around React Flow.
  - `nodes/`:
    - `ObjectTypeNode.tsx`: Collapsed type node.
    - `TypeGroupNode.tsx`: Expanded container node.
    - `MacroInstanceNode.tsx`: Instance dot within groups.
    - `MeshInstanceNode.tsx`: Instance node in Mesh mode.
    - `FocusInstanceNode.tsx`: Central node in Focus mode.
  - `edges/`:
    - `MeshRelationEdge.tsx`: Edges for Mesh mode.
    - `FocusRelationEdge.tsx`: Edges for Focus mode.
  - `controls/`:
    - `GraphModeSwitcher.tsx`: For toggling modes (Macro/Mesh).
    - `TemporalControls.tsx`: Timeline slider for Focus mode.

## 2. Core Data Modeling (`types.ts`)
Define the strict interfaces:
- `ObjectType`: id, name, color.
- `Instance`: id, typeId, status (Active/Stuck/Failed/Done).
- `Relation`: source, target, type.
- `GraphMode`: 'macro' | 'mesh' | 'focus'.

## 3. The Graph Builder Engine (`GraphBuilder.ts`)
Implement the `buildGraph` function as the **single source of truth** for node/edge generation.
- **Macro Mode Logic**:
  - Filter instances.
  - Generate `ObjectTypeNode` for collapsed types.
  - Generate `TypeGroupNode` for expanded types.
  - Generate `MacroInstanceNode` as **children** of GroupNodes (using React Flow `parentId`).
  - Layout: Circle packing or Grid for groups. Spiral layout for instances within groups.
  - **No edges** generated.
- **Mesh Mode Logic**:
  - Flatten all instances to `MeshInstanceNode`.
  - Generate `MeshRelationEdge` for all relations.
  - **Layout**: Integrate `d3-force` to calculate initial positions or run a simulation.
- **Focus Mode Logic**:
  - Filter for `focusedInstanceId` + 1-hop neighbors.
  - Generate `FocusInstanceNode` (center) and `MeshInstanceNode` (neighbors).
  - Generate `FocusRelationEdge`.
  - Layout: Radial/Ego-centric.

## 4. Component Implementation
- **Visuals**: Use `graphTheme.ts` for all styling (no hardcoded values).
- **Macro Nodes**:
  - `TypeGroupNode`: Dashed border, translucent bg, "Header" with stats.
  - `MacroInstanceNode`: Small dots, color-coded by status.
- **Mesh Nodes**:
  - `MeshInstanceNode`: Larger, shadow, force-directed.
- **Interaction**:
  - Click ObjectType -> Toggle expansion (trigger rebuild).
  - Click Instance -> Switch to Focus Mode (trigger rebuild).

## 5. Page Integration
- Register `/business-knowledge-graph` in `client/App.tsx`.
- Create a layout that holds the `BusinessGraphCanvas`.
- Manage global state (`currentMode`, `expandedTypes`, `focusedId`) in the page component.

## 6. Verification
- Verify "Single Canvas" rule: Ensure only one `<ReactFlow>` renders.
- Verify Mode Isolation: Check that Macro mode has zero edges and Mesh mode has no groups.
- Verify Transitions: Ensure switching modes clears and regenerates the graph.

I will start by creating the directory structure and core type definitions.