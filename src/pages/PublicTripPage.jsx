import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Calendar, MapPin, DollarSign, Clock, Copy, Globe } from 'lucide-react';
import { shareAPI } from '../api/share.api';
import useAuth from '../hooks/useAuth';
import Navbar from '../components/common/Navbar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import './ItineraryViewPage.css';

export default function PublicTripPage() {
  const { shareToken } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['public-trip', shareToken],
    queryFn: () => shareAPI.getPublicTrip(shareToken),
  });

  const copyMutation = useMutation({
    mutationFn: () => shareAPI.copyPublicTrip(shareToken),
    onSuccess: (res) => {
      toast.success('Trip copied to your account!');
      const tripId = res?.data?.id || res?.id;
      if (tripId) navigate(`/trips/${tripId}/itinerary`);
      else navigate('/trips');
    },
    onError: (err) => toast.error(err.message || 'Failed to copy trip'),
  });

  const trip = data?.data || data;
  const days = trip?.days || trip?.itinerary?.days || trip?.itinerary || [];

  if (isLoading) {
    return (
      <div className="page-container">
        <nav className="navbar">
          <div className="navbar-inner">
            <a href="/" className="navbar-brand">
              <Globe size={24} style={{ color: 'var(--accent)' }} />
              <span className="navbar-logo-text" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>GlobeTrotter</span>
            </a>
          </div>
        </nav>
        <Loader fullPage text="Loading shared trip..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="flex-col-center" style={{ minHeight: '80vh', gap: 16 }}>
          <Globe size={48} style={{ color: 'var(--text-muted)' }} />
          <h2>Trip Not Found</h2>
          <p style={{ color: 'var(--text-secondary)' }}>This shared trip link may be invalid or expired.</p>
          <Button onClick={() => navigate('/login')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <nav className="navbar" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <div className="navbar-inner">
          <a href="/" className="navbar-brand">
            <Globe size={24} style={{ color: 'var(--accent)' }} />
            <span className="navbar-logo-text" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>GlobeTrotter</span>
          </a>
          {isAuthenticated && (
            <Button icon={Copy} size="sm" onClick={() => copyMutation.mutate()} disabled={copyMutation.isPending}>
              {copyMutation.isPending ? 'Copying...' : 'Copy Trip'}
            </Button>
          )}
        </div>
      </nav>

      <div className="page-content-wide">
        <div className="itinerary-header">
          <div>
            <h1 className="page-title" style={{ marginBottom: 4 }}>{trip?.name || 'Shared Trip'}</h1>
            {trip?.startDate && (
              <p className="page-subtitle">
                <Calendar size={14} style={{ display: 'inline', verticalAlign: '-2px' }} /> {new Date(trip.startDate || trip.start_date).toLocaleDateString()} – {new Date(trip.endDate || trip.end_date).toLocaleDateString()}
              </p>
            )}
            {trip?.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{trip.description}</p>}
          </div>
        </div>

        <div className="itinerary-days">
          {Array.isArray(days) && days.length > 0 ? (
            days.map((day, i) => (
              <div key={i} className={`day-card animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
                <div className="day-header">
                  <h3 className="day-title">
                    <span className="day-number">Day {day.dayNumber || i + 1}</span>
                    {day.city && <span className="day-city"><MapPin size={12} /> {day.city}</span>}
                  </h3>
                  {day.date && <span className="day-date">{new Date(day.date).toLocaleDateString()}</span>}
                </div>
                <div className="day-activities">
                  {(day.activities || []).map((act, ai) => (
                    <div key={ai} className="day-activity">
                      <div className="day-activity-info">
                        <span className="day-activity-name">{act.name}</span>
                        {act.time && <span className="day-activity-time"><Clock size={12} /> {act.time}</span>}
                      </div>
                      <span className="day-activity-cost">{act.cost !== undefined ? `$${act.cost}` : '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <Calendar size={48} />
              <h3>No itinerary data available</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
