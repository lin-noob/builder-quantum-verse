import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useGraphStore } from "../store/useGraphStore";

export function MeshControls() {
  const mode = useGraphStore((state) => state.mode);
  const filters = useGraphStore((state) => state.filters) || {};
  const setFilters = useGraphStore((state) => state.setFilters);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (filters.search !== searchTerm) {
      setSearchTerm(filters.search || "");
    }
  }, [filters.search]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setFilters({
      ...filters,
      search: term,
    });
  };

  if (mode !== "mesh") return null;

  return (
    <div className="absolute top-4 left-4 z-50 flex flex-col gap-3 w-80">
      <div className="relative group">
        {/* <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        </div> */}
        {/* <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-white/90 backdrop-blur-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm transition-all"
          placeholder="Search instances by ID..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {searchTerm && (
          <button onClick={() => handleSearch("")} className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
          </button>
        )} */}
      </div>
    </div>
  );
}
