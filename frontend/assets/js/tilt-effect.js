// ============================================
// MOUSE-TRACKING 3D TILT EFFECT
// CAS Kodungallur — Interactive Card Tilt
// ============================================

class TiltEffect {
  constructor() {
    this.cards = [];
    this.rafRunning = false;
    this._bound_tick = this._tick.bind(this);
  }

  init(selector, options = {}) {
    if (navigator.maxTouchPoints > 0) return; // Skip on touch

    const {
      maxX = 12,
      maxY = 12,
      scale = 1.03,
      speed = 0.1
    } = options;

    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      const card = {
        el,
        targetX: 0,
        targetY: 0,
        currentX: 0,
        currentY: 0,
        maxX,
        maxY,
        scale,
        speed,
        isHovered: false
      };

      el.addEventListener('mouseenter', () => {
        card.isHovered = true;
        el.style.willChange = 'transform';
        this._startRAF();
      });

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);

        card.targetX = dy * maxX;
        card.targetY = -dx * maxY;

        // Update shine position CSS vars
        const mx = ((e.clientX - rect.left) / rect.width) * 100;
        const my = ((e.clientY - rect.top) / rect.height) * 100;
        el.style.setProperty('--mx', `${mx}%`);
        el.style.setProperty('--my', `${my}%`);
      });

      el.addEventListener('mouseleave', () => {
        card.isHovered = false;
        card.targetX = 0;
        card.targetY = 0;

        // GSAP reset if available
        if (window.gsap) {
          gsap.to(el, {
            rotateX: 0,
            rotateY: 0,
            scale: 1,
            duration: 0.6,
            ease: 'power2.out'
          });
        }
      });

      this.cards.push(card);
    });
  }

  _startRAF() {
    if (!this.rafRunning) {
      this.rafRunning = true;
      requestAnimationFrame(this._bound_tick);
    }
  }

  _tick() {
    let anyHovered = false;
    this.cards.forEach(card => {
      if (card.isHovered || Math.abs(card.currentX) > 0.01 || Math.abs(card.currentY) > 0.01) {
        anyHovered = true;
        card.currentX += (card.targetX - card.currentX) * card.speed;
        card.currentY += (card.targetY - card.currentY) * card.speed;

        const scale = card.isHovered ? card.scale : 1;
        card.el.style.transform =
          `perspective(1000px) rotateX(${card.currentX}deg) rotateY(${card.currentY}deg) scale(${scale})`;
      }
    });

    if (anyHovered) {
      requestAnimationFrame(this._bound_tick);
    } else {
      this.rafRunning = false;
    }
  }

  destroy() {
    this.cards = [];
    this.rafRunning = false;
  }
}

// Export as global
window.TiltEffect = TiltEffect;
