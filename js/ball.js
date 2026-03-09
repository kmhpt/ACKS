/* ═══════════════════════════════════════════════════
   ball.js — Rolling ball scroll animation
   Handles: position, rotation, scroll-trigger,
            enter/exit transitions per section.

   ── QUICK CONFIG ──────────────────────────────────
   All tuneable values are at the top of CONFIG.
   To switch to a PNG ball:
     1. Comment out #ball-css in index.html
     2. Uncomment #ball-png in index.html
     3. Set USE_PNG = true below
════════════════════════════════════════════════════ */

(function () {

  /* ══════════════════════════════════════════════
     CONFIG
  ══════════════════════════════════════════════ */
  var CONFIG = {
    USE_PNG:       false,   // true = PNG image, false = CSS ball
    BALL_SIZE:     80,      // px — diameter
    LEFT_X:        30,      // % from left for left-side resting pos
    RIGHT_X:       70,      // % from left for right-side resting pos
    EXIT_DIST:     120,     // px past screen edge on exit
    SMOOTHNESS:    0.07,    // 0.04 slow/floaty → 0.15 snappy
    ROLL_SPEED:    0.75,    // rotation per px of horizontal movement

    // Each section the ball appears in.
    // id       → matches <section id="..."> in index.html
    // xPercent → horizontal resting position (% of viewport)
    // yPercent → vertical resting position (% of section height)
    // exitTo   → 'left' or 'right'
    SECTIONS: [
      { id: '#hero',            xPercent: 50,  yPercent: 15, exitTo: 'left'  },
      { id: '#value-statement', xPercent: 30,  yPercent: 50, exitTo: 'right' },
      { id: '#gateway',         xPercent: 70,  yPercent: 50, exitTo: 'left'  },
    ]
  };

  /* ══════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════ */
  var container = document.getElementById('ball-container');
  if (!container) return; // bail if not on home page

  var vw = window.innerWidth;
  var vh = window.innerHeight;

  // Pull ball out of document flow and fix to viewport
  container.style.position = 'fixed';
  container.style.top      = '0';
  container.style.left     = '0';
  container.style.width    = CONFIG.BALL_SIZE + 'px';
  container.style.height   = CONFIG.BALL_SIZE + 'px';
  container.style.zIndex   = '9999';
  container.style.pointerEvents = 'none';

  // Show correct ball type
  var cssBall = document.getElementById('ball-css');
  var pngBall = document.getElementById('ball-png');

  if (CONFIG.USE_PNG && pngBall) {
    if (cssBall) cssBall.style.display = 'none';
    pngBall.style.display = 'block';
    pngBall.style.width   = CONFIG.BALL_SIZE + 'px';
    pngBall.style.height  = CONFIG.BALL_SIZE + 'px';
  } else if (cssBall) {
    cssBall.style.display = 'block';
    if (pngBall) pngBall.style.display = 'none';
  }

  /* ══════════════════════════════════════════════
     STATE
  ══════════════════════════════════════════════ */
  var rotation = 0;
  var currentX = offLeft();
  var currentY = vh * 0.5;
  var targetX  = offLeft();
  var targetY  = vh * 0.5;
  var lastX    = offLeft();

  /* ══════════════════════════════════════════════
     HELPERS
  ══════════════════════════════════════════════ */
  function lerp(a, b, t) { return a + (b - a) * t; }

  function easeInOut(t) {
    t = Math.max(0, Math.min(1, t));
    return t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
  }

  function offLeft()  { return -(CONFIG.BALL_SIZE + CONFIG.EXIT_DIST); }
  function offRight() { return vw + CONFIG.EXIT_DIST; }

  /* ══════════════════════════════════════════════
     COMPUTE TARGET POSITION
     Runs every animation frame.
     Finds which section is currently active and
     sets targetX/Y based on scroll progress.
  ══════════════════════════════════════════════ */
  function computeTarget() {
    vw = window.innerWidth;
    vh = window.innerHeight;

    var sections = CONFIG.SECTIONS;

    for (var i = 0; i < sections.length; i++) {
      var cfg = sections[i];
      var el  = document.querySelector(cfg.id);
      if (!el) continue;

      var rect = el.getBoundingClientRect();
      var sH   = rect.height;

      var enterAt = vh * 0.85;   // section starts entering
      var exitAt  = -(sH * 0.5); // section has mostly scrolled past

      if (rect.top < enterAt && rect.top > exitAt) {
        var raw      = (enterAt - rect.top) / (enterAt - exitAt);
        var progress = easeInOut(Math.max(0, Math.min(1, raw)));

        // Resting position in viewport coordinates
        var restX = (vw * cfg.xPercent / 100) - CONFIG.BALL_SIZE / 2;
        var restY = rect.top + (sH * cfg.yPercent / 100) - CONFIG.BALL_SIZE / 2;

        // Entry side: opposite of previous section's exitTo
        var prev      = sections[i - 1];
        var entryFrom = prev
          ? (prev.exitTo === 'left' ? offLeft() : offRight())
          : (cfg.xPercent < 50 ? offLeft() : offRight());

        var exitX = cfg.exitTo === 'left' ? offLeft() : offRight();

        if (progress < 0.30) {
          // Phase 1 — roll IN
          var t = easeInOut(progress / 0.30);
          targetX = lerp(entryFrom, restX, t);
          targetY = restY;
        } else if (progress < 0.72) {
          // Phase 2 — sit still in resting spot
          targetX = restX;
          targetY = restY;
        } else {
          // Phase 3 — roll OUT
          var t2  = easeInOut((progress - 0.72) / 0.28);
          targetX = lerp(restX, exitX, t2);
          targetY = restY;
        }

        return;
      }
    }
    // No active section — hold position (ball is off-screen)
  }

  /* ══════════════════════════════════════════════
     ANIMATION LOOP
  ══════════════════════════════════════════════ */
  function animate() {
    computeTarget();

    // Smooth lerp toward target
    currentX = lerp(currentX, targetX, CONFIG.SMOOTHNESS);
    currentY = lerp(currentY, targetY, CONFIG.SMOOTHNESS);

    // Rotation from horizontal travel distance
    var dx = currentX - lastX;
    rotation += dx * CONFIG.ROLL_SPEED;
    lastX = currentX;

    // Apply transform — single translate+rotate keeps it GPU-composited
    container.style.transform =
      'translate(' + currentX.toFixed(1) + 'px,' +
      currentY.toFixed(1) + 'px) ' +
      'rotate(' + rotation.toFixed(1) + 'deg)';

    requestAnimationFrame(animate);
  }

  /* ══════════════════════════════════════════════
     BOOT
  ══════════════════════════════════════════════ */
  window.addEventListener('resize', function () {
    vw = window.innerWidth;
    vh = window.innerHeight;
  });

  animate();

})();
