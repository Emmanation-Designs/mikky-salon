import React, { useState } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { SHOWCASE_SERVICES, type ServiceItem } from '../../data/mockData';

interface ShowcaseServicesProps {
  onBack: () => void;
  onSelectService: (service: ServiceItem) => void;
}

export const ShowcaseServices: React.FC<ShowcaseServicesProps> = ({
  onBack,
  onSelectService,
}) => {
  const [activeCategory, setActiveCategory] = useState<'Haircuts' | 'Beard' | 'Extras'>('Haircuts');

  const filteredServices = SHOWCASE_SERVICES.filter(
    (s) => s.category === activeCategory
  );

  return (
    <div className="space-y-5 pb-24 text-white select-none">
      
      {/* Top Bar with Back Arrow (Screen 7 in showcase) */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-neutral-200 hover:text-white"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-bold text-white">Our Services</h1>
      </div>

      {/* Category Pills (Screen 7: Haircuts, Beard, Extras) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(['Haircuts', 'Beard', 'Extras'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 text-xs font-bold rounded-full transition-all ${
              activeCategory === cat
                ? 'bg-red-600 text-white shadow-md shadow-red-950/50'
                : 'bg-[#141414] text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Services List matching Screen 7 */}
      <div className="space-y-3">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            onClick={() => onSelectService(service)}
            className="group cursor-pointer rounded-2xl border border-neutral-900 bg-[#0E0E0E] p-3.5 flex items-center justify-between gap-3 hover:border-neutral-800 hover:bg-[#141414] active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Thumbnail */}
              <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-neutral-900 shrink-0">
                <img
                  src={service.image}
                  alt={service.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Title, Price, Description */}
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white group-hover:text-red-500 transition-colors truncate">
                  {service.name}
                </h3>
                <div className="text-xs font-extrabold text-white font-mono mt-0.5">
                  ${service.price}
                </div>
                <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                  {service.description}
                </p>
              </div>
            </div>

            {/* Right Chevron */}
            <div className="text-neutral-500 group-hover:text-white transition-colors shrink-0 pl-1">
              <ChevronRight className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
