import React, { useState, useEffect } from 'react';
import { OfferPackage } from '../types';
import { Check, Clock, TrendingDown, Calendar, Percent } from 'lucide-react';

interface OffersPricingProps {
  packages: OfferPackage[];
  onBookPackage: (pkg: OfferPackage) => void;
}

export default function OffersPricing({
  packages,
  onBookPackage,
}: OffersPricingProps) {
  // Dynamic countdown calculations
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 28,
    minutes: 42,
    seconds: 15,
  });

  useEffect(() => {
    // Generate a ticking target: End of tomorrow
    const target = new Date();
    target.setHours(23, 59, 59, 1000);
    // Add 1 extra day to maintain tension/validity
    target.setDate(target.getDate() + 1);

    const interval = setInterval(() => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        // Reset to next cycle automatically
        target.setDate(new Date().getDate() + 1);
      } else {
        const totalSecs = Math.floor(diff / 1000);
        const hours = Math.floor(totalSecs / 3600);
        const minutes = Math.floor((totalSecs % 3600) / 60);
        const seconds = totalSecs % 60;
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 bg-gradient-to-b from-white to-rose-50/10 dark:from-zinc-950 dark:to-zinc-900/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Flash Sale Banner + Timer */}
        <div className="bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 rounded-3xl p-6 sm:p-10 text-white shadow-xl mb-16 text-center md:text-left md:flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-1.5 py-1 px-3 bg-white/20 border border-white/20 rounded-full">
              <Clock className="h-3.5 w-3.5 text-amber-250 animate-pulse" />
              <span className="text-[10px] uppercase font-bold tracking-widest leading-none">Limited Bridal Season Sale</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight">Save on Beaution Curated Bundles</h3>
            <p className="text-white/80 text-xs sm:text-sm">
              Lock in your booking today by paying a partial scheduling deposit and preserve these promotional prices for appointments scheduled anytime up to December 2026!
            </p>
          </div>

          {/* Golden Ticking Counter */}
          <div className="mt-6 md:mt-0 bg-black/35 backdrop-blur-md rounded-2xl p-4 border border-white/10 shrink-0 text-center min-w-[240px]">
            <span className="text-[10px] uppercase font-bold text-amber-300 block mb-2 tracking-widest">Offers Expire In:</span>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/10 px-2 py-3 rounded-xl border border-white/10">
                <span className="text-2xl font-bold font-mono tracking-wider">{timeLeft.hours.toString().padStart(2, '0')}</span>
                <span className="text-[9px] uppercase text-white/70 block mt-1">Hrs</span>
              </div>
              <div className="bg-white/10 px-2 py-3 rounded-xl border border-white/10">
                <span className="text-2xl font-bold font-mono tracking-wider">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                <span className="text-[9px] uppercase text-white/70 block mt-1">Mins</span>
              </div>
              <div className="bg-white/10 px-2 py-3 rounded-xl border border-white/10">
                <span className="text-2xl font-bold font-mono tracking-wider">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                <span className="text-[9px] uppercase text-white/70 block mt-1">Secs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Title */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-pink-600 dark:text-amber-400 font-serif italic text-sm font-medium">Beauty Packages</span>
          <h2 className="text-3xl font-serif text-zinc-950 dark:text-white font-medium mt-1">Special Bundled Offers</h2>
          <div className="h-0.5 w-16 bg-gradient-to-r from-pink-500 to-amber-500 mx-auto mt-3" />
        </div>

        {/* Dynamic Package Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {packages.map((pkg) => {
            const isPremium = pkg.name.toLowerCase().includes('premium') || pkg.name.toLowerCase().includes('gold');
            const savings = pkg.originalPrice - pkg.offerPrice;

            return (
              <div
                key={pkg.id}
                className={`flex flex-col justify-between rounded-3xl p-6 transition-all duration-300 border text-left ${
                  isPremium
                    ? 'bg-zinc-900 border-zinc-800 text-white dark:bg-zinc-900 dark:border-pink-500/30 scale-100 lg:scale-[1.03] shadow-xl relative'
                    : 'bg-white border-rose-100/10 text-zinc-900 dark:bg-zinc-950 dark:border-zinc-800 shadow-sm'
                }`}
              >
                {/* Popularity indicator tag */}
                {isPremium && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 py-1 px-4 bg-gradient-to-r from-pink-600 to-amber-500 text-white font-bold text-[9px] uppercase tracking-widest rounded-full shadow-md leading-none">
                    Most Popular Choice
                  </span>
                )}

                {/* Package Headers */}
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[10px] uppercase font-extrabold tracking-widest py-0.5 px-2.5 rounded-full ${
                      isPremium ? 'bg-pink-600 text-white' : 'bg-rose-50 text-pink-600 dark:bg-zinc-900 dark:text-amber-300'
                    }`}>
                      {pkg.badge}
                    </span>
                    <span className="text-xs font-bold text-pink-500 flex items-center space-x-0.5">
                      <Percent className="h-3 w-3" />
                      <span>Saved ₹{savings.toLocaleString('en-IN')}</span>
                    </span>
                  </div>

                  <h4 className="font-serif text-xl font-semibold mb-2">{pkg.name}</h4>
                  <p className={`text-xs leading-relaxed mb-6 ${
                    isPremium ? 'text-zinc-450' : 'text-zinc-500 dark:text-zinc-400'
                  }`}>
                    {pkg.description}
                  </p>

                  <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-4" />

                  {/* Included Services List */}
                  <span className="text-[10px] uppercase font-bold tracking-wider block mb-3 text-zinc-500">Includes Services:</span>
                  <ul className="space-y-3 mb-8">
                    {pkg.services.map((servName, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-xs">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className={isPremium ? 'text-zinc-300' : 'text-zinc-700 dark:text-zinc-300'}>{servName}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pricing Block and booking call */}
                <div>
                  <div className="mb-5 flex items-baseline space-x-2 justify-start leading-none">
                    <span className="text-zinc-400 line-through text-xs">₹{pkg.originalPrice.toLocaleString('en-IN')}</span>
                    <span className="text-2xl font-bold font-serif leading-none text-pink-650 dark:text-amber-400">
                      ₹{pkg.offerPrice.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    onClick={() => onBookPackage(pkg)}
                    className={`w-full py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                      isPremium
                        ? 'bg-gradient-to-r from-pink-600 to-amber-500 text-white hover:opacity-90 shadow-md'
                        : 'bg-zinc-950 hover:bg-pink-600 hover:text-white dark:bg-zinc-800 dark:hover:bg-amber-400 dark:hover:text-zinc-950 text-white transition-colors'
                    }`}
                  >
                    Select Package
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
