I will implement the optimized interaction scheme for Mesh Mode with 10,000+ nodes, focusing on Level of Detail (LOD), Drill-down interaction, and Performance.

### 1. State Management & Events (`useGraphStore.ts`)
- **Add `zoomLevel`**: Track the current zoom level in the global store to drive LOD rendering.
- **Add `hoveredNodeId`**: Ensure this state is available to drive the "Magic Lens" effect (highlighting connections on hover).

### 2. Interaction & Performance Optimization (`GraphCanvas.tsx`)
- **LOD Control**: Implement `onMoveEnd` listener to update `zoomLevel` (avoiding updates during active zooming for performance).
- **Drill-down Interaction**:
    - Implement `onNodeDoubleClick` to handle the transition to **Focus Mode**.
    - Replace the current single-click behavior (which currently triggers Focus Mode) with a selection/highlight action.
- **"Magic Lens" Edge Rendering**:
    - In **Mesh Mode**, set all edges to `hidden: true` (or extremely low opacity) by default to reduce rendering overhead.
    - Dynamically show/highlight edges **only** when they are connected to the `hoveredNodeId`. This dramatically reduces visual clutter and rendering cost.

### 3. Node Optimization (`MeshInstanceNode.tsx`)
- **LOD Rendering**:
    - **Zoom < 0.4**: Render simplified nodes (small dots), hide labels, disable shadows.
    - **Zoom >= 0.4**: Render full node details.
    - **Label Logic**: Only show labels when `zoom > 0.8` AND global `showLabels` is true.
- **Event Handling**: Remove the internal `onClick` handler that forced Focus Mode; allow the Canvas to handle double-clicks.

### 4. Documentation (`README.md`)
- Update the **Interaction Guide** section to explain the new LOD behavior, Double-click navigation, and Hover-to-reveal connections mechanic.

### Verification Plan
- **Performance**: Verify that panning/zooming is smooth with mocked large datasets.
- **Interaction**: Confirm double-click enters Focus Mode, and single-click does not.
- **LOD**: Confirm labels/details appear/disappear at correct zoom thresholds.
- **Magic Lens**: Confirm edges are hidden by default and appear on node hover.