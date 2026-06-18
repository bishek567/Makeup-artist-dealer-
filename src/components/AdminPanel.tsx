import React, { useState, useEffect } from 'react';
import { Service, OfferPackage, Booking, SupportContact, CustomerMessage, DashboardStats } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { ShieldCheck, Lock, Mail, Key, User, PlusCircle, Trash2, Edit2, CheckCircle2, TrendingUp, DollarSign, Calendar, MessageSquare, AlertCircle, ShoppingBag, LogOut, Check, RefreshCw } from 'lucide-react';

interface AdminPanelProps {
  onLoginSuccess: (token: string) => void;
  onLogout: () => void;
  isAdminLoggedIn: boolean;
  token: string | null;
  services: Service[];
  packages: OfferPackage[];
  contacts: SupportContact[];
  messages: CustomerMessage[];
  bookings: Booking[];
  refreshAllData: () => void;
}

export default function AdminPanel({
  onLoginSuccess,
  onLogout,
  isAdminLoggedIn,
  token,
  services,
  packages,
  contacts,
  messages,
  bookings,
  refreshAllData,
}: AdminPanelProps) {
  // Login credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Active workspace tab
  const [activeAdminTab, setActiveAdminTab] = useState<'stats' | 'bookings' | 'services' | 'packages' | 'messages_contacts'>('stats');

  // Stats Analytics
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Modal forms states (CRUD edits)
  const [isAddingService, setIsAddingService] = useState(false);
  const [isAddingPackage, setIsAddingPackage] = useState(false);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [isAddingBooking, setIsAddingBooking] = useState(false);

  // Service form variables
  const [svcName, setSvcName] = useState('');
  const [svcDesc, setSvcDesc] = useState('');
  const [svcOrig, setSvcOrig] = useState('');
  const [svcOffer, setSvcOffer] = useState('');
  const [svcCat, setSvcCat] = useState<'makeup' | 'styling'>('makeup');
  const [editingSvcId, setEditingSvcId] = useState<string | null>(null);

  // Package form variables
  const [pkgName, setPkgName] = useState('');
  const [pkgDesc, setPkgDesc] = useState('');
  const [pkgOrig, setPkgOrig] = useState('');
  const [pkgOffer, setPkgOffer] = useState('');
  const [pkgBadge, setPkgBadge] = useState('');
  const [pkgIncludedSvcs, setPkgIncludedSvcs] = useState<string[]>([]);
  const [editingPkgId, setEditingPkgId] = useState<string | null>(null);

  // Contact form variables
  const [conName, setConName] = useState('');
  const [conPhone, setConPhone] = useState('');
  const [conEmail, setConEmail] = useState('');
  const [conLoc, setConLoc] = useState('');
  const [conTime, setConTime] = useState('');
  const [editingConId, setEditingConId] = useState<string | null>(null);

  // Manual Booking variables
  const [bCustName, setBCustName] = useState('');
  const [bCustMail, setBCustMail] = useState('');
  const [bCustPhone, setBCustPhone] = useState('');
  const [bDate, setBDate] = useState('');
  const [bTime, setBTime] = useState('');
  const [bSvcId, setBSvcId] = useState('');
  const [bPrice, setBPrice] = useState('');

  // Fetch Admin Stats
  const fetchStats = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error loading dashboard statistics:', err);
    }
  };

  useEffect(() => {
    if (isAdminLoggedIn && token) {
      fetchStats();
    }
  }, [isAdminLoggedIn, token, bookings, services, packages, messages, contacts]);

  // LOGIN HANDLER
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Invalid credentials or key code.');
      }

      const data = await res.json();
      onLoginSuccess(data.token);
      setEmail('');
      setPassword('');
      refreshAllData();
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  // BOOKING CRUD HANDLERS
  const handleUpdateBookingStatus = async (id: string, status: Booking['status'], payStatus: Booking['paymentStatus']) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, paymentStatus: payStatus })
      });
      if (res.ok) {
        refreshAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this booking permanent record?')) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        refreshAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bCustName || !bCustPhone || !bDate || !bTime || !bPrice) {
      alert('Please fill in Name, Phone, Appointment Date, Time slot, and total Fee.');
      return;
    }
    try {
      const payload = {
        customerName: bCustName,
        customerEmail: bCustMail || 'walkin@beaution.com',
        customerPhone: bCustPhone,
        serviceId: bSvcId || undefined,
        selectedDate: bDate,
        selectedTime: bTime,
        totalAmount: Number(bPrice),
        notes: 'Walk-in booking created from Admin Desk.'
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setBCustName('');
        setBCustMail('');
        setBCustPhone('');
        setBDate('');
        setBTime('');
        setBSvcId('');
        setBPrice('');
        setIsAddingBooking(false);
        refreshAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // SERVICES CRUD HANDLERS
  const handleCreateOrUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!svcName || !svcOrig || !svcOffer) {
      alert('Service Name, Original price, and Offer price are required.');
      return;
    }

    const payload = {
      name: svcName,
      description: svcDesc,
      originalPrice: Number(svcOrig),
      offerPrice: Number(svcOffer),
      category: svcCat,
      image: svcCat === 'makeup' 
        ? 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop'
        : 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=600&auto=format&fit=crop'
    };

    try {
      const url = editingSvcId ? `/api/services/${editingSvcId}` : '/api/services';
      const method = editingSvcId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSvcName('');
        setSvcDesc('');
        setSvcOrig('');
        setSvcOffer('');
        setEditingSvcId(null);
        setIsAddingService(false);
        refreshAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSvcClick = (svc: Service) => {
    setEditingSvcId(svc.id);
    setSvcName(svc.name);
    setSvcDesc(svc.description);
    setSvcOrig(svc.originalPrice.toString());
    setSvcOffer(svc.offerPrice.toString());
    setSvcCat(svc.category === 'makeup' ? 'makeup' : 'styling');
    setIsAddingService(true);
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm('Delete this makeup service listing?')) return;
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        refreshAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // PACKAGES CRUD HANDLERS
  const handleCreateOrUpdatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkgName || !pkgOrig || !pkgOffer) {
      alert('Package Name, Original Price, and Offer Price are required.');
      return;
    }

    const payload = {
      name: pkgName,
      description: pkgDesc,
      originalPrice: Number(pkgOrig),
      offerPrice: Number(pkgOffer),
      badge: pkgBadge || 'Premium Set',
      services: pkgIncludedSvcs.length > 0 ? pkgIncludedSvcs : ['Glow Makeup', 'Elegant Styling']
    };

    try {
      const url = editingPkgId ? `/api/packages/${editingPkgId}` : '/api/packages';
      const method = editingPkgId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setPkgName('');
        setPkgDesc('');
        setPkgOrig('');
        setPkgOffer('');
        setPkgBadge('');
        setPkgIncludedSvcs([]);
        setEditingPkgId(null);
        setIsAddingPackage(false);
        refreshAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditPkgClick = (pkg: OfferPackage) => {
    setEditingPkgId(pkg.id);
    setPkgName(pkg.name);
    setPkgDesc(pkg.description);
    setPkgOrig(pkg.originalPrice.toString());
    setPkgOffer(pkg.offerPrice.toString());
    setPkgBadge(pkg.badge);
    setPkgIncludedSvcs(pkg.services);
    setIsAddingPackage(true);
  };

  const handleDeletePackage = async (id: string) => {
    if (!window.confirm('Remove this offer package?')) return;
    try {
      const res = await fetch(`/api/packages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        refreshAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // CUSTOMER MESSAGES AND CONTACTS CRUDS
  const handleMarkMessageRead = async (id: string) => {
    try {
      const res = await fetch(`/api/messages/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        refreshAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm('Delete this customer enquiry message permanently?')) return;
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        refreshAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateOrUpdateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conName || !conPhone || !conEmail) {
      alert('Support Desk label, Phone, and Email are required.');
      return;
    }
    const payload = {
      name: conName,
      phone: conPhone,
      email: conEmail,
      location: conLoc,
      supportTiming: conTime || '9:00 AM - 8:00 PM',
      status: 'active'
    };

    try {
      const url = editingConId ? `/api/contacts/${editingConId}` : '/api/contacts';
      const method = editingConId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setConName('');
        setConPhone('');
        setConEmail('');
        setConLoc('');
        setConTime('');
        setEditingConId(null);
        setIsAddingContact(false);
        refreshAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditConClick = (con: SupportContact) => {
    setEditingConId(con.id);
    setConName(con.name);
    setConPhone(con.phone);
    setConEmail(con.email);
    setConLoc(con.location);
    setConTime(con.supportTiming);
    setIsAddingContact(true);
  };

  const handleDeleteContact = async (id: string) => {
    if (!window.confirm('Delete this dealer support contact?')) return;
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        refreshAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Recharts colors
  const PIE_COLORS = ['#ec4899', '#f59e0b'];

  if (!isAdminLoggedIn) {
    return (
      <section className="py-20 bg-rose-50/5 dark:bg-zinc-950 flex justify-center items-center px-4">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-2xl border border-rose-100/10 text-left space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-full bg-pink-100 dark:bg-zinc-800 flex items-center justify-center">
              <Lock className="h-6 w-6 text-pink-600 dark:text-amber-400" />
            </div>
            <h2 className="text-xl font-serif font-semibold text-zinc-900 dark:text-white">Beaution Console Secure Login</h2>
            <p className="text-xs text-zinc-400">Restricted to licensed Salon Partners and Support administrators.</p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-100/10 border border-red-500/20 text-red-500 text-xs rounded-xl flex items-center space-x-1.5">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Email Code Key</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-3.5 w-3.5 text-zinc-450" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="admin@beaution.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-rose-100/10 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-pink-500 text-zinc-900 dark:text-zinc-100 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Access Pin Pass value</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Key className="h-3.5 w-3.5 text-zinc-450" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-rose-100/10 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-pink-500 text-zinc-900 dark:text-zinc-100 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-2.5 rounded-full bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 font-bold text-xs uppercase text-white shadow-lg tracking-wider hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>{loginLoading ? 'Verifying access key...' : 'Access Dashboard'}</span>
            </button>
          </form>

          <p className="text-[9px] text-zinc-400 text-center leading-relaxed">
            Authorized access only. Logouts are automatically enforced past 15 minutes of idling state. IP rate limits apply.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Dashboard sub-header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-rose-100/10 shadow-sm text-left">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-pink-600">Administrative Portal</span>
            <h2 className="text-2xl font-serif font-semibold text-zinc-900 dark:text-white flex items-center space-x-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <span>Beaution Studio Workspace</span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refreshAllData}
              className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Sync Database"
            >
              <RefreshCw className="h-3.5 w-3.5 text-zinc-500" />
            </button>

            <button
              onClick={onLogout}
              className="py-2 px-4 rounded-full border border-red-500/20 text-red-500 hover:bg-red-500/10 text-xs font-bold uppercase tracking-wider flex items-center space-x-1 cursor-pointer transition-all"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Exit Admin</span>
            </button>
          </div>
        </div>

        {/* WORKSPACE SECTOR SUBTAB SELECTORS */}
        <div className="flex flex-wrap gap-2.5">
          {[
            { id: 'stats', label: 'Overview Analytics', icon: TrendingUp },
            { id: 'bookings', label: `Appointments (${bookings.length})`, icon: Calendar },
            { id: 'services', label: `Cosmetic Services (${services.length})`, icon: ShoppingBag },
            { id: 'packages', label: `Promo Offers (${packages.length})`, icon: ShoppingBag },
            { id: 'messages_contacts', label: 'Contacts & Messages', icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveAdminTab(tab.id as any)}
                className={`py-2 px-4 rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border transition-all cursor-pointer ${
                  activeAdminTab === tab.id
                    ? 'bg-zinc-950 dark:bg-zinc-100 border-zinc-950 dark:border-zinc-100 text-white dark:text-zinc-950 shadow-md scale-102'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-350 hover:bg-rose-50/25'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TABS 1: OVERVIEW ANALYTICS */}
        {activeAdminTab === 'stats' && stats && (
          <div className="space-y-8 animate-fade-in text-left">
            {/* Metric Score Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Revenue Earned', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-pink-600 dark:text-amber-450 bg-pink-100/20' },
                { label: 'Registered Appointments', value: stats.totalBookings, icon: Calendar, color: 'text-sky-500 bg-sky-100/20' },
                { label: 'Pending Bookings', value: stats.pendingBookings, icon: AlertCircle, color: 'text-amber-500 bg-amber-100/20' },
                { label: 'Active Promo Bundles', value: stats.activeOffers, icon: ShoppingBag, color: 'text-purple-500 bg-purple-100/20' },
              ].map((card, idx) => {
                const Icon = card.icon;
                return (
                  <div key={idx} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-rose-100/10 shadow-sm flex items-center space-x-4">
                    <div className={`p-3.5 rounded-2xl ${card.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">{card.label}</span>
                      <h3 className="text-2xl font-serif font-extrabold mt-0.5">{card.value}</h3>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Graphics Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Line Area Chart (8 Columns) */}
              <div className="lg:col-span-8 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-rose-100/10 shadow-sm">
                <h4 className="font-serif text-sm font-bold uppercase text-zinc-500 mb-6">Revenue Monthly Trajectory</h4>
                <div className="h-64 font-mono text-[10px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.monthlyRevenue || []}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="#a1a1aa" />
                      <YAxis stroke="#a1a1aa" />
                      <Tooltip formatter={(value) => [`₹${(value as number).toLocaleString('en-IN')}`, 'Monthly Sales']} />
                      <Area type="monotone" dataKey="amount" stroke="#ec4899" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart (4 Columns) */}
              <div className="lg:col-span-4 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-rose-100/10 shadow-sm flex flex-col justify-between">
                <h4 className="font-serif text-sm font-bold uppercase text-zinc-500 mb-4">Artistry Category Sales Ratio</h4>
                <div className="h-44 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.bookingCategoryRatio || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.bookingCategoryRatio.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex justify-center space-x-6 text-[10px] font-bold uppercase tracking-wider">
                  <div className="flex items-center space-x-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-pink-500" />
                    <span>Makeup ({stats.bookingCategoryRatio[0]?.value || 0})</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <span>Styling ({stats.bookingCategoryRatio[1]?.value || 0})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bookings Panel */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-rose-100/10 shadow-sm overflow-hidden space-y-4">
              <span className="font-serif text-sm font-bold uppercase text-zinc-500 block">Recent Appointment Submissions</span>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans divide-y divide-zinc-100 dark:divide-zinc-800">
                  <thead>
                    <tr className="text-zinc-400 py-3 uppercase tracking-wider font-extrabold text-[10px]">
                      <th className="pb-3">Client</th>
                      <th className="pb-3">Date/Time</th>
                      <th className="pb-3 text-right">Fee</th>
                      <th className="pb-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                    {stats.recentBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-rose-50/10 dark:hover:bg-zinc-800/15">
                        <td className="py-2.5">
                          <strong className="block text-zinc-900 dark:text-zinc-200">{b.customerName}</strong>
                          <span className="text-[10px] text-zinc-400 font-mono">{b.customerPhone}</span>
                        </td>
                        <td className="py-2.5">
                          <span className="block">{b.selectedDate}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">{b.selectedTime}</span>
                        </td>
                        <td className="py-2.5 text-right font-extrabold font-mono text-pink-600 dark:text-amber-450">
                          ₹{b.totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                            b.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TABS 2: APPOINTMENTS BOOKINGS (CRUD & UPDATE ACTIONS) */}
        {activeAdminTab === 'bookings' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-lg font-bold">Manage Active Bookings</h3>
              <button
                onClick={() => setIsAddingBooking(true)}
                className="py-1.5 px-4 rounded-full bg-pink-600 text-white font-bold text-xs uppercase flex items-center space-x-1.5 hover:bg-pink-700 transition"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add Custom Booking</span>
              </button>
            </div>

            {/* Dynamic manually write booking modal */}
            {isAddingBooking && (
              <form onSubmit={handleCreateManualBooking} className="bg-white dark:bg-zinc-900 border border-pink-500/30 rounded-3xl p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-3 pb-2 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-pink-600">Manual Walk-in Appointment Setup</span>
                  <button type="button" onClick={() => setIsAddingBooking(false)} className="text-xs text-red-500">Cancel</button>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400">Client Full name</label>
                  <input type="text" required value={bCustName} onChange={(e) => setBCustName(e.target.value)} placeholder="Aishwarya Dey" className="w-full bg-zinc-50 dark:bg-zinc-950 rounded-xl p-2 text-xs border border-rose-100/10" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400">Client Phone Number</label>
                  <input type="tel" required value={bCustPhone} onChange={(e) => setBCustPhone(e.target.value)} placeholder="9888877777" className="w-full bg-zinc-50 dark:bg-zinc-950 rounded-xl p-2 text-xs border border-rose-100/10" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400">Client Email (Optional)</label>
                  <input type="email" value={bCustMail} onChange={(e) => setBCustMail(e.target.value)} placeholder="aishwarya.d@gmail.com" className="w-full bg-zinc-50 dark:bg-zinc-950 rounded-xl p-2 text-xs border border-rose-100/10" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400">Date</label>
                  <input type="date" required value={bDate} onChange={(e) => setBDate(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 rounded-xl p-2 text-xs border border-rose-100/10" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400">Time slot</label>
                  <input type="text" required value={bTime} onChange={(e) => setBTime(e.target.value)} placeholder="11:30 AM" className="w-full bg-zinc-50 dark:bg-zinc-950 rounded-xl p-2 text-xs border border-rose-100/10" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400">Calculated Fee (INR)</label>
                  <input type="number" required value={bPrice} onChange={(e) => setBPrice(e.target.value)} placeholder="8500" className="w-full bg-zinc-50 dark:bg-zinc-950 rounded-xl p-2 text-xs border border-rose-100/10 font-mono" />
                </div>
                <div className="sm:col-span-3 pt-2 text-right">
                  <button type="submit" className="py-2 px-6 rounded-full bg-pink-600 text-white font-bold text-xs uppercase">Save Custom Booking</button>
                </div>
              </form>
            )}

            {/* Bookings inventory Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-rose-100/10 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-zinc-100 dark:divide-zinc-800">
                  <thead className="bg-zinc-50 dark:bg-zinc-950 select-none text-zinc-400 uppercase tracking-widest font-extrabold text-[10px]">
                    <tr>
                      <th className="p-4">Reference Key</th>
                      <th className="p-4">Customer Details</th>
                      <th className="p-4">Scheduled Info</th>
                      <th className="p-4 text-right">Amount</th>
                      <th className="p-4 text-center">Status Filters</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {bookings.map((b) => {
                      const associatedService = services.find(s => s.id === b.serviceId)?.name;
                      const associatedPackage = packages.find(p => p.id === b.packageId)?.name;

                      return (
                        <tr key={b.id} className="hover:bg-rose-50/5 dark:hover:bg-zinc-850/15">
                          <td className="p-4 font-mono font-bold text-zinc-400">
                            #{b.id}
                            <span className="block text-[8px] font-normal mt-0.5 text-zinc-550 truncate max-w-[100px]">{b.paymentId || 'No Payment Ref'}</span>
                          </td>
                          <td className="p-4">
                            <strong className="block text-zinc-900 dark:text-zinc-100">{b.customerName}</strong>
                            <div className="text-[10px] text-zinc-400 space-y-0.5">
                              <span className="block font-mono">{b.customerPhone}</span>
                              <span className="block font-sans">{b.customerEmail}</span>
                              <span className="block text-pink-500 font-bold">{associatedService ? `Service: ${associatedService}` : associatedPackage ? `Package: ${associatedPackage}` : 'Custom appointment'}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="block font-semibold">{b.selectedDate}</span>
                            <span className="text-[10px] text-zinc-400 font-mono block">{b.selectedTime}</span>
                          </td>
                          <td className="p-4 text-right font-extrabold font-mono text-zinc-900 dark:text-zinc-100">
                            ₹{b.totalAmount.toLocaleString('en-IN')}
                            <span className={`block text-[8px] uppercase font-extrabold text-center mt-1 py-0.5 rounded leading-none ${
                              b.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'
                            }`}>
                              {b.paymentStatus}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col items-center gap-1.5">
                              <select
                                value={b.status}
                                onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value as any, b.paymentStatus)}
                                className="p-1 px-2.5 rounded bg-zinc-50 dark:bg-zinc-950 border border-neutral-200 dark:border-neutral-800 text-[10px] uppercase font-bold focus:outline-none"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleDeleteBooking(b.id)}
                              className="p-2 border border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-full transition-colors inline-block cursor-pointer"
                              title="Delete permanently"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TABS 3: SERVICES INVENTORY MANAGER (CRUD) */}
        {activeAdminTab === 'services' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-lg font-bold">Catalog Services CRUD Manager</h3>
              <button
                onClick={() => { setEditingSvcId(null); setSvcName(''); setSvcDesc(''); setSvcOrig(''); setSvcOffer(''); setIsAddingService(true); }}
                className="py-1.5 px-4 rounded-full bg-pink-600 text-white font-bold text-xs uppercase flex items-center space-x-1.5 hover:bg-pink-700 transition"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Create New Service</span>
              </button>
            </div>

            {/* Service Form block */}
            {isAddingService && (
              <form onSubmit={handleCreateOrUpdateService} className="bg-white dark:bg-zinc-900 border border-pink-500/30 rounded-3xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 pb-2 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-pink-600">{editingSvcId ? 'Edit Beauty Service Details' : 'Introduce New Makeup Service'}</span>
                  <button type="button" onClick={() => setIsAddingService(false)} className="text-xs text-red-550">Cancel</button>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400">Service Label / Name</label>
                  <input type="text" required value={svcName} onChange={(e) => setSvcName(e.target.value)} placeholder="Bridal Airbrush Special" className="w-full bg-zinc-50 dark:bg-zinc-950 rounded-xl p-2 text-xs border border-rose-100/10 text-zinc-900 dark:text-zinc-100" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400">Service Category Choice</label>
                  <select value={svcCat} onChange={(e) => setSvcCat(e.target.value as any)} className="w-full bg-zinc-50 dark:bg-zinc-950 rounded-xl p-2.5 text-xs border border-rose-100/10">
                    <option value="makeup">Makeup Artistry</option>
                    <option value="styling">Hair & Styling</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400">Original starting Price (INR)</label>
                  <input type="number" required value={svcOrig} onChange={(e) => setSvcOrig(e.target.value)} placeholder="15000" className="w-full bg-zinc-50 dark:bg-zinc-950 rounded-xl p-2 text-xs border border-rose-100/10 font-mono" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400">Discounted Offer Price (INR)</label>
                  <input type="number" required value={svcOffer} onChange={(e) => setSvcOffer(e.target.value)} placeholder="11999" className="w-full bg-zinc-50 dark:bg-zinc-950 rounded-xl p-2 text-xs border border-rose-100/10 font-mono" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-zinc-400">Detailed Description and cosmetology notes</label>
                  <textarea rows={3} value={svcDesc} onChange={(e) => setSvcDesc(e.target.value)} placeholder="Ultra waterproof silicon-infused matte finish tailored with fine lashes..." className="w-full bg-zinc-50 dark:bg-zinc-950 rounded-xl p-2 text-xs border border-rose-100/10 resize-none text-zinc-900 dark:text-zinc-100" />
                </div>
                <div className="sm:col-span-2 text-right">
                  <button type="submit" className="py-2 px-6 rounded-full bg-pink-650 text-white font-bold text-xs uppercase">{editingSvcId ? 'Apply Update' : 'Publish Service'}</button>
                </div>
              </form>
            )}

            {/* List Services Active Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((svc) => (
                <div key={svc.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-4 flex gap-4 text-left shadow-sm">
                  <img src={svc.image} alt={svc.name} referrerPolicy="no-referrer" className="h-16 w-16 object-cover rounded-xl shrink-0" />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <strong className="text-zinc-900 dark:text-zinc-200 text-sm">{svc.name}</strong>
                        <span className="text-[9px] uppercase font-semibold text-pink-600">{svc.category}</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">{svc.description}</p>
                      <div className="mt-1 flex items-baseline space-x-1.5 font-mono">
                        <span className="text-zinc-400 line-through text-[10px]">₹{svc.originalPrice}</span>
                        <span className="text-xs font-extrabold text-pink-600 dark:text-amber-450">₹{svc.offerPrice}</span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => handleEditSvcClick(svc)}
                        className="p-1 px-2.5 rounded border border-zinc-200 dark:border-zinc-800 text-[9px] uppercase font-bold text-pink-600 flex items-center space-x-1 hover:bg-neutral-100 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteService(svc.id)}
                        className="p-1 px-2 text-[9px] border border-red-500/20 text-red-500 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TABS 4: PACKAGES & OFFERS MANAGER (CRUD) */}
        {activeAdminTab === 'packages' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-lg font-bold">Promo Packages CRUD Editor</h3>
              <button
                onClick={() => { setEditingPkgId(null); setPkgName(''); setPkgDesc(''); setPkgOrig(''); setPkgOffer(''); setPkgBadge(''); setPkgIncludedSvcs([]); setIsAddingPackage(true); }}
                className="py-1.5 px-4 rounded-full bg-pink-600 text-white font-bold text-xs uppercase flex items-center space-x-1.5 hover:bg-pink-700 transition"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Create Custom Package</span>
              </button>
            </div>

            {/* Package Form block */}
            {isAddingPackage && (
              <form onSubmit={handleCreateOrUpdatePackage} className="bg-white dark:bg-zinc-900 border border-pink-500/30 rounded-3xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 pb-2 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-pink-600">{editingPkgId ? 'Update Package Offering' : 'Setup New Sales Promo Bundle'}</span>
                  <button type="button" onClick={() => setIsAddingPackage(false)} className="text-xs text-red-600">Cancel</button>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400">Package Name</label>
                  <input type="text" required value={pkgName} onChange={(e) => setPkgName(e.target.value)} placeholder="Bridal Ultra Luxury Set" className="w-full bg-zinc-50 dark:bg-zinc-950 rounded-xl p-2 text-xs border border-rose-100/10 text-zinc-900 dark:text-zinc-100" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400">Marketing Tag Badge</label>
                  <input type="text" value={pkgBadge} onChange={(e) => setPkgBadge(e.target.value)} placeholder="Classic Glam / Sparkle Elite" className="w-full bg-zinc-50 dark:bg-zinc-950 rounded-xl p-2 text-xs border border-rose-100/10" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400">Bundle Original Price (INR)</label>
                  <input type="number" required value={pkgOrig} onChange={(e) => setPkgOrig(e.target.value)} placeholder="20000" className="w-full bg-zinc-50 dark:bg-zinc-950 rounded-xl p-2 text-xs border border-rose-100/10 font-mono" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400">Bundle Offer Price (INR)</label>
                  <input type="number" required value={pkgOffer} onChange={(e) => setPkgOffer(e.target.value)} placeholder="14999" className="w-full bg-zinc-50 dark:bg-zinc-950 rounded-xl p-2 text-xs border border-rose-100/10 font-mono" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[12px] font-bold text-pink-600 block mb-1">Included beauty items (Comma-Separated Array)</label>
                  <input type="text" value={pkgIncludedSvcs.join(', ')} onChange={(e) => setPkgIncludedSvcs(e.target.value.split(',').map(s => s.trim()))} placeholder="HD Bridal foundation, Premium eyelashes trail, Saree pleat pinning" className="w-full bg-zinc-50 dark:bg-zinc-950 rounded-xl p-2 text-xs border border-rose-100/10 text-zinc-900 dark:text-zinc-100" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-zinc-400 font-sans">Campaign marketing pitch description</label>
                  <textarea rows={3} value={pkgDesc} onChange={(e) => setPkgDesc(e.target.value)} placeholder="The absolute signature deluxe suite tailored for local brides..." className="w-full bg-zinc-50 dark:bg-zinc-950 rounded-xl p-2 text-xs border border-rose-100/10 resize-none text-zinc-950 dark:text-zinc-200" />
                </div>
                <div className="sm:col-span-2 text-right">
                  <button type="submit" className="py-2 px-6 rounded-full bg-pink-650 text-white font-bold text-xs uppercase">{editingPkgId ? 'Save Edits' : 'Publish Promo Pack'}</button>
                </div>
              </form>
            )}

            {/* List Promo Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {packages.map((pkg) => (
                <div key={pkg.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 text-left flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <strong className="text-zinc-900 dark:text-zinc-100 font-bold font-serif text-base">{pkg.name}</strong>
                      <span className="text-[9px] uppercase font-bold py-0.5 px-2.5 bg-amber-500/15 text-pink-600 rounded">
                        {pkg.badge}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">{pkg.description}</p>
                    <div className="mt-3 bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-rose-50/5">
                      <span className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">Services bundled:</span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {pkg.services.map((s, idx) => (
                          <span key={idx} className="text-[9px] py-0.5 px-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 flex items-baseline space-x-2 font-mono">
                      <span className="text-zinc-400 line-through text-xs">₹{pkg.originalPrice}</span>
                      <span className="text-sm font-extrabold text-pink-650 dark:text-amber-450">₹{pkg.offerPrice}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-850">
                    <button
                      onClick={() => handleEditPkgClick(pkg)}
                      className="p-1 px-3 text-[10px] uppercase font-bold hover:bg-neutral-50 dark:hover:bg-zinc-801 border border-zinc-250 dark:border-zinc-800 rounded flex items-center space-x-1 text-pink-600 cursor-pointer"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="p-1 px-3.5 text-[10px] uppercase font-bold border border-red-500/20 text-red-500 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TABS 5: CONTACTS & KEY CUSTOMER MESSAGES (CRUD + MESSAGES VIEW) */}
        {activeAdminTab === 'messages_contacts' && (
          <div className="space-y-8 animate-fade-in text-left">
            
            {/* Split Grid: Support Contacts on left (5), Customer Messages on right (7) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* SUPPORT DESKS (5 Columns) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800">
                  <h4 className="font-serif font-bold text-sm uppercase text-pink-650">Support desks</h4>
                  <button
                    onClick={() => { setEditingConId(null); setConName(''); setConPhone(''); setConEmail(''); setConLoc(''); setConTime(''); setIsAddingContact(true); }}
                    className="text-[10px] uppercase font-bold text-pink-600 hover:underline"
                  >
                    + Add Support
                  </button>
                </div>

                {/* Adding Contact Form */}
                {isAddingContact && (
                  <form onSubmit={handleCreateOrUpdateContact} className="bg-white dark:bg-zinc-900 border border-pink-500/30 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center pb-1">
                      <span className="text-[10px] font-bold uppercase text-pink-600">Enter Support coordinates</span>
                      <button type="button" onClick={() => setIsAddingContact(false)} className="text-[10px] text-red-500">Cancel</button>
                    </div>
                    <input type="text" required value={conName} onChange={(e) => setConName(e.target.value)} placeholder="Flagship Desk Bangalore" className="w-full bg-zinc-50 dark:bg-zinc-950 p-2 rounded text-xs border border-rose-100/10" />
                    <input type="tel" required value={conPhone} onChange={(e) => setConPhone(e.target.value)} placeholder="+91 9999988888" className="w-full bg-zinc-50 dark:bg-zinc-950 p-2 rounded text-xs border border-rose-100/10" />
                    <input type="email" required value={conEmail} onChange={(e) => setConEmail(e.target.value)} placeholder="contact@beaution.com" className="w-full bg-zinc-50 dark:bg-zinc-950 p-2 rounded text-xs border border-rose-100/10 font-mono" />
                    <input type="text" value={conLoc} onChange={(e) => setConLoc(e.target.value)} placeholder="102 Luxury Galleria, MG Road" className="w-full bg-zinc-50 dark:bg-zinc-950 p-2 rounded text-xs border border-rose-100/10" />
                    <input type="text" value={conTime} onChange={(e) => setConTime(e.target.value)} placeholder="9:00 AM - 8:00 PM" className="w-full bg-zinc-50 dark:bg-zinc-950 p-2 rounded text-xs border border-rose-100/10" />
                    <button type="submit" className="w-full py-1.5 bg-pink-650 text-white font-bold text-[10px] uppercase rounded-full">Save Support desk</button>
                  </form>
                )}

                {/* Contacts roster list */}
                <div className="space-y-3">
                  {contacts.map((c) => (
                    <div key={c.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-805 rounded-xl p-4 text-xs font-sans space-y-2 relative">
                      <div className="flex justify-between items-start">
                        <strong className="font-serif font-bold text-zinc-900 dark:text-zinc-100">{c.name}</strong>
                        <div className="flex space-x-1.5 pt-0.5">
                          <button onClick={() => handleEditConClick(c)} className="text-[10px] text-pink-600 hover:underline">Edit</button>
                          <span className="text-zinc-300">|</span>
                          <button onClick={() => handleDeleteContact(c.id)} className="text-[10px] text-red-500 hover:underline">Delete</button>
                        </div>
                      </div>
                      <div className="space-y-0.5 text-[11px] text-zinc-550 dark:text-zinc-400 font-mono">
                        <p>Tel: {c.phone}</p>
                        <p>Mail: {c.email}</p>
                        <p className="font-sans">Loc: {c.location}</p>
                        <p className="font-sans">Hours: {c.supportTiming}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* LIVE CUSTOMER INQUIRIES MESSAGES (7 Columns) */}
              <div className="lg:col-span-7 space-y-6">
                <span className="font-serif font-bold text-sm uppercase text-pink-650 pb-2 border-b border-zinc-100 dark:border-zinc-800 block text-left">
                  Customer Inquiry Logs ({messages.length})
                </span>

                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-6 bg-white dark:bg-zinc-900 rounded-2xl">No customer messages available.</p>
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        className={`p-5 rounded-2xl border text-left flex flex-col justify-between ${
                          m.status === 'unread'
                            ? 'bg-gradient-to-r from-pink-500/5 via-rose-500/5 to-amber-500/5 border-pink-100'
                            : 'bg-white border-zinc-200 dark:bg-zinc-904 dark:border-zinc-805'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <strong className="text-sm text-zinc-900 dark:text-zinc-100">{m.name}</strong>
                              <div className="text-[10px] text-zinc-400 space-y-0.5 mt-0.5 font-mono">
                                <span>Phone: {m.phone}</span>
                                <span className="mx-2">•</span>
                                <span>Email: {m.email}</span>
                              </div>
                            </div>

                            <div className="flex space-x-2">
                              {m.status === 'unread' && (
                                <button
                                  onClick={() => handleMarkMessageRead(m.id)}
                                  className="py-1 px-2.5 rounded bg-pink-600 text-white font-extrabold text-[9px] uppercase tracking-wider flex items-center space-x-1 hover:opacity-90 relative top-px cursor-pointer"
                                >
                                  <Check className="h-3 w-3" />
                                  <span>Mark Read</span>
                                </button>
                              )}

                              <button
                                onClick={() => handleDeleteMessage(m.id)}
                                className="p-1 px-1.5 border border-red-500/20 text-red-500 hover:bg-red-500/10 rounded tracking-wider cursor-pointer"
                                title="Delete spam"
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          <div className="p-3 bg-neutral-50 dark:bg-zinc-950 rounded-xl">
                            <p className="text-zinc-700 dark:text-zinc-300 text-xs sm:text-sm font-sans leading-relaxed whitespace-pre-line select-text">
                              "{m.message}"
                            </p>
                          </div>
                        </div>

                        <div className="text-right text-[9px] font-bold text-zinc-400 font-mono mt-3">
                          Received: {new Date(m.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}
