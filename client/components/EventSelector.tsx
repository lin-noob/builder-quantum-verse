import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ChevronDown } from "lucide-react";

interface EventSelectorProps {
  allEvents: string[]; // List of all available event names
  selectedEvents: string[]; // Currently active selection
  onApply: (events: string[]) => void;
}

export function EventSelector({ allEvents, selectedEvents, onApply }: EventSelectorProps) {
  const [open, setOpen] = useState(false);
  const [tempSelected, setTempSelected] = useState<string[]>(selectedEvents);
  const [searchQuery, setSearchQuery] = useState("");

  // Sync temp state when popover opens or props change
  useEffect(() => {
    if (open) {
      setTempSelected(selectedEvents);
      setSearchQuery("");
    }
  }, [open, selectedEvents]);

  const filteredEvents = allEvents.filter((event) =>
    event.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleEvent = (event: string) => {
    setTempSelected((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  const handleClear = () => {
    setTempSelected([]);
  };

  const handleApply = () => {
    onApply(tempSelected);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between font-normal h-10 px-3 bg-white"
        >
          {selectedEvents.length === 0 ? (
            <span className="text-muted-foreground">全部事件</span>
          ) : (
            <span className="truncate text-left block w-[calc(100%-20px)]">
              {selectedEvents.join(", ")}
            </span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="p-3 pb-0">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索事件名称"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>
        <div className="py-2">
          <ScrollArea className="h-[300px]">
            <div className="px-3 space-y-1">
              {filteredEvents.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  无匹配事件
                </div>
              ) : (
                filteredEvents.map((event) => (
                  <div
                    key={event}
                    className="flex items-center space-x-2 rounded-sm px-2 py-1.5 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                    onClick={() => toggleEvent(event)}
                  >
                    <Checkbox
                      checked={tempSelected.includes(event)}
                      onCheckedChange={() => toggleEvent(event)}
                      id={`event-${event}`}
                    />
                    <label
                      htmlFor={`event-${event}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1 break-all"
                      onClick={(e) => e.preventDefault()}
                    >
                      {event}
                    </label>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
        <div className="flex items-center justify-between p-3 border-t bg-gray-50/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
          >
            清空
          </Button>
          <Button size="sm" onClick={handleApply} className="h-8 px-3">
            应用 ({tempSelected.length})
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
