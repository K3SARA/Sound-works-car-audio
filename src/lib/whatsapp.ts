/**
 * Converts a locally-entered phone number to the digits-only international format
 * wa.me expects. Sri Lankan numbers are the default case here: a leading 0 is
 * swapped for the 94 country code. Numbers already given with a country code pass through.
 */
export function toWhatsAppNumber(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.startsWith("94")) return digits;
  if (digits.startsWith("0")) return `94${digits.slice(1)}`;
  return digits;
}

/** Builds a wa.me deep link, or null if the phone number isn't usable (missing/too short). */
export function buildWhatsAppLink(phone: string, message: string): string | null {
  const number = toWhatsAppNumber(phone);
  if (!number || number.length < 11) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
