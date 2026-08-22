import { Calendar, MapPin, Trash2, Edit, Eye } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import './TripCard.css';

export default function TripCard({
  trip,
  onView,
  onEdit,
  onDelete,
  index = 0,
  showActions = true,
}) {
  const startDate = trip.startDate || trip.start_date;
  const endDate = trip.endDate || trip.end_date;
  const destinationCount = trip.destinations || trip.stopCount || trip.stops?.length || 0;

  return (
    <Card hoverable className={`trip-card-item animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}>
      {trip.coverImage && (
        <img src={trip.coverImage} alt={trip.name || trip.title} className="card-image" />
      )}
      <div className="trip-card-content">
        <h3 className="card-title">{trip.name || trip.title || 'Untitled Trip'}</h3>
        {trip.description && <p className="trip-card-description">{trip.description}</p>}
        
        <div className="trip-card-meta">
          {startDate && (
            <span className="trip-card-date">
              <Calendar size={14} />
              {new Date(startDate).toLocaleDateString()}
              {endDate ? ` – ${new Date(endDate).toLocaleDateString()}` : ''}
            </span>
          )}
          {destinationCount > 0 && (
            <span className="trip-card-dest">
              <MapPin size={14} />
              {destinationCount} {destinationCount === 1 ? 'stop' : 'stops'}
            </span>
          )}
        </div>

        {showActions && (
          <div className="trip-card-actions">
            {onView && (
              <Button variant="ghost" size="sm" icon={Eye} onClick={onView}>
                View
              </Button>
            )}
            {onEdit && (
              <Button variant="ghost" size="sm" icon={Edit} onClick={onEdit}>
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="sm" icon={Trash2} onClick={onDelete} className="btn-delete">
                Delete
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
