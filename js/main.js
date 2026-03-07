/* ═══════════════════════════════════════════════════
   main.js — general page interactions
   Nav scroll effect + section fade-ins
════════════════════════════════════════════════════ */

(function () {

  /* ── Nav: add shadow when scrolled ────────────── */
  var navbar = document.getElementById('navbar');

  window.addEventListener('scroll', function () {
    if (window.scrollY > 20) {
      navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.06)';
    } else {
      navbar.style.boxShadow = 'none';
    }
  }, { passive: true });

  /* ── Fade-in on scroll ─────────────────────────
     Add class="fade-in" to any element in HTML
     and it will animate in when scrolled into view  */
  var fadeEls = document.querySelectorAll('.fade-in');

  if (fadeEls.length > 0) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // only animate once
        }
      });
    }, { threshold: 0.15 });

    fadeEls.forEach(function (el) {
      observer.observe(el);
    });
  }

})();
