import React from 'react';
import { Mountain, Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Mountain className="h-8 w-8 text-green-400" />
              <div>
                <h3 className="text-xl font-bold">Kerala Trekking</h3>
                <p className="text-sm text-gray-400">God's Own Adventures</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Discover the untouched beauty of Kerala through expertly curated trekking adventures. 
              Your gateway to unforgettable mountain experiences.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Youtube className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                'About Us',
                'Trekking Packages',
                'Destinations',
                'Safety Guidelines',
                'Terms & Conditions',
                'Privacy Policy'
              ].map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Destinations */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Popular Destinations</h4>
            <ul className="space-y-2">
              {[
                'Munnar Tea Gardens',
                'Wayanad Wildlife',
                'Thekkady Spice Trail',
                'Idukki Dam Valley',
                'Athirappilly Falls',
                'Nelliampathy Hills'
              ].map((destination) => (
                <li key={destination}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    {destination}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-400">
                  <p>Trekking Hub, MG Road</p>
                  <p>Kochi, Kerala 682016</p>
                  <p>India</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-green-400" />
                <span className="text-sm text-gray-400">+91 9876543210</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-green-400" />
                <span className="text-sm text-gray-400">info@keralatrekking.com</span>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <h5 className="text-sm font-semibold mb-2">24/7 Emergency Support</h5>
              <p className="text-xs text-gray-400">+91 9876543211</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              © 2024 Kerala Trekking. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>Made with ❤️ in Kerala</span>
              <span>•</span>
              <span>Responsible Tourism</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;