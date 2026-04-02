/* CURSOR */
const cd = document.getElementById('cd');
const cr = document.getElementById('cr');
document.addEventListener('mousemove', (e) => {
  cd.style.left = e.clientX + 'px';
  cd.style.top = e.clientY + 'px';
  setTimeout(() => {
    cr.style.left = e.clientX + 'px';
    cr.style.top = e.clientY + 'px';
  }, 55);
});
document.querySelectorAll('a,button,.pc,.ddot,.chip,.intro-curtain-btn').forEach((el) => {
  el.addEventListener('mouseenter', () => {
    cr.style.transform = 'translate(-50%,-50%) scale(2)';
    cr.style.borderColor = 'var(--coral)';
  });
  el.addEventListener('mouseleave', () => {
    cr.style.transform = 'translate(-50%,-50%) scale(1)';
  });
});

/* INTRO — cortina + janela (GSAP, sem ScrollTrigger) */
const navEl = document.getElementById('nav');
const mainEl = document.getElementById('main');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  document.documentElement.classList.add('reduce-motion');
  document.documentElement.classList.remove('intro-active');
  document.getElementById('introCurtain')?.remove();
  mainEl.classList.add('show');
  navEl.classList.add('show');
}

let typedStarted = false;
function startTyped() {
  if (typedStarted) return;
  typedStarted = true;
  setTimeout(type, prefersReducedMotion ? 200 : 500);
}

/** Cortina fixa: “janela” escala + painel sobe — sem máscara, sem ScrollTrigger, funciona em file:// */
let introEntering = false;
function playIntroEnter() {
  if (introEntering || !document.documentElement.classList.contains('intro-active')) return;
  const curtain = document.getElementById('introCurtain');
  if (!curtain) return;
  introEntering = true;

  const win = curtain.querySelector('.intro-curtain-window');
  const leftBits = document.querySelectorAll('#hero .hero-left > *');
  const rightCol = document.querySelector('#hero .hero-right');

  function done() {
    curtain.remove();
    document.documentElement.classList.remove('intro-active');
    document.documentElement.classList.add('intro-done');
    introEntering = false;
    window.scrollTo(0, 0);
    revealAll();
  }

  if (typeof gsap === 'undefined') {
    done();
    navEl.classList.add('show');
    mainEl.classList.add('show');
    leftBits.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    if (rightCol) {
      rightCol.style.opacity = '1';
      rightCol.style.transform = 'none';
    }
    startTyped();
    return;
  }

  const tl = gsap.timeline({ onComplete: done });
  if (win) {
    gsap.set(win, { transformOrigin: '50% 50%', force3D: true });
    tl.to(win, { scale: 24, opacity: 0, duration: 0.88, ease: 'power2.in' }, 0);
  }
  tl.to(curtain, { yPercent: -100, duration: 1.05, ease: 'power3.inOut' }, 0.1);
  tl.add(() => {
    navEl.classList.add('show');
    mainEl.classList.add('show');
    startTyped();
  }, 0.2);
  tl.to(leftBits, { opacity: 1, y: 0, stagger: 0.06, duration: 0.52, ease: 'power2.out' }, 0.38);
  if (rightCol) tl.to(rightCol, { opacity: 1, y: 0, duration: 0.52, ease: 'power2.out' }, 0.42);
}

function initIntroCurtain() {
  if (prefersReducedMotion) {
    startTyped();
    return;
  }
  const btn = document.getElementById('introEnterBtn');
  btn?.addEventListener('click', () => playIntroEnter());

  window.addEventListener(
    'wheel',
    (e) => {
      if (!document.documentElement.classList.contains('intro-active')) return;
      if (e.deltaY <= 12) return;
      e.preventDefault();
      playIntroEnter();
    },
    { passive: false }
  );
}

function onScrollReveal() {
  revealAll();
}

window.addEventListener('scroll', onScrollReveal, { passive: true });

/* REVEAL */
function revealAll() {
  document.querySelectorAll('.rev').forEach((el) => {
    if (el.getBoundingClientRect().top < window.innerHeight - 60) el.classList.add('vis');
  });
}

/* DRONE SLIDES + entrada “em voo” ao entrar na secção */
const dslides = document.querySelectorAll('.dslide');
const ddots = document.querySelectorAll('.ddot');
let cur = 0;
let dtimer;

function flyDroneForSlide(index) {
  const section = document.getElementById('drones');
  if (!section?.classList.contains('drones-revealed') || prefersReducedMotion) return;
  const img = dslides[index]?.querySelector('.drone-real-img');
  if (!img) return;
  if (typeof gsap === 'undefined') {
    img.style.opacity = '1';
    return;
  }
  const fromNeo = index === 0;
  gsap.fromTo(
    img,
    {
      x: fromNeo ? 90 : -90,
      y: 48,
      opacity: 0,
      rotation: fromNeo ? -8 : 7,
      scale: 0.84,
    },
    { x: 0, y: 0, opacity: 1, rotation: 0, scale: 1, duration: 0.92, ease: 'power2.out' }
  );
}

function initDroneSectionReveal() {
  const section = document.getElementById('drones');
  if (!section) return;
  if (prefersReducedMotion) {
    section.classList.add('drones-revealed');
    return;
  }
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        section.classList.add('drones-revealed');
        flyDroneForSlide(cur);
        obs.disconnect();
      });
    },
    { threshold: 0.16, rootMargin: '0px 0px -10% 0px' }
  );
  obs.observe(section);
}

function goSlide(n) {
  dslides[cur].classList.remove('on');
  ddots[cur].classList.remove('on');
  cur = n;
  dslides[cur].classList.add('on');
  ddots[cur].classList.add('on');
  flyDroneForSlide(cur);
}
ddots.forEach((d) =>
  d.addEventListener('click', () => {
    clearInterval(dtimer);
    goSlide(+d.dataset.i);
    dtimer = setInterval(() => goSlide((cur + 1) % dslides.length), 5000);
  })
);
dtimer = setInterval(() => goSlide((cur + 1) % dslides.length), 5000);

/* TYPED */
const roles = [
  'Desenvolvedor Full Stack',
  'Videomaker Profissional',
  'Piloto de Drone',
  'Web Designer',
  'Dev React · Next.js',
];
let ri = 0;
let ci = 0;
let del = false;
const tel = document.getElementById('typed');
function type() {
  if (!tel) return;
  const w = roles[ri];
  if (del) {
    tel.textContent = w.substring(0, ci--);
    if (ci < 0) {
      del = false;
      ri = (ri + 1) % roles.length;
      ci = 0;
      setTimeout(type, 500);
      return;
    }
  } else {
    tel.textContent = w.substring(0, ++ci);
    if (ci === w.length) {
      del = true;
      setTimeout(type, 2000);
      return;
    }
  }
  setTimeout(type, del ? 46 : 82);
}

/* TECH TICKER */
const skills = [
  { l: 'HTML5', s: `<svg viewBox="0 0 32 32"><polygon fill="#e34c26" points="4,0 28,0 25.7,26 16,29 6.3,26"/><polygon fill="#ff6634" points="16,27.4 23.8,25.1 25.7,4 16,4"/><path fill="#fff" d="M16 13h-4.6l-.3-3.4H16V6.2H7.8l.9 10H16zm0 9.8l-.1.1-3.8-1-.2-2.7H9l.5 5.4 6.5 1.8z"/><path fill="#ebebeb" d="M15.9 13H16v3.4h4.2l-.4 4.4-3.8 1v3.5l6.5-1.8.7-8.5H15.9z"/></svg>` },
  { l: 'CSS3', s: `<svg viewBox="0 0 32 32"><polygon fill="#264de4" points="4,0 28,0 25.7,26 16,29 6.3,26"/><polygon fill="#2965f1" points="16,27.4 23.8,25.1 25.7,4 16,4"/><path fill="#ebebeb" d="M9.5 13l.4 3.4H16V13zm-1-3.4H16V6.1H7.1zm7.5 12.8l-.1.1-3.8-1-.2-2.7H9l.5 5.4 6.5 1.8z"/><path fill="#fff" d="M16 13v3.4h4.1l-.4 4.4-3.8 1v3.5l6.5-1.8.7-8.5zm0-6.9v3.5h7.8l.3-3.5z"/></svg>` },
  { l: 'JavaScript', s: `<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#f7df1e"/><path fill="#323330" d="M6 26.2l2.9-1.8c.6 1 1.1 1.8 2.3 1.8 1.1 0 1.8-.4 1.8-2.1V14h3.5v10.2c0 3.5-2 5.1-5 5.1-2.7 0-4.2-1.4-5-3.1zm12.7-.4l2.9-1.8c.8 1.3 1.8 2.2 3.6 2.2 1.5 0 2.5-.7 2.5-1.8 0-1.2-.9-1.6-2.5-2.3l-.9-.4c-2.5-1.1-4.2-2.4-4.2-5.2 0-2.6 2-4.6 5.1-4.6 2.2 0 3.8.8 5 2.8l-2.8 1.9c-.6-1.1-1.2-1.5-2.2-1.5-1 0-1.7.6-1.7 1.5 0 1.1.7 1.5 2.2 2.2l.9.4c3 1.3 4.7 2.6 4.7 5.5 0 3.2-2.5 4.9-5.8 4.9-3.2 0-5.3-1.5-6.3-3.8z"/></svg>` },
  { l: 'React', s: `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="3.2" fill="#61dafb"/><ellipse cx="16" cy="16" rx="14" ry="5.5" fill="none" stroke="#61dafb" stroke-width="1.4"/><ellipse cx="16" cy="16" rx="14" ry="5.5" fill="none" stroke="#61dafb" stroke-width="1.4" transform="rotate(60 16 16)"/><ellipse cx="16" cy="16" rx="14" ry="5.5" fill="none" stroke="#61dafb" stroke-width="1.4" transform="rotate(120 16 16)"/></svg>` },
  { l: 'Next.js', s: `<svg viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#000"/><path fill="#fff" d="M10 8h3v10.5L22.5 8H26L14 27h-2.5L18 17.5 10 8z"/></svg>` },
  { l: 'Python', s: `<svg viewBox="0 0 32 32"><path fill="#3776ab" d="M16 2c-3.9 0-7 1.3-7 4v3h7v1H6C3 10 2 12.5 2 16s1 6 4 6h2v-3.5c0-3 2.2-4.5 4-4.5h8c2 0 4-1.5 4-4V6c0-2.5-3-4-8-4zm-2 2.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z"/><path fill="#ffd343" d="M23 14h-2v3.5c0 3-2.2 4.5-4 4.5H9c-2 0-4 1.5-4 4v4c0 2.5 3 4 8 4s7-1.3 7-4v-3H13v-1h7c3 0 4-2.5 4-6s-1-6-4-6zm-5 11.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z"/></svg>` },
  { l: 'Node.js', s: `<svg viewBox="0 0 32 32"><path fill="#68a063" d="M16 2L3 9.5v13L16 30l13-7.5v-13L16 2zm0 4.3l8 4.6v9.2l-8 4.6-8-4.6V10.9l8-4.6z"/></svg>` },
  { l: 'ASP.NET', s: `<svg viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#512bd4"/><path fill="#fff" d="M8 22V10h3l4 7.5 4-7.5h3v12h-3v-7.5L15.5 18h-3L9 14.5V22H8zm15-2a1.5 1.5 0 110 3 1.5 1.5 0 010-3z"/></svg>` },
  { l: 'MySQL', s: `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#4479a1"/><path fill="#fff" d="M8 22V10h6c2.2 0 4 1.5 4 4s-1.8 4-4 4h-3v4H8zm3-7h3c.8 0 1.5-.5 1.5-1.5S14.8 12 14 12h-3v3zm11 7l-4-12h3l2.5 8 2.5-8h3l-4 12h-3z"/></svg>` },
  { l: 'Bootstrap', s: `<svg viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#7952b3"/><path fill="#fff" d="M9 8h8.5c2.1 0 3.7.5 4.7 1.4.7.7 1.1 1.6 1.1 2.7 0 1.9-1 3-2.5 3.5 1.9.5 3.2 1.8 3.2 3.8 0 2.6-2.1 4.2-5.4 4.2H9V8zm7.8 6.5c1.4 0 2.3-.6 2.3-1.8s-.8-1.8-2.2-1.8h-4.4v3.6h4.3zm.6 6.6c1.6 0 2.5-.7 2.5-2s-.9-2-2.6-2h-4.8v4h4.9z"/></svg>` },
  { l: 'WordPress', s: `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#21759b"/><path fill="#fff" d="M3.5 16C3.5 9.1 9.1 3.5 16 3.5c3.7 0 7 1.5 9.4 3.9L5.1 21.4C4.1 19.7 3.5 17.9 3.5 16zm12.5 13c-3.6 0-6.9-1.4-9.3-3.6l9.7-13.1 5.4 14.9C20.4 28.4 18.3 29 16 29zm3.4-1l-5.7-15.6h11.1c.1.5.2 1 .2 1.6 0 5.5-3.5 10.3-5.6 14z"/></svg>` },
  { l: 'Premiere', s: `<svg viewBox="0 0 32 32"><rect width="32" height="32" rx="4" fill="#0a0013"/><path fill="#ea77ff" d="M8 8h5.2c3.4 0 5.8 2.2 5.8 6s-2.4 6-5.8 6H11v5H8V8zm3 3v6h2c1.8 0 2.8-1.1 2.8-3s-1-3-2.8-3H11z"/></svg>` },
  { l: 'After FX', s: `<svg viewBox="0 0 32 32"><rect width="32" height="32" rx="4" fill="#0d0025"/><path fill="#9999ff" d="M8 22l5-14h3l5 14h-3l-1-3h-5l-1 3H8zm4.5-6h3.2L14 10l-1.5 6zm8.5 6V8h3v14h-3z"/></svg>` },
  { l: 'Drone', s: `<svg viewBox="0 0 32 32"><circle cx="8" cy="8" r="5" fill="none" stroke="#e8622a" stroke-width="1.5" opacity=".5"/><circle cx="24" cy="8" r="5" fill="none" stroke="#e8622a" stroke-width="1.5" opacity=".5"/><circle cx="8" cy="24" r="5" fill="none" stroke="#e8622a" stroke-width="1.5" opacity=".5"/><circle cx="24" cy="24" r="5" fill="none" stroke="#e8622a" stroke-width="1.5" opacity=".5"/><line x1="8" y1="8" x2="13" y2="13" stroke="#555" stroke-width="1.5"/><line x1="24" y1="8" x2="19" y2="13" stroke="#555" stroke-width="1.5"/><line x1="8" y1="24" x2="13" y2="19" stroke="#555" stroke-width="1.5"/><line x1="24" y1="24" x2="19" y2="19" stroke="#555" stroke-width="1.5"/><rect x="12" y="12" width="8" height="8" rx="2" fill="#e8622a" opacity=".6"/></svg>` },
  { l: 'Git', s: `<svg viewBox="0 0 32 32"><path fill="#f05032" d="M30.1 14.6L17.4 1.9c-.8-.8-2-.8-2.8 0L12 4.5l3.4 3.4c.8-.3 1.8-.1 2.4.5.7.7.8 1.7.4 2.5l3.3 3.3c.8-.4 1.8-.3 2.5.4.9.9.9 2.4 0 3.3-.9.9-2.4.9-3.3 0-.7-.7-.8-1.8-.4-2.6L17 12.1v8.5c.3.1.5.3.7.5.9.9.9 2.4 0 3.3-.9.9-2.4.9-3.3 0-.9-.9-.9-2.4 0-3.3.2-.2.5-.4.8-.5v-8.6c-.3-.1-.6-.3-.8-.5-.7-.7-.8-1.8-.4-2.6L10.6 5.5 1.9 14.2c-.8.8-.8 2 0 2.8L14.6 29.7c.8.8 2 .8 2.8 0l12.7-12.7c.8-.7.8-2 0-2.4z"/></svg>` },
];
const sst = document.getElementById('sst');
[...skills, ...skills].forEach((sk) => {
  const d = document.createElement('div');
  d.className = 'sit';
  d.innerHTML = `${sk.s}<span>${sk.l}</span>`;
  sst.appendChild(d);
});

initIntroCurtain();
initDroneSectionReveal();
revealAll();

const dronesVideo = document.querySelector('.drones-video');
if (dronesVideo && !prefersReducedMotion) {
  dronesVideo.play().catch(() => {});
}

const portfolioAereoVideo = document.getElementById('portfolioAereoVideo');
if (portfolioAereoVideo && !prefersReducedMotion) {
  portfolioAereoVideo.play().catch(() => {});
}

/* Portfólio — cards .pc--roster: slideshow + lightbox (imagens / vídeos) */
const rosterCarouselTimers = new WeakMap();

function stopRosterCarousel(card) {
  const t = rosterCarouselTimers.get(card);
  if (t) clearInterval(t);
  rosterCarouselTimers.delete(card);
}

function startRosterCarousel(card) {
  stopRosterCarousel(card);
  if (prefersReducedMotion || document.body.classList.contains('mr-open')) return;
  const slides = card.querySelectorAll('.pg-slide');
  if (slides.length < 2) return;
  const id = setInterval(() => {
    const on = card.querySelector('.pg-slide.on');
    if (!on) return;
    const list = [...slides];
    const i = list.indexOf(on);
    const j = (i + 1) % list.length;
    on.classList.remove('on');
    list[j].classList.add('on');
  }, 4400);
  rosterCarouselTimers.set(card, id);
}

function stopAllRosterCarousels() {
  document.querySelectorAll('.pc--roster').forEach((c) => stopRosterCarousel(c));
}

function startAllRosterCarousels() {
  if (document.body.classList.contains('mr-open')) return;
  document.querySelectorAll('.pc--roster').forEach((c) => startRosterCarousel(c));
}

function initMediaRoster() {
  const root = document.getElementById('mediaRoster');
  if (!root) return;

  const mrImg = root.querySelector('.mr-img');
  const mrVideo = root.querySelector('.mr-video');
  const strip = root.querySelector('.mr-strip');
  const titleEl = document.getElementById('mediaRosterTitle');
  if (!mrImg || !mrVideo || !strip || !titleEl) return;

  let lastRosterCard = null;
  const thumbButtons = [];

  function showSlideInModal(slide, thumbs, index) {
    thumbs.forEach((b, i) => {
      b.classList.toggle('is-picked', i === index);
      b.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });
    const type = slide.dataset.type === 'video' ? 'video' : 'image';

    if (type === 'video') {
      mrImg.setAttribute('hidden', '');
      mrVideo.removeAttribute('hidden');
      mrVideo.pause();
      mrVideo.innerHTML = '';
      const src = slide.dataset.src || slide.querySelector('source')?.getAttribute('src');
      if (src) {
        const s = document.createElement('source');
        s.src = src;
        s.type = 'video/mp4';
        mrVideo.appendChild(s);
      }
      mrVideo.load();
      mrVideo.play().catch(() => {});
    } else {
      mrVideo.pause();
      mrVideo.innerHTML = '';
      mrVideo.setAttribute('hidden', '');
      const simg = slide.querySelector('img');
      mrImg.removeAttribute('hidden');
      if (simg) {
        mrImg.src = simg.currentSrc || simg.src;
        mrImg.alt = simg.alt || '';
      }
    }

    const t = thumbs[index];
    if (t) {
      t.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }

  function closeModal() {
    mrVideo.pause();
    mrVideo.innerHTML = '';
    root.hidden = true;
    document.body.classList.remove('mr-open');
    thumbButtons.length = 0;
    startAllRosterCarousels();
    lastRosterCard?.focus();
    lastRosterCard = null;
  }

  function openFromCard(card) {
    lastRosterCard = card;
    const label = card.getAttribute('data-roster-label') || 'Galeria';
    titleEl.textContent = label;

    const slides = [...card.querySelectorAll('.pg-slide')];
    strip.innerHTML = '';
    thumbButtons.length = 0;

    slides.forEach((slide, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mr-thumb';
      btn.setAttribute('role', 'option');
      btn.setAttribute('aria-selected', 'false');

      const skin = document.createElement('span');
      skin.className = 'mr-thumb-skin';
      const imgwrap = document.createElement('span');
      imgwrap.className = 'mr-thumb-imgwrap';

      const stype = slide.dataset.type === 'video' ? 'video' : 'image';
      if (stype === 'video') {
        btn.classList.add('mr-thumb-vid');
        const poster = slide.dataset.poster || slide.querySelector('video')?.getAttribute('poster');
        const ti = document.createElement('img');
        ti.alt = '';
        if (poster) ti.src = poster;
        imgwrap.appendChild(ti);
        const play = document.createElement('span');
        play.className = 'mr-thumb-play';
        play.innerHTML = '<i class="fas fa-play" aria-hidden="true"></i>';
        imgwrap.appendChild(play);
      } else {
        const simg = slide.querySelector('img');
        const ti = document.createElement('img');
        ti.alt = '';
        if (simg) ti.src = simg.currentSrc || simg.src;
        imgwrap.appendChild(ti);
      }

      skin.appendChild(imgwrap);
      btn.appendChild(skin);

      btn.addEventListener('click', () => showSlideInModal(slide, thumbButtons, idx));
      strip.appendChild(btn);
      thumbButtons.push(btn);
    });

    const active = card.querySelector('.pg-slide.on') || slides[0];
    const activeIndex = Math.max(0, slides.indexOf(active));
    showSlideInModal(slides[activeIndex], thumbButtons, activeIndex);

    stopAllRosterCarousels();
    card.querySelectorAll('video').forEach((v) => v.pause());

    root.hidden = false;
    document.body.classList.add('mr-open');
    root.querySelector('.mr-x')?.focus();
  }

  root.querySelectorAll('[data-mr-close]').forEach((el) => {
    el.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !root.hidden) {
      e.preventDefault();
      closeModal();
    }
  });

  document.querySelectorAll('.pc--roster').forEach((card) => {
    startRosterCarousel(card);
    card.addEventListener('mouseenter', () => stopRosterCarousel(card));
    card.addEventListener('mouseleave', () => {
      if (!document.body.classList.contains('mr-open')) startRosterCarousel(card);
    });
    card.addEventListener('click', (e) => {
      if (e.button !== 0) return;
      openFromCard(card);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openFromCard(card);
      }
    });
  });
}

initMediaRoster();
