import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { normalizeWhatsAppNumber } from '../lib/whatsapp';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'signin',
}) => {
  const { signIn, signUp, resetPassword } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email.trim().toLowerCase(), password);
        if (error) throw error;
        onClose();
      } else if (mode === 'signup') {
        if (!fullName.trim()) throw new Error('Please enter your full name.');
        const normPhone = normalizeWhatsAppNumber(phone);
        if (!normPhone.isValid) throw new Error(normPhone.errorMessage || 'Please enter a valid WhatsApp phone number.');

        const { error } = await signUp(
          email.trim().toLowerCase(),
          password,
          fullName.trim(),
          normPhone.normalizedNumber
        );
        if (error) throw error;
        setSuccessMessage('Account created successfully! Check your email if a confirmation link is required, or sign in.');
        setMode('signin');
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email.trim().toLowerCase());
        if (error) throw error;
        setSuccessMessage('Password reset instructions sent to your email.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-neutral-900 bg-neutral-950 p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-lg p-1 text-neutral-400 hover:bg-neutral-900 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-red-500">
            {mode === 'signin' && 'Welcome Back'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'forgot' && 'Account Recovery'}
          </div>
          <h3 className="mt-1 text-2xl font-bold text-white">
            {mode === 'signin' && 'Sign in to Your Account'}
            {mode === 'signup' && 'Register Customer Account'}
            {mode === 'forgot' && 'Reset Your Password'}
          </h3>
          <p className="mt-1 text-xs text-neutral-400">
            {mode === 'signin' && 'Access your order history and manage your appointments.'}
            {mode === 'signup' && 'Save your contact details for fast booking and order tracking.'}
            {mode === 'forgot' && 'Enter your email to receive a password reset link.'}
          </p>
        </div>

        {/* Error / Success Banners */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-950/20 p-3 flex items-start gap-2 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-lg border border-red-600/40 bg-neutral-900 p-3 text-xs text-white">
            {successMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Chukwuma Obi"
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                WhatsApp Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09038418469 or +234..."
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-neutral-300">
                  Password *
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setMode('forgot');
                    }}
                    className="text-[11px] text-neutral-400 hover:text-red-400"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-700 disabled:opacity-50 transition-all shadow-md shadow-red-950/40"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>
                {mode === 'signin' && 'Sign In'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'forgot' && 'Send Reset Email'}
              </span>
            )}
          </button>
        </form>

        {/* Switch Mode Footer */}
        <div className="mt-6 pt-4 border-t border-neutral-900 text-center text-xs text-neutral-400">
          {mode === 'signin' && (
            <div>
              Don't have an account yet?{' '}
              <button
                onClick={() => {
                  setError(null);
                  setMode('signup');
                }}
                className="font-bold text-red-500 hover:underline"
              >
                Sign Up
              </button>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              Already have an account?{' '}
              <button
                onClick={() => {
                  setError(null);
                  setMode('signin');
                }}
                className="font-bold text-red-500 hover:underline"
              >
                Sign In
              </button>
            </div>
          )}

          {mode === 'forgot' && (
            <div>
              Remember your password?{' '}
              <button
                onClick={() => {
                  setError(null);
                  setMode('signin');
                }}
                className="font-bold text-red-500 hover:underline"
              >
                Back to Sign In
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
