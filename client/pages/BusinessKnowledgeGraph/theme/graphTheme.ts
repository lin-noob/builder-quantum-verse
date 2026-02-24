export const GraphTheme = {
  colors: {
    // Low saturation, high brightness, no pure RGB
    status: {
      Active: '#34d399', // emerald-400: Quiet, healthy
      Stuck: '#fbbf24',  // amber-400: Warning but not shouting
      Failed: '#f87171', // red-400: Problem but soft
      Done: '#94a3b8',   // slate-400: Neutral, finished
    },
    types: {
      type1: '#60a5fa', // blue-400
      type2: '#a78bfa', // violet-400
      type3: '#f472b6', // pink-400
      type4: '#fb923c', // orange-400
      type5: '#2dd4bf', // teal-400
    },
    text: {
      label: '#475569', // slate-600
      labelLight: '#94a3b8', // slate-400
    },
    node: {
      border: 'rgba(255, 255, 255, 0.6)', // 1px faint
      focusBorder: 'rgba(255, 255, 255, 0.9)',
      glow: {
        active: 'rgba(52, 211, 153, 0.2)',
        stuck: 'rgba(251, 191, 36, 0.4)',
        failed: 'rgba(248, 113, 113, 0.5)',
      }
    },
    edge: {
      default: '#64748b', // slate-500, darker for contrast
      label: '#475569',   // slate-600, darker
      arrow: '#64748b',
    },
    canvas: {
      bg: '#f8fafc', // slate-50: Very light cool grey
      grid: '#e2e8f0', // slate-200: Low contrast
    }
  },
  sizes: {
    macro: {
      instance: 6, // Tiny dot
      objectBase: 60,
      objectFactor: 10,
      groupMin: 400,
    },
    mesh: {
      instance: 14, // Visible presence
    },
    focus: {
      instance: 40, // Subject
      center: 50, // Center node +15% roughly
      halo: -8, 
    },
    edge: {
      width: {
        default: 2, // Thicker
        hover: 3,
        focus: 4,
      },
      arrow: 6, // Larger arrow
    }
  },
  opacity: {
    edge: {
      default: 0.5, // Much more visible
      hover: 0.8,
      focus: 1.0,
      dimmed: 0.1,
    },
    node: {
      dimmed: 0.2,
    }
  },
  animation: {
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', // Smooth, not bouncy
  }
};
