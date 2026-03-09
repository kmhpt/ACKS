/* ═══════════════════════════════════════════════════
   ball.js — Rolling ball scroll animation

   FIXES IN THIS VERSION:
   - Ball Y position is anchored to a fixed viewport %
     so it never drifts vertically as the page scrolls
   - Ball only moves horizontally (like a ball on a track)
   - Rolls in from edge → lands in pocket → rolls off edge
   - Inner ring removed from CSS ball visually
   - Last panel ball is clickable link to services

   CONFIG — edit these values at the top:
════════════════════════════════════════════════════ */

(function () {

  /* ══════════════════════════════════════════════
     CONFIG
  ══════════════════════════════════════════════ */
  var BALL_SIZE  = 80;    // px — diameter
  var EXIT_DIST  = 120;   // px past screen edge (keep short for track feel)
  var SMOOTHNESS = 0.055; // 0.04 = floaty, 0.12 = snappy
  var ROLL_SPEED = 0.8;   // rotation degrees per px of horizontal travel
  var USE_PNG    = false; // true = PNG image ball, false = CSS ball

  /* SECTIONS — one entry per section the ball visits.
     id         → matches <section id="..."> in index.html
     xPercent   → horizontal resting position, % of viewport width
                  (ball centre will be at this % — text should be on the other side)
     yViewport  → vertical position as % of VIEWPORT HEIGHT (not section height!)
                  This keeps the ball stable as the page scrolls.
                  70 = 70% down the screen = below center
     exitTo     → 'left' or 'right': which edge ball rolls off to next
  */
  var SECTIONS = [
    { id: '#hero',            xPercent: 30,  yViewport: 68, exitTo: 'left'  },
    { id: '#value-statement', xPercent: 70,  yViewport: 50, exitTo: 'right' },
    { id: '#gateway',         xPercent: 30,  yViewport: 50, exitTo: 'left'  },
    { id: '#lastPanel',       xPercent: 50,  yViewport: 55, exitTo: 'right' },
  ];

  /* ══════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════ */
  var container = document.getElementById('ball-container');
  if (!container) return;

  var vw = window.innerWidth;
  var vh = window.innerHeight;

  // Pull ball out of document flow, fix to viewport
  container.style.cssText =
    'position:fixed;top:0;left:0;' +
    'width:'  + BALL_SIZE + 'px;' +
    'height:' + BALL_SIZE + 'px;' +
    'z-index:9999;pointer-events:none;will-change:transform;';

  // Show correct ball type
  var cssBall = document.getElementById('ball-css');
  var pngBall = document.getElementById('ball-png');
  if (USE_PNG && pngBall) {
    if (cssBall) cssBall.style.display = 'none';
    pngBall.style.display = 'block';
    pngBall.style.width   = BALL_SIZE + 'px';
    pngBall.style.height  = BALL_SIZE + 'px';
  } else if (cssBall) {
    cssBall.style.display = 'block';
    if (pngBall) pngBall.style.display = 'none';
  }

  // Make last panel ball clickable
  var lastPanelBallLink = document.getElementById('last-panel-ball-link');

  /* ══════════════════════════════════════════════
     STATE
  ══════════════════════════════════════════════ */
  var currentX  = offLeft();
  var currentY  = vh * 0.6;
  var targetX   = offLeft();
  var targetY   = vh * 0.6;
  var lastX     = offLeft();
  var rotation  = 0;
  var scrollY   = window.scrollY || window.pageYOffset;
  var inLastPanel = false;

  /* ══════════════════════════════════════════════
     HELPERS
  ══════════════════════════════════════════════ */
  function lerp(a, b, t) { return a + (b - a) * t; }

  function ease(t) {
    // Smooth ease-in-out (cubic)
    t = Math.max(0, Math.min(1, t));
    return t * t * (3 - 2 * t);
  }

  function offLeft()  { return -(BALL_SIZE + EXIT_DIST); }
  function offRight() { return vw + EXIT_DIST; }

  // Resting X in px from viewport left edge (centred on xPercent)
  function restX(cfg) {
    return (vw * cfg.xPercent / 100) - BALL_SIZE / 2;
  }

  // Resting Y in px from viewport top — FIXED to viewport %, not section
  function restY(cfg) {
    return (vh * cfg.yViewport / 100) - BALL_SIZE / 2;
  }

  /* ══════════════════════════════════════════════
     SECTION CACHE
     We store absolute page positions (scrollY-independent)
     and only recalculate on resize, not every frame.
     This is what prevents the erratic jumping.
  ══════════════════════════════════════════════ */
  var cache = [];

  function buildCache() {
    scrollY = window.scrollY || window.pageYOffset;
    cache   = [];

    for (var i = 0; i < SECTIONS.length; i++) {
      var el = document.querySelector(SECTIONS[i].id);
      if (!el) continue;
      var r = el.getBoundingClientRect();
      cache.push({
        cfg:    SECTIONS[i],
        // Absolute top/bottom of section on the full page
        top:    r.top  + scrollY,
        bottom: r.bottom + scrollY,
        height: r.height,
      });
    }
  }

  window.addEventListener('scroll', function () {
    scrollY = window.scrollY || window.pageYOffset;
  }, { passive: true });

  window.addEventListener('resize', function () {
    vw = window.innerWidth;
    vh = window.innerHeight;
    setTimeout(buildCache, 120);
  });

  /* ══════════════════════════════════════════════
     COMPUTE TARGET
     Uses cached absolute positions + live scrollY.
     No DOM reads inside here = no layout thrashing.

     Each section has three phases:
       Phase 1 (0 → 0.30): ball rolls IN from edge
       Phase 2 (0.30 → 0.75): ball sits in pocket (still)
       Phase 3 (0.75 → 1.00): ball rolls OUT to edge

     Y position is always restY(cfg) — a fixed % of
     the viewport — so it never drifts vertically.
  ══════════════════════════════════════════════ */
  function computeTarget() {
    inLastPanel = false;

    for (var i = 0; i < cache.length; i++) {
      var s   = cache[i];
      var cfg = s.cfg;

      // Section top relative to current viewport
      var relTop = s.top - scrollY;
      var sH     = s.height;

      // Active when: section top is above 90% of viewport
      //         and: section top hasn't scrolled more than 60% past top
      var enterAt = vh * 0.90;
      var exitAt  = -(sH * 0.60);

      if (relTop < enterAt && relTop > exitAt) {
        var raw      = (enterAt - relTop) / (enterAt - exitAt);
        var progress = Math.max(0, Math.min(1, raw));

        // Entry side = opposite of previous section's exitTo
        var prev      = i > 0 ? cache[i - 1].cfg : null;
        var entryFrom = prev
          ? (prev.exitTo === 'left' ? offLeft() : offRight())
          : offLeft();

        var exitX  = cfg.exitTo === 'left' ? offLeft() : offRight();
        var rx     = restX(cfg);
        var ry     = restY(cfg); // fixed viewport % — never changes with scroll

        if (progress < 0.30) {
          // Roll IN
          targetX = lerp(entryFrom, rx, ease(progress / 0.30));
          targetY = ry;
        } else if (progress < 0.75) {
          // Sit in pocket
          targetX = rx;
          targetY = ry;
          // Is this the last panel?
          if (cfg.id === '#lastPanel') inLastPanel = true;
        } else {
          // Roll OUT
          targetX = lerp(rx, exitX, ease((progress - 0.75) / 0.25));
          targetY = ry;
        }

        // Last panel special: make ball container clickable when sitting
        if (container) {
          if (inLastPanel) {
            container.style.pointerEvents = 'all';
            container.style.cursor = 'pointer';
          } else {
            container.style.pointerEvents = 'none';
            container.style.cursor = 'default';
          }
        }

        return; // found active section — done
      }
    }

    // No section active — ball stays off-screen wherever it last was
    container.style.pointerEvents = 'none';
  }

  /* ══════════════════════════════════════════════
     CLICK HANDLER
     When ball is in last panel, clicking navigates
     to services page.
  ══════════════════════════════════════════════ */
  container.addEventListener('click', function () {
    if (inLastPanel) {
      window.location.href = 'services.html';
    }
  });

  /* ══════════════════════════════════════════════
     ANIMATION LOOP
  ══════════════════════════════════════════════ */
  function animate() {
    computeTarget();

    // Smooth lerp toward target
    currentX = lerp(currentX, targetX, SMOOTHNESS);
    currentY = lerp(currentY, targetY, SMOOTHNESS);

    // Rotation from horizontal distance only
    var dx = currentX - lastX;
    rotation += dx * ROLL_SPEED;
    lastX = currentX;

    container.style.transform =
      'translate(' + currentX.toFixed(2) + 'px,' +
      currentY.toFixed(2) + 'px) ' +
      'rotate(' + rotation.toFixed(2) + 'deg)';

    requestAnimationFrame(animate);
  }

  /* ══════════════════════════════════════════════
     BOOT
  ══════════════════════════════════════════════ */
  function boot() {
    buildCache();
    animate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    setTimeout(boot, 80); // small delay so page layout is settled
  }

})();
