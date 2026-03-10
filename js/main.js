/* ═══════════════════════════════════════════════════
   main.js
════════════════════════════════════════════════════ */
(function () {

  /* ── SERVICE DATA ────────────────────────────── */
  var SERVICES = [
    { id: 'infrastructure', label: 'Infrastructure',          sub: 'ERDs, database design, cloud architecture', rate: 30, defaultHours: 30 },
    { id: 'web',            label: 'Web Design & Application',sub: 'Full-stack web applications & portals',     rate: 27, defaultHours: 40 },
    { id: 'data',           label: 'Data Engineering',        sub: 'ETL pipelines, analytics, dashboards',     rate: 30, defaultHours: 35 },
    { id: 'creative',       label: 'Creative UX / UI',        sub: 'Design systems & interactions',            rate: 27, defaultHours: 20 },
    { id: 'api',            label: 'API Integrations',        sub: 'Anthropic, OpenAI, REST, ML pipelines',    rate: 32, defaultHours: 25 },
  ];

  var cartState = {}; // id → hours

  /* ── NAV ─────────────────────────────────────── */
  function initNav() {
    var navbar  = document.getElementById('navbar');
    var toggle  = document.querySelector('.nav-toggle');
    var navList = document.querySelector('.nav-links');
    if (!navbar) return;
    window.addEventListener('scroll', function () {
      navbar.style.boxShadow = window.scrollY > 20 ? '0 2px 24px rgba(0,0,0,0.35)' : 'none';
    }, { passive: true });
    if (toggle && navList) {
      toggle.addEventListener('click', function () {
        var open = navList.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open);
      });
      navList.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { navList.classList.remove('open'); });
      });
    }
  }

  /* ── FADE-INS ────────────────────────────────── */
  function initFadeIns() {
    var els = document.querySelectorAll('.fade-in');
    if (!els.length || !window.IntersectionObserver) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.10 });
    els.forEach(function (el) { obs.observe(el); });
  }

  /* ── SECTION GLOW ────────────────────────────── */
  function initSectionGlow() {
    var sels = '#value-statement,#gateway,#combined-services,#packages-section,' +
               '#testimonials,#process-section,#tools-section,#about-cta,#sme-callout,' +
               '#services-deck-section,#about-sme-banner';
    var sections = document.querySelectorAll(sels);
    if (!sections.length || !window.IntersectionObserver) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) e.target.classList.add('section-glow-visible');
        else e.target.classList.remove('section-glow-visible');
      });
    }, { threshold: 0.12 });
    sections.forEach(function (s) { obs.observe(s); });
  }

  /* ── HEADER GLOW ─────────────────────────────── */
  function initHeaderGlow() {
    document.querySelectorAll('#hero h1, #about-hero h1, #services-hero h1').forEach(function (h) {
      var section = h.closest('section, header');
      if (!section) return;
      var glow = document.createElement('div');
      glow.className = 'header-glow-overlay';
      section.style.position = 'relative';
      section.appendChild(glow);
      h.addEventListener('mouseenter', function () { glow.classList.add('header-glow-active'); });
      h.addEventListener('mouseleave', function () { glow.classList.remove('header-glow-active'); });
    });
  }

  /* ── FLIP CARDS (home) ───────────────────────── */
  function initFlipCards() {
    var cards = document.querySelectorAll('.flip-card');
    if (!cards.length) return;
    var lastY = window.scrollY;
    window.addEventListener('scroll', function () {
      var cur = window.scrollY, down = cur > lastY; lastY = cur;
      cards.forEach(function (c) {
        var r = c.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.75 && r.bottom > 0) {
          if (down) c.classList.add('flipped'); else c.classList.remove('flipped');
        }
      });
    }, { passive: true });
  }

  /* ── BANNER & SME FLIP CARDS (click-to-flip) ─── */
  function initBannerFlipCards() {
    var selectors = '.about-banner-flip-card, .sme-flip-card';
    var cards = document.querySelectorAll(selectors);
    cards.forEach(function(card) {
      function toggle(e) {
        // don't flip if clicking a link inside the back
        if (e.target.tagName === 'A') return;
        card.classList.toggle('flipped');
      }
      card.addEventListener('click', toggle);
      card.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.classList.toggle('flipped'); }
      });
    });
  }

  /* ── TOWER (about) ───────────────────────────── */
  function initTower() {
    var layers      = document.querySelectorAll('.stack-layer');
    var towerBlocks = document.querySelectorAll('.tower-block');
    if (!layers.length) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var idx = parseInt(entry.target.getAttribute('data-layer'), 10);
        if (entry.isIntersecting) {
          entry.target.classList.add('layer-active');
          towerBlocks.forEach(function (b) {
            if (parseInt(b.getAttribute('data-index'), 10) <= idx) b.classList.add('active');
          });
        } else {
          if (entry.target.getBoundingClientRect().top > 0) {
            entry.target.classList.remove('layer-active');
            towerBlocks.forEach(function (b) {
              if (parseInt(b.getAttribute('data-index'), 10) >= idx) b.classList.remove('active');
            });
          }
        }
      });
    }, { threshold: 0.3, rootMargin: '0px 0px -10% 0px' });
    layers.forEach(function (l) { obs.observe(l); });
    towerBlocks.forEach(function (block) {
      block.style.cursor = 'pointer';
      block.addEventListener('click', function () {
        var idx   = block.getAttribute('data-index');
        var layer = document.querySelector('.stack-layer[data-layer="' + idx + '"]');
        if (layer) layer.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  }

  /* ═══════════════════════════════════════════════
     SERVICE LIST — vertical rows with expand/collapse
     Click row → expand detail → Add to Estimate btn
  ═══════════════════════════════════════════════ */
  function initServiceList() {
    var listEl = document.getElementById('service-list');
    if (!listEl) return;

    /* Detail content per service */
    var DETAILS = {
      infrastructure: {
        desc: 'ERD and database design, cloud architecture, and CI/CD pipelines. We design the backbone of your technical system so everything above it is stable and scalable.',
        items: ['Entity-relationship diagram (ERD) design', 'Database design &amp; SQL schema', 'Cloud architecture (AWS, GCP, Azure)', 'CI/CD pipeline setup'],
        link: 'about.html'
      },
      web: {
        desc: 'From architecture to deployment — we build web applications, internal tools, client portals, and SaaS products that are fast, reliable, and easy to hand off.',
        items: ['Frontend (React, HTML/CSS/JS)', 'Backend &amp; database integration', 'Authentication &amp; user management', 'Deployment &amp; hosting setup'],
        link: 'about.html'
      },
      data: {
        desc: 'Clean, structured data is the backbone of every intelligent system. We build ETL pipelines, analytics dashboards, and full process pipelines that turn raw data into reliable, actionable insight.',
        items: ['ETL pipeline design &amp; build', 'Analytics dashboards &amp; reporting', 'Full end-to-end process pipelines', 'Data modeling &amp; warehouse architecture'],
        link: 'about.html'
      },
      creative: {
        desc: 'Custom UX and UI design for web products, dashboards, and brand experiences — interactive, considered, and built with the same craft you see on this site.',
        items: ['UI design &amp; component systems', 'UX flow &amp; wireframing', 'Scroll animations &amp; micro-interactions', 'Brand-aligned web experiences'],
        link: 'about.html'
      },
      api: {
        desc: 'We integrate third-party services, AI tools, and internal systems into a unified platform — including AI automation using Anthropic and OpenAI to reduce repetitive tasks.',
        items: ['Anthropic / OpenAI API integration', 'SciKit Learn, XGBoost &amp; ML pipelines', 'REST &amp; GraphQL API development', 'CRM, ERP &amp; third-party connections'],
        link: 'about.html'
      }
    };

    SERVICES.forEach(function (svc) {
      var det = DETAILS[svc.id] || {};
      var itemsHtml = (det.items || []).map(function (item) {
        return '<li>' + item + '</li>';
      }).join('');

      var row = document.createElement('div');
      row.className = 'service-row beam-card';
      row.setAttribute('data-id', svc.id);

      row.innerHTML =
        '<div class="service-row-head">' +
          '<div class="service-row-left">' +
            '<span class="service-row-name">' + svc.label + '</span>' +
            '<span class="service-row-sub">' + svc.sub + '</span>' +
          '</div>' +
          '<div class="service-row-right">' +
            '<div style="display:flex;flex-direction:column;align-items:flex-end">' +
              '<span class="service-row-rate">from $' + svc.rate + ' / hr</span>' +
              '<span class="service-row-rate-note">starting price</span>' +
            '</div>' +
            '<span class="service-row-chevron">+</span>' +
          '</div>' +
        '</div>' +
        '<div class="service-row-expand">' +
          '<p class="service-row-desc">' + (det.desc || '') + '</p>' +
          '<div class="service-row-includes">' +
            '<span class="service-row-includes-label">Includes</span>' +
            '<ul>' + itemsHtml + '</ul>' +
          '</div>' +
          '<div class="service-row-footer">' +
            '<button class="service-add-btn" data-id="' + svc.id + '">+ Add to Estimate</button>' +
            '<a href="' + (det.link || 'about.html') + '" class="service-row-more">Read more on About →</a>' +
          '</div>' +
        '</div>';

      listEl.appendChild(row);
    });

    /* Toggle expand on row click */
    listEl.addEventListener('click', function (e) {
      var head = e.target.closest('.service-row-head');
      var addBtn = e.target.closest('.service-add-btn');

      if (addBtn) {
        var id = addBtn.getAttribute('data-id');
        var svc = null;
        for (var k = 0; k < SERVICES.length; k++) { if (SERVICES[k].id === id) { svc = SERVICES[k]; break; } }
        if (!svc) return;
        if (!cartState[id]) {
          cartState[id] = svc.defaultHours;
          addBtn.textContent = '✓ Added';
          addBtn.classList.add('service-add-btn--added');
        } else {
          delete cartState[id];
          addBtn.textContent = '+ Add to Estimate';
          addBtn.classList.remove('service-add-btn--added');
        }
        renderCart();
        return;
      }

      if (head) {
        var row = head.closest('.service-row');
        var isOpen = row.classList.contains('service-row--open');
        /* Close all */
        listEl.querySelectorAll('.service-row--open').forEach(function (r) {
          r.classList.remove('service-row--open');
          var ch = r.querySelector('.service-row-chevron');
          if (ch) ch.textContent = '+';
        });
        if (!isOpen) {
          row.classList.add('service-row--open');
          var chev = row.querySelector('.service-row-chevron');
          if (chev) chev.textContent = '−';
        }
      }
    });

    /* Cart clear */
    var clearBtn = document.getElementById('cart-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        cartState = {};
        listEl.querySelectorAll('.service-add-btn').forEach(function (btn) {
          btn.textContent = '+ Add to Estimate';
          btn.classList.remove('service-add-btn--added');
        });
        renderCart();
      });
    }
  }

  /* ── COLLAPSIBLE CALCULATOR TAB ──────────────── */
  function initCalcTab() {
    /* Tab is no longer used — calculator is inline. No-op. */
  }

  /* ── CART RENDER ─────────────────────────────── */
  function renderCart() {
    var container = document.getElementById('cart-items');
    var totalRow  = document.getElementById('cart-total-row');
    var totalVal  = document.getElementById('cart-total-value');
    var ctaBlock  = document.getElementById('cart-cta');
    var emptyMsg  = document.getElementById('cart-empty');
    if (!container) return;

    var ids = Object.keys(cartState);

    if (ids.length === 0) {
      container.innerHTML = '';
      if (emptyMsg) { emptyMsg.style.display = 'block'; container.appendChild(emptyMsg); }
      if (totalRow) totalRow.style.display = 'none';
      if (ctaBlock) ctaBlock.style.display = 'none';
      return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';

    var html = '', total = 0;

    ids.forEach(function (id) {
      var svc = null;
      for (var k = 0; k < SERVICES.length; k++) { if (SERVICES[k].id === id) { svc = SERVICES[k]; break; } }
      if (!svc) return;
      var hrs  = cartState[id];
      var cost = svc.rate * hrs;
      total += cost;
      html +=
        '<div class="cart-item" data-id="' + id + '">' +
          '<div class="cart-item-top">' +
            '<span class="cart-item-name">' + svc.label + '</span>' +
            '<span class="cart-item-subtotal">$' + cost.toLocaleString() + '</span>' +
          '</div>' +
          '<div class="cart-item-rate">$' + svc.rate + ' / hr</div>' +
          '<div class="cart-slider-row">' +
            '<input type="range" min="1" max="300" value="' + hrs + '" ' +
              'class="cart-slider" data-id="' + id + '" />' +
            '<span class="cart-hours-label">' + hrs + ' hrs</span>' +
          '</div>' +
        '</div>';
    });

    container.innerHTML = html;

    container.querySelectorAll('.cart-slider').forEach(function (slider) {
      slider.addEventListener('input', function () {
        var id   = slider.getAttribute('data-id');
        var hrs  = parseInt(slider.value, 10);
        cartState[id] = hrs;
        var item = slider.closest('.cart-item');
        var lbl  = item.querySelector('.cart-hours-label');
        var sub  = item.querySelector('.cart-item-subtotal');
        var svc  = null;
        for (var k = 0; k < SERVICES.length; k++) { if (SERVICES[k].id === id) { svc = SERVICES[k]; break; } }
        if (lbl) lbl.textContent = hrs + ' hrs';
        if (sub && svc) sub.textContent = '$' + (svc.rate * hrs).toLocaleString();
        var t = 0, rateSum = 0, count = 0;
        Object.keys(cartState).forEach(function (k) {
          var s = null;
          for (var j = 0; j < SERVICES.length; j++) { if (SERVICES[j].id === k) { s = SERVICES[j]; break; } }
          if (s) { t += s.rate * cartState[k]; rateSum += s.rate; count++; }
        });
        if (totalVal) totalVal.textContent = '$' + t.toLocaleString();
        var avgRow = document.getElementById('cart-avg-row');
        var avgVal = document.getElementById('cart-avg-value');
        if (avgRow && avgVal && count > 0) {
          avgRow.style.display = 'flex';
          avgVal.textContent = '$' + (rateSum / count).toFixed(2) + ' / hr';
        }
      });
    });

    if (totalRow) totalRow.style.display = 'flex';
    if (totalVal) totalVal.textContent   = '$' + total.toLocaleString();
    if (ctaBlock) ctaBlock.style.display = 'block';
  }

  /* ── BEAM ANIMATION ──────────────────────────── */
  function initBeamCards() {
    document.querySelectorAll('.beam-card').forEach(function (card) {
      var canvas = document.createElement('canvas');
      canvas.className = 'beam-canvas';
      card.appendChild(canvas);

      var ctx = null, w = 0, h = 0, progress = 0, raf = null, active = false;

      function resize() { w = canvas.width = card.offsetWidth; h = canvas.height = card.offsetHeight; }

      function perimToXY(d, perim) {
        d = ((d % perim) + perim) % perim;
        if (d < w)  return { x: d,     y: 0     };
        d -= w;
        if (d < h)  return { x: w,     y: d     };
        d -= h;
        if (d < w)  return { x: w - d, y: h     };
        d -= w;
        return             { x: 0,     y: h - d };
      }

      function drawBeam() {
        ctx.clearRect(0, 0, w, h);
        var perim = 2 * (w + h), pos = (progress % 1) * perim, beamLen = perim * 0.20, steps = 48;
        for (var i = 0; i < steps; i++) {
          var alpha = i / steps;
          var pt    = perimToXY(pos - beamLen * (1 - alpha),         perim);
          var pt2   = perimToXY(pos - beamLen * (1 - (i + 1) / steps), perim);
          ctx.beginPath(); ctx.moveTo(pt.x, pt.y); ctx.lineTo(pt2.x, pt2.y);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(181,204,218,' + (alpha * 0.9) + ')';
          ctx.stroke();
        }
      }

      function loop() { progress += 0.0035; drawBeam(); raf = requestAnimationFrame(loop); }

      function stop() { active = false; if (raf) { cancelAnimationFrame(raf); raf = null; } if (ctx) ctx.clearRect(0, 0, w, h); }

      card.addEventListener('mouseenter', function () {
        if (active) return; active = true; resize();
        if (!ctx) ctx = canvas.getContext('2d'); loop();
      });
      card.addEventListener('mouseleave', stop);
      window.addEventListener('resize', function () { if (active) resize(); });
    });
  }

  /* ── MUSIC WIDGET ────────────────────────────── */
  function initMusic() {
    var toggle = document.getElementById('music-toggle');
    var embed  = document.getElementById('spotify-embed');
    var label  = document.getElementById('music-label');
    if (!toggle || !embed) return;
    toggle.addEventListener('click', function () {
      var open = embed.classList.toggle('open');
      if (label) label.textContent = open ? 'Hide' : 'Music';
    });
  }

  /* ── SCROLL BALL (home page) ─────────────────── */
  function initScrollBall() {
    var ball = document.getElementById('scroll-ball');
    if (!ball) return;

    var NAV_H  = 80;
    var EDGE   = 48;
    var sectionIds = ['hero','value-statement','gateway','membership-home','lastPanel'];
    var bounced = {};

    function getMaxScroll() { return Math.max(1, document.documentElement.scrollHeight - window.innerHeight); }

    function update() {
      var scrollY   = window.scrollY;
      var maxScroll = getMaxScroll();
      var progress  = Math.min(1, scrollY / maxScroll);

      var minY = NAV_H + EDGE;
      var maxY = window.innerHeight - EDGE;
      var vy   = minY + (maxY - minY) * progress;

      /* subtle sine for liveliness between bounces */
      var sine  = Math.sin(progress * Math.PI * 12) * 3;

      ball.style.top = (vy + sine) + 'px';

      /* fade: hidden at very top AND very bottom of page */
      var fadeInEnd   = 60;                        /* fully visible after 60px scroll */
      var fadeOutStart = maxScroll * 0.88;         /* start fading 12% before bottom */
      var opacity = 1;
      if (scrollY < fadeInEnd) {
        opacity = scrollY / fadeInEnd;
      } else if (scrollY > fadeOutStart) {
        opacity = 1 - (scrollY - fadeOutStart) / (maxScroll - fadeOutStart);
      }
      ball.style.opacity = Math.max(0, Math.min(1, opacity));

      /* bounce at section boundaries */
      sectionIds.forEach(function (id) {
        var sec = document.getElementById(id);
        if (!sec) return;
        var rect = sec.getBoundingClientRect();
        if (Math.abs(rect.top) < 90 && !bounced[id]) {
          bounced[id] = true;
          ball.classList.remove('ball-squish');
          void ball.offsetWidth;
          ball.classList.add('ball-squish');
          setTimeout(function () { bounced[id] = false; }, 1200);
        }
      });
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ── BOOT ────────────────────────────────────── */
  function boot() {
    initNav();
    initFadeIns();
    initSectionGlow();
    initHeaderGlow();
    initFlipCards();
    initBannerFlipCards();
    initTower();
    initServiceList();
    initCalcTab();
    initBeamCards();
    initMusic();
    initScrollBall();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }

})();
