export interface Service {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  offerPrice: number;
  image: string;
  category: 'makeup' | 'styling' | 'add-on';
  rating?: number;
}

export interface OfferPackage {
  id: string;
  name: string;
  services: string[];
  originalPrice: number;
  offerPrice: number;
  badge: string;
  description: string;
  expiryDate?: string; // Auto countdown target
}

export interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId?: string; // if single service booked
  packageId?: string; // if package booked
  selectedDate: string;
  selectedTime: string;
  totalAmount: number;
  paymentStatus: 'paid' | 'pending' | 'failed';
  paymentMethod?: string;
  paymentId?: string;
  notes?: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  createdAt: string;
}

export interface SupportContact {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  supportTiming: string;
  status: 'active' | 'inactive';
}

export interface CustomerMessage {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  createdAt: string;
  status: 'read' | 'unread';
}

export interface DashboardStats {
  totalRevenue: number;
  totalBookings: number;
  activeOffers: number;
  pendingBookings: number;
  monthlyRevenue: { month: string; amount: number }[];
  bookingCategoryRatio: { name: string; value: number }[];
  recentBookings: Booking[];
}
