/* ═══════════════════════════════════════════════════
   main.js — All page interactions except ball

   Contains:
   - initNav()          Navigation + mobile menu
   - initFadeIns()      Scroll-triggered fade-ins
   - initTower()        About page stack tower
   - initNetwork()      Services page node network
   - initPanels()       Services detail panels
════════════════════════════════════════════════════ */

(function () {

  /* ══════════════════════════════════════════════
     NAV
     - Adds shadow on scroll
     - Highlights active page link
     - Mobile hamburger toggle
  ══════════════════════════════════════════════ */
  function initNav() {
    var navbar  = document.getElementById('navbar');
    var toggle  = document.querySelector('.nav-toggle');
    var navList = document.querySelector('.nav-links');
    if (!navbar) return;

    // Scroll shadow
    window.addEventListener('scroll', function () {
      if (window.scrollY > 20) {
        navbar.style.boxShadow = '0 2px 24px rgba(0,0,0,0.35)';
      } else {
        navbar.style.boxShadow = 'none';
      }
    }, { passive: true });

    // Mobile toggle
    if (toggle && navList) {
      toggle.addEventListener('click', function () {
        var open = navList.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open);
      });
    }

    // Close nav on link click (mobile)
    if (navList) {
      navList.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          navList.classList.remove('open');
        });
      });
    }
  }

  /* ══════════════════════════════════════════════
     FADE-INS
     Watches elements with class="fade-in" and
     adds "visible" when they enter the viewport.
  ══════════════════════════════════════════════ */
  function initFadeIns() {
    var els = document.querySelectorAll('.fade-in');
    if (!els.length || !window.IntersectionObserver) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    els.forEach(function (el) { observer.observe(el); });
  }

  /* ══════════════════════════════════════════════
     TOWER  (about.html)
     Activates tower blocks and layer panels as
     each .stack-layer scrolls into view.

     How it works:
     - IntersectionObserver watches each .stack-layer
     - When a layer is visible, its data-layer index
       is used to activate the matching .tower-block
     - The layer itself gets .layer-active for CSS
       fade-in of its content
  ══════════════════════════════════════════════ */
  function initTower() {
    var layers      = document.querySelectorAll('.stack-layer');
    var towerBlocks = document.querySelectorAll('.tower-block');
    if (!layers.length) return;

    // Start with all blocks visible but inactive
    // Activate them progressively as user scrolls

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var idx = parseInt(entry.target.getAttribute('data-layer'), 10);

        if (entry.isIntersecting) {
          // Activate this layer's content
          entry.target.classList.add('layer-active');

          // Activate all tower blocks up to and including this one
          towerBlocks.forEach(function (block) {
            var blockIdx = parseInt(block.getAttribute('data-index'), 10);
            if (blockIdx <= idx) {
              block.classList.add('active');
            }
          });
        } else {
          // Deactivate if scrolled back above
          var rect = entry.target.getBoundingClientRect();
          if (rect.top > 0) {
            // Scrolled back up past this layer
            entry.target.classList.remove('layer-active');
            towerBlocks.forEach(function (block) {
              var blockIdx = parseInt(block.getAttribute('data-index'), 10);
              if (blockIdx >= idx) {
                block.classList.remove('active');
              }
            });
          }
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '0px 0px -10% 0px'
    });

    layers.forEach(function (layer) { observer.observe(layer); });
  }

  /* ══════════════════════════════════════════════
     NETWORK  (services.html)
     Draws SVG connection lines between nodes
     and handles node positioning.

     CONNECTIONS array defines which nodes link.
     Edit this to change which services connect.
  ══════════════════════════════════════════════ */

  // Which nodes connect to which
  // Format: ['node-id-1', 'node-id-2']
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

    // Draw lines after a short delay to let nodes render
    setTimeout(function () {
      drawLines(svg, nodes);
    }, 800);

    // Enable smooth hover transitions after entrance animations finish
    setTimeout(function () {
      nodes.forEach(function (n) { n.classList.add('post-load'); });
    }, 1200);

    // Redraw on resize
    window.addEventListener('resize', function () {
      svg.innerHTML = '';
      drawLines(svg, nodes);
    });
  }

  function getNodeCenter(nodeEl, canvas) {
    var nRect = nodeEl.getBoundingClientRect();
    var cRect = canvas.getBoundingClientRect();
    return {
      x: nRect.left + nRect.width  / 2 - cRect.left,
      y: nRect.top  + nRect.height / 2 - cRect.top
    };
  }

  function drawLines(svg, nodes) {
    var canvas = document.getElementById('network-canvas');
    if (!canvas) return;

    CONNECTIONS.forEach(function (pair, i) {
      var nodeA = document.getElementById(pair[0]);
      var nodeB = document.getElementById(pair[1]);
      if (!nodeA || !nodeB) return;

      var a = getNodeCenter(nodeA, canvas);
      var b = getNodeCenter(nodeB, canvas);

      var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', a.x);
      line.setAttribute('y1', a.y);
      line.setAttribute('x2', b.x);
      line.setAttribute('y2', b.y);
      line.setAttribute('class', 'network-line');
      line.setAttribute('data-a', pair[0]);
      line.setAttribute('data-b', pair[1]);

      // Animate line draw with staggered delay
      line.style.animationDelay = (i * 0.12) + 's';

      svg.appendChild(line);

      // Trigger draw animation
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          line.classList.add('line-drawn');
        });
      });
    });
  }

  // Highlight connected lines on node hover
  function highlightLines(activeNodeId, highlight) {
    var lines = document.querySelectorAll('.network-line');
    lines.forEach(function (line) {
      var a = line.getAttribute('data-a');
      var b = line.getAttribute('data-b');
      if (a === activeNodeId || b === activeNodeId) {
        if (highlight) {
          line.classList.add('line-highlight');
        } else {
          line.classList.remove('line-highlight');
        }
      }
    });
  }

  /* ══════════════════════════════════════════════
     PANELS  (services.html)
     Opens and closes service detail panels on
     node click. Highlights the active node.
  ══════════════════════════════════════════════ */
  function initPanels() {
    var nodes  = document.querySelectorAll('.service-node');
    var panels = document.querySelectorAll('.service-panel');
    var closes = document.querySelectorAll('.panel-close');
    if (!nodes.length) return;

    // Node click → open matching panel
    nodes.forEach(function (node) {
      var id = node.getAttribute('data-id');

      node.addEventListener('click', function () {
        var isActive = node.classList.contains('active');

        // Deactivate all nodes and panels first
        closeAllPanels(nodes, panels);

        if (!isActive) {
          // Activate this node and its panel
          node.classList.add('active');
          highlightLines(node.id, true);

          var panel = document.getElementById('panel-' + id);
          if (panel) panel.classList.add('panel-active');
        }
      });

      // Hover highlight
      node.addEventListener('mouseenter', function () {
        if (!node.classList.contains('active')) {
          highlightLines(node.id, true);
        }
      });

      node.addEventListener('mouseleave', function () {
        if (!node.classList.contains('active')) {
          highlightLines(node.id, false);
        }
      });
    });

    // Close button
    closes.forEach(function (btn) {
      btn.addEventListener('click', function () {
        closeAllPanels(nodes, panels);
      });
    });

    // Click outside panel to close
    document.addEventListener('click', function (e) {
      var inPanel = e.target.closest('.service-panel');
      var inNode  = e.target.closest('.service-node');
      if (!inPanel && !inNode) {
        closeAllPanels(nodes, panels);
      }
    });
  }

  function closeAllPanels(nodes, panels) {
    nodes.forEach(function (n) {
      n.classList.remove('active');
      highlightLines(n.id, false);
    });
    panels.forEach(function (p) {
      p.classList.remove('panel-active');
    });
  }

  /* ══════════════════════════════════════════════
     BOOT — run all inits on DOM ready
  ══════════════════════════════════════════════ */
  function boot() {
    initNav();
    initFadeIns();
    initTower();
    initNetwork();
    initPanels();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
