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
  // Use the event's custom color if available
  const customStyle: React.CSSProperties = {
    backgroundColor: event.color || '#3b82f6',
    borderLeft: `4px solid ${event.color || '#3b82f6'}`,
    color: '#ffffff',
    padding: '4px 8px',
    borderRadius: '4px',
    overflow: 'hidden',
    fontSize: '0.75rem',
    fontWeight: 500,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
  };

  return (
    <div
      style={customStyle}
      className="cursor-pointer"
      onClick={onClick}
    >
      <div className="truncate w-full">
        {title}
      </div>
    </div>
  );
};