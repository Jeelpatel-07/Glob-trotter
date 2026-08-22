import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { MapPin, DollarSign, TrendingUp, Plus, Bookmark } from 'lucide-react';
import { citiesAPI } from '../api/cities.api';
import { authAPI } from '../api/auth.api';
import useDebounce from '../hooks/useDebounce';
import Navbar from '../components/common/Navbar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ListToolbar from '../components/common/ListToolbar';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import './SearchPages.css';

export default function CitySearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [region, setRegion] = useState(searchParams.get('region') || '');
  const [sort, setSort] = useState('popularity');
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ['cities', debouncedSearch, region, sort],
    queryFn: () => citiesAPI.search({ search: debouncedSearch, region, sort }),
  });

  const saveMutation = useMutation({
    mutationFn: (cityId) => authAPI.saveDestination(cityId),
    onSuccess: () => {
      toast.success('Destination saved!');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to save destination');
    }
  });

  const cities = Array.isArray(data?.data || data) ? (data?.data || data) : [];

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">
        <h1 className="page-title">Explore Cities</h1>
        <p className="page-subtitle">Discover amazing destinations around the world</p>

        <ListToolbar
          onSearch={setSearch}
          searchPlaceholder="Search cities..."
          filters={[
            { label: 'All Regions', value: '' },
            { label: 'Europe', value: 'Europe' },
            { label: 'Asia', value: 'Asia' },
            { label: 'Americas', value: 'Americas' },
            { label: 'Africa', value: 'Africa' },
            { label: 'Oceania', value: 'Oceania' },
          ]}
          sortOptions={[
            { label: 'Most Popular', value: 'popularity' },
            { label: 'Lowest Cost', value: 'cost_asc' },
            { label: 'Highest Cost', value: 'cost_desc' },
            { label: 'Name A-Z', value: 'name' },
          ]}
          activeFilter={region}
          activeSort={sort}
          onFilterChange={setRegion}
          onSortChange={setSort}
        />

        {isLoading ? (
          <Loader fullPage text="Searching cities..." />
        ) : cities.length > 0 ? (
          <div className="grid-3">
            {cities.map((city, i) => (
              <Card key={city.id || i} hoverable className={`search-card animate-fade-in-up stagger-${Math.min(i + 1, 6)}`} style={{ position: 'relative' }}>
                <div style={{ position: 'relative' }}>
                  {city.image && <img src={city.image} alt={city.name} className="card-image" />}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      saveMutation.mutate(city.id);
                    }}
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: 'rgba(0, 0, 0, 0.6)',
                      border: 'none',
                      borderRadius: '50%',
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      zIndex: 10
                    }}
                    title="Save Destination"
                  >
                    <Bookmark size={14} />
                  </button>
                </div>
                <div className="search-card-body">
                  <h3 className="card-title">{city.name}</h3>
                  <p className="card-subtitle"><MapPin size={12} /> {city.country}</p>
                  <div className="search-card-stats">
                    {city.costIndex !== undefined && (
                      <span className="search-stat"><DollarSign size={12} /> Cost: {city.costIndex}/10</span>
                    )}
                    {city.popularity !== undefined && (
                      <span className="search-stat"><TrendingUp size={12} /> Popularity: {city.popularity}/10</span>
                    )}
                  </div>
                  <Button variant="outline" size="sm" icon={Plus} fullWidth onClick={() => navigate(`/search/activities?cityId=${city.id}&cityName=${city.name}`)}>
                    Explore Activities
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <MapPin size={48} />
            <h3>No cities found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
