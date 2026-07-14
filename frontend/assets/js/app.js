// ============================================
// ScheduleFlow - Global Application Script
// Premium SaaS Interface Engine
// ============================================

(function() {
  'use strict';

  // ============================================
  // THEME MANAGEMENT
  // ============================================
  const ThemeManager = {
    init() {
      this.theme = localStorage.getItem('scheduleflow-theme') || 'dark';
      this.applyTheme(this.theme);
      this.setupToggle();
    },

    applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('scheduleflow-theme', theme);
      this.updateIcons(theme);
      
      document.querySelectorAll('.theme-switcher svg').forEach(svg => {
        if (theme === 'dark') {
          svg.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
        } else {
          svg.innerHTML = '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>';
        }
      });
    },

    toggle() {
      const newTheme = this.theme === 'dark' ? 'light' : 'dark';
      this.theme = newTheme;
      this.applyTheme(newTheme);
    },

    setupToggle() {
      document.querySelectorAll('.theme-switcher').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const iconEl = btn.querySelector('svg');
          if (window.GSAPAnimations && iconEl) {
            window.GSAPAnimations.themeFlip(iconEl, () => {
              this.toggle();
            });
          } else {
            this.toggle();
          }
        });
      });
    },

    updateIcons(theme) {
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        metaTheme.content = theme === 'dark' ? '#0B1020' : '#F0F2F5';
      }
    }
  };

  // ============================================
  // TOAST NOTIFICATIONS
  // ============================================
  const Toast = {
    container: null,

    init() {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    },

    show(message, type = 'info', duration = 4000) {
      if (!this.container) this.init();

      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      
      const icons = {
        success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
      };

      toast.innerHTML = `
        ${icons[type] || icons.info}
        <span>${message}</span>
      `;

      this.container.appendChild(toast);

      if (window.GSAPAnimations && window.GSAPAnimations.toastShow) {
        window.GSAPAnimations.toastShow(toast);
      }

      setTimeout(() => {
        if (window.GSAPAnimations && window.GSAPAnimations.toastHide) {
          window.GSAPAnimations.toastHide(toast, () => toast.remove());
        } else {
          toast.style.opacity = '0';
          toast.style.transform = 'translateX(100%)';
          setTimeout(() => toast.remove(), 300);
        }
      }, duration);
    },

    success(msg) { this.show(msg, 'success'); },
    error(msg) { this.show(msg, 'error'); },
    info(msg) { this.show(msg, 'info'); }
  };

  // ============================================
  // ANIMATION ENGINE
  // ============================================
  const Animations = {
    init() {
      this.observeElements();
      this.setupRippleEffect();
      this.setupMagneticButtons();
      this.setupCountUp();
    },

    observeElements() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          try {
            if (entry.isIntersecting) {
              if (entry.target && entry.target instanceof Element) {
                entry.target.classList.add('animate-fade-up');
                observer.unobserve(entry.target);
              }
            }
          } catch (e) {
            // swallow observer errors to avoid breaking the animation engine
            console.warn('IntersectionObserver handler error:', e);
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('[data-animate]').forEach(el => {
        observer.observe(el);
      });
    },

    setupRippleEffect() {
      document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
          const rect = this.getBoundingClientRect();
          const ripple = document.createElement('span');
          ripple.className = 'ripple';
          const size = Math.max(rect.width, rect.height);
          ripple.style.width = ripple.style.height = `${size}px`;
          ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
          ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
          this.appendChild(ripple);
          setTimeout(() => ripple.remove(), 600);
        });
      });
    },

    setupMagneticButtons() {
      document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mousemove', function(e) {
          const rect = this.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          this.style.setProperty('--mouse-x', `${x}%`);
          this.style.setProperty('--mouse-y', `${y}%`);
        });
      });
    },

    setupCountUp() {
      document.querySelectorAll('[data-count]').forEach(el => {
        const target = parseInt(el.getAttribute('data-count'));
        const duration = parseInt(el.getAttribute('data-duration')) || 1500;
        const startTime = performance.now();
        
        function update(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(eased * target);
          el.textContent = current.toLocaleString();
          
          if (progress < 1) {
            requestAnimationFrame(update);
          }
        }
        
        // Start animation when element is visible
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            try {
              if (entry.isIntersecting) {
                requestAnimationFrame(update);
                if (entry.target && entry.target instanceof Element) {
                  observer.unobserve(entry.target);
                }
              }
            } catch (e) {
              console.warn('IntersectionObserver countup error:', e);
            }
          });
        }, { threshold: 0.5 });
        
        observer.observe(el);
      });
    }
  };

  // ============================================
  // LOADING STATE
  // ============================================
  const Loading = {
    show(target) {
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      if (!el) return;
      el.innerHTML = '<div class="skeleton skeleton-card"></div>';
    },

    hide(target, content) {
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      if (!el) return;
      el.innerHTML = content;
    }
  };

  // ============================================
  // FULLSCREEN MODAL
  // ============================================
  const FullscreenModal = {
    open(html) {
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay active';
      overlay.innerHTML = `
        <div class="modal">
          <div class="modal-header">
            <h2 id="fullscreenModalTitle">Loading...</h2>
            <button class="modal-close" onclick="FullscreenModal.close()">&times;</button>
          </div>
          <div class="modal-body">${html}</div>
        </div>
      `;
      document.body.appendChild(overlay);
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.close();
      });
    },
    
    close() {
      document.querySelectorAll('.modal-overlay').forEach(m => m.remove());
    }
  };

  // ============================================
  // SEARCH DEBOUNCE
  // ============================================
  function debounce(fn, delay = 300) {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // ============================================
  // DRAG & DROP FOR TIMETABLE
  // ============================================
  const DragDrop = {
    init(containerSelector) {
      const container = document.querySelector(containerSelector);
      if (!container) return;
      
      let dragged = null;
      let ghost = null;

      container.addEventListener('dragstart', (e) => {
        const cell = e.target.closest('.slot-card');
        if (!cell) return;
        dragged = cell;
        cell.classList.add('dragging');
        
        ghost = cell.cloneNode(true);
        ghost.className = 'slot-card drag-ghost';
        ghost.style.width = cell.offsetWidth + 'px';
        ghost.style.height = cell.offsetHeight + 'px';
        ghost.style.transformStyle = 'flat';
        ghost.style.transform = 'scale(1.08) rotate(2deg)';
        ghost.style.transition = 'none';
        document.body.appendChild(ghost);
        
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', '');
      });

      container.addEventListener('drag', (e) => {
        if (ghost && e.clientX !== 0 && e.clientY !== 0) {
          ghost.style.left = (e.clientX - ghost.offsetWidth / 2) + 'px';
          ghost.style.top = (e.clientY - ghost.offsetHeight / 2) + 'px';
        }
      });

      container.addEventListener('dragenter', (e) => {
        const cell = e.target.closest('.timetable-cell');
        if (cell && cell !== dragged?.closest('.timetable-cell')) {
          cell.classList.add('drag-over');
        }
      });

      container.addEventListener('dragleave', (e) => {
        const cell = e.target.closest('.timetable-cell');
        if (cell) {
          cell.classList.remove('drag-over');
        }
      });

      container.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });

      container.addEventListener('drop', (e) => {
        e.preventDefault();
        const cell = e.target.closest('.timetable-cell');
        if (cell && dragged) {
          cell.classList.remove('drag-over');
          const event = new CustomEvent('slot-drop', {
            detail: {
              from: dragged.closest('.timetable-cell')?.dataset,
              to: cell.dataset,
              slotData: dragged.dataset
            }
          });
          container.dispatchEvent(event);
        }
        if (ghost) {
          ghost.remove();
          ghost = null;
        }
        if (dragged) {
          dragged.classList.remove('dragging');
          dragged = null;
        }
      });

      container.addEventListener('dragend', () => {
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
        if (ghost) {
          ghost.remove();
          ghost = null;
        }
        dragged = null;
      });
    }
  };

  // ============================================
  // MOBILE SIDEBAR TOGGLE
  // ============================================
  const MobileNav = {
    init() {
      this.setupBottomNav();
    },

    setupBottomNav() {
      document.querySelectorAll('.bottom-nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
          e.preventDefault();
          const module = this.getAttribute('data-module');
          if (window.switchModule) {
            window.switchModule(module);
          }
          document.querySelectorAll('.bottom-nav-item').forEach(i => i.classList.remove('active'));
          this.classList.add('active');
        });
      });
    }
  };

  // ============================================
  // KEYBOARD SHORTCUTS
  // ============================================
  const KeyboardShortcuts = {
    init() {
      document.addEventListener('keydown', (e) => {
        // Escape closes modals
        if (e.key === 'Escape') {
          document.querySelectorAll('.modal-overlay.active').forEach(m => {
            m.classList.remove('active');
          });
        }
      });
    }
  };

  // ============================================
  // LIVE DATE & TIME
  // ============================================
  const LiveClock = {
    init() {
      this.update();
      setInterval(() => this.update(), 1000);
    },

    update() {
      const timeEls = document.querySelectorAll('.live-time');
      const dateEls = document.querySelectorAll('.live-date');
      if (timeEls.length === 0 && dateEls.length === 0) return;

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const dateStr = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' });

      timeEls.forEach(el => {
        el.textContent = timeStr;
      });
      dateEls.forEach(el => {
        el.textContent = dateStr;
      });
    }
  };

  // ============================================
  // INITIALIZATION
  // ============================================
  function init() {
    ThemeManager.init();
    Toast.init();
    Animations.init();
    KeyboardShortcuts.init();
    MobileNav.init();
    LiveClock.init();
    
    // Expose globals
    window.Toast = Toast;
    window.Loading = Loading;
    window.FullscreenModal = FullscreenModal;
    window.DragDrop = DragDrop;
    window.debounce = debounce;
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();