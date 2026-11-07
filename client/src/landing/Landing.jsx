import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from './icons.jsx';
import { highlights, nav, reviews, services, site, steps, telLink, waLink, whyUs } from './siteConfig.js';
import './landing.css';

const LOGO = '/logo.png';

/** Adds `.in` to `.reveal` elements when they scroll into view. */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.lp .reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={`lp-header${scrolled ? ' scrolled' : ''}${open ? ' open' : ''}`}>
      <div className="lp-container lp-header-in">
        <a href="#top" className="lp-brand" onClick={close} aria-label={`${site.name} — home`}>
          <img src={LOGO} alt="" width="48" height="48" />
          <span>
            <strong>PLAN B</strong>
            <small>{site.tagline}</small>
          </span>
        </a>

        <nav id="lp-menu" className="lp-nav" aria-label="Main">
          {nav.map((n) => (
            <a key={n.id} href={`#${n.id}`} onClick={close}>
              {n.label}
            </a>
          ))}
          <a className="lp-btn lp-btn-green lp-nav-cta" href={waLink()} target="_blank" rel="noopener noreferrer" onClick={close}>
            <Icon name="whatsapp" size={18} /> Get a Quote
          </a>
        </nav>

        <button
          type="button"
          className="lp-burger"
          aria-expanded={open}
          aria-controls="lp-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          <Icon name={open ? 'close' : 'menu'} size={26} />
        </button>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="lp-hero" id="top">
      <div className="lp-hero-bg" aria-hidden="true">
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="grid" />
      </div>
      <div className="lp-container lp-hero-in">
        <div className="lp-hero-copy">
          <span className="lp-eyebrow light">
            <Icon name="sparkle" size={16} /> Professional cleaning across the UAE
          </span>
          <h1>
            Spotless spaces.
            <br />
            <span className="lp-grad">Zero stress.</span>
          </h1>
          <p>
            {site.name} delivers reliable home, office and specialised cleaning — plus the technical maintenance that keeps
            your property running. When plan A falls through, call Plan B.
          </p>
          <div className="lp-actions">
            <a className="lp-btn lp-btn-green lp-btn-lg" href={waLink()} target="_blank" rel="noopener noreferrer">
              <Icon name="whatsapp" size={20} /> Get a free quote
            </a>
            <a className="lp-btn lp-btn-ghost lp-btn-lg" href={telLink()}>
              <Icon name="phone" size={19} /> {site.phone}
            </a>
          </div>
          <ul className="lp-hero-points">
            <li><Icon name="check" size={18} /> Vetted staff</li>
            <li><Icon name="check" size={18} /> Eco-safe products</li>
            <li><Icon name="check" size={18} /> Flexible scheduling</li>
          </ul>
        </div>

        <div className="lp-hero-art" aria-hidden="true">
          <div className="lp-orbit">
            <span className="ring r1" />
            <span className="ring r2" />
            <div className="lp-badge">
              <img src={LOGO} alt="" width="360" height="360" />
            </div>
            <div className="lp-float f1">
              <span className="ic green"><Icon name="leaf" size={20} /></span>
              <span><strong>Eco-safe</strong><small>Family &amp; pet friendly</small></span>
            </div>
            <div className="lp-float f2">
              <span className="ic blue"><Icon name="shield" size={20} /></span>
              <span><strong>Trusted team</strong><small>Trained &amp; uniformed</small></span>
            </div>
            <div className="lp-float f3">
              <span className="ic green"><Icon name="building" size={20} /></span>
              <span><strong>Homes · Offices</strong><small>Villas &amp; buildings</small></span>
            </div>
          </div>
        </div>
      </div>
      <svg className="lp-hero-wave" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 80V40C240 0 480 0 720 30s480 50 720 10v40z" />
      </svg>
    </section>
  );
}

function About() {
  return (
    <section className="lp-section" id="about">
      <div className="lp-container lp-about">
        <div className="lp-about-art reveal">
          <div className="lp-mosaic">
            <div className="tile t1"><Icon name="home" size={34} /><span>Homes &amp; Villas</span></div>
            <div className="tile t2"><Icon name="building" size={34} /><span>Offices</span></div>
            <div className="tile t3"><Icon name="wrench" size={34} /><span>Technical</span></div>
            <div className="tile t4"><Icon name="sparkle" size={34} /><span>Deep Clean</span></div>
          </div>
          <div className="lp-about-stamp">
            <img src={LOGO} alt="" width="84" height="84" />
          </div>
        </div>

        <div className="lp-about-copy reveal">
          <span className="lp-eyebrow">Who we are</span>
          <h2>Your reliable partner for clean, well-kept spaces</h2>
          <p>
            {site.name} is a UAE-based cleaning and technical services provider. We look after homes, villas, offices and
            commercial buildings with a team that is trained, equipped and genuinely cares about the details.
          </p>
          <p>
            From a one-time deep clean to ongoing maintenance contracts, we make it simple: one message, a clear quote, and
            a team that turns up on time and gets it right.
          </p>
          <ul className="lp-checks">
            {highlights.map((h) => (
              <li key={h}>
                <span><Icon name="check" size={16} /></span>
                {h}
              </li>
            ))}
          </ul>
          <a className="lp-btn lp-btn-blue" href="#services">
            Explore our services <Icon name="arrowRight" size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}

/** Horizontal scroll-snap carousel with prev/next buttons. */
function Carousel({ label, children, className = '' }) {
  const track = useRef(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [update]);

  const go = (dir) => {
    const el = track.current;
    const card = el?.firstElementChild;
    if (!el || !card) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const step = card.getBoundingClientRect().width + gap;
    const perView = Math.max(1, Math.floor((el.clientWidth + gap) / step));
    el.scrollBy({ left: dir * step * perView, behavior: 'smooth' });
  };

  return (
    <div className={`lp-carousel ${className}`} role="region" aria-roledescription="carousel" aria-label={label}>
      <button type="button" className="lp-arrow prev" onClick={() => go(-1)} disabled={edge.start} aria-label={`Previous ${label}`}>
        <Icon name="chevronLeft" size={22} />
      </button>
      <div className="lp-track" ref={track} onScroll={update}>
        {children}
      </div>
      <button type="button" className="lp-arrow next" onClick={() => go(1)} disabled={edge.end} aria-label={`Next ${label}`}>
        <Icon name="chevronRight" size={22} />
      </button>
    </div>
  );
}

function Services() {
  return (
    <section className="lp-section lp-soft" id="services">
      <div className="lp-container">
        <div className="lp-head reveal">
          <span className="lp-eyebrow">Our services</span>
          <h2>Everything your space needs, under one roof</h2>
          <p>Residential, commercial and technical services — book a single visit or a regular plan.</p>
        </div>
        <Carousel label="services" className="reveal">
          {services.map((s, i) => (
            <article className={`lp-service ${i % 2 ? 'green' : 'blue'}`} key={s.title}>
              <div className="lp-service-top">
                <span className="lp-service-ic"><Icon name={s.icon} size={34} /></span>
                <span className="lp-service-no">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <a href={waLink(`Hi Plan B, I would like a quote for ${s.title}.`)} target="_blank" rel="noopener noreferrer">
                Book this service <Icon name="arrowRight" size={16} />
              </a>
            </article>
          ))}
        </Carousel>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="lp-section" id="how">
      <div className="lp-container">
        <div className="lp-head reveal">
          <span className="lp-eyebrow">How it works</span>
          <h2>Booking a clean takes less than a minute</h2>
        </div>
        <ol className="lp-steps">
          {steps.map((s, i) => (
            <li className="reveal" key={s.title} style={{ transitionDelay: `${i * 90}ms` }}>
              <span className="lp-step-no">{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function WhyUs() {
  return (
    <section className="lp-section lp-navy" id="why">
      <div className="lp-container">
        <div className="lp-head reveal">
          <span className="lp-eyebrow light">Why choose Plan B</span>
          <h2>Cleaning you don&apos;t have to think about</h2>
        </div>
        <div className="lp-why">
          {whyUs.map((w, i) => (
            <div className="lp-why-card reveal" key={w.title} style={{ transitionDelay: `${i * 80}ms` }}>
              <span className="ic"><Icon name={w.icon} size={26} /></span>
              <h3>{w.title}</h3>
              <p>{w.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Reviews() {
  return (
    <section className="lp-section lp-soft lp-reviews" id="reviews">
      <div className="lp-container">
        <div className="lp-head reveal">
          <span className="lp-eyebrow">Testimonials</span>
          <h2>What customers say about us</h2>
          <p>We take pride in the relationships we build and the results we deliver.</p>
        </div>
        <Carousel label="reviews" className="reveal">
          {reviews.map((r, i) => (
            <figure className="lp-review" key={i}>
              <div className="lp-review-top">
                <span className="lp-stars" aria-label="5 out of 5 stars">
                  {[0, 1, 2, 3, 4].map((k) => <Icon key={k} name="star" size={17} />)}
                </span>
                <Icon name="quote" size={30} className="lp-quote" />
              </div>
              <blockquote>{r.text}</blockquote>
              <figcaption>
                <span className="lp-avatar">{r.name.charAt(0)}</span>
                <span>
                  <strong>{r.name}</strong>
                  <small>{r.meta}</small>
                </span>
              </figcaption>
            </figure>
          ))}
        </Carousel>
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section className="lp-cta-wrap">
      <div className="lp-container">
        <div className="lp-cta reveal">
          <div>
            <h2>Ready for a spotless space?</h2>
            <p>Send us a message and get a clear, no-obligation quote today.</p>
          </div>
          <div className="lp-actions">
            <a className="lp-btn lp-btn-white lp-btn-lg" href={waLink()} target="_blank" rel="noopener noreferrer">
              <Icon name="whatsapp" size={20} /> WhatsApp us
            </a>
            <a className="lp-btn lp-btn-ghost lp-btn-lg" href={telLink()}>
              <Icon name="phone" size={19} /> Call now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="lp-footer" id="contact">
      <div className="lp-container lp-footer-grid">
        <div className="lp-footer-brand">
          <a href="#top" className="lp-brand light">
            <img src={LOGO} alt="" width="52" height="52" />
            <span>
              <strong>PLAN B</strong>
              <small>{site.tagline}</small>
            </span>
          </a>
          <p>Professional cleaning and technical services for homes and businesses across the UAE.</p>
          {site.socials.length > 0 && (
            <div className="lp-socials">
              {site.socials.map((s) => (
                <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label} title={s.label}>
                  <Icon name={s.icon} size={18} />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h4>Quick links</h4>
          <ul className="lp-links">
            {nav.slice(0, 4).map((n) => (
              <li key={n.id}><a href={`#${n.id}`}>{n.label}</a></li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Contact us</h4>
          <ul className="lp-contact">
            <li><Icon name="phone" size={18} /><a href={telLink()}>{site.phone}</a></li>
            <li><Icon name="whatsapp" size={18} /><a href={waLink()} target="_blank" rel="noopener noreferrer">WhatsApp chat</a></li>
            <li><Icon name="mail" size={18} /><a href={`mailto:${site.email}`}>{site.email}</a></li>
            <li><Icon name="pin" size={18} /><span>{site.address}</span></li>
            <li><Icon name="clock" size={18} /><span>{site.hours}</span></li>
          </ul>
        </div>
      </div>
      <div className="lp-container lp-footer-bottom">
        <span>© {year} {site.name}. All rights reserved.</span>
        <span>{site.domain}</span>
      </div>
    </footer>
  );
}

export default function Landing() {
  useReveal();
  useEffect(() => {
    document.title = `${site.name} | Cleaning Services UAE`;
  }, []);

  return (
    <div className="lp">
      <a className="lp-skip" href="#about">Skip to content</a>
      <Header />
      <main>
        <Hero />
        <About />
        <Services />
        <HowItWorks />
        <WhyUs />
        <Reviews />
        <Cta />
      </main>
      <Footer />
      <a className="lp-wa-float" href={waLink()} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp" title="Chat on WhatsApp">
        <Icon name="whatsapp" size={30} />
      </a>
    </div>
  );
}
