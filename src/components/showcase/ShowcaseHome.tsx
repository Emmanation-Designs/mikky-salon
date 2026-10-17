import React from 'react';
import {
  Calendar, Scissors, Ticket, User, Bell, ChevronRight
} from 'lucide-react';
import { MikkysLogo } from '../MikkysLogo';
import { SHOWCASE_SERVICES, type ServiceItem } from '../../data/mockData';

interface ShowcaseHomeProps {
  onNavigate: (screen: string) => void;
  onSelectServiceForBooking: (service: ServiceItem) => void;
}

export const ShowcaseHome: React.FC<ShowcaseHomeProps> = ({
  onNavigate,
  onSelectServiceForBooking,
}) => {
  const popularServices = SHOWCASE_SERVICES.slice(0, 4);

  return (
    <div className="space-y-6 pb-24 text-white select-none">
      
      {/* Top Header Bar (Screen 6 in showcase) */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <div className="scale-75 origin-left">
            <MikkysLogo size="sm" />
          </div>
          <div>
            <div className="text-[11px] text-neutral-400">Good morning,</div>
            <div className="text-base font-bold text-white flex items-center gap-1 leading-tight">
              <span>John</span>
              <span>✌️</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => alert('No new notifications. Your upcoming appointment is confirmed!')}
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-neutral-200 hover:text-white"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-600 ring-2 ring-black" />
        </button>
      </div>

      {/* Featured Red Hero Banner (Screen 6 in showcase) */}
      <div
        onClick={() => onNavigate('book')}
        className="cursor-pointer relative overflow-hidden rounded-3xl bg-red-600 p-5 shadow-xl shadow-red-950/50 flex items-center justify-between group active:scale-[0.99] transition-transform"
      >
        <div className="space-y-1.5 max-w-[60%] z-10">
          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
            Fresh Cuts <br />
            Better Vibes
          </h2>
          <p className="text-xs text-red-100 font-medium leading-relaxed">
            Book now and keep your style on point.
          </p>
        </div>

        {/* Hero Photo Circle */}
        <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full overflow-hidden border-2 border-white/30 shadow-lg shrink-0">
          <img
            src="/src/assets/images/mikkys_signature_fade_1792242196486.jpg"
            alt="Fresh Fade Cut"
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* 4 Quick Action Grid Buttons (2x2 grid from Screen 6) */}
      <div className="grid grid-cols-2 gap-3.5">
        <button
          onClick={() => onNavigate('book')}
          className="rounded-2xl border border-neutral-800 bg-[#121212] p-4 flex flex-col items-center justify-center text-center gap-2 hover:bg-[#1A1A1A] hover:border-neutral-700 active:scale-95 transition-all shadow-sm"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-900 text-red-500">
            <Calendar className="h-6 w-6" />
          </div>
          <span className="text-xs font-bold text-white">Book Appointment</span>
        </button>

        <button
          onClick={() => onNavigate('services')}
          className="rounded-2xl border border-neutral-800 bg-[#121212] p-4 flex flex-col items-center justify-center text-center gap-2 hover:bg-[#1A1A1A] hover:border-neutral-700 active:scale-95 transition-all shadow-sm"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-900 text-red-500">
            <Scissors className="h-6 w-6" />
          </div>
          <span className="text-xs font-bold text-white">Our Services</span>
        </button>

        <button
          onClick={() => onNavigate('bookings')}
          className="rounded-2xl border border-neutral-800 bg-[#121212] p-4 flex flex-col items-center justify-center text-center gap-2 hover:bg-[#1A1A1A] hover:border-neutral-700 active:scale-95 transition-all shadow-sm"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-900 text-red-500">
            <Ticket className="h-6 w-6" />
          </div>
          <span className="text-xs font-bold text-white">My Bookings</span>
        </button>

        <button
          onClick={() => onNavigate('profile')}
          className="rounded-2xl border border-neutral-800 bg-[#121212] p-4 flex flex-col items-center justify-center text-center gap-2 hover:bg-[#1A1A1A] hover:border-neutral-700 active:scale-95 transition-all shadow-sm"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-900 text-red-500">
            <User className="h-6 w-6" />
          </div>
          <span className="text-xs font-bold text-white">Profile</span>
        </button>
      </div>

      {/* Popular Services Section (Screen 6 in showcase) */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Popular Services</h3>
          <button
            onClick={() => onNavigate('services')}
            className="text-xs font-bold text-red-500 hover:text-red-400"
          >
            See all
          </button>
        </div>

        {/* Horizontal Carousel */}
        <div className="flex items-center gap-3.5 overflow-x-auto pb-2 scrollbar-none">
          {popularServices.map((service) => (
            <div
              key={service.id}
              onClick={() => onSelectServiceForBooking(service)}
              className="group cursor-pointer rounded-2xl border border-neutral-900 bg-[#111111] p-3 flex flex-col justify-between w-36 sm:w-40 shrink-0 hover:border-neutral-800 hover:bg-[#171717] active:scale-95 transition-all"
            >
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-neutral-900 mb-2">
                <img
                  src={service.image}
                  alt={service.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div>
                <h4 className="text-xs font-bold text-white truncate">{service.name}</h4>
                <div className="text-xs font-extrabold text-red-500 font-mono mt-0.5">
                  ${service.price}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
