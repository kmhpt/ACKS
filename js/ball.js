/* ═══════════════════════════════════════════════════
   ball.js — rolling ball scroll animation

   HOW TO CONFIGURE
   ─────────────────
   BALL_SIZE    → match to your image dimensions (px)
   LEFT_X       → resting x position for left sections (% of viewport)
   RIGHT_X      → resting x position for right sections (% of viewport)
   EXIT_DIST    → how far off-screen ball travels (px) — keep it short!
   SMOOTHNESS   → 0.04 (floaty) to 0.15 (snappy)
   ROLL_SPEED   → how fast the ball rotates per pixel moved

   SECTIONS array → one entry per section the ball appears in.
   Each entry:
     id        — matches the #id on your HTML section
     xPercent  — horizontal resting position (% of viewport width)
     yPercent  — vertical resting position (% of section height)
     exitTo    — 'left' or 'right': which side ball rolls off to
════════════════════════════════════════════════════ */

(function () {

  /* ── Config ────────────────────────────────────── */
  var BALL_SIZE   = 80;    // px — match your image
  var LEFT_X      = 30;   // % from left for left-side sections
  var RIGHT_X     = 70;   // % from left for right-side sections
  var EXIT_DIST   = 100;  // px past the screen edge
  var SMOOTHNESS  = 0.07; // follow speed
  var ROLL_SPEED  = 0.8;  // rotation per pixel

  var SECTIONS = [
    { id: '#about',   xPercent: LEFT_X,  yPercent: 50, exitTo: 'left'  },
    { id: '#work',    xPercent: RIGHT_X, yPercent: 50, exitTo: 'right' },
    { id: '#contact', xPercent: LEFT_X,  yPercent: 50, exitTo: 'left'  },
  ];

  /* ── State ─────────────────────────────────────── */
  var ball      = document.getElementById('rolling-ball');
  var vw        = window.innerWidth;
  var vh        = window.innerHeight;
  var rotation  = 0;
  var currentX  = -(BALL_SIZE + EXIT_DIST); // start off-screen left
  var currentY  = vh * 0.5;
  var targetX   = currentX;
  var targetY   = currentY;
  var lastX     = currentX;

  /* ── Helpers ───────────────────────────────────── */
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function easeInOut(t) {
    t = Math.max(0, Math.min(1, t));
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  function offLeft()  { return -(BALL_SIZE + EXIT_DIST); }
  function offRight() { return vw + EXIT_DIST; }

  /* ── Compute where ball should be ─────────────── */
  function computeTarget() {
    vw = window.innerWidth;
    vh = window.innerHeight;

    for (var i = 0; i < SECTIONS.length; i++) {
      var cfg  = SECTIONS[i];
      var el   = document.querySelector(cfg.id);
      if (!el) continue;

      var rect = el.getBoundingClientRect();
      var sH   = rect.height;

      // Section is "active" between these scroll positions
      var enterAt = vh * 0.75;
      var exitAt  = -(sH * 0.40);

      if (rect.top < enterAt && rect.top > exitAt) {
        var raw      = (enterAt - rect.top) / (enterAt - exitAt);
        var progress = easeInOut(Math.max(0, Math.min(1, raw)));

        // Resting position in fixed viewport coords
        var restX = (vw * cfg.xPercent / 100) - BALL_SIZE / 2;
        var restY = rect.top + (sH * cfg.yPercent / 100) - BALL_SIZE / 2;

        // Which side does ball enter from?
        var prev      = SECTIONS[i - 1];
        var entryFrom = prev
          ? (prev.exitTo === 'left' ? offLeft() : offRight())
          : (cfg.xPercent < 50 ? offLeft() : offRight());

        // Which side does ball exit to?
        var exitX = cfg.exitTo === 'left' ? offLeft() : offRight();

        if (progress < 0.35) {
          // Phase 1 — roll IN from edge to resting spot
          var t = easeInOut(progress / 0.35);
          targetX = lerp(entryFrom, restX, t);
          targetY = restY;

        } else if (progress < 0.75) {
          // Phase 2 — sit still in pocket
          targetX = restX;
          targetY = restY;

        } else {
          // Phase 3 — roll OUT toward edge
          var t2  = easeInOut((progress - 0.75) / 0.25);
          targetX = lerp(restX, exitX, t2);
          targetY = restY;
        }

        return; // active section found, stop looping
      }
    }
    // No active section — ball stays wherever it is (off-screen)
  }

  /* ── Animation loop ────────────────────────────── */
  function animate() {
    computeTarget();

    // Smooth follow toward target
    currentX = lerp(currentX, targetX, SMOOTHNESS);
    currentY = lerp(currentY, targetY, SMOOTHNESS);

    // Rotate based on horizontal movement
    var dx = currentX - lastX;
    rotation += dx * ROLL_SPEED;
    lastX = currentX;

    ball.style.transform =
      'translate(' + currentX.toFixed(1) + 'px, ' + currentY.toFixed(1) + 'px) ' +
      'rotate(' + rotation.toFixed(1) + 'deg)';

    requestAnimationFrame(animate);
  }

  /* ── Init ──────────────────────────────────────── */
  window.addEventListener('resize', function () {
    vw = window.innerWidth;
    vh = window.innerHeight;
  });

  animate();

})();
