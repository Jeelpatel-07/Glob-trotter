import { Clock, DollarSign, Star, Plus, Tag } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

export default function ActivityCard({ activity, index = 0, onAddToTrip }) {
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={12}
          className={i <= (rating || 0) ? 'star-filled' : 'star-empty'}
          fill={i <= (rating || 0) ? '#f59e0b' : 'none'}
        />
      );
    }
    return stars;
  };

  return (
    <Card hoverable className={`search-card animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}>
      {activity.thumbnail && (
        <img src={activity.thumbnail} alt={activity.name} className="card-image" />
      )}
      <div className="search-card-body">
        <h3 className="card-title">{activity.name}</h3>
        <div className="activity-card-tags">
          {activity.category && (
            <span className="badge badge-blue">
              <Tag size={10} /> {activity.category}
            </span>
          )}
        </div>
        <div className="search-card-stats">
          {activity.duration && (
            <span className="search-stat">
              <Clock size={12} /> {activity.duration}
            </span>
          )}
          {activity.cost !== undefined && (
            <span className="search-stat">
              <DollarSign size={12} /> ${activity.cost}
            </span>
          )}
        </div>
        {activity.rating !== undefined && (
          <div className="search-card-rating">{renderStars(activity.rating)}</div>
        )}
        {onAddToTrip && (
          <Button
            variant="outline"
            size="sm"
            icon={Plus}
            fullWidth
            onClick={() => onAddToTrip(activity)}
          >
            Add to Trip
          </Button>
        )}
      </div>
    </Card>
  );
}
