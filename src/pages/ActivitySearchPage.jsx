import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, DollarSign, Star, Plus, Tag } from 'lucide-react';
import { activitiesAPI } from '../api/activities.api';
import useDebounce from '../hooks/useDebounce';
import Navbar from '../components/common/Navbar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ListToolbar from '../components/common/ListToolbar';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import './SearchPages.css';

export default function ActivitySearchPage() {
  const [searchParams] = useSearchParams();
  const cityId = searchParams.get('cityId') || '';
  const cityName = searchParams.get('cityName') || 'Activities';
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('rating');
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ['activities', cityId, debouncedSearch, category, sort],
    queryFn: () => activitiesAPI.search({ cityId, search: debouncedSearch, category, sort }),
  });

  const activities = Array.isArray(data?.data || data) ? (data?.data || data) : [];

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star key={i} size={12} className={i <= (rating || 0) ? 'star-filled' : 'star-empty'} fill={i <= (rating || 0) ? '#f59e0b' : 'none'} />
      );
    }
    return stars;
  };

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">
        <h1 className="page-title">{cityName ? `Activities in ${cityName}` : 'Search Activities'}</h1>

        <ListToolbar
          onSearch={setSearch}
          searchPlaceholder="Search activities..."
          filters={[
            { label: 'All Categories', value: '' },
            { label: 'Sightseeing', value: 'sightseeing' },
            { label: 'Food & Dining', value: 'food' },
            { label: 'Adventure', value: 'adventure' },
            { label: 'Culture', value: 'culture' },
            { label: 'Shopping', value: 'shopping' },
            { label: 'Nightlife', value: 'nightlife' },
          ]}
          sortOptions={[
            { label: 'Top Rated', value: 'rating' },
            { label: 'Lowest Cost', value: 'cost_asc' },
            { label: 'Shortest', value: 'duration_asc' },
            { label: 'Name A-Z', value: 'name' },
          ]}
          activeFilter={category}
          activeSort={sort}
          onFilterChange={setCategory}
          onSortChange={setSort}
        />

        {isLoading ? (
          <Loader fullPage text="Searching activities..." />
        ) : activities.length > 0 ? (
          <div className="grid-3">
            {activities.map((act, i) => (
              <Card key={act.id || i} hoverable className={`search-card animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
                {act.thumbnail && <img src={act.thumbnail} alt={act.name} className="card-image" />}
                <div className="search-card-body">
                  <h3 className="card-title">{act.name}</h3>
                  <div className="activity-card-tags">
                    {act.category && <span className="badge badge-blue"><Tag size={10} /> {act.category}</span>}
                  </div>
                  <div className="search-card-stats">
                    {act.duration && <span className="search-stat"><Clock size={12} /> {act.duration}</span>}
                    {act.cost !== undefined && <span className="search-stat"><DollarSign size={12} /> ${act.cost}</span>}
                  </div>
                  {act.rating !== undefined && (
                    <div className="search-card-rating">{renderStars(act.rating)}</div>
                  )}
                  <Button variant="outline" size="sm" icon={Plus} fullWidth onClick={() => toast.success(`${act.name} added!`)}>
                    Add to Trip
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Star size={48} />
            <h3>No activities found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
