import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useGraphStore } from "../store/useGraphStore";

export function FilterDrawer() {
    const isOpen = useGraphStore(state => state.isFilterDrawerOpen);
    const setOpen = useGraphStore(state => state.setFilterDrawerOpen);
    const activeType = useGraphStore(state => state.activeFilterType);

    return (
        <Sheet open={isOpen} onOpenChange={setOpen}>
            <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle>Filter: {activeType}</SheetTitle>
                    <SheetDescription>
                        Configure advanced filters for {activeType}.
                    </SheetDescription>
                </SheetHeader>
                
                <div className="py-6 space-y-6">
                    {/* Mock Content */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Schema Attributes</label>
                        <div className="space-y-2">
                            {['Category', 'Region', 'Total Amount', 'Created Date'].map(attr => (
                                <div key={attr} className="flex items-center justify-between p-2 border rounded hover:bg-slate-50 cursor-pointer">
                                    <span className="text-sm">{attr}</span>
                                    <span className="text-xs text-slate-400">+ Add</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Active Filters</label>
                         <div className="p-4 border border-dashed rounded bg-slate-50 text-sm text-slate-500 text-center">
                            No active filters. Click attributes above to add.
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}