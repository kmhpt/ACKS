/* ═══════════════════════════════════════════════════
   main.js — All page interactions
════════════════════════════════════════════════════ */
(function () {

  /* ── SERVICE DATA ────────────────────────────── */
  var SERVICES = {
    'web':            { label: 'Web Design & Applications', rate: 45, defaultHours: 40 },
    'infrastructure': { label: 'Infrastructure',            rate: 40, defaultHours: 30 },
    'api':            { label: 'API Integrations',          rate: 55, defaultHours: 25 },
    'data':           { label: 'Data Engineering',          rate: 35, defaultHours: 35 },
    'creative':       { label: 'Creative UX / UI',          rate: 25, defaultHours: 20 },
  };

  var CONNECTIONS = [
    ['node-web',            'node-infrastructure'],
    ['node-web',            'node-api'],
    ['node-web',            'node-creative'],
    ['node-infrastructure', 'node-data'],
    ['node-infrastructure', 'node-api'],
    ['node-api',            'node-data'],
    ['node-data',           'node-creative'],
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

  /* ── SECTION GLOW (scroll-triggered background pulse) ── */
  function initSectionGlow() {
    var sections = document.querySelectorAll(
      '#value-statement, #gateway, #combined-services, #packages-section, ' +
      '#testimonials, #process-section, #tools-section, #about-cta, #stack-section, #sme-callout'
    );
    if (!sections.length || !window.IntersectionObserver) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) e.target.classList.add('section-glow-visible');
        else e.target.classList.remove('section-glow-visible');
      });
    }, { threshold: 0.15 });
    sections.forEach(function (s) { obs.observe(s); });
  }

  /* ── HEADER GLOW (hover on h1) ───────────────── */
  function initHeaderGlow() {
    var headers = document.querySelectorAll('#hero h1, #about-hero h1, #services-hero h1');
    headers.forEach(function (h) {
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
      var cur = window.scrollY, down = cur > lastY;
      lastY = cur;
      cards.forEach(function (c) {
        var r = c.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.75 && r.bottom > 0) {
          if (down) c.classList.add('flipped');
          else c.classList.remove('flipped');
        }
      });
    }, { passive: true });
  }

  /* ── TOWER (about.html) ──────────────────────── */
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

  /* ── NETWORK ─────────────────────────────────── */
  function initNetwork() {
    var canvas = document.getElementById('network-canvas');
    var svg    = document.getElementById('network-svg');
    var nodes  = document.querySelectorAll('.service-node');
    if (!canvas || !svg || !nodes.length) return;
    setTimeout(function () { drawLines(svg); }, 800);
    setTimeout(function () { nodes.forEach(function (n) { n.classList.add('post-load'); }); }, 1200);
    window.addEventListener('resize', function () { svg.innerHTML = ''; drawLines(svg); });
  }

  function getNodeCenter(id) {
    var canvas = document.getElementById('network-canvas');
    var el     = document.getElementById(id);
    if (!el || !canvas) return null;
    var nr = el.getBoundingClientRect();
    var cr = canvas.getBoundingClientRect();
    return { x: nr.left + nr.width / 2 - cr.left, y: nr.top + nr.height / 2 - cr.top };
  }

  function drawLines(svg) {
    CONNECTIONS.forEach(function (pair) {
      var a = getNodeCenter(pair[0]);
      var b = getNodeCenter(pair[1]);
      if (!a || !b) return;
      var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
      line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
      line.setAttribute('class', 'network-line');
      line.setAttribute('data-a', pair[0]);
      line.setAttribute('data-b', pair[1]);
      svg.appendChild(line);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { line.classList.add('line-drawn'); });
      });
    });
  }

  function highlightLines(nodeId, on) {
    document.querySelectorAll('.network-line').forEach(function (line) {
      var a = line.getAttribute('data-a');
      var b = line.getAttribute('data-b');
      if (a === nodeId || b === nodeId) {
        if (on) line.classList.add('line-highlight');
        else    line.classList.remove('line-highlight');
      }
    });
  }

  /* ── PANELS + CART ───────────────────────────── */
  function initPanels() {
    var nodes  = document.querySelectorAll('.service-node');
    var panels = document.querySelectorAll('.service-panel');
    var closes = document.querySelectorAll('.panel-close');
    if (!nodes.length) return;

    nodes.forEach(function (node) {
      var id = node.getAttribute('data-id');

      node.addEventListener('click', function () {
        var isActive = node.classList.contains('active');

        if (isActive) {
          // Deselect
          node.classList.remove('active');
          highlightLines(node.id, false);
          var panel = document.getElementById('panel-' + id);
          if (panel) panel.classList.remove('panel-active');
          delete cartState[id];
        } else {
          // Select — close other individual panels first, then open this one
          node.classList.add('active');
          highlightLines(node.id, true);
          panels.forEach(function (p) { p.classList.remove('panel-active'); });
          var panel = document.getElementById('panel-' + id);
          if (panel) panel.classList.add('panel-active');
          if (SERVICES[id]) cartState[id] = SERVICES[id].defaultHours;
        }
        renderCart();
      });

      node.addEventListener('mouseenter', function () {
        if (!node.classList.contains('active')) highlightLines(node.id, true);
      });
      node.addEventListener('mouseleave', function () {
        if (!node.classList.contains('active')) highlightLines(node.id, false);
      });
    });

    closes.forEach(function (btn) {
      btn.addEventListener('click', function () {
        panels.forEach(function (p) { p.classList.remove('panel-active'); });
      });
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.service-panel') &&
          !e.target.closest('.service-node') &&
          !e.target.closest('#cart-panel')) {
        panels.forEach(function (p) { p.classList.remove('panel-active'); });
      }
    });

    var clearBtn = document.getElementById('cart-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        cartState = {};
        nodes.forEach(function (n) {
          n.classList.remove('active');
          highlightLines(n.id, false);
        });
        panels.forEach(function (p) { p.classList.remove('panel-active'); });
        renderCart();
      });
    }
  }

  /* ── CART RENDER ─────────────────────────────── */
  function renderCart() {
    var container  = document.getElementById('cart-items');
    var totalRow   = document.getElementById('cart-total-row');
    var totalVal   = document.getElementById('cart-total-value');
    var ctaBlock   = document.getElementById('cart-cta');
    var emptyMsg   = document.getElementById('cart-empty');
    var cartPanel  = document.getElementById('cart-panel');
    if (!container) return;

    var ids = Object.keys(cartState);

    if (ids.length === 0) {
      container.innerHTML = '';
      if (emptyMsg) { emptyMsg.style.display = 'block'; container.appendChild(emptyMsg); }
      if (totalRow) totalRow.style.display = 'none';
      if (ctaBlock) ctaBlock.style.display = 'none';
      if (cartPanel) cartPanel.classList.remove('cart-has-items');
      return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';
    if (cartPanel) cartPanel.classList.add('cart-has-items');

    var html = '', total = 0;
    ids.forEach(function (id) {
      var svc = SERVICES[id];
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
        var item     = slider.closest('.cart-item');
        var lbl      = item.querySelector('.cart-hours-label');
        var sub      = item.querySelector('.cart-item-subtotal');
        if (lbl) lbl.textContent = hrs + ' hrs';
        if (sub) sub.textContent = '$' + (SERVICES[id].rate * hrs).toLocaleString();
        var t = 0;
        Object.keys(cartState).forEach(function (k) {
          if (SERVICES[k]) t += SERVICES[k].rate * cartState[k];
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

      var ctx = null, w = 0, h = 0;
      var progress = 0, raf = null, active = false;

      function resize() {
        w = canvas.width  = card.offsetWidth;
        h = canvas.height = card.offsetHeight;
      }

      function perimToXY(d, perim) {
        d = ((d % perim) + perim) % perim;
        if (d < w)       return { x: d,     y: 0     };
        d -= w;
        if (d < h)       return { x: w,     y: d     };
        d -= h;
        if (d < w)       return { x: w - d, y: h     };
        d -= w;
        return                  { x: 0,     y: h - d };
      }

      function drawBeam() {
        ctx.clearRect(0, 0, w, h);
        var perim   = 2 * (w + h);
        var pos     = (progress % 1) * perim;
        var beamLen = perim * 0.20;
        var steps   = 48;
        for (var i = 0; i < steps; i++) {
          var alpha = i / steps;
          var pt    = perimToXY(pos - beamLen * (1 - alpha),       perim);
          var pt2   = perimToXY(pos - beamLen * (1 - (i+1)/steps), perim);
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(pt2.x, pt2.y);
          ctx.lineWidth   = 2;
          ctx.strokeStyle = 'rgba(181,204,218,' + (alpha * 0.9) + ')';
          ctx.stroke();
        }
      }

      function loop() {
        progress += 0.0035;
        drawBeam();
        raf = requestAnimationFrame(loop);
      }

      function stop() {
        active = false;
        if (raf) { cancelAnimationFrame(raf); raf = null; }
        if (ctx) ctx.clearRect(0, 0, w, h);
      }

      card.addEventListener('mouseenter', function () {
        if (active) return;
        active = true;
        resize();
        if (!ctx) ctx = canvas.getContext('2d');
        loop();
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
    initNetwork();
    initPanels();
    initBeamCards();
    initMusic();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
