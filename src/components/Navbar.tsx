import React, { useState } from 'react';
import { Scissors, ShoppingBag, User as UserIcon, Shield, Menu, X, Phone, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';
import { useOrderCart } from '../context/OrderCartContext';
import { generateSalonDirectWhatsAppLink } from '../lib/whatsapp';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onOpenMyOrders: () => void;
  currentView: 'home' | 'admin' | 'my-orders';
  setCurrentView: (view: 'home' | 'admin' | 'my-orders') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenAdmin,
  onOpenMyOrders,
  currentView,
  setCurrentView,
}) => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { settings } = useBusiness();
  const { totalItemCount, setIsCartOpen } = useOrderCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const salonWhatsAppUrl = generateSalonDirectWhatsAppLink(settings.salon_phone);

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-900 bg-black/95 backdrop-blur-md">
      {/* Top Bar: Exactly 3 Zones Contract */}
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        
        {/* Zone 1: Wordmark Brand Title (Single element) */}
        <button
          onClick={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="group flex items-center gap-3 text-left focus:outline-none shrink-0"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600/10 border border-red-600/30 text-red-500 group-hover:border-red-500 group-hover:bg-red-600/20 transition-colors">
            <Scissors className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-bold uppercase tracking-wider text-white whitespace-nowrap block">
              {settings.salon_name}
            </span>
            <span className="text-[10px] tracking-widest uppercase text-amber-400/80 font-medium block">
              Luxury Grooming & Styling
            </span>
          </div>
        </button>

        {/* Zone 2: 4-5 Concise Single-line Nav Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-neutral-300">
          <button
            onClick={() => handleNavClick('services-section')}
            className="hover:text-red-400 transition-colors whitespace-nowrap shrink-0"
          >
            Services
          </button>
          <button
            onClick={() => handleNavClick('hairstyles-section')}
            className="hover:text-red-400 transition-colors whitespace-nowrap shrink-0"
          >
            Hairstyles
          </button>
          <button
            onClick={() => handleNavClick('how-it-works-section')}
            className="hover:text-red-400 transition-colors whitespace-nowrap shrink-0"
          >
            How It Works
          </button>
          <button
            onClick={() => handleNavClick('contact-section')}
            className="hover:text-red-400 transition-colors whitespace-nowrap shrink-0"
          >
            Contact
          </button>
          {user && (
            <button
              onClick={() => {
                setCurrentView('my-orders');
              }}
              className={`hover:text-red-400 transition-colors whitespace-nowrap shrink-0 ${
                currentView === 'my-orders' ? 'text-red-500 font-semibold' : ''
              }`}
            >
              My Orders
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => {
                setCurrentView('admin');
              }}
              className={`flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-medium transition-colors whitespace-nowrap shrink-0 ${
                currentView === 'admin' ? 'underline underline-offset-4' : ''
              }`}
            >
              <Shield className="h-4 w-4" />
              Admin Portal
            </button>
          )}
        </nav>

        {/* Zone 3: Primary Action / Cart / User Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* WhatsApp Direct Action Button */}
          <a
            href={salonWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/80 px-3.5 py-2 text-xs font-semibold text-neutral-200 hover:border-emerald-600/50 hover:bg-neutral-900 hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0"
            title="Chat directly with Mikkys Barbing Salon"
          >
            <MessageSquare className="h-4 w-4 text-emerald-500" />
            <span>WhatsApp</span>
          </a>

          {/* Cart Drawer Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center justify-center h-10 w-10 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-200 hover:border-neutral-700 hover:text-white transition-colors"
            aria-label="View selected services"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[11px] font-bold text-white shadow-lg animate-in zoom-in-75">
                {totalItemCount}
              </span>
            )}
          </button>

          {/* Auth / Account Button */}
          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={onOpenMyOrders}
                className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-medium text-neutral-200 hover:border-neutral-700 hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                <UserIcon className="h-4 w-4 text-neutral-400" />
                <span className="max-w-[110px] truncate">{profile?.full_name || user.email?.split('@')[0]}</span>
              </button>
              <button
                onClick={() => signOut()}
                className="rounded-lg px-2.5 py-2 text-xs font-medium text-neutral-400 hover:text-red-400 transition-colors whitespace-nowrap shrink-0"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950 px-3.5 py-2 text-xs font-semibold text-neutral-200 hover:border-neutral-700 hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              <UserIcon className="h-4 w-4" />
              <span>Sign In</span>
            </button>
          )}

          {/* Book Now Primary Button */}
          <button
            onClick={() => handleNavClick('services-section')}
            className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-700 active:scale-95 transition-all shadow-md shadow-red-950/40 whitespace-nowrap shrink-0"
          >
            Book Now
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-300 hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-neutral-800 bg-neutral-950 px-4 py-5 space-y-3 animate-in slide-in-from-top-2">
          <div className="flex flex-col space-y-2 text-sm font-medium">
            <button
              onClick={() => handleNavClick('services-section')}
              className="text-left px-3 py-2 rounded-md hover:bg-neutral-900 text-neutral-200 hover:text-white"
            >
              Services Catalogue
            </button>
            <button
              onClick={() => handleNavClick('hairstyles-section')}
              className="text-left px-3 py-2 rounded-md hover:bg-neutral-900 text-neutral-200 hover:text-white"
            >
              Hairstyle Gallery
            </button>
            <button
              onClick={() => handleNavClick('how-it-works-section')}
              className="text-left px-3 py-2 rounded-md hover:bg-neutral-900 text-neutral-200 hover:text-white"
            >
              How It Works
            </button>
            <button
              onClick={() => handleNavClick('contact-section')}
              className="text-left px-3 py-2 rounded-md hover:bg-neutral-900 text-neutral-200 hover:text-white"
            >
              Contact & Hours
            </button>

            {user ? (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenMyOrders();
                  }}
                  className="text-left px-3 py-2 rounded-md hover:bg-neutral-900 text-neutral-200 hover:text-white"
                >
                  My Orders History
                </button>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAdmin();
                    }}
                    className="flex items-center gap-2 text-left px-3 py-2 rounded-md bg-amber-500/10 text-amber-400 font-semibold"
                  >
                    <Shield className="h-4 w-4" />
                    Admin Dashboard
                  </button>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="text-left px-3 py-2 text-xs text-neutral-400 hover:text-red-400"
                >
                  Sign Out ({user.email})
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="flex items-center gap-2 text-left px-3 py-2 rounded-md bg-neutral-900 text-white font-medium"
              >
                <UserIcon className="h-4 w-4 text-red-500" />
                Sign In / Register
              </button>
            )}
          </div>

          <div className="pt-3 border-t border-neutral-900 flex items-center justify-between">
            <a
              href={salonWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-semibold text-emerald-400"
            >
              <MessageSquare className="h-4 w-4" />
              Chat on WhatsApp ({settings.salon_phone})
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
