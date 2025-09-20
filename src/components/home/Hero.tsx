import React from 'react';
import { Search, MapPin, Calendar, Users } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative h-screen flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/4254563/pexels-photo-4254563.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Kerala Mountains"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Discover Kerala's
          <span className="block text-green-400">Hidden Trails</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
          Experience the untouched beauty of God's Own Country through expertly curated trekking adventures
        </p>

        {/* Quick Search */}
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <select className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="">Select Destination</option>
                <option value="munnar">Munnar</option>
                <option value="wayanad">Wayanad</option>
                <option value="thekkady">Thekkady</option>
                <option value="idukki">Idukki</option>
                <option value="thrissur">Thrissur</option>
                <option value="palakkad">Palakkad</option>
              </select>
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="date"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <select className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="">Group Size</option>
                <option value="1-5">1-5 People</option>
                <option value="6-10">6-10 People</option>
                <option value="11-15">11-15 People</option>
                <option value="16+">16+ People</option>
              </select>
            </div>
            <button className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Search</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Popular:</span>
            {['Munnar Tea Gardens', 'Wayanad Wildlife', 'Thekkady Spices'].map((tag) => (
              <button
                key={tag}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-green-100 hover:text-green-700 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
          {[
            { number: '50+', label: 'Trek Routes' },
            { number: '10K+', label: 'Happy Trekkers' },
            { number: '15+', label: 'Years Experience' },
            { number: '4.8★', label: 'Average Rating' }
          ].map((stat) => (
            <div key={stat.label} className="text-white">
              <div className="text-2xl md:text-3xl font-bold">{stat.number}</div>
              <div className="text-sm md:text-base text-gray-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;