/**
 * Teligathi Tales - Main JavaScript
 * Premium Dark-Mode Experience & Interactive Animations
 * 
 * Features:
 * 1. Sticky Navigation Scroll Effect (requestAnimationFrame + passive listener)
 * 2. Mobile Hamburger Menu (Toggle, outside click, link click, keyboard accessibility)
 * 3. Smooth Scrolling for Navigation Links (with fixed nav offset calculation)
 * 4. Scroll-Triggered Fade-In Animations (IntersectionObserver + staggered delays)
 * 5. Hero Logo Entrance Animation (300ms delay hero-loaded trigger)
 * 6. Active Nav Link Highlighting (IntersectionObserver for sections)
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initStickyNav();
  initMobileMenu();
  initSmoothScroll();
  initScrollAnimations();
  initHeroAnimation();
  initActiveNavHighlight();
});

/**
 * 1. Sticky Navigation Scroll Effect
 * Toggles 'nav-scrolled' on <nav> when window.scrollY > 50
 * Uses requestAnimationFrame and passive scroll event listener for 60fps/120fps performance.
 */
function initStickyNav() {
  const nav = document.querySelector('nav');
  if (!nav) return;

  const scrollThreshold = 50;
  let ticking = false;

  const updateNavState = () => {
    if (window.scrollY > scrollThreshold) {
      nav.classList.add('nav-scrolled');
    } else {
      nav.classList.remove('nav-scrolled');
    }
    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateNavState);
      ticking = true;
    }
  };

  // Run initial check on page load (e.g. if refreshed mid-page)
  updateNavState();

  window.addEventListener('scroll', onScroll, { passive: true });
}

/**
 * 2. Mobile Hamburger Menu
 * Toggles 'nav-open' on <nav> when .hamburger is clicked.
 * Automatically closes on nav link click, click outside, or Escape key press.
 */
function initMobileMenu() {
  const nav = document.querySelector('nav');
  const hamburger = document.querySelector('.hamburger');
  if (!nav || !hamburger) return;

  const navLinks = nav.querySelectorAll('a');

  const setMenuState = (isOpen) => {
    nav.classList.toggle('nav-open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    hamburger.classList.toggle('is-active', isOpen);
  };

  const toggleMenu = () => {
    const isOpen = nav.classList.contains('nav-open');
    setMenuState(!isOpen);
  };

  // Toggle on hamburger click
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Close menu when a navigation link is clicked
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (nav.classList.contains('nav-open')) {
        setMenuState(false);
      }
    });
  });

  // Close menu when clicking outside the nav element
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('nav-open') && !nav.contains(e.target)) {
      setMenuState(false);
    }
  });

  // Close menu on Escape key for accessibility
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('nav-open')) {
      setMenuState(false);
      hamburger.focus();
    }
  });
}

/**
 * 3. Smooth Scroll for Navigation Links
 * Smoothly scrolls to target section accounting for the fixed navigation offset (~70px).
 */
function initSmoothScroll() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  const nav = document.querySelector('nav');

  anchorLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();

        // Calculate dynamic nav height with 70px fallback
        const navHeight = nav ? nav.offsetHeight : 70;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // Update URL hash cleanly without instant jump
        if (history.pushState) {
          history.pushState(null, '', targetId);
        }
      }
    });
  });
}

/**
 * 4. Scroll-Triggered Fade-In Animations
 * Uses IntersectionObserver (threshold: 0.15, rootMargin: '0px 0px -50px 0px')
 * Staggers card transition-delays (0ms, 100ms, 200ms, ...) dynamically and unobserves once animated.
 */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.fade-in-up');
  if (!animatedElements.length) return;

  // Fallback for browsers without IntersectionObserver support
  if (!('IntersectionObserver' in window)) {
    animatedElements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = entry.target;

        // Apply staggered animation delay to sibling cards in the same container/grid
        const parent = target.parentElement;
        if (parent) {
          const siblings = Array.from(parent.querySelectorAll('.fade-in-up'));
          if (siblings.length > 1) {
            const index = siblings.indexOf(target);
            if (index !== -1) {
              target.style.transitionDelay = `${index * 100}ms`;
            }
          }
        }

        target.classList.add('is-visible');
        obs.unobserve(target);
      }
    });
  }, observerOptions);

  animatedElements.forEach((el) => observer.observe(el));
}

/**
 * 5. Hero Logo Entrance Animation
 * Adds '.hero-loaded' class to '.hero-content' 300ms after DOMContentLoaded
 * to trigger the CSS fadeInScale animation.
 */
function initHeroAnimation() {
  const heroContent = document.querySelector('.hero-content');
  if (!heroContent) return;

  setTimeout(() => {
    heroContent.classList.add('hero-loaded');
  }, 300);
}

/**
 * 6. Active Nav Link Highlighting
 * Uses IntersectionObserver on sections to add/remove '.active' on matching nav links.
 */
function initActiveNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('nav a[href^="#"]');

  if (!sections.length || !navLinks.length) return;
  if (!('IntersectionObserver' in window)) return;

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const setActiveLink = (id) => {
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === `#${id}`) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        if (id) {
          setActiveLink(id);
        }
      }
    });
  }, observerOptions);

  sections.forEach((section) => sectionObserver.observe(section));
}
