import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/common/Header';
import Hero from './components/home/Hero';
import PackagesList from './components/home/PackagesList';
import Footer from './components/home/Footer';
import EnhancedUserDashboard from './components/user/EnhancedUserDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import { useAuth } from './contexts/AuthContext';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.user_metadata?.is_admin || false;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <PackagesList />
            </>
          } />
          <Route path="/dashboard" element={<EnhancedUserDashboard />} />
          {isAdmin && <Route path="/admin" element={<AdminDashboard />} />}
        </Routes>
      </main>
      <Footer />
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