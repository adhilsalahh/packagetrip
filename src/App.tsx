import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/common/Header';
import Hero from './components/home/Hero';
import PackagesList from './components/home/PackagesList';
import Footer from './components/home/Footer';
import EnhancedUserDashboard from './components/user/EnhancedUserDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminLogin from './components/admin/AdminLogin';
import { useAuth } from './contexts/AuthContext';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAdmin = user?.email === 'varthripaadikkam@gmail.com';

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAdminRoute && <Header />}
      <main>
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <PackagesList />
            </>
          } />
          <Route path="/dashboard" element={<EnhancedUserDashboard />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            isAdmin ? <AdminDashboard /> : <AdminLogin />
          } />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
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