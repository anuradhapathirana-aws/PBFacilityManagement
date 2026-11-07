import { Link } from 'react-router-dom';

// Inline SVG icons (24×24, stroke = currentColor). Add new icons here; never import an icon library for one glyph.
const PATHS = {
  edit: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </>
  ),
  jobs: (
    <>
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M9 12h6M9 16h6" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  userOff: (
    <>
      <circle cx="9" cy="7" r="4" />
      <path d="M2 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 3.5 1.1" />
      <path d="m17 15 5 5M22 15l-5 5" />
    </>
  ),
  userOn: (
    <>
      <circle cx="9" cy="7" r="4" />
      <path d="M2 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 3.5 1.1" />
      <path d="m16 18 2 2 4-4" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
};

export function Icon({ name, size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}

/**
 * Icon-only action button. `title` is REQUIRED: it is the hover tooltip and the accessible name.
 * Pass `to` to render a router Link instead of a button. variant: '' | 'danger' | 'good'
 */
export function IconButton({ icon, title, to, onClick, variant = '', disabled, type = 'button' }) {
  const cls = `icon-btn ${variant}`;
  if (to && !disabled) {
    return (
      <Link className={cls} to={to} title={title} aria-label={title}>
        <Icon name={icon} />
      </Link>
    );
  }
  return (
    // Wrapper span keeps the tooltip visible on disabled buttons (disabled elements don't fire hover in some browsers).
    <span title={title} className="icon-btn-wrap">
      <button type={type} className={cls} onClick={onClick} disabled={disabled} aria-label={title}>
        <Icon name={icon} />
      </button>
    </span>
  );
}
