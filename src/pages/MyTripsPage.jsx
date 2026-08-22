import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, MapPin, Trash2, Edit, Eye, Plus } from 'lucide-react';
import { tripsAPI } from '../api/trips.api';
import Navbar from '../components/common/Navbar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ListToolbar from '../components/common/ListToolbar';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import './MyTripsPage.css';

export default function MyTripsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [deleteTrip, setDeleteTrip] = useState(null);

  const { data: tripsData, isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => tripsAPI.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (tripId) => tripsAPI.delete(tripId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Trip deleted');
      setDeleteTrip(null);
    },
    onError: (err) => toast.error(err.message || 'Failed to delete trip'),
  });

  const trips = Array.isArray(tripsData?.data || tripsData) ? (tripsData?.data || tripsData) : [];

  const categorized = useMemo(() => {
    const now = new Date();
    const filtered = trips.filter(t =>
      (t.name || t.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    return {
      ongoing: filtered.filter(t => {
        const s = new Date(t.startDate || t.start_date);
        const e = new Date(t.endDate || t.end_date);
        return s <= now && e >= now;
      }),
      upcoming: filtered.filter(t => new Date(t.startDate || t.start_date) > now),
      completed: filtered.filter(t => new Date(t.endDate || t.end_date) < now),
    };
  }, [trips, searchTerm]);

  const renderSection = (title, items, badge) => (
    <section className="trips-section">
      <div className="trips-section-header">
        <h2 className="section-title">{title}</h2>
        <span className={`badge ${badge}`}>{items.length}</span>
      </div>
      {items.length > 0 ? (
        <div className="grid-3">
          {items.map((trip, i) => (
            <Card key={trip.id || i} hoverable className={`trip-card animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
              {trip.coverImage && <img src={trip.coverImage} alt={trip.name} className="card-image" />}
              <div style={{ padding: trip.coverImage ? '16px' : 0 }}>
                <h3 className="card-title">{trip.name || trip.title}</h3>
                <div className="trip-card-meta">
                  <span className="trip-card-date">
                    <Calendar size={14} />
                    {new Date(trip.startDate || trip.start_date).toLocaleDateString()} – {new Date(trip.endDate || trip.end_date).toLocaleDateString()}
                  </span>
                  {(trip.destinations || trip.stopCount) && (
                    <span className="trip-card-dest">
                      <MapPin size={14} />
                      {trip.destinations || trip.stopCount} destinations
                    </span>
                  )}
                </div>
                <div className="trip-card-actions">
                  <Button variant="ghost" size="sm" icon={Eye} onClick={() => navigate(`/trips/${trip.id}/itinerary`)}>View</Button>
                  <Button variant="ghost" size="sm" icon={Edit} onClick={() => navigate(`/trips/${trip.id}/build`)}>Edit</Button>
                  <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setDeleteTrip(trip)} className="btn-delete">Delete</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="trips-empty">No {title.toLowerCase()} trips</p>
      )}
    </section>
  );

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">
        <div className="flex-between" style={{ marginBottom: 24 }}>
          <h1 className="page-title" style={{ marginBottom: 0 }}>My Trips</h1>
          <Button icon={Plus} onClick={() => navigate('/trips/new')}>New Trip</Button>
        </div>

        <ListToolbar
          onSearch={setSearchTerm}
          searchPlaceholder="Search your trips..."
          filters={[
            { label: 'All', value: 'all' },
            { label: 'Ongoing', value: 'ongoing' },
            { label: 'Upcoming', value: 'upcoming' },
            { label: 'Completed', value: 'completed' },
          ]}
          sortOptions={[
            { label: 'Newest First', value: 'newest' },
            { label: 'Oldest First', value: 'oldest' },
            { label: 'Name A-Z', value: 'name' },
          ]}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {isLoading ? (
          <Loader fullPage text="Loading trips..." />
        ) : (
          <>
            {(activeFilter === 'all' || activeFilter === 'ongoing') && renderSection('Ongoing', categorized.ongoing, 'badge-green')}
            {(activeFilter === 'all' || activeFilter === 'upcoming') && renderSection('Upcoming', categorized.upcoming, 'badge-blue')}
            {(activeFilter === 'all' || activeFilter === 'completed') && renderSection('Completed', categorized.completed, 'badge-gray')}
          </>
        )}
      </div>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteTrip} onClose={() => setDeleteTrip(null)} title="Delete Trip" size="sm">
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
          Are you sure you want to delete <strong>"{deleteTrip?.name || deleteTrip?.title}"</strong>? This action cannot be undone.
        </p>
        <div className="modal-footer" style={{ padding: 0, border: 'none' }}>
          <Button variant="ghost" onClick={() => setDeleteTrip(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => deleteMutation.mutate(deleteTrip.id)} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
