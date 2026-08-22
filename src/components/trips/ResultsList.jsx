import CityCard from './CityCard';
import ActivityCard from './ActivityCard';
import Loader from '../common/Loader';
import { Search } from 'lucide-react';

export default function ResultsList({
  items = [],
  type = 'cities', // 'cities' | 'activities'
  isLoading = false,
  onAddToTrip,
  onExplore,
  emptyMessage = 'No results found',
}) {
  if (isLoading) {
    return <Loader fullPage={false} text={`Searching ${type}...`} />;
  }

  if (!items || items.length === 0) {
    return (
      <div className="empty-state">
        <Search size={40} />
        <h3>{emptyMessage}</h3>
        <p>Try adjusting your search query or filters.</p>
      </div>
    );
  }

  return (
    <div className="grid-3">
      {items.map((item, i) =>
        type === 'cities' ? (
          <CityCard
            key={item.id || i}
            city={item}
            index={i}
            onAddToTrip={onAddToTrip}
            onExplore={onExplore}
          />
        ) : (
          <ActivityCard
            key={item.id || i}
            activity={item}
            index={i}
            onAddToTrip={onAddToTrip}
          />
        )
      )}
    </div>
  );
}
