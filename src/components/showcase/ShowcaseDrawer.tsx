import React from 'react';
import {
  X, Home, Calendar, Scissors, Ticket, User, Settings, LogOut
} from 'lucide-react';
import { MikkysLogo } from '../MikkysLogo';

interface ShowcaseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeScreen: string;
  onNavigate: (screen: string) => void;
}

export const ShowcaseDrawer: React.FC<ShowcaseDrawerProps> = ({
  isOpen,
  onClose,
  activeScreen,
  onNavigate,
}) => {
  if (!isOpen) return null;

  const handleNav = (screen: string) => {
    onNavigate(screen);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 flex max-w-full pr-12">
        <div className="w-72 bg-black border-r border-neutral-900 p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
          
          <div className="space-y-8">
            {/* Header & Logo (Screen 12) */}
            <div className="flex items-center justify-between">
              <div className="scale-75 origin-left">
                <MikkysLogo size="sm" />
              </div>
              <button
                onClick={onClose}
                className="text-neutral-400 hover:text-white p-1"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Links matching Screen 12 */}
            <div className="space-y-1.5 text-xs font-bold">
              {/* Home (active red pill in Screen 12) */}
              <button
                onClick={() => handleNav('home')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeScreen === 'home'
                    ? 'bg-red-600 text-white shadow-md shadow-red-950/50'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </button>

              {/* Book Appointment */}
              <button
                onClick={() => handleNav('book')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeScreen === 'book'
                    ? 'bg-red-600 text-white'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <Calendar className="h-4 w-4" />
                <span>Book Appointment</span>
              </button>

              {/* Our Services */}
              <button
                onClick={() => handleNav('services')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeScreen === 'services'
                    ? 'bg-red-600 text-white'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <Scissors className="h-4 w-4" />
                <span>Our Services</span>
              </button>

              {/* My Bookings */}
              <button
                onClick={() => handleNav('bookings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeScreen === 'bookings'
                    ? 'bg-red-600 text-white'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <Ticket className="h-4 w-4" />
                <span>My Bookings</span>
              </button>

              {/* Profile */}
              <button
                onClick={() => handleNav('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeScreen === 'profile'
                    ? 'bg-red-600 text-white'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </button>

              {/* Settings */}
              <button
                onClick={() => {
                  alert('Settings: Preferences saved.');
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-900 transition-all"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>

          {/* Log Out (Screen 12: Red text) */}
          <div className="pt-4 border-t border-neutral-900">
            <button
              onClick={() => {
                alert('Session reset.');
                handleNav('home');
              }}
              className="flex items-center gap-2.5 text-xs font-bold text-red-600 hover:text-red-500 py-1"
            >
              <LogOut className="h-4 w-4" />
              <span>Log Out</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
