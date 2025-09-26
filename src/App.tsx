import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/common/Header';
import Hero from './components/home/Hero';
import PackagesList from './components/home/PackagesList';
import Footer from './components/home/Footer';
import EnhancedUserDashboard from './components/user/EnhancedUserDashboard';
import EnhancedUserProfile from './components/user/EnhancedUserProfile';
import AuthPage from './components/auth/AuthPage';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminLogin from './components/admin/AdminLogin';
import { useAuth } from './contexts/AuthContext';

const AppContent: React.FC = () => {
  const { user, loading, initialized } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthRoute = location.pathname === '/auth';
  const isAdmin = user?.is_admin === true;

  // Show loading while initializing authentication
  if (loading || !initialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {!initialized ? 'Initializing...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAdminRoute && !isAuthRoute && <Header />}
      <main>
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <PackagesList />
            </>
          } />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<EnhancedUserDashboard />} />
          <Route path="/profile" element={<EnhancedUserProfile />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            isAdmin ? <AdminDashboard /> : <AdminLogin />
          } />
        </Routes>
      </main>
      {!isAdminRoute && !isAuthRoute && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;