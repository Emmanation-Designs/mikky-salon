import React from 'react';
import {
  Ticket, User, CreditCard, HelpCircle, Settings, LogOut,
  ChevronRight, Shield, MessageSquare
} from 'lucide-react';
import { generateSalonDirectWhatsAppLink } from '../../lib/whatsapp';

interface ShowcaseProfileProps {
  onNavigate: (screen: string) => void;
  onOpenAdmin: () => void;
  onResetWalkthrough: () => void;
}

export const ShowcaseProfile: React.FC<ShowcaseProfileProps> = ({
  onNavigate,
  onOpenAdmin,
  onResetWalkthrough,
}) => {
  const salonWhatsAppUrl = generateSalonDirectWhatsAppLink('+2349038418469');

  return (
    <div className="space-y-6 pb-24 text-white select-none">
      
      {/* User Card (Screen 11 in showcase) */}
      <div className="flex items-center gap-4 pt-2 pb-2">
        <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-red-600 bg-neutral-900 shrink-0">
          <img
            src="/src/assets/images/haircut_fade_classic_1792138006925.jpg"
            alt="John Doe"
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div>
          <h2 className="text-lg font-black text-white">John Doe</h2>
          <div className="text-xs text-neutral-400 font-mono">john@example.com</div>
          <div className="text-[11px] text-red-500 font-medium mt-0.5">VIP Customer</div>
        </div>
      </div>

      {/* Menu List matching Screen 11 */}
      <div className="rounded-2xl border border-neutral-900 bg-[#0E0E0E] divide-y divide-neutral-900 overflow-hidden">
        
        {/* My Bookings */}
        <button
          onClick={() => onNavigate('bookings')}
          className="w-full p-4 flex items-center justify-between hover:bg-[#141414] transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <Ticket className="h-5 w-5 text-neutral-400" />
            <span className="text-sm font-semibold text-white">My Bookings</span>
          </div>
          <ChevronRight className="h-4 w-4 text-neutral-500" />
        </button>

        {/* My Profile */}
        <button
          onClick={() => alert('Profile details: John Doe · Phone: +2349038418469 · Preferred style: Fade Cut')}
          className="w-full p-4 flex items-center justify-between hover:bg-[#141414] transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-neutral-400" />
            <span className="text-sm font-semibold text-white">My Profile</span>
          </div>
          <ChevronRight className="h-4 w-4 text-neutral-500" />
        </button>

        {/* Payment Methods */}
        <button
          onClick={() => alert('Payment Method: Pay at the salon in cash or transfer after your cut.')}
          className="w-full p-4 flex items-center justify-between hover:bg-[#141414] transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-neutral-400" />
            <span className="text-sm font-semibold text-white">Payment Methods</span>
          </div>
          <ChevronRight className="h-4 w-4 text-neutral-500" />
        </button>

        {/* Help & Support (WhatsApp) */}
        <a
          href={salonWhatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full p-4 flex items-center justify-between hover:bg-[#141414] transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="h-5 w-5 text-neutral-400" />
            <span className="text-sm font-semibold text-white">Help & Support (WhatsApp)</span>
          </div>
          <ChevronRight className="h-4 w-4 text-neutral-500" />
        </a>

        {/* Settings */}
        <button
          onClick={() => alert('App Settings: Notifications Enabled · Currency: USD / NGN')}
          className="w-full p-4 flex items-center justify-between hover:bg-[#141414] transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-neutral-400" />
            <span className="text-sm font-semibold text-white">Settings</span>
          </div>
          <ChevronRight className="h-4 w-4 text-neutral-500" />
        </button>

        {/* Admin Dashboard */}
        <button
          onClick={onOpenAdmin}
          className="w-full p-4 flex items-center justify-between hover:bg-[#141414] transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-red-500" />
            <span className="text-sm font-semibold text-white">Admin Management Portal</span>
          </div>
          <ChevronRight className="h-4 w-4 text-neutral-500" />
        </button>

        {/* Replay Intro Tour */}
        <button
          onClick={onResetWalkthrough}
          className="w-full p-4 flex items-center justify-between hover:bg-[#141414] transition-colors text-left"
        >
          <div className="flex items-center gap-3 text-neutral-400">
            <span className="text-xs font-semibold">View Onboarding Walkthrough</span>
          </div>
          <ChevronRight className="h-4 w-4 text-neutral-500" />
        </button>

      </div>

      {/* Log Out Button (Screen 11: Red text) */}
      <div className="pt-2">
        <button
          onClick={() => {
            alert('Signed out of guest session.');
            onResetWalkthrough();
          }}
          className="flex items-center gap-2.5 text-xs font-bold text-red-600 hover:text-red-500 px-2 py-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Log Out</span>
        </button>
      </div>

    </div>
  );
};
