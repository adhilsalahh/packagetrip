import React, { useState } from 'react';
import { X, Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface AuthModalProps {
  mode: 'signin' | 'signup' | 'admin';
  onClose: () => void;
  onSwitchMode: (mode: 'signin' | 'signup' | 'admin') => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ mode, onClose, onSwitchMode }) => {
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect admin users after successful login
  React.useEffect(() => {
    if (user?.is_admin && mode === 'admin') {
      navigate('/admin/dashboard');
      onClose();
    }
  }, [user, mode, navigate, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
        if (!formData.name.trim()) {
          throw new Error('Name is required');
        }
        
        await signUp(formData.email, formData.password, formData.name, formData.phone);
        setSuccess('Account created successfully! Please check your email to verify your account.');
      } else {
        await signIn(formData.email, formData.password);
        
        // For admin mode, we need to check if user is actually admin
        if (mode === 'admin') {
          // The useEffect above will handle the redirect if user is admin
          // If not admin, we'll show an error
          setTimeout(() => {
            if (!user?.is_admin) {
              setError('Access denied. Admin privileges required.');
              setLoading(false);
            }
          }, 1000);
          return;
        } else {
          setSuccess('Signed in successfully!');
          setTimeout(() => onClose(), 1500);
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      
      // Provide user-friendly error messages
      let errorMessage = err.message;
      
      if (errorMessage.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (errorMessage.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and click the confirmation link before signing in.';
      } else if (errorMessage.includes('User not found')) {
        errorMessage = 'No account found with this email address.';
      } else if (errorMessage.includes('Too many requests')) {
        errorMessage = 'Too many login attempts. Please wait a moment and try again.';
      }
      
      setError(errorMessage);
    } finally {
      if (mode !== 'admin') {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const getTitle = () => {
    switch (mode) {
      case 'admin':
        return 'Admin Login';
      case 'signup':
        return 'Create Account';
      default:
        return 'Welcome Back';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            {mode === 'admin' && <Shield className="h-5 w-5 text-red-600" />}
            <h2 className="text-xl font-semibold text-gray-900">
              {getTitle()}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0"></div>
                <p className="text-red-700 text-sm font-medium">Error</p>
              </div>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"></div>
                <p className="text-green-700 text-sm font-medium">Success</p>
              </div>
              <p className="text-green-600 text-sm mt-1">{success}</p>
            </div>
          )}

          {mode === 'admin' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-800 font-medium">Admin Access Required</p>
              </div>
              <p className="text-sm text-red-700 mt-1">
                This portal is restricted to authorized administrators only. 
                Please use your admin credentials to access the system.
              </p>
            </div>
          )}

          {mode === 'signup' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Welcome to Kerala Trekking!</strong><br/>
                Create your account to book amazing trekking adventures across God's Own Country.
              </p>
            </div>
          )}

          {mode === 'signin' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>Welcome back!</strong><br/>
                Sign in to access your bookings, wishlist, and account settings.
              </p>
            </div>
          )}

          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  minLength={2}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  pattern="[0-9]{10}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter 10-digit phone number"
                />
                <p className="text-xs text-gray-500 mt-1">Format: 9876543210 (without +91)</p>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              autoComplete="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                minLength={6}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                required
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={mode === 'signup' ? 'Create a password (min 6 characters)' : 'Enter your password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {mode === 'signup' && (
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 6 characters long
              </p>
            )}
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  minLength={6}
                  autoComplete="new-password"
                  required
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              mode === 'admin' 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>
                  {mode === 'admin' ? 'Authenticating...' :
                   mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                </span>
              </div>
            ) : (
             mode === 'admin' ? 'Access Admin Panel' :
             mode === 'signin' ? 'Sign In' : 'Create Account'
            )}
          </button>

          {mode !== 'admin' && (
            <div className="text-center space-y-2">
              <span className="text-sm text-gray-600">
                {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
              </span>
              <button
                type="button"
                onClick={() => onSwitchMode(mode === 'signin' ? 'signup' : 'signin')}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
              
              <div className="border-t pt-2 mt-2">
                <button
                  type="button"
                  onClick={() => onSwitchMode('admin')}
                  className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center justify-center space-x-1"
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin Access</span>
                </button>
              </div>
            </div>
          )}

          {mode === 'admin' && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => onSwitchMode('signin')}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                ← Back to User Login
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AuthModal;