import React from 'react';
import { BaseEdge, EdgeProps, getBezierPath, EdgeLabelRenderer } from '@xyflow/react';
import { GraphTheme } from '../../theme/graphTheme';
import { useGraphStore } from '../../store/useGraphStore';

export function MeshFlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  source,
  target,
  label,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const hoveredInstanceId = useGraphStore(state => state.hoveredInstanceId);
  const zoomLevel = useGraphStore(state => state.zoomLevel);
  
  const isHovered = hoveredInstanceId && (source === hoveredInstanceId || target === hoveredInstanceId);
  const isDimmed = hoveredInstanceId && !isHovered;

  const isCrossDomain = data?.isCrossDomain === true;

  const isCritical = data?.isCritical === true;
  const isActive = data?.isActive === true;

  const priority: 'critical' | 'active' | 'normal' = data?.priority || (isCritical ? 'critical' : isActive ? 'active' : 'normal');

  const baseColor = priority === 'critical'
    ? GraphTheme.colors.status.Failed
    : priority === 'active'
    ? GraphTheme.colors.status.Active
    : (style.stroke as string || GraphTheme.colors.edge.default);

  let visibleByZoom = true;
  if (zoomLevel < 0.4) {
    visibleByZoom = priority === 'critical';
  } else if (zoomLevel < 0.8) {
    visibleByZoom = priority === 'critical' || priority === 'active';
  }

  if (!visibleByZoom) {
    return null;
  }
  
  let opacity = GraphTheme.opacity.edge.default;
  let width = GraphTheme.sizes.edge.width.default;

  if (priority === 'critical') {
    opacity = 1;
    width = GraphTheme.sizes.edge.width.hover;
  } else if (priority === 'active') {
    opacity = 0.8;
    width = GraphTheme.sizes.edge.width.default;
  } else {
    opacity = 0.3;
    width = GraphTheme.sizes.edge.width.default;
  }

  if (isCrossDomain && !isHovered && !isCritical) {
      opacity *= 0.5;
  }

  if (isHovered) {
      opacity = 1;
      width = GraphTheme.sizes.edge.width.hover;
  } else if (isDimmed) {
      opacity *= 0.1;
  }

  const showLabel = label && !isDimmed;

  return (
    <>
      {/* Halo/Background Stroke to handle intersections */}
      <BaseEdge
        id={`${id}-halo`}
        path={edgePath}
        style={{
            ...style,
            stroke: GraphTheme.colors.canvas.bg, // Match background color
            strokeWidth: width + 2, // Slightly wider than the main stroke
            strokeOpacity: opacity > 0 ? 1 : 0, // Solid background when visible
            transition: 'all 0.3s ease-out',
        }}
      />

      <BaseEdge
        id={id}
        path={edgePath}
        style={{
            ...style,
            stroke: baseColor,
            strokeOpacity: opacity,
            strokeWidth: width,
            transition: 'all 0.3s ease-out',
            filter: isHovered ? 'drop-shadow(0 0 3px rgba(100, 116, 139, 0.5))' : undefined, // Subtle glow on hover
        }}
        markerEnd={markerEnd}
      />

      {/* Inline Action Text */}
      {showLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'none',
              fontSize: '10px',
              color: GraphTheme.colors.edge.label,
              opacity: isHovered ? 1 : 0.7, // Slightly simpler when not hovered
              fontFamily: 'sans-serif',
              whiteSpace: 'nowrap',
              zIndex: 10,
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}

      {/* Optional: Critical Pulse for Mesh Mode (Subtle) */}
      {isCritical && !isDimmed && (
         <path
            d={edgePath}
            fill="none"
            stroke={GraphTheme.colors.status.Failed}
            strokeWidth={width}
            strokeDasharray="4 4"
            className="animate-flow-slow" 
            style={{
                opacity: 0.4,
                pointerEvents: 'none',
            }}
        />
      )}
    </>
  );
}
