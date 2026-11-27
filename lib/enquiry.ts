/**
 * Shared enquiry validation — used by the dialog and /api/enquiry. Limits are kept within the CRM's public enquiry
 * schema (IT_GEEK_BACKEND → src/validations/enquiry.validation.ts) so valid form input is never rejected there.
 */

export const ENQUIRY_TOPICS = [
  "Microsoft 365 help",
  "Antivirus & security help",
  "Free quote",
  "Online support (A$99)",
  "Smart Care annual plan (A$99)",
  "Onsite support (A$99)",
  "Something else",
] as const;

export type EnquiryTopic = (typeof ENQUIRY_TOPICS)[number];

export type EnquiryInput = {
  name: string;
  email: string;
  phone: string;
  topic: string;
  message: string;
};

export type EnquiryField = keyof EnquiryInput;
export type EnquiryErrors = Partial<Record<EnquiryField, string>>;

// CRM limits: name 2–100, email ≤ 150, phone 8–20, description 5–5000 characters.
export const LIMITS = { name: 80, email: 150, phone: 20, message: 2000 } as const;

/** The CRM's phone rule; AU numbers must satisfy both this and isValidAuPhone. */
const CRM_PHONE_RE = /^[+]?[\d\s\-()]{8,20}$/;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Australian landline/mobile (+61 or 0), 1300/1800 and 13xxxx numbers. */
export function isValidAuPhone(raw: string): boolean {
  const compact = raw.replace(/[\s().-]/g, "");
  return (
    /^(?:\+?61|0)[2-478]\d{8}$/.test(compact) ||
    /^1[38]00\d{6}$/.test(compact) ||
    /^13\d{4}$/.test(compact)
  );
}

export function normaliseEnquiry(input: Partial<Record<EnquiryField, unknown>>): EnquiryInput {
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  return {
    name: str(input.name),
    email: str(input.email).toLowerCase(),
    phone: str(input.phone),
    topic: str(input.topic),
    message: str(input.message),
  };
}

export function validateEnquiry(data: EnquiryInput): EnquiryErrors {
  const errors: EnquiryErrors = {};

  if (!data.name) errors.name = "Please enter your name.";
  else if (data.name.length < 2) errors.name = "Please enter your full name.";
  else if (data.name.length > LIMITS.name) errors.name = `Please keep your name under ${LIMITS.name} characters.`;

  if (!data.email) errors.email = "Please enter your email address.";
  else if (data.email.length > LIMITS.email || !EMAIL_RE.test(data.email))
    errors.email = "Please enter a valid email address, e.g. name@example.com.";

  if (data.phone && (data.phone.length > LIMITS.phone || !isValidAuPhone(data.phone) || !CRM_PHONE_RE.test(data.phone)))
    errors.phone = "Please enter a valid Australian phone number, e.g. 0412 345 678.";

  if (!(ENQUIRY_TOPICS as readonly string[]).includes(data.topic)) errors.topic = "Please choose what you need help with.";

  if (data.message.length < 10) errors.message = "Please describe the issue in a few words (at least 10 characters).";
  else if (data.message.length > LIMITS.message)
    errors.message = `Please keep your message under ${LIMITS.message} characters.`;

  return errors;
}
