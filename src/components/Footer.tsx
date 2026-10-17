import React from 'react';
import { Scissors, MessageSquare, Phone, MapPin, Clock, Shield } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { useAuth } from '../context/AuthContext';
import { generateSalonDirectWhatsAppLink } from '../lib/whatsapp';
import { ADMIN_EMAIL } from '../lib/supabase';

interface FooterProps {
  onOpenAdmin: () => void;
  onOpenAuth: () => void;
  onOpenSetup: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onOpenAuth, onOpenSetup }) => {
  const { settings } = useBusiness();
  const { user, isAdmin } = useAuth();
  const salonWhatsAppUrl = generateSalonDirectWhatsAppLink(settings.salon_phone);

  return (
    <footer id="contact-section" className="border-t border-neutral-900 bg-black text-neutral-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Col 1: Wordmark & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600/10 border border-red-600/30 text-red-500">
                <Scissors className="h-4 w-4" />
              </div>
              <span className="text-base font-bold uppercase tracking-wider text-white">
                {settings.salon_name}
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {settings.description}
            </p>
            <div className="pt-2">
              <a
                href={salonWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600/10 border border-emerald-600/30 px-3.5 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Col 2: Business Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Contact & WhatsApp
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <span className="text-neutral-300 font-mono">{settings.salon_phone}</span>
              </div>
              {settings.address && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <span className="text-neutral-300">{settings.address}</span>
                </div>
              )}
              <div className="text-[11px] text-neutral-500">
                Payment is accepted at the salon upon completion of your grooming session.
              </div>
            </div>
          </div>

          {/* Col 3: Hours & Availability */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Salon Schedule
            </h4>
            <div className="flex items-start gap-2.5 text-xs">
              <Clock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-neutral-300 leading-relaxed">
                {settings.opening_hours}
              </div>
            </div>
            <p className="text-[11px] text-neutral-500 pt-1">
              Appointments scheduled directly via WhatsApp order confirmation.
            </p>
          </div>

          {/* Col 4: Administrator & Database Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Salon Management
            </h4>
            <div className="space-y-2 text-xs">
              {isAdmin ? (
                <button
                  onClick={onOpenAdmin}
                  className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span>Open Admin Portal</span>
                </button>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span>Admin Sign In ({ADMIN_EMAIL})</span>
                </button>
              )}

              <div>
                <button
                  onClick={onOpenSetup}
                  className="text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  Supabase Setup & Migration Guide
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Quiet Bottom Strip */}
        <div className="mt-12 pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            &copy; {new Date().getFullYear()} {settings.salon_name}. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>In-Person Salon Payments</span>
            <span>·</span>
            <span>WhatsApp Communications</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
