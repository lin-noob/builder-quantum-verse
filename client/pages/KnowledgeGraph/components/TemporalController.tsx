import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

interface TemporalControllerProps {
  playbackMode?: 'lifecycle' | 'failure';
  onModeChange?: (mode: 'lifecycle' | 'failure') => void;
}

export const TemporalController: React.FC<TemporalControllerProps> = ({ 
  playbackMode: externalMode, 
  onModeChange 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(30);
  const [internalMode, setInternalMode] = useState<'lifecycle' | 'failure'>('lifecycle');

  // Use external mode if provided, otherwise internal
  const playbackMode = externalMode || internalMode;
  
  const handleModeChange = (mode: 'lifecycle' | 'failure') => {
      setInternalMode(mode);
      onModeChange?.(mode);
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg shadow-xl p-4 transition-all">
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Timeline Playback</span>
                
                {/* Mode Switcher */}
                <div className="flex bg-slate-100 rounded-md p-0.5">
                    <button 
                        onClick={() => handleModeChange('lifecycle')}
                        className={`px-2 py-0.5 text-[10px] rounded font-medium transition-colors ${playbackMode === 'lifecycle' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Lifecycle
                    </button>
                    <button 
                        onClick={() => handleModeChange('failure')}
                        className={`px-2 py-0.5 text-[10px] rounded font-medium transition-colors flex items-center gap-1 ${playbackMode === 'failure' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <span>Failure</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    </button>
                </div>
            </div>
            <span className="text-xs font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded">2024-01-23 14:30:00</span>
        </div>
        
        {/* Timeline Slider */}
        <div className="relative w-full h-6 mb-2 cursor-pointer group">
             {/* Track */}
             <div className="absolute top-1/2 left-0 w-full h-1.5 bg-slate-200 rounded-full transform -translate-y-1/2 overflow-hidden">
                <div 
                    className={`h-full rounded-full transition-all duration-300 ${playbackMode === 'failure' ? 'bg-red-500' : 'bg-blue-500'}`} 
                    style={{ width: `${progress}%` }} 
                />
             </div>
             
             {/* Markers (Events) */}
             <div className="absolute top-1/2 left-[20%] w-1 h-1 bg-white rounded-full transform -translate-y-1/2 z-10" />
             <div className="absolute top-1/2 left-[50%] w-1 h-1 bg-white rounded-full transform -translate-y-1/2 z-10" />
             <div className="absolute top-1/2 left-[80%] w-1 h-1 bg-white rounded-full transform -translate-y-1/2 z-10" />

             {/* Thumb */}
             <div 
                className={`absolute top-1/2 h-4 w-4 bg-white border-2 rounded-full shadow-sm transform -translate-y-1/2 -translate-x-1/2 hover:scale-110 transition-transform z-20 ${playbackMode === 'failure' ? 'border-red-500' : 'border-blue-500'}`}
                style={{ left: `${progress}%` }}
             />
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
             <button className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors" title="Reset">
                <SkipBack className="h-5 w-5" />
             </button>
             <button 
                onClick={togglePlay}
                className={`p-3 rounded-full text-white shadow-md hover:shadow-lg transition-all transform active:scale-95 ${playbackMode === 'failure' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
             >
                {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
             </button>
             <button className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors" title="Next Event">
                <SkipForward className="h-5 w-5" />
             </button>
        </div>
    </div>
  );
};
