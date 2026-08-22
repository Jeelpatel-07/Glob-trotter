import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, Map, TrendingUp, Activity, Shield } from 'lucide-react';
import { adminAPI } from '../api/admin.api';
import Navbar from '../components/common/Navbar';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import ListToolbar from '../components/common/ListToolbar';
import './AdminPage.css';

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444'];

export default function AdminPage() {
  const [userSearch, setUserSearch] = useState('');

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: adminAPI.getAnalytics,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users', userSearch],
    queryFn: () => adminAPI.getUsers({ search: userSearch }),
  });

  const analytics = analyticsData?.data || analyticsData || {};
  const users = Array.isArray(usersData?.data || usersData) ? (usersData?.data || usersData) : [];

  const stats = [
    { label: 'Total Users', value: analytics.totalUsers || 0, icon: Users, color: '#3b82f6' },
    { label: 'Total Trips', value: analytics.totalTrips || 0, icon: Map, color: '#8b5cf6' },
    { label: 'Active Today', value: analytics.activeToday || 0, icon: Activity, color: '#22c55e' },
    { label: 'Growth', value: `${analytics.growth || 0}%`, icon: TrendingUp, color: '#f59e0b' },
  ];

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content-wide">
        <div className="admin-header">
          <Shield size={24} className="admin-icon" />
          <h1 className="page-title" style={{ marginBottom: 0 }}>Admin Panel</h1>
        </div>

        {analyticsLoading ? (
          <Loader fullPage text="Loading analytics..." />
        ) : (
          <>
            {/* Stats */}
            <div className="dashboard-stats">
              {stats.map((stat, i) => (
                <div key={i} className="stat-card animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <stat.icon size={20} style={{ color: stat.color, padding: 10, background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)' }} />
                  <div className="stat-info">
                    <span className="stat-value">{stat.value}</span>
                    <span className="stat-label">{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="admin-charts">
              {analytics.userGrowth && (
                <Card className="admin-chart-card">
                  <h3 className="section-title">User Growth</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={analytics.userGrowth}>
                      <XAxis dataKey="month" tick={{ fill: '#6b6b6b', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#6b6b6b', fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8 }} />
                      <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {analytics.tripsByRegion && (
                <Card className="admin-chart-card">
                  <h3 className="section-title">Trips by Region</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={analytics.tripsByRegion} cx="50%" cy="50%" outerRadius={90} dataKey="count" nameKey="region">
                        {(analytics.tripsByRegion || []).map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              )}
            </div>

            {/* Users Table */}
            <section style={{ marginTop: 32 }}>
              <h2 className="section-title">Users</h2>
              <ListToolbar onSearch={setUserSearch} searchPlaceholder="Search users..." />

              {usersLoading ? (
                <Loader text="Loading users..." />
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Trips</th>
                        <th>Joined</th>
                        <th>Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, i) => (
                        <tr key={u.id || i}>
                          <td>{u.firstName} {u.lastName}</td>
                          <td>{u.email}</td>
                          <td>{u.tripCount || 0}</td>
                          <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                          <td><span className={`badge ${u.role === 'ADMIN' ? 'badge-red' : 'badge-gray'}`}>{u.role || 'USER'}</span></td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No users found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
