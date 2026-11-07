// Inline SVG icons for the landing page (24×24, stroke = currentColor). No icon library.
const STROKE = {
  sparkle: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z',
  home: 'M3 11l9-7 9 7 M5 9.5V20h5v-6h4v6h5V9.5',
  building: 'M4 21V5l8-2v18 M12 7l8 2v12 M2 21h20 M7 8h2 M7 12h2 M7 16h2 M15 12h2 M15 16h2',
  box: 'M21 8l-9-5-9 5 9 5z M3 8v8l9 5 9-5V8 M12 13v8',
  sofa: 'M4 11V8a2 2 0 012-2h12a2 2 0 012 2v3 M2 13a2 2 0 014 0v2h12v-2a2 2 0 014 0v5H2z M5 18v2 M19 18v2',
  drop: 'M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z M9.5 14.5a2.5 2.5 0 002.5 2.5',
  fan: 'M12 12c0-4 1-8 4-8s3 4-4 8z M12 12c4 0 8 1 8 4s-4 3-8-4z M12 12c0 4-1 8-4 8s-3-4 4-8z M12 12c-4 0-8-1-8-4s4-3 8 4z',
  wrench: 'M14.7 6.3a4 4 0 00-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 005.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z',
  shield: 'M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z M8.5 12l2.5 2.5 4.5-5',
  clock: 'M12 21a9 9 0 100-18 9 9 0 000 18z M12 7v5l3 2',
  leaf: 'M5 19C5 10 10 5 20 4c-1 10-6 15-15 15z M5 19l7-7',
  tag: 'M3 12V4h8l10 10-8 8z M7.5 8.5h.01',
  phone: 'M5 3h4l2 5-2.5 1.5a11 11 0 005 5L15 12l5 2v4a2 2 0 01-2 2A16 16 0 013 5a2 2 0 012-2z',
  mail: 'M3 6h18v12H3z M3 7l9 6 9-6',
  pin: 'M12 21s7-6.2 7-12a7 7 0 00-14 0c0 5.8 7 12 7 12z M12 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  chevronLeft: 'M15 5l-7 7 7 7',
  chevronRight: 'M9 5l7 7-7 7',
  arrowRight: 'M5 12h14 M13 6l6 6-6 6',
  menu: 'M4 7h16 M4 12h16 M4 17h16',
  close: 'M6 6l12 12 M18 6L6 18',
  instagram: 'M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4z M12 16a4 4 0 100-8 4 4 0 000 8z M17.5 6.5h.01',
  facebook: 'M15 3h-2.5A3.5 3.5 0 009 6.5V9H6.5v3.5H9V21h3.5v-8.5H15l.5-3.5h-3V7a1 1 0 011-1H15z',
  tiktok: 'M14 3v11.5a3.5 3.5 0 11-3.5-3.5 M14 3c.4 2.6 2.2 4.4 5 4.6',
};

const FILL = {
  star: 'M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z',
  quote: 'M4 18v-5.5C4 8.4 6.3 5.7 10 5l.8 1.8C8.6 7.6 7.6 9 7.5 11H10v7z M14 18v-5.5c0-4.1 2.3-6.8 6-7.5l.8 1.8c-2.2.8-3.2 2.2-3.3 4.2H20v7z',
  whatsapp:
    'M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.7 11.8 11.8 0 004.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 001.8-1.3 2.2 2.2 0 00.2-1.3c-.1-.1-.3-.2-.6-.3z',
};

export default function Icon({ name, size = 22, className }) {
  const filled = FILL[name];
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={filled || STROKE[name]} />
    </svg>
  );
}
