// ============================================
// GSAP ANIMATION SYSTEM
// CAS Kodungallur — All 3D Animations
// ============================================

const GSAPAnimations = (function() {
  'use strict';

  // Check for reduced motion preference
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ==========================================
  // PAGE ENTER — Cinematic Load Sequence
  // ==========================================
  function pageEnter(elements = {}) {
    if (reducedMotion) {
      gsap.set('*', { opacity: 1, x: 0, y: 0, scale: 1 });
      return;
    }

    const tl = gsap.timeline();

    // Background fade
    tl.from('body', {
      opacity: 0,
      scale: 0.98,
      duration: 0.5,
      ease: 'power2.out',
      clearProps: 'all'
    });

    // Hero text
    if (elements.title) {
      tl.from(elements.title, {
        y: 80,
        opacity: 0,
        rotateX: -40,
        duration: 1.2,
        ease: 'expo.out',
        transformPerspective: 1200
      }, '-=0.2');
    }

    // Subtitle
    if (elements.subtitle) {
      tl.from(elements.subtitle, {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: 'expo.out'
      }, '-=0.8');
    }

    // Staggered elements
    if (elements.stagger) {
      tl.from(elements.stagger, {
        y: 60,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: 'expo.out'
      }, '-=0.6');
    }

    return tl;
  }

  // ==========================================
  // MODAL OPEN — 3D Spring Entry
  // ==========================================
  function modalOpen(modalEl, overlayEl) {
    if (!modalEl) return;
    if (reducedMotion) {
      if (overlayEl) overlayEl.classList.add('active');
      return;
    }

    if (overlayEl) overlayEl.classList.add('active');

    gsap.from(overlayEl || modalEl.parentElement, {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.out'
    });

    gsap.fromTo(modalEl,
      { scale: 0.8, opacity: 0, rotateX: 20, y: 40, transformPerspective: 1000 },
      { scale: 1, opacity: 1, rotateX: 0, y: 0, duration: 0.5, ease: 'expo.out', clearProps: 'all' }
    );
  }

  // ==========================================
  // MODAL CLOSE — Reversed
  // ==========================================
  function modalClose(modalEl, overlayEl, callback) {
    if (!modalEl) {
      if (callback) callback();
      return;
    }
    if (reducedMotion) {
      if (overlayEl) overlayEl.classList.remove('active');
      if (callback) callback();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        if (overlayEl) overlayEl.classList.remove('active');
        if (callback) callback();
        gsap.set(modalEl, { clearProps: 'all' });
      }
    });

    tl.to(modalEl, {
      scale: 0.85,
      opacity: 0,
      rotateX: 15,
      y: -30,
      duration: 0.35,
      ease: 'power2.in',
      transformPerspective: 1000
    });

    tl.to(overlayEl || modalEl.parentElement, {
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in'
    }, '-=0.2');
  }

  // ==========================================
  // MODULE TRANSITION — Dashboard Slide
  // ==========================================
  function moduleTransition(oldEl, newEl, titleEl) {
    if (reducedMotion) {
      if (oldEl) { oldEl.style.display = 'none'; oldEl.classList.remove('active'); }
      if (newEl) { newEl.classList.add('active'); newEl.style.display = ''; }
      return;
    }

    const tl = gsap.timeline();

    if (oldEl) {
      tl.to(oldEl, { x: -50, opacity: 0, duration: 0.3, ease: 'power2.in' });
      tl.call(() => {
        oldEl.style.display = 'none';
        oldEl.classList.remove('active');
      });
    }

    tl.call(() => {
      if (newEl) {
        newEl.style.display = '';
        newEl.classList.add('active');
      }
    });

    if (newEl) {
      tl.from(newEl, { x: 50, opacity: 0, duration: 0.4, ease: 'expo.out' });
    }

    if (titleEl) {
      tl.from(titleEl, { y: 20, opacity: 0, duration: 0.4, ease: 'expo.out' }, '-=0.3');
    }

    return tl;
  }

  // ==========================================
  // STAT COUNTERS — GSAP Number Animation
  // ==========================================
  function statCounters() {
    if (reducedMotion) return;

    document.querySelectorAll('[data-count]').forEach(el => {
      const target = parseInt(el.getAttribute('data-count')) || 0;
      if (target === 0) return;

      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 1.8,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = Math.round(obj.val).toLocaleString();
        }
      });
    });
  }

  // ==========================================
  // TOAST 3D — Slide + Rotate
  // ==========================================
  function toastShow(el) {
    if (reducedMotion) return;
    gsap.from(el, {
      x: 120,
      opacity: 0,
      rotateY: 30,
      duration: 0.5,
      ease: 'expo.out',
      transformPerspective: 800
    });
  }

  function toastHide(el, callback) {
    if (reducedMotion) {
      if (callback) callback();
      return;
    }
    gsap.to(el, {
      x: 120,
      opacity: 0,
      rotateY: -30,
      duration: 0.4,
      ease: 'power2.in',
      transformPerspective: 800,
      onComplete: callback
    });
  }

  // ==========================================
  // THEME TOGGLE FLIP
  // ==========================================
  function themeFlip(iconEl, callback) {
    if (reducedMotion) {
      if (callback) callback();
      return;
    }
    const tl = gsap.timeline();
    tl.to(iconEl, { rotateY: 180, scale: 0.8, duration: 0.2, ease: 'power2.in' });
    tl.call(() => { if (callback) callback(); });
    tl.to(iconEl, { rotateY: 360, scale: 1, duration: 0.3, ease: 'power2.out' });
    tl.set(iconEl, { rotateY: 0 });
    return tl;
  }

  // ==========================================
  // NAV SCROLL — Frosted Glass
  // ==========================================
  function initNavScroll(navEl) {
    if (!navEl) return;
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        navEl.classList.add('scrolled');
      } else {
        navEl.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // ==========================================
  // STAT WIDGET 3D POP HOVER
  // ==========================================
  function initStatWidgets() {
    if (navigator.maxTouchPoints > 0) return;
    document.querySelectorAll('.stat-widget').forEach(widget => {
      widget.addEventListener('mouseenter', () => {
        gsap.to(widget, {
          y: -8,
          scale: 1.02,
          rotateX: 5,
          rotateY: -3,
          duration: 0.4,
          ease: 'power2.out',
          transformPerspective: 800
        });
        // Enhanced shadow
        widget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(59,130,246,0.15)';
      });
      widget.addEventListener('mouseleave', () => {
        gsap.to(widget, {
          y: 0,
          scale: 1,
          rotateX: 0,
          rotateY: 0,
          duration: 0.6,
          ease: 'power2.out',
          transformPerspective: 800
        });
        widget.style.boxShadow = '';
      });
    });
  }

  // ==========================================
  // QUICK ACTION BUTTON ICON FLOAT
  // ==========================================
  function initQuickActions() {
    if (navigator.maxTouchPoints > 0) return;
    document.querySelectorAll('.quick-action-btn').forEach(btn => {
      const icon = btn.querySelector('svg');
      if (!icon) return;
      btn.addEventListener('mouseenter', () => {
        gsap.to(icon, { y: -6, scale: 1.2, duration: 0.3, ease: 'back.out(2)' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(icon, { y: 0, scale: 1, duration: 0.4, ease: 'power2.out' });
      });
    });
  }

  // ==========================================
  // TIMETABLE CELL 3D POP
  // ==========================================
  function initTimetableCells() {
    if (navigator.maxTouchPoints > 0) return;
    document.addEventListener('mouseenter', (e) => {
      const cell = e.target.closest?.('.timetable-cell');
      if (!cell || cell.classList.contains('empty')) return;
      gsap.to(cell, {
        scale: 1.06,
        z: 10,
        rotateX: -5,
        zIndex: 10,
        duration: 0.25,
        ease: 'power2.out',
        transformPerspective: 600
      });
    }, true);
    document.addEventListener('mouseleave', (e) => {
      const cell = e.target.closest?.('.timetable-cell');
      if (!cell) return;
      gsap.to(cell, {
        scale: 1,
        z: 0,
        rotateX: 0,
        zIndex: 1,
        duration: 0.4,
        ease: 'power2.out',
        transformPerspective: 600
      });
    }, true);
  }

  // ==========================================
  // CTA BUTTON 3D PRESS & IDLE PULSE ZOOM
  // ==========================================
  function initCTAButtons() {
    document.querySelectorAll('.btn-3d').forEach(btn => {
      let pulseTween = null;

      function startPulse() {
        if (pulseTween) pulseTween.kill();
        pulseTween = gsap.to(btn, {
          scale: 1.025,
          duration: 1.8,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }

      function stopPulse() {
        if (pulseTween) {
          pulseTween.kill();
          pulseTween = null;
        }
      }

      // Start the idle breathing pulse zoom
      startPulse();

      // Desktop interactive tilt & zoom
      if (navigator.maxTouchPoints === 0) {
        btn.addEventListener('mouseenter', () => {
          stopPulse();
          gsap.to(btn, {
            rotateX: -8,
            y: -4,
            scale: 1.08,
            duration: 0.35,
            ease: 'back.out(1.5)',
            transformPerspective: 600
          });
        });

        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, {
            rotateX: 0,
            y: 0,
            scale: 1,
            duration: 0.4,
            ease: 'power2.out',
            transformPerspective: 600,
            onComplete: startPulse
          });
        });

        btn.addEventListener('mousedown', () => {
          stopPulse();
          gsap.to(btn, {
            scale: 0.95,
            y: 2,
            duration: 0.1,
            ease: 'power2.in',
            transformPerspective: 600
          });
        });

        btn.addEventListener('mouseup', () => {
          gsap.to(btn, {
            scale: 1.08,
            y: -4,
            duration: 0.2,
            ease: 'back.out(1.5)',
            transformPerspective: 600
          });
        });
      } else {
        // Mobile reactive touch zoom
        btn.addEventListener('touchstart', () => {
          stopPulse();
          gsap.to(btn, { scale: 0.96, duration: 0.1, ease: 'power2.in' });
        }, { passive: true });

        btn.addEventListener('touchend', () => {
          gsap.to(btn, {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out',
            onComplete: startPulse
          });
        }, { passive: true });
      }
    });
  }

  // ==========================================
  // SCROLL TRIGGER CARDS
  // ==========================================
  function initScrollCards() {
    if (reducedMotion) return;
    if (!window.ScrollTrigger) return;

    gsap.utils.toArray('.landing-feature').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          once: true
        },
        y: 100,
        opacity: 0,
        rotateX: 40,
        duration: 0.8,
        delay: i * 0.15,
        ease: 'expo.out',
        transformPerspective: 1000,
        clearProps: 'all'
      });
    });
  }

  // ==========================================
  // LOGIN CARD ENTRY
  // ==========================================
  function loginCardEnter(cardEl) {
    if (reducedMotion || !cardEl) return;
    gsap.from(cardEl, {
      y: 60,
      opacity: 0,
      rotateX: 30,
      scale: 0.9,
      duration: 1,
      ease: 'expo.out',
      transformPerspective: 1200,
      clearProps: 'all'
    });
  }

  // ==========================================
  // LOGIN SUCCESS PARTICLES
  // ==========================================
  function loginParticleBurst(originEl, callback) {
    if (reducedMotion) {
      if (callback) callback();
      return;
    }

    const rect = originEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const colors = ['#3B82F6', '#8B5CF6', '#22C55E', '#F59E0B', '#60A5FA'];
    const particles = [];

    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div');
      p.className = 'particle-burst';
      p.style.background = colors[i % colors.length];
      p.style.left = cx + 'px';
      p.style.top = cy + 'px';
      document.body.appendChild(p);
      particles.push(p);

      const angle = (i / 20) * Math.PI * 2;
      const dist = 80 + Math.random() * 80;
      gsap.to(p, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        opacity: 0,
        scale: 0.2,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => p.remove()
      });
    }

    // Card exit flash
    const card = document.querySelector('.login-card');
    if (card) {
      const tl = gsap.timeline({ onComplete: () => { if (callback) callback(); } });
      tl.to(card, { scale: 1.03, duration: 0.15, ease: 'power2.out' });
      tl.to(card, { y: -100, opacity: 0, scale: 1.05, duration: 0.5, ease: 'power2.in' });
    } else {
      if (callback) callback();
    }
  }

  // ==========================================
  // LOGO Y-AXIS SPIN
  // ==========================================
  function initLogoSpin(logoEl) {
    if (!logoEl || reducedMotion) return;
    gsap.to(logoEl, {
      rotateY: 360,
      duration: 8,
      ease: 'none',
      repeat: -1,
      transformPerspective: 200
    });
  }

  // ==========================================
  // INPUT FOCUS 3D LIFT
  // ==========================================
  function initInputFocus() {
    document.querySelectorAll('.form-group').forEach(group => {
      const input = group.querySelector('input, select, textarea');
      if (!input) return;
      input.addEventListener('focus', () => {
        gsap.to(group, { y: -2, scale: 1.01, duration: 0.3, ease: 'power2.out' });
      });
      input.addEventListener('blur', () => {
        gsap.to(group, { y: 0, scale: 1, duration: 0.4, ease: 'power2.out' });
      });
    });
  }

  // ==========================================
  // AURA EFFECT INIT
  // ==========================================
  function initAura() {
    if (navigator.maxTouchPoints > 0) return;

    // Create aura div if not exists
    let aura = document.getElementById('aura');
    if (!aura) {
      aura = document.createElement('div');
      aura.id = 'aura';
      document.body.insertBefore(aura, document.body.firstChild);
    }

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    }, { passive: true });

    function updateAura() {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;
      aura.style.left = currentX + 'px';
      aura.style.top = currentY + 'px';
      requestAnimationFrame(updateAura);
    }
    updateAura();
  }

  // ==========================================
  // TODAY COLUMN NEON GLOW
  // ==========================================
  function initTodayGlow() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];

    document.querySelectorAll('.timetable-grid-header > div').forEach(headerDiv => {
      if (headerDiv.textContent.trim() === today) {
        headerDiv.classList.add('day-today-header');
        gsap.to(headerDiv, {
          boxShadow: '0 0 20px rgba(59,130,246,0.8), 0 0 40px rgba(59,130,246,0.4)',
          repeat: -1,
          yoyo: true,
          duration: 1.5,
          ease: 'power1.inOut'
        });
      }
    });
  }

  // Export all functions
  return {
    pageEnter,
    modalOpen,
    modalClose,
    moduleTransition,
    statCounters,
    toastShow,
    toastHide,
    themeFlip,
    initNavScroll,
    initStatWidgets,
    initQuickActions,
    initTimetableCells,
    initCTAButtons,
    initScrollCards,
    loginCardEnter,
    loginParticleBurst,
    initLogoSpin,
    initInputFocus,
    initAura,
    initTodayGlow
  };
})();

window.GSAPAnimations = GSAPAnimations;
