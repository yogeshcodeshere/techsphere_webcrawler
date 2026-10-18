document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     1. Mobile Menu Functionality
     ========================================================================== */
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobileMenu = document.getElementById('mobileMenu');

  function openMenu() {
    burgerBtn.setAttribute('aria-expanded', 'true');
    mobileOverlay.removeAttribute('hidden');
    mobileMenu.removeAttribute('hidden');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-open');
  }

  function closeMenu() {
    burgerBtn.setAttribute('aria-expanded', 'false');
    mobileOverlay.setAttribute('hidden', '');
    mobileMenu.setAttribute('hidden', '');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
  }

  function toggleMenu() {
    const isExpanded = burgerBtn.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  if (burgerBtn && mobileOverlay && mobileMenu) {
    burgerBtn.addEventListener('click', toggleMenu);
    mobileOverlay.addEventListener('click', closeMenu);

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && burgerBtn.getAttribute('aria-expanded') === 'true') {
        closeMenu();
      }
    });

    // Close on mobile link click
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileLinks.forEach((l) => l.classList.remove('active'));
        if (link.classList.contains('mobile-nav-link')) {
          link.classList.add('active');
        }
        closeMenu();
      });
    });

    // Close on resize > 880px
    window.addEventListener('resize', () => {
      if (window.innerWidth > 880 && burgerBtn.getAttribute('aria-expanded') === 'true') {
        closeMenu();
      }
    });
  }

  /* Desktop nav link active state */
  const desktopLinks = document.querySelectorAll('.nav-pill .nav-link');
  desktopLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      desktopLinks.forEach((l) => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  /* ==========================================================================
     2. Stats Count-Up Animation
     ========================================================================== */
  const statNumbers = document.querySelectorAll('.stat-number');
  const statsFooter = document.querySelector('.stats-footer');

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function startCountUp(element, target, decimals, duration, startOffset) {
    setTimeout(() => {
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutCubic(progress);
        const currentValue = easedProgress * target;

        element.textContent = currentValue.toFixed(decimals);

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          element.textContent = target.toFixed(decimals);
        }
      }

      requestAnimationFrame(update);
    }, startOffset);
  }

  if (statsFooter && statNumbers.length > 0) {
    let hasAnimated = false;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      statNumbers.forEach((el) => {
        const target = parseFloat(el.getAttribute('data-target') || '0');
        const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
        el.textContent = target.toFixed(decimals);
      });
    } else {
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !hasAnimated) {
              hasAnimated = true;
              obs.disconnect();

              statNumbers.forEach((el, index) => {
                const target = parseFloat(el.getAttribute('data-target') || '0');
                const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
                const duration = 1500 + index * 80;
                const startOffset = 480 + index * 90;

                startCountUp(el, target, decimals, duration, startOffset);
              });
            }
          });
        },
        { threshold: 0.25 }
      );

      observer.observe(statsFooter);
    }
  }

  /* ==========================================================================
     3. Smooth Scroll to Explore Section (on index.html)
     ========================================================================== */
  const ctaBtn = document.getElementById('ctaBtn') || document.querySelector('.cta-btn');
  const exploreSection = document.getElementById('explore');
  const exploreBackBtn = document.getElementById('exploreBackBtn');

  if (ctaBtn && exploreSection) {
    ctaBtn.addEventListener('click', (e) => {
      e.preventDefault();
      exploreSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (window.history && window.history.pushState) {
        window.history.pushState(null, '', '#explore');
      }
    });
  }

  if (exploreBackBtn) {
    exploreBackBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.history && window.history.pushState) {
        window.history.pushState(null, '', window.location.pathname);
      }
    });
  }

  // Smooth scroll if URL already contains #explore
  if (window.location.hash === '#explore' && exploreSection) {
    setTimeout(() => {
      exploreSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  }

  /* ==========================================================================
     4. Scroll-based Dark Frosted Overlay Fade-in (on index.html)
     ========================================================================== */
  const bgScrollOverlay = document.getElementById('bgScrollOverlay');
  if (bgScrollOverlay) {
    let ticking = false;

    function handleScrollOverlay() {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      // Smooth fade-in: starts fading immediately on scroll and reaches full effect by ~450px
      const fadeDistance = Math.min(window.innerHeight * 0.65, 480);
      const progress = Math.min(Math.max(scrollY / fadeDistance, 0), 1);

      bgScrollOverlay.style.opacity = progress.toFixed(3);
      ticking = false;
    }

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          window.requestAnimationFrame(handleScrollOverlay);
          ticking = true;
        }
      },
      { passive: true }
    );

    // Initial check on page load or refresh
    handleScrollOverlay();
  }
});



