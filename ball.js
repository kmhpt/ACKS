/* ═══════════════════════════════════════════════════
   scroll-nav.js
   Left-side scroll progress navigation nodes.
   — 4 nodes, one per section
   — Connecting line glows as you scroll through
   — Nodes are cyan circles; glow is wine/burgundy
   — Shrinks on mobile, hides only below 360px
════════════════════════════════════════════════════ */
(function () {

  /* Only run on the home page */
  if (!document.querySelector('.page-home')) return;

  /* ── NODE DEFINITIONS ────────────────────────── */
  /* Each node aligns with a target element on the page */
  var NODE_TARGETS = [
    { selector: '.hero-content h1',          label: 'Home'     },
    { selector: '#value-statement .value-grid', label: 'What We Do' },
    { selector: '#gateway',                  label: 'How We Build' },
    { selector: '#lastPanel .last-text h2',  label: 'Get Started' },
  ];

  /* ── BUILD DOM ───────────────────────────────── */
  var nav = document.createElement('div');
  nav.id = 'scroll-nav';
  nav.setAttribute('aria-hidden', 'true');
  nav.innerHTML = '<div id="scroll-nav-line"><div id="scroll-nav-progress"></div></div>';

  var nodeEls = [];
  NODE_TARGETS.forEach(function (n, i) {
    var nodeWrap = document.createElement('div');
    nodeWrap.className = 'snav-node';
    nodeWrap.setAttribute('data-index', i);

    var circle = document.createElement('div');
    circle.className = 'snav-circle';

    var glow = document.createElement('div');
    glow.className = 'snav-glow';

    nodeWrap.appendChild(glow);
    nodeWrap.appendChild(circle);
    nav.appendChild(nodeWrap);
    nodeEls.push(nodeWrap);
  });

  document.body.appendChild(nav);

  /* ── STYLES ──────────────────────────────────── */
  var style = document.createElement('style');
  style.textContent = [
    '#scroll-nav {',
    '  position: fixed;',
    '  left: 1.8rem;',
    '  top: 50%;',
    '  transform: translateY(-50%);',
    '  z-index: 900;',
    '  display: flex;',
    '  flex-direction: column;',
    '  align-items: center;',
    '  gap: 0;',
    '  pointer-events: none;',
    '}',

    '#scroll-nav-line {',
    '  position: absolute;',
    '  top: 8px;',
    '  bottom: 8px;',
    '  left: 50%;',
    '  transform: translateX(-50%);',
    '  width: 1px;',
    '  background: rgba(181,204,218,.08);',
    '  z-index: 0;',
    '}',

    '#scroll-nav-progress {',
    '  position: absolute;',
    '  top: 0;',
    '  left: 0;',
    '  right: 0;',
    '  height: 0%;',
    '  background: linear-gradient(to bottom,',
    '    rgba(0,212,255,.6),',
    '    rgba(71,34,44,.9)',
    '  );',
    '  transition: height .1s ease;',
    '  box-shadow: 0 0 6px rgba(0,212,255,.3);',
    '}',

    '.snav-node {',
    '  position: relative;',
    '  width: 16px;',
    '  height: 16px;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  z-index: 1;',
    '  margin: 0;',
    '}',

    /* Spacing is set by JS based on positions — but default gap fills visually */
    '.snav-circle {',
    '  width: 8px;',
    '  height: 8px;',
    '  border-radius: 50%;',
    '  border: 1.5px solid rgba(0,212,255,.45);',
    '  background: rgba(13,17,23,.9);',
    '  transition: border-color .4s ease, background .4s ease, transform .3s ease;',
    '  position: relative; z-index: 2;',
    '}',

    '.snav-node.active .snav-circle {',
    '  border-color: var(--cyan-bright, #6ec0f1);',
    '  background: rgba(0,212,255,.2);',
    '  transform: scale(1.35);',
    '}',

    '.snav-glow {',
    '  position: absolute;',
    '  inset: -8px;',
    '  border-radius: 50%;',
    '  background: radial-gradient(ellipse, rgba(71,34,44,.0) 0%, transparent 70%);',
    '  transition: background .5s ease;',
    '  pointer-events: none;',
    '  z-index: 0;',
    '}',

    '.snav-node.active .snav-glow {',
    '  background: radial-gradient(ellipse, rgba(71,34,44,.55) 0%, rgba(71,34,44,.0) 70%);',
    '  animation: snavGlowPulse 2.2s ease-in-out infinite;',
    '}',

    '@keyframes snavGlowPulse {',
    '  0%,100% { opacity: .7; transform: scale(1); }',
    '  50%      { opacity: 1;  transform: scale(1.25); }',
    '}',

    /* Mobile: shrink */
    '@media (max-width: 768px) {',
    '  #scroll-nav { left: .8rem; }',
    '  .snav-circle { width: 6px; height: 6px; }',
    '  .snav-node { width: 12px; height: 12px; }',
    '}',
    '@media (max-width: 360px) {',
    '  #scroll-nav { display: none; }',
    '}',
  ].join('\n');
  document.head.appendChild(style);

  /* ── POSITION NODES ──────────────────────────── */
  /* Nodes are absolutely positioned along the fixed rail.
     We map each target element's vertical center to a
     percentage of the viewport height, then fix the rail
     between the first and last target positions. */

  var scrollY = window.scrollY || window.pageYOffset;
  var vh      = window.innerHeight;
  var navH    = 70; /* nav-height approx */

  /* Cache: absolute Y center of each target */
  var targetYs = [];

  function cachePositions() {
    scrollY  = window.scrollY || window.pageYOffset;
    vh       = window.innerHeight;
    targetYs = [];

    NODE_TARGETS.forEach(function (n) {
      var el = document.querySelector(n.selector);
      if (!el) { targetYs.push(null); return; }
      var r   = el.getBoundingClientRect();
      var abs = r.top + scrollY + r.height / 2;
      targetYs.push(abs);
    });

    positionNodes();
  }

  function positionNodes() {
    /* The nav rail runs from navY_start to navY_end in viewport space.
       We pick min/max of our targets clamped to visible area. */
    var validYs = targetYs.filter(function (y) { return y !== null; });
    if (!validYs.length) return;

    /* Rail: top = first target in viewport coords, bottom = last */
    var railTop    = navH + 24;
    var railBottom = vh - 32;
    var railH      = railBottom - railTop;

    /* Map absolute target to rail percentage */
    function toRailPct(absY) {
      /* viewport Y of element center */
      var viewportY = absY - scrollY;
      /* clamp to rail */
      var pct = (viewportY - railTop) / railH;
      return Math.max(0, Math.min(1, pct));
    }

    /* Position nav wrapper to cover full rail */
    nav.style.top    = railTop + 'px';
    nav.style.bottom = 'auto';
    nav.style.height = railH + 'px';
    nav.style.transform = 'none';

    /* Position each node absolutely within the nav */
    nodeEls.forEach(function (nodeEl, i) {
      if (targetYs[i] === null) { nodeEl.style.display = 'none'; return; }
      nodeEl.style.display  = 'flex';
      nodeEl.style.position = 'absolute';
      var pct = toRailPct(targetYs[i]);
      nodeEl.style.top = (pct * railH) + 'px';
      nodeEl.style.transform = 'translateY(-50%)';
    });
  }

  /* ── SCROLL HANDLER ──────────────────────────── */
  function onScroll() {
    scrollY = window.scrollY || window.pageYOffset;
    vh      = window.innerHeight;

    var navEl     = document.getElementById('scroll-nav');
    var progressEl = document.getElementById('scroll-nav-progress');
    var railTop   = navH + 24;
    var railBottom = vh - 32;
    var railH     = railBottom - railTop;

    /* Determine which section is active (viewport midpoint) */
    var midY   = scrollY + vh / 2;
    var active = 0;

    for (var i = 0; i < targetYs.length; i++) {
      if (targetYs[i] !== null && targetYs[i] <= midY) {
        active = i;
      }
    }

    nodeEls.forEach(function (n, i) {
      if (i === active) n.classList.add('active');
      else              n.classList.remove('active');
    });

    /* Progress line: from first node to active node */
    if (progressEl && targetYs[0] !== null && targetYs[active] !== null) {
      var firstViewY  = targetYs[0]      - scrollY;
      var activeViewY = targetYs[active] - scrollY;

      /* Smooth fill: interpolate to next node based on scroll */
      var nextIdx = Math.min(active + 1, targetYs.length - 1);
      var nextY   = targetYs[nextIdx] !== null ? targetYs[nextIdx] - scrollY : activeViewY;
      var segFrac = 0;
      if (nextIdx !== active && nextY !== activeViewY) {
        segFrac = Math.max(0, Math.min(1, (midY - (targetYs[active] || 0)) / ((targetYs[nextIdx] || midY) - (targetYs[active] || midY))));
      }
      var interpViewY = activeViewY + (nextY - activeViewY) * segFrac;

      var startPct = Math.max(0, Math.min(1, (firstViewY  - railTop) / railH));
      var endPct   = Math.max(0, Math.min(1, (interpViewY - railTop) / railH));

      progressEl.style.top    = (startPct * 100).toFixed(1) + '%';
      progressEl.style.height = Math.max(0, (endPct - startPct) * 100).toFixed(1) + '%';
    }

    /* Reposition nodes on scroll (viewport changes) */
    positionNodes();
  }

  /* ── EVENTS ──────────────────────────────────── */
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () {
    setTimeout(function () { cachePositions(); onScroll(); }, 100);
  });

  /* ── BOOT ────────────────────────────────────── */
  function boot() {
    cachePositions();
    onScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    setTimeout(boot, 120);
  }

})();
