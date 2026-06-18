import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ServicesList from './components/ServicesList';
import OffersPricing from './components/OffersPricing';
import BeforeAfterGallery from './components/BeforeAfterGallery';
import InstagramSection from './components/InstagramSection';
import FaqSection from './components/FaqSection';
import BlogSection from './components/BlogSection';
import ContactSupport from './components/ContactSupport';
import BookingWizard from './components/BookingWizard';
import AdminPanel from './components/AdminPanel';
import { Service, OfferPackage, SupportContact, CustomerMessage, Booking } from './types';
import { Sparkles, Phone, Mail, MapPin, ShieldAlert, Heart, CalendarRange, Share2, Instagram, Facebook } from 'lucide-react';

export default function App() {
  // Navigation Routing Tab Route
  const [activeTab, setActiveTab] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dark/Light Theme Switching Context
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Booking Wizard states
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [preselectedService, setPreselectedService] = useState<Service | null>(null);
  const [preselectedPackage, setPreselectedPackage] = useState<OfferPackage | null>(null);

  // Administrative Sessions
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  // Core database dynamic lists
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<OfferPackage[]>([]);
  const [contacts, setContacts] = useState<SupportContact[]>([]);
  const [messages, setMessages] = useState<CustomerMessage[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Synchronize Dark Mode Class on Document level
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Initial Seed loading
  const loadInitialData = async () => {
    try {
      // Services
      const servicesRes = await fetch('/api/services');
      if (servicesRes.ok) {
        const list = await servicesRes.json();
        setServices(list);
      }

      // Packages
      const packagesRes = await fetch('/api/packages');
      if (packagesRes.ok) {
        const list = await packagesRes.json();
        setPackages(list);
      }

      // Support Contacts
      const contactsRes = await fetch('/api/contacts');
      if (contactsRes.ok) {
        const list = await contactsRes.json();
        setContacts(list);
      }
    } catch (e) {
      console.error('Error fetching public asset data lists from backend server:', e);
    }
  };

  // Fetch Restricted data only when Admin token is present
  const loadAdminRestrictedData = async () => {
    if (!adminToken) return;
    try {
      // Bookings logs
      const bookingsRes = await fetch('/api/bookings', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (bookingsRes.ok) {
        const list = await bookingsRes.json();
        setBookings(list);
      } else if (bookingsRes.status === 401 || bookingsRes.status === 403) {
        // Enforce logging safety
        handleAdminLogout();
      }

      // Messengers enquiries
      const messagesRes = await fetch('/api/messages', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (messagesRes.ok) {
        const list = await messagesRes.json();
        setMessages(list);
      }
    } catch (err) {
      console.error('Error fetching restricted admin listings:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (adminToken) {
      loadAdminRestrictedData();
    }
  }, [adminToken]);

  // Master Sync trigger
  const handleRefreshAllData = () => {
    loadInitialData();
    if (adminToken) {
      loadAdminRestrictedData();
    }
  };

  // Administrative Sessions logic
  const handleAdminLoginSuccess = (token: string) => {
    setAdminToken(token);
    setIsAdminLoggedIn(true);
    setActiveTab('admin');
  };

  const handleAdminLogout = async () => {
    if (adminToken) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
    }
    setAdminToken(null);
    setIsAdminLoggedIn(false);
    setActiveTab('home');
    setBookings([]);
    setMessages([]);
  };

  // Core dialog trigger helpers
  const handleOpenGeneralBooking = () => {
    setPreselectedService(null);
    setPreselectedPackage(null);
    setIsBookingOpen(true);
  };

  const handleBookService = (service: Service) => {
    setPreselectedService(service);
    setPreselectedPackage(null);
    setIsBookingOpen(true);
  };

  const handleBookPackage = (pkg: OfferPackage) => {
    setPreselectedService(null);
    setPreselectedPackage(pkg);
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between transition-colors duration-300 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      
      {/* 1. Brand Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onOpenBooking={handleOpenGeneralBooking}
        onOpenAdmin={() => setActiveTab('admin')}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogoutAdmin={handleAdminLogout}
        bookingCount={bookings.length}
      />

      {/* 2. Primary Tab route container rendering */}
      <main className="flex-grow">
        
        {/* TAB A: HOME PAGE */}
        {activeTab === 'home' && (
          <div className="space-y-0 animate-fade-in">
            {/* Master Hero Banner */}
            <HeroSection
              onOpenBooking={handleOpenGeneralBooking}
              onViewOffers={() => setActiveTab('offers')}
              onViewServices={() => setActiveTab('services')}
            />

            {/* Featured Services Section (Mini Catalog Grid) */}
            <ServicesList
              services={services.slice(0, 3)}
              searchQuery={searchQuery}
              onBookService={handleBookService}
            />

            {/* Before After Transformations Section */}
            <BeforeAfterGallery />

            {/* Simulated Instagram Feed Grid */}
            <InstagramSection />

            {/* Dynamic FAQ Accordions */}
            <FaqSection />

            {/* Curated Beauty Blog Tip sheets */}
            <BlogSection />
          </div>
        )}

        {/* TAB B: DETAILED SERVICES CATALOG */}
        {activeTab === 'services' && (
          <div className="animate-fade-in pt-6">
            <ServicesList
              services={services}
              searchQuery={searchQuery}
              onBookService={handleBookService}
            />
          </div>
        )}

        {/* TAB C: OFFERS & PACKAGES */}
        {activeTab === 'offers' && (
          <div className="animate-fade-in pt-6">
            <OffersPricing
              packages={packages}
              onBookPackage={handleBookPackage}
            />
          </div>
        )}

        {/* TAB D: BEFORE AFTER METAMORPHOSIS */}
        {activeTab === 'gallery' && (
          <div className="animate-fade-in pt-6">
            <BeforeAfterGallery />
          </div>
        )}

        {/* TAB E: BEAUTY TIPS ARTICLES */}
        {activeTab === 'blog' && (
          <div className="animate-fade-in pt-6">
            <BlogSection />
          </div>
        )}

        {/* TAB F: DEALER SUPPORT DESKS */}
        {activeTab === 'support' && (
          <div className="animate-fade-in pt-6">
            <ContactSupport
              contacts={contacts}
              onMessageSent={handleRefreshAllData}
            />
          </div>
        )}

        {/* TAB G: SECURE CONTROL CONSOLE PANEL FOR CRUD */}
        {activeTab === 'admin' && (
          <div className="animate-fade-in">
            <AdminPanel
              onLoginSuccess={handleAdminLoginSuccess}
              onLogout={handleAdminLogout}
              isAdminLoggedIn={isAdminLoggedIn}
              token={adminToken}
              services={services}
              packages={packages}
              contacts={contacts}
              messages={messages}
              bookings={bookings}
              refreshAllData={handleRefreshAllData}
            />
          </div>
        )}

      </main>

      {/* 3. Luxury Brand Footer with Map & social linkage */}
      <footer className="bg-zinc-950 text-white border-t border-zinc-900 pt-16 pb-8 text-left text-xs select-text">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            
            {/* Column 1: Brand & Bio */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-pink-500 to-amber-500 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-serif text-white tracking-wider">Beaution</span>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                Empowering individuals under their authentic auras with premium, certified global makeup products, personalized skin setups, and timeless wedding hair styles.
              </p>
              
              <div className="flex items-center space-x-4 pt-2">
                <a href="https://instagram.com" className="text-zinc-400 hover:text-pink-500 transition-colors" title="Instagram">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href="https://facebook.com" className="text-zinc-400 hover:text-pink-500 transition-colors" title="Facebook">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="https://wa.me/919876543210" className="text-zinc-400 hover:text-pink-500 transition-colors" title="WhatsApp support">
                  <Share2 className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Column 2: Quick Links Navigation triggers */}
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-sm text-amber-400 uppercase tracking-widest">Our Studio Hub</h4>
              <ul className="space-y-2.5 text-zinc-400">
                {['home', 'services', 'offers', 'gallery', 'blog', 'support'].map((tab) => (
                  <li key={tab}>
                    <button
                      onClick={() => { setActiveTab(tab); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="hover:text-pink-400 transition-colors capitalize text-left cursor-pointer"
                    >
                      {tab === 'home' ? 'Home Landmark' : tab === 'offers' ? 'Package Offers' : tab === 'gallery' ? 'Before After Slides' : tab === 'blog' ? 'Beauty Tips' : tab}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Contact landmark */}
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-sm text-amber-400 uppercase tracking-widest">Salon Coordinates</h4>
              <ul className="space-y-3 text-zinc-400 leading-relaxed font-sans">
                <li className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-pink-500 shrink-0 mt-0.5" />
                  <span>102 Luxury Galleria, MG Road, Bangalore, KA, 560001</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-pink-500 shrink-0" />
                  <span className="font-mono">+91 98765 43210</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-pink-500 shrink-0" />
                  <span className="font-mono">support@beaution.com</span>
                </li>
              </ul>
            </div>

            {/* Column 4: Quality assurances */}
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-sm text-amber-400 uppercase tracking-widest">Our Promise</h4>
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2.5">
                <span className="text-[10px] uppercase font-bold text-pink-500 block">✓ GDPR Compliant Guarding</span>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  We secure and encrypt all sensitive payment card transactions and telephone indices. No data is leased to third-party list brokers.
                </p>
                <button
                  onClick={handleOpenGeneralBooking}
                  className="w-full py-1.5 px-3 rounded-full bg-gradient-to-r from-pink-500 to-amber-500 text-white font-bold text-[9px] uppercase tracking-wider block hover:opacity-90"
                >
                  Schedule Slot Now
                </button>
              </div>
            </div>

          </div>

          <div className="h-px bg-zinc-900 my-8" />

          {/* Copyright & credit notice */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-zinc-500 text-[11px]">
            <span>© 2026 Beaution Makeup Studio. All Rights Reserved.</span>
            <div className="flex space-x-4">
              <span className="hover:underline cursor-pointer">Privacy Notice</span>
              <span>•</span>
              <span className="hover:underline cursor-pointer">Terms of Service</span>
              <span>•</span>
              <button onClick={() => setActiveTab('admin')} className="hover:underline font-bold text-zinc-400">Restricted Console</button>
            </div>
          </div>
        </div>
      </footer>

      {/* 4. Secure Booking Wizard checkout overlay dialog */}
      {isBookingOpen && (
        <BookingWizard
          services={services}
          packages={packages}
          preselectedService={preselectedService}
          preselectedPackage={preselectedPackage}
          onClose={() => setIsBookingOpen(false)}
          onBookingSuccess={handleRefreshAllData}
        />
      )}

    </div>
  );
}
