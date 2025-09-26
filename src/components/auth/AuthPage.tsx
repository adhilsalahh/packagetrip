import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mountain } from 'lucide-react';
import SignUpForm from './SignUpForm';
import SignInForm from './SignInForm';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  const handleAuthSuccess = () => {
    // Redirect to dashboard after successful authentication
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-3 mb-8">
              <Mountain className="h-12 w-12 text-green-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Kerala Trekking</h1>
                <p className="text-green-600 font-medium">God's Own Adventures</p>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              {mode === 'signin' ? 'Welcome Back!' : 'Start Your Adventure'}
            </h2>
            
            <p className="text-xl text-gray-600 mb-8">
              {mode === 'signin' 
                ? 'Sign in to access your bookings, wishlist, and continue your trekking journey with us.'
                : 'Join thousands of adventurers who have discovered the beauty of Kerala through our expertly guided treks.'
              }
            </p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">50+</div>
                <div className="text-gray-600">Trek Routes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">10K+</div>
                <div className="text-gray-600">Happy Trekkers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">15+</div>
                <div className="text-gray-600">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">4.8★</div>
                <div className="text-gray-600">Average Rating</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Why Choose Kerala Trekking?</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span>Expert local guides with deep knowledge</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span>Small groups for personalized experience</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span>Comprehensive safety measures</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span>Eco-friendly and sustainable tourism</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Forms */}
        <div className="w-full">
          {mode === 'signin' ? (
            <SignInForm
              onSuccess={handleAuthSuccess}
              onSwitchToSignUp={() => setMode('signup')}
            />
          ) : (
            <SignUpForm
              onSuccess={handleAuthSuccess}
              onSwitchToSignIn={() => setMode('signin')}
            />
          )}

          {/* Mobile Branding */}
          <div className="lg:hidden mt-8 text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Mountain className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Kerala Trekking</h1>
                <p className="text-green-600 text-sm">God's Own Adventures</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Discover the untouched beauty of Kerala through expertly guided trekking adventures
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;