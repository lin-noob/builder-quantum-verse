import { Card, CardContent } from "@/components/ui/card";
import { DecisionEvent } from "@/components/incidentCopy/DecisionEventListItem";
import EventFactCard from "@/components/incidentCopy/EventFactCard";
import EventStatusCard from "@/components/incidentCopy/EventStatusCard";
import EventRelatedCard from "@/components/incidentCopy/EventRelatedCard";

interface EventHeaderCardProps {
  event: DecisionEvent;
}

export default function EventHeaderCard({ event }: EventHeaderCardProps) {
  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col">
          {/* Zone 1: Fact Header - Light Background */}
          <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-200">
            <EventFactCard event={event} />
          </div>
          
          {/* Zone 2: Process Status - White Background */}
          <div className="px-5 py-4 border-b border-slate-200 bg-white">
            <EventStatusCard event={event} />
          </div>
          
          {/* Zone 3: Context Anchor - White Background */}
          <div className="px-5 py-4 bg-white">
            <EventRelatedCard event={event} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

