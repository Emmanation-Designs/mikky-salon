import React from 'react';
import { Home, Calendar, User } from 'lucide-react';

interface ShowcaseBottomNavProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

export const ShowcaseBottomNav: React.FC<ShowcaseBottomNavProps> = ({
  currentScreen,
  onNavigate,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-900 bg-black/95 backdrop-blur-md pb-safe select-none">
      <div className="mx-auto grid h-16 max-w-md grid-cols-3 items-center px-6">
        
        {/* Tab 1: Home */}
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            currentScreen === 'home' ? 'text-red-600' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-bold mt-1 tracking-tight">Home</span>
        </button>

        {/* Tab 2: Bookings */}
        <button
          onClick={() => onNavigate('bookings')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            currentScreen === 'bookings' ? 'text-red-600' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Calendar className="h-5 w-5" />
          <span className="text-[10px] font-bold mt-1 tracking-tight">Bookings</span>
        </button>

        {/* Tab 3: Profile */}
        <button
          onClick={() => onNavigate('profile')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            currentScreen === 'profile' ? 'text-red-600' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] font-bold mt-1 tracking-tight">Profile</span>
        </button>

      </div>
    </nav>
  );
};
