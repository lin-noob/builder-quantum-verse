import { CalendarEvent } from './EventFormDialog';

interface CustomCalendarEventProps {
  event: CalendarEvent;
  title: string;
  style?: React.CSSProperties;
  reloadEvents?: () => void; // Function to reload events after deletion
  onClick?: (e: React.MouseEvent) => void;
}

export const CustomCalendarEvent = ({ 
  event, 
  title, 
  reloadEvents,
  style, // Receive the original style from the calendar component
  onClick
}: CustomCalendarEventProps) => {
  return (
    <div
      style={style} // Preserve original calendar event styles
      className="cursor-pointer"
      onClick={onClick}
    >
      <div className="truncate">
        {title}
      </div>
    </div>
  );
};