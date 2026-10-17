import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, CheckCircle2, MessageSquare } from 'lucide-react';
import { type BookingItem } from '../../data/mockData';
import { generateSalonDirectWhatsAppLink } from '../../lib/whatsapp';

interface ShowcaseBookingsListProps {
  bookings: BookingItem[];
  onBack: () => void;
  onSelectBooking?: (booking: BookingItem) => void;
}

export const ShowcaseBookingsList: React.FC<ShowcaseBookingsListProps> = ({
  bookings,
  onBack,
  onSelectBooking,
}) => {
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');

  const displayedBookings = filter === 'upcoming'
    ? bookings
    : [];

  return (
    <div className="space-y-5 pb-24 text-white select-none">
      
      {/* Top Bar with Back Arrow (Screen 10 in showcase) */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-neutral-200 hover:text-white"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-bold text-white">My Bookings</h1>
      </div>

      {/* Segmented Filter Pills (Screen 10: Upcoming, Past) */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('upcoming')}
          className={`flex-1 py-2 text-xs font-bold rounded-full transition-all text-center ${
            filter === 'upcoming'
              ? 'bg-red-600 text-white shadow-md shadow-red-950/50'
              : 'bg-[#141414] text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`flex-1 py-2 text-xs font-bold rounded-full transition-all text-center ${
            filter === 'past'
              ? 'bg-red-600 text-white shadow-md shadow-red-950/50'
              : 'bg-[#141414] text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          Past
        </button>
      </div>

      {/* Bookings List matching Screen 10 */}
      <div className="space-y-3">
        {displayedBookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-800 bg-[#0E0E0E] p-8 text-center text-neutral-400 text-xs">
            No past bookings found.
          </div>
        ) : (
          displayedBookings.map((b) => (
            <div
              key={b.id}
              onClick={() => onSelectBooking?.(b)}
              className="group cursor-pointer rounded-2xl border border-neutral-900 bg-[#0E0E0E] p-3.5 flex items-center justify-between gap-3 hover:border-neutral-800 hover:bg-[#141414] active:scale-[0.99] transition-all"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Thumbnail */}
                <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-neutral-900 shrink-0">
                  <img
                    src={b.image}
                    alt={b.serviceName}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Details */}
                <div className="min-w-0 space-y-1">
                  <h3 className="text-sm font-bold text-white truncate">
                    {b.serviceName}
                  </h3>
                  <div className="text-xs text-neutral-400">
                    {b.date} • {b.time}
                  </div>

                  {/* Confirmed Status Pill (Screen 10) */}
                  <div className="pt-0.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                      Confirmed
                    </span>
                  </div>
                </div>
              </div>

              {/* Chevron */}
              <div className="text-neutral-500 group-hover:text-white transition-colors shrink-0">
                <ChevronRight className="h-5 w-5" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* WhatsApp Help strip */}
      <div className="pt-4 border-t border-neutral-900 text-center">
        <a
          href={generateSalonDirectWhatsAppLink('+2349038418469', 'Hello Mikkys Barbing Salon, I have a question regarding my bookings.')}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-300 hover:text-white"
        >
          <MessageSquare className="h-4 w-4 text-red-500" />
          <span>Need to reschedule? Message Mikkys on WhatsApp</span>
        </a>
      </div>

    </div>
  );
};
