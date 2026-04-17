/**
 * Canonical company address. Applied at runtime in `getContactInfo()` so footer and contact pages
 * stay aligned; keep `public/data/contact.json` in sync for editors who read the JSON directly.
 */
export const COMPANY_ADDRESS = {
  line1: 'Unit 805-06, 8/F, CTF Life Tower,',
  line2: '18 Sheung Yuet Road, Kowloon Bay, Hong Kong',
  city: 'Hong Kong',
  country: 'Hong Kong',
} as const;

export function getCompanyAddressFull(): string {
  return `${COMPANY_ADDRESS.line1} ${COMPANY_ADDRESS.line2}`;
}
