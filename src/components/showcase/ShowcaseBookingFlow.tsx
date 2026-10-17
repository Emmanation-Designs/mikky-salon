import React, { useState } from 'react';
import {
  ArrowLeft, Calendar as CalendarIcon, Clock, User, Check,
  ChevronLeft, ChevronRight, MessageSquare, CheckCircle2
} from 'lucide-react';
import { SHOWCASE_SERVICES, type ServiceItem, type BookingItem } from '../../data/mockData';
import { generateSalonDirectWhatsAppLink } from '../../lib/whatsapp';

interface ShowcaseBookingFlowProps {
  initialService?: ServiceItem | null;
  onBack: () => void;
  onBookingConfirmed: (newBooking: BookingItem) => void;
  onViewBookings: () => void;
  onGoHome: () => void;
}

export const ShowcaseBookingFlow: React.FC<ShowcaseBookingFlowProps> = ({
  initialService,
  onBack,
  onBookingConfirmed,
  onViewBookings,
  onGoHome,
}) => {
  const [subStep, setSubStep] = useState<'datetime' | 'summary' | 'confirmed'>('datetime');

  // Selected state
  const [selectedService, setSelectedService] = useState<ServiceItem>(
    initialService || SHOWCASE_SERVICES[0]
  );
  const [selectedDay, setSelectedDay] = useState<number>(14);
  const [selectedTime, setSelectedTime] = useState<string>('10:00 AM');
  const [selectedBarber, setSelectedBarber] = useState<string>('Any Available');
  const [confirmedBookingData, setConfirmedBookingData] = useState<BookingItem | null>(null);

  // Time slots from Screen 8 in showcase
  const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '4:00 PM'];

  // Calendar dates mock matching Screen 8
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  // Grid layout for November 2025: Nov 1 was Saturday
  const calendarDays = [
    null, null, null, null, null, null, 1,
    2, 3, 4, 5, 6, 7, 8,
    9, 10, 11, 12, 13, 14, 15,
    16, 17, 18, 19, 20, 21, 22,
    23, 24, 25, 26, 27, 28, 29,
    30,
  ];

  const handleConfirm = () => {
    const booking: BookingItem = {
      id: `bk-${Date.now()}`,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      price: selectedService.price,
      date: `Sat, Nov ${selectedDay}, 2025`,
      time: selectedTime,
      barber: selectedBarber,
      status: 'Confirmed',
      image: selectedService.image,
    };

    setConfirmedBookingData(booking);
    onBookingConfirmed(booking);
    setSubStep('confirmed');
  };

  // WhatsApp follow-up URL
  const salonWhatsAppUrl = generateSalonDirectWhatsAppLink(
    '+2349038418469',
    `Hello Mikkys Barbing Salon, I just booked ${selectedService.name} for Sat, Nov ${selectedDay}, 2025 at ${selectedTime}. Looking forward to my session!`
  );

  return (
    <div className="space-y-5 pb-24 text-white select-none">
      
      {/* ===================================================================== */}
      {/* SUBSTEP 1: DATE & TIME (Screen 8 in showcase) */}
      {/* ===================================================================== */}
      {subStep === 'datetime' && (
        <div className="space-y-6">
          {/* Top Bar with Back Arrow */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={onBack}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-neutral-200 hover:text-white"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h1 className="text-lg font-bold text-white">Book Appointment</h1>
          </div>

          {/* 4-Step Indicator from Screen 8 */}
          <div className="pt-1">
            <div className="flex items-center justify-between relative max-w-xs mx-auto">
              <div className="absolute top-3 left-3 right-3 h-[2px] bg-neutral-800 -z-0" />
              
              {/* Step 1: Service */}
              <div className="flex flex-col items-center gap-1.5 z-10">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-[11px] font-bold text-white">
                  ✓
                </div>
                <span className="text-[10px] text-neutral-400">Service</span>
              </div>

              {/* Step 2: Date & Time (Active) */}
              <div className="flex flex-col items-center gap-1.5 z-10">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-[11px] font-bold text-white ring-4 ring-red-600/30">
                  2
                </div>
                <span className="text-[10px] font-bold text-white">Date & Time</span>
              </div>

              {/* Step 3: Details */}
              <div className="flex flex-col items-center gap-1.5 z-10">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-800 text-[11px] font-bold text-neutral-400">
                  3
                </div>
                <span className="text-[10px] text-neutral-500">Details</span>
              </div>

              {/* Step 4: Confirm */}
              <div className="flex flex-col items-center gap-1.5 z-10">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-800 text-[11px] font-bold text-neutral-400">
                  4
                </div>
                <span className="text-[10px] text-neutral-500">Confirm</span>
              </div>
            </div>
          </div>

          {/* Select Date Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Select Date</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-300">November 2025</span>
                <div className="flex items-center gap-1">
                  <button className="p-1 text-neutral-400 hover:text-white"><ChevronLeft className="h-4 w-4" /></button>
                  <button className="p-1 text-neutral-400 hover:text-white"><ChevronRight className="h-4 w-4" /></button>
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="rounded-2xl border border-neutral-900 bg-[#0E0E0E] p-4">
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-neutral-500 mb-2 font-medium">
                {daysOfWeek.map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {calendarDays.map((dayNum, i) => {
                  if (dayNum === null) {
                    return <div key={`empty-${i}`} className="h-9" />;
                  }

                  const isSelected = selectedDay === dayNum;
                  return (
                    <button
                      key={dayNum}
                      onClick={() => setSelectedDay(dayNum)}
                      className={`h-9 w-9 mx-auto rounded-full text-xs font-bold transition-all flex items-center justify-center ${
                        isSelected
                          ? 'bg-red-600 text-white shadow-md shadow-red-950/60 scale-105'
                          : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                      }`}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Select Time Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">Select Time</h3>
            <div className="grid grid-cols-3 gap-2.5">
              {timeSlots.map((time) => {
                const isSelected = selectedTime === time;
                return (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2.5 rounded-full text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-red-600 text-white shadow-md shadow-red-950/50'
                        : 'bg-[#0E0E0E] text-neutral-300 border border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Next Button */}
          <div className="pt-2">
            <button
              onClick={() => setSubStep('summary')}
              className="w-full rounded-2xl bg-red-600 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-xl shadow-red-950/60 hover:bg-red-700 active:scale-98 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUBSTEP 2: BOOKING SUMMARY (Screen 9 in showcase) */}
      {/* ===================================================================== */}
      {subStep === 'summary' && (
        <div className="space-y-6">
          {/* Top Bar with Back Arrow */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => setSubStep('datetime')}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-neutral-200 hover:text-white"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h1 className="text-lg font-bold text-white">Booking Summary</h1>
          </div>

          {/* Selected Service Card */}
          <div className="rounded-2xl border border-neutral-900 bg-[#0E0E0E] p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-neutral-900 shrink-0">
                <img
                  src={selectedService.image}
                  alt={selectedService.name}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div>
                <h3 className="text-sm font-bold text-white">{selectedService.name}</h3>
                <div className="text-xs font-black text-red-500 font-mono mt-0.5">
                  ${selectedService.price}
                </div>
                <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                  {selectedService.description}
                </p>
              </div>
            </div>

            <ChevronRight className="h-5 w-5 text-neutral-500 shrink-0" />
          </div>

          {/* Appointment Meta Details Card (Screen 9) */}
          <div className="rounded-2xl border border-neutral-900 bg-[#0E0E0E] p-4 divide-y divide-neutral-900 space-y-3.5">
            {/* Date */}
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-2.5 text-neutral-400">
                <CalendarIcon className="h-4 w-4 text-red-500" />
                <span>Date</span>
              </div>
              <span className="font-bold text-white">Sat, Nov {selectedDay}, 2025</span>
            </div>

            {/* Time */}
            <div className="flex items-center justify-between text-xs pt-3.5">
              <div className="flex items-center gap-2.5 text-neutral-400">
                <Clock className="h-4 w-4 text-red-500" />
                <span>Time</span>
              </div>
              <span className="font-bold text-white">{selectedTime}</span>
            </div>

            {/* Barber */}
            <div className="flex items-center justify-between text-xs pt-3.5">
              <div className="flex items-center gap-2.5 text-neutral-400">
                <User className="h-4 w-4 text-red-500" />
                <span>Barber</span>
              </div>
              <span className="font-bold text-white">{selectedBarber}</span>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between text-xs pt-3.5">
              <div className="flex items-center gap-2.5 text-neutral-400">
                <span className="text-sm font-bold text-red-500">$</span>
                <span>Total</span>
              </div>
              <span className="text-base font-black text-white font-mono">
                ${selectedService.price}
              </span>
            </div>
          </div>

          {/* Action Buttons (Screen 9: Confirm Booking / Cancel) */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleConfirm}
              className="w-full rounded-2xl bg-red-600 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-xl shadow-red-950/60 hover:bg-red-700 active:scale-98 transition-all"
            >
              Confirm Booking
            </button>

            <button
              onClick={onBack}
              className="w-full rounded-2xl border border-neutral-800 bg-[#0E0E0E] py-3 text-xs font-semibold text-neutral-300 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUBSTEP 3: BOOKING CONFIRMED SUCCESS (Screen 14 in showcase) */}
      {/* ===================================================================== */}
      {subStep === 'confirmed' && confirmedBookingData && (
        <div className="space-y-6 pt-4 text-center">
          
          {/* Green Check Circle from Screen 14 */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Check className="h-9 w-9 stroke-[3]" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white">Booking Confirmed!</h2>
            <p className="text-xs text-neutral-400 max-w-xs mx-auto">
              Your appointment has been successfully booked. We'll see you soon!
            </p>
          </div>

          {/* Summary Card from Screen 14 */}
          <div className="rounded-2xl border border-neutral-900 bg-[#0E0E0E] p-4 text-left flex items-center gap-3.5 max-w-sm mx-auto">
            <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-neutral-900 shrink-0">
              <img
                src={confirmedBookingData.image}
                alt={confirmedBookingData.serviceName}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{confirmedBookingData.serviceName}</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                {confirmedBookingData.date} • {confirmedBookingData.time}
              </p>
              <div className="text-xs font-bold text-white mt-1">
                Total: ${confirmedBookingData.price}
              </div>
            </div>
          </div>

          {/* WhatsApp Direct Action (From Salon Business Logic) */}
          <div className="pt-2 max-w-sm mx-auto">
            <a
              href={salonWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-neutral-900 border border-neutral-800 py-3 text-xs font-bold text-white hover:border-red-600 transition-colors mb-3"
            >
              <MessageSquare className="h-4 w-4 text-red-500" />
              <span>Connect on WhatsApp (+2349038418469)</span>
            </a>

            <button
              onClick={onViewBookings}
              className="w-full rounded-2xl bg-red-600 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-xl shadow-red-950/60 hover:bg-red-700 transition-all mb-3"
            >
              View Booking Details
            </button>

            <button
              onClick={onGoHome}
              className="w-full py-2 text-xs font-bold text-neutral-400 hover:text-white"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
