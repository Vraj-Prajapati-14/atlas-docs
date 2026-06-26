/**
 * India-specific validation utilities.
 */

/** Validate Indian mobile number (10 digits, starts with 6-9). */
export function isValidIndianPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-+()]/g, '')
  // Remove country code if present
  const digits = cleaned.startsWith('91') && cleaned.length === 12
    ? cleaned.slice(2)
    : cleaned
  return /^[6-9]\d{9}$/.test(digits)
}

/** Normalize phone to 10-digit format. */
export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-+()]/g, '')
  if (cleaned.startsWith('91') && cleaned.length === 12) return cleaned.slice(2)
  if (cleaned.startsWith('+91') && cleaned.length === 13) return cleaned.slice(3)
  return cleaned
}

/**
 * Validate GSTIN (Goods and Services Tax Identification Number).
 * Format: 2-digit state code + 10-char PAN + 1-char entity + 1-char Z + 1 check digit
 * Total: 15 characters.
 */
export function isValidGSTIN(gstin: string): boolean {
  const pattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  return pattern.test(gstin.toUpperCase())
}

/**
 * Extract state code from GSTIN.
 * @example getStateFromGSTIN("29ABCDE1234F1Z5") → "29" (Karnataka)
 */
export function getStateCodeFromGSTIN(gstin: string): string {
  return gstin.slice(0, 2)
}

/**
 * Check if two GSTINs are from the same state (intra-state supply → CGST + SGST).
 * Different states → IGST.
 */
export function isSameState(gstin1: string, gstin2: string): boolean {
  return getStateCodeFromGSTIN(gstin1) === getStateCodeFromGSTIN(gstin2)
}

/** Validate PAN number format. */
export function isValidPAN(pan: string): boolean {
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase())
}

/** Validate FSSAI license number (14 digits). */
export function isValidFSSAI(fssai: string): boolean {
  return /^\d{14}$/.test(fssai)
}

/** Validate Indian PIN code (6 digits). */
export function isValidPincode(pincode: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pincode)
}

/** Validate email address. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Sanitize a string for safe display (prevent XSS in server-rendered content).
 * Strips HTML tags and trims whitespace.
 */
export function sanitizeString(input: string, maxLength = 500): string {
  return input
    .replace(/<[^>]*>/g, '')  // strip HTML tags
    .replace(/[<>&"']/g, '')  // strip remaining dangerous chars
    .trim()
    .slice(0, maxLength)
}

/**
 * Generate a URL-safe slug from a string.
 * @example toSlug("Priya's Kitchen & Bar") → "priyas-kitchen-bar"
 */
export function toSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
