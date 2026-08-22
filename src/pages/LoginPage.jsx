import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Globe, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../api/auth.api';
import useAuth from '../hooks/useAuth';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import './LoginPage.css';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    try {
      const res = await authAPI.login(data);
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <div className="login-container animate-fade-in-up">
        <div className="login-header">
          <div className="login-logo">
            <Globe size={32} className="login-logo-icon" />
            <h1 className="login-logo-text">GlobeTrotter</h1>
          </div>
          <p className="login-subtitle">Sign in to plan your next adventure</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          {serverError && (
            <div className="login-error animate-fade-in">{serverError}</div>
          )}

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            icon={Mail}
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="password-field">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              icon={Lock}
              error={errors.password?.message}
              {...register('password')}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <Button type="submit" fullWidth disabled={loading} size="lg">
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

          <div className="login-divider">
            <span>or explore with demo</span>
          </div>

          <div className="demo-buttons">
            <Button
              type="button"
              variant="outline"
              size="md"
              fullWidth
              onClick={() => {
                login(
                  {
                    id: 1,
                    firstName: 'Alex',
                    lastName: 'Morgan',
                    email: 'alex.morgan@example.com',
                    role: 'USER',
                  },
                  'demo_jwt_token_user_123'
                );
                navigate('/dashboard');
              }}
            >
              Demo Traveler
            </Button>
            <Button
              type="button"
              variant="outline"
              size="md"
              fullWidth
              onClick={() => {
                login(
                  {
                    id: 99,
                    firstName: 'Admin',
                    lastName: 'User',
                    email: 'admin@globetrotter.io',
                    role: 'ADMIN',
                  },
                  'demo_jwt_token_admin_999'
                );
                navigate('/admin');
              }}
            >
              Demo Admin
            </Button>
          </div>
        </form>

        <div className="login-footer">
          <p>Don't have an account? <Link to="/register">Create one</Link></p>
        </div>
      </div>
    </div>
  );
}
