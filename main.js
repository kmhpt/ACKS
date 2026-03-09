/* ═══════════════════════════════════════════════════
   main.js
════════════════════════════════════════════════════ */
(function () {

  /* ── SERVICE DATA ────────────────────────────── */
  var SERVICES = [
    { id: 'infrastructure', label: 'Infrastructure',           sub: 'ERDs, DB design, cloud arch.',  rate: 27, defaultHours: 30 },
    { id: 'web',            label: 'Web Design & Application', sub: 'Full-stack web applications',   rate: 25, defaultHours: 40 },
    { id: 'data',           label: 'Data Engineering',         sub: 'ETL, analytics, pipelines',     rate: 27, defaultHours: 35 },
    { id: 'creative',       label: 'Creative UX / UI',         sub: 'Design systems & interactions', rate: 25, defaultHours: 20 },
    { id: 'api',            label: 'API Integrations',         sub: 'Anthropic, OpenAI, REST, ML',   rate: 28, defaultHours: 25 },
  ];

  var cartState = {};

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

  /* ── FLIP CARDS ──────────────────────────────── */
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
     SERVICE DECK — VERTICAL LIST
  ═══════════════════════════════════════════════ */
  function initDeck() {
    var deckEl = document.getElementById('service-deck');
    if (!deckEl) return;

    SERVICES.forEach(function (svc, i) {
      var card = document.createElement('div');
      card.className = 'deck-card';
      card.setAttribute('data-id', svc.id);
      card.setAttribute('data-index', i);

      var rateBadge = document.createElement('span');
      rateBadge.className   = 'deck-rate';
      rateBadge.textContent = '$' + svc.rate + '/hr';

      var textWrap = document.createElement('div');
      textWrap.style.cssText = 'flex:1;overflow:hidden;min-width:0;';

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

      var dot = document.createElement('div');
      dot.className = 'deck-dot';
      card.appendChild(dot);

      deckEl.appendChild(card);
    });

    var cards  = deckEl.querySelectorAll('.deck-card');
    var panels = document.querySelectorAll('.service-panel');
    var closes = document.querySelectorAll('.panel-close');

    cards.forEach(function (card) {
      var id = card.getAttribute('data-id');

      card.addEventListener('click', function () {
        var isSelected = card.classList.contains('deck-selected');

        if (isSelected) {
          card.classList.remove('deck-selected');
          var panel = document.getElementById('panel-' + id);
          if (panel) panel.classList.remove('panel-active');
          delete cartState[id];
        } else {
          card.classList.add('deck-selected');
          panels.forEach(function (p) { p.classList.remove('panel-active'); });
          var panel = document.getElementById('panel-' + id);
          if (panel) panel.classList.add('panel-active');
          var svc = null;
          for (var k = 0; k < SERVICES.length; k++) {
            if (SERVICES[k].id === id) { svc = SERVICES[k]; break; }
          }
          if (svc) cartState[id] = svc.defaultHours;
        }
        renderCart();
      });
    });

    closes.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        panels.forEach(function (p) { p.classList.remove('panel-active'); });
      });
    });

    var clearBtn = document.getElementById('cart-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        cartState = {};
        cards.forEach(function (c) { c.classList.remove('deck-selected'); });
        panels.forEach(function (p) { p.classList.remove('panel-active'); });
        renderCart();
      });
    }
  }

  /* ── CALCULATOR TAB TOGGLE ───────────────────── */
  function initCalcTab() {
    var wrapper = document.getElementById('calc-wrapper');
    var tab     = document.getElementById('calc-tab');
    var icon    = document.getElementById('calc-tab-icon');
    if (!wrapper || !tab) return;

    var open = true;
    wrapper.classList.remove('calc-closed');

    tab.addEventListener('click', function () {
      open = !open;
      if (open) {
        wrapper.classList.remove('calc-closed');
        if (icon) icon.innerHTML = '&#9664;';
      } else {
        wrapper.classList.add('calc-closed');
        if (icon) icon.innerHTML = '&#9654;';
      }
    });
  }

  /* ── CART RENDER ─────────────────────────────── */
  function renderCart() {
    var container   = document.getElementById('cart-items');
    var totalRow    = document.getElementById('cart-total-row');
    var totalVal    = document.getElementById('cart-total-value');
    var ctaBlock    = document.getElementById('cart-cta');
    var emptyMsg    = document.getElementById('cart-empty');
    var avgBlock    = document.getElementById('cart-avg-rate');
    var avgVal      = document.getElementById('cart-avg-val');
    var loginPrompt = document.getElementById('cart-login-prompt');
    if (!container) return;

    var ids = Object.keys(cartState);

    if (ids.length === 0) {
      container.innerHTML = '';
      if (emptyMsg)    { emptyMsg.style.display = 'block'; container.appendChild(emptyMsg); }
      if (totalRow)    totalRow.style.display  = 'none';
      if (ctaBlock)    ctaBlock.style.display  = 'none';
      if (avgBlock)    avgBlock.classList.remove('visible');
      if (loginPrompt) loginPrompt.classList.remove('visible');
      return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';

    var html = '', total = 0, totalHours = 0, weightedSum = 0;

    ids.forEach(function (id) {
      var svc = null;
      for (var k = 0; k < SERVICES.length; k++) { if (SERVICES[k].id === id) { svc = SERVICES[k]; break; } }
      if (!svc) return;
      var hrs  = cartState[id];
      var cost = svc.rate * hrs;
      total      += cost;
      totalHours += hrs;
      weightedSum += svc.rate * hrs;

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

    if (avgBlock && avgVal && totalHours > 0) {
      avgVal.textContent = '$' + (weightedSum / totalHours).toFixed(2) + ' / hr';
      avgBlock.classList.add('visible');
    }

    if (loginPrompt) loginPrompt.classList.add('visible');

    container.querySelectorAll('.cart-slider').forEach(function (slider) {
      slider.addEventListener('input', function () {
        var sid = slider.getAttribute('data-id');
        var hrs = parseInt(slider.value, 10);
        cartState[sid] = hrs;
        var item = slider.closest('.cart-item');
        var lbl  = item.querySelector('.cart-hours-label');
        var sub  = item.querySelector('.cart-item-subtotal');
        var svc  = null;
        for (var k = 0; k < SERVICES.length; k++) { if (SERVICES[k].id === sid) { svc = SERVICES[k]; break; } }
        if (lbl) lbl.textContent = hrs + ' hrs';
        if (sub && svc) sub.textContent = '$' + (svc.rate * hrs).toLocaleString();

        var t = 0, th = 0, ws = 0;
        Object.keys(cartState).forEach(function (kid) {
          var ks = null;
          for (var j = 0; j < SERVICES.length; j++) { if (SERVICES[j].id === kid) { ks = SERVICES[j]; break; } }
          if (ks) { t += ks.rate * cartState[kid]; th += cartState[kid]; ws += ks.rate * cartState[kid]; }
        });
        if (totalVal) totalVal.textContent = '$' + t.toLocaleString();
        if (avgVal && th > 0) avgVal.textContent = '$' + (ws / th).toFixed(2) + ' / hr';
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
        if (d < w)  return { x: d,     y: 0     };  d -= w;
        if (d < h)  return { x: w,     y: d     };  d -= h;
        if (d < w)  return { x: w - d, y: h     };  d -= w;
        return             { x: 0,     y: h - d };
      }
      function drawBeam() {
        ctx.clearRect(0, 0, w, h);
        var perim = 2*(w+h), pos = (progress%1)*perim, beamLen = perim*0.20, steps = 48;
        for (var i = 0; i < steps; i++) {
          var alpha = i/steps;
          var pt  = perimToXY(pos - beamLen*(1-alpha), perim);
          var pt2 = perimToXY(pos - beamLen*(1-(i+1)/steps), perim);
          ctx.beginPath(); ctx.moveTo(pt.x,pt.y); ctx.lineTo(pt2.x,pt2.y);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(181,204,218,'+(alpha*0.9)+')';
          ctx.stroke();
        }
      }
      function loop() { progress += 0.0035; drawBeam(); raf = requestAnimationFrame(loop); }
      function stop() { active=false; if(raf){cancelAnimationFrame(raf);raf=null;} if(ctx)ctx.clearRect(0,0,w,h); }
      card.addEventListener('mouseenter', function(){if(active)return;active=true;resize();if(!ctx)ctx=canvas.getContext('2d');loop();});
      card.addEventListener('mouseleave', stop);
      window.addEventListener('resize', function(){if(active)resize();});
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
