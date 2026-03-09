/* ═══════════════════════════════════════════════════
   main.js — ACKS
════════════════════════════════════════════════════ */
(function () {

  /* ── SERVICE DATA ────────────────────────────── */
  var SERVICES = [
    { id: 'infrastructure', label: 'Infrastructure',            sub: 'ERDs, DB design, cloud architecture',   rate: 27, defaultHours: 30 },
    { id: 'web',            label: 'Web Design & Application',  sub: 'Full-stack web applications',           rate: 25, defaultHours: 40 },
    { id: 'data',           label: 'Data Engineering',          sub: 'ETL pipelines, analytics, reporting',   rate: 27, defaultHours: 35 },
    { id: 'creative',       label: 'Creative UX / UI',          sub: 'Design systems & interactions',         rate: 25, defaultHours: 20 },
    { id: 'api',            label: 'API Integrations',          sub: 'Anthropic, OpenAI, REST, ML pipelines', rate: 28, defaultHours: 25 },
  ];

  var cartState = {}; // id → hours

  /* ── PERIMETER HELPER ────────────────────────── */
  function perimToXY(d, w, h) {
    var perim = 2 * (w + h);
    d = ((d % perim) + perim) % perim;
    if (d < w)  return { x: d,     y: 0     };
    d -= w;
    if (d < h)  return { x: w,     y: d     };
    d -= h;
    if (d < w)  return { x: w - d, y: h     };
    d -= w;
    return             { x: 0,     y: h - d };
  }

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
     SERVICE LIST
     Vertical cards. Click selects + shows beam glow.
     Opens fixed info panel from left.
  ═══════════════════════════════════════════════ */
  function initServiceList() {
    var listEl = document.getElementById('service-list');
    if (!listEl) return;

    SERVICES.forEach(function (svc) {
      var row = document.createElement('div');
      row.className = 'svc-row fade-in';
      row.setAttribute('data-id', svc.id);

      var canvas = document.createElement('canvas');
      canvas.className = 'svc-beam-canvas';

      var info = document.createElement('div');
      info.className = 'svc-row-info';

      var name = document.createElement('span');
      name.className = 'svc-row-name';
      name.textContent = svc.label;

      var sub = document.createElement('span');
      sub.className = 'svc-row-sub';
      sub.textContent = svc.sub;

      info.appendChild(name);
      info.appendChild(sub);

      var rate = document.createElement('span');
      rate.className = 'svc-row-rate';
      rate.textContent = '$' + svc.rate + ' / hr';

      var dot = document.createElement('div');
      dot.className = 'svc-sel-dot';

      row.appendChild(canvas);
      row.appendChild(info);
      row.appendChild(rate);
      row.appendChild(dot);
      listEl.appendChild(row);
    });

    var rows   = listEl.querySelectorAll('.svc-row');
    var panels = document.querySelectorAll('.service-panel');
    var closes = document.querySelectorAll('.panel-close');

    function runBeam(canvas, row) {
      var ctx = null, w = 0, h = 0, prog = 0;
      function loop() {
        if (!row.classList.contains('svc-selected')) {
          if (ctx) ctx.clearRect(0, 0, w, h);
          return;
        }
        w = canvas.width  = row.offsetWidth;
        h = canvas.height = row.offsetHeight;
        if (!ctx) ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, w, h);
        var perim = 2 * (w + h), pos = (prog % 1) * perim, bLen = perim * 0.28, steps = 52;
        for (var i = 0; i < steps; i++) {
          var alpha = i / steps;
          var p1 = perimToXY(pos - bLen * (1 - alpha),           w, h);
          var p2 = perimToXY(pos - bLen * (1 - (i + 1) / steps), w, h);
          ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(110,192,241,' + (alpha * 0.92) + ')';
          ctx.stroke();
        }
        prog += 0.003;
        requestAnimationFrame(loop);
      }
      loop();
    }

    rows.forEach(function (row) {
      var id     = row.getAttribute('data-id');
      var canvas = row.querySelector('.svc-beam-canvas');

      row.addEventListener('click', function () {
        var isSelected = row.classList.contains('svc-selected');

        if (isSelected) {
          row.classList.remove('svc-selected');
          var panel = document.getElementById('panel-' + id);
          if (panel) panel.classList.remove('panel-active');
          delete cartState[id];
        } else {
          row.classList.add('svc-selected');
          runBeam(canvas, row);
          panels.forEach(function (p) { p.classList.remove('panel-active'); });
          var panel = document.getElementById('panel-' + id);
          if (panel) panel.classList.add('panel-active');
          var svc = null;
          for (var k = 0; k < SERVICES.length; k++) { if (SERVICES[k].id === id) { svc = SERVICES[k]; break; } }
          if (svc) cartState[id] = svc.defaultHours;
        }
        renderCart();
      });
    });

    closes.forEach(function (btn) {
      btn.addEventListener('click', function () {
        panels.forEach(function (p) { p.classList.remove('panel-active'); });
      });
    });

    var clearBtn = document.getElementById('cart-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        cartState = {};
        rows.forEach(function (r) { r.classList.remove('svc-selected'); });
        panels.forEach(function (p) { p.classList.remove('panel-active'); });
        renderCart();
      });
    }

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.service-panel') &&
          !e.target.closest('.svc-row') &&
          !e.target.closest('#cart-panel') &&
          !e.target.closest('#calc-tab')) {
        panels.forEach(function (p) { p.classList.remove('panel-active'); });
      }
    });
  }

  /* ── CALCULATOR (fixed right panel) ─────────── */
  function initCalcTab() {
    var tab   = document.getElementById('calc-tab');
    var panel = document.getElementById('cart-panel');
    var icon  = document.getElementById('calc-tab-icon');
    if (!tab || !panel) return;

    var open = false;

    tab.addEventListener('click', function () {
      open = !open;
      if (open) {
        panel.classList.add('cart-open');
        tab.classList.add('calc-tab-open');
        if (icon) icon.innerHTML = '&#9654;';
      } else {
        panel.classList.remove('cart-open');
        tab.classList.remove('calc-tab-open');
        if (icon) icon.innerHTML = '&#9664;';
      }
    });
  }

  /* ── CART RENDER ─────────────────────────────── */
  function renderCart() {
    var container = document.getElementById('cart-items');
    var totalRow  = document.getElementById('cart-total-row');
    var totalVal  = document.getElementById('cart-total-value');
    var avgRow    = document.getElementById('cart-avg-row');
    var avgVal    = document.getElementById('cart-avg-value');
    var ctaBlock  = document.getElementById('cart-cta');
    var emptyMsg  = document.getElementById('cart-empty');
    if (!container) return;

    var ids = Object.keys(cartState);

    if (ids.length === 0) {
      container.innerHTML = '';
      if (emptyMsg) { emptyMsg.style.display = 'block'; container.appendChild(emptyMsg); }
      if (totalRow) totalRow.style.display = 'none';
      if (avgRow)   avgRow.style.display   = 'none';
      if (ctaBlock) ctaBlock.style.display = 'none';
      return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';

    var html = '', total = 0, totalRate = 0;

    ids.forEach(function (id) {
      var svc = null;
      for (var k = 0; k < SERVICES.length; k++) { if (SERVICES[k].id === id) { svc = SERVICES[k]; break; } }
      if (!svc) return;
      var hrs  = cartState[id];
      var cost = svc.rate * hrs;
      total     += cost;
      totalRate += svc.rate;
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
        var sid  = slider.getAttribute('data-id');
        var hrs  = parseInt(slider.value, 10);
        cartState[sid] = hrs;
        var item = slider.closest('.cart-item');
        var lbl  = item.querySelector('.cart-hours-label');
        var sub  = item.querySelector('.cart-item-subtotal');
        var s    = null;
        for (var k = 0; k < SERVICES.length; k++) { if (SERVICES[k].id === sid) { s = SERVICES[k]; break; } }
        if (lbl) lbl.textContent = hrs + ' hrs';
        if (sub && s) sub.textContent = '$' + (s.rate * hrs).toLocaleString();
        var t = 0, tr = 0;
        Object.keys(cartState).forEach(function (k) {
          var sv = null;
          for (var j = 0; j < SERVICES.length; j++) { if (SERVICES[j].id === k) { sv = SERVICES[j]; break; } }
          if (sv) { t += sv.rate * cartState[k]; tr += sv.rate; }
        });
        if (totalVal) totalVal.textContent = '$' + t.toLocaleString();
        var cnt = Object.keys(cartState).length;
        if (avgVal && cnt > 0) avgVal.textContent = '$' + (tr / cnt).toFixed(2) + ' / hr';
      });
    });

    var cnt     = ids.length;
    var avgRate = cnt > 0 ? (totalRate / cnt).toFixed(2) : '0.00';
    if (avgRow)   avgRow.style.display   = 'flex';
    if (avgVal)   avgVal.textContent     = '$' + avgRate + ' / hr';
    if (totalRow) totalRow.style.display = 'flex';
    if (totalVal) totalVal.textContent   = '$' + total.toLocaleString();
    if (ctaBlock) ctaBlock.style.display = 'block';
  }

  /* ── BUNDLE CLICKS → login register tab ─────── */
  function initBundleClicks() {
    document.querySelectorAll('.package-card').forEach(function (card) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', function () {
        window.location.href = 'login.html?tab=register';
      });
    });
  }

  /* ── BEAM CARDS (contact/footer) ────────────── */
  function initBeamCards() {
    document.querySelectorAll('.beam-card').forEach(function (card) {
      var canvas = document.createElement('canvas');
      canvas.className = 'beam-canvas';
      card.appendChild(canvas);
      var ctx = null, w = 0, h = 0, progress = 0, raf = null, active = false;
      function resize() { w = canvas.width = card.offsetWidth; h = canvas.height = card.offsetHeight; }
      function drawBeam() {
        ctx.clearRect(0, 0, w, h);
        var perim = 2*(w+h), pos = (progress%1)*perim, bLen = perim*0.20, steps = 48;
        for (var i = 0; i < steps; i++) {
          var alpha = i/steps;
          var p1 = perimToXY(pos - bLen*(1-alpha),           w, h);
          var p2 = perimToXY(pos - bLen*(1-(i+1)/steps),     w, h);
          ctx.beginPath(); ctx.moveTo(p1.x,p1.y); ctx.lineTo(p2.x,p2.y);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(181,204,218,'+(alpha*0.9)+')';
          ctx.stroke();
        }
      }
      function loop() { progress += 0.0035; drawBeam(); raf = requestAnimationFrame(loop); }
      function stop() { active=false; if(raf){cancelAnimationFrame(raf);raf=null;} if(ctx)ctx.clearRect(0,0,w,h); }
      card.addEventListener('mouseenter', function(){ if(active)return; active=true; resize(); if(!ctx)ctx=canvas.getContext('2d'); loop(); });
      card.addEventListener('mouseleave', stop);
      window.addEventListener('resize', function(){ if(active)resize(); });
    });
  }

  /* ═══════════════════════════════════════════════
     SCROLL NAV (home page)
     Fixed left sidebar — 4 nodes with progress line.
     Cyan nodes, wine glow on progress. Shrinks on mobile.
  ═══════════════════════════════════════════════ */
  function initScrollNav() {
    var nav = document.getElementById('scroll-nav');
    if (!nav) return;

    var SECTION_IDS = ['hero', 'value-statement', 'gateway', 'lastPanel'];
    var nodes       = Array.prototype.slice.call(nav.querySelectorAll('.snav-node'));
    var progressEl  = nav.querySelector('.snav-progress');

    function positionNodes() {
      var docH      = Math.max(document.documentElement.scrollHeight, 1);
      var viewH     = window.innerHeight;
      var maxScroll = Math.max(1, docH - viewH);

      SECTION_IDS.forEach(function (id, i) {
        var el = document.getElementById(id);
        if (!el || !nodes[i]) return;
        var focus         = el.offsetTop + el.offsetHeight * 0.3;
        var scrollAtFocus = Math.max(0, focus - viewH * 0.5);
        var pct           = (scrollAtFocus / maxScroll) * 100;
        pct = Math.max(2, Math.min(96, pct));
        nodes[i].style.top = pct + '%';
      });
    }

    function updateProgress() {
      var scrollY   = window.scrollY || window.pageYOffset;
      var maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      var pct       = (scrollY / maxScroll) * 100;

      if (progressEl) progressEl.style.height = pct + '%';

      var midY       = scrollY + window.innerHeight * 0.45;
      var currentIdx = -1;

      SECTION_IDS.forEach(function (id, i) {
        var el = document.getElementById(id);
        if (!el || !nodes[i]) return;
        if (midY >= el.offsetTop) {
          nodes[i].classList.add('snav-active');
          currentIdx = i;
        } else {
          nodes[i].classList.remove('snav-active');
          nodes[i].classList.remove('snav-current');
        }
      });

      nodes.forEach(function (n) { n.classList.remove('snav-current'); });
      if (currentIdx >= 0 && nodes[currentIdx]) nodes[currentIdx].classList.add('snav-current');
    }

    setTimeout(function () { positionNodes(); updateProgress(); }, 200);
    window.addEventListener('scroll',  updateProgress,                    { passive: true });
    window.addEventListener('resize',  function () { positionNodes(); updateProgress(); });
  }

  /* ── LOGIN TAB AUTO-SELECT ───────────────────── */
  function initLoginTab() {
    if (typeof window.switchTab !== 'function') return;
    try {
      var params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'register') window.switchTab('register');
    } catch(e) {}
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
    initServiceList();
    initCalcTab();
    initBeamCards();
    initBundleClicks();
    initScrollNav();
    initLoginTab();
    initMusic();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }

})();
