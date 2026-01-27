import React, { useState } from 'react';
import { BaseEdge, EdgeProps, getStraightPath, EdgeLabelRenderer } from '@xyflow/react';
import { GraphTheme } from '../../theme/graphTheme';

export function MeshEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  selected,
  markerEnd,
}: EdgeProps) {
  const [isHovered, setIsHovered] = useState(false);

  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      {/* Invisible interaction path for easier hovering */}
      <path
        d={edgePath}
        strokeWidth={20}
        stroke="transparent"
        fill="none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ cursor: 'pointer' }}
      />
      
      {/* Visible Edge */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
            strokeWidth: isHovered || selected ? GraphTheme.sizes.edge.width.hover : GraphTheme.sizes.edge.width.default,
            stroke: GraphTheme.colors.edge.default,
            opacity: isHovered || selected ? GraphTheme.opacity.edge.hover : GraphTheme.opacity.edge.default,
            transition: GraphTheme.animation.transition,
        }}
        markerEnd={isHovered || selected ? markerEnd : undefined}
      />
    </>
  );
}
