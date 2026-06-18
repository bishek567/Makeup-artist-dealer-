import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { Service, OfferPackage, Booking, SupportContact, CustomerMessage, DashboardStats, UserProfile } from '../src/types';

// Initialize environment variables
dotenv.config();

export let supabaseUrl = (process.env.SUPABASE_URL || 'https://nbkbwqvohpfvhmzqptfk.supabase.co').trim();
// Strip leading/trailing single or double quotes
supabaseUrl = supabaseUrl.replace(/^['"]|['"]$/g, '').trim();

let supabaseKey = (process.env.SUPABASE_ANON_KEY || 'sb_publishable_vIzLhYuTHU1myQBmKcLDbQ_mR9z_9QE').trim();
supabaseKey = supabaseKey.replace(/^['"]|['"]$/g, '').trim();

console.log('[Supabase Config] URL:', supabaseUrl);
// Strip trailing rest endpoint /rest/v1 if it exists to keep supabase Client happy
const formattedUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '').trim();

// Fallback to default if not a valid HTTP/HTTPS URL to avoid crashing the dev server
const finalUrl = formattedUrl.match(/^https?:\/\//i) ? formattedUrl : 'https://nbkbwqvohpfvhmzqptfk.supabase.co';

export const supabaseClient = createClient(finalUrl, supabaseKey);

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');


interface DatabaseSchema {
  services: Service[];
  packages: OfferPackage[];
  bookings: Booking[];
  contacts: SupportContact[];
  messages: CustomerMessage[];
  profiles: UserProfile[];
}

const INITIAL_SERVICES: Service[] = [
  {
    id: 's1',
    name: 'Bridal Makeup',
    description: 'Ultra-HD flawless bridal glow customized to your attire. Includes detailed skin prep, lash application, and custom contouring.',
    originalPrice: 15000,
    offerPrice: 11999,
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=600&auto=format&fit=crop',
    category: 'makeup',
    rating: 4.9
  },
  {
    id: 's2',
    name: 'Party Makeup',
    description: 'Chic, premium makeup for guests and cocktail events. Highlights your best features with elegant shading and high-durability finish.',
    originalPrice: 6000,
    offerPrice: 4499,
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop',
    category: 'makeup',
    rating: 4.7
  },
  {
    id: 's3',
    name: 'HD Makeup',
    description: 'High-definition silicon-infused makeup designed specifically to look flawless under raw studio flashlights and high-res video cameras.',
    originalPrice: 10000,
    offerPrice: 7999,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600&auto=format&fit=crop',
    category: 'makeup',
    rating: 4.8
  },
  {
    id: 's4',
    name: 'Airbrush Makeup',
    description: 'Sophisticated spray-mist makeup that gives a weightless, highly sanitary, and absolutely transfer-proof porcelain finish lasting up to 24 hours.',
    originalPrice: 12000,
    offerPrice: 9499,
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=600&auto=format&fit=crop',
    category: 'makeup',
    rating: 4.9
  },
  {
    id: 's5',
    name: 'Engagement Makeup',
    description: 'Elegant, dewy makeup that strikes the perfect balance between beautiful daytime grace and evening glamour. Includes soft-focus lash highlights.',
    originalPrice: 8000,
    offerPrice: 5999,
    image: 'https://images.unsplash.com/photo-1515688594390-b649af70d282?q=80&w=600&auto=format&fit=crop',
    category: 'makeup',
    rating: 4.8
  },
  {
    id: 's6',
    name: 'Hair Styling',
    description: 'Creative braids, romantic waves, elegant chignons, or modern updos carefully designed and set using luxury thermal protectants.',
    originalPrice: 3000,
    offerPrice: 1999,
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=600&auto=format&fit=crop',
    category: 'styling',
    rating: 4.6
  },
  {
    id: 's7',
    name: 'Saree Draping',
    description: 'Sturdy, perfectly pinned and pleated traditional styles (Kanjivaram, Bengali, Gujarati, Modern) customized for flawless aesthetic flow.',
    originalPrice: 2000,
    offerPrice: 1499,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
    category: 'styling',
    rating: 4.7
  }
];

const INITIAL_PACKAGES: OfferPackage[] = [
  {
    id: 'p1',
    name: 'Bronze Package',
    services: ['Party Makeup', 'Hair Styling', 'Saree Draping'],
    originalPrice: 11000,
    offerPrice: 6999,
    badge: 'Classic Glam',
    description: 'Best choice for premium wedding guests or traditional get-togethers. Includes full face makeup, hairstyling, and professional saree pleating.'
  },
  {
    id: 'p2',
    name: 'Silver Package',
    services: ['HD Makeup', 'Hair Styling', 'Saree Draping'],
    originalPrice: 15000,
    offerPrice: 9999,
    badge: 'Celebration Diva',
    description: 'Tailored for close family members and premium receptions. High-definition base ensures sweat-resistant finish that photographs beautifully.'
  },
  {
    id: 'p3',
    name: 'Gold Package',
    services: ['Airbrush Makeup', 'Hair Styling', 'Saree Draping'],
    originalPrice: 17000,
    offerPrice: 11999,
    badge: 'Flawless Airbrush',
    description: 'Our top-selling luxury set. Liquid airbrush mist guarantees the most lightweight, comfortable, and transfer-proof feel for grand banquets.'
  },
  {
    id: 'p4',
    name: 'Premium Package',
    services: ['Bridal Makeup', 'Hair Styling', 'Saree Draping'],
    originalPrice: 20000,
    offerPrice: 14999,
    badge: 'Royal Bride',
    description: 'The ultimate signature package for brides. Includes HD Bridal makeup, elegant custom crown hairstyling, premium saree draping, and pre-makeup deluxe hydration skin prep.'
  }
];

const INITIAL_CONTACTS: SupportContact[] = [
  {
    id: 'c1',
    name: 'Beaution Flagship Salon',
    phone: '+919876543210',
    email: 'support@beaution.com',
    location: '102 Luxury Galleria, MG Road, Bangalore - 560001',
    supportTiming: '9:00 AM - 8:00 PM (Daily)',
    status: 'active'
  },
  {
    id: 'c2',
    name: 'Bridal Emergency Hotline',
    phone: '+919999988888',
    email: 'bridaldesk@beaution.com',
    location: 'Mobiles / Travel Specialists Desk',
    supportTiming: '6:00 AM - 11:30 PM (Daily)',
    status: 'active'
  }
];

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    customerName: 'Aishwarya Sen',
    customerEmail: 'aishwarya@gmail.com',
    customerPhone: '9888877777',
    serviceId: 's1',
    selectedDate: '2026-06-25',
    selectedTime: '10:00 AM',
    totalAmount: 11999,
    paymentStatus: 'paid',
    paymentMethod: 'UPI',
    paymentId: 'TXN839210928391',
    notes: 'Please arrange premium lashes. Matching saree color is crimson red.',
    status: 'confirmed',
    createdAt: '2026-06-15T14:24:00Z'
  },
  {
    id: 'b2',
    customerName: 'Anjali Sharma',
    customerEmail: 'anjali.s@yahoo.com',
    customerPhone: '9777766666',
    packageId: 'p3',
    selectedDate: '2026-06-28',
    selectedTime: '02:00 PM',
    totalAmount: 11999,
    paymentStatus: 'paid',
    paymentMethod: 'Card',
    paymentId: 'TXN291039827013',
    notes: 'Reception. Prefer gold eye glitter.',
    status: 'pending',
    createdAt: '2026-06-17T09:12:00Z'
  }
];

const INITIAL_MESSAGES: CustomerMessage[] = [
  {
    id: 'm1',
    name: 'Pooja Hegde',
    phone: '9666655555',
    email: 'pooja.h@outlook.com',
    message: 'Hello Beaution! Do you provide travel-to-venue services for a group of 5 bridesmaids alongside bridal makeup? Let me know the group pricing.',
    createdAt: '2026-06-17T11:45:00Z',
    status: 'unread'
  }
];

export class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = {
      services: [],
      packages: [],
      bookings: [],
      contacts: [],
      messages: [],
      profiles: []
    };
    this.init();
    // Fire off async background synchronization from Supabase
    this.syncFromSupabase();
  }

  private init() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        // Ensure all collections are lists
        this.data.services = this.data.services || INITIAL_SERVICES;
        this.data.packages = this.data.packages || INITIAL_PACKAGES;
        this.data.bookings = this.data.bookings || INITIAL_BOOKINGS;
        this.data.contacts = this.data.contacts || INITIAL_CONTACTS;
        this.data.messages = this.data.messages || INITIAL_MESSAGES;
        this.data.profiles = this.data.profiles || [];
      } else {
        this.data = {
          services: INITIAL_SERVICES,
          packages: INITIAL_PACKAGES,
          bookings: INITIAL_BOOKINGS,
          contacts: INITIAL_CONTACTS,
          messages: INITIAL_MESSAGES,
          profiles: []
        };
        this.save();
      }
    } catch {
      // Fallback
      this.data = {
        services: INITIAL_SERVICES,
        packages: INITIAL_PACKAGES,
        bookings: INITIAL_BOOKINGS,
        contacts: INITIAL_CONTACTS,
        messages: INITIAL_MESSAGES,
        profiles: []
      };
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write to local DB file:', e);
    }
  }

  // --- Supabase Persistence Methods ---
  async saveToSupabase(table: string, record: any, id: string) {
    try {
      console.log(`[Supabase Sync] Upserting record to '${table}' with ID: ${id}`);
      // Remove any temporary properties if they are undefined to keep query clean
      const payload = { ...record };
      const { error } = await supabaseClient.from(table).upsert(payload);
      if (error) {
        console.warn(`[Supabase Sync Warning] Could not sync to table '${table}':`, error.message, error.details || '');
      } else {
        console.log(`[Supabase Sync Success] Synergized '${table}' ID: ${id}`);
      }
    } catch (err: any) {
      console.error(`[Supabase Sync Connection Error] on table '${table}':`, err.message || err);
    }
  }

  async deleteFromSupabase(table: string, id: string) {
    try {
      console.log(`[Supabase Sync] Deleting record from '${table}' with ID: ${id}`);
      const { error } = await supabaseClient.from(table).delete().eq('id', id);
      if (error) {
        console.warn(`[Supabase Sync Warning] Could not remote-delete from table '${table}':`, error.message);
      } else {
        console.log(`[Supabase Sync Success] Remote deleted from '${table}' ID: ${id}`);
      }
    } catch (err: any) {
      console.error(`[Supabase Sync Connection Error] on deleting '${table}':`, err.message || err);
    }
  }

  async syncFromSupabase() {
    console.log('[Supabase Sync Start] Downloading existing tables...');
    const tables = ['services', 'packages', 'bookings', 'contacts', 'messages', 'profiles'];
    let syncCount = 0;

    for (const table of tables) {
      try {
        const { data, error } = await supabaseClient.from(table).select('*');
        if (error) {
          console.warn(`[Supabase Sync Info] Table '${table}' could not be queried (it may not exist yet):`, error.message);
          continue;
        }

        if (data && data.length > 0) {
          console.log(`[Supabase Sync] Fetched ${data.length} records for '${table}' from Supabase.`);
          
          // Custom parsing for compatibility
          const parsedData = data.map(item => {
            if (table === 'packages' && typeof item.services === 'string') {
              try {
                item.services = JSON.parse(item.services);
              } catch {
                item.services = [item.services];
              }
            }
            return item;
          });

          (this.data as any)[table] = parsedData;
          syncCount++;
        } else {
          // Supabase table is empty: let's seed our high quality initial data up to their cloud!
          console.log(`[Supabase Seed] Supabase table '${table}' is empty. Seeding local initial data...`);
          const localItems = (this.data as any)[table] || [];
          if (localItems.length > 0) {
            for (const item of localItems) {
              await this.saveToSupabase(table, item, item.id);
            }
          }
        }
      } catch (err: any) {
        console.error(`[Supabase Sync Error] Table sync failed for '${table}':`, err.message || err);
      }
    }

    if (syncCount > 0) {
      console.log(`[Supabase Sync Completed] Local database cached with ${syncCount} active cloud tables.`);
      this.save();
    }
  }


  // --- Services CRUD ---
  getServices(): Service[] {
    return this.data.services;
  }

  addService(service: Omit<Service, 'id'>): Service {
    const newService: Service = {
      ...service,
      id: 's_' + Date.now().toString(36)
    };
    this.data.services.push(newService);
    this.save();
    this.saveToSupabase('services', newService, newService.id);
    return newService;
  }

  updateService(id: string, updated: Partial<Service>): Service | null {
    const idx = this.data.services.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.data.services[idx] = { ...this.data.services[idx], ...updated };
    this.save();
    this.saveToSupabase('services', this.data.services[idx], id);
    return this.data.services[idx];
  }

  deleteService(id: string): boolean {
    const lengthBefore = this.data.services.length;
    this.data.services = this.data.services.filter(s => s.id !== id);
    if (this.data.services.length < lengthBefore) {
      this.save();
      this.deleteFromSupabase('services', id);
      return true;
    }
    return false;
  }

  // --- Packages CRUD ---
  getPackages(): OfferPackage[] {
    return this.data.packages;
  }

  addPackage(pkg: Omit<OfferPackage, 'id'>): OfferPackage {
    const newPkg: OfferPackage = {
      ...pkg,
      id: 'p_' + Date.now().toString(36)
    };
    this.data.packages.push(newPkg);
    this.save();
    this.saveToSupabase('packages', newPkg, newPkg.id);
    return newPkg;
  }

  updatePackage(id: string, updated: Partial<OfferPackage>): OfferPackage | null {
    const idx = this.data.packages.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.packages[idx] = { ...this.data.packages[idx], ...updated };
    this.save();
    this.saveToSupabase('packages', this.data.packages[idx], id);
    return this.data.packages[idx];
  }

  deletePackage(id: string): boolean {
    const lengthBefore = this.data.packages.length;
    this.data.packages = this.data.packages.filter(p => p.id !== id);
    if (this.data.packages.length < lengthBefore) {
      this.save();
      this.deleteFromSupabase('packages', id);
      return true;
    }
    return false;
  }

  // --- Bookings CRUD ---
  getBookings(): Booking[] {
    return this.data.bookings;
  }

  addBooking(booking: Omit<Booking, 'id' | 'createdAt'>): Booking {
    const newBooking: Booking = {
      ...booking,
      id: 'B' + Math.floor(100000 + Math.random() * 900000).toString(),
      createdAt: new Date().toISOString()
    };
    this.data.bookings.push(newBooking);
    this.save();
    this.saveToSupabase('bookings', newBooking, newBooking.id);
    return newBooking;
  }

  updateBookingStatus(id: string, status: Booking['status'], paymentStatus?: Booking['paymentStatus']): Booking | null {
    const idx = this.data.bookings.findIndex(b => b.id === id);
    if (idx === -1) return null;
    this.data.bookings[idx].status = status;
    if (paymentStatus) {
      this.data.bookings[idx].paymentStatus = paymentStatus;
    }
    this.save();
    this.saveToSupabase('bookings', this.data.bookings[idx], id);
    return this.data.bookings[idx];
  }

  deleteBooking(id: string): boolean {
    const lengthBefore = this.data.bookings.length;
    this.data.bookings = this.data.bookings.filter(b => b.id !== id);
    if (this.data.bookings.length < lengthBefore) {
      this.save();
      this.deleteFromSupabase('bookings', id);
      return true;
    }
    return false;
  }

  // --- Support Contacts CRUD ---
  getContacts(): SupportContact[] {
    return this.data.contacts;
  }

  addContact(contact: Omit<SupportContact, 'id'>): SupportContact {
    const newContact: SupportContact = {
      ...contact,
      id: 'c_' + Date.now().toString(36)
    };
    this.data.contacts.push(newContact);
    this.save();
    this.saveToSupabase('contacts', newContact, newContact.id);
    return newContact;
  }

  updateContact(id: string, updated: Partial<SupportContact>): SupportContact | null {
    const idx = this.data.contacts.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.contacts[idx] = { ...this.data.contacts[idx], ...updated };
    this.save();
    this.saveToSupabase('contacts', this.data.contacts[idx], id);
    return this.data.contacts[idx];
  }

  deleteContact(id: string): boolean {
    const lengthBefore = this.data.contacts.length;
    this.data.contacts = this.data.contacts.filter(c => c.id !== id);
    if (this.data.contacts.length < lengthBefore) {
      this.save();
      this.deleteFromSupabase('contacts', id);
      return true;
    }
    return false;
  }

  // --- Messages CRUD ---
  getMessages(): CustomerMessage[] {
    return this.data.messages;
  }

  addMessage(msg: Omit<CustomerMessage, 'id' | 'createdAt' | 'status'>): CustomerMessage {
    const newMessage: CustomerMessage = {
      ...msg,
      id: 'm_' + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      status: 'unread'
    };
    this.data.messages.push(newMessage);
    this.save();
    this.saveToSupabase('messages', newMessage, newMessage.id);
    return newMessage;
  }

  markMessageRead(id: string): boolean {
    const idx = this.data.messages.findIndex(m => m.id === id);
    if (idx === -1) return false;
    this.data.messages[idx].status = 'read';
    this.save();
    this.saveToSupabase('messages', this.data.messages[idx], id);
    return true;
  }

  deleteMessage(id: string): boolean {
    const lengthBefore = this.data.messages.length;
    this.data.messages = this.data.messages.filter(m => m.id !== id);
    if (this.data.messages.length < lengthBefore) {
      this.save();
      this.deleteFromSupabase('messages', id);
      return true;
    }
    return false;
  }

  // --- Profiles CRUD ---
  getProfiles(): UserProfile[] {
    return this.data.profiles || [];
  }

  addProfile(profile: Omit<UserProfile, 'id' | 'createdAt'>): UserProfile {
    const newProfile: UserProfile = {
      ...profile,
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString()
    };
    if (!this.data.profiles) {
      this.data.profiles = [];
    }
    this.data.profiles.push(newProfile);
    this.save();
    this.saveToSupabase('profiles', newProfile, newProfile.id);
    return newProfile;
  }

  deleteProfile(id: string): boolean {
    if (!this.data.profiles) return false;
    const initialLen = this.data.profiles.length;
    this.data.profiles = this.data.profiles.filter(p => p.id !== id);
    if (this.data.profiles.length < initialLen) {
      this.save();
      this.deleteFromSupabase('profiles', id);
      return true;
    }
    return false;
  }

  // --- Analytics & Statistics ---
  getStats(): DashboardStats {
    const confirmed = this.data.bookings.filter(b => b.status === 'confirmed');
    const totalRevenue = this.data.bookings
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + b.totalAmount, 0);

    const pending = this.data.bookings.filter(b => b.status === 'pending').length;

    // Build monthly sales
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = new Date().getMonth();
    
    // Distribute stats realistically across preceding 6 months
    const monthlyRevenue = Array.from({ length: 6 }).map((_, i) => {
      const idx = (currentMonthIdx - 5 + i + 12) % 12;
      const monthLabel = months[idx];
      // Generate some stable trend + real booking contribution
      let amount = 25000 + idx * 5200;
      // Add bookings from database matching this month
      this.data.bookings.forEach(b => {
        const bDate = new Date(b.createdAt);
        if (bDate.getMonth() === idx && b.paymentStatus === 'paid') {
          amount += b.totalAmount;
        }
      });
      return { month: monthLabel, amount };
    });

    // Breakdown category ratios
    let makeupCount = 0;
    let stylingCount = 0;
    this.data.bookings.forEach(b => {
      if (b.serviceId) {
        const s = this.data.services.find(x => x.id === b.serviceId);
        if (s?.category === 'styling') stylingCount++;
        else makeupCount++;
      } else {
        makeupCount++; // packages are makeup major
      }
    });

    const bookingCategoryRatio = [
      { name: 'Makeup Artistry', value: makeupCount || 5 },
      { name: 'Hair & Styling', value: stylingCount || 2 }
    ];

    return {
      totalRevenue,
      totalBookings: this.data.bookings.length,
      activeOffers: this.data.packages.length + this.data.services.filter(s => s.offerPrice < s.originalPrice).length,
      pendingBookings: pending,
      monthlyRevenue,
      bookingCategoryRatio,
      recentBookings: [...this.data.bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5)
    };
  }
}

export const dbInstance = new Database();
