import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mountain, User, Menu, X, Heart, MapPin, Phone, Mail, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from './AuthModal';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'admin'>('signin');

  const handleAuthClick = (mode: 'signin' | 'signup' | 'admin') => {
    if (mode === 'admin') {
      navigate('/admin');
    } else {
      navigate('/auth');
    }
    setIsMenuOpen(false); // Close mobile menu when opening auth modal
  };

  const isAdmin = user?.is_admin === true;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    { name: 'Packages', href: '#packages' },
    { name: 'Destinations', href: '#destinations' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' }
  ];

  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-50">
        {/* Top bar */}
        <div className="bg-green-600 text-white py-2 px-4 text-sm">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Phone className="h-4 w-4" />
                <span>+91 9876543210</span>
              </div>
              <div className="flex items-center space-x-1">
                <Mail className="h-4 w-4" />
                <span>info@keralatrekking.com</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>Kerala, India</span>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Mountain className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Kerala Trekking</h1>
                <p className="text-xs text-gray-500">God's Own Adventures</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-green-600 transition-colors duration-200 font-medium"
                >
                  {item.name}
                </a>
              ))}
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <button className="p-2 text-gray-600 hover:text-green-600 transition-colors">
                    <Heart className="h-5 w-5" />
                  </button>
                  <div className="relative group">
                    <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      <User className="h-5 w-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">
                        {user.name || user.email}
                      </span>
                      {isAdmin && <Shield className="h-4 w-4 text-red-600" />}
                    </button>
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-2">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user.name || 'User'}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                          {isAdmin && (
                            <span className="inline-flex items-center space-x-1 mt-1">
                              <Shield className="h-3 w-3 text-red-600" />
                              <span className="text-xs text-red-600 font-medium">Administrator</span>
                            </span>
                          )}
                        </div>
                        <button 
                          onClick={() => navigate('/dashboard')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          My Dashboard
                        </button>
                        <button 
                          onClick={() => navigate('/profile')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          My Profile
                        </button>
                        {isAdmin && (
                          <button 
                            onClick={() => navigate('/admin/dashboard')}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Admin Panel
                          </button>
                        )}
                        <hr className="my-1" />
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex space-x-3">
                  <button
                    onClick={() => handleAuthClick('signin')}
                    className="px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleAuthClick('signup')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block py-2 text-gray-700 hover:text-green-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              {!user && (
                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <button
                    onClick={() => handleAuthClick('signin')}
                    className="block w-full text-left py-2 text-green-600"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleAuthClick('signup')}
                    className="block w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center"
                  >
                    Sign Up
                  </button>
                  <button
                    onClick={() => handleAuthClick('admin')}
                    className="block w-full text-left py-2 text-red-600 text-sm"
                  >
                    Admin Access
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSwitchMode={(mode) => setAuthMode(mode)}
        />
      )}
    </>
  );
};

export default Header;