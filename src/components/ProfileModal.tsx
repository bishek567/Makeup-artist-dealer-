import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Smartphone, Mail, User, CheckCircle2, Timer, Globe, X, Lock, RefreshCw, Eye } from 'lucide-react';

interface ProfileModalProps {
  onClose: () => void;
  onVerificationSuccess: (profile: any) => void;
  notice?: string | null;
}

interface Country {
  name: string;
  code: string;
  flag: string;
  phoneLength: number;
  placeholder: string;
}

const COUNTRIES: Country[] = [
  { name: 'India', code: '+91', flag: '🇮🇳', phoneLength: 10, placeholder: '98765 43210' },
  { name: 'United States', code: '+1', flag: '🇺🇸', phoneLength: 10, placeholder: '201 555 0123' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧', phoneLength: 10, placeholder: '7911 123456' },
  { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪', phoneLength: 9, placeholder: '50 123 4567' },
  { name: 'Singapore', code: '+65', flag: '🇸🇬', phoneLength: 8, placeholder: '8123 4567' },
  { name: 'Australia', code: '+61', flag: '🇦🇺', phoneLength: 9, placeholder: '412 345 678' },
  { name: 'Canada', code: '+1', flag: '🇨🇦', phoneLength: 10, placeholder: '416 555 0199' },
  { name: 'Germany', code: '+49', flag: '🇩🇪', phoneLength: 11, placeholder: '151 2345 6789' },
  { name: 'France', code: '+33', flag: '🇫🇷', phoneLength: 9, placeholder: '6 12 34 56 78' },
  { name: 'Nepal', code: '+977', flag: '🇳🇵', phoneLength: 10, placeholder: '985 1012345' },
  { name: 'Bangladesh', code: '+880', flag: '🇧🇩', phoneLength: 10, placeholder: '1712 345678' },
  { name: 'Sri Lanka', code: '+94', flag: '🇱🇰', phoneLength: 9, placeholder: '77 123 4567' }
];

export default function ProfileModal({ onClose, onVerificationSuccess, notice }: ProfileModalProps) {
  // Saved profile cache state
  const [savedProfile, setSavedProfile] = useState<any>(null);

  // Form input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [otp, setOtp] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // Process / API states
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [otpPreview, setOtpPreview] = useState<string | null>(null);

  // Timer states
  const [secondsRemaining, setSecondsRemaining] = useState(300); // 5 minutes

  // SMS Simulator State
  const [smsLogs, setSmsLogs] = useState<any[]>([]);
  const [smsLoading, setSmsLoading] = useState(false);

  // Load saved local session on mount
  useEffect(() => {
    const cached = localStorage.getItem('beaution_profile');
    if (cached) {
      try {
        setSavedProfile(JSON.parse(cached));
      } catch (e) {
        // ignore
      }
    }
    fetchsmsLogs();
  }, []);

  // Sync OTP timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpSent && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, secondsRemaining]);

  // Fetch real-time simulated SMS delivery logs
  const fetchsmsLogs = async () => {
    setSmsLoading(true);
    try {
      const res = await fetch('/api/sms/logs');
      if (res.ok) {
        const list = await res.json();
        setSmsLogs(list);
      }
    } catch (e) {
      // safe ignore
    } finally {
      setSmsLoading(false);
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorStatus('Please enter your gorgeous Name first.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorStatus('Please enter a valid luxury email contact.');
      return;
    }
    const numbersOnly = phone.replace(/\D/g, '');
    if (numbersOnly.length < 5) {
      setErrorStatus('Please enter a valid phone number for your country.');
      return;
    }

    setIsLoading(true);
    setErrorStatus(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: numbersOnly,
          countryCode: selectedCountry.code,
          countryName: selectedCountry.name,
          countryFlag: selectedCountry.flag
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorStatus(data.error || 'Failed to dispatch verification code.');
      } else {
        setOtpSent(true);
        setSecondsRemaining(300);
        setSuccessMsg(`A secure verification code was successfully sent to your phone number: ${selectedCountry.code} ${numbersOnly}!`);
        if (data.otpPreview) {
          setOtpPreview(data.otpPreview);
        }
        // Immediately fetch logs to show simulated SMS in sandbox drawer
        setTimeout(fetchsmsLogs, 500);
      }
    } catch (err) {
      setErrorStatus('Network connection error. Server could not be reached.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setErrorStatus('Please complete the 6-digit OTP code before proceeding.');
      return;
    }

    setIsLoading(true);
    setErrorStatus(null);
    setSuccessMsg(null);

    const numbersOnly = phone.replace(/\D/g, '');

    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: numbersOnly,
          countryCode: selectedCountry.code,
          countryName: selectedCountry.name,
          countryFlag: selectedCountry.flag,
          otp: otp.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorStatus(data.error || 'Incorrect OTP or expired session.');
      } else {
        localStorage.setItem('beaution_profile', JSON.stringify(data.profile));
        setSavedProfile(data.profile);
        setSuccessMsg('Perfect! Your customer profile is verified and active.');
        onVerificationSuccess(data.profile);
      }
    } catch (err) {
      setErrorStatus('Verification call failed due to carrier communication latency.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('beaution_profile');
    setSavedProfile(null);
    setName('');
    setEmail('');
    setPhone('');
    setOtp('');
    setOtpSent(false);
    setErrorStatus(null);
    setSuccessMsg(null);
    setOtpPreview(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" id="profile-modal-root">
      {/* Background Dim Backdrop with Spring Entrance */}
      <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm cursor-pointer" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25 }}
          className="relative w-full max-w-4xl rounded-2xl bg-white dark:bg-zinc-900 border border-amber-500/10 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 text-left"
        >
          {/* Main Form Left Segment (Col-7) */}
          <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
            
            {/* Header Title bar */}
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="p-1 rounded-lg bg-pink-500/10 text-pink-600 dark:text-amber-400">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <span className="font-serif text-lg font-bold tracking-wide text-zinc-900 dark:text-zinc-100">
                    Beaution Club ID
                  </span>
                </div>
                <p className="text-zinc-500 text-xs font-sans">
                  Register your luxury status for priority makeup schedules, member gifts, and direct support.
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Custom Action Trigger Notice (e.g. required for booking offers) */}
            {notice && !savedProfile && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-400 text-xs rounded-xl font-sans flex items-start space-x-3 leading-relaxed shadow-sm">
                <span className="text-base leading-none mt-0.5 select-none shrink-0" role="img" aria-label="lock">🔒</span>
                <div className="space-y-1">
                  <span className="font-bold text-zinc-900 dark:text-amber-300 block">Complete Registration first</span>
                  <p className="text-zinc-650 dark:text-zinc-400">{notice}</p>
                </div>
              </div>
            )}

            {/* Error & Success Toasts */}
            {errorStatus && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-xl font-medium flex items-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                <span>{errorStatus}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl font-medium space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-bold">Success!</span>
                </div>
                <p>{successMsg}</p>
              </div>
            )}

            <AnimatePresence mode="wait">
              {savedProfile ? (
                /* VIEW 1: ACTIVE LEVEL MEMBERSHIP DECK */
                <motion.div
                  key="saved-profile-view"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-50/50 to-amber-50/30 dark:from-zinc-800/30 dark:to-zinc-800/10 border border-pink-100/50 dark:border-zinc-800 space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-r from-pink-400 to-amber-400 flex items-center justify-center text-white font-serif text-xl font-bold shadow-md">
                        {savedProfile.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-serif text-base font-bold text-zinc-900 dark:text-zinc-100">{savedProfile.name}</h3>
                          <span className="inline-flex items-center space-x-1 py-0.5 px-2 rounded-full bg-amber-400/10 text-amber-600 dark:text-amber-400 text-[9px] font-bold uppercase tracking-wider">
                            👑 Club Member
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 tracking-wider flex items-center space-x-2">
                          <Mail className="h-3 w-3 inline text-zinc-400" />
                          <span>{savedProfile.email}</span>
                        </p>
                        <p className="text-[11px] text-zinc-500 tracking-wider flex items-center space-x-2">
                          <Smartphone className="h-3 w-3 inline text-zinc-400" />
                          <span className="font-mono">({savedProfile.countryCode}) {savedProfile.phone}</span>
                          <span>{savedProfile.countryFlag}</span>
                        </p>
                      </div>
                    </div>

                    <div className="h-px bg-rose-100/30 dark:bg-zinc-800 my-4" />

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-white dark:bg-zinc-900/60 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-1">
                        <span className="text-[10px] text-zinc-400 uppercase tracking-widest block font-medium">Auto-Populate</span>
                        <p className="text-zinc-700 dark:text-zinc-300 font-medium">Booking Fields Enabled</p>
                      </div>
                      <div className="p-3 bg-white dark:bg-zinc-900/60 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-1">
                        <span className="text-[10px] text-zinc-400 uppercase tracking-widest block font-medium">Membership ID</span>
                        <p className="text-zinc-700 dark:text-zinc-300 font-serif font-mono">{savedProfile.id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={onClose}
                      className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-amber-500 text-white font-medium text-xs uppercase tracking-wider hover:opacity-95 shadow-md transition-all hover:scale-[1.02] cursor-pointer text-center"
                    >
                      Back To Browsing
                    </button>
                    <button
                      onClick={handleLogout}
                      className="py-2.5 px-6 rounded-full border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs uppercase font-medium tracking-widest transition-all cursor-pointer"
                    >
                      Log Out
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* VIEW 2: SPLIT OTP DISPATCH OR SUBMISSION FORM */
                <div className="space-y-4">
                  {!otpSent ? (
                    /* SUB-VIEW 2A: REGISTRATION BASIC FORM */
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      
                      {/* Name input */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] uppercase tracking-widest text-zinc-400 font-bold block">
                          Your Name
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                            <User className="h-4 w-4" />
                          </span>
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your beautiful full name..."
                            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-rose-100 dark:border-zinc-800 bg-rose-50/20 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-amber-300 text-zinc-800 dark:text-zinc-200"
                          />
                        </div>
                      </div>

                      {/* Email Input */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] uppercase tracking-widest text-zinc-400 font-bold block">
                          Email Address
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                            <Mail className="h-4 w-4" />
                          </span>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email address..."
                            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-rose-100 dark:border-zinc-800 bg-rose-50/20 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-amber-300 text-zinc-800 dark:text-zinc-200"
                          />
                        </div>
                      </div>

                      {/* Country and Phone Compound Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        
                        {/* Selector Column */}
                        <div className="relative md:col-span-1 space-y-1.5">
                          <label className="text-[11px] uppercase tracking-widest text-zinc-400 font-bold block">
                            Country
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                            className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl border border-rose-100 dark:border-zinc-800 bg-rose-50/20 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-amber-300 text-zinc-800 dark:text-zinc-200 text-left select-none cursor-pointer"
                          >
                            <span className="flex items-center space-x-2">
                              <span>{selectedCountry.flag}</span>
                              <span className="font-serif">{selectedCountry.name}</span>
                              <span className="text-[10px] text-zinc-400 font-mono">{selectedCountry.code}</span>
                            </span>
                            <Globe className="h-3 w-3 text-zinc-400" />
                          </button>

                          {/* Country Dropdown lists */}
                          {showCountryDropdown && (
                            <div className="absolute left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl shadow-xl py-1">
                              {COUNTRIES.map((cnt) => (
                                <button
                                  key={cnt.name}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCountry(cnt);
                                    setShowCountryDropdown(false);
                                  }}
                                  className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs hover:bg-rose-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                                >
                                  <span>{cnt.flag}</span>
                                  <span className="font-bold flex-1 text-left">{cnt.name}</span>
                                  <span className="text-[10px] text-zinc-400 font-mono">{cnt.code}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Phone input component */}
                        <div className="md:col-span-2 space-y-1.5">
                          <label className="text-[11px] uppercase tracking-widest text-zinc-400 font-bold block">
                            Phone Number
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400 font-mono text-xs">
                              {selectedCountry.code}
                            </span>
                            <input
                              type="tel"
                              required
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder={selectedCountry.placeholder}
                              className="w-full pl-12 pr-4 py-2 text-xs rounded-xl border border-rose-100 dark:border-zinc-800 bg-rose-50/20 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-amber-300 text-zinc-800 dark:text-zinc-200 font-mono"
                            />
                          </div>
                        </div>

                      </div>

                      {/* Verify code generation trigger CTA */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-amber-500 text-white font-medium text-xs uppercase tracking-wider hover:opacity-95 shadow-md flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50"
                      >
                        {isLoading && <RefreshCw className="h-3 w-3 animate-spin" />}
                        <span>Send OTP SMS</span>
                      </button>

                    </form>
                  ) : (
                    /* SUB-VIEW 2B: OTP VALIDATION FORM SCREEN */
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-xs text-zinc-600 dark:text-zinc-400 space-y-1 leading-relaxed">
                        <p>
                          We sent a secure 6-digit verification code via SMS to:
                        </p>
                        <p className="font-mono text-zinc-800 dark:text-zinc-200 font-bold">
                          {selectedCountry.flag} {selectedCountry.name} ({selectedCountry.code}) {phone}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] uppercase tracking-widest text-zinc-400 font-bold block">
                            6-Digit OTP Code
                          </label>
                          <span className="text-[10px] text-zinc-400 font-medium flex items-center space-x-1">
                            <Timer className="h-3  w-3 text-pink-500 shrink-0" />
                            <span>Expires in:</span>
                            <span className="font-mono text-pink-500 font-bold">{formatTimer(secondsRemaining)}</span>
                          </span>
                        </div>

                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                            <Lock className="h-4 w-4" />
                          </span>
                          <input
                            type="text"
                            required
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter the 6-digit activation code..."
                            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-rose-100 dark:border-zinc-800 bg-rose-50/20 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-amber-300 tracking-widest text-zinc-800 dark:text-zinc-200 text-center font-bold font-mono"
                          />
                        </div>
                      </div>

                      {otpPreview && (
                        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                          <span className="text-[10px] text-zinc-500">Visual assistance (Sandbox preview):</span>
                          <span className="font-mono bg-pink-500/10 text-pink-600 py-0.5 px-2 rounded text-xs font-bold">{otpPreview}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            setSuccessMsg(null);
                            setErrorStatus(null);
                            setOtp('');
                          }}
                          className="col-span-1 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 text-xs font-bold uppercase tracking-wider transition-all line-clamp-1 truncate"
                        >
                          Change Number
                        </button>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="col-span-2 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-amber-500 text-white font-medium text-xs uppercase tracking-wider hover:opacity-95 shadow-md flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50"
                        >
                          {isLoading && <RefreshCw className="h-3 w-3 animate-spin" />}
                          <span>Verify & Register Profile</span>
                        </button>
                      </div>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={secondsRemaining > 240}
                          className="text-[10px] text-pink-500 hover:underline disabled:text-zinc-400 text-center mx-auto"
                        >
                          Didn't receive the SMS? Send Code Again {secondsRemaining > 240 ? `(wait ${secondsRemaining - 240}s)` : ''}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </AnimatePresence>

          </div>

          {/* SMS SIMULATOR PANEL (Col-5) */}
          <div className="lg:col-span-5 bg-zinc-950 p-6 sm:p-8 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-zinc-900 border-dashed text-zinc-300">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                    GSM SMS SIMULATOR GATEWAY
                  </span>
                </div>
                <button
                  onClick={fetchsmsLogs}
                  disabled={smsLoading}
                  className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Refresh SMS Carrier Logs"
                >
                  <RefreshCw className={`h-3 w-3 ${smsLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <p className="text-[10px] text-zinc-500 leading-normal font-mono">
                Because international mobile plans require live carrier endpoints (Twilio/Plivo/Infobip), this interactive sandbox queries active simulated GSM packets sent from Express backend /api/sms/logs in real-time.
              </p>

              <div className="h-px bg-zinc-900" />

              {/* Message loop logs */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {smsLogs.length === 0 ? (
                  <div className="py-12 text-center text-zinc-650 font-mono text-[10px] space-y-2">
                    <p className="text-zinc-500">📥 SMS Inbox is currently empty.</p>
                    <p className="text-zinc-600">Please trigger "Send OTP SMS" on registration panel to dispatch code packets.</p>
                  </div>
                ) : (
                  smsLogs.map((log) => {
                    // Extract code pattern to make it clickable/copyable
                    const match = log.body.match(/\b\d{6}\b/);
                    const parsedOtp = match ? match[0] : null;

                    return (
                      <div
                        key={log.id}
                        className="p-3 bg-zinc-900 border border-zinc-850 rounded-xl space-y-2 text-[10px] relative hover:border-pink-500/30 transition-all font-mono"
                      >
                        <div className="flex justify-between items-center text-zinc-550 border-b border-zinc-900 pb-1.5">
                          <span className="text-[9px] text-zinc-450 uppercase">{log.id}</span>
                          <span className="text-amber-500 font-bold">{log.country}</span>
                        </div>
                        
                        <p className="text-zinc-300 leading-relaxed text-left break-words">{log.body}</p>

                        <div className="flex justify-between items-center pt-1 text-[9px] text-zinc-500">
                          <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                          {parsedOtp && (
                            <button
                              onClick={() => {
                                setOtp(parsedOtp);
                                setSuccessMsg('OTP Code auto-filled from simulated SMS!');
                              }}
                              className="text-pink-400 hover:text-pink-300 font-bold uppercase transition-all py-0.5 px-2 bg-pink-500/10 border border-pink-500/20 rounded active:scale-95"
                            >
                              ⚡ Auto-Fill
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Simulated status overlay */}
            <div className="pt-6 border-t border-zinc-900 flex justify-between items-center text-[10px] font-mono text-zinc-500">
              <span className="text-emerald-500 flex items-center space-x-1.5 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Simulated Online</span>
              </span>
              <span>v1.0.4 REST SDK</span>
            </div>

          </div>

        </motion.div>
      </div>

    </div>
  );
}
