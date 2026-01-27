import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Clock, ArrowRight } from 'lucide-react';

interface HistoryEvent {
  id: string;
  timestamp: string;
  title: string;
  description?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isCausal?: boolean;
}

const MOCK_HISTORY: HistoryEvent[] = [
  {
    id: 'e1',
    timestamp: '10:14',
    title: 'Stock Lock Failed',
    description: 'Inventory#99 locked by Order#456',
    type: 'error',
    isCausal: true
  },
  {
    id: 'e2',
    timestamp: '10:05',
    title: 'Payment Confirmed',
    description: 'Transaction ID: TX9981',
    type: 'success',
    isCausal: true
  },
  {
    id: 'e3',
    timestamp: '10:00',
    title: 'Order Created',
    type: 'info',
    isCausal: true
  },
  {
    id: 'e4',
    timestamp: '09:55',
    title: 'Cart Updated',
    description: 'Added item: Quantum Widget',
    type: 'info',
    isCausal: false
  }
];

interface HistorySidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  playbackMode: 'lifecycle' | 'failure';
}

export const HistorySidePanel: React.FC<HistorySidePanelProps> = ({ isOpen, onClose, playbackMode }) => {
  // Filter events based on mode
  const displayedEvents = playbackMode === 'failure' 
    ? MOCK_HISTORY.filter(e => e.isCausal) 
    : MOCK_HISTORY;

  if (!isOpen) return null;

  return (
    <div className="h-full flex flex-col bg-white border-l border-slate-200 shadow-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          Event History
        </h3>
        <span className="text-xs text-slate-400 font-mono">{displayedEvents.length} events</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {displayedEvents.map((event, index) => (
          <div 
            key={event.id}
            className="relative pl-6 group cursor-pointer"
          >
            {/* Timeline Line */}
            {index !== displayedEvents.length - 1 && (
              <div className="absolute left-[9px] top-6 bottom-[-16px] w-[2px] bg-slate-100 group-hover:bg-slate-200 transition-colors" />
            )}

            {/* Dot */}
            <div className={cn(
              "absolute left-0 top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white z-10 transition-colors",
              event.type === 'error' ? "border-red-200 text-red-500" :
              event.type === 'success' ? "border-green-200 text-green-500" :
              "border-slate-200 text-slate-400",
              "group-hover:scale-110"
            )}>
              {event.type === 'error' && <AlertCircle className="w-3 h-3" />}
              {event.type === 'success' && <CheckCircle className="w-3 h-3" />}
              {event.type === 'info' && <div className="w-2 h-2 rounded-full bg-slate-300" />}
            </div>

            {/* Content Card */}
            <div className={cn(
              "p-3 rounded-lg border transition-all",
              event.type === 'error' ? "bg-red-50 border-red-100 hover:border-red-200" :
              "bg-white border-slate-100 hover:border-blue-200 hover:shadow-sm"
            )}>
              <div className="flex justify-between items-start mb-1">
                <span className={cn(
                  "font-medium text-sm",
                  event.type === 'error' ? "text-red-700" : "text-slate-700"
                )}>{event.title}</span>
                <span className="text-xs font-mono text-slate-400 bg-slate-50 px-1.5 rounded">{event.timestamp}</span>
              </div>
              
              {event.description && (
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  {event.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
