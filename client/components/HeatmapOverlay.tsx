import React from "react";

export interface HeatmapPoint {
  x: number;
  y: number;
  value: number;
}

interface HeatmapOverlayProps {
  points: HeatmapPoint[];
}

/**
 * 热力图覆盖层组件
 * 根据点的 value 值进行归一化处理，动态计算大小、透明度和颜色
 */
export default function HeatmapOverlay({ points }: HeatmapOverlayProps) {
  if (points.length === 0) return null;

  const maxValue = Math.max(...points.map((p) => p.value), 1);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {points.map((point, i) => {
        const normalized = point.value / maxValue;
        const size = 40 + normalized * 80;
        const opacity = 0.4 + normalized * 0.4;

        // Color interpolation (Green -> Yellow -> Red)
        let r: number, g: number, b: number;
        if (normalized < 0.5) {
          // Green (34, 197, 94) to Yellow (234, 179, 8)
          const factor = normalized * 2;
          r = Math.floor(34 + (234 - 34) * factor);
          g = Math.floor(197 + (179 - 197) * factor);
          b = Math.floor(94 + (8 - 94) * factor);
        } else {
          // Yellow (234, 179, 8) to Red (239, 68, 68)
          const factor = (normalized - 0.5) * 2;
          r = Math.floor(234 + (239 - 234) * factor);
          g = Math.floor(179 + (68 - 179) * factor);
          b = Math.floor(8 + (68 - 8) * factor);
        }

        return (
          <div
            key={i}
            className="absolute rounded-full blur-xl animate-in fade-in zoom-in duration-500"
            style={{
              left: point.x,
              top: point.y,
              width: size,
              height: size,
              opacity,
              transform: "translate(-50%, -50%)",
              background: `radial-gradient(circle, rgba(${r},${g},${b},0.8) 0%, rgba(${r},${g},${b},0.4) 50%, transparent 100%)`,
            }}
          />
        );
      })}
    </div>
  );
}
