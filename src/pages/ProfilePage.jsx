import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { User, Camera, Save, Trash2, Globe } from 'lucide-react';
import { authAPI } from '../api/auth.api';
import useAuth from '../hooks/useAuth';
import Navbar from '../components/common/Navbar';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import './ProfilePage.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [photo, setPhoto] = useState('');

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: authAPI.getProfile,
  });

  const { data: savedData, refetch: refetchSaved } = useQuery({
    queryKey: ['saved-destinations'],
    queryFn: authAPI.getSavedDestinations,
  });

  const profile = profileData?.data || profileData || user;
  const savedDestinations = Array.isArray(savedData?.data || savedData) ? (savedData?.data || savedData) : [];

  const { register, handleSubmit, formState: { errors } } = useForm({
    values: {
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      city: profile?.city || '',
      country: profile?.country || '',
      language: profile?.language || 'English',
    },
  });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
        if (!editing) {
          // If not in editing mode, update photo immediately
          updateMutation.mutate({ photo: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const updateMutation = useMutation({
    mutationFn: (data) => authAPI.updateProfile(data),
    onSuccess: (res) => {
      updateUser(res?.data || res);
      toast.success('Profile updated');
      setEditing(false);
      setPhoto('');
    },
    onError: (err) => toast.error(err.message || 'Update failed'),
  });

  const deleteSavedDestMutation = useMutation({
    mutationFn: (cityId) => authAPI.deleteSavedDestination(cityId),
    onSuccess: () => {
      toast.success('Destination removed');
      refetchSaved();
    },
    onError: (err) => toast.error(err.message || 'Failed to remove destination'),
  });

  const deleteMutation = useMutation({
    mutationFn: authAPI.deleteAccount,
    onSuccess: () => {
      toast.success('Account deleted');
      logout();
      navigate('/login');
    },
    onError: (err) => toast.error(err.message || 'Delete failed'),
  });

  if (isLoading) return <div className="page-container"><Navbar /><Loader fullPage text="Loading profile..." /></div>;

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content" style={{ maxWidth: 700 }}>
        <h1 className="page-title">My Profile</h1>

        <Card className="profile-card animate-fade-in-up">
          <div className="profile-header">
            <div className="profile-avatar" onClick={() => document.getElementById('avatar-input').click()} style={{ cursor: 'pointer' }}>
              <input
                type="file"
                id="avatar-input"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhotoChange}
              />
              {photo || profile?.photo ? (
                <img src={photo || profile.photo} alt={profile.firstName} />
              ) : (
                <User size={40} />
              )}
              <button className="profile-avatar-edit" type="button"><Camera size={14} /></button>
            </div>
            <div className="profile-name">
              <h2>{profile?.firstName} {profile?.lastName}</h2>
              <p>{profile?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="profile-form">
            <div className="register-grid">
              <Input label="First Name" disabled={!editing} error={errors.firstName?.message} {...register('firstName')} />
              <Input label="Last Name" disabled={!editing} error={errors.lastName?.message} {...register('lastName')} />
            </div>
            <Input label="Email" type="email" disabled={!editing} {...register('email')} />
            <div className="register-grid">
              <Input label="Phone" disabled={!editing} {...register('phone')} />
              <Input label="City" disabled={!editing} {...register('city')} />
            </div>
            <div className="register-grid">
              <Input label="Country" disabled={!editing} {...register('country')} />
              <div className="input-group input-full">
                <label className="input-label">Language Preference</label>
                <div className="input-wrapper">
                  <select
                    disabled={!editing}
                    className="input-field"
                    style={{
                      width: '100%',
                      background: 'var(--bg-input)',
                      border: 'none',
                      color: 'var(--text-primary)',
                      padding: '10px 14px',
                      fontSize: '0.875rem',
                      outline: 'none',
                      borderRadius: 'var(--radius-md)'
                    }}
                    {...register('language')}
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Japanese">Japanese</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="profile-actions">
              {editing ? (
                <>
                  <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                  <Button type="submit" icon={Save} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setEditing(true)}>Edit Profile</Button>
              )}
            </div>
          </form>
        </Card>

        {/* Saved Destinations Section */}
        <Card className="profile-card animate-fade-in-up" style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Globe size={20} style={{ color: 'var(--accent)' }} />
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Saved Destinations</h3>
          </div>
          {savedDestinations.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {savedDestinations.map((dest, i) => (
                <div key={dest.id || i} style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 12
                }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{dest.name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{dest.country || 'Destination'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/search/activities?cityId=${dest.id}&cityName=${dest.name}`)} style={{ padding: '4px 8px', fontSize: '0.75rem', flex: 1 }}>
                      Explore
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => deleteSavedDestMutation.mutate(dest.id)} disabled={deleteSavedDestMutation.isPending} style={{ padding: '4px 8px', fontSize: '0.75rem', flex: 1 }}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
              No destinations bookmarked yet. Explore cities to save them to your profile.
            </p>
          )}
        </Card>

        <div className="profile-danger-zone">
          <h3>Danger Zone</h3>
          <p>Permanently delete your account and all associated data.</p>
          <Button variant="danger" size="sm" icon={Trash2} onClick={() => setShowDelete(true)}>Delete Account</Button>
        </div>
      </div>

      <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="Delete Account" size="sm">
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
          This will permanently delete your account, all trips, and all associated data. This cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <Button variant="ghost" onClick={() => setShowDelete(false)}>Cancel</Button>
          <Button variant="danger" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? 'Deleting...' : 'Yes, Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
