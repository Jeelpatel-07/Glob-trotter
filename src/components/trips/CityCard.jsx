import { MapPin, DollarSign, TrendingUp, Plus } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

export default function CityCard({ city, index = 0, onAddToTrip, onExplore }) {
  return (
    <Card hoverable className={`search-card animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}>
      {city.image && <img src={city.image} alt={city.name} className="card-image" />}
      <div className="search-card-body">
        <h3 className="card-title">{city.name}</h3>
        <p className="card-subtitle">
          <MapPin size={12} /> {city.country}
        </p>
        <div className="search-card-stats">
          {city.costIndex !== undefined && (
            <span className="search-stat">
              <DollarSign size={12} /> Cost: {city.costIndex}/10
            </span>
          )}
          {city.popularity !== undefined && (
            <span className="search-stat">
              <TrendingUp size={12} /> Popularity: {city.popularity}/10
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          {onExplore && (
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => onExplore(city)}
            >
              Explore
            </Button>
          )}
          {onAddToTrip && (
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              fullWidth={!onExplore}
              onClick={() => onAddToTrip(city)}
            >
              Select City
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
