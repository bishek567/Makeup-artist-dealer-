import React from 'react';
import { CalendarRange, Percent, Sparkles, Heart, Award, CheckCircle } from 'lucide-react';

interface HeroSectionProps {
  onOpenBooking: () => void;
  onViewOffers: () => void;
  onViewServices: () => void;
}

export default function HeroSection({
  onOpenBooking,
  onViewOffers,
  onViewServices,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-rose-50/10 to-white dark:from-zinc-950 dark:via-zinc-900/10 dark:to-zinc-950 py-12 lg:py-24">
      {/* Background elegant circles */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-pink-100/30 rounded-full blur-3xl -z-10 dark:bg-pink-900/5 animate-pulse" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-amber-100/30 rounded-full blur-3xl -z-10 dark:bg-amber-900/5" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Main Typography Grid Column */}
          <div className="lg:col-span-7 text-left space-y-6">
            <div className="inline-flex items-center space-x-2 py-1 px-3 rounded-full bg-pink-50 dark:bg-zinc-950 border border-pink-100/30 dark:border-zinc-800">
              <Sparkles className="h-3.5 w-3.5 text-pink-500 dark:text-amber-400 animate-spin" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-600 dark:text-zinc-300">
                Premium Makeup Studio & Atelier
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-serif tracking-tight text-zinc-900 dark:text-white leading-tight font-medium">
              Enhance Your Beauty with <span className="bg-gradient-to-r from-pink-600 to-amber-500 bg-clip-text text-transparent font-semibold">Expert Makeup</span>
            </h1>

            <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed max-w-lg">
              Step into a luxury beauty experience with <span className="font-semibold text-pink-600 dark:text-amber-400">Beaution</span>. 
              Our licensed cosmetology partners offer custom airbrush finishes, breathtaking HD bridal glowups, and artistic hair styling designed to highlight your authentic aura for wedding banquets, receptions, and cocktail parties. We use premium, allergy-safe luxury brands.
            </p>

            {/* CTA Option Blocks */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <button
                onClick={onOpenBooking}
                className="flex items-center space-x-2 bg-gradient-to-r from-pink-600 to-amber-500 text-white font-medium text-xs sm:text-sm px-6 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer transition-all uppercase tracking-wider"
              >
                <CalendarRange className="h-4.5 w-4.5" />
                <span>Book Appointment</span>
              </button>

              <button
                onClick={onViewOffers}
                className="flex items-center space-x-2 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-250 dark:border-zinc-800 font-medium text-xs sm:text-sm px-6 py-3 rounded-full hover:bg-rose-50/40 dark:hover:bg-zinc-800 cursor-pointer transition-all uppercase tracking-wider"
              >
                <Percent className="h-4 w-4 text-pink-500" />
                <span>View Special Offers</span>
              </button>
            </div>

            {/* Quick trust metrics banner */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-rose-100/20 dark:border-zinc-800 max-w-md">
              <div className="flex items-center space-x-1.5">
                <Heart className="h-4 w-4 text-pink-500 shrink-0" />
                <span className="text-xs text-zinc-600 dark:text-zinc-400"><strong className="text-zinc-900 dark:text-zinc-100">5k+</strong> Brides Glowed</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Award className="h-4 w-4 text-amber-500 shrink-0" />
                <span className="text-xs text-zinc-600 dark:text-zinc-400"><strong className="text-zinc-900 dark:text-zinc-100">100%</strong> Certified Pros</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-xs text-zinc-600 dark:text-zinc-400"><strong className="text-zinc-900 dark:text-zinc-100">4.9★</strong> Top Rated</span>
              </div>
            </div>
          </div>

          {/* Model Portrait Column with Promotional Overlay */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            {/* Main Image Frame with Luxury Overlay borders */}
            <div className="relative mx-auto max-w-sm sm:max-w-md rounded-2xl overflow-hidden shadow-2xl p-2 bg-gradient-to-tr from-pink-300 via-amber-200 to-rose-300">
              <img
                src="/src/assets/images/makeup_hero_model_1781775404753.jpg"
                alt="Beaution Professional Makeup Highlight"
                referrerPolicy="no-referrer"
                className="w-full h-[360px] sm:h-[430px] object-cover rounded-xl hover:scale-105 transition-transform duration-500"
              />

              {/* Float pricing discount pill */}
              <div className="absolute top-4 right-4 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md text-zinc-900 dark:text-white px-3 py-1.5 rounded-full shadow-lg border border-rose-100/20 flex items-center space-x-1.5">
                <Percent className="h-3.5 w-3.5 text-pink-500 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wide">Flat 25% Off Packages</span>
              </div>

              {/* Floating Quick Feature Card */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md rounded-xl p-4 border border-rose-100/20 text-zinc-900 dark:text-white shadow-xl text-left">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[11px] uppercase font-bold text-pink-600 dark:text-amber-400">Featured Service</span>
                  <span className="text-xs font-bold text-emerald-500">★★★★★</span>
                </div>
                <h4 className="font-serif text-sm font-semibold text-zinc-900 dark:text-white">Royal HD Bridal Makeup</h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Waterproof airbrush prep, custom hairstyle setting, and complete saree pleat styling.</p>
                <div className="mt-2.5 flex items-center justify-between border-t border-rose-100/10 pt-2.5">
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-zinc-400 line-through text-[10px]">₹15,000</span>
                    <span className="text-xs font-bold text-pink-600">₹11,999</span>
                  </div>
                  <button
                    onClick={onOpenBooking}
                    className="text-[10px] font-bold text-white bg-pink-600 hover:bg-pink-700 py-1 px-3 rounded-full uppercase transition-all"
                  >
                    Quick Book
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
