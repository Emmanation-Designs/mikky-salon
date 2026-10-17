import React from 'react';
import { Scissors, FileCheck2, MessageSquare, Banknote } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works-section" className="border-b border-neutral-900 bg-neutral-950 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-widest text-red-500">
            Simple 3-Step Process
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white">
            How Ordering & Booking Works
          </h2>
          <p className="mt-3 text-sm text-neutral-400">
            No complicated online card checkouts or rigid time slots. Select what you need, and we will
            finalize the schedule with you one-on-one.
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Step 1 */}
          <div className="relative rounded-xl border border-neutral-900 bg-black/60 p-6 flex flex-col justify-between hover:border-neutral-800 transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold text-neutral-700">01</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600/10 text-red-500">
                  <Scissors className="h-5 w-5" />
                </div>
              </div>
              <h3 className="mt-5 text-lg font-bold text-white">Select Services & Style</h3>
              <p className="mt-2 text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Browse our haircuts, beard grooming, combos, and custom styles. You can also pick a reference
                look from our hairstyle gallery to attach to your order.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-900 text-xs text-neutral-500">
              Multiple services supported
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative rounded-xl border border-neutral-900 bg-black/60 p-6 flex flex-col justify-between hover:border-neutral-800 transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold text-neutral-700">02</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                  <FileCheck2 className="h-5 w-5" />
                </div>
              </div>
              <h3 className="mt-5 text-lg font-bold text-white">Submit Order with WhatsApp</h3>
              <p className="mt-2 text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Provide your contact details and active WhatsApp number. You can request your preferred
                day and time slot along with any grooming notes.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-900 text-xs text-amber-500/80">
              Preferred times are requests, not instant bookings
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative rounded-xl border border-neutral-900 bg-black/60 p-6 flex flex-col justify-between hover:border-neutral-800 transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold text-neutral-700">03</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  <MessageSquare className="h-5 w-5" />
                </div>
              </div>
              <h3 className="mt-5 text-lg font-bold text-white">Admin WhatsApp Chat & Salon Pay</h3>
              <p className="mt-2 text-xs sm:text-sm text-neutral-400 leading-relaxed">
                The salon administrator reviews your order and contacts you via WhatsApp to agree on the exact time.
                Pay in cash or transfer at the salon when your cut is finished.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-900 text-xs text-emerald-400">
              Pay at salon · Personal consultation
            </div>
          </div>

        </div>

        {/* Reassurance Banner */}
        <div className="mt-8 rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-800 text-amber-400">
              <Banknote className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">100% In-Person Salon Payment</div>
              <div className="text-xs text-neutral-400">No credit card or online payment required on this website. You inspect your haircut and pay right at the chair.</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
