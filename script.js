/* ════════════════════════════════════════════════
   CLUB SPORTIV EXTREME — script.js
════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── 1. NAV SCROLL ─── */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  /* ─── 2. REVEAL ANIMATIONS ─── */
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // stagger delay for sibling cards
          const siblings = entry.target.parentElement.querySelectorAll('.reveal');
          let delay = 0;
          siblings.forEach((sib, idx) => {
            if (sib === entry.target) delay = idx * 80;
          });
          setTimeout(() => entry.target.classList.add('visible'), Math.min(delay, 400));
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  reveals.forEach(el => revealObserver.observe(el));

  /* ─── 3. COUNTERS ─── */
  const counters = document.querySelectorAll('.counter');
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach(el => counterObserver.observe(el));

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ─── 4. REVIEWS CAROUSEL ─── */
  const track = document.getElementById('reviewsTrack');
  const dotsContainer = document.getElementById('reviewsDots');
  const prevBtn = document.getElementById('reviewsPrev');
  const nextBtn = document.getElementById('reviewsNext');

  if (track) {
    const cards = track.querySelectorAll('.review-card');
    let current = 0;
    let visibleCount = 1;
    let autoInterval;

    function getVisibleCount() {
      if (window.innerWidth >= 1100) return 3;
      if (window.innerWidth >= 768) return 2;
      return 1;
    }

    function buildDots() {
      dotsContainer.innerHTML = '';
      const total = Math.ceil(cards.length / visibleCount);
      for (let i = 0; i < total; i++) {
        const dot = document.createElement('button');
        dot.className = 'reviews__dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
      }
    }

    function goTo(index) {
      const total = Math.ceil(cards.length / visibleCount);
      current = ((index % total) + total) % total;
      const cardWidth = cards[0].offsetWidth + 24; // gap
      track.style.transform = `translateX(-${current * visibleCount * cardWidth}px)`;
      document.querySelectorAll('.reviews__dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function startAuto() {
      autoInterval = setInterval(next, 4000);
    }
    function stopAuto() {
      clearInterval(autoInterval);
    }

    prevBtn.addEventListener('click', () => { stopAuto(); prev(); startAuto(); });
    nextBtn.addEventListener('click', () => { stopAuto(); next(); startAuto(); });

    // Touch swipe
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { stopAuto(); diff > 0 ? next() : prev(); startAuto(); }
    });

    function init() {
      visibleCount = getVisibleCount();
      buildDots();
      goTo(0);
    }

    init();
    startAuto();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { init(); }, 200);
    });
  }

  /* ─── 5. BOOKING FORM ─── */
  const form = document.getElementById('bookingForm');
  const success = document.getElementById('bookingSuccess');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.querySelector('#name').value.trim();
      const phone = form.querySelector('#phone').value.trim();

      if (!name || !phone) {
        // Shake invalid inputs
        [form.querySelector('#name'), form.querySelector('#phone')].forEach(input => {
          if (!input.value.trim()) {
            input.style.borderColor = '#FF2E2E';
            input.focus();
            setTimeout(() => { input.style.borderColor = ''; }, 2000);
          }
        });
        return;
      }

      form.style.display = 'none';
      success.hidden = false;

      // Scroll into view
      success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  /* ─── 6. SMOOTH ANCHOR SCROLL ─── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'));
        const top = target.getBoundingClientRect().top + window.scrollY - navH;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ─── 7. AI CHATBOX ─── */
  const chatWidget = document.getElementById('chatWidget');
  const chatToggle = document.getElementById('chatToggle');
  const chatClose = document.getElementById('chatClose');
  const chatMessages = document.getElementById('chatMessages');
  const chatInput = document.getElementById('chatInput');
  const chatSend = document.getElementById('chatSend');
  const quickRepliesContainer = document.getElementById('quickReplies');

  // ── Knowledge Base
  const KB = {
    prices: {
      keywords: ['pret', 'preturi', 'cost', 'cat', 'abonament', 'price', 'tarif', 'bani'],
      response: [
        '💰 Iată prețurile noastre:',
        '• Sesiune de probă — <strong>GRATUITĂ</strong>\n• Abonament lunar — de la <strong>150 RON</strong>\n• Antrenament personal — de la <strong>80 RON/sesiune</strong>',
        'Pentru ofertă personalizată, contactează-ne direct!'
      ],
      cta: { text: '📞 Sună pentru ofertă', href: 'tel:+40700000000', type: 'call' },
      ctaWa: { text: '💬 Întreabă pe WhatsApp', href: 'https://wa.me/40700000000?text=Salut!%20Vreau%20informatii%20despre%20preturi.', type: 'wa' }
    },
    trial: {
      keywords: ['proba', 'gratuit', 'trial', 'incep', 'vreau sa vin', 'vreau sa ma inscriu', 'join', 'incepe', 'inregistra', 'reserv', 'rezerv'],
      response: [
        '🎯 Prima sesiune este complet gratuită!',
        'Fără angajamente și fără plată în avans. Vii, te antrenezi, și dacă nu-ți place — pleci fără nicio obligație.',
        'Cum vrei să rezervi?'
      ],
      cta: { text: '📅 Rezervă online', href: '#booking', type: 'link' },
      ctaWa: { text: '💬 Rezervă pe WhatsApp', href: 'https://wa.me/40700000000?text=Salut!%20Vreau%20sa%20rezerv%20o%20sedinta%20de%20proba%20gratuita.', type: 'wa' }
    },
    schedule: {
      keywords: ['program', 'orar', 'ore', 'cand', 'schedule', 'hours', 'deschis', 'inchis', 'deschidere'],
      response: [
        '🕐 Programul nostru:',
        '• <strong>Luni – Vineri:</strong> 07:00 – 22:00\n• <strong>Sâmbătă – Duminică:</strong> 09:00 – 18:00',
        'Suntem deschiși aproape toată ziua! Alegi tu când vii.'
      ],
      cta: { text: '📅 Rezervă o sesiune', href: '#booking', type: 'link' },
      ctaWa: null
    },
    location: {
      keywords: ['unde', 'adresa', 'locatie', 'harta', 'map', 'directions', 'cum ajung', 'sector', 'bucuresti', 'strada'],
      response: [
        '📍 Suntem situați în București.',
        'Găsești toate detaliile de localizare mai jos pe pagină, sau deschide direct pe Google Maps.'
      ],
      cta: { text: '📍 Deschide Google Maps', href: 'https://maps.app.goo.gl/SUFpLaxVMdRKgr9G6', type: 'external' },
      ctaWa: null
    },
    services: {
      keywords: ['servicii', 'antrenament', 'fitness', 'sala', 'sport', 'forta', 'cardio', 'yoga', 'personal', 'grup', 'clase', 'boxing', 'clase'],
      response: [
        '💪 Oferim o gamă completă de servicii:',
        '• 🏃 Fitness Training\n• 💪 Forță & Condiție\n• ⚽ Sporturi de Echipă\n• 🧘 Mobilitate & Recuperare\n• 🎯 Coaching Personal 1-on-1',
        'Orice obiectiv ai, avem programul potrivit!'
      ],
      cta: { text: '🎯 Probă gratuită', href: '#booking', type: 'link' },
      ctaWa: { text: '💬 Întreabă un antrenor', href: 'https://wa.me/40700000000?text=Salut!%20Am%20o%20intrebare%20despre%20servicii.', type: 'wa' }
    },
    contact: {
      keywords: ['contact', 'telefon', 'suna', 'numar', 'whatsapp', 'email', 'mesaj'],
      response: [
        '📞 Ne poți contacta rapid:',
        '• Telefon: 0700 000 000\n• WhatsApp disponibil non-stop\n• Răspundem în maxim 2 ore'
      ],
      cta: { text: '📞 Sună acum', href: 'tel:+40700000000', type: 'call' },
      ctaWa: { text: '💬 WhatsApp', href: 'https://wa.me/40700000000', type: 'wa' }
    }
  };

  const defaultResponse = {
    texts: [
      'Mulțumesc pentru mesaj! 😊',
      'Echipa noastră îți poate răspunde la orice întrebare. Cum te putem ajuta mai concret?'
    ],
    cta: { text: '💬 Scrie pe WhatsApp', href: 'https://wa.me/40700000000?text=Salut!%20Am%20o%20intrebare.', type: 'wa' }
  };

  function findResponse(text) {
    const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    for (const key in KB) {
      const entry = KB[key];
      if (entry.keywords.some(kw => lower.includes(kw))) {
        return entry;
      }
    }
    return null;
  }

  function addMessage(type, html) {
    const div = document.createElement('div');
    div.className = `chat-msg chat-msg--${type}`;
    div.innerHTML = `<p>${html}</p>`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
  }

  function addBotMulti(texts, cta, ctaWa) {
    // Remove quick replies container temporarily
    const qr = document.getElementById('quickReplies');
    if (qr) qr.remove();

    // Add typing
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-msg chat-typing';
    typingDiv.innerHTML = `<div class="chat-typing__dots"><span></span><span></span><span></span></div>`;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    setTimeout(() => {
      typingDiv.remove();

      const wrapper = document.createElement('div');
      wrapper.className = 'chat-msg chat-msg--bot';

      texts.forEach(t => {
        const p = document.createElement('p');
        p.innerHTML = t.replace(/\n/g, '<br>');
        wrapper.appendChild(p);
      });

      if (cta) {
        const a = document.createElement('a');
        a.className = 'chat-cta';
        a.textContent = cta.text;
        a.href = cta.href;
        if (cta.type === 'external' || cta.type === 'call' || cta.type === 'wa') {
          a.target = '_blank';
          a.rel = 'noopener';
        }
        if (cta.type === 'link') {
          a.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(cta.href);
            if (target) {
              const navH = 64;
              window.scrollTo({ top: target.offsetTop - navH, behavior: 'smooth' });
              toggleChat(false);
            }
          });
        }
        wrapper.appendChild(a);
      }

      if (ctaWa) {
        const a = document.createElement('a');
        a.className = 'chat-cta chat-cta-wa';
        a.textContent = ctaWa.text;
        a.href = ctaWa.href;
        a.target = '_blank';
        a.rel = 'noopener';
        wrapper.appendChild(a);
      }

      chatMessages.appendChild(wrapper);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 900 + Math.random() * 400);
  }

  function handleUserMessage(text) {
    if (!text.trim()) return;

    // Remove quick replies
    const qr = document.getElementById('quickReplies');
    if (qr) qr.remove();

    // Add user message
    addMessage('user', text);
    chatInput.value = '';

    // Find response
    const match = findResponse(text);
    if (match) {
      addBotMulti(match.response, match.cta || null, match.ctaWa || null);
    } else {
      addBotMulti(defaultResponse.texts, defaultResponse.cta, null);
    }
  }

  // Quick replies
  if (quickRepliesContainer) {
    quickRepliesContainer.querySelectorAll('.quick-reply').forEach(btn => {
      btn.addEventListener('click', () => {
        const q = btn.dataset.q;
        const labels = {
          prices: 'Care sunt prețurile?',
          trial: 'Vreau o sesiune de probă gratuită',
          schedule: 'Care e programul vostru?',
          location: 'Unde sunteți localizați?',
          services: 'Ce servicii oferiți?'
        };
        handleUserMessage(labels[q] || btn.textContent);
      });
    });
  }

  chatSend.addEventListener('click', () => handleUserMessage(chatInput.value));
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleUserMessage(chatInput.value);
  });

  function toggleChat(forceState) {
    const isOpen = forceState !== undefined ? forceState : !chatWidget.classList.contains('open');
    chatWidget.classList.toggle('open', isOpen);
    if (isOpen) chatInput.focus();
  }

  chatToggle.addEventListener('click', () => toggleChat());
  chatClose.addEventListener('click', () => toggleChat(false));

  // Auto-open on mobile after 8s if not interacted
  let autoOpened = false;
  setTimeout(() => {
    if (!autoOpened && !chatWidget.classList.contains('open')) {
      autoOpened = true;
      // Don't auto-open on mobile to avoid intruding
      if (window.innerWidth >= 768) {
        toggleChat(true);
      }
    }
  }, 8000);

  chatToggle.addEventListener('click', () => { autoOpened = true; }, { once: true });

})();
