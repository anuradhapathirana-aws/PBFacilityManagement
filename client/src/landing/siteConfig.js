// Public landing page content — edit text, contacts, services and reviews here.
// Everything marked TODO is a placeholder: replace it before going live.

export const site = {
  name: 'Plan B Technical Service Company',
  shortName: 'Plan B',
  tagline: 'Cleaning & Technical Services',
  domain: 'planbfacilitymanagement.com',

  // TODO: real contact details
  phone: '+971 50 000 0000',          // shown on the site
  whatsapp: '971500000000',           // digits only, with country code, no + or spaces
  email: 'info@planbfacilitymanagement.com',
  address: 'Dubai, United Arab Emirates',
  hours: 'Mon – Sun · 8:00 AM – 8:00 PM',

  // TODO: real social links — remove any you don't use
  socials: [
    { icon: 'instagram', label: 'Instagram', url: 'https://instagram.com/' },
    { icon: 'facebook', label: 'Facebook', url: 'https://facebook.com/' },
    { icon: 'tiktok', label: 'TikTok', url: 'https://tiktok.com/' },
  ],
};

export const waLink = (text = 'Hi Plan B, I would like a quote for cleaning services.') =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
export const telLink = () => `tel:${site.phone.replace(/[^\d+]/g, '')}`;

export const nav = [
  { id: 'about', label: 'Who We Are' },
  { id: 'services', label: 'Services' },
  { id: 'why', label: 'Why Us' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'contact', label: 'Contact' },
];

export const highlights = [
  'Trained, uniformed and background-checked staff',
  'Eco-friendly, family- and pet-safe products',
  'Flexible one-time, weekly and contract plans',
  'Residential, commercial and post-construction work',
  'Transparent pricing in AED, no hidden charges',
];

// `icon` must be a key in landing/icons.jsx
export const services = [
  { icon: 'sparkle', title: 'Deep Cleaning', text: 'Top-to-bottom cleaning of every room, corner and surface for a truly fresh start.' },
  { icon: 'home', title: 'Home & Maid Service', text: 'Regular hourly cleaners for villas and apartments — book once, weekly or daily.' },
  { icon: 'building', title: 'Office & Commercial', text: 'Spotless workspaces, shops and common areas, scheduled around your business hours.' },
  { icon: 'box', title: 'Move-in / Move-out', text: 'Handover-ready cleaning so you get your deposit back or move into a perfect home.' },
  { icon: 'sofa', title: 'Sofa & Carpet', text: 'Shampooing and extraction that lifts stains, odours and allergens from fabrics.' },
  { icon: 'drop', title: 'Kitchen & Bathroom', text: 'Degreasing, descaling and sanitising of the hardest-working rooms in the house.' },
  { icon: 'fan', title: 'AC Duct Cleaning', text: 'Cleaner air and better cooling with professional AC and duct cleaning.' },
  { icon: 'wrench', title: 'Technical Maintenance', text: 'Minor plumbing, electrical and handyman jobs from our technical team.' },
];

export const steps = [
  { title: 'Message us', text: 'Tell us what you need on WhatsApp or by phone. We reply fast with a clear quote.' },
  { title: 'We schedule', text: 'Pick a date and time that suits you. Our team arrives on time, fully equipped.' },
  { title: 'Enjoy the shine', text: 'Relax in a spotless space. Not happy with something? We come back and fix it.' },
];

export const whyUs = [
  { icon: 'shield', title: 'Trusted team', text: 'Vetted, trained professionals you can leave in your home or office.' },
  { icon: 'clock', title: 'On time, every time', text: 'Punctual arrivals and work finished within the booked hours.' },
  { icon: 'leaf', title: 'Safe products', text: 'Eco-friendly supplies that are gentle on families, pets and surfaces.' },
  { icon: 'tag', title: 'Fair pricing', text: 'Simple hourly rates and fixed-price packages, agreed before we start.' },
];

// TODO: SAMPLE reviews only — replace with real customer reviews (e.g. from your Google Business profile) before going live.
export const reviews = [
  { name: 'Customer name', meta: 'Deep Cleaning · Dubai Marina', text: 'The team arrived on time and left our apartment spotless. Very professional and friendly — we have booked them again for next month.' },
  { name: 'Customer name', meta: 'Office Cleaning · Business Bay', text: 'We switched our office cleaning to Plan B and the difference is clear. Reliable, flexible with our hours and easy to communicate with.' },
  { name: 'Customer name', meta: 'Move-out Cleaning · JVC', text: 'Handover cleaning was perfect and the landlord had zero complaints. Booking over WhatsApp was quick and simple.' },
  { name: 'Customer name', meta: 'Sofa Shampooing · Al Barsha', text: 'Our sofa looks almost new. Stains we thought were permanent are gone. Great value for money.' },
  { name: 'Customer name', meta: 'Maid Service · Sharjah', text: 'Weekly cleaner is always the same trusted person, careful with our things. Highly recommended.' },
];
