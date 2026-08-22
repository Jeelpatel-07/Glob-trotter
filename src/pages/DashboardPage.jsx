import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, MapPin, TrendingUp, Calendar, Globe, Compass, Map } from 'lucide-react';
import { tripsAPI } from '../api/trips.api';
import useAuth from '../hooks/useAuth';
import Navbar from '../components/common/Navbar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ListToolbar from '../components/common/ListToolbar';
import Loader from '../components/common/Loader';
import './DashboardPage.css';

const MOCK_REGIONS = [
  { name: 'Europe', icon: '🏰', color: '#3b82f6' },
  { name: 'Asia', icon: '🏯', color: '#8b5cf6' },
  { name: 'Americas', icon: '🗽', color: '#06b6d4' },
  { name: 'Africa', icon: '🌍', color: '#f59e0b' },
  { name: 'Oceania', icon: '🏝️', color: '#22c55e' },
  { name: 'Middle East', icon: '🕌', color: '#ef4444' },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: tripsAPI.getDashboard,
    retry: false,
  });

  const { data: tripsData } = useQuery({
    queryKey: ['trips'],
    queryFn: () => tripsAPI.getAll(),
    retry: false,
  });

  const trips = tripsData?.data || tripsData || [];
  const recentTrips = Array.isArray(trips) ? trips.slice(0, 6) : [];

  const stats = useMemo(() => {
    const tripsArr = Array.isArray(trips) ? trips : [];
    const now = new Date();
    return {
      total: tripsArr.length,
      upcoming: tripsArr.filter(t => new Date(t.startDate || t.start_date) > now).length,
      ongoing: tripsArr.filter(t => {
        const s = new Date(t.startDate || t.start_date);
        const e = new Date(t.endDate || t.end_date);
        return s <= now && e >= now;
      }).length,
      completed: tripsArr.filter(t => new Date(t.endDate || t.end_date) < now).length,
    };
  }, [trips]);

  return (
    <div className="page-container">
      <Navbar />
      <div className="dashboard-hero">
        <div className="dashboard-hero-content">
          <h1 className="dashboard-hero-title animate-fade-in-up">
            Welcome back, <span className="text-gradient">{user?.firstName || 'Traveler'}</span>
          </h1>
          <p className="dashboard-hero-subtitle animate-fade-in-up stagger-1">
            Where will your next adventure take you?
          </p>
          <Button
            icon={Plus}
            size="lg"
            onClick={() => navigate('/trips/new')}
            className="animate-fade-in-up stagger-2"
          >
            Plan a New Trip
          </Button>
        </div>
        <div className="dashboard-hero-bg" />
      </div>

      <div className="page-content">
        {/* Stats */}
        <div className="dashboard-stats animate-fade-in-up stagger-2">
          <div className="stat-card">
            <Globe size={20} className="stat-icon" style={{ color: '#3b82f6' }} />
            <div className="stat-info">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total Trips</span>
            </div>
          </div>
          <div className="stat-card">
            <Compass size={20} className="stat-icon" style={{ color: '#22c55e' }} />
            <div className="stat-info">
              <span className="stat-value">{stats.ongoing}</span>
              <span className="stat-label">Ongoing</span>
            </div>
          </div>
          <div className="stat-card">
            <Calendar size={20} className="stat-icon" style={{ color: '#f59e0b' }} />
            <div className="stat-info">
              <span className="stat-value">{stats.upcoming}</span>
              <span className="stat-label">Upcoming</span>
            </div>
          </div>
          <div className="stat-card">
            <Map size={20} className="stat-icon" style={{ color: '#8b5cf6' }} />
            <div className="stat-info">
              <span className="stat-value">{stats.completed}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <ListToolbar
          onSearch={setSearchTerm}
          searchPlaceholder="Search trips, destinations..."
          sortOptions={[
            { label: 'Newest', value: 'newest' },
            { label: 'Oldest', value: 'oldest' },
            { label: 'Name A-Z', value: 'name' },
          ]}
        />

        {/* Top Regional Selections */}
        <section className="dashboard-section">
          <h2 className="section-title">Top Regional Selections</h2>
          <div className="regions-grid">
            {MOCK_REGIONS.map((region, i) => (
              <Card
                key={region.name}
                hoverable
                className={`region-card animate-fade-in-up stagger-${i + 1}`}
                onClick={() => navigate(`/search/cities?region=${region.name}`)}
              >
                <span className="region-emoji">{region.icon}</span>
                <span className="region-name">{region.name}</span>
                <div className="region-glow" style={{ background: region.color }} />
              </Card>
            ))}
          </div>
        </section>

        {/* Recent Trips */}
        <section className="dashboard-section">
          <div className="flex-between" style={{ marginBottom: 16 }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Recent Trips</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/trips')}>View All →</Button>
          </div>

          {isLoading ? (
            <Loader text="Loading your trips..." />
          ) : recentTrips.length > 0 ? (
            <div className="grid-3">
              {recentTrips.map((trip, i) => (
                <Card
                  key={trip.id || i}
                  hoverable
                  className={`animate-fade-in-up stagger-${i + 1}`}
                  onClick={() => navigate(`/trips/${trip.id}/itinerary`)}
                >
                  {trip.coverImage && <img src={trip.coverImage} alt={trip.name} className="card-image" />}
                  <div className="card-header">
                    <h3 className="card-title">{trip.name || trip.title}</h3>
                  </div>
                  <div className="card-body">
                    <div className="trip-card-meta">
                      <span className="trip-card-date">
                        <Calendar size={14} />
                        {new Date(trip.startDate || trip.start_date).toLocaleDateString()} – {new Date(trip.endDate || trip.end_date).toLocaleDateString()}
                      </span>
                      {trip.destinations && (
                        <span className="trip-card-dest">
                          <MapPin size={14} />
                          {trip.destinations} stops
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Compass size={48} />
              <h3>No trips yet</h3>
              <p>Start planning your first adventure!</p>
              <Button icon={Plus} onClick={() => navigate('/trips/new')}>Create Trip</Button>
            </div>
          )}
        </section>
      </div>

      {/* FAB */}
      <button className="fab" onClick={() => navigate('/trips/new')} title="Plan a Trip">
        <Plus size={24} />
      </button>
    </div>
  );
}
