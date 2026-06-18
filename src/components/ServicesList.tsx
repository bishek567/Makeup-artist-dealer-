import React, { useState } from 'react';
import { Service } from '../types';
import { Tag, Sparkles, Star, ChevronRight, CornerDownRight } from 'lucide-react';

interface ServicesListProps {
  services: Service[];
  searchQuery: string;
  onBookService: (service: Service) => void;
}

export default function ServicesList({
  services,
  searchQuery,
  onBookService,
}: ServicesListProps) {
  const [filterCategory, setFilterCategory] = useState<'all' | 'makeup' | 'styling'>('all');

  // Filter calculations matching search criteria & categories
  const filtered = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory =
      filterCategory === 'all' || s.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <section className="py-16 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-pink-600 dark:text-amber-400 font-serif italic text-sm">Glamour Catalog</span>
          <h2 className="text-3xl font-serif text-zinc-950 dark:text-white font-medium mt-1">Our Featured Makeup Artistry</h2>
          <div className="h-0.5 w-16 bg-gradient-to-r from-pink-500 to-amber-400 mx-auto mt-3" />
          <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-3 leading-relaxed">
            From timeless traditional styles to water-resistant airbrush finishes, our licensed partners adapt the style, products, and tones precisely to your skin type.
          </p>
        </div>

        {/* Filter Badges Choice */}
        <div className="flex justify-center space-x-3 mb-10">
          {[
            { id: 'all', label: 'All Services' },
            { id: 'makeup', label: 'Makeup Artistry' },
            { id: 'styling', label: 'Hair & Styling' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id as any)}
              className={`py-1.5 px-4 rounded-full text-xs font-semibold cursor-pointer tracking-wider transition-all border ${
                filterCategory === cat.id
                  ? 'bg-zinc-950 border-zinc-950 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-black shadow-md'
                  : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-rose-50/20'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Dynamic Service Grid */}
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-zinc-500">
            <p className="text-sm">No services matched your query. Try searching for "Bridal" or "Draping".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((service) => {
              const discountPercent = Math.round(((service.originalPrice - service.offerPrice) / service.originalPrice) * 100);

              return (
                <div
                  key={service.id}
                  className="group rounded-2xl overflow-hidden border border-rose-100/10 dark:border-zinc-900 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full text-left"
                >
                  {/* Service Image Frame */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 duration-300 transition-transform"
                    />
                    
                    {/* Category Overlay tag */}
                    <div className="absolute top-3 left-3 bg-zinc-950/85 backdrop-blur shadow-sm py-1 px-3 rounded-full border border-rose-100/10">
                      <span className="text-[9px] uppercase font-bold tracking-widest text-amber-400">
                        {service.category === 'makeup' ? 'Makeup' : 'Styling'}
                      </span>
                    </div>

                    {/* Discount percent saving badge */}
                    {discountPercent > 0 && (
                      <div className="absolute bottom-3 right-3 bg-pink-600 text-white font-bold text-[10px] uppercase py-1 px-2 rounded-full shadow-md flex items-center space-x-1">
                        <Tag className="h-3 w-3 shrink-0" />
                        <span>Save {discountPercent}%</span>
                      </div>
                    )}
                  </div>

                  {/* Service Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-serif text-lg font-semibold text-zinc-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-amber-400 transition-colors">
                          {service.name}
                        </h3>
                        {service.rating && (
                          <div className="flex items-center space-x-1 shrink-0">
                            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{service.rating}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-3">
                        {service.description}
                      </p>
                    </div>

                    {/* Price and core interactive button row */}
                    <div className="mt-6 pt-4 border-t border-rose-100/10 flex justify-between items-center bg-zinc-50/20 dark:bg-zinc-900/10">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-400 uppercase tracking-widest leading-none">Starting from</span>
                        <div className="flex items-baseline space-x-2 mt-1 leading-none">
                          <span className="text-zinc-400 line-through text-[11px]">₹{service.originalPrice.toLocaleString('en-IN')}</span>
                          <span className="text-pink-600 dark:text-amber-400 font-bold text-lg">₹{service.offerPrice.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onBookService(service)}
                        className="py-1.5 px-4 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold uppercase transition-all duration-200 hover:bg-pink-600 dark:hover:bg-amber-400 dark:hover:text-zinc-950 hover:text-white flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Book Now</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
