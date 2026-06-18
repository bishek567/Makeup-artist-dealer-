import React, { useState, useEffect } from 'react';
import { SupportContact, CustomerMessage } from '../types';
import { Phone, Mail, MapPin, Clock, MessageSquare, Send, CheckCircle, Smartphone, AlertTriangle, MessageCircle, AlertCircle } from 'lucide-react';

interface ContactSupportProps {
  contacts: SupportContact[];
  onMessageSent: () => void;
}

export default function ContactSupport({
  contacts,
  onMessageSent,
}: ContactSupportProps) {
  // Input fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  // Status alerts
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');

  // Live Chat simulation states
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'agent'; text: string; time: string }[]>([
    { sender: 'agent', text: 'Hello! Welcome to Beaution live support desk. How might we help with your makeup packages today?', time: '9:00 AM' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    setSuccessText('');

    if (!name.trim() || !phone.trim() || !email.trim() || !message.trim()) {
      setErrorText('Please load all required field items before submission.');
      return;
    }

    if (!email.includes('@')) {
      setErrorText('Your email address requires an @ symbol.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, message })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to dispatch inquiry message.');
      }

      setSuccessText('Thank you! Your inquiries are safely logged. Our specialists will call you within 2 hours.');
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
      onMessageSent();
    } catch (err: any) {
      setErrorText(err.message || 'Transmission error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // WhatsApp click handler simulation
  const handleWhatsappTrigger = (phoneNumber: string) => {
    const formatted = phoneNumber.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${formatted}?text=Hi%20Beaution!%20I%20would%20like%20to%20book%20bridal/makeup%20services.`;
    window.open(url, '_blank');
  };

  // Interactive Live Chat simulation
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setChatInput('');

    // Trigger agents automated response based on makeup query
    setTimeout(() => {
      let automatedText = 'Thank you for your message. An elite stylist from our MG Road Galleria will contact you shortly!';
      const msgLower = userMsg.toLowerCase();
      if (msgLower.includes('bridal') || msgLower.includes('wedding')) {
        automatedText = 'A beautiful wedding choice! Our high-end Bridal package currently includes Airbrush upgrades, saree plait pinning, and thermal protection styling. Would you like us to schedule a free trial?';
      } else if (msgLower.includes('price') || msgLower.includes('offer') || msgLower.includes('cost')) {
        automatedText = 'Our Bronze and Silver packages represent excellent savings with up to 30% discount tags ticking down. You can secure these rates with a nominal booking deposit!';
      }

      setChatMessages(prev => [...prev, { sender: 'agent', text: automatedText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 1200);
  };

  return (
    <section className="py-16 bg-white dark:bg-zinc-950 border-t border-rose-100/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-pink-600 dark:text-amber-400 font-serif italic text-sm font-medium">Dealer Support & Contacts</span>
          <h2 className="text-3xl font-serif text-zinc-950 dark:text-white font-medium mt-1">Get in Touch</h2>
          <div className="h-0.5 w-16 bg-gradient-to-r from-pink-500 to-amber-500 mx-auto mt-3" />
          <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-3">
            Available daily across flagship retail salons. Get emergency support or message our concierge makeup group directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Support Information (5 columns) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <h3 className="text-lg font-serif font-semibold text-zinc-900 dark:text-white pb-3 border-b border-zinc-100 dark:border-zinc-800">
              Dealer Support Desks
            </h3>

            {/* Support Cards */}
            <div className="space-y-4">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-5 rounded-2xl border border-rose-100/10 dark:border-zinc-800 bg-rose-50/10 dark:bg-zinc-900/40 space-y-4 relative"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-serif font-bold text-sm text-zinc-900 dark:text-white">{contact.name}</h4>
                    <span className="text-[9px] uppercase font-bold py-0.5 px-2 bg-emerald-500/10 text-emerald-600 rounded">
                      ONLINE
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-350">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-3.5 w-3.5 text-pink-500 shrink-0" />
                      <span className="font-mono">{contact.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-3.5 w-3.5 text-pink-500 shrink-0" />
                      <span className="font-mono">{contact.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-3.5 w-3.5 text-pink-500 shrink-0" />
                      <span>{contact.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3.5 w-3.5 text-pink-500 shrink-0" />
                      <span>{contact.supportTiming}</span>
                    </div>
                  </div>

                  {/* Hot interactive Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                    {/* Call now */}
                    <a
                      href={`tel:${contact.phone}`}
                      className="py-1.5 px-3 rounded-full bg-zinc-950 dark:bg-zinc-100 text-white dark:text-black font-semibold text-[10px] uppercase flex items-center space-x-1 hover:opacity-85 transition-opacity"
                    >
                      <Smartphone className="h-3 w-3" />
                      <span>Call Now</span>
                    </a>

                    {/* WhatsApp */}
                    <button
                      type="button"
                      onClick={() => handleWhatsappTrigger(contact.phone)}
                      className="py-1.5 px-3 rounded-full bg-emerald-500 text-white font-semibold text-[10px] uppercase flex items-center space-x-1 hover:opacity-90 transition-opacity"
                    >
                      <MessageCircle className="h-3 w-3" />
                      <span>WhatsApp support</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Special Emergency support alert */}
            <div className="p-4 rounded-xl border border-amber-300/20 bg-amber-500/5 text-amber-600 dark:text-amber-400 text-xs flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Bridal Day Emergency Coordination</strong>
                Our travel makeup specialists accommodate early hours (4:00 AM onwards). Dial the Emergency Hotline for instant slot routing.
              </div>
            </div>
            
            {/* Live Chat Drawer Trigger button */}
            <button
              onClick={() => setShowLiveChat(true)}
              className="w-full py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-amber-500 font-bold text-xs uppercase text-white shadow-md hover:scale-101 hover:opacity-95 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <MessageSquare className="h-4.5 w-4.5 animate-pulse" />
              <span>Initiate Live Help Desk</span>
            </button>
          </div>

          {/* Contact Form Submission (7 columns) */}
          <div className="lg:col-span-7 bg-zinc-50 dark:bg-zinc-900 border border-rose-100/10 dark:border-zinc-800 p-6 rounded-3xl text-left flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-serif font-semibold text-zinc-900 dark:text-white pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-6">
                Send Digital Enquiry
              </h3>

              {successText && (
                <div className="mb-4 p-3 bg-emerald-100/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl flex items-center space-x-2">
                  <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                  <span>{successText}</span>
                </div>
              )}

              {errorText && (
                <div className="mb-4 p-3 bg-red-100/10 border border-red-500/20 text-red-500 text-xs rounded-xl flex items-center space-x-1.5">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{errorText}</span>
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Shalini Roy"
                      className="w-full py-2 px-3 bg-white dark:bg-zinc-950 border border-rose-100/10 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-pink-500 text-zinc-800 dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Your Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 9111122222"
                      className="w-full py-2 px-3 bg-white dark:bg-zinc-950 border border-rose-100/10 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-pink-500 text-zinc-800 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Your Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. shalini@outlook.com"
                    className="w-full py-2 px-3 bg-white dark:bg-zinc-950 border border-rose-100/10 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-pink-500 text-zinc-800 dark:text-zinc-100 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Tell us your specific requirement or wedding date</label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="e.g. I have my engagement ceremony on Oct 11th. I would like to enquire if the Airbrush package covers hair spray glitter..."
                    className="w-full py-2 px-3 bg-white dark:bg-zinc-950 border border-rose-100/10 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-pink-500 text-zinc-800 dark:text-zinc-100 resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="py-2.5 px-6 rounded-full bg-zinc-950 hover:bg-pink-650 dark:bg-zinc-100 dark:text-black dark:hover:bg-amber-400 dark:hover:text-black hover:text-white text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{loading ? 'Transmitting...' : 'Submit Inquiry'}</span>
                  </button>
                </div>
              </form>
            </div>
            
            <p className="text-[10px] text-zinc-400 mt-6 leading-relaxed">
              *By submitting this form, you acknowledge that our representatives may reach out to you via SMS or email regarding scheduling requests and special promotional campaign items.
            </p>
          </div>

        </div>
      </div>

      {/* FLOATING INTERACTIVE SIMULATED LIVE CHAT COLLAPSE DESK */}
      {showLiveChat && (
        <div className="fixed bottom-6 right-6 z-50 w-80 shadow-2xl rounded-2xl overflow-hidden border border-rose-100/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-sans text-xs flex flex-col h-96">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-600 to-amber-500 p-3 text-white flex justify-between items-center shrink-0">
            <span className="font-bold uppercase tracking-wide flex items-center space-x-1">
              <MessageSquare className="h-3.5 w-3.5 animate-bounce" />
              <span>Live Assistant</span>
            </span>
            <button onClick={() => setShowLiveChat(false)} className="text-white/80 hover:text-white font-bold cursor-pointer">
              🗙
            </button>
          </div>

          {/* Chat Messages Panel */}
          <div className="p-3 flex-1 overflow-y-auto space-y-3 bg-rose-50/10 dark:bg-zinc-950">
            {chatMessages.map((msg, idx) => {
              const isAgent = msg.sender === 'agent';
              return (
                <div key={idx} className={`flex ${isAgent ? 'justify-start' : 'justify-end'}`}>
                  <div className={`p-2.5 rounded-xl max-w-[85%] text-left ${
                    isAgent
                      ? 'bg-neutral-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-205 rounded-tl-none'
                      : 'bg-pink-600 text-white rounded-tr-none'
                  }`}>
                    <p>{msg.text}</p>
                    <span className="text-[9px] text-zinc-400 block mt-1 text-right">{msg.time}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Input Field Form */}
          <form onSubmit={handleSendChatMessage} className="p-2 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 flex items-center gap-1.5">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask anything (e.g. Bridal pricing)..."
              className="flex-1 bg-zinc-50 dark:bg-zinc-800 p-2 rounded-xl border border-rose-100/15 focus:outline-none focus:ring-1 focus:ring-pink-500 text-xs text-zinc-900 dark:text-white"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold font-mono transition-colors shrink-0"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
