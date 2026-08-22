import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import CreateTripPage from '../pages/CreateTripPage';
import MyTripsPage from '../pages/MyTripsPage';
import ItineraryBuilderPage from '../pages/ItineraryBuilderPage';
import ItineraryViewPage from '../pages/ItineraryViewPage';
import CitySearchPage from '../pages/CitySearchPage';
import ActivitySearchPage from '../pages/ActivitySearchPage';
import CalendarPage from '../pages/CalendarPage';
import ProfilePage from '../pages/ProfilePage';
import PublicTripPage from '../pages/PublicTripPage';
import CommunityPage from '../pages/CommunityPage';
import AdminPage from '../pages/AdminPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/public/trips/:shareToken" element={<PublicTripPage />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/trips" element={<ProtectedRoute><MyTripsPage /></ProtectedRoute>} />
      <Route path="/trips/new" element={<ProtectedRoute><CreateTripPage /></ProtectedRoute>} />
      <Route path="/trips/:tripId/build" element={<ProtectedRoute><ItineraryBuilderPage /></ProtectedRoute>} />
      <Route path="/trips/:tripId/itinerary" element={<ProtectedRoute><ItineraryViewPage /></ProtectedRoute>} />
      <Route path="/trips/:tripId/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
      <Route path="/search/cities" element={<ProtectedRoute><CitySearchPage /></ProtectedRoute>} />
      <Route path="/search/activities" element={<ProtectedRoute><ActivitySearchPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
