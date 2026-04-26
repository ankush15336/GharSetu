tailwind.config = { darkMode: "class", theme: { extend: { colors: { "surface": "#131313", "surface-container-lowest": "#0E0E0E", "surface-container-low": "#1C1B1B", "surface-container": "#201F1F", "surface-container-high": "#2A2A2A", "on-surface": "#E5E2E1", "on-surface-variant": "#D1C5B4", "primary": "#E9C176", "primary-container": "#C5A059", "on-primary": "#412D00", "outline-variant": "#4E4639" }, fontFamily: { headline: ["Newsreader", "serif"], body: ["Manrope", "sans-serif"], label: ["Manrope", "sans-serif"] } } } };



// Nav scroll: add 'scrolled' class when page scrolls down
const nav = document.getElementById('nav');
if (nav) {
  const onNavScroll = () => {
    if (window.scrollY > 20) {
      nav.classList.add('scrolled');
      nav.classList.remove('at-top');
    } else {
      nav.classList.remove('scrolled');
      nav.classList.add('at-top');
    }
  };
  window.addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll();
}

// Progress
window.addEventListener('scroll', () => { document.getElementById('pb').style.width = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100) + '%'; }, { passive: true });


// Nav is absolute, scrolls with page

// Sidebar
const sb = document.getElementById('sidebar'), sbo = document.getElementById('sb-overlay'), ham = document.getElementById('ham');
function openSidebar() {
  sb.classList.add('open'); sbo.classList.add('open');
  ham.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeSidebar() {
  sb.classList.remove('open'); sbo.classList.remove('open');
  ham.classList.remove('open');
  document.body.style.overflow = '';
}
function sbNav(el) {
  const href = el.getAttribute('href');
  closeSidebar();
  if (href && href != '#') {
    setTimeout(() => {
      const t = document.querySelector(href);
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 350);
  }
  return false;
}

// Privacy Policy — now a separate page (privacy.html)

// Scroll reveal
const obs = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) e.target.classList.add('on'); }); }, { threshold: .07, rootMargin: '0px 0px -36px 0px' });
document.querySelectorAll('.rv,.rvl,.rvr').forEach(el => obs.observe(el));

// Stats removed — counter not needed

// Process line
const pfo = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) { const f = document.getElementById('plf'); if (f) f.style.width = '100%'; } }); }, { threshold: .3 });
const ps = document.getElementById('process'); if (ps) pfo.observe(ps);

// Hero entrance
setTimeout(() => {
  ['hey', 'hh1', 'hout', 'hsub', 'hbtns'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.style.opacity = '1'; el.style.transform = 'none'; }
  });
  const hbg = document.getElementById('hbg'); if (hbg) hbg.classList.add('loaded');
}, 140);

// Hero parallax
window.addEventListener('scroll', () => {
  const y = window.scrollY, hbg = document.getElementById('hbg');
  if (hbg && y < window.innerHeight) hbg.style.transform = 'scale(1) translateY(' + (y * .18) + 'px)';
}, { passive: true });

// Close sidebar on escape key
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSidebar(); });
// Callback date — min = today
const cbDate = document.getElementById('gf-date');
if (cbDate) cbDate.min = new Date().toISOString().split('T')[0];

// Toggle custom exact-time picker
function toggleCustomTime(val) {
  const wrap = document.getElementById('gf-custom-time-wrap');
  if (!wrap) return;
  wrap.style.display = val === 'custom' ? 'block' : 'none';
  const inp = document.getElementById('gf-custom-time');
  if (inp) inp.required = val === 'custom';
}
