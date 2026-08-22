import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2, MapPin, DollarSign, ChevronRight } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';

export default function SectionBlock({
  section,
  index,
  onUpdate,
  onRemove,
  onOpenCitySearch,
  onOpenActivitySearch,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.tempId || section.id || index,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} className="builder-section animate-fade-in-up">
      <div className="section-drag-handle" {...attributes} {...listeners}>
        <GripVertical size={18} />
      </div>
      <div className="section-content">
        <div className="section-header">
          <h3 className="section-number">Section {index + 1}</h3>
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={() => onRemove(index)}
            className="section-remove"
          />
        </div>

        <div className="section-city" onClick={() => onOpenCitySearch(index)}>
          <MapPin size={16} />
          <span>{section.cityName || 'Select a city...'}</span>
          <ChevronRight size={14} className="section-city-arrow" />
        </div>

        <div className="section-fields">
          <Input
            label="Start Date"
            type="date"
            value={section.startDate || ''}
            onChange={(e) => onUpdate(index, { startDate: e.target.value })}
          />
          <Input
            label="End Date"
            type="date"
            value={section.endDate || ''}
            onChange={(e) => onUpdate(index, { endDate: e.target.value })}
          />
          <Input
            label="Budget of this section"
            type="number"
            placeholder="$0.00"
            icon={DollarSign}
            value={section.budget || ''}
            onChange={(e) => onUpdate(index, { budget: e.target.value })}
          />
        </div>

        {/* Activities list */}
        <div className="section-activities">
          <div className="flex-between" style={{ marginBottom: 8 }}>
            <span className="section-activities-title">
              Activities ({section.activities?.length || 0})
            </span>
            <Button
              variant="ghost"
              size="sm"
              icon={Plus}
              onClick={() => onOpenActivitySearch(index)}
            >
              + Add Activity
            </Button>
          </div>
          {section.activities?.length > 0 ? (
            <div className="activity-list">
              {section.activities.map((act, ai) => (
                <div key={act.id || ai} className="activity-item">
                  <span className="activity-name">{act.name}</span>
                  {act.cost !== undefined && <span className="activity-cost">${act.cost}</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className="section-activities-empty">No activities added to this section yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
