import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Mountain, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, user, loading: authLoading, initialized } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if already logged in as admin
  React.useEffect(() => {
    if (initialized && user?.is_admin) {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { user: signedInUser, error: signInError } = await signIn(formData.email, formData.password);
      
      if (signInError) {
        throw signInError;
      }
      
      setSuccess('Authentication successful! Checking admin privileges...');
      
      // Wait a moment for user state to update, then check admin status
      setTimeout(() => {
        if (signedInUser?.user_metadata?.is_admin || user?.is_admin) {
          navigate('/admin/dashboard');
        } else {
          setError('Access denied. This account does not have administrator privileges.');
          setLoading(false);
        }
      }, 1500);
      
    } catch (err: any) {
      console.error('Admin login error:', err);
      
      let errorMessage = err.message;
      
      if (errorMessage.includes('Invalid login credentials')) {
        errorMessage = 'Invalid administrator credentials. Please verify your email and password.';
      } else if (errorMessage.includes('Email not confirmed')) {
        errorMessage = 'Administrator account not verified. Please contact system administrator.';
      } else if (errorMessage.includes('Too many requests')) {
        errorMessage = 'Too many login attempts. Please wait before trying again.';
      }
      
      setError(errorMessage);
      setLoading(false);
    } finally {
      // Loading state is managed above for admin check
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (authLoading || !initialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!initialized ? 'Initializing...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-red-600 px-8 py-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Mountain className="h-8 w-8 text-white" />
            <h1 className="text-2xl font-bold text-white">Kerala Trekking</h1>
          </div>
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Shield className="h-6 w-6 text-red-200" />
            <h2 className="text-xl font-semibold text-white">Admin Portal</h2>
          </div>
          <p className="text-red-100 text-sm">Secure Administrative Access</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-800 font-medium">Authorized Personnel Only</p>
            </div>
            <p className="text-sm text-red-700 mt-1">
              This portal is restricted to authorized administrators only.
            </p>
          </div>

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <p className="text-green-700 text-sm font-medium">Success</p>
              </div>
              <p className="text-green-600 text-sm mt-1">{success}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-700 text-sm font-medium">Authentication Failed</p>
              </div>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Administrator Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                autoComplete="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter admin email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Verifying credentials...</span>
                </div>
              ) : (
                'Access Admin Panel'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              ← Back to Main Site
            </button>
            <div className="mt-4 text-xs text-gray-500">
              <p>Need admin access? Contact system administrator</p>
              <p>Email: admin@keralatrekking.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;