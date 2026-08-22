import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, Edit, Share2, MapPin, DollarSign, AlertTriangle, Clock, Copy, ExternalLink } from 'lucide-react';
import { tripsAPI } from '../api/trips.api';
import { shareAPI } from '../api/share.api';
import Navbar from '../components/common/Navbar';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import BudgetSection from '../components/budget/BudgetSection';
import ShareModal from '../components/trips/ShareModal';
import toast from 'react-hot-toast';
import './ItineraryViewPage.css';

export default function ItineraryViewPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [showShare, setShowShare] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const { data: itineraryData, isLoading } = useQuery({
    queryKey: ['itinerary', tripId],
    queryFn: () => tripsAPI.getItinerary(tripId),
  });

  const { data: budgetData } = useQuery({
    queryKey: ['budget', tripId],
    queryFn: () => tripsAPI.getBudget(tripId),
  });

  const { data: tripData } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripsAPI.getById(tripId),
  });

  const shareMutation = useMutation({
    mutationFn: () => shareAPI.enableSharing(tripId),
    onSuccess: (res) => {
      const url = res?.data?.shareUrl || res?.shareUrl || `${window.location.origin}/public/trips/${res?.data?.shareToken || 'shared'}`;
      setShareUrl(url);
      setShowShare(true);
    },
    onError: (err) => toast.error(err.message || 'Failed to create share link'),
  });

  const trip = tripData?.data || tripData;
  const itinerary = itineraryData?.data || itineraryData;
  const budget = budgetData?.data || budgetData;
  const days = itinerary?.days || itinerary || [];
  const categoryBreakdown = budget?.categoryBreakdown || budget?.categories || [];
  const dailySpending = budget?.dailySpending || budget?.daily || [];
  const isOverBudget = budget?.isOverBudget || budget?.overBudget || false;
  const totalSpent = budget?.totalSpent || budget?.total || 0;
  const totalBudget = budget?.totalBudget || budget?.budget || 0;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  if (isLoading) {
    return <div className="page-container"><Navbar /><Loader fullPage text="Loading itinerary..." /></div>;
  }

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content-wide">
        {/* Header */}
        <div className="itinerary-header">
          <div>
            <h1 className="page-title" style={{ marginBottom: 4 }}>{trip?.name || 'Trip Itinerary'}</h1>
            {trip && (
              <p className="page-subtitle" style={{ marginBottom: 0 }}>
                <Calendar size={14} style={{ display: 'inline', verticalAlign: '-2px' }} /> {new Date(trip.startDate || trip.start_date).toLocaleDateString()} – {new Date(trip.endDate || trip.end_date).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="itinerary-actions">
            <Button variant="outline" size="sm" icon={Edit} onClick={() => navigate(`/trips/${tripId}/build`)}>Edit</Button>
            <Button variant="outline" size="sm" icon={Calendar} onClick={() => navigate(`/trips/${tripId}/calendar`)}>Calendar</Button>
            <Button variant="primary" size="sm" icon={Share2} onClick={() => shareMutation.mutate()} disabled={shareMutation.isPending}>Share</Button>
          </div>
        </div>

        {/* Over budget alert */}
        {isOverBudget && (
          <div className="budget-alert animate-fade-in">
            <AlertTriangle size={18} />
            <div>
              <strong>Over Budget!</strong>
              <span>You've spent ${totalSpent} of your ${totalBudget} budget.</span>
            </div>
          </div>
        )}

        <div className="itinerary-layout">
          {/* Day-wise itinerary */}
          <div className="itinerary-days">
            {Array.isArray(days) && days.length > 0 ? (
              days.map((day, i) => (
                <div key={i} className={`day-card animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
                  <div className="day-header">
                    <h3 className="day-title">
                      <span className="day-number">Day {day.dayNumber || i + 1}</span>
                      {day.city && <span className="day-city"><MapPin size={12} /> {day.city}</span>}
                    </h3>
                    {day.date && <span className="day-date">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>}
                  </div>
                  <div className="day-activities">
                    {(day.activities || []).map((act, ai) => (
                      <div key={ai} className="day-activity">
                        <div className="day-activity-info">
                          <span className="day-activity-name">{act.name}</span>
                          {act.time && <span className="day-activity-time"><Clock size={12} /> {act.time}</span>}
                          {act.category && <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{act.category}</span>}
                        </div>
                        <span className="day-activity-cost">
                          {act.cost !== undefined ? `$${act.cost}` : '—'}
                        </span>
                      </div>
                    ))}
                    {(!day.activities || day.activities.length === 0) && (
                      <p className="day-empty">No activities planned</p>
                    )}
                  </div>
                  {day.totalCost !== undefined && (
                    <div className="day-total">
                      <span>Day Total</span>
                      <span>${day.totalCost}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="empty-state">
                <Calendar size={48} />
                <h3>No itinerary data</h3>
                <p>Start building your itinerary</p>
                <Button icon={Edit} onClick={() => navigate(`/trips/${tripId}/build`)}>Build Itinerary</Button>
              </div>
            )}
          </div>

          {/* Budget sidebar */}
          <div className="budget-sidebar">
            <BudgetSection budget={budget} />
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        shareUrl={shareUrl}
      />
    </div>
  );
}
