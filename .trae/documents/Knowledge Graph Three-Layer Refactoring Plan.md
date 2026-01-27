# Knowledge Graph System Refactoring Plan

Based on the "Three-Layer Graph" design philosophy, I propose the following refactoring plan to transform the current Knowledge Explorer.

## 1. Architecture & View Layering

We will restructure the `ExplorerPage` to strictly follow the Macro -> Index -> Focus/Temporal flow.

### A. Macro View (World View)
*   **Target**: Refactor current "Instance Explorer" into "Macro View".
*   **Component**: Update `InstanceSummaryCard.tsx`.
*   **Changes**:
    *   **Visuals**: Ensure "State Distribution" and "Core Relationship Count" are prominent.
    *   **Interaction**: Clicking the card triggers the "Index View" (Expansion).

### B. Index View (Instance Aggregation)
*   **Target**: The "Expanded" state of the Macro View.
*   **New Component**: Create `InstanceIndexGraph.tsx` (replacing or augmenting `InstanceList.tsx`).
*   **Features**:
    *   **Visualization**: Displays instances as nodes using AntV G6.
    *   **Aggregation**: If instance count > 50, cluster nodes into "Aggregate Nodes" to prevent visual explosion.
    *   **Filtering**: Add embedded controls for Status, Time, and Attributes directly in the expanded area.
    *   **Navigation**: Click Node -> Jump to Focus View (Instance Detail).

### C. Focus View & Temporal View (Runtime)
*   **Target**: The Instance Detail / Single Instance Graph.
*   **Component**: Enhance `InstanceGraph.tsx`.
*   **Features**:
    *   **Ego Graph**: Ensure default 1-2 hop expansion (already present).
    *   **Temporal Control**: Add a "Time Slider" / "Playback Bar" at the bottom of the graph.
    *   **State Visualization**: Add "State Badges" (e.g., Paid, Shipped) directly onto G6 Node shapes.
    *   **Path Replay**: Highlight edges/paths based on the selected time point.

## 2. Detailed Implementation Steps

### Step 1: Create `InstanceIndexGraph` Component
*   **Tech**: AntV G6.
*   **Logic**:
    *   Fetch instances by `typeId`.
    *   Render nodes with color-coding based on status.
    *   Implement "Force Atlas" layout for natural clustering.
    *   Add `Zoom/Pan` and `Filter` controls.

### Step 2: Update `InstanceSummaryCard`
*   Integrate `InstanceIndexGraph` into the `expanded` section.
*   Add a toggle: `[ Graph View ] | [ List View ]` (preserving the old list view for data density).
*   Pass filter states (Search, Status) down to the graph.

### Step 3: Enhance `InstanceGraph` (Focus/Temporal)
*   **Time Machine**:
    *   Add a `timeline` state (0 to 100%).
    *   Filter `edges` and `events` based on the timeline.
    *   Dim future nodes/edges.
*   **Visuals**:
    *   Update `generateGraphData` to include `state` field in node data.
    *   Use G6 `badges` or custom node shapes to show status icons.

### Step 4: Refactor `ExplorerPage` (Entry Point)
*   **Search**:
    *   Enhance "Instance ID Search" to be the primary "Positioning" tool.
    *   On search hit: Open a "Preview Dialog" or direct navigation to `InstanceIndexGraph` with that node highlighted.
*   **Layout**:
    *   Rename tabs to "Schema View" (Definition) and "World View" (Runtime).

## 3. Technology Stack
*   **Visualization**: AntV G6 (for both Index and Focus graphs).
*   **UI/Layout**: React, TailwindCSS, Framer Motion.
*   **State**: Local React State (lifting up filters where needed).

## 4. Verification
*   **Macro**: Verify cards show correct aggregation stats.
*   **Index**: Verify expanding a card loads the graph and filters work.
*   **Focus**: Verify searching an ID jumps to the graph.
*   **Temporal**: Verify sliding the timeline updates the graph structure/colors.
