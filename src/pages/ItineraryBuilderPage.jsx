import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Plus, Calendar, Search, ArrowLeft } from 'lucide-react';
import { tripsAPI } from '../api/trips.api';
import { stopsAPI } from '../api/stops.api';
import { citiesAPI } from '../api/cities.api';
import { activitiesAPI } from '../api/activities.api';
import useTripBuilderStore from '../store/tripBuilderStore';
import useDebounce from '../hooks/useDebounce';
import Navbar from '../components/common/Navbar';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import SectionBlock from '../components/itinerary/SectionBlock';
import toast from 'react-hot-toast';
import './ItineraryBuilderPage.css';

function SearchModal({ isOpen, onClose, title, type, onSelect }) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: [type, debouncedSearch],
    queryFn: () =>
      type === 'cities'
        ? citiesAPI.search({ search: debouncedSearch })
        : activitiesAPI.search({ search: debouncedSearch }),
    enabled: isOpen,
  });

  const results = Array.isArray(data?.data || data) ? data?.data || data : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="search-modal-input">
        <Search size={16} />
        <input
          type="text"
          placeholder={`Search ${type}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
      </div>
      <div className="search-modal-results">
        {isLoading ? (
          <Loader text="Searching..." />
        ) : results.length > 0 ? (
          results.map((item, i) => (
            <div
              key={item.id || i}
              className="search-modal-item"
              onClick={() => {
                onSelect(item);
                onClose();
              }}
            >
              <div>
                <div className="search-modal-item-name">{item.name}</div>
                <div className="search-modal-item-sub">{item.country || item.category || ''}</div>
              </div>
              <Plus size={16} className="search-modal-add-icon" />
            </div>
          ))
        ) : (
          <p className="search-modal-empty">No results found</p>
        )}
      </div>
    </Modal>
  );
}

export default function ItineraryBuilderPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const {
    sections,
    setSections,
    addSection,
    updateSection,
    removeSection,
    reorderSections,
    addActivityToSection,
    setTrip,
  } = useTripBuilderStore();

  const [citySearchIndex, setCitySearchIndex] = useState(null);
  const [activitySearchIndex, setActivitySearchIndex] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const { data: tripData, isLoading: tripLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripsAPI.getById(tripId),
  });

  const { data: stopsData, isLoading: stopsLoading } = useQuery({
    queryKey: ['stops', tripId],
    queryFn: () => stopsAPI.getByTrip(tripId),
  });

  const trip = tripData?.data || tripData;

  useEffect(() => {
    if (trip) setTrip(trip);
  }, [trip, setTrip]);

  useEffect(() => {
    const stops = stopsData?.data || stopsData;
    if (Array.isArray(stops) && stops.length > 0) {
      setSections(
        stops.map((s, i) => ({
          id: s.id,
          tempId: s.id || Date.now() + i,
          cityId: s.cityId || s.city_id,
          cityName: s.cityName || s.city_name || s.city?.name || '',
          startDate: s.startDate || s.start_date || '',
          endDate: s.endDate || s.end_date || '',
          budget: s.budget || '',
          order: s.order || i,
          activities: s.activities || [],
        }))
      );
    }
  }, [stopsData, setSections]);

  const reorderMutation = useMutation({
    mutationFn: (orderedStops) => stopsAPI.reorder(tripId, orderedStops),
  });

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIdx = sections.findIndex((s) => (s.tempId || s.id) === active.id);
      const newIdx = sections.findIndex((s) => (s.tempId || s.id) === over.id);
      const newSections = arrayMove(sections, oldIdx, newIdx);
      reorderSections(newSections);
      reorderMutation.mutate(newSections.map((s, i) => ({ id: s.id, order: i })));
    }
  };

  const handleCitySelect = (item) => {
    if (citySearchIndex !== null) {
      updateSection(citySearchIndex, { cityId: item.id, cityName: item.name });
    }
  };

  const handleActivitySelect = (item) => {
    if (activitySearchIndex !== null) {
      addActivityToSection(activitySearchIndex, item);
      if (sections[activitySearchIndex]?.id) {
        stopsAPI.addActivity(sections[activitySearchIndex].id, { activityId: item.id }).catch(() => {});
      }
    }
  };

  if (tripLoading || stopsLoading) {
    return (
      <div className="page-container">
        <Navbar />
        <Loader fullPage text="Loading itinerary..." />
      </div>
    );
  }

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content" style={{ maxWidth: 800 }}>
        <Button
          variant="ghost"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate(`/trips/${tripId}/itinerary`)}
          style={{ marginBottom: 16 }}
        >
          View Itinerary
        </Button>

        <div className="builder-header">
          <div>
            <h1 className="page-title" style={{ marginBottom: 4 }}>
              {trip?.name || 'Build Itinerary'}
            </h1>
            {trip && (
              <p className="page-subtitle" style={{ marginBottom: 0 }}>
                <Calendar size={14} style={{ display: 'inline', verticalAlign: '-2px' }} />{' '}
                {new Date(trip.startDate || trip.start_date || Date.now()).toLocaleDateString()} –{' '}
                {new Date(trip.endDate || trip.end_date || Date.now()).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={sections.map((s) => s.tempId || s.id)}
            strategy={verticalListSortingStrategy}
          >
            {sections.map((section, index) => (
              <SectionBlock
                key={section.tempId || section.id || index}
                section={section}
                index={index}
                onUpdate={updateSection}
                onRemove={removeSection}
                onOpenCitySearch={(i) => setCitySearchIndex(i)}
                onOpenActivitySearch={(i) => setActivitySearchIndex(i)}
              />
            ))}
          </SortableContext>
        </DndContext>

        <button className="add-section-btn" onClick={addSection}>
          <Plus size={18} />
          <span>+ Add another Section</span>
        </button>
      </div>

      <SearchModal
        isOpen={citySearchIndex !== null}
        onClose={() => setCitySearchIndex(null)}
        title="Search Cities"
        type="cities"
        onSelect={handleCitySelect}
      />

      <SearchModal
        isOpen={activitySearchIndex !== null}
        onClose={() => setActivitySearchIndex(null)}
        title="Search Activities"
        type="activities"
        onSelect={handleActivitySelect}
      />
    </div>
  );
}
