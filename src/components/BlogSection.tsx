import React, { useState } from 'react';
import { Send, CheckCircle, Newspaper, Sparkles, BookOpen } from 'lucide-react';

interface Article {
  title: string;
  excerpt: string;
  image: string;
  readTime: string;
  category: string;
}

export default function BlogSection() {
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const tips: Article[] = [
    {
      title: 'Optimal Skin Preparation Routine Prior to Airbrush foundations',
      excerpt: 'Discover why cellular hydration, gentle chemical exfoliation, and silicone-free hydrating primers determine the flawless durability of your makeup.',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=300&fit=crop',
      readTime: '3 min read',
      category: 'Skin Prep'
    },
    {
      title: '5 Crucial Hair Accessories of the Modern Indian Bride',
      excerpt: 'From floral baby’s breaths and pearl-encrusted pins to traditional gold jada arrangements, explore the trending hairstyling designs for reception chignons.',
      image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=300&fit=crop',
      readTime: '4 min read',
      category: 'Hair Styling'
    },
    {
      title: 'Keeping Lip Colors Completely Smudge-Proof Through Banquets',
      excerpt: 'Step-by-step masterclass on applying hydration liners, pigment dusting, layering matte formulas, and locks to withstand continuous catering cycles.',
      image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=300&fit=crop',
      readTime: '5 min read',
      category: 'Bridal Hacks'
    }
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim() && emailInput.includes('@')) {
      setSubscribed(true);
      setEmailInput('');
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white to-rose-50/10 dark:from-zinc-950 dark:to-zinc-900/10 border-t border-rose-100/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-pink-600 dark:text-amber-400 font-serif italic text-sm font-medium">Beaution Atelier Reading</span>
          <h2 className="text-3xl font-serif text-zinc-950 dark:text-white font-medium mt-1">Beauty Tips & Blog</h2>
          <div className="h-0.5 w-16 bg-gradient-to-r from-pink-500 to-amber-400 mx-auto mt-3" />
        </div>

        {/* Blog Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {tips.map((article, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-rose-100/10 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col justify-between text-left hover:shadow-lg transition-all"
            >
              <div>
                <div className="h-44 overflow-hidden relative">
                  <img
                    src={article.image}
                    alt={article.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur py-0.5 px-2.5 rounded text-[9px] uppercase font-bold text-amber-400 tracking-wider">
                    {article.category}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <span className="text-[10px] text-zinc-400 block font-medium uppercase tracking-wider">{article.readTime}</span>
                  <h4 className="font-serif font-semibold text-sm sm:text-base text-zinc-900 dark:text-white leading-snug line-clamp-2">
                    {article.title}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button className="text-[10px] uppercase font-bold text-pink-600 hover:text-pink-700 flex items-center space-x-1 hover:underline cursor-pointer">
                  <BookOpen className="h-3 w-3" />
                  <span>Read Full Masterclass</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter Banner Subscription */}
        <div className="bg-zinc-950 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl border border-zinc-850">
          <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-gradient-to-r from-pink-600 to-amber-500 blur-3xl opacity-20 pointer-events-none" />
          
          <div className="max-w-2xl mx-auto space-y-6 text-center">
            <div className="inline-flex items-center space-x-1.5 p-1 px-3.5 bg-zinc-900 border border-zinc-800 rounded-full">
              <Newspaper className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[10px] uppercase font-bold tracking-widest leading-none">The Beaution Dispatch</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-serif font-semibold tracking-tight">Subscribe to Unlock 15% Off Your Next Hairstyle</h3>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-lg mx-auto">
              Join local subscribers and receive bespoke beauty tips, allergen-free cosmetic advice, and exclusive access to holiday booking codes before public announcement.
            </p>

            {subscribed ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3 rounded-xl max-w-sm mx-auto flex items-center justify-center space-x-2">
                <CheckCircle className="h-4.5 w-4.5" />
                <span>Success! Check your inbox for code keys.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email address..."
                  className="bg-zinc-900 border border-zinc-800 rounded-full py-2 px-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400 w-full sm:flex-1 font-mono"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-pink-600 to-amber-500 py-2.5 px-6 rounded-full text-xs font-bold uppercase tracking-wider text-white hover:opacity-95 cursor-pointer w-full sm:w-auto shrink-0 flex items-center justify-center space-x-1.5"
                >
                  <Send className="h-3 w-3" />
                  <span>Subscribe</span>
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
