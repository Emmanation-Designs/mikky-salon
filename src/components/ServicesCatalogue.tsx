import React, { useState, useEffect } from 'react';
import { Plus, Check, Clock, RefreshCw } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useBusiness } from '../context/BusinessContext';
import { useOrderCart } from '../context/OrderCartContext';
import type { Service, ServiceCategory } from '../types/database';

// Built-in default services for instant assignment testing
const DEFAULT_CATEGORIES: ServiceCategory[] = [
  { id: 'cat-haircuts', name: 'Haircuts', slug: 'haircuts', description: 'Precision cuts tailored to your face.', display_order: 1, is_active: true },
  { id: 'cat-beard', name: 'Beard grooming', slug: 'beard-grooming', description: 'Beard shaping and razor line-ups.', display_order: 2, is_active: true },
  { id: 'cat-combo', name: 'Combo Packages', slug: 'combo', description: 'Complete hair & beard package.', display_order: 3, is_active: true },
  { id: 'cat-wash', name: 'Hair Washing', slug: 'hair-washing', description: 'Scalp cleansing & conditioning.', display_order: 4, is_active: true },
  { id: 'cat-color', name: 'Hair Colouring', slug: 'hair-colouring', description: 'Black dye & tinting.', display_order: 5, is_active: true },
];

const DEFAULT_SERVICES: Service[] = [
  {
    id: 'srv-signature-fade',
    category_id: 'cat-haircuts',
    name: 'Signature Mid-Fade & Line-Up',
    description: 'Razor-sharp fade with precision perimeter edge-up, clean neck shave, and crown detailing.',
    price: 4500,
    promo_price: null,
    duration_minutes: 40,
    image_url: null,
    is_active: true,
    is_featured: true,
    display_order: 1,
    category: DEFAULT_CATEGORIES[0],
  },
  {
    id: 'srv-classic-cut',
    category_id: 'cat-haircuts',
    name: 'Classic Gentleman Cut',
    description: 'Traditional neat scissor cut or buzz trim finished with a razor-crisp hairline.',
    price: 3000,
    promo_price: null,
    duration_minutes: 30,
    image_url: null,
    is_active: true,
    is_featured: false,
    display_order: 2,
    category: DEFAULT_CATEGORIES[0],
  },
  {
    id: 'srv-beard-sculpt',
    category_id: 'cat-beard',
    name: 'Sculpted Beard Trim & Straight Razor',
    description: 'Precision beard shaping, cheek line contouring with a straight razor, and beard oil finish.',
    price: 2500,
    promo_price: null,
    duration_minutes: 25,
    image_url: null,
    is_active: true,
    is_featured: true,
    display_order: 3,
    category: DEFAULT_CATEGORIES[1],
  },
  {
    id: 'srv-executive-combo',
    category_id: 'cat-combo',
    name: 'Executive Haircut + Beard Combo',
    description: 'Complete haircut of your choice, sculpted beard trim, hot towel treatment, and hairline finish.',
    price: 6500,
    promo_price: 6000,
    duration_minutes: 55,
    image_url: null,
    is_active: true,
    is_featured: true,
    display_order: 4,
    category: DEFAULT_CATEGORIES[2],
  },
  {
    id: 'srv-deep-wash',
    category_id: 'cat-wash',
    name: 'Deep Cleanse Hair Wash & Scalp Massage',
    description: 'Invigorating scalp shampoo, mint conditioner, and hot blower styling.',
    price: 2000,
    promo_price: null,
    duration_minutes: 20,
    image_url: null,
    is_active: true,
    is_featured: false,
    display_order: 5,
    category: DEFAULT_CATEGORIES[3],
  },
  {
    id: 'srv-black-dye',
    category_id: 'cat-color',
    name: 'Black Dye Enhancement',
    description: 'Rich natural black dye application for beard and hairline, giving a high-contrast sharp finish.',
    price: 3500,
    promo_price: null,
    duration_minutes: 30,
    image_url: null,
    is_active: true,
    is_featured: false,
    display_order: 6,
    category: DEFAULT_CATEGORIES[4],
  },
];

interface ServicesCatalogueProps {
  onOpenOrderTab?: () => void;
}

export const ServicesCatalogue: React.FC<ServicesCatalogueProps> = ({ onOpenOrderTab }) => {
  const { settings } = useBusiness();
  const { items, addService, removeService } = useOrderCart();

  const [categories, setCategories] = useState<ServiceCategory[]>(DEFAULT_CATEGORIES);
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(false);

  const fetchCatalog = async () => {
    if (!isSupabaseConfigured) return;

    setLoading(true);
    try {
      const { data: catData, error: catError } = await supabase
        .from('service_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (!catError && catData && catData.length > 0) {
        setCategories(catData);
      }

      const { data: srvData, error: srvError } = await supabase
        .from('services')
        .select(`*, category:service_categories(*)`)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (!srvError && srvData && srvData.length > 0) {
        setServices(srvData as Service[]);
      }
    } catch (err) {
      console.warn('Could not load services from Supabase, showing defaults:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const filteredServices = services.filter((srv) => {
    if (selectedCategorySlug === 'all') return true;
    return srv.category?.slug === selectedCategorySlug;
  });

  const getServiceQuantity = (serviceId: string) => {
    const found = items.find((item) => item.service.id === serviceId);
    return found ? found.quantity : 0;
  };

  const formatPrice = (amount: number) => {
    return `${settings.currency_symbol}${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
  };

  return (
    <div className="space-y-6 pb-24">
      {/* App Header Bar for Menu */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-red-500">
            Grooming Menu
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-0.5">
            Select Your Services
          </h2>
        </div>

        <button
          onClick={fetchCatalog}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
          title="Refresh services from database"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      <p className="text-xs text-neutral-400 leading-relaxed max-w-xl">
        Tap "Add" on any haircut or grooming service. All appointments are paid in cash or transfer at the salon upon completion.
      </p>

      {/* Horizontal Category Pill Tabs (Strict Red, Black, White) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategorySlug('all')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            selectedCategorySlug === 'all'
              ? 'bg-red-600 text-white'
              : 'bg-[#111111] text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          All Services ({services.length})
        </button>
        {categories.map((cat) => {
          const count = services.filter((s) => s.category?.slug === cat.slug).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategorySlug(cat.slug)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedCategorySlug === cat.slug
                  ? 'bg-red-600 text-white'
                  : 'bg-[#111111] text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {cat.name} {count > 0 ? `(${count})` : ''}
            </button>
          );
        })}
      </div>

      {/* Services List / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredServices.map((service) => {
          const qty = getServiceQuantity(service.id);
          const hasPromo = service.promo_price && service.promo_price > 0 && service.promo_price < service.price;

          return (
            <div
              key={service.id}
              className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between transition-all ${
                qty > 0
                  ? 'border-red-600/80 bg-[#0F0F0F] ring-1 ring-red-600/40'
                  : 'border-neutral-900 bg-[#0A0A0A] hover:border-neutral-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    {service.category && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 block mb-1">
                        {service.category.name}
                      </span>
                    )}
                    <h3 className="text-base font-bold text-white leading-snug">
                      {service.name}
                    </h3>
                  </div>

                  {hasPromo && (
                    <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shrink-0">
                      Offer
                    </span>
                  )}
                </div>

                {service.description && (
                  <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
                    {service.description}
                  </p>
                )}

                <div className="mt-3 flex items-center gap-1.5 text-xs text-neutral-400">
                  <Clock className="h-3.5 w-3.5 text-neutral-500" />
                  <span>{service.duration_minutes} mins</span>
                </div>
              </div>

              {/* Price & Action Button */}
              <div className="mt-5 pt-3 border-t border-neutral-900 flex items-center justify-between">
                <div>
                  {hasPromo ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-extrabold text-white tabular-nums">
                        {formatPrice(service.promo_price!)}
                      </span>
                      <span className="text-xs text-neutral-500 line-through tabular-nums">
                        {formatPrice(service.price)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-base font-extrabold text-white tabular-nums">
                      {formatPrice(service.price)}
                    </span>
                  )}
                  <span className="text-[10px] text-neutral-500 block">Pay at salon</span>
                </div>

                <div className="flex items-center gap-2">
                  {qty > 0 ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeService(service.id)}
                        className="rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-xs text-neutral-400 hover:text-white"
                      >
                        Remove
                      </button>
                      <button
                        onClick={() => addService(service)}
                        className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-red-950/40"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Added ({qty})</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addService(service)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 active:scale-95 transition-all shadow-md shadow-red-950/40"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add to Order</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
