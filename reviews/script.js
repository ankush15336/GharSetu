/* ═══════════════════════════════════════════════════════
   GharSetu Reviews — reviews.js
   ═══════════════════════════════════════════════════════ */

/* ──────────────────────────────────────────────
   FIREBASE CONFIG — paste your values here
   ────────────────────────────────────────────── */
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyDIiuooVbJJlOHtfIdSRVHZbA-O6lIx-jk",
  authDomain:        "gharsetu-d2979.firebaseapp.com",
  databaseURL:       "https://gharsetu-d2979-default-rtdb.firebaseio.com",
  projectId:         "gharsetu-d2979",
  storageBucket:     "gharsetu-d2979.firebasestorage.app",
  messagingSenderId: "591359777163",
  appId:             "1:591359777163:web:3b09b1f4670f982311b78e",
  measurementId:     "G-C2CB17ENKJ"
};

/* ──────────────────────────────────────────────
   SAMPLE REVIEWS (shown when Firebase is empty)
   ────────────────────────────────────────────── */
const SAMPLE_REVIEWS = [
  {
    id: 's1', name: 'Rohit M.', rating: 5, badge: 'Verified Buyer',
    text: 'GharSetu made the entire process seamless. Got a Prestige property 8% below market rate. Thorough legal support throughout.',
    property: '3 BHK · Prestige Sarjapura',
    photoURL: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=85&fit=crop',
    timestamp: Date.now() - 86400000 * 5
  },
  {
    id: 's2', name: 'Priya & Karan S.', rating: 5, badge: 'NRI Buyer',
    text: 'Being NRI, I was worried about managing a Bangalore purchase remotely. The team handled everything — from site visits to registration — keeping me informed at every step.',
    property: '4 BHK Villa · Brigade',
    photoURL: '',
    timestamp: Date.now() - 86400000 * 12
  },
  {
    id: 's3', name: 'Anand R.', rating: 5, badge: 'First-Time Buyer',
    text: 'The 1% fee was unbelievable at first — I thought there\'d be hidden charges. There were none. Professional, honest, best deal on my Sobha apartment.',
    property: '3 BHK · Sobha Whitefield',
    photoURL: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=85&fit=crop',
    timestamp: Date.now() - 86400000 * 20
  },
  {
    id: 's4', name: 'Suresh V.', rating: 4, badge: 'Investor',
    text: 'I\'ve bought 3 properties over the years. GharSetu is the first where I genuinely felt the advisor was on my side. Pre-launch access to Godrej at exceptional pricing.',
    property: '3 BHK · Godrej Properties',
    photoURL: '',
    timestamp: Date.now() - 86400000 * 30
  },
  {
    id: 's5', name: 'Meera T.', rating: 5, badge: 'Verified Buyer',
    text: 'From the very first call, the team understood exactly what I needed. Shortlisted 4 verified options in 2 weeks. Registration done in under 60 days. Truly exceptional.',
    property: '2 BHK · Birla Estates',
    photoURL: '',
    timestamp: Date.now() - 86400000 * 45
  }
];

/* ──────────────────────────────────────────────
   FIREBASE INIT
   ────────────────────────────────────────────── */
let db = null;
let firebaseReady = false;
try {
  if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
  db = firebase.database();
  firebaseReady = !FIREBASE_CONFIG.apiKey.includes('PASTE');
} catch (e) {
  console.warn('Firebase not configured:', e);
}

/* ──────────────────────────────────────────────
   STATS COMPUTATION
   ────────────────────────────────────────────── */
function computeStats(reviews) {
  const count = reviews.length;
  if (count === 0) return { count: 0, avg: '0.0', dist: {5:0,4:0,3:0,2:0,1:0} };

  let total = 0;
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    const s = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
    total += s;
    dist[s]++;
  });
  return { count, avg: (total / count).toFixed(1), dist };
}

/* ──────────────────────────────────────────────
   UPDATE UI — Hero stats + Distribution panel
   ────────────────────────────────────────────── */
function updateStatsUI(stats) {
  const { count, avg, dist } = stats;

  // Hero stats
  const heroRl  = document.querySelector('.hero-rl');
  const heroAmb = document.querySelector('.hero-amb');
  if (heroRl)  heroRl.innerHTML  = `<strong>${avg} / 5</strong>&nbsp; &middot; &nbsp;${count > 0 ? count : '120+'} verified buyers`;
  if (heroAmb) heroAmb.textContent = avg;

  // Stats strip (first stat cell)
  const avgCell = document.getElementById('stat-avg');
  if (avgCell) avgCell.textContent = avg;

  // Distribution panel
  const panel = document.getElementById('sdp');
  if (!panel) return;

  const bigEl   = panel.querySelector('.sdp-big');
  const countEl = panel.querySelector('.sdp-count');
  if (bigEl)   bigEl.textContent  = avg;
  if (countEl) countEl.textContent = `Based on ${count} review${count !== 1 ? 's' : ''}`;

  // Half-star SVG for display
  const filledStars = Math.round(parseFloat(avg) * 2) / 2; // nearest 0.5
  const starsEl = panel.querySelector('.sdp-stars');
  if (starsEl) {
    starsEl.innerHTML = renderStarsSVG(filledStars, 14);
  }

  // Bars
  const rows = panel.querySelectorAll('.sdp-row');
  rows.forEach(row => {
    const star = +row.dataset.star;
    const n    = dist[star] || 0;
    const pct  = count > 0 ? Math.round((n / count) * 100) : 0;
    const fill = row.querySelector('.sdp-fill');
    const pctEl = row.querySelector('.sdp-pct');
    const nEl   = row.querySelector('.sdp-n');
    if (fill)  fill.dataset.w = pct;
    if (pctEl) pctEl.textContent = pct + '%';
    if (nEl)   nEl.textContent   = n;
  });

  // Animate bars (IntersectionObserver triggers this)
  animateDistBars();
}

function animateDistBars() {
  const fills = document.querySelectorAll('.sdp-fill');
  fills.forEach((f, i) => {
    setTimeout(() => { f.style.width = (f.dataset.w || 0) + '%'; }, i * 100);
  });
}

/* ──────────────────────────────────────────────
   FILTER BUTTON COUNTS
   ────────────────────────────────────────────── */
function updateFilterCounts(reviews) {
  const photoCount = reviews.filter(r => r.photoURL).length;
  const fiveCount  = reviews.filter(r => r.rating >= 5).length;
  const fourCount  = reviews.filter(r => r.rating >= 4 && r.rating < 5).length;

  const setBadge = (id, n) => {
    const el = document.getElementById(id);
    if (el) el.textContent = n > 0 ? `(${n})` : '';
  };
  setBadge('cnt-all',   reviews.length);
  setBadge('cnt-5',     fiveCount);
  setBadge('cnt-4',     fourCount);
  setBadge('cnt-photo', photoCount);
}

/* ──────────────────────────────────────────────
   STAR SVG RENDERER (supports half-stars)
   ────────────────────────────────────────────── */
function renderStarsSVG(value, size = 13) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    const filled = value >= i ? '#E9C176' : value >= i - 0.5 ? 'url(#half)' : 'rgba(233,193,118,.15)';
    html += `<svg width="${size}" height="${size}" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="half">
          <stop offset="50%" stop-color="#E9C176"/>
          <stop offset="50%" stop-color="rgba(233,193,118,.15)"/>
        </linearGradient>
      </defs>
      <path d="M10 1l2.39 5.26H18l-4.5 3.63 1.64 5.61L10 12.27 4.86 15.5l1.64-5.61L2 6.26h5.61z" fill="${filled}"/>
    </svg>`;
  }
  return html;
}

/* ──────────────────────────────────────────────
   BUILD REVIEW CARD HTML
   ────────────────────────────────────────────── */
function buildReviewCard(data, isNew = false) {
  const stars   = renderStarsSVG(data.rating || 5);
  const initial = data.name ? data.name.trim()[0].toUpperCase() : '?';
  const dateStr = data.timestamp
    ? new Date(data.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';
  const propHtml  = data.property ? `<div class="td">${data.property}</div>` : '';
  const badge     = data.badge || 'Verified Buyer';
  const newBadge  = isNew
    ? `<span style="font-size:.48rem;letter-spacing:.1em;background:rgba(233,193,118,.12);color:#E9C176;padding:2px 7px;border:1px solid rgba(233,193,118,.25);margin-left:8px">NEW</span>`
    : '';

  // Photo block — clicking opens lightbox
  const photoHtml = data.photoURL
    ? `<div class="tm" onclick="lbxOpen('${data.photoURL}')">
         <img src="${data.photoURL}" alt="Review photo" loading="lazy">
         <div class="mb">Photo</div>
       </div>`
    : '';

  return `
    <div class="rt" data-s="${data.rating}" data-t="${data.photoURL ? 'photo' : 'text'}">
      <div class="tb">${badge}${newBadge}</div>
      <div class="ts">${stars}</div>
      ${photoHtml}
      <div class="tx" style="margin-top:${data.photoURL ? '12px' : '0'}">&ldquo;${data.text}&rdquo;</div>
      <div class="ta">
        <div class="tav"><div class="tin">${initial}</div></div>
        <div style="flex:1">
          <div class="tn">${data.name}</div>
          ${propHtml}
          <div style="font-size:.54rem;color:rgba(229,226,225,.18);margin-top:2px;letter-spacing:.05em">${dateStr}</div>
        </div>
      </div>
    </div>`;
}

/* ──────────────────────────────────────────────
   RENDER REVIEWS TO GRID
   ────────────────────────────────────────────── */
const PAGE_SIZE = 9;
let allReviews  = [];
let visibleCount = PAGE_SIZE;

function renderReviews() {
  const container = document.getElementById('rg');
  if (!container) return;

  const slice = allReviews.slice(0, visibleCount);
  container.innerHTML = slice.map((r, i) => buildReviewCard(r, i === 0 && r._isNew)).join('');

  // Stagger-reveal
  container.querySelectorAll('.rt').forEach((el, i) => {
    setTimeout(() => el.classList.add('vs'), i * 70);
  });

  // Cursor interactivity for new cards
  container.querySelectorAll('.rt,.tm').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('ch'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('ch'));
  });

  // Load-more button
  const lmw = document.getElementById('load-more-wrap');
  if (lmw) lmw.style.display = allReviews.length > visibleCount ? '' : 'none';

  // Empty state
  const noRv = document.getElementById('no-reviews');
  if (noRv) noRv.style.display = allReviews.length === 0 ? 'block' : 'none';
}

function loadMore() {
  visibleCount += PAGE_SIZE;
  renderReviews();
  // Re-apply any active filter
  const activeBtn = document.querySelector('.fbt.act');
  if (activeBtn) {
    const type = activeBtn.dataset.filter;
    if (type !== 'all') applyFilter(type, activeBtn, false);
  }
}

/* ──────────────────────────────────────────────
   LOAD LIVE REVIEWS FROM FIREBASE
   ────────────────────────────────────────────── */
function loadLiveReviews() {
  if (!firebaseReady) {
    // Use sample data
    allReviews = [...SAMPLE_REVIEWS];
    const stats = computeStats(allReviews);
    updateStatsUI(stats);
    updateFilterCounts(allReviews);
    renderReviews();
    return;
  }

  db.ref('reviews').orderByChild('timestamp').on('value', snapshot => {
    const reviews = [];
    snapshot.forEach(child => {
      reviews.push({ id: child.key, ...child.val() });
    });
    reviews.reverse(); // newest first

    allReviews = reviews.length > 0 ? reviews : [...SAMPLE_REVIEWS];
    if (reviews.length === 0) {
      console.log('No Firebase reviews yet — showing sample reviews');
    }

    const stats = computeStats(allReviews);
    updateStatsUI(stats);
    updateFilterCounts(allReviews);
    visibleCount = PAGE_SIZE;
    renderReviews();
  });
}

/* ──────────────────────────────────────────────
   FILTER REVIEWS
   ────────────────────────────────────────────── */
function applyFilter(type, btn, updateBtn = true) {
  if (updateBtn) {
    document.querySelectorAll('.fbt').forEach(b => b.classList.remove('act'));
    btn.classList.add('act');
  }

  document.querySelectorAll('.rt').forEach(tile => {
    let show = false;
    if (type === 'all')   show = true;
    else if (type === 'photo') show = tile.dataset.t === 'photo';
    else show = tile.dataset.s === type;

    if (show) {
      tile.classList.remove('hd');
      tile.style.display = '';
      requestAnimationFrame(() => tile.classList.add('vs'));
    } else {
      tile.classList.add('hd');
      tile.classList.remove('vs');
      setTimeout(() => { if (tile.classList.contains('hd')) tile.style.display = 'none'; }, 300);
    }
  });

  // Show empty state if all hidden
  const visible = [...document.querySelectorAll('.rt')].filter(t => !t.classList.contains('hd'));
  const noRv = document.getElementById('no-reviews');
  if (noRv) noRv.style.display = visible.length === 0 ? 'block' : 'none';
}

function flt(type, btn) {
  applyFilter(type, btn, true);
}

/* ──────────────────────────────────────────────
   PHOTO LIGHTBOX
   ────────────────────────────────────────────── */
function lbxOpen(src) {
  const lbx = document.getElementById('lbx');
  const img  = document.getElementById('lbx-img');
  if (!lbx || !img) return;
  img.src = src;
  lbx.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function lbxClose() {
  const lbx = document.getElementById('lbx');
  if (!lbx) return;
  lbx.classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    lbxClose();
    rvCloseSidebar();
  }
});

/* ──────────────────────────────────────────────
   STAR RATING WIDGET
   ────────────────────────────────────────────── */
let rat = 0;
function initStarWidget() {
  const sbs = document.querySelectorAll('.sb');
  function us(v, hv) {
    sbs.forEach((s, i) => {
      s.classList.toggle('lit', i < v && !hv);
      s.classList.toggle('hv',  i < v &&  hv);
    });
  }
  sbs.forEach(s => {
    const v = +s.dataset.v;
    s.addEventListener('click',      () => { rat = v; document.getElementById('rr').value = v; us(v, false); });
    s.addEventListener('mouseenter', () => us(v, true));
    s.addEventListener('mouseleave', () => us(rat, false));
  });
}

/* ──────────────────────────────────────────────
   FILE UPLOAD PREVIEW
   ────────────────────────────────────────────── */
let ups = [];
function hf(files) {
  Array.from(files).forEach(file => {
    if (!['image/', 'video/'].some(t => file.type.startsWith(t))) return;
    if (file.size > 25 * 1024 * 1024) { alert('Max file size is 25MB'); return; }
    ups.push(file);
    const r = new FileReader();
    r.onload = e => {
      const pg  = document.getElementById('pg');
      const it  = document.createElement('div');
      it.className = 'pi';
      const idx = ups.length - 1;
      const tg  = file.type.startsWith('image/')
        ? `<img src="${e.target.result}" alt="preview">`
        : `<video src="${e.target.result}" style="width:100%;height:100%;object-fit:cover"></video>`;
      it.innerHTML = tg + `<button class="pr" onclick="rf(${idx},this.parentElement)">&#10005;</button>`;
      pg.appendChild(it);
    };
    r.readAsDataURL(file);
  });
}
function rf(idx, el) { ups[idx] = null; el.remove(); }

function initUpload() {
  const uz = document.getElementById('uz');
  const mi = document.getElementById('mi');
  if (!uz || !mi) return;
  mi.onchange = () => hf(mi.files);
  uz.addEventListener('dragover',  e => { e.preventDefault(); uz.classList.add('dg'); });
  uz.addEventListener('dragleave', () => uz.classList.remove('dg'));
  uz.addEventListener('drop', e => {
    e.preventDefault();
    uz.classList.remove('dg');
    hf(e.dataTransfer.files);
  });
}

/* ──────────────────────────────────────────────
   SUBMIT REVIEW
   ────────────────────────────────────────────── */
async function sub() {
  const n       = document.getElementById('rn').value.trim();
  const t       = document.getElementById('rt').value.trim();
  const r       = +document.getElementById('rr').value;
  const prop    = document.getElementById('rp').value.trim();
  const consent = document.getElementById('rc').checked;
  const se      = document.getElementById('se');
  se.style.display = 'none';

  if (!n)       { sE('Please enter your name.'); return; }
  if (!r)       { sE('Please select a star rating.'); return; }
  if (!t)       { sE('Please write your review.'); return; }
  if (!consent) { sE('Please give consent to display your review.'); return; }

  const btn = document.getElementById('sbb');
  btn.disabled = true;
  btn.innerHTML = 'Submitting&hellip;';

  const photoFile = ups.find(Boolean);
  let photoURL = '';
  if (photoFile && photoFile.type.startsWith('image/') && photoFile.size < 2 * 1024 * 1024) {
    photoURL = await new Promise(res => {
      const reader = new FileReader();
      reader.onload = e => res(e.target.result);
      reader.readAsDataURL(photoFile);
    });
  }

  const reviewData = {
    name: n, text: t, rating: r, property: prop,
    photoURL, timestamp: Date.now(), approved: true, _isNew: true
  };

  if (firebaseReady) {
    try {
      await db.ref('reviews').push(reviewData);
      document.getElementById('rfm').style.display = 'none';
      document.getElementById('smsg').style.display = 'block';
    } catch (err) {
      sE('Could not save review. Please try again or WhatsApp us at +91 91981 97668.');
      btn.disabled = false;
      btn.innerHTML = 'Submit Review →';
    }
  } else {
    // Fallback: show locally
    allReviews.unshift({ ...reviewData, id: 'local-' + Date.now() });
    const stats = computeStats(allReviews);
    updateStatsUI(stats);
    updateFilterCounts(allReviews);
    renderReviews();
    document.getElementById('rfm').style.display = 'none';
    document.getElementById('smsg').style.display = 'block';
  }
}

function sE(m) {
  const e = document.getElementById('se');
  e.textContent = m;
  e.style.display = 'block';
}

/* ──────────────────────────────────────────────
   SIDEBAR
   ────────────────────────────────────────────── */
function rvOpenSidebar() {
  document.getElementById('rv-sidebar').classList.add('open');
  document.getElementById('rv-sb-overlay').classList.add('open');
  document.getElementById('rv-ham').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function rvCloseSidebar() {
  document.getElementById('rv-sidebar').classList.remove('open');
  document.getElementById('rv-sb-overlay').classList.remove('open');
  document.getElementById('rv-ham').classList.remove('open');
  document.body.style.overflow = '';
}
function rvSbNav() { rvCloseSidebar(); return true; }

/* ──────────────────────────────────────────────
   CURSOR
   ────────────────────────────────────────────── */
function initCursor() {
  const cd = document.getElementById('cd'), cr = document.getElementById('cr');
  if (!cd || !cr) return;
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cd.style.left = mx + 'px'; cd.style.top = my + 'px';
  });
  (function a() {
    rx += (mx - rx) * .1; ry += (my - ry) * .1;
    cr.style.left = rx + 'px'; cr.style.top = ry + 'px';
    requestAnimationFrame(a);
  })();
  document.querySelectorAll('a,button,.wi,.fbt,.load-more-btn').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('ch'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('ch'));
  });
  document.addEventListener('mousedown', () => document.body.classList.add('ca'));
  document.addEventListener('mouseup',   () => document.body.classList.remove('ca'));
}

/* ──────────────────────────────────────────────
   SCROLL EFFECTS
   ────────────────────────────────────────────── */
function initScroll() {
  // Progress bar
  window.addEventListener('scroll', () => {
    const pb = document.getElementById('pb');
    if (pb) pb.style.width = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100) + '%';
  }, { passive: true });

  // Nav scroll
  const nv = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    if (nv) nv.classList.toggle('sc', window.scrollY > 40);
  }, { passive: true });
}

/* ──────────────────────────────────────────────
   INTERSECTION OBSERVERS
   ────────────────────────────────────────────── */
function initObservers() {
  // Generic reveal
  const obs = new IntersectionObserver(
    es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('on'); }),
    { threshold: .07, rootMargin: '0px 0px -36px 0px' }
  );
  document.querySelectorAll('.rv,.rvr').forEach(el => obs.observe(el));

  // Attribute rating bars (in form section)
  const bob = new IntersectionObserver(
    es => es.forEach(e => {
      if (e.isIntersecting) {
        document.querySelectorAll('.rbf').forEach((b, i) =>
          setTimeout(() => b.style.width = b.dataset.w + '%', i * 100 + 200)
        );
        bob.unobserve(e.target);
      }
    }),
    { threshold: .3 }
  );
  const rc2 = document.querySelector('.rc');
  if (rc2) bob.observe(rc2);

  // Distribution panel bars
  const dpObs = new IntersectionObserver(
    es => es.forEach(e => {
      if (e.isIntersecting) { animateDistBars(); dpObs.unobserve(e.target); }
    }),
    { threshold: .2 }
  );
  const sdp = document.getElementById('sdp');
  if (sdp) dpObs.observe(sdp);
}

/* ──────────────────────────────────────────────
   HERO ENTRANCE ANIMATION
   ────────────────────────────────────────────── */
function initHero() {
  setTimeout(() => {
    ['hr', 'hl'].forEach(id => { const e = document.getElementById(id); if (e) e.classList.add('in'); });
    setTimeout(() => {
      ['ht1', 'ht2'].forEach(id => { const e = document.getElementById(id); if (e) e.classList.add('in'); });
      setTimeout(() => {
        ['hrb', 'hsb', 'hsc'].forEach(id => { const e = document.getElementById(id); if (e) e.classList.add('in'); });
      }, 200);
    }, 150);
  }, 80);
}

/* ──────────────────────────────────────────────
   INIT
   ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initHero();
  initCursor();
  initScroll();
  initObservers();
  initStarWidget();
  initUpload();
  loadLiveReviews();
});