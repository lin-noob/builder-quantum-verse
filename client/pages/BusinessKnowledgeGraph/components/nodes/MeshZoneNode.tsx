import React from 'react';
import { NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { GraphTheme } from '../../theme/graphTheme';
import { useGraphStore } from '../../store/useGraphStore';

// Custom data for the zone
export interface MeshZoneData extends Record<string, unknown> {
    label: string;
    color: string;
    width: number;
    height: number;
}

export function MeshZoneNode({ data }: NodeProps<MeshZoneData>) {
    const zoomLevel = useGraphStore(state => state.zoomLevel);

    let bgOpacity = 0.22;
    let borderOpacity = 0.32;
    let watermarkOpacity = 0.14;

    if (zoomLevel < 0.4) {
        bgOpacity = 0.25;
        borderOpacity = 0.35;
        watermarkOpacity = 0.16;
    } else if (zoomLevel < 0.8) {
        bgOpacity = 0.18;
        borderOpacity = 0.26;
        watermarkOpacity = 0.1;
    } else {
        bgOpacity = 0.12;
        borderOpacity = 0.18;
        watermarkOpacity = 0.07;
    }

    return (
        <div 
            className="absolute flex flex-col pointer-events-none select-none transition-all duration-500"
            style={{
                width: data.width,
                height: data.height,
            }}
        >
                    <div 
                        className="absolute inset-0 rounded-[60px] transition-all duration-500"
                        style={{ backgroundColor: data.color, opacity: bgOpacity }}
                    />
                    
                    <div 
                        className="absolute inset-0 rounded-[60px] border-2 border-dashed transition-all duration-500"
                        style={{ borderColor: data.color, opacity: borderOpacity }}
                    />

                    <div 
                        className="absolute top-8 left-8 text-6xl font-black text-slate-900 tracking-tighter"
                        style={{ 
                            color: data.color,
                            whiteSpace: 'nowrap',
                            opacity: watermarkOpacity
                        }}
                    >
                        {data.label}
                    </div>

            {/* Small Label Tag */}
            <div 
                className="absolute -top-3 left-8 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm opacity-60 backdrop-blur-sm"
                style={{ backgroundColor: data.color }}
            >
                {data.label} DOMAIN
            </div>
        </div>
    );
}
