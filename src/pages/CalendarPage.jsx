import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { tripsAPI } from '../api/trips.api';
import Navbar from '../components/common/Navbar';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameMonth, isWithinInterval, parseISO } from 'date-fns';
import './CalendarPage.css';

const TRIP_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#ec4899'];

export default function CalendarPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: calendarData, isLoading } = useQuery({
    queryKey: ['calendar', tripId],
    queryFn: () => tripsAPI.getCalendar(tripId),
  });

  const { data: tripsData } = useQuery({
    queryKey: ['trips'],
    queryFn: () => tripsAPI.getAll(),
    enabled: !tripId,
  });

  const events = useMemo(() => {
    const raw = calendarData?.data || calendarData || [];
    const tripsArr = tripsData?.data || tripsData || [];
    const all = Array.isArray(raw) ? raw : [];
    if (!tripId && Array.isArray(tripsArr)) {
      return tripsArr.map((t, i) => ({
        id: t.id,
        name: t.name || t.title,
        startDate: t.startDate || t.start_date,
        endDate: t.endDate || t.end_date,
        color: TRIP_COLORS[i % TRIP_COLORS.length],
      }));
    }
    return all.map((e, i) => ({
      ...e,
      color: e.color || TRIP_COLORS[i % TRIP_COLORS.length],
    }));
  }, [calendarData, tripsData, tripId]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  const getEventsForDay = (day) => {
    return events.filter((evt) => {
      try {
        const start = typeof evt.startDate === 'string' ? parseISO(evt.startDate) : new Date(evt.startDate);
        const end = typeof evt.endDate === 'string' ? parseISO(evt.endDate) : new Date(evt.endDate);
        return isWithinInterval(day, { start, end });
      } catch {
        return false;
      }
    });
  };

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content-wide">
        <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate(tripId ? `/trips/${tripId}/itinerary` : '/trips')} style={{ marginBottom: 16 }}>
          Back
        </Button>

        <div className="calendar-header">
          <h1 className="page-title" style={{ marginBottom: 0 }}>
            {format(currentMonth, 'MMMM yyyy')}
          </h1>
          <div className="calendar-nav">
            <button className="cal-nav-btn" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft size={20} />
            </button>
            <button className="cal-nav-today" onClick={() => setCurrentMonth(new Date())}>Today</button>
            <button className="cal-nav-btn" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <Loader fullPage text="Loading calendar..." />
        ) : (
          <div className="calendar-grid animate-fade-in">
            {/* Day names */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="calendar-day-name">{d}</div>
            ))}

            {/* Empty cells for start offset */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="calendar-cell empty" />
            ))}

            {/* Day cells */}
            {daysInMonth.map((day) => {
              const dayEvents = getEventsForDay(day);
              const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              return (
                <div key={day.toISOString()} className={`calendar-cell ${isToday ? 'today' : ''}`}>
                  <span className={`calendar-day-number ${isToday ? 'today-number' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  <div className="calendar-events">
                    {dayEvents.slice(0, 3).map((evt, i) => (
                      <div
                        key={evt.id || i}
                        className="calendar-event"
                        style={{ background: `${evt.color}22`, borderLeft: `3px solid ${evt.color}`, color: evt.color }}
                        onClick={() => evt.id && navigate(`/trips/${evt.id}/itinerary`)}
                      >
                        {evt.name}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="calendar-more">+{dayEvents.length - 3} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        {events.length > 0 && (
          <div className="calendar-legend">
            {events.map((evt, i) => (
              <div key={evt.id || i} className="legend-item">
                <span className="legend-dot" style={{ background: evt.color }} />
                <span className="legend-name">{evt.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
