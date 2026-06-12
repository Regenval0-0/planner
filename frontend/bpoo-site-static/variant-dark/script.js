document.addEventListener('DOMContentLoaded', () => {
  // ---- Current year in footer ----
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- Mobile menu toggle ----
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const expanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', String(!expanded));
      mobileToggle.setAttribute('aria-label', expanded ? 'Открыть меню' : 'Закрыть меню');
      if (expanded) {
        mobileMenu.setAttribute('hidden', '');
        document.body.style.overflow = '';
      } else {
        mobileMenu.removeAttribute('hidden');
        document.body.style.overflow = 'hidden';
      }
    });

    // Close mobile menu on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileToggle.setAttribute('aria-label', 'Открыть меню');
        mobileMenu.setAttribute('hidden', '');
        document.body.style.overflow = '';
      });
    });
  }

  // ---- Accordion ----
  const accordionTriggers = document.querySelectorAll('.accordion-trigger');

  accordionTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      const body = trigger.nextElementSibling;

      // Close all others (optional — remove this block for multi-open)
      accordionTriggers.forEach(other => {
        if (other !== trigger) {
          other.setAttribute('aria-expanded', 'false');
          const otherBody = other.nextElementSibling;
          if (otherBody) otherBody.classList.remove('open');
        }
      });

      trigger.setAttribute('aria-expanded', String(!expanded));
      if (body) body.classList.toggle('open', !expanded);
    });
  });

  // ---- Smooth scroll offset for fixed header ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerHeight = 80;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    });
  });

  // ---- Header shadow on scroll ----
  const header = document.querySelector('.site-header');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 10) {
      header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
    } else {
      header.style.boxShadow = '0 1px 0 rgba(0,0,0,0.05)';
    }
    lastScroll = currentScroll;
  });
});
