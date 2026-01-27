# Business Knowledge Graph Visual System

## Overview
The Business Knowledge Graph uses a strictly defined visual system to convey business semantics (Existence, Relationship, Hierarchy) rather than engineering details (Flowcharts, Diagrams).

## Visual Rules

### 1. Nodes (Business Objects)
- **Shape**: Always Circular.
- **Color**: Defined by Status (Active=Emerald, Stuck=Amber, Failed=Red, Done=Slate).
- **Glow**: Status is indicated by a faint outer glow, not by badges or heavy borders.
- **Sizes**:
  - **Macro Mode**: Tiny dots (6px) or Large Type Containers.
  - **Mesh Mode**: Visible presence (14px).
  - **Focus Mode**: Prominent subject (40px + Halo).

### 2. Edges (Relationships)
- **Style**: Ultra-thin (1px), Bezier curves.
- **Visibility**: High transparency (opacity 0.15) by default to reduce clutter.
- **Action Text**: Inline, mid-edge, tiny text (10px), low contrast.
- **Interaction**: Hovering a node highlights only connected edges.

### 3. Labels & Text
- **Visibility**: Controlled globally via the "Labels" toggle (Eye icon) AND Zoom Level (LOD).
- **Position**: Always external (below the node) to preserve the pure circular shape of the object.
- **Style**: Slate-600, small font, optional text shadow for contrast.

### 4. Mesh Mode Interaction (High Density Optimization)
- **LOD (Level of Detail)**:
  - **Zoom < 40%**: Simplified rendering (small dots, no borders/shadows/labels).
  - **Zoom > 40%**: Full detail rendering (borders, shadows).
  - **Zoom > 80%**: Labels appear (if toggle is enabled) AND connections become visible (Detail View).
- **Magic Lens (Hover)**: Edges are **hidden by default**. Hovering a node acts as a "flashlight," revealing only its connected edges.
- **Navigation**:
  - **Double Click**: Enter **Focus Mode** for the selected node.
  - **Single Click**: Selection / Highlight only.

## Configuration

### Theme (`graphTheme.ts`)
All visual parameters (colors, sizes, opacities, animations) are centralized here.
**Do not hardcode values in components.**

### Store (`useGraphStore.ts`)
Manages the graph state, including:
- `mode`: 'macro' | 'mesh' | 'focus'
- `showLabels`: boolean (Global toggle)
- `hoveredInstanceId`: For highlighting connections

## Component Structure
- `MeshInstanceNode`: The standard representation in the global mesh.
- `MacroObjectNode`: Represents an aggregated Object Type (e.g., "Customer").
- `MacroGroupNode`: A container for instances in Macro Mode.
- `FocusInstanceNode`: The central subject in Focus Mode.

## Development Guidelines
- **Adding a new status**: Update `GraphTheme.colors.status` and `MeshInstanceNode` logic.
- **Adjusting sizes**: Update `GraphTheme.sizes`.
- **New Interactions**: Use `useGraphStore` actions.
