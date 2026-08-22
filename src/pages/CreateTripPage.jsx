import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Image } from 'lucide-react';
import { tripsAPI } from '../api/trips.api';
import Navbar from '../components/common/Navbar';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';
import './CreateTripPage.css';

const tripSchema = z.object({
  name: z.string().min(1, 'Trip name is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  description: z.string().optional(),
}).refine(data => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export default function CreateTripPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(tripSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await tripsAPI.create(data);
      const tripId = res?.data?.id || res?.id;
      toast.success('Trip created!');
      navigate(tripId ? `/trips/${tripId}/build` : '/trips');
    } catch (err) {
      toast.error(err.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content" style={{ maxWidth: 640 }}>
        <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate(-1)} style={{ marginBottom: 24 }}>
          Back
        </Button>

        <h1 className="page-title">Create a New Trip</h1>
        <p className="page-subtitle">Fill in the details to start planning your adventure</p>

        <form onSubmit={handleSubmit(onSubmit)} className="create-trip-form animate-fade-in-up">
          <div className="cover-upload">
            <Image size={32} />
            <span>Add Cover Photo</span>
          </div>

          <Input label="Trip Name" placeholder="e.g., European Summer 2025" error={errors.name?.message} {...register('name')} />

          <div className="register-grid">
            <Input label="Start Date" type="date" error={errors.startDate?.message} {...register('startDate')} />
            <Input label="End Date" type="date" error={errors.endDate?.message} {...register('endDate')} />
          </div>

          <Input label="Description" type="textarea" placeholder="What's this trip about?" {...register('description')} />

          <Button type="submit" fullWidth size="lg" disabled={loading}>
            {loading ? 'Creating...' : 'Create Trip & Start Building'}
          </Button>
        </form>
      </div>
    </div>
  );
}
