/* ============================================================
   Destination Magna Grecia — base interactions
   (GSAP/Lenis scroll-storytelling layered in at polish stage)
   ============================================================ */

(function () {
  'use strict';

  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');
  const progress = document.getElementById('scrollProgress');
  const langToast = document.getElementById('langToast');

  /* ---- Nav + progress. Cache scroll height (avoid per-frame layout reads) ---- */
  let maxScroll = 1, isSolid = false;
  function measure() { maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight); }
  function onScroll() {
    const y = window.scrollY;
    const solid = y > 80;
    if (solid !== isSolid) { nav.classList.toggle('solid', solid); isSolid = solid; }
    progress.style.transform = 'scaleX(' + Math.min(1, y / maxScroll) + ')';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('load', measure);
  measure(); onScroll();

  /* ---- Hero video: only decode while in view (offscreen playback = scroll jank) ---- */
  const heroVideo = document.querySelector('.hero__video');
  if (heroVideo && 'IntersectionObserver' in window) {
    const vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { heroVideo.play().catch(function () {}); }
        else { heroVideo.pause(); }
      });
    }, { threshold: 0.05 });
    vio.observe(heroVideo);
  }

  /* ---- Mobile menu ---- */
  burger.addEventListener('click', function () {
    const open = mobileMenu.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  mobileMenu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      mobileMenu.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* ---- Language switcher (demo: EN only) ---- */
  let toastTimer;
  document.querySelectorAll('[data-lang]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.nav__lang button, .footer__lang button')
        .forEach(function (b) { b.classList.toggle('active', b.dataset.lang === btn.dataset.lang); });
      if (btn.dataset.lang !== 'EN') {
        langToast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { langToast.classList.remove('show'); }, 3000);
      }
    });
  });

  /* ---- Contact form (demo: no real submit) ---- */
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    form.style.display = 'none';
    success.classList.add('show');
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = !reduce && window.gsap && window.ScrollTrigger;

  /* ============================================================
     Reduced motion OR no GSAP → reveal everything immediately
     (IntersectionObserver fallback keeps the soft fade)
     ============================================================ */
  if (reduce) {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
    return;
  }

  if (!hasGSAP) {
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
      document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
    } else {
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
    }
    return;
  }

  /* ============================================================
     GSAP scroll-storytelling (Aman-style)
     ============================================================ */
  gsap.registerPlugin(ScrollTrigger);
  // Native scroll (Lenis removed — smooth-scroll library was the main jank/lag source).

  /* ---- Neutralise CSS reveal transition; GSAP drives opacity/transform ---- */
  gsap.set('.reveal', { clearProps: 'transition' });
  document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  gsap.set('.reveal', { opacity: 0, y: 40 });

  /* Hero entrance animation removed — text + video render static immediately. */

  /* ---- Reveal-on-scroll, batched + staggered ---- */
  ScrollTrigger.batch('.reveal', {
    start: 'top 85%',
    onEnter: function (els) {
      gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out', stagger: 0.12, overwrite: true });
    },
    once: true
  });

  /* Parallax removed — scrub ScrollTrigger updated every scroll frame (jank). */

  /* ---- Refresh once images settle ---- */
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
