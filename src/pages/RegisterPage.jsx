import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Globe, User, Camera } from 'lucide-react';
import { authAPI } from '../api/auth.api';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';
import './RegisterPage.css';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  additionalInfo: z.string().optional(),
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [photo, setPhoto] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    try {
      await authAPI.signup({ ...data, photo });
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      setServerError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="login-bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <div className="register-container animate-fade-in-up">
        <div className="login-header">
          <div className="login-logo">
            <Globe size={32} className="login-logo-icon" />
            <h1 className="login-logo-text">GlobeTrotter</h1>
          </div>
          <p className="login-subtitle">Create your account and start exploring</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="register-form">
          {serverError && (
            <div className="login-error animate-fade-in">{serverError}</div>
          )}

          <div className="register-avatar" onClick={() => document.getElementById('avatar-input').click()} style={{ cursor: 'pointer' }}>
            <input
              type="file"
              id="avatar-input"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoChange}
            />
            {photo ? (
              <img src={photo} alt="Avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div className="avatar-placeholder">
                <Camera size={24} />
              </div>
            )}
            <span className="avatar-label">{photo ? 'Change Photo' : 'Upload Photo'}</span>
          </div>

          <div className="register-grid">
            <Input label="First Name" placeholder="John" error={errors.firstName?.message} {...register('firstName')} />
            <Input label="Last Name" placeholder="Doe" error={errors.lastName?.message} {...register('lastName')} />
          </div>

          <div className="register-grid">
            <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
            <Input label="Password" type="password" placeholder="Min 6 characters" error={errors.password?.message} {...register('password')} />
          </div>

          <div className="register-grid">
            <Input label="Phone" placeholder="+1 234 567 890" error={errors.phone?.message} {...register('phone')} />
            <Input label="City" placeholder="New York" error={errors.city?.message} {...register('city')} />
          </div>

          <Input label="Country" placeholder="United States" error={errors.country?.message} {...register('country')} />

          <Input label="Additional Information" type="textarea" placeholder="Tell us about yourself..." error={errors.additionalInfo?.message} {...register('additionalInfo')} />

          <Button type="submit" fullWidth disabled={loading} size="lg">
            {loading ? 'Creating Account...' : 'Register'}
          </Button>
        </form>

        <div className="login-footer">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
