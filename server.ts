import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Initialize environment variables ASAP
dotenv.config();

import { createServer as createViteServer } from 'vite';
import { dbInstance } from './server/db';
import { Booking, Service, OfferPackage, SupportContact } from './src/types';

// Simple in-memory rate limiting map
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX = 60; // 60 requests per minute

const rateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
  const now = Date.now();
  const rateData = rateLimitMap.get(ip);

  if (!rateData || now > rateData.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    next();
  } else {
    rateData.count++;
    if (rateData.count > RATE_LIMIT_MAX) {
      res.status(429).json({ error: 'Too many requests. Please try again after 1 minute.' });
    } else {
      next();
    }
  }
};

const app = express();
const PORT = 3000;

// Body Parsers & Security Headers
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Apply rate limiter
app.use(rateLimiter);

// Custom helper: HTML XSS sanitizer
const sanitizeString = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Admin Pre-shared Credentials (hashed for security representation)
// Default config: admin@beaution.com / admin123
const ADMIN_EMAIL = 'admin@beaution.com';
const ADMIN_PASSWORD_HASH = crypto.createHash('sha256').update('admin123').digest('hex');

// Simple JWT-like tokens valid in memory
const activeTokens = new Set<string>();

const authenticateAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Access denied. Unauthorized request.' });
    return;
  }
  const token = authHeader.substring(7);
  if (!activeTokens.has(token)) {
    res.status(403).json({ error: 'Invalid or expired credentials.' });
    return;
  }
  next();
};

/**
 * AUTH ENDPOINTS
 */
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const cleanEmail = email.trim().toLowerCase();
  const inputHash = crypto.createHash('sha256').update(password).digest('hex');

  if (cleanEmail === ADMIN_EMAIL && inputHash === ADMIN_PASSWORD_HASH) {
    const token = crypto.randomBytes(32).toString('hex');
    activeTokens.add(token);
    res.json({ token, email: cleanEmail, role: 'admin' });
  } else {
    res.status(401).json({ error: 'Invalid salon email or code key.' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    activeTokens.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

/**
 * PUBLIC & ADMIN SERVICES API
 */
app.get('/api/services', (req, res) => {
  res.json(dbInstance.getServices());
});

app.post('/api/services', authenticateAdmin, (req, res) => {
  const { name, description, originalPrice, offerPrice, image, category } = req.body;

  if (!name || isNaN(originalPrice) || isNaN(offerPrice)) {
    res.status(400).json({ error: 'Valid service name, starting price and promo price are required.' });
    return;
  }

  const created = dbInstance.addService({
    name: sanitizeString(name),
    description: sanitizeString(description || ''),
    originalPrice: Number(originalPrice),
    offerPrice: Number(offerPrice),
    image: image || 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=600&auto=format&fit=crop',
    category: category || 'makeup',
    rating: 4.8
  });

  res.status(201).json(created);
});

app.put('/api/services/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const updated = dbInstance.updateService(id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Service not found.' });
  } else {
    res.json(updated);
  }
});

app.delete('/api/services/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const success = dbInstance.deleteService(id);
  if (!success) {
    res.status(404).json({ error: 'Service not found.' });
  } else {
    res.json({ success: true, message: 'Service removed successfully.' });
  }
});

/**
 * PUBLIC & ADMIN PACKAGES API
 */
app.get('/api/packages', (req, res) => {
  res.json(dbInstance.getPackages());
});

app.post('/api/packages', authenticateAdmin, (req, res) => {
  const { name, services, originalPrice, offerPrice, badge, description } = req.body;

  if (!name || isNaN(originalPrice) || isNaN(offerPrice)) {
    res.status(400).json({ error: 'Valid package components are required.' });
    return;
  }

  const created = dbInstance.addPackage({
    name: sanitizeString(name),
    services: Array.isArray(services) ? services.map(s => sanitizeString(s)) : [],
    originalPrice: Number(originalPrice),
    offerPrice: Number(offerPrice),
    badge: sanitizeString(badge || 'Promo Package'),
    description: sanitizeString(description || '')
  });

  res.status(201).json(created);
});

app.put('/api/packages/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const updated = dbInstance.updatePackage(id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Package not found' });
  } else {
    res.json(updated);
  }
});

app.delete('/api/packages/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const success = dbInstance.deletePackage(id);
  if (!success) {
    res.status(404).json({ error: 'Package not found.' });
  } else {
    res.json({ success: true, message: 'Package cleared.' });
  }
});

/**
 * PUBLIC & ADMIN CONTACTS API
 */
app.get('/api/contacts', (req, res) => {
  res.json(dbInstance.getContacts());
});

app.post('/api/contacts', authenticateAdmin, (req, res) => {
  const { name, phone, email, location, supportTiming, status } = req.body;
  if (!name || !phone || !email) {
    res.status(400).json({ error: 'Name, phone, and support email are strictly required.' });
    return;
  }
  const contact = dbInstance.addContact({
    name: sanitizeString(name),
    phone: sanitizeString(phone),
    email: sanitizeString(email),
    location: sanitizeString(location || ''),
    supportTiming: sanitizeString(supportTiming || '9:00 AM - 8:00 PM'),
    status: status || 'active'
  });
  res.status(201).json(contact);
});

app.put('/api/contacts/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const updated = dbInstance.updateContact(id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Contact person not found.' });
  } else {
    res.json(updated);
  }
});

app.delete('/api/contacts/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const success = dbInstance.deleteContact(id);
  if (!success) {
    res.status(404).json({ error: 'Contact detail not found.' });
  } else {
    res.json({ success: true, message: 'Support contact removed.' });
  }
});

/**
 * CUSTOMER MESSAGES (PUBLIC & ADMIN)
 */
app.post('/api/messages', (req, res) => {
  const { name, phone, email, message } = req.body;
  if (!name || !email || !message || !phone) {
    res.status(400).json({ error: 'Please enter your Name, Phone Number, Email, and Message.' });
    return;
  }

  // Simple regex check
  if (!email.includes('@')) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }

  const created = dbInstance.addMessage({
    name: sanitizeString(name),
    phone: sanitizeString(phone),
    email: sanitizeString(email),
    message: sanitizeString(message)
  });

  res.status(201).json({ success: true, message: 'Message recorded successfully.', data: created });
});

app.get('/api/messages', authenticateAdmin, (req, res) => {
  res.json(dbInstance.getMessages());
});

app.put('/api/messages/:id/read', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const success = dbInstance.markMessageRead(id);
  if (!success) {
    res.status(404).json({ error: 'Message not found.' });
  } else {
    res.json({ success: true });
  }
});

app.delete('/api/messages/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const success = dbInstance.deleteMessage(id);
  if (!success) {
    res.status(404).json({ error: 'Message not found.' });
  } else {
    res.json({ success: true, Message: 'Spam/Message deleted.' });
  }
});

/**
 * BOOKING & PAYMENT ENGINE API
 */
app.get('/api/bookings', (req, res) => {
  // Let's protect bookings list. In a production build, this would definitely require authentication.
  // We will configure it to allow admin reading if authorization header matches.
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }
  const token = authHeader.substring(7);
  if (!activeTokens.has(token)) {
    res.status(403).json({ error: 'Valid session required.' });
    return;
  }
  res.json(dbInstance.getBookings());
});

app.post('/api/bookings', (req, res) => {
  const { customerName, customerEmail, customerPhone, serviceId, packageId, selectedDate, selectedTime, totalAmount, notes } = req.body;

  if (!customerName || !customerEmail || !customerPhone || !selectedDate || !selectedTime || !totalAmount) {
    res.status(400).json({ error: 'Full name, email, phone, appointment date, timing, and fee are required.' });
    return;
  }

  const created = dbInstance.addBooking({
    customerName: sanitizeString(customerName),
    customerEmail: sanitizeString(customerEmail),
    customerPhone: sanitizeString(customerPhone),
    serviceId: serviceId ? sanitizeString(serviceId) : undefined,
    packageId: packageId ? sanitizeString(packageId) : undefined,
    selectedDate: sanitizeString(selectedDate),
    selectedTime: sanitizeString(selectedTime),
    totalAmount: Number(totalAmount),
    notes: sanitizeString(notes || ''),
    paymentStatus: 'pending',
    status: 'pending'
  });

  res.status(201).json(created);
});

// Update booking details (for Admin editing and updates)
app.put('/api/bookings/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { status, paymentStatus } = req.body;
  const updated = dbInstance.updateBookingStatus(id, status, paymentStatus);
  if (!updated) {
    res.status(404).json({ error: 'Booking not found.' });
  } else {
    res.json(updated);
  }
});

app.delete('/api/bookings/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const success = dbInstance.deleteBooking(id);
  if (!success) {
    res.status(404).json({ error: 'Booking not found.' });
  } else {
    res.json({ success: true, message: 'Booking removed successfully.' });
  }
});

// Simulated Secure Payment API Router
app.post('/api/payments', (req, res) => {
  const { bookingId, paymentMethod, cardDetails, upiId, netbankBank, walletName } = req.body;
  if (!bookingId || !paymentMethod) {
    res.status(400).json({ error: 'Booking ID and chosen payment route are required.' });
    return;
  }

  // Retrieve current bookings
  const bookings = dbInstance.getBookings();
  const index = bookings.findIndex(b => b.id === bookingId);
  if (index === -1) {
    res.status(404).json({ error: 'Booking session could not be tracked or has expired.' });
    return;
  }

  // Simulate ultra-secure validation checks
  // Input checks to prevent exploits
  if (paymentMethod === 'Card' && cardDetails) {
    const { number, expiry, cvc } = cardDetails;
    if (!number || number.replace(/\s/g, '').length < 15 || !expiry || !cvc) {
      res.status(400).json({ error: 'Invalid card info. Please double-check credentials.' });
      return;
    }
  } else if (paymentMethod === 'UPI' && (!upiId || !upiId.includes('@'))) {
    res.status(400).json({ error: 'Format error. A valid UPI address contains @ symbol.' });
    return;
  }

  // Generate verified trace transaction ID
  const paymentId = 'PAY' + crypto.randomBytes(6).toString('hex').toUpperCase();

  // Satisfy payment
  dbInstance.updateBookingStatus(bookingId, 'confirmed', 'paid');
  // Record trace
  const list = dbInstance.getBookings();
  const targetIdx = list.findIndex(b => b.id === bookingId);
  if (targetIdx !== -1) {
    list[targetIdx].paymentMethod = sanitizeString(paymentMethod);
    list[targetIdx].paymentId = paymentId;
    // Persist
    dbInstance.updateBookingStatus(bookingId, 'confirmed', 'paid');
    // Save details explicitly
    const finalBooking = list[targetIdx];
    res.json({
      success: true,
      message: 'Payment completed and secured successfully!',
      transactionId: paymentId,
      receipt: {
        receiptNumber: 'REC-' + Math.floor(Math.random() * 900000 + 100000),
        customerName: finalBooking.customerName,
        customerPhone: finalBooking.customerPhone,
        customerEmail: finalBooking.customerEmail,
        appointmentDate: finalBooking.selectedDate,
        appointmentTime: finalBooking.selectedTime,
        amountPaid: finalBooking.totalAmount,
        paymentStatus: 'paid',
        paymentMethod: finalBooking.paymentMethod,
        paymentId: paymentId,
        dateIssued: new Date().toISOString()
      }
    });
  } else {
    res.status(500).json({ error: 'Payment storage failed.' });
  }
});

/**
 * ADMIN DASHBOARD MATH ANALYTICS WITH SECURE AUTH
 */
app.get('/api/dashboard/stats', authenticateAdmin, (req, res) => {
  res.json(dbInstance.getStats());
});

/**
 * PHONE REGISTRATION & OTP MODULE
 * Supports multiple country validation and simulated SMS delivery logs
 */

interface PendingOtp {
  phoneNumber: string;
  otp: string;
  expiresAt: number;
}

interface SMSLog {
  id: string;
  recipient: string;
  country: string;
  body: string;
  timestamp: string;
}

// In-memory pending OTP registry
const pendingOtps = new Map<string, PendingOtp>();

// In-memory simulated SMS message delivery records
const smsLogs: SMSLog[] = [];

// Helper to generate a random 6-digit OTP code
function generateSecureOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP validation request
 */
app.post('/api/otp/send', (req, res) => {
  const { name, email, phone, countryCode, countryName, countryFlag } = req.body;

  if (!phone || !countryCode || !name || !email) {
    res.status(400).json({ error: 'Please enter your Name, Email, and Phone number.' });
    return;
  }

  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length < 5) {
    res.status(400).json({ error: 'Please enter a valid phone number.' });
    return;
  }

  const fullPhone = `${countryCode}${cleanPhone}`;
  const otpCode = generateSecureOtp();

  // Expire after 5 minutes
  pendingOtps.set(fullPhone, {
    phoneNumber: fullPhone,
    otp: otpCode,
    expiresAt: Date.now() + 5 * 60 * 1000
  });

  // Compose simulated branded SMS message
  const smsBody = `[BEAUTION GLOW] Hello ${sanitizeString(name)}! Your premium activation code is ${otpCode}. Valid for 5 minutes. Do not share.`;

  // Log in standard container console
  console.log(`\n======================================================`);
  console.log(`[SIMULATED SMS DISPATCH] To: ${fullPhone} (${countryFlag} ${countryName})`);
  console.log(`Message Content: "${smsBody}"`);
  console.log(`======================================================\n`);

  smsLogs.unshift({
    id: 'SMS_' + crypto.randomBytes(4).toString('hex').toUpperCase(),
    recipient: fullPhone,
    country: `${countryFlag} ${countryName}`,
    body: smsBody,
    timestamp: new Date().toISOString()
  });

  if (smsLogs.length > 50) {
    smsLogs.pop();
  }

  res.json({
    success: true,
    message: 'OTP dispatch initiated successfully to simulated carrier.',
    recipient: fullPhone,
    otpPreview: otpCode 
  });
});

/**
 * Verify OTP code and register customer profile on success
 */
app.post('/api/otp/verify', (req, res) => {
  const { name, email, phone, countryCode, countryName, countryFlag, otp } = req.body;

  if (!phone || !countryCode || !otp || !name || !email) {
    res.status(400).json({ error: 'Missing profile parameters or verification code.' });
    return;
  }

  const cleanPhone = phone.replace(/\D/g, '');
  const fullPhone = `${countryCode}${cleanPhone}`;

  const storedOtp = pendingOtps.get(fullPhone);

  if (!storedOtp) {
    res.status(400).json({ error: 'Active OTP verification session not found or expired.' });
    return;
  }

  if (Date.now() > storedOtp.expiresAt) {
    pendingOtps.delete(fullPhone);
    res.status(400).json({ error: 'Verification code expired. Please request a new OTP.' });
    return;
  }

  if (storedOtp.otp !== otp.trim()) {
    res.status(400).json({ error: 'Incorrect verification code. Please double check.' });
    return;
  }

  // Clear matched code
  pendingOtps.delete(fullPhone);

  // Persistence inside Database file JSON list
  const existingProfiles = dbInstance.getProfiles();
  const alreadyRegistered = existingProfiles.find(p => p.phone === cleanPhone && p.countryCode === countryCode);

  let profile;
  if (alreadyRegistered) {
    profile = alreadyRegistered;
  } else {
    profile = dbInstance.addProfile({
      name: sanitizeString(name),
      email: sanitizeString(email),
      phone: cleanPhone,
      countryCode: sanitizeString(countryCode),
      countryName: sanitizeString(countryName),
      countryFlag: sanitizeString(countryFlag),
      verified: true
    });
  }

  res.json({
    success: true,
    message: 'Profile authenticated and verified successfully.',
    profile
  });
});

/**
 * Fetch simulated incoming SMS Logs to build beautiful customer validation dashboard
 */
app.get('/api/sms/logs', (req, res) => {
  res.json(smsLogs);
});

/**
 * Fetch all registered customers inside admin terminal
 */
app.get('/api/profiles', authenticateAdmin, (req, res) => {
  res.json(dbInstance.getProfiles());
});

/**
 * Remove/delete a VIP Customer Profile
 */
app.delete('/api/profiles/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const deleted = dbInstance.deleteProfile(id);
  if (deleted) {
    res.json({ success: true, message: 'VIP Customer Profile deleted successfully.' });
  } else {
    res.status(404).json({ error: 'VIP Customer Profile not found.' });
  }
});

// Configure Vite and Asset Fallbacks
async function serveApp() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BEAUTION-SERVER] server running on: http://0.0.0.0:${PORT}`);
  });
}

serveApp().catch(err => {
  console.error('[BEAUTION-SERVER-CRASH] Failed to initialize backend server:', err);
});
