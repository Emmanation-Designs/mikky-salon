/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Menu, ArrowLeft, Shield, Eye, Smartphone } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import { BusinessProvider } from './context/BusinessContext';
import { OrderCartProvider } from './context/OrderCartContext';

import { OnboardingWalkthrough } from './components/showcase/OnboardingWalkthrough';
import { ShowcaseHome } from './components/showcase/ShowcaseHome';
import { ShowcaseServices } from './components/showcase/ShowcaseServices';
import { ShowcaseBookingFlow } from './components/showcase/ShowcaseBookingFlow';
import { ShowcaseBookingsList } from './components/showcase/ShowcaseBookingsList';
import { ShowcaseProfile } from './components/showcase/ShowcaseProfile';
import { ShowcaseDrawer } from './components/showcase/ShowcaseDrawer';
import { ShowcaseBottomNav } from './components/showcase/ShowcaseBottomNav';
import { AdminDashboard } from './components/AdminDashboard';
import { INITIAL_BOOKINGS, type BookingItem, type ServiceItem } from './data/mockData';

function MainShowcaseApp() {
  // Screen Router matching the uploaded showcase:
  // 'onboarding' | 'home' | 'services' | 'book' | 'bookings' | 'profile' | 'admin'
  const [currentScreen, setCurrentScreen] = useState<string>('home');
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [selectedServiceForBook, setSelectedServiceForBook] = useState<ServiceItem | null>(null);
  const [bookingsList, setBookingsList] = useState<BookingItem[]>(INITIAL_BOOKINGS);
  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(true);

  const handleBookingConfirmed = (newBooking: BookingItem) => {
    setBookingsList((prev) => [newBooking, ...prev]);
  };

  const handleSelectService = (service: ServiceItem) => {
    setSelectedServiceForBook(service);
    setCurrentScreen('book');
  };

  const showBottomNav = ['home', 'services', 'bookings', 'profile'].includes(currentScreen);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-0 sm:p-4 selection:bg-red-600 selection:text-white font-sans antialiased">
      
      {/* Top Floating App Bar / Device Control (Desktop Helper) */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-md mb-2 px-2 text-xs text-neutral-400 select-none">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white uppercase tracking-wider text-[11px]">Mikkys Mobile App</span>
          <span className="text-[10px] bg-red-600/20 text-red-500 border border-red-600/30 px-2 py-0.5 rounded-full font-bold">
            Live Demo
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentScreen('onboarding')}
            className="hover:text-white text-[11px] font-semibold underline underline-offset-2"
          >
            Walkthrough Tour
          </button>
          <button
            onClick={() => setDeviceFrameMode(!deviceFrameMode)}
            className="flex items-center gap-1 hover:text-white"
            title="Toggle phone frame"
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>{deviceFrameMode ? 'Frame: On' : 'Frame: Off'}</span>
          </button>
        </div>
      </div>

      {/* Main Mobile App Frame */}
      <div
        className={`w-full bg-black relative flex flex-col justify-between overflow-hidden shadow-2xl transition-all ${
          deviceFrameMode
            ? 'max-w-[400px] h-[844px] rounded-[48px] border-[10px] border-[#1C1C1E] ring-1 ring-white/10'
            : 'max-w-md min-h-screen'
        }`}
      >
        {/* iOS Dynamic Island / Status Bar (9:41) */}
        {currentScreen !== 'onboarding' && (
          <div className="pt-3 px-7 flex items-center justify-between text-xs text-white font-semibold select-none z-30 shrink-0">
            <span>9:41</span>
            {/* Dynamic Island Pill */}
            <div className="h-4 w-24 bg-neutral-900 rounded-full" />
            <div className="flex items-center gap-1 text-[11px]">
              <span>5G</span>
              <div className="h-2.5 w-5 rounded border border-white p-0.5 flex items-center">
                <div className="h-full w-full bg-white rounded-xs" />
              </div>
            </div>
          </div>
        )}

        {/* Floating Drawer Menu Trigger */}
        {currentScreen === 'home' && (
          <button
            onClick={() => setDrawerOpen(true)}
            className="absolute top-11 right-6 z-30 p-2 rounded-full bg-neutral-900/80 border border-neutral-800 text-neutral-300 hover:text-white"
            aria-label="Open navigation drawer"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}

        {/* Screen Content Container */}
        <div className="flex-1 overflow-y-auto px-5 pt-3 scrollbar-none">
          {currentScreen === 'onboarding' && (
            <OnboardingWalkthrough onComplete={() => setCurrentScreen('home')} />
          )}

          {currentScreen === 'home' && (
            <ShowcaseHome
              onNavigate={(screen) => setCurrentScreen(screen)}
              onSelectServiceForBooking={handleSelectService}
            />
          )}

          {currentScreen === 'services' && (
            <ShowcaseServices
              onBack={() => setCurrentScreen('home')}
              onSelectService={handleSelectService}
            />
          )}

          {currentScreen === 'book' && (
            <ShowcaseBookingFlow
              initialService={selectedServiceForBook}
              onBack={() => setCurrentScreen('home')}
              onBookingConfirmed={handleBookingConfirmed}
              onViewBookings={() => setCurrentScreen('bookings')}
              onGoHome={() => setCurrentScreen('home')}
            />
          )}

          {currentScreen === 'bookings' && (
            <ShowcaseBookingsList
              bookings={bookingsList}
              onBack={() => setCurrentScreen('home')}
              onSelectBooking={(b) => {
                alert(`Viewing booking: ${b.serviceName} on ${b.date} at ${b.time}. Status: ${b.status}`);
              }}
            />
          )}

          {currentScreen === 'profile' && (
            <ShowcaseProfile
              onNavigate={(screen) => setCurrentScreen(screen)}
              onOpenAdmin={() => setCurrentScreen('admin')}
              onResetWalkthrough={() => setCurrentScreen('onboarding')}
            />
          )}

          {currentScreen === 'admin' && (
            <div className="pt-2">
              <AdminDashboard onBackToHome={() => setCurrentScreen('profile')} />
            </div>
          )}
        </div>

        {/* Bottom Tab Navigation Bar (Screen 6, 7, 10, 11) */}
        {showBottomNav && (
          <ShowcaseBottomNav
            currentScreen={currentScreen}
            onNavigate={(screen) => setCurrentScreen(screen)}
          />
        )}

        {/* Drawer Menu (Screen 12) */}
        <ShowcaseDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          activeScreen={currentScreen}
          onNavigate={(screen) => setCurrentScreen(screen)}
        />

        {/* iPhone Home Indicator bar */}
        <div className="w-full flex justify-center py-1.5 z-40 bg-black pointer-events-none shrink-0">
          <div className="w-32 h-1 bg-neutral-600 rounded-full" />
        </div>
      </div>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BusinessProvider>
        <OrderCartProvider>
          <MainShowcaseApp />
        </OrderCartProvider>
      </BusinessProvider>
    </AuthProvider>
  );
}
