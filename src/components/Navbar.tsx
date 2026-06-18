import React, { useState } from 'react';
import { Sparkles, Bell, Search, Sun, Moon, ShieldAlert, CalendarRange, Menu, X } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  onOpenBooking: () => void;
  onOpenAdmin: () => void;
  onOpenProfile: () => void;
  isAdminLoggedIn: boolean;
  onLogoutAdmin: () => void;
  bookingCount: number;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  isDarkMode,
  setIsDarkMode,
  onOpenBooking,
  onOpenAdmin,
  onOpenProfile,
  isAdminLoggedIn,
  onLogoutAdmin,
  bookingCount,
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mock Notification Deck for the user
  const notifications = [
    { id: 1, text: '🎉 Welcome to Beaution! Enjoy up to 30% off special Bridal bookings.', time: 'Just now' },
    { id: 2, text: '⏳ Offer Alert: Free gold-plated hair pins trail with Premium Packages.', time: '2 hours ago' },
    { id: 3, text: '✨ Flash Sale: Airbrush glow package is down to ₹11,999!', time: '1 day ago' },
  ];

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 transition-colors duration-300 border-b border-rose-100/10 backdrop-blur-md bg-white/75 dark:bg-zinc-950/75">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand Title */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => handleTabClick('home')}>
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-pink-400 to-amber-400 flex items-center justify-center shadow-md">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-serif font-tracking-widest bg-gradient-to-r from-pink-600 via-amber-500 to-rose-600 bg-clip-text text-transparent font-medium">
              Beaution
            </span>
          </div>

          {/* Desktop Search Center */}
          <div className="hidden md:flex items-center flex-1 max-w-xs mx-8">
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-zinc-400" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services (e.g. Bridal)..."
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full border border-rose-100 dark:border-zinc-800 bg-rose-50/30 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all text-zinc-800 dark:text-zinc-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2 text-zinc-400 hover:text-zinc-600 text-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center space-x-8">
            {['home', 'services', 'offers', 'gallery', 'blog', 'support'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`text-xs uppercase font-medium tracking-widest transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'text-pink-600 dark:text-amber-400 font-bold border-b-2 border-pink-500 pb-1'
                    : 'text-zinc-600 dark:text-zinc-300 hover:text-pink-500 dark:hover:text-amber-300'
                }`}
              >
                {tab === 'home' ? 'Home' : tab === 'offers' ? 'Offers & Prices' : tab === 'gallery' ? 'Transformations' : tab === 'blog' ? 'Beauty Blog' : tab}
              </button>
            ))}
          </div>

          {/* User Controls & Admin Indicators */}
          <div className="hidden md:flex items-center space-x-4 ml-4">
            
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full hover:bg-rose-50 dark:hover:bg-zinc-900 transition-colors"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-zinc-600" />}
            </button>

            {/* Notification Deck */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full hover:bg-rose-50 dark:hover:bg-zinc-900 transition-colors relative"
              >
                <Bell className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-pink-500 animate-pulse" />
              </button>

              {/* Notification Box */}
              {showNotifications && (
                <div id="notification-box" className="absolute right-0 mt-3 w-80 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-rose-100 dark:border-zinc-800 py-3 z-50">
                  <div className="px-4 pb-2 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200">Alerts & Offers</span>
                    <button onClick={() => setShowNotifications(false)} className="text-[10px] text-pink-500 hover:underline">Mark all read</button>
                  </div>
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-64 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="p-3 text-left hover:bg-rose-50/20 dark:hover:bg-zinc-800/30 transition-colors">
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-300">{notif.text}</p>
                        <span className="text-[9px] text-zinc-400 font-medium block mt-1">{notif.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Portal Button */}
            {isAdminLoggedIn ? (
              <div className="flex items-center space-x-1.5 py-1 px-3 bg-green-500/10 border border-green-500/20 rounded-full text-green-600 dark:text-green-400">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold cursor-pointer" onClick={onOpenAdmin}>Salon Admin</span>
                <button
                  onClick={onLogoutAdmin}
                  className="text-[9px] font-medium uppercase ml-2 text-red-500 dark:text-red-400 hover:underline"
                  title="Logout"
                >
                  Exit
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdmin}
                className="p-2 rounded-full hover:bg-rose-50 dark:hover:bg-zinc-900 transition-colors"
                title="Admin Login"
              >
                <ShieldAlert className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
              </button>
            )}

            {/* VIP Club Profile Button */}
            <button
              onClick={onOpenProfile}
              className="flex items-center space-x-1 py-1.5 px-3.5 rounded-full border border-pink-300/30 dark:border-zinc-850 bg-pink-500/10 hover:bg-pink-500/15 text-pink-600 dark:text-amber-400 font-semibold text-[10px] uppercase tracking-wider transition-all hover:scale-105 cursor-pointer"
              title="Manage Profile Verification"
            >
              <span>My Profile 👤</span>
            </button>

            {/* Core CTA Booking Booking Button */}
            <button
              onClick={onOpenBooking}
              className="flex items-center space-x-1.5 py-2 px-4 rounded-full bg-gradient-to-r from-pink-500 to-amber-500 text-white font-medium text-xs uppercase tracking-wider hover:opacity-90 shadow-sm transition-all hover:scale-105 cursor-pointer"
            >
              <CalendarRange className="h-3.5 w-3.5" />
              <span>Book Appointment</span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center space-x-2 lg:hidden">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1 rounded-full hover:bg-rose-50 dark:hover:bg-zinc-900 transition-colors"
            >
              {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-zinc-600" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-600 dark:text-zinc-300"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-zinc-950 px-4 pt-2 pb-6 border-b border-rose-100 dark:border-zinc-800 space-y-3 shadow-xl">
          {/* Mobile Search */}
          <div className="relative pt-2">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pt-2">
              <Search className="h-3.5 w-3.5 text-zinc-400" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services..."
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full border border-rose-100 dark:border-zinc-800 bg-rose-50/20 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
            />
          </div>

          <div className="flex flex-col space-y-2">
            {['home', 'services', 'offers', 'gallery', 'blog', 'support'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`text-left py-2 px-3 text-xs uppercase tracking-widest rounded-lg font-medium ${
                  activeTab === tab
                    ? 'bg-rose-100/40 dark:bg-zinc-900 text-pink-600 dark:text-amber-400'
                    : 'text-zinc-600 dark:text-zinc-300'
                }`}
              >
                {tab === 'home' ? 'Home' : tab === 'offers' ? 'Offers & Prices' : tab === 'gallery' ? 'Transformations' : tab === 'blog' ? 'Beauty Blog' : tab}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              {isAdminLoggedIn ? (
                <button onClick={() => { setMobileMenuOpen(false); onOpenAdmin(); }} className="text-xs text-green-500 font-bold bg-green-550/10 py-1.5 px-3 rounded-full">
                  ✓ Admin Panel
                </button>
              ) : (
                <button onClick={() => { setMobileMenuOpen(false); onOpenAdmin(); }} className="text-xs text-zinc-500 font-medium bg-rose-50 dark:bg-zinc-900 py-1.5 px-3 rounded-full">
                  🔒 Admin Login
                </button>
              )}

              <button
                onClick={() => { setMobileMenuOpen(false); onOpenProfile(); }}
                className="text-xs text-pink-500 font-bold bg-pink-500/10 py-1.5 px-3.5 rounded-full text-center hover:scale-105 active:scale-95 cursor-pointer"
              >
                👤 My Profile
              </button>
            </div>

            <button
              onClick={() => { setMobileMenuOpen(false); onOpenBooking(); }}
              className="w-full text-center py-2 px-5 rounded-full bg-gradient-to-r from-pink-500 to-amber-500 text-white font-medium text-[11px] uppercase tracking-wider block"
            >
              Book Appointment
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
