import React from 'react';
import { Search } from 'lucide-react';

interface GraphSearchBarProps {
  onSearch: (query: string) => void;
}

export const GraphSearchBar: React.FC<GraphSearchBarProps> = ({ onSearch }) => {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
      <input
        type="text"
        placeholder="Search ID, SKU, Order No..."
        className="pl-9 pr-4 py-2 w-64 bg-slate-100 border-none rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        onKeyDown={(e) => {
            if (e.key === 'Enter') {
                onSearch((e.target as HTMLInputElement).value);
            }
        }}
      />
    </div>
  );
};
