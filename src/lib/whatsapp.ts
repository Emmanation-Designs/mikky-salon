/**
 * WhatsApp utilities for Mikkys Barbing Salon.
 * Normalizes phone numbers to international digits-only format for wa.me links.
 */

export interface PhoneNormalizationResult {
  isValid: boolean;
  normalizedNumber: string; // Digits only, e.g. "2349038418469"
  formattedDisplay: string;  // e.g. "+234 903 841 8469"
  errorMessage?: string;
}

/**
 * Normalizes user-entered phone number into international digits-only format.
 * Supports Nigerian numbers (e.g. 09038418469 -> 2349038418469) and international formats.
 */
export function normalizeWhatsAppNumber(rawPhone: string): PhoneNormalizationResult {
  if (!rawPhone || !rawPhone.trim()) {
    return {
      isValid: false,
      normalizedNumber: '',
      formattedDisplay: '',
      errorMessage: 'Phone number is required.'
    };
  }

  // Remove whitespace, dashes, parentheses, dots
  let cleaned = rawPhone.trim().replace(/[\s\-\(\)\.]/g, '');

  // Strip leading '+' if present
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // Remove any remaining non-digit characters
  cleaned = cleaned.replace(/\D/g, '');

  if (!cleaned) {
    return {
      isValid: false,
      normalizedNumber: '',
      formattedDisplay: '',
      errorMessage: 'Please enter a valid phone number containing digits.'
    };
  }

  // Check for Nigerian local 11-digit numbers starting with '0'
  // Common prefixes in Nigeria: 070, 080, 081, 090, 091
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = '234' + cleaned.substring(1);
  }

  // Basic sanity check: International phone numbers are typically 8 to 15 digits
  if (cleaned.length < 8 || cleaned.length > 15) {
    return {
      isValid: false,
      normalizedNumber: cleaned,
      formattedDisplay: cleaned,
      errorMessage: 'Phone number should be between 8 and 15 digits including country code.'
    };
  }

  // Format display nicely if Nigerian (starts with 234 and is 13 digits)
  let formattedDisplay = `+${cleaned}`;
  if (cleaned.startsWith('234') && cleaned.length === 13) {
    formattedDisplay = `+234 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }

  return {
    isValid: true,
    normalizedNumber: cleaned,
    formattedDisplay
  };
}

/**
 * Generates direct WhatsApp chat link for an order.
 * Format: https://wa.me/INTERNATIONALNUMBER?text=PREFILLED_MESSAGE
 */
export function generateOrderWhatsAppLink(
  customerPhone: string,
  customerName: string,
  orderReference: string
): { link: string | null; error?: string } {
  const norm = normalizeWhatsAppNumber(customerPhone);
  if (!norm.isValid) {
    return {
      link: null,
      error: norm.errorMessage || 'Invalid customer phone number'
    };
  }

  const message = `Hello ${customerName || 'Customer'}, this is Mikkys Barbing Salon. We received your order ${orderReference}. I’m contacting you to discuss your selected services and preferred appointment time. Thank you!`;

  const link = `https://wa.me/${norm.normalizedNumber}?text=${encodeURIComponent(message)}`;
  return { link };
}

/**
 * Generates direct link to Mikkys Barbing Salon general WhatsApp line (+2349038418469).
 */
export function generateSalonDirectWhatsAppLink(salonPhone = '+2349038418469', customMessage?: string): string {
  const norm = normalizeWhatsAppNumber(salonPhone);
  const number = norm.isValid ? norm.normalizedNumber : '2349038418469';
  const defaultMessage = 'Hello Mikkys Barbing Salon, I would like to inquire about your services and appointment availability.';
  const message = customMessage || defaultMessage;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
