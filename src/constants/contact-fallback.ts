import type { ContactInfo } from '@/types/content';

/** Used when `public/data/contact.json` is missing or invalid. */
export const CONTACT_INFO_FALLBACK: ContactInfo = {
  company: {
    name: '4M Industrial Development Limited',
    tagline: 'For Minds - Helping children develop creativity and imagination since 1993',
  },
  contact: {
    email: {
      primary: 'infodesk@4m-ind.com',
      display: 'infodesk@4m-ind.com',
    },
    phone: {
      primary: '+85235898200',
      display: '+852 3589 8200',
      international: '+852 3589 8200',
    },
    address: {
      line1: 'Unit 3129, 31/F, Sun Hung Kai Centre',
      line2: '30 Harbour Road, Wan Chai, Hong Kong',
      city: 'Hong Kong',
      country: 'Hong Kong',
      full: 'Unit 3129, 31/F, Sun Hung Kai Centre, 30 Harbour Road, Wan Chai, Hong Kong',
    },
  },
  businessHours: {
    timezone: 'HKT',
    schedule: {
      monday: { open: '09:00', close: '18:00', display: '9:00 AM - 6:00 PM' },
      tuesday: { open: '09:00', close: '18:00', display: '9:00 AM - 6:00 PM' },
      wednesday: { open: '09:00', close: '18:00', display: '9:00 AM - 6:00 PM' },
      thursday: { open: '09:00', close: '18:00', display: '9:00 AM - 6:00 PM' },
      friday: { open: '09:00', close: '18:00', display: '9:00 AM - 6:00 PM' },
      saturday: { open: '10:00', close: '16:00', display: '10:00 AM - 4:00 PM' },
      sunday: { closed: true, display: 'Closed' },
    },
    note: 'All times are in Hong Kong Time (HKT)',
  },
  social: {
    website: 'https://www.4m-ind.com',
    linkedin: '',
    facebook: '',
    twitter: '',
  },
  support: {
    customerService: {
      email: 'infodesk@4m-ind.com',
      phone: '+852 3589 8200',
    },
    technicalSupport: {
      email: 'infodesk@4m-ind.com',
      note: 'For technical support, please contact our customer service',
    },
  },
};
