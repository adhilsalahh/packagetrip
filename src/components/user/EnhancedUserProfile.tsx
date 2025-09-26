import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, MapPin, Activity, TrendingUp, Clock, Package, Heart, Star, CreditCard as Edit, Save, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getUserProfileWithStats, 
  updateUserProfileWithLogging, 
  getUserActivityHistory,
  UserProfileWithStats,
  UserActivity
} from '../../lib/userActivity';

const EnhancedUserProfile: React.FC = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<UserProfileWithStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    bio: '',
    emergency_contact: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfileData();
      fetchRecentActivity();
    }
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getUserProfileWithStats(user.id);
      setProfileData(data);
      
      if (data?.profile) {
        setEditForm({
          name: data.profile.name || '',
          phone: data.profile.phone || '',
          bio: data.profile.bio || '',
          emergency_contact: data.profile.emergency_contact || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    if (!user) return;

    try {
      const activity = await getUserActivityHistory(user.id, 10);
      setRecentActivity(activity);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const handleEditToggle = () => {
    setEditing(!editing);
    if (editing) {
      // Reset form when canceling
      if (profileData?.profile) {
        setEditForm({
          name: profileData.profile.name || '',
          phone: profileData.profile.phone || '',
          bio: profileData.profile.bio || '',
          emergency_contact: profileData.profile.emergency_contact || ''
        });
      }
    }
  };

  const handleSave = async () => {
    if (!user || !profileData) return;

    try {
      setSaving(true);
      await updateUserProfileWithLogging(user.id, editForm);
      await fetchProfileData(); // Refresh data
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatActivityType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Unable to load profile data</p>
        </div>
      </div>
    );
  }

  const { profile, booking_stats, activity_stats } = profileData;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                <User className="h-12 w-12 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
                <div className="flex items-center space-x-4 text-green-100">
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4" />
                    <span>{profile.email}</span>
                  </div>
                  {profile.phone && (
                    <div className="flex items-center space-x-1">
                      <Phone className="h-4 w-4" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-1 mt-2 text-green-200">
                  <Calendar className="h-4 w-4" />
                  <span>Member since {formatDate(profile.created_at)}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleEditToggle}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              {editing ? <X className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
              <span>{editing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
              
              {editing ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter 10-digit phone number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                    <input
                      type="text"
                      value={editForm.emergency_contact}
                      onChange={(e) => setEditForm(prev => ({ ...prev, emergency_contact: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Emergency contact information"
                    />
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors flex items-center space-x-2"
                    >
                      <Save className="h-5 w-5" />
                      <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Full Name</label>
                      <p className="text-lg font-semibold text-gray-900">{profile.name}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email Address</label>
                      <p className="text-lg text-gray-900">{profile.email}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone Number</label>
                      <p className="text-lg text-gray-900">{profile.phone || 'Not provided'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Emergency Contact</label>
                      <p className="text-lg text-gray-900">{profile.emergency_contact || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  {profile.bio && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Bio</label>
                      <p className="text-gray-900 mt-1">{profile.bio}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Activity className="h-6 w-6 mr-2 text-green-600" />
                Recent Activity
              </h2>
              
              {recentActivity.length === 0 ? (
                <p className="text-gray-600">No recent activity</p>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Activity className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {formatActivityType(activity.activity_type)}
                        </p>
                        {activity.activity_description && (
                          <p className="text-sm text-gray-600">{activity.activity_description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-8">
            {/* Booking Statistics */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <TrendingUp className="h-6 w-6 mr-2 text-green-600" />
                Booking Statistics
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Package className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-semibold text-blue-900">Total Bookings</p>
                      <p className="text-sm text-blue-700">All time</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    {booking_stats.total_bookings}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Star className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-900">Completed</p>
                      <p className="text-sm text-green-700">Successful treks</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    {booking_stats.completed_bookings}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-8 w-8 text-yellow-600" />
                    <div>
                      <p className="font-semibold text-yellow-900">Pending</p>
                      <p className="text-sm text-yellow-700">Awaiting confirmation</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-yellow-600">
                    {booking_stats.pending_bookings}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="font-semibold text-purple-900">Total Spent</p>
                      <p className="text-sm text-purple-700">On adventures</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-purple-600">
                    ₹{booking_stats.total_spent.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Statistics */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Account Statistics</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Activities</span>
                  <span className="font-semibold">{activity_stats.total_activities}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-semibold">
                    {activity_stats.registration_date 
                      ? formatDate(activity_stats.registration_date)
                      : formatDate(profile.created_at)
                    }
                  </span>
                </div>
                
                {activity_stats.last_activity && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Last Activity</span>
                    <span className="font-semibold">
                      {formatDate(activity_stats.last_activity)}
                    </span>
                  </div>
                )}
                
                {booking_stats.last_booking_date && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Last Booking</span>
                    <span className="font-semibold">
                      {formatDate(booking_stats.last_booking_date)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedUserProfile;