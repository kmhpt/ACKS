/* ═══════════════════════════════════════════════════
   main.js
════════════════════════════════════════════════════ */
(function () {

  /* ── SERVICE DATA ────────────────────────────── */
  var SERVICES = [
    { id: 'web',            label: 'Web Design & Apps',   sub: 'Full-stack web applications',      rate: 45, defaultHours: 40, color: '#1a2a3a' },
    { id: 'infrastructure', label: 'Infrastructure',       sub: 'ERDs, DB design, cloud arch.',     rate: 40, defaultHours: 30, color: '#0f1e2e' },
    { id: 'api',            label: 'API Integrations',     sub: 'Anthropic, OpenAI, REST, ML',      rate: 55, defaultHours: 25, color: '#14283a' },
    { id: 'data',           label: 'Data Engineering',     sub: 'ETL, analytics, pipelines',        rate: 35, defaultHours: 35, color: '#0d1a28' },
    { id: 'creative',       label: 'Creative UX / UI',     sub: 'Design systems & interactions',    rate: 25, defaultHours: 20, color: '#1c1828' },
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
     SERVICE CARD DECK
     Cards overlap like a deck. Each is angled.
     Hover → highlights. Click → rotates flat (toggle).
     Flat card → detail panel slides in from left.
  ═══════════════════════════════════════════════ */
  function initDeck() {
    var deckEl = document.getElementById('service-deck');
    if (!deckEl) return;

    /* Layout constants */
    var CARD_W   = 320;
    var CARD_H   = 80;
    var STACK_ANGLE = 10;  // degrees each card fans out
    var OFFSET_Y    = 18;  // px vertical separation between stacked cards
    var OFFSET_X    = 8;   // slight horizontal fan

    /* Build card elements */
    SERVICES.forEach(function (svc, i) {
      var card = document.createElement('div');
      card.className   = 'deck-card';
      card.setAttribute('data-id', svc.id);
      card.setAttribute('data-index', i);

      /* Stacking angle: middle card is flattest, outer cards more angled */
      var mid    = (SERVICES.length - 1) / 2;
      var angle  = (i - mid) * STACK_ANGLE * 0.6;
      var yOff   = i * OFFSET_Y;
      var xOff   = (i - mid) * OFFSET_X;

      card.style.cssText =
        'position:absolute;' +
        'width:' + CARD_W + 'px;' +
        'height:' + CARD_H + 'px;' +
        'left:50%;' +
        'top:' + yOff + 'px;' +
        'transform:translateX(-50%) rotate(' + angle + 'deg);' +
        'transform-origin:center center;' +
        'background:' + svc.color + ';' +
        'border:1px solid rgba(181,204,218,0.18);' +
        'cursor:pointer;' +
        'transition:transform 0.55s cubic-bezier(0.34,1.2,0.64,1),' +
                    'box-shadow 0.3s ease,border-color 0.3s ease,' +
                    'background 0.3s ease;' +
        'border-radius:2px;' +
        'display:flex;align-items:center;padding:0 1.4rem;gap:1rem;' +
        'z-index:' + (10 + i) + ';';

      /* Rate badge */
      var rateBadge = document.createElement('span');
      rateBadge.className = 'deck-rate';
      rateBadge.textContent = '$' + svc.rate + '/hr';

      /* Text */
      var textWrap = document.createElement('div');
      textWrap.style.cssText = 'flex:1;overflow:hidden;';

      var title = document.createElement('div');
      title.className   = 'deck-title';
      title.textContent = svc.label;

      var sub = document.createElement('div');
      sub.className   = 'deck-sub';
      sub.textContent = svc.sub;

      textWrap.appendChild(title);
      textWrap.appendChild(sub);
      card.appendChild(rateBadge);
      card.appendChild(textWrap);

      /* Selected indicator dot */
      var dot = document.createElement('div');
      dot.className = 'deck-dot';
      card.appendChild(dot);

      deckEl.appendChild(card);
    });

    /* Set deck wrapper height */
    var totalH = (SERVICES.length - 1) * OFFSET_Y + CARD_H + 60;
    deckEl.style.position = 'relative';
    deckEl.style.height   = totalH + 'px';
    deckEl.style.width    = CARD_W + 40 + 'px';
    deckEl.style.margin   = '0 auto';

    /* Interaction */
    var cards  = deckEl.querySelectorAll('.deck-card');
    var panels = document.querySelectorAll('.service-panel');
    var closes = document.querySelectorAll('.panel-close');

    function setCardFlat(card, flat) {
      var i     = parseInt(card.getAttribute('data-index'), 10);
      var mid   = (SERVICES.length - 1) / 2;
      var angle = (i - mid) * STACK_ANGLE * 0.6;
      var yOff  = i * OFFSET_Y;

      if (flat) {
        card.style.transform = 'translateX(-50%) rotate(0deg) translateY(' + (yOff * 0.4) + 'px)';
        card.style.borderColor = 'rgba(0,212,255,0.7)';
        card.style.boxShadow   = '0 0 24px rgba(0,212,255,0.25)';
        card.style.background  = '#1a3248';
      } else {
        card.style.transform = 'translateX(-50%) rotate(' + angle + 'deg)';
        card.style.borderColor = 'rgba(181,204,218,0.18)';
        card.style.boxShadow   = 'none';
        var svc = SERVICES[i];
        card.style.background = svc ? svc.color : '#0d1117';
        card.classList.remove('deck-selected');
      }
    }

    cards.forEach(function (card) {
      var id = card.getAttribute('data-id');

      card.addEventListener('mouseenter', function () {
        if (card.classList.contains('deck-selected')) return;
        var i   = parseInt(card.getAttribute('data-index'), 10);
        var mid = (SERVICES.length - 1) / 2;
        var ang = (i - mid) * STACK_ANGLE * 0.6;
        var yOff = i * OFFSET_Y;
        card.style.transform   = 'translateX(-50%) rotate(' + (ang * 0.3) + 'deg) translateY(' + (yOff * 0.95 - 6) + 'px)';
        card.style.borderColor = 'rgba(181,204,218,0.5)';
        card.style.boxShadow   = '0 4px 20px rgba(0,0,0,0.4)';
        card.style.background  = '#223040';
      });

      card.addEventListener('mouseleave', function () {
        if (card.classList.contains('deck-selected')) return;
        setCardFlat(card, false);
      });

      card.addEventListener('click', function () {
        var isSelected = card.classList.contains('deck-selected');

        if (isSelected) {
          /* Deselect: rotate back to angled */
          card.classList.remove('deck-selected');
          setCardFlat(card, false);
          /* Close panel */
          var panel = document.getElementById('panel-' + id);
          if (panel) panel.classList.remove('panel-active');
          delete cartState[id];
        } else {
          /* Select: flatten */
          card.classList.add('deck-selected');
          setCardFlat(card, true);
          /* Close other panels, open this one */
          panels.forEach(function (p) { p.classList.remove('panel-active'); });
          var panel = document.getElementById('panel-' + id);
          if (panel) panel.classList.add('panel-active');
          /* Add to cart */
          var svc = SERVICES.find ? SERVICES.find(function (s) { return s.id === id; }) :
            (function () { for (var k = 0; k < SERVICES.length; k++) { if (SERVICES[k].id === id) return SERVICES[k]; } })();
          if (svc) cartState[id] = svc.defaultHours;
        }
        renderCart();
      });
    });

    /* Panel close buttons */
    closes.forEach(function (btn) {
      btn.addEventListener('click', function () {
        panels.forEach(function (p) { p.classList.remove('panel-active'); });
      });
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.service-panel') &&
          !e.target.closest('.deck-card') &&
          !e.target.closest('#cart-panel') &&
          !e.target.closest('#calc-tab')) {
        panels.forEach(function (p) { p.classList.remove('panel-active'); });
      }
    });

    /* Cart clear */
    var clearBtn = document.getElementById('cart-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        cartState = {};
        cards.forEach(function (c) {
          c.classList.remove('deck-selected');
          setCardFlat(c, false);
        });
        panels.forEach(function (p) { p.classList.remove('panel-active'); });
        renderCart();
      });
    }
  }

  /* ── COLLAPSIBLE CALCULATOR TAB ──────────────── */
  function initCalcTab() {
    var wrapper = document.getElementById('calc-wrapper');
    var tab     = document.getElementById('calc-tab');
    var icon    = document.getElementById('calc-tab-icon');
    if (!wrapper || !tab) return;

    var open = true; // starts open

    tab.addEventListener('click', function () {
      open = !open;
      if (open) {
        wrapper.classList.remove('calc-closed');
        icon.innerHTML = '&#9654;'; // ▶ points right (close)
      } else {
        wrapper.classList.add('calc-closed');
        icon.innerHTML = '&#9664;'; // ◀ points left (open)
      }
    });
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
        var t = 0;
        Object.keys(cartState).forEach(function (k) {
          var s = null;
          for (var j = 0; j < SERVICES.length; j++) { if (SERVICES[j].id === k) { s = SERVICES[j]; break; } }
          if (s) t += s.rate * cartState[k];
        });
        if (totalVal) totalVal.textContent = '$' + t.toLocaleString();
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

  /* ── BOOT ────────────────────────────────────── */
  function boot() {
    initNav();
    initFadeIns();
    initSectionGlow();
    initHeaderGlow();
    initFlipCards();
    initTower();
    initDeck();
    initCalcTab();
    initBeamCards();
    initMusic();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }

})();
