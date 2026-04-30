/**
 * BubbleMenu - Vanilla JS Port of React Bits BubbleMenu
 * Uses GSAP for high-performance animations.
 */

class BubbleMenu {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      logo: '🇮🇳',
      items: [
        { label: 'Register', href: '#registration', rotation: -5, hoverStyles: { bgColor: '#ff9933', textColor: '#fff' } },
        { label: 'Timeline', href: '#timeline', rotation: 3, hoverStyles: { bgColor: '#ffffff', textColor: '#138808' } },
        { label: 'Polling', href: '#polling', rotation: -2, hoverStyles: { bgColor: '#138808', textColor: '#fff' } },
        { label: 'Results', href: '#results', rotation: 6, hoverStyles: { bgColor: '#000080', textColor: '#fff' } },
        { label: 'Guide', href: '#welcome', rotation: -4, hoverStyles: { bgColor: '#3b82f6', textColor: '#fff' } }
      ],
      menuAriaLabel: 'Toggle menu',
      menuBg: '#fff',
      menuContentColor: '#111',
      useFixedPosition: false,
      animationEase: 'back.out(1.5)',
      animationDuration: 0.5,
      staggerDelay: 0.12,
      onMenuClick: null,
      ...options
    };

    this.isMenuOpen = false;
    this.showOverlay = false;
    
    this.init();
  }

  init() {
    this._createDOM();
    this._bindEvents();
  }

  _createDOM() {
    // Nav Container
    this.nav = document.createElement('nav');
    this.nav.className = `bubble-menu ${this.options.useFixedPosition ? 'fixed' : 'absolute'}`;
    this.nav.setAttribute('aria-label', 'Main navigation');

    // Logo Bubble
    const logoBubble = document.createElement('div');
    logoBubble.className = 'bubble logo-bubble';
    logoBubble.setAttribute('aria-label', 'Logo');
    logoBubble.style.background = this.options.menuBg;
    
    const logoContent = document.createElement('span');
    logoContent.className = 'logo-content';
    if (typeof this.options.logo === 'string' && this.options.logo.startsWith('http')) {
      const img = document.createElement('img');
      img.src = this.options.logo;
      img.alt = 'Logo';
      img.className = 'bubble-logo';
      logoContent.appendChild(img);
    } else {
      logoContent.innerHTML = this.options.logo;
    }
    logoBubble.appendChild(logoContent);
    this.nav.appendChild(logoBubble);

    // Toggle Button
    this.toggleBtn = document.createElement('button');
    this.toggleBtn.type = 'button';
    this.toggleBtn.className = 'bubble toggle-bubble menu-btn';
    this.toggleBtn.setAttribute('aria-label', this.options.menuAriaLabel);
    this.toggleBtn.style.background = this.options.menuBg;

    const line1 = document.createElement('span');
    line1.className = 'menu-line';
    line1.style.background = this.options.menuContentColor;
    
    const line2 = document.createElement('span');
    line2.className = 'menu-line short';
    line2.style.background = this.options.menuContentColor;

    this.toggleBtn.appendChild(line1);
    this.toggleBtn.appendChild(line2);
    this.nav.appendChild(this.toggleBtn);

    this.container.appendChild(this.nav);

    // Overlay
    this.overlay = document.createElement('div');
    this.overlay.className = `bubble-menu-items ${this.options.useFixedPosition ? 'fixed' : 'absolute'}`;
    this.overlay.setAttribute('aria-hidden', 'true');
    
    const list = document.createElement('ul');
    list.className = 'pill-list';
    list.setAttribute('role', 'menu');
    list.setAttribute('aria-label', 'Menu links');

    this.bubbles = [];
    this.labels = [];

    this.options.items.forEach((item, idx) => {
      const li = document.createElement('li');
      li.className = 'pill-col';
      li.setAttribute('role', 'none');

      const a = document.createElement('a');
      a.className = 'pill-link';
      a.href = item.href;
      if (item.zone) a.setAttribute('data-zone', item.zone);
      a.setAttribute('role', 'menuitem');
      a.setAttribute('aria-label', item.ariaLabel || item.label);
      
      a.style.setProperty('--item-rot', `${item.rotation ?? 0}deg`);
      a.style.setProperty('--pill-bg', this.options.menuBg);
      a.style.setProperty('--pill-color', this.options.menuContentColor);
      a.style.setProperty('--hover-bg', item.hoverStyles?.bgColor || '#f3f4f6');
      a.style.setProperty('--hover-color', item.hoverStyles?.textColor || this.options.menuContentColor);

      const label = document.createElement('span');
      label.className = 'pill-label';
      label.textContent = item.label;

      a.appendChild(label);
      li.appendChild(a);
      list.appendChild(li);

      this.bubbles.push(a);
      this.labels.push(label);
    });

    this.overlay.appendChild(list);
    this.container.appendChild(this.overlay);
  }

  _bindEvents() {
    this.toggleBtn.addEventListener('click', () => this.handleToggle());
    
    this.bubbles.forEach(bubble => {
      bubble.addEventListener('click', () => {
        this.close();
      });
    });

    window.addEventListener('resize', () => {
      if (this.isMenuOpen) this._updateRotations();
    });
  }

  handleToggle() {
    this.isMenuOpen ? this.close() : this.open();
  }

  open() {
    this.isMenuOpen = true;
    this.toggleBtn.classList.add('open');
    this.toggleBtn.setAttribute('aria-pressed', 'true');
    this.overlay.setAttribute('aria-hidden', 'false');
    this.overlay.style.display = 'flex';

    if (this.options.onMenuClick) this.options.onMenuClick(true);

    gsap.killTweensOf([...this.bubbles, ...this.labels]);
    gsap.set(this.bubbles, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(this.labels, { y: 24, autoAlpha: 0 });

    this.bubbles.forEach((bubble, i) => {
      const delay = i * this.options.staggerDelay + (Math.random() * 0.1 - 0.05);
      const tl = gsap.timeline({ delay });

      tl.to(bubble, {
        scale: 1,
        duration: this.options.animationDuration,
        ease: this.options.animationEase
      });

      if (this.labels[i]) {
        tl.to(this.labels[i], {
          y: 0,
          autoAlpha: 1,
          duration: this.options.animationDuration,
          ease: 'power3.out'
        }, `-=${this.options.animationDuration * 0.9}`);
      }
    });

    this._updateRotations();
  }

  close() {
    this.isMenuOpen = false;
    this.toggleBtn.classList.remove('open');
    this.toggleBtn.setAttribute('aria-pressed', 'false');
    this.overlay.setAttribute('aria-hidden', 'true');

    if (this.options.onMenuClick) this.options.onMenuClick(false);

    gsap.killTweensOf([...this.bubbles, ...this.labels]);
    
    gsap.to(this.labels, {
      y: 24,
      autoAlpha: 0,
      duration: 0.2,
      ease: 'power3.in'
    });

    gsap.to(this.bubbles, {
      scale: 0,
      duration: 0.2,
      ease: 'power3.in',
      onComplete: () => {
        this.overlay.style.display = 'none';
      }
    });
  }

  _updateRotations() {
    const isDesktop = window.innerWidth >= 900;
    this.bubbles.forEach((bubble, i) => {
      const item = this.options.items[i];
      const rotation = isDesktop ? (item.rotation ?? 0) : 0;
      gsap.set(bubble, { rotation });
    });
  }
}

window.BubbleMenu = BubbleMenu;
