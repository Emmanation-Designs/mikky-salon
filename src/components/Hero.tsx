import React from 'react';
import { ArrowRight, MessageSquare, Scissors, Clock, ShieldCheck } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { generateSalonDirectWhatsAppLink } from '../lib/whatsapp';

interface HeroProps {
  onExploreServices: () => void;
  onOrderNow: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreServices, onOrderNow }) => {
  const { settings } = useBusiness();
  const salonWhatsAppUrl = generateSalonDirectWhatsAppLink(settings.salon_phone);

  return (
    <section className="relative overflow-hidden border-b border-neutral-900 bg-black py-16 sm:py-24 lg:py-28">
      {/* Background Photography with Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/barbershop_hero_1792138005555.jpg"
          alt="Mikkys Barbing Salon luxury interior"
          className="h-full w-full object-cover object-center brightness-40"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {/* Subtle brand kicker (Clean text, no pill) */}
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-400">
            <span>Mikkys Barbing Salon</span>
            <span aria-hidden="true">·</span>
            <span>Est. Professional Grooming</span>
          </div>

          {/* Primary Hero Headline */}
          <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight" style={{ textWrap: 'balance' }}>
            Sharp Cuts. Crisp Line-Ups. <br />
            <span className="text-red-500">Master Grooming.</span>
          </h1>

          {/* Short Salon Introduction */}
          <p className="mt-6 text-base sm:text-lg text-neutral-300 leading-relaxed max-w-2xl">
            Welcome to {settings.salon_name}. We specialize in precision fades, sculpted beard styling,
            and executive grooming for discerning gentlemen. Browse our services, submit your order,
            and we will connect with you directly on WhatsApp to confirm your appointment.
          </p>

          {/* Value Props Strip (Zero pills, clean typographic separators) */}
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-400">
            <span className="inline-flex items-center gap-1.5 text-neutral-200">
              <ShieldCheck className="h-4 w-4 text-amber-400" />
              Pay at Salon (No Online Card Fees)
            </span>
            <span aria-hidden="true" className="text-neutral-700">·</span>
            <span className="inline-flex items-center gap-1.5 text-neutral-200">
              <Clock className="h-4 w-4 text-red-500" />
              Flexible Preferred Time Slots
            </span>
            <span aria-hidden="true" className="text-neutral-700">·</span>
            <span className="inline-flex items-center gap-1.5 text-neutral-200">
              <MessageSquare className="h-4 w-4 text-emerald-400" />
              Direct WhatsApp Confirmation
            </span>
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={onOrderNow}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-xl shadow-red-950/50 hover:bg-red-700 active:scale-98 transition-all"
            >
              <span>Order a Service</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={onExploreServices}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/90 px-6 py-3.5 text-sm font-semibold text-white hover:border-neutral-700 hover:bg-neutral-800 transition-colors"
            >
              <Scissors className="h-4 w-4 text-neutral-400" />
              <span>Explore Services</span>
            </button>

            <a
              href={salonWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-900/40 bg-emerald-950/40 px-5 py-3.5 text-sm font-semibold text-emerald-300 hover:bg-emerald-900/40 hover:text-emerald-200 transition-colors"
            >
              <MessageSquare className="h-4 w-4 text-emerald-400" />
              <span>Chat: {settings.salon_phone}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
