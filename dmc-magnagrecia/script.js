/* ============================================================
   Destination Magna Grecia — Demo v2 interactions
   Progressive enhancement: site fully works without GSAP/Lenis.
   - Nav solidify + scroll progress
   - Mobile menu
   - Word-split + reveal (GSAP ScrollTrigger, IO fallback)
   - Lenis smooth scroll
   - Floating bubble (after 50% scroll)
   - Chat popup (open/close/ESC/backdrop, pills, context pre-fill, submit)
   - Contact form (demo submit)
   - Language switcher toast (UI-only)
   ============================================================ */
(function () {
  'use strict';
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Word split ---------- */
  $$('[data-split]').forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(function (w) { return '<span class="word">' + w + '</span>'; }).join(' ');
  });

  /* ---------- Nav: solidify + scroll progress ---------- */
  var nav = $('#nav');
  var progress = $('#scrollProgress');
  var hero = $('#hero');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var heroH = hero ? hero.offsetHeight : window.innerHeight;
    if (nav) nav.classList.toggle('is-solid', y > heroH - 120);
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    }
    // floating bubble after 50% scroll
    var max2 = document.documentElement.scrollHeight - window.innerHeight;
    if (bubble) bubble.classList.toggle('is-visible', max2 > 0 && (y / max2) > 0.5);
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  var burger = $('#burger');
  var mobileMenu = $('#mobileMenu');
  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('is-open');
    nav.classList.remove('is-open-menu');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  if (burger) {
    burger.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('is-open');
      nav.classList.toggle('is-open-menu', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    $$('#mobileMenu a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  }

  /* ---------- Language switcher (UI-only) ---------- */
  var toast = $('#toast');
  var toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 2600);
  }
  $$('[data-lang]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var lang = btn.getAttribute('data-lang');
      if (lang === 'EN') return;
      showToast(lang + ' translation coming soon — demo is in English.');
    });
  });

  /* ---------- Chat popup ---------- */
  var chat = $('#chat');
  var chatForm = $('#chatForm');
  var chatSuccess = $('#chatSuccess');
  var chatMsg = $('#ch-msg');
  var bubble = $('#chatBubble');
  var lastFocus = null;
  var autoCloseTimer;

  function openChat(context) {
    if (!chat) return;
    lastFocus = document.activeElement;
    // reset to form view
    if (chatForm) chatForm.hidden = false;
    if (chatSuccess) chatSuccess.hidden = true;
    if (context && context !== 'Tailor-Made' && context !== 'Footer' && chatMsg && !chatMsg.value) {
      chatMsg.value = "I'm interested in customising the " + context + " journey — ";
    }
    chat.classList.add('is-open');
    chat.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var firstInput = $('#ch-name');
    setTimeout(function () { if (firstInput) firstInput.focus(); }, 420);
  }
  function closeChat() {
    if (!chat) return;
    clearTimeout(autoCloseTimer);
    chat.classList.remove('is-open');
    chat.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  $$('.js-open-chat').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      openChat(el.getAttribute('data-tailor') || '');
    });
  });
  $$('.card__tailor').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      // decode &amp; etc. via textContent of data
      var tmp = document.createElement('textarea');
      tmp.innerHTML = el.getAttribute('data-tailor') || '';
      openChat(tmp.value);
    });
  });
  if (bubble) bubble.addEventListener('click', function () { openChat(''); });
  if (chat) {
    $$('[data-close]', chat).forEach(function (el) { el.addEventListener('click', closeChat); });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && chat && chat.classList.contains('is-open')) closeChat();
  });

  /* pills */
  var travellersInput = $('#ch-travellers');
  $$('.pill').forEach(function (p) {
    p.addEventListener('click', function () {
      $$('.pill').forEach(function (x) { x.classList.remove('is-active'); });
      p.classList.add('is-active');
      if (travellersInput) travellersInput.value = p.getAttribute('data-pill');
    });
  });

  /* chat submit */
  if (chatForm) {
    chatForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = {
        name: $('#ch-name').value,
        email: $('#ch-email').value,
        message: $('#ch-msg').value,
        budget: $('#ch-budget').value,
        travellers: travellersInput ? travellersInput.value : ''
      };
      if (!data.name || !data.email || !data.message) {
        if (!data.name) $('#ch-name').focus();
        else if (!data.email) $('#ch-email').focus();
        else $('#ch-msg').focus();
        return;
      }
      console.log('[Tailor-Made enquiry]', data);
      chatForm.hidden = true;
      if (chatSuccess) chatSuccess.hidden = false;
      autoCloseTimer = setTimeout(closeChat, 4000);
    });
  }

  /* ---------- Contact form (demo) ---------- */
  var contactForm = $('#contactForm');
  var contactSuccess = $('#contactSuccess');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var req = ['#cf-first', '#cf-last', '#cf-email', '#cf-msg'];
      for (var i = 0; i < req.length; i++) {
        if (!$(req[i]).value.trim()) { $(req[i]).focus(); return; }
      }
      var fd = {};
      $$('#contactForm input, #contactForm select, #contactForm textarea').forEach(function (f) {
        if (f.name && (f.type !== 'radio' || f.checked)) fd[f.name] = f.value;
      });
      console.log('[Contact enquiry]', fd);
      contactForm.querySelectorAll('input,select,textarea,button').forEach(function (f) { f.disabled = true; });
      if (contactSuccess) contactSuccess.hidden = false;
    });
  }

  /* ---------- Reveal animations ---------- */
  function initReveal() {
    var hasGSAP = window.gsap && window.ScrollTrigger;
    if (hasGSAP && !prefersReduced) {
      gsap.registerPlugin(ScrollTrigger);

      // hero intro
      gsap.set('.hero__title .word', { y: 30, opacity: 0 });
      var tl = gsap.timeline({ delay: 0.2 });
      tl.to('.hero__eyebrow', { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 0.1)
        .to('.hero__title .word', { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' }, 0.3)
        .to('.hero__subhead', { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, 1.1)
        .to('.hero__scroll', { opacity: 1, y: 0, duration: 0.8 }, 1.8);
      gsap.set(['.hero__eyebrow', '.hero__subhead', '.hero__scroll'], { y: 20, opacity: 0 });

      // generic reveals
      $$('.reveal').forEach(function (el) {
        if (el.closest('.hero')) return;
        ScrollTrigger.create({
          trigger: el, start: 'top 85%', once: true,
          onEnter: function () { el.classList.add('is-in'); }
        });
      });
      // split titles on scroll (non-hero)
      $$('[data-split]').forEach(function (el) {
        if (el.closest('.hero')) return;
        ScrollTrigger.create({
          trigger: el, start: 'top 85%', once: true,
          onEnter: function () { el.classList.add('is-in'); }
        });
      });
    } else {
      // IntersectionObserver fallback (or reduced motion → reveal immediately)
      if (prefersReduced || !('IntersectionObserver' in window)) {
        $$('.reveal,[data-split]').forEach(function (el) { el.classList.add('is-in'); });
        return;
      }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
        });
      }, { threshold: 0.15 });
      $$('.reveal,[data-split]').forEach(function (el) { io.observe(el); });
      // hero reveals immediately
      $$('.hero .reveal,.hero [data-split]').forEach(function (el) { el.classList.add('is-in'); });
    }
  }

  /* ---------- Lenis smooth scroll ---------- */
  function initLenis() {
    if (prefersReduced || typeof Lenis === 'undefined') return;
    var lenis = new Lenis({ duration: 1.1, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (window.ScrollTrigger) lenis.on('scroll', ScrollTrigger.update);
    // anchor links via lenis
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: -70 }); }
      });
    });
  }

  // init once CDN scripts (deferred) have run
  window.addEventListener('load', function () {
    initReveal();
    initLenis();
    onScroll();
  });
})();
