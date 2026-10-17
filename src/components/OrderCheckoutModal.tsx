import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, MessageSquare, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';
import { useOrderCart } from '../context/OrderCartContext';
import { normalizeWhatsAppNumber, generateSalonDirectWhatsAppLink } from '../lib/whatsapp';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface OrderCheckoutModalProps {
  onOpenAuth: () => void;
  onOrderSuccess: (orderRef: string) => void;
}

export const OrderCheckoutModal: React.FC<OrderCheckoutModalProps> = ({ onOpenAuth, onOrderSuccess }) => {
  const { user, profile } = useAuth();
  const { settings } = useBusiness();
  const {
    items,
    selectedHairstyle,
    isCheckoutOpen,
    setIsCheckoutOpen,
    clearCart,
    totalEstimatedAmount,
  } = useOrderCart();

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  // Status & Validation
  const [phoneValidation, setPhoneValidation] = useState(normalizeWhatsAppNumber(''));
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<{
    reference: string;
    total: number;
    phone: string;
  } | null>(null);

  // Pre-fill user details if logged in
  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(profile?.full_name || user.user_metadata?.full_name || '');
      if (!email) setEmail(user.email || '');
      if (!phone && profile?.phone) {
        setPhone(profile.phone);
      }
    }
  }, [user, profile]);

  // Live validate & normalize WhatsApp phone number
  useEffect(() => {
    setPhoneValidation(normalizeWhatsAppNumber(phone));
  }, [phone]);

  if (!isCheckoutOpen) return null;

  const formatPrice = (amount: number) => {
    return `${settings.currency_symbol}${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    // Validation
    if (!fullName.trim()) {
      setSubmissionError('Please enter your full name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setSubmissionError('Please enter a valid email address.');
      return;
    }

    if (!phoneValidation.isValid) {
      setSubmissionError(phoneValidation.errorMessage || 'Please enter a valid WhatsApp phone number.');
      return;
    }

    if (items.length === 0) {
      setSubmissionError('Your order cart is empty. Please select at least one service.');
      return;
    }

    setSubmitting(true);

    try {
      let orderRef = `MIK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      let orderTotal = totalEstimatedAmount;

      if (isSupabaseConfigured) {
        // Prepare payload for PostgreSQL transactional function
        const orderItemsPayload = items.map((item) => ({
          service_id: item.service.id,
          quantity: item.quantity,
        }));

        const { data, error } = await supabase.rpc('create_customer_order', {
          p_customer_name: fullName.trim(),
          p_customer_email: email.trim().toLowerCase(),
          p_customer_phone: phoneValidation.normalizedNumber,
          p_customer_notes: customerNotes.trim() || null,
          p_preferred_date: preferredDate || null,
          p_preferred_time: preferredTime || null,
          p_hairstyle_id: selectedHairstyle?.id?.startsWith('default-') ? null : (selectedHairstyle?.id || null),
          p_items: orderItemsPayload,
        });

        if (error) {
          console.warn('RPC create_customer_order error:', error.message);
          // If RPC is unavailable, fall back to direct orders insert or client confirmation
          const { data: directData } = await supabase.from('orders').insert({
            order_reference: orderRef,
            user_id: user?.id || null,
            customer_name: fullName.trim(),
            customer_email: email.trim().toLowerCase(),
            customer_phone: phoneValidation.normalizedNumber,
            customer_notes: customerNotes.trim() || null,
            preferred_date: preferredDate || null,
            preferred_time: preferredTime || null,
            hairstyle_name: selectedHairstyle?.name || null,
            total_amount: orderTotal,
            status: 'pending',
          }).select().maybeSingle();

          if (directData) {
            orderRef = directData.order_reference;
          }
        } else if (data) {
          orderRef = data.order_reference;
          orderTotal = data.total_amount;
        }
      }

      // Set confirmed state
      setConfirmedOrder({
        reference: orderRef,
        total: orderTotal,
        phone: phoneValidation.normalizedNumber,
      });

      // Clear cart
      clearCart();
      onOrderSuccess(orderRef);
    } catch (err: any) {
      console.error('Error submitting order:', err);
      setSubmissionError(err.message || 'An error occurred while submitting your order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setConfirmedOrder(null);
    setSubmissionError(null);
    setIsCheckoutOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-neutral-900 bg-[#0A0A0A] p-5 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-900 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Confirmation Screen */}
        {confirmedOrder ? (
          <div className="text-center py-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600/10 text-red-500 mb-4 border border-red-600/30">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="text-xs font-bold uppercase tracking-widest text-red-500">
              Order Submitted
            </div>
            <h3 className="mt-1 text-2xl font-black text-white">
              Thank You, {fullName}!
            </h3>

            <p className="mt-2 text-xs text-neutral-400 max-w-sm mx-auto">
              Your appointment request is registered under reference:
            </p>

            <div className="mt-3 inline-block rounded-lg border border-red-900/40 bg-neutral-950 px-4 py-2 font-mono text-base font-bold text-red-500 tracking-wider">
              {confirmedOrder.reference}
            </div>

            {/* Explanatory Reassurance */}
            <div className="mt-6 rounded-xl border border-neutral-900 bg-black p-4 text-left space-y-3">
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div className="text-xs text-neutral-300 leading-relaxed">
                  <strong className="text-white block mb-0.5">WhatsApp Confirmation Next</strong>
                  The salon administrator will contact you shortly on WhatsApp (at <span className="font-mono text-white">+{confirmedOrder.phone}</span>) to agree on your exact time slot.
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-900 flex items-center justify-between text-xs">
                <span className="text-neutral-400">Total payable at salon:</span>
                <span className="text-base font-extrabold text-white tabular-nums">
                  {formatPrice(confirmedOrder.total)}
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={generateSalonDirectWhatsAppLink(
                  settings.salon_phone,
                  `Hello Mikkys Barbing Salon, I just submitted order ${confirmedOrder.reference}. I'm following up regarding my appointment availability!`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-700 transition-colors shadow-md shadow-red-950/40"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Message Salon on WhatsApp</span>
              </a>

              <button
                onClick={handleClose}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 px-5 py-3 text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <div>
            <div className="mb-5">
              <div className="text-[11px] font-bold uppercase tracking-widest text-red-500">
                Book Appointment
              </div>
              <h3 className="mt-0.5 text-xl sm:text-2xl font-black text-white">
                Submit Your Order
              </h3>
              <p className="mt-1 text-xs text-neutral-400">
                Provide your WhatsApp number so our barber can message you to confirm timing.
              </p>
            </div>

            {/* Error banner */}
            {submissionError && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-950/30 p-3.5 flex items-start gap-2.5 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                <span>{submissionError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitOrder} className="space-y-4">
              
              {/* Row: Name and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Chukwuma Obi"
                    className="w-full rounded-xl border border-neutral-800 bg-black px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-neutral-800 bg-black px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* WhatsApp Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  WhatsApp Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 09038418469 or +2349038418469"
                    className={`w-full rounded-xl border bg-black px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none ${
                      phone
                        ? phoneValidation.isValid
                          ? 'border-red-600 focus:border-red-500'
                          : 'border-neutral-700 focus:border-red-500'
                        : 'border-neutral-800 focus:border-red-500'
                    }`}
                  />
                  {phone && phoneValidation.isValid && (
                    <div className="absolute right-3 top-2.5 text-[11px] font-mono text-red-400">
                      WhatsApp: {phoneValidation.formattedDisplay}
                    </div>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-neutral-400">
                  Nigerian numbers (e.g. <code className="text-white">09038418469</code> $\rightarrow$ <code className="text-white">+234</code>) and international formats supported.
                </p>
              </div>

              {/* Preferred Date & Preferred Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-black px-3.5 py-2.5 text-xs text-white focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Preferred Time Slot
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-black px-3.5 py-2.5 text-xs text-white focus:border-red-500 focus:outline-none"
                  >
                    <option value="">Flexible time</option>
                    <option value="Morning (9:00 AM - 12:00 PM)">Morning (9:00 AM - 12:00 PM)</option>
                    <option value="Afternoon (12:00 PM - 3:00 PM)">Afternoon (12:00 PM - 3:00 PM)</option>
                    <option value="Late Afternoon (3:00 PM - 6:00 PM)">Late Afternoon (3:00 PM - 6:00 PM)</option>
                    <option value="Evening (6:00 PM - 8:00 PM)">Evening (6:00 PM - 8:00 PM)</option>
                  </select>
                </div>
              </div>

              {/* Request Notice (Strict Red, Black, White) */}
              <div className="rounded-xl border border-neutral-800 bg-black p-3 text-xs text-neutral-300 leading-relaxed">
                <span className="font-bold text-white">Notice:</span> Preferred date & time is a request. The salon administrator will contact you via WhatsApp to finalize the appointment.
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Styling Notes / Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="e.g. Low skin fade, razor contour, or sensitive skin..."
                  className="w-full rounded-xl border border-neutral-800 bg-black px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none resize-none"
                />
              </div>

              {/* Order Items Preview */}
              <div className="rounded-xl border border-neutral-900 bg-black p-3.5 space-y-2">
                <div className="text-[10px] uppercase font-bold tracking-wider text-red-500">Order Items</div>
                <div className="space-y-1 text-xs">
                  {items.map((item) => (
                    <div key={item.service.id} className="flex justify-between text-neutral-300">
                      <span>{item.quantity}× {item.service.name}</span>
                      <span className="font-bold text-white tabular-nums">
                        {formatPrice(
                          (item.service.promo_price && item.service.promo_price > 0
                            ? item.service.promo_price
                            : item.service.price) * item.quantity
                        )}
                      </span>
                    </div>
                  ))}
                  {selectedHairstyle && (
                    <div className="text-red-400 text-[11px] pt-1">
                      + Style Reference: {selectedHairstyle.name}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-neutral-900 flex justify-between items-center text-sm font-extrabold text-white">
                  <span>Pay at salon:</span>
                  <span className="text-base text-red-500 tabular-nums">{formatPrice(totalEstimatedAmount)}</span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitting}
                  className="rounded-xl px-4 py-2.5 text-xs font-bold text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-red-700 disabled:opacity-50 transition-all shadow-md shadow-red-950/40"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Order</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
};
