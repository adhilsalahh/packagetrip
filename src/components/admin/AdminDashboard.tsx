import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Mail,
  Phone,
  AlertCircle,
  Mountain
} from 'lucide-react';
import { AdminStats, BookingWithDetails } from '../../types/admin';
import { getAdminStats, getAllBookingsDetailed, updateBookingStatusWithNotification, getMessageStats } from '../../lib/admin';
import BookingManagement from './BookingManagement';
import PackageAvailabilityManager from './PackageAvailabilityManager';
import PackageListAdmin from './PackageListAdmin';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [messageStats, setMessageStats] = useState<any>(null);
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'packages' | 'availability' | 'messages'>('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, bookingsData, msgStats] = await Promise.all([
        getAdminStats(),
        getAllBookingsDetailed(),
        getMessageStats()
      ]);
      setStats(statsData);
      setBookings(bookingsData);
      setMessageStats(msgStats);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingStatusUpdate = async (bookingId: string, status: string) => {
    try {
      await updateBookingStatusWithNotification(bookingId, status, true);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalBookings}</p>
              <p className="text-sm text-blue-600 mt-1">All time bookings</p>
            </div>
            <Calendar className="h-12 w-12 text-blue-600 bg-blue-100 p-2 rounded-lg" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">₹{stats?.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">Confirmed + Completed</p>
            </div>
            <DollarSign className="h-12 w-12 text-green-600 bg-green-100 p-2 rounded-lg" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Packages</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalPackages}</p>
              <p className="text-sm text-purple-600 mt-1">Available for booking</p>
            </div>
            <Package className="h-12 w-12 text-purple-600 bg-purple-100 p-2 rounded-lg" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalUsers}</p>
              <p className="text-sm text-orange-600 mt-1">Registered customers</p>
            </div>
            <Users className="h-12 w-12 text-orange-600 bg-orange-100 p-2 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-yellow-600" />
            Pending Actions
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Confirmations</span>
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold">
                {stats?.pendingBookings}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">This Month's Bookings</span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                {stats?.monthlyBookings}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-green-600" />
            Message Statistics
          </h3>
          {messageStats && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Messages</span>
                <span className="font-semibold">{messageStats.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">WhatsApp Sent</span>
                <span className="text-green-600 font-semibold">{messageStats.whatsapp}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Emails Sent</span>
                <span className="text-blue-600 font-semibold">{messageStats.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Failed Messages</span>
                <span className="text-red-600 font-semibold">{messageStats.failed}</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => setActiveTab('bookings')}
              className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Manage Bookings</span>
              </div>
            </button>
            <button 
              onClick={() => setActiveTab('availability')}
              className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Manage Availability</span>
              </div>
            </button>
            <button 
              onClick={() => setActiveTab('messages')}
              className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Message Center</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Recent Bookings</h3>
          <button 
            onClick={() => setActiveTab('bookings')}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            View All →
          </button>
        </div>
        
        <div className="space-y-4">
          {bookings.slice(0, 5).map((booking) => (
            <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{booking.user.name}</p>
                  <p className="text-sm text-gray-600">{booking.package.title}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">₹{booking.total_amount.toLocaleString()}</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMessages = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Message Center</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Automated Messaging System</h3>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-blue-800 font-medium">System Status: Active</p>
              <p className="text-blue-700 text-sm mt-1">
                Automated WhatsApp and email notifications are being sent when bookings are confirmed.
                All messages are logged and tracked for delivery status.
              </p>
            </div>
          </div>
        </div>
        
        {messageStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{messageStats.total}</p>
              <p className="text-sm text-gray-600">Total Messages</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{messageStats.sent}</p>
              <p className="text-sm text-gray-600">Successfully Sent</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{messageStats.delivered}</p>
              <p className="text-sm text-gray-600">Delivered</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{messageStats.failed}</p>
              <p className="text-sm text-gray-600">Failed</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-red-600 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Mountain className="h-8 w-8" />
            <div>
              <h1 className="text-xl font-bold">Kerala Trekking - Admin Panel</h1>
              <p className="text-red-200 text-sm">Administrative Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-red-200">Welcome, Administrator</span>
            <button
              onClick={() => navigate('/')}
              className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg transition-colors"
            >
              Back to Site
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Comprehensive booking management with automated messaging</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'bookings', label: 'Booking Management', icon: Calendar },
              { id: 'packages', label: 'Package Management', icon: Package },
              { id: 'availability', label: 'Package Availability', icon: Package },
              { id: 'messages', label: 'Message Center', icon: MessageSquare }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'bookings' && (
          <BookingManagement 
            bookings={bookings} 
            onStatusUpdate={handleBookingStatusUpdate}
            onRefresh={fetchData}
          />
        )}
        {activeTab === 'packages' && <PackageListAdmin />}
        {activeTab === 'availability' && <PackageAvailabilityManager />}
        {activeTab === 'messages' && renderMessages()}
      </div>
    </div>
  );
};

export default AdminDashboard;