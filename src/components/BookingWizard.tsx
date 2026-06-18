import React, { useState } from 'react';
import { Service, OfferPackage, Booking } from '../types';
import { X, Calendar, Clock, User, Phone, Mail, FileText, CheckCircle, CreditCard, ShieldCheck, Printer, ArrowLeft, Loader2 } from 'lucide-react';

interface BookingWizardProps {
  services: Service[];
  packages: OfferPackage[];
  preselectedService?: Service | null;
  preselectedPackage?: OfferPackage | null;
  onClose: () => void;
  onBookingSuccess: () => void;
}

export default function BookingWizard({
  services,
  packages,
  preselectedService,
  preselectedPackage,
  onClose,
  onBookingSuccess,
}: BookingWizardProps) {
  // Step workflow management
  // 1: Customer Details & Scheduler
  // 2: Payment Portal Selection  
  // 3: Transaction success receipt
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Selected details
  const [selectedServiceId, setSelectedServiceId] = useState<string>(preselectedService?.id || '');
  const [selectedPackageId, setSelectedPackageId] = useState<string>(preselectedPackage?.id || '');
  const [bookingType, setBookingType] = useState<'service' | 'package'>(preselectedPackage ? 'package' : 'service');

  // Calendar scheduler
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [appointmentTime, setAppointmentTime] = useState<string>('');

  // Personal Info
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Netbanking' | 'Wallet'>('UPI');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvc, setCardCvc] = useState<string>('');
  const [upiId, setUpiId] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<string>('SBI');
  const [selectedWallet, setSelectedWallet] = useState<string>('GPay');

  // Async indicators
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Final Receipt Details from Backend
  const [receipt, setReceipt] = useState<any | null>(null);

  // Time Slot Options
  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'
  ];

  // Load saved local profile on mount
  React.useEffect(() => {
    const cached = localStorage.getItem('beaution_profile');
    if (cached) {
      try {
        const profile = JSON.parse(cached);
        if (profile.name) setFullName(profile.name);
        if (profile.email) setEmail(profile.email);
        if (profile.phone) setPhone(`+${profile.countryCode.replace(/\+/g, '')} ${profile.phone}`);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Calculate pricing total
  const getTotalAmount = (): number => {
    if (bookingType === 'service') {
      const s = services.find(x => x.id === selectedServiceId);
      return s ? s.offerPrice : 0;
    } else {
      const p = packages.find(x => x.id === selectedPackageId);
      return p ? p.offerPrice : 0;
    }
  };

  const getBookingLabel = (): string => {
    if (bookingType === 'service') {
      const s = services.find(x => x.id === selectedServiceId);
      return s ? s.name : 'Unknown Service';
    } else {
      const p = packages.find(x => x.id === selectedPackageId);
      return p ? p.name : 'Unknown Package';
    }
  };

  // Step 1 Submission: validates inputs
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (bookingType === 'service' && !selectedServiceId) {
      setErrorMessage('Please select a makeup service to book.');
      return;
    }
    if (bookingType === 'package' && !selectedPackageId) {
      setErrorMessage('Please select an offer package to book.');
      return;
    }
    if (!appointmentDate) {
      setErrorMessage('Please choose a date for your appointment.');
      return;
    }
    if (!appointmentTime) {
      setErrorMessage('Please choose a convenient time slot.');
      return;
    }
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 8) {
      setErrorMessage('Please enter a valid active phone number.');
      return;
    }

    setStep(2);
  };

  // Step 2 Submission: triggers simulated stripe/upi booking
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      // 1. Submit pending booking to backend
      const bookingData = {
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        serviceId: bookingType === 'service' ? selectedServiceId : undefined,
        packageId: bookingType === 'package' ? selectedPackageId : undefined,
        selectedDate: appointmentDate,
        selectedTime: appointmentTime,
        totalAmount: getTotalAmount(),
        notes: notes
      };

      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      if (!bookingRes.ok) {
        const err = await bookingRes.json();
        throw new Error(err.error || 'Failed to initialize booking session.');
      }

      const bookingObj = await bookingRes.json();

      // 2. Submit payment security verification
      const paymentPayload = {
        bookingId: bookingObj.id,
        paymentMethod: paymentMethod,
        cardDetails: paymentMethod === 'Card' ? {
          number: cardNumber,
          expiry: cardExpiry,
          cvc: cardCvc
        } : undefined,
        upiId: paymentMethod === 'UPI' ? upiId : undefined,
        netbankBank: paymentMethod === 'Netbanking' ? selectedBank : undefined,
        walletName: paymentMethod === 'Wallet' ? selectedWallet : undefined
      };

      const paymentRes = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentPayload)
      });

      if (!paymentRes.ok) {
        const err = await paymentRes.json();
        throw new Error(err.error || 'Payment gateway validation failed.');
      }

      const receiptObj = await paymentRes.json();
      setReceipt(receiptObj.receipt);
      setStep(3);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during payment. Please check info and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-2xl shadow-2xl border border-rose-100/10 transition-all text-zinc-900 dark:text-zinc-100 overflow-hidden">
        
        {/* Header Ribbon bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 animate-bounce" />
            <span className="text-sm font-serif font-semibold uppercase tracking-widest">
              {step === 3 ? 'Booking Confirmed' : 'Secure Booking Wizard'}
            </span>
          </div>
          {step !== 3 && (
            <button onClick={onClose} className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-all cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Wizard Main content wrapper */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-150/10 border border-red-500/20 text-red-500 text-xs rounded-xl text-left">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* STEP 1: Details and Time Selection */}
          {step === 1 && (
            <form onSubmit={handleProceedToPayment} className="space-y-5 text-left">
              {/* Service Selection Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-1.5">Appointment Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { setBookingType('service'); if (!selectedServiceId) setSelectedServiceId(services[0]?.id || ''); }}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                        bookingType === 'service'
                          ? 'bg-pink-600 text-white border-pink-650'
                          : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-300'
                      }`}
                    >
                      Single Service
                    </button>
                    <button
                      type="button"
                      onClick={() => { setBookingType('package'); if (!selectedPackageId) setSelectedPackageId(packages[0]?.id || ''); }}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                        bookingType === 'package'
                          ? 'bg-pink-600 text-white border-pink-650'
                          : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-300'
                      }`}
                    >
                      Bundled Package
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-1.5 flex justify-between">
                    <span>Select Component</span>
                    <span className="text-pink-600 font-extrabold">₹{getTotalAmount().toLocaleString('en-IN')}</span>
                  </label>
                  {bookingType === 'service' ? (
                    <select
                      value={selectedServiceId}
                      onChange={(e) => setSelectedServiceId(e.target.value)}
                      className="w-full bg-zinc-550/10 dark:bg-zinc-800 border border-rose-100/10 rounded-xl p-2 text-xs focus:outline-none focus:ring-2 focus:ring-pink-400"
                    >
                      {services.map((s) => (
                        <option key={s.id} value={s.id} className="dark:bg-zinc-950">
                          {s.name} - ₹{s.offerPrice.toLocaleString('en-IN')}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={selectedPackageId}
                      onChange={(e) => setSelectedPackageId(e.target.value)}
                      className="w-full bg-zinc-550/10 dark:bg-zinc-800 border border-rose-100/10 rounded-xl p-2 text-xs focus:outline-none focus:ring-2 focus:ring-pink-400"
                    >
                      {packages.map((p) => (
                        <option key={p.id} value={p.id} className="dark:bg-zinc-950">
                          {p.name} ({p.badge}) - ₹{p.offerPrice.toLocaleString('en-IN')}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Date & Time Slot Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-1.5">Choose Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-rose-100/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-1.5">Choose Time</label>
                  <select
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-rose-100/10 rounded-xl p-2 text-xs focus:outline-none focus:ring-2 focus:ring-pink-400"
                  >
                    <option value="">-- Select Time --</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Personal Details fields */}
              <div className="space-y-3.5 pt-2 border-t border-rose-100/10">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] uppercase font-bold text-pink-650 block">Customer Information</span>
                  {localStorage.getItem('beaution_profile') && (
                    <span className="inline-flex items-center space-x-1.5 py-0.5 px-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>👑 My Profile Auto-Filled</span>
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] uppercase font-bold tracking-wider text-zinc-400 block mb-1">Full Name</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <User className="h-3.5 w-3.5 text-zinc-400" />
                      </span>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Priyanka Sen"
                        className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-rose-100/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] uppercase font-bold tracking-wider text-zinc-400 block mb-1">Phone Number</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <Phone className="h-3.5 w-3.5 text-zinc-400" />
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-rose-100/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-400"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] uppercase font-bold tracking-wider text-zinc-400 block mb-1">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-3.5 w-3.5 text-zinc-400" />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. priyanka@gmail.com"
                      className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-rose-100/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] uppercase font-bold tracking-wider text-zinc-400 block mb-1">Special notes / Matching draping style or attire color</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-start pl-3 pt-2">
                      <FileText className="h-3.5 w-3.5 text-zinc-400" />
                    </span>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      placeholder="e.g. Prefer peach matte lipstick. Matching banarasi red pure silk saree."
                      className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-rose-100/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit to stage 2 */}
              <div className="pt-4 flex justify-between items-center">
                <span className="text-[10px] text-zinc-400">Your online data is fully encrypted under SSL.</span>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-full bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:opacity-90 active:scale-95 cursor-pointer transition-all"
                >
                  Proceed to Payment
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Secure Payment Gateway Selection & Hashing */}
          {step === 2 && (
            <form onSubmit={handlePaymentSubmit} className="space-y-6 text-left">
              <div className="flex items-center space-x-2 pb-2.5 border-b border-rose-100/10">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="p-1 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[10px] uppercase font-bold tracking-wider flex items-center space-x-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <ArrowLeft className="h-3 w-3" />
                  <span>Back</span>
                </button>
                <span className="text-[11px] text-zinc-500">Summary: <strong className="text-zinc-800 dark:text-zinc-200">{getBookingLabel()}</strong> at <strong>₹{getTotalAmount().toLocaleString('en-IN')}</strong></span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
                
                {/* Method Toggles */}
                <div className="sm:col-span-4 flex flex-col space-y-2.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-1">Gateways</span>
                  {[
                    { id: 'UPI', label: 'UPI (GPay / PhonePe)' },
                    { id: 'Card', label: 'Credit / Debit Card' },
                    { id: 'Netbanking', label: 'Net Banking' },
                    { id: 'Wallet', label: 'Wallets (Paytm)' },
                  ].map((pay) => (
                    <button
                      key={pay.id}
                      type="button"
                      onClick={() => setPaymentMethod(pay.id as any)}
                      className={`text-left p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        paymentMethod === pay.id
                          ? 'bg-gradient-to-r from-pink-500/10 to-amber-500/10 border-pink-500 text-pink-600 dark:text-amber-300'
                          : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-300'
                      }`}
                    >
                      {pay.label}
                    </button>
                  ))}
                </div>

                {/* Sub-form fields according to method choice */}
                <div className="sm:col-span-8 bg-zinc-50 dark:bg-zinc-950 p-5 rounded-2xl border border-rose-100/10 flex flex-col justify-between">
                  <div>
                    {paymentMethod === 'UPI' && (
                      <div className="space-y-4">
                        <span className="text-[10px] uppercase font-bold text-pink-500">Instant UPI Payment</span>
                        <p className="text-[11px] text-zinc-500 leading-relaxed">Enter your personal Virtual Payment Address (e.g., GPay, PhonePe, Bhim, or Paytm string). A notification request will trigger immediately on your app.</p>
                        <div>
                          <label className="text-[10px] font-bold text-zinc-400 block mb-1">UPI VPA ID ACCORDINGLY</label>
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="e.g. rachel@oksbi"
                            className="w-full p-2 bg-white dark:bg-zinc-900 border border-rose-100/10 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-pink-500"
                          />
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'Card' && (
                      <div className="space-y-4">
                        <span className="text-[10px] uppercase font-bold text-pink-500">Secure Credit / Debit Card Processing</span>
                        <div className="relative">
                          <CreditCard className="h-3.5 w-3.5 absolute right-3 top-3 text-zinc-400" />
                          <label className="text-[10px] font-bold text-zinc-400 block mb-1">16-Digit Card Number</label>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            maxLength={19}
                            placeholder="e.g. 4111 8291 0398 2910"
                            className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-rose-100/10 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-pink-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-zinc-400 block mb-1">Expiry (MM/YY)</label>
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="e.g. 11/29"
                              maxLength={5}
                              className="w-full p-2 bg-white dark:bg-zinc-900 border border-rose-100/10 rounded-xl text-xs text-center font-mono focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-zinc-400 block mb-1">Security CVC</label>
                            <input
                              type="password"
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value)}
                              maxLength={3}
                              placeholder="***"
                              className="w-full p-2 bg-white dark:bg-zinc-900 border border-rose-100/10 rounded-xl text-xs text-center font-mono focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'Netbanking' && (
                      <div className="space-y-4">
                        <span className="text-[10px] uppercase font-bold text-pink-500">Corporate Net Banking Gateway</span>
                        <div>
                          <label className="text-[10px] font-bold text-zinc-400 block mb-1">Select Bank</label>
                          <select
                            value={selectedBank}
                            onChange={(e) => setSelectedBank(e.target.value)}
                            className="w-full p-2 bg-white dark:bg-zinc-900 border border-rose-100/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-500"
                          >
                            <option value="SBI">State Bank of India (SBI)</option>
                            <option value="HDFC">HDFC Bank Ltd</option>
                            <option value="ICICI">ICICI Bank Corporation</option>
                            <option value="AXIS">Axis Bank Ltd</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'Wallet' && (
                      <div className="space-y-4">
                        <span className="text-[10px] uppercase font-bold text-pink-500">E-Wallet Direct Payment</span>
                        <div>
                          <label className="text-[10px] font-bold text-zinc-400 block mb-1">Select Wallet Provider</label>
                          <select
                            value={selectedWallet}
                            onChange={(e) => setSelectedWallet(e.target.value)}
                            className="w-full p-2 bg-white dark:bg-zinc-900 border border-rose-100/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-500"
                          >
                            <option value="GPay">Google Pay (GPay) Wallet</option>
                            <option value="Paytm">Paytm Balance / Postpaid</option>
                            <option value="PhonePe">PhonePe Wallet</option>
                            <option value="Amazon">Amazon Pay Wallet</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 pt-4 border-t border-zinc-250 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex flex-col text-left">
                      <span className="text-[9px] text-zinc-400 uppercase font-bold">Total Payable Fee</span>
                      <span className="text-base font-bold text-pink-650 dark:text-amber-450">₹{getTotalAmount().toLocaleString('en-IN')}</span>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="py-2.5 px-6 rounded-full bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-2 cursor-pointer shadow-lg hover:opacity-90 active:scale-95 transition-all"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Securing payment...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4" />
                          <span>Simulate Secure Pay</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            </form>
          )}

          {/* STEP 3: Booking Receipt / Confirmation summary */}
          {step === 3 && receipt && (
            <div className="space-y-6 text-left">
              <div className="text-center py-4 space-y-2">
                <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <CheckCircle className="h-7 w-7 text-emerald-500" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-zinc-900 dark:text-white">Appointment Confirmed Successfully!</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Payment processed and registered securely. A booking verification email has been sent to <strong className="text-zinc-700 dark:text-zinc-350">{receipt.customerEmail}</strong>.
                </p>
              </div>

              {/* Printable Receipt Template Card */}
              <div id="booking-receipt" className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-6 rounded-2xl shadow-inner space-y-4 font-sans text-xs">
                <div className="flex justify-between items-start border-b border-zinc-200 dark:border-zinc-800 pb-3">
                  <div>
                    <h4 className="font-serif font-bold text-sm text-pink-600">Beaution Makeup & Styling</h4>
                    <p className="text-[10px] text-zinc-400">102 Luxury Galleria, Bangalore</p>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold uppercase text-[10px] py-1 px-2.5 bg-emerald-500/15 text-emerald-600 rounded">PAID</span>
                    <p className="text-[10px] text-zinc-500 mt-1">{receipt.receiptNumber}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-zinc-400">Customer Name</span>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">{receipt.customerName}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-zinc-400">Registered Phone</span>
                    <p className="font-semibold font-mono text-zinc-800 dark:text-zinc-200">{receipt.customerPhone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-zinc-400">Scheduled Date</span>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">{new Date(receipt.appointmentDate).toDateString()}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-zinc-400">Scheduled Time</span>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">{receipt.appointmentTime}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-b border-zinc-200 dark:border-zinc-800 py-3">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-zinc-400">Service Category</span>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-300">{getBookingLabel()}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-zinc-400">Amount Settled</span>
                    <p className="font-extrabold text-pink-650 dark:text-amber-450 border-spacing-2">₹{receipt.amountPaid.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-zinc-400">
                  <span>Transaction ID: <strong className="font-mono">{receipt.paymentId}</strong></span>
                  <span>Method: <strong>{receipt.paymentMethod}</strong></span>
                </div>
              </div>

              {/* print download section */}
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="py-2 px-4 rounded-full border border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer transition-all"
                >
                  <Printer className="h-4 w-4" />
                  <span>Download / Print</span>
                </button>

                <button
                  type="button"
                  onClick={() => { onBookingSuccess(); onClose(); }}
                  className="py-2 px-5 rounded-full bg-pink-650 text-white hover:bg-pink-700 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Finish Session
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
