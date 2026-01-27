import { create } from 'zustand';
import { GraphMode, GraphStateActions, GraphStateData, GraphFilters, PlaybackMode } from "@shared/businessKnowledgeGraphTypes";

type GraphStore = GraphStateData & GraphStateActions;

const initialState: GraphStateData = {
  mode: 'macro',
  expandedTypes: [],
  focusedInstanceId: undefined,
  selectedInstanceId: undefined,
  filters: undefined,
  hoveredEventId: undefined,
  isFilterDrawerOpen: false,
  activeFilterType: undefined,
  lastMode: undefined,
  hoveredInstanceId: undefined,
  showLabels: true,
  zoomLevel: 1.0,
};

export const useGraphStore = create<GraphStore>((set, get) => ({
  ...initialState,

  toggleShowLabels: () => set({ showLabels: !get().showLabels }),
  
  setZoomLevel: (zoom: number) => set({ zoomLevel: zoom }),

  setMode: (mode: GraphMode) => {
    // Before switching, capture the current mode if we are entering Focus mode
    // If we are exiting Focus mode, lastMode is consumed (or reset)
    const currentMode = get().mode;
    let nextLastMode = get().lastMode;

    if (mode === 'focus' && currentMode !== 'focus') {
        nextLastMode = currentMode;
    } else if (mode !== 'focus') {
        // Optional: clear lastMode when not in focus, or keep it as history?
        // User logic: "setMode(lastMode || 'mesh')" implies consumption.
        // We can keep it or clear it. Let's keep it simple.
    }

    // Mode 切换 = 清空当前图数据 + 重新构建
    // 重置所有与特定 Mode 相关的状态
    set({
      mode,
      lastMode: nextLastMode,
      expandedTypes: [],
      focusedInstanceId: mode === 'focus' ? get().focusedInstanceId : undefined,
      selectedInstanceId: mode === 'focus' ? get().focusedInstanceId : undefined, // Initialize selection to focus center
      hoveredEventId: undefined,
      isFilterDrawerOpen: false,
      activeFilterType: undefined,
    });
    console.log(`[GraphStore] Mode switched to: ${mode}. Graph state reset. LastMode: ${nextLastMode}`);
  },

  setExpandedTypes: (types: string[]) => {
    const { mode, expandedTypes } = get();
    // if (mode !== 'macro') {
    //   console.warn(`[GraphStore] setExpandedTypes ignored. Current mode is ${mode}, expected 'macro'.`);
    //   return;
    // }
    
    // Logic: Max 2 containers. If adding a 3rd, collapse the earliest one.
    
    let nextExpandedTypes = [...types];
    if (nextExpandedTypes.length > 2) {
       // Keep the last 2 (newest)
       nextExpandedTypes = nextExpandedTypes.slice(-2);
    }
    
    set({ expandedTypes: nextExpandedTypes });
  },

  // Helper action for easier interaction
  toggleTypeExpansion: (typeId: string) => {
      const { expandedTypes, setExpandedTypes } = get();
      if (expandedTypes.includes(typeId)) {
          setExpandedTypes(expandedTypes.filter(id => id !== typeId));
      } else {
          setExpandedTypes([...expandedTypes, typeId]);
      }
  },

  setFocusedInstanceId: (id: string | undefined) => {
    // Allow setting ID before mode switch or during
    set({ focusedInstanceId: id, selectedInstanceId: id });
  },

  setSelectedInstanceId: (id: string | undefined) => {
    set({ selectedInstanceId: id });
  },

  setHoveredInstanceId: (id: string | undefined) => {
    set({ hoveredInstanceId: id });
  },

  setFilters: (filters: GraphFilters | undefined) => {
    set({ filters });
  },

  setHoveredEventId: (id: string | undefined) => {
    set({ hoveredEventId: id });
  },

  setFilterDrawerOpen: (isOpen: boolean) => {
      set({ isFilterDrawerOpen: isOpen });
  },

  setActiveFilterType: (typeId: string | undefined) => {
      set({ activeFilterType: typeId });
  },
  
  resetGraph: () => set(initialState),
}));
