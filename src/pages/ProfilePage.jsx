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

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: authAPI.getProfile,
  });

  const profile = profileData?.data || profileData || user;

  const { register, handleSubmit, formState: { errors } } = useForm({
    values: {
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      city: profile?.city || '',
      country: profile?.country || '',
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => authAPI.updateProfile(data),
    onSuccess: (res) => {
      updateUser(res?.data || res);
      toast.success('Profile updated');
      setEditing(false);
    },
    onError: (err) => toast.error(err.message || 'Update failed'),
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
            <div className="profile-avatar">
              {profile?.photo ? (
                <img src={profile.photo} alt={profile.firstName} />
              ) : (
                <User size={40} />
              )}
              <button className="profile-avatar-edit"><Camera size={14} /></button>
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
            <Input label="Country" disabled={!editing} {...register('country')} />

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
