import React, { useState, useEffect } from 'react';
import { Check, Scissors, Image as ImageIcon, Sparkles } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useBusiness } from '../context/BusinessContext';
import { useOrderCart } from '../context/OrderCartContext';
import type { Hairstyle } from '../types/database';

// Built-in default styles showcasing authentic barbering photography
const DEFAULT_HAIRSTYLES: Hairstyle[] = [
  {
    id: 'default-style-waves',
    name: '360 Waves with Sharp Mid-Fade & Line-Up',
    description: 'Deep concentric waves with a razor-sharp geometric hairline edge-up and blended mid-skin fade.',
    image_url: '/src/assets/images/mikkys_signature_fade_1792242196486.jpg',
    service_id: null,
    price_hint: 4500,
    is_published: true,
    display_order: 1,
  },
  {
    id: 'default-style-taper',
    name: 'Low Skin Taper with Crisp Line-Up',
    description: 'Smooth gradient taper on sides and nape with clean boxed hairline contour.',
    image_url: '/src/assets/images/haircut_fade_classic_1792138006925.jpg',
    service_id: null,
    price_hint: 4000,
    is_published: true,
    display_order: 2,
  },
  {
    id: 'default-style-beard',
    name: 'Executive Beard & Clean Edge Profile',
    description: 'Full groomed beard with defined cheek line and blended sideburns.',
    image_url: '/src/assets/images/haircut_beard_grooming_1792138006451.jpg',
    service_id: null,
    price_hint: 2500,
    is_published: true,
    display_order: 3,
  },
  {
    id: 'default-style-twist',
    name: 'Drop Fade with Short Twists Crown',
    description: 'Defined natural short twist sponge texture coupled with a deep drop fade.',
    image_url: '/src/assets/images/haircut_twist_fade_1792138007425.jpg',
    service_id: null,
    price_hint: 4000,
    is_published: true,
    display_order: 4,
  },
];

interface HairstyleGalleryProps {
  onStyleSelected?: () => void;
}

export const HairstyleGallery: React.FC<HairstyleGalleryProps> = ({ onStyleSelected }) => {
  const { settings } = useBusiness();
  const { selectedHairstyle, selectHairstyle } = useOrderCart();
  const [hairstyles, setHairstyles] = useState<Hairstyle[]>(DEFAULT_HAIRSTYLES);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const fetchHairstyles = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('hairstyles')
          .select(`*, service:services(*)`)
          .eq('is_published', true)
          .order('display_order', { ascending: true });

        if (!error && data && data.length > 0) {
          setHairstyles(data as Hairstyle[]);
        }
      } catch (err) {
        console.warn('Could not load hairstyles from database, showing defaults:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHairstyles();
  }, []);

  const handleToggleStyle = (style: Hairstyle) => {
    if (selectedHairstyle?.id === style.id) {
      selectHairstyle(null);
    } else {
      selectHairstyle(style);
      if (onStyleSelected) onStyleSelected();
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* App View Sub-header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-red-500">
            Lookbook & Portfolio
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-0.5">
            Hairstyle Inspirations
          </h2>
        </div>
        <div className="text-xs text-neutral-400 font-mono">
          {hairstyles.length} Styles
        </div>
      </div>

      <p className="text-xs text-neutral-400 leading-relaxed max-w-xl">
        Tap a haircut style to attach it directly to your appointment order. Your barber will reference this cut when you sit in the chair.
      </p>

      {/* Selected Style Indicator Banner (Strict Red, Black, White) */}
      {selectedHairstyle && (
        <div className="rounded-xl border border-red-600/40 bg-red-950/20 p-4 flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white font-bold shrink-0">
              <Check className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-red-400">Attached to Your Order</div>
              <div className="font-bold text-white text-sm">{selectedHairstyle.name}</div>
            </div>
          </div>
          <button
            onClick={() => selectHairstyle(null)}
            className="text-xs font-semibold text-neutral-400 hover:text-white underline ml-3 shrink-0"
          >
            Remove
          </button>
        </div>
      )}

      {/* Hairstyles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
        {hairstyles.map((style) => {
          const isSelected = selectedHairstyle?.id === style.id;

          return (
            <div
              key={style.id}
              onClick={() => handleToggleStyle(style)}
              className={`group cursor-pointer overflow-hidden rounded-2xl border transition-all duration-200 select-none ${
                isSelected
                  ? 'border-red-600 bg-neutral-900 ring-2 ring-red-600/60 shadow-xl shadow-red-950/50'
                  : 'border-neutral-900 bg-[#0A0A0A] hover:border-neutral-800 hover:bg-neutral-900/60'
              }`}
            >
              {/* Photo Container */}
              <div className="relative aspect-4/3 w-full overflow-hidden bg-neutral-950">
                <img
                  src={style.image_url}
                  alt={style.name}
                  className="h-full w-full object-cover object-center group-hover:scale-102 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                    const fallback = (e.target as HTMLElement).nextElementSibling;
                    if (fallback) fallback.classList.remove('hidden');
                  }}
                />
                <div className="hidden absolute inset-0 flex flex-col items-center justify-center bg-neutral-950 text-neutral-500 p-4 text-center">
                  <ImageIcon className="h-8 w-8 mb-2 text-neutral-700" />
                  <span className="text-xs">{style.name}</span>
                </div>

                {/* Scrim Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none" />

                {/* Top Badge (Strict Red, Black, White) */}
                <div className="absolute top-3 right-3">
                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                      <Check className="h-3.5 w-3.5" />
                      Selected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/70 border border-neutral-800 px-2.5 py-1 text-[11px] font-semibold text-neutral-300">
                      Tap to Choose
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 space-y-2">
                <h3 className="text-base font-bold text-white group-hover:text-red-500 transition-colors">
                  {style.name}
                </h3>

                {style.description && (
                  <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
                    {style.description}
                  </p>
                )}

                <div className="pt-3 border-t border-neutral-900 flex items-center justify-between text-xs">
                  {style.price_hint ? (
                    <span className="font-semibold text-neutral-300">
                      Approx. <strong className="text-white font-mono text-sm">{settings.currency_symbol}{Number(style.price_hint).toLocaleString()}</strong>
                    </span>
                  ) : (
                    <span className="text-neutral-500">Service dependent</span>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStyle(style);
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-neutral-800 text-white border border-neutral-700'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {isSelected ? 'Deselect' : 'Select for Order'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
