/* ═══════════════════════════════════════════════════
   main.js — All page interactions except ball
════════════════════════════════════════════════════ */
(function () {

  /* ── NAV ─────────────────────────────────────── */
  function initNav() {
    var navbar  = document.getElementById('navbar');
    var toggle  = document.querySelector('.nav-toggle');
    var navList = document.querySelector('.nav-links');
    if (!navbar) return;

    window.addEventListener('scroll', function () {
      navbar.style.boxShadow = window.scrollY > 20
        ? '0 2px 24px rgba(0,0,0,0.35)' : 'none';
    }, { passive: true });

    if (toggle && navList) {
      toggle.addEventListener('click', function () {
        var open = navList.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open);
      });
      navList.querySelectorAll('a').forEach(function(a) {
        a.addEventListener('click', function() { navList.classList.remove('open'); });
      });
    }
  }

  /* ── FADE-INS ────────────────────────────────── */
  function initFadeIns() {
    var els = document.querySelectorAll('.fade-in');
    if (!els.length || !window.IntersectionObserver) return;
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function(el) { obs.observe(el); });
  }

  /* ── HEADER GLOW on hover ───────────────────── */
  function initHeaderGlow() {
    // Targets h1 elements in hero/page-header sections
    var headers = document.querySelectorAll(
      '#hero h1, #about-hero h1, #services-hero h1'
    );
    headers.forEach(function(h) {
      var section = h.closest('section, header');
      if (!section) return;

      // Create glow overlay element
      var glow = document.createElement('div');
      glow.className = 'header-glow-overlay';
      section.style.position = section.style.position || 'relative';
      section.appendChild(glow);

      h.addEventListener('mouseenter', function() {
        glow.classList.add('header-glow-active');
      });
      h.addEventListener('mouseleave', function() {
        glow.classList.remove('header-glow-active');
      });
    });
  }

  /* ── FLIP CARDS ──────────────────────────────── */
  function initFlipCards() {
    var cards = document.querySelectorAll('.flip-card');
    if (!cards.length) return;
    var lastY = window.scrollY;
    window.addEventListener('scroll', function() {
      var currentY = window.scrollY;
      var scrollingDown = currentY > lastY;
      lastY = currentY;
      cards.forEach(function(card) {
        var rect = card.getBoundingClientRect();
        var inView = rect.top < window.innerHeight * 0.75 && rect.bottom > 0;
        if (inView) {
          if (scrollingDown) card.classList.add('flipped');
          else card.classList.remove('flipped');
        }
      });
    }, { passive: true });
  }

  /* ── TOWER (about.html) ──────────────────────── */
  function initTower() {
    var layers      = document.querySelectorAll('.stack-layer');
    var towerBlocks = document.querySelectorAll('.tower-block');
    if (!layers.length) return;

    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        var idx = parseInt(entry.target.getAttribute('data-layer'), 10);
        if (entry.isIntersecting) {
          entry.target.classList.add('layer-active');
          towerBlocks.forEach(function(b) {
            if (parseInt(b.getAttribute('data-index'),10) <= idx) b.classList.add('active');
          });
        } else {
          var rect = entry.target.getBoundingClientRect();
          if (rect.top > 0) {
            entry.target.classList.remove('layer-active');
            towerBlocks.forEach(function(b) {
              if (parseInt(b.getAttribute('data-index'),10) >= idx) b.classList.remove('active');
            });
          }
        }
      });
    }, { threshold: 0.3, rootMargin: '0px 0px -10% 0px' });

    layers.forEach(function(l) { obs.observe(l); });

    // Clickable tower blocks → scroll to layer
    towerBlocks.forEach(function(block) {
      block.style.cursor = 'pointer';
      block.addEventListener('click', function() {
        var idx   = block.getAttribute('data-index');
        var layer = document.querySelector('.stack-layer[data-layer="' + idx + '"]');
        if (layer) layer.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  }

  /* ── NETWORK (services.html) ─────────────────── */
  var CONNECTIONS = [
    ['node-web-apps',      'node-api'],
    ['node-web-apps',      'node-automation'],
    ['node-automation',    'node-data-eng'],
    ['node-automation',    'node-api'],
    ['node-data-eng',      'node-ai-ml'],
    ['node-data-eng',      'node-infrastructure'],
    ['node-api',           'node-infrastructure'],
    ['node-ai-ml',         'node-automation'],
    ['node-infrastructure','node-web-apps'],
  ];

  function initNetwork() {
    var canvas = document.getElementById('network-canvas');
    var svg    = document.getElementById('network-svg');
    var nodes  = document.querySelectorAll('.service-node');
    if (!canvas || !svg || !nodes.length) return;

    setTimeout(function() { drawLines(svg); }, 800);
    setTimeout(function() { nodes.forEach(function(n){ n.classList.add('post-load'); }); }, 1200);
    window.addEventListener('resize', function() { svg.innerHTML = ''; drawLines(svg); });
  }

  function getNodeCenter(id) {
    var canvas = document.getElementById('network-canvas');
    var el     = document.getElementById(id);
    if (!el || !canvas) return null;
    var nr = el.getBoundingClientRect();
    var cr = canvas.getBoundingClientRect();
    return { x: nr.left + nr.width/2 - cr.left, y: nr.top + nr.height/2 - cr.top };
  }

  function drawLines(svg) {
    CONNECTIONS.forEach(function(pair, i) {
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
      requestAnimationFrame(function() {
        requestAnimationFrame(function() { line.classList.add('line-drawn'); });
      });
    });
  }

  function highlightLines(nodeId, on) {
    document.querySelectorAll('.network-line').forEach(function(line) {
      var a = line.getAttribute('data-a');
      var b = line.getAttribute('data-b');
      if (a === nodeId || b === nodeId) {
        if (on) line.classList.add('line-highlight');
        else    line.classList.remove('line-highlight');
      }
    });
  }

  /* ── PANELS (services.html) ──────────────────── */
  function initPanels() {
    var nodes  = document.querySelectorAll('.service-node');
    var panels = document.querySelectorAll('.service-panel');
    var closes = document.querySelectorAll('.panel-close');
    if (!nodes.length) return;

    nodes.forEach(function(node) {
      var id = node.getAttribute('data-id');
      node.addEventListener('click', function() {
        var wasActive = node.classList.contains('active');
        closeAll(nodes, panels);
        if (!wasActive) {
          node.classList.add('active');
          highlightLines(node.id, true);
          var panel = document.getElementById('panel-' + id);
          if (panel) panel.classList.add('panel-active');
        }
      });
      node.addEventListener('mouseenter', function() {
        if (!node.classList.contains('active')) highlightLines(node.id, true);
      });
      node.addEventListener('mouseleave', function() {
        if (!node.classList.contains('active')) highlightLines(node.id, false);
      });
    });

    closes.forEach(function(btn) {
      btn.addEventListener('click', function() { closeAll(nodes, panels); });
    });

    document.addEventListener('click', function(e) {
      if (!e.target.closest('.service-panel') && !e.target.closest('.service-node')) {
        closeAll(nodes, panels);
      }
    });
  }

  function closeAll(nodes, panels) {
    nodes.forEach(function(n) { n.classList.remove('active'); highlightLines(n.id, false); });
    panels.forEach(function(p) { p.classList.remove('panel-active'); });
  }

  /* ── MUSIC WIDGET ────────────────────────────── */
  function initMusic() {
    var toggle = document.getElementById('music-toggle');
    var embed  = document.getElementById('spotify-embed');
    var label  = document.getElementById('music-label');
    if (!toggle || !embed) return;
    toggle.addEventListener('click', function() {
      var open = embed.classList.toggle('open');
      if (label) label.textContent = open ? 'Hide' : 'Music';
    });
  }

  /* ── BOOT ────────────────────────────────────── */
  function boot() {
    initNav();
    initFadeIns();
    initHeaderGlow();
    initFlipCards();
    initTower();
    initNetwork();
    initPanels();
    initMusic();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
