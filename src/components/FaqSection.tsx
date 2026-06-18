import React, { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: 'Which cosmetic brands do your makeup designers use?',
      answer: 'Our professional cosmetology partners pack strictly premium, safety-audited global brands. This typically includes MAC, Estée Lauder, HUDA Beauty, NARS, Charlotte Tilbury, and allergy-tested Anastasia Beverly Hills. All brushes are sanitized prior to contact.'
    },
    {
      question: 'What is the duration of an HD Bridal Makeover session?',
      answer: 'An elite HD Bridal style takes approximately 2.5 to 3 hours. This duration guarantees pristine deep hydration skin prep, complete custom hair updos, stable saree plait pinning, and dual-layer touchups.'
    },
    {
      question: 'How long prior to the event should I schedule my slot?',
      answer: 'We highly suggest scheduling bridal makeup locks at least 2 to 6 months before your grand wedding banquets. For standard cocktail parties or guest makeup, booking 1 to 2 weeks in advance is perfect.'
    },
    {
      question: 'Do you provide venue travel services for destination weddings?',
      answer: 'Yes! Our Special Bridal Emergency Hotline handles venue assignments. We travel both local and outstations for destination wedding sequences alongside dedicated touchup artists.'
    },
    {
      question: 'Is a deposit required to lock in package prices?',
      answer: 'Yes. To lock down current limited-time discount prices, we require a nominal secure online deposit during scheduling. The remaining fee is settled post-service at the salon.'
    }
  ];

  const handleToggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-16 bg-white dark:bg-zinc-950 border-t border-rose-100/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Title */}
        <div className="text-center mb-12">
          <span className="text-pink-600 dark:text-amber-400 font-serif italic text-sm">Got Questions?</span>
          <h3 className="text-2xl sm:text-3xl font-serif text-zinc-950 dark:text-white font-medium mt-1">Frequently Asked Questions</h3>
          <div className="h-0.5 w-16 bg-gradient-to-r from-pink-500 to-amber-400 mx-auto mt-3" />
        </div>

        {/* Accordions */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="rounded-2xl border border-rose-100/10 dark:border-zinc-800 bg-rose-50/10 dark:bg-zinc-900/40 overflow-hidden text-left transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => handleToggle(idx)}
                  className="w-full flex justify-between items-center p-5 font-serif font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 focus:outline-none hover:bg-rose-50/20 dark:hover:bg-zinc-800/20 cursor-pointer"
                >
                  <div className="flex items-center space-x-3 pr-4">
                    <HelpCircle className="h-4.5 w-4.5 text-pink-500 shrink-0" />
                    <span>{faq.question}</span>
                  </div>
                  <div>
                    {isOpen ? (
                      <Minus className="h-4 w-4 text-amber-500 shrink-0" />
                    ) : (
                      <Plus className="h-4 w-4 text-zinc-400 shrink-0" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-zinc-650 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed border-t border-zinc-100 dark:border-zinc-800 bg-white/40 dark:bg-zinc-950/40">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
