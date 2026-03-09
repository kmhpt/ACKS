/* ═══════════════════════════════════════════════════
   ball.js — Rolling ball scroll animation

   Behaviour:
   1. Ball starts below hero headline, centred
   2. As hero scrolls away → rolls LEFT off screen (slow)
   3. When value-statement cards are fully visible →
      ball rolls in slowly from RIGHT
   4. Lands below the middle card, centred
   5. Glows softly when at rest
   6. Rolls LEFT off as section exits
════════════════════════════════════════════════════ */
(function () {

  /* ── CONFIG ──────────────────────────────────── */
  var BALL_SIZE  = 80;
  var EXIT_DIST  = 160;
  var SMOOTHNESS = 0.036; // very slow/floaty rolls
  var ROLL_SPEED = 0.85;

  var SECTIONS = [
    {
      id:        '#hero',
      xPct:      50,
      yViewport: 74,      // below headline text
      enterFrom: 'right',
      exitTo:    'left',
      enterAt:   0.12,
      exitAt:    0.68,
      glow:      false,
    },
    {
      id:        '#value-statement',
      xPct:      50,      // centred horizontally
      yViewport: 82,      // low — between cards and gateway
      enterFrom: 'right',
      exitTo:    'left',
      enterAt:   0.52,    // enters AFTER cards have flipped in
      exitAt:    0.86,
      glow:      true,
    },
  ];

  /* ── INIT ────────────────────────────────────── */
  var container = document.getElementById('ball-container');
  if (!container) return;

  var vw = window.innerWidth;
  var vh = window.innerHeight;

  container.style.cssText =
    'position:fixed;top:0;left:0;' +
    'width:'  + BALL_SIZE + 'px;' +
    'height:' + BALL_SIZE + 'px;' +
    'z-index:500;pointer-events:none;will-change:transform;';

  var ring = container.querySelector('.ball-ring');
  if (ring) ring.style.display = 'none';

  /* ── STATE ───────────────────────────────────── */
  var scrollY   = window.scrollY || window.pageYOffset;
  var currentX  = offRight();
  var currentY  = vh * 0.74;
  var targetX   = offRight();
  var targetY   = vh * 0.74;
  var lastX     = currentX;
  var rotation  = 0;
  var isGlowing = false;

  /* ── HELPERS ─────────────────────────────────── */
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function ease(t) { t = clamp(t,0,1); return t*t*(3-2*t); }
  function offLeft()  { return -(BALL_SIZE + EXIT_DIST); }
  function offRight() { return vw + EXIT_DIST; }
  function restX(s)   { return (vw * s.xPct / 100) - BALL_SIZE / 2; }
  function restY(s)   { return (vh * s.yViewport / 100) - BALL_SIZE / 2; }

  /* ── SECTION CACHE ───────────────────────────── */
  var cache = [];

  function buildCache() {
    scrollY = window.scrollY || window.pageYOffset;
    cache = [];
    SECTIONS.forEach(function(s) {
      var el = document.querySelector(s.id);
      if (!el) return;
      var r = el.getBoundingClientRect();
      cache.push({ s: s, top: r.top + scrollY, height: r.height });
    });
  }

  window.addEventListener('scroll', function() {
    scrollY = window.scrollY || window.pageYOffset;
  }, { passive: true });

  window.addEventListener('resize', function() {
    vw = window.innerWidth; vh = window.innerHeight;
    setTimeout(buildCache, 150);
  });

  /* ── GLOW ────────────────────────────────────── */
  var core = container.querySelector('.ball-core');

  function setGlow(on) {
    if (!core || on === isGlowing) return;
    isGlowing = on;
    if (on) {
      core.classList.add('ball-glow-active');
    } else {
      core.classList.remove('ball-glow-active');
    }
  }

  /* ── COMPUTE TARGET ──────────────────────────── */
  function computeTarget() {
    var found = false;
    for (var i = 0; i < cache.length; i++) {
      var c   = cache[i];
      var s   = c.s;
      var rel = c.top - scrollY;
      var sH  = c.height;

      var enterAt = vh * 0.90;
      var exitAt  = -(sH * 0.60);

      if (rel < enterAt && rel > exitAt) {
        found = true;
        var progress = clamp((enterAt - rel) / (enterAt - exitAt), 0, 1);
        var rx = restX(s);
        var ry = restY(s);
        var fromX = s.enterFrom === 'left' ? offLeft() : offRight();
        var toX   = s.exitTo   === 'left'  ? offLeft() : offRight();

        if (progress < s.enterAt) {
          targetX = lerp(fromX, rx, ease(progress / s.enterAt));
          targetY = ry;
          setGlow(false);
        } else if (progress < s.exitAt) {
          targetX = rx;
          targetY = ry;
          setGlow(s.glow);
        } else {
          targetX = lerp(rx, toX, ease((progress - s.exitAt) / (1 - s.exitAt)));
          targetY = ry;
          setGlow(false);
        }
        break;
      }
    }
    if (!found) setGlow(false);
  }

  /* ── LOOP ────────────────────────────────────── */
  function animate() {
    computeTarget();
    currentX = lerp(currentX, targetX, SMOOTHNESS);
    currentY = lerp(currentY, targetY, SMOOTHNESS);
    var dx = currentX - lastX;
    rotation += dx * ROLL_SPEED;
    lastX = currentX;
    container.style.transform =
      'translate(' + currentX.toFixed(2) + 'px,' +
      currentY.toFixed(2) + 'px) rotate(' + rotation.toFixed(2) + 'deg)';
    requestAnimationFrame(animate);
  }

  function boot() { buildCache(); animate(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    setTimeout(boot, 80);
  }

})();
