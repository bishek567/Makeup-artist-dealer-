import React, { useState } from 'react';
import { Eye, EyeOff, Sparkles, Heart } from 'lucide-react';

interface Transformation {
  id: number;
  title: string;
  category: string;
  beforeImg: string;
  afterImg: string;
  description: string;
  stars: number;
}

export default function BeforeAfterGallery() {
  const [activeToggleId, setActiveToggleId] = useState<Record<number, boolean>>({
    1: false, // false means showing side-by-side or 'after' majorly
    2: false,
    3: false
  });

  const transformations: Transformation[] = [
    {
      id: 1,
      title: 'Royal Bridal Glowup',
      category: 'Bridal Makeover',
      beforeImg: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=450&fit=crop',
      afterImg: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=450&fit=crop',
      description: 'Airbrush glow balancing porcelain texture, full dewy blush contouring, and traditional Kanjivaram styling braid setup.',
      stars: 5
    },
    {
      id: 2,
      title: 'Dewy Reception Chic',
      category: 'HD Makeup & Lashes',
      beforeImg: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=450&fit=crop',
      afterImg: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=450&fit=crop',
      description: 'Flawless foundation mapping matching peach matte undertones, paired with soft smoky eye gradients.',
      stars: 5
    },
    {
      id: 3,
      title: 'Cocktail Party Shimmer',
      category: 'Party Special',
      beforeImg: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=450&fit=crop',
      afterImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=450&fit=crop',
      description: 'Elegant winged liner with champagne shimmer eyeshadow accents and voluminous retro curls setting.',
      stars: 5
    }
  ];

  const handleToggleView = (id: number) => {
    setActiveToggleId(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <section className="py-16 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title Group */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-pink-600 dark:text-amber-400 font-serif italic text-sm font-medium">Beauty Transformations</span>
          <h2 className="text-3xl font-serif text-zinc-950 dark:text-white font-medium mt-1">Before & After Gallery</h2>
          <div className="h-0.5 w-16 bg-gradient-to-r from-pink-500 to-amber-500 mx-auto mt-3" />
          <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-3">
            Real clients, authentic makeovers. Use the interactive overlays to toggle before/after states or view them side-by-side. No artificial filters. Let clinical precision speak for itself.
          </p>
        </div>

        {/* Transformation Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {transformations.map((item) => {
            const showBefore = activeToggleId[item.id] || false;

            return (
              <div
                key={item.id}
                className="group rounded-2xl overflow-hidden border border-rose-100/10 dark:border-zinc-900 bg-rose-50/10 dark:bg-zinc-900/40 p-4 hover:shadow-xl transition-all duration-300"
              >
                
                {/* Visual Frame */}
                <div className="relative rounded-xl overflow-hidden h-[330px] shadow-sm bg-zinc-200 dark:bg-zinc-900">
                  <img
                    src={showBefore ? item.beforeImg : item.afterImg}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-all duration-550 filter grayscale-0"
                  />

                  {/* Indicator state badge */}
                  <span className={`absolute top-3 left-3 text-[10px] tracking-widest font-bold uppercase py-1 px-3.5 rounded-full shadow-lg border ${
                    showBefore
                      ? 'bg-zinc-950 text-amber-400 border-zinc-800'
                      : 'bg-gradient-to-r from-pink-600 to-rose-550 text-white border-pink-500'
                  }`}>
                    {showBefore ? 'Before Makeover' : 'Glamorous After'}
                  </span>

                  {/* Interactive toggle command overlay */}
                  <button
                    onClick={() => handleToggleView(item.id)}
                    className="absolute bottom-3 right-3 py-1.5 px-3.5 rounded-full bg-white/95 dark:bg-zinc-950/95 backdrop-blur text-zinc-800 dark:text-white text-[10px] font-bold uppercase tracking-wider shadow-md border border-neutral-200/25 flex items-center space-x-1.5 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                  >
                    {showBefore ? (
                      <>
                        <Eye className="h-3.5 w-3.5 text-pink-500" />
                        <span>Show Glamour</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3.5 w-3.5 text-pink-500" />
                        <span>Toggle Raw Before</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Info summary */}
                <div className="pt-4 text-left space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold font-mono tracking-wider text-pink-600 dark:text-amber-400">
                    <span>{item.category}</span>
                    <span className="flex items-center space-x-1">
                      <Heart className="h-3 w-3 fill-pink-500 text-pink-500 shrink-0" />
                      <span className="text-zinc-650 dark:text-zinc-400">Pure Joy</span>
                    </span>
                  </div>
                  
                  <h4 className="font-serif text-base font-semibold text-zinc-900 dark:text-white">
                    {item.title}
                  </h4>
                  
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
