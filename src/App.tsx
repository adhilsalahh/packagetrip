import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/common/Header';
import Hero from './components/home/Hero';
import PackagesList from './components/home/PackagesList';
import Footer from './components/home/Footer';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>
          <Hero />
          <PackagesList />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;