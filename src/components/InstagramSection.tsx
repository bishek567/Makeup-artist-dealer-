import React from 'react';
import { Instagram, Heart, MessageCircle, Sparkles } from 'lucide-react';

interface InstaPost {
  id: number;
  img: string;
  likes: string;
  comments: string;
}

export default function InstagramSection() {
  const posts: InstaPost[] = [
    { id: 1, img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=350&fit=crop', likes: '1.2k', comments: '84' },
    { id: 2, img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=350&fit=crop', likes: '942', comments: '51' },
    { id: 3, img: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=350&fit=crop', likes: '2.5k', comments: '164' },
    { id: 4, img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=350&fit=crop', likes: '1.4k', comments: '98' },
    { id: 5, img: 'https://images.unsplash.com/photo-1515688594390-b649af70d282?q=80&w=350&fit=crop', likes: '890', comments: '42' },
    { id: 6, img: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=350&fit=crop', likes: '3.1k', comments: '211' }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-rose-50/10 to-white dark:from-zinc-900/10 dark:to-zinc-950 border-t border-rose-100/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Heading */}
        <div className="text-center max-w-lg mx-auto mb-12 space-y-1.5">
          <div className="inline-flex items-center space-x-1 text-pink-600">
            <Instagram className="h-4 w-4" />
            <span className="text-xs uppercase font-bold tracking-widest font-mono">@BeautionStudio</span>
          </div>
          <h3 className="text-2xl font-serif text-zinc-950 dark:text-white font-medium">Stories of Glow on Instagram</h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed">
            Follow our daily bridal trials, luxury skin preps, and behind-the-scenes masterclasses inside Bangalore’s flagship cosmetic design house.
          </p>
        </div>

        {/* Visual Instagram Feed Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="group relative aspect-square rounded-2xl overflow-hidden shadow-sm bg-neutral-200"
            >
              <img
                src={post.img}
                alt="Beaution Luxury makeup Instagram feed"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-350 group-hover:scale-105"
              />

              {/* Hover Dark Overlay mimicking real Instagram */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-4 text-white">
                <div className="flex items-center space-x-1 text-xs font-bold">
                  <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
                  <span>{post.likes}</span>
                </div>
                <div className="flex items-center space-x-1 text-xs font-bold">
                  <MessageCircle className="h-4 w-4 text-sky-400 fill-sky-400" />
                  <span>{post.comments}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
