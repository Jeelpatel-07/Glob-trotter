import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Globe, Eye, Calendar, MapPin, Users } from 'lucide-react';
import { tripsAPI } from '../api/trips.api';
import Navbar from '../components/common/Navbar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ListToolbar from '../components/common/ListToolbar';
import Loader from '../components/common/Loader';
import './CommunityPage.css';

export default function CommunityPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['community-trips', search],
    queryFn: () => tripsAPI.getAll({ public: true, search }),
    retry: false,
  });

  const trips = Array.isArray(data?.data || data) ? (data?.data || data) : [];

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">
        <div className="community-hero">
          <Globe size={40} className="community-icon" />
          <h1 className="page-title" style={{ marginBottom: 4 }}>Community Trips</h1>
          <p className="page-subtitle">Discover itineraries shared by fellow travelers</p>
        </div>

        <ListToolbar
          onSearch={setSearch}
          searchPlaceholder="Search community trips..."
          filters={[
            { label: 'All', value: '' },
            { label: 'Most Popular', value: 'popular' },
            { label: 'Recent', value: 'recent' },
          ]}
          sortOptions={[
            { label: 'Trending', value: 'trending' },
            { label: 'Newest', value: 'newest' },
            { label: 'Most Liked', value: 'likes' },
          ]}
        />

        {isLoading ? (
          <Loader fullPage text="Loading community trips..." />
        ) : trips.length > 0 ? (
          <div className="grid-3">
            {trips.map((trip, i) => (
              <Card key={trip.id || i} hoverable className={`community-card animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
                {trip.coverImage && <img src={trip.coverImage} alt={trip.name} className="card-image" />}
                <div style={{ padding: 16 }}>
                  <h3 className="card-title">{trip.name || trip.title}</h3>
                  <div className="trip-card-meta">
                    <span className="trip-card-date">
                      <Calendar size={14} />
                      {new Date(trip.startDate || trip.start_date).toLocaleDateString()} – {new Date(trip.endDate || trip.end_date).toLocaleDateString()}
                    </span>
                    {trip.userName && (
                      <span className="trip-card-dest"><Users size={14} /> {trip.userName}</span>
                    )}
                  </div>
                  {trip.description && (
                    <p className="community-desc">{trip.description}</p>
                  )}
                  <Button variant="outline" size="sm" icon={Eye} fullWidth onClick={() => navigate(`/public/trips/${trip.shareToken || trip.id}`)}>
                    View Itinerary
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Globe size={48} />
            <h3>No community trips yet</h3>
            <p>Be the first to share your adventure!</p>
          </div>
        )}
      </div>
    </div>
  );
}
