// ─── WORLD CONSTANTS ─────────────────────────────────────
export const X_LIMIT = 4.5;
export const BASE_HEIGHT = -1.4;
export const ROTATION_FACTOR = 16;

// ─── BAT POSITION ────────────────────────────────────────
const BAT_TIP_X = -2.8;
const BAT_TIP_Y = 0.5;
const BAT_TIP_Z = 1.5;

// 🆕 PRE-HIT (near elbow)
const PRE_HIT_X = -1.8;
const PRE_HIT_Y = 0.2;
const PRE_HIT_Z = 1.2;

// ─── HERO END ────────────────────────────────────────────
const HERO_END_X = X_LIMIT;
const HERO_END_Y = BASE_HEIGHT + 0.2;
const HERO_END_Z = 0;

// ─── SECTIONS ────────────────────────────────────────────
const SECTIONS = [
  { start: 0.0, end: 0.2, fromX: BAT_TIP_X, toX: HERO_END_X, bounces: 0, amp: 2.6, isHero: true },
  { start: 0.2, end: 0.4, fromX: X_LIMIT, toX: -X_LIMIT, bounces: 1, amp: 1.5 },
  { start: 0.4, end: 0.6, fromX: -X_LIMIT, toX: X_LIMIT, bounces: 2, amp: 2.0 },
  { start: 0.6, end: 0.8, fromX: X_LIMIT, toX: -X_LIMIT, bounces: 3, amp: 2.5 },
  { start: 0.8, end: 1.0, fromX: -X_LIMIT, toX: X_LIMIT, bounces: 4, amp: 3.0 },
];

// ─── HELPERS ─────────────────────────────────────────────
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function smoothstep(t) {
  const c = clamp(t, 0, 1);
  return c * c * (3 - 2 * c);
}

function getSection(p) {
  return SECTIONS.find(s => p >= s.start && p < s.end) || SECTIONS[SECTIONS.length - 1];
}

// ─── BALL POSITION ───────────────────────────────────────
export function getBallPosition(scrollProgress) {
  const p = clamp(scrollProgress, 0, 1);
  const s = getSection(p);

  // 🎯 HERO LOGIC
  if (s.isHero) {

    // ── PHASE 1: incoming ball (0 → 0.05)
    if (p <= 0.05) {
      const t = clamp(p / 0.05, 0, 1);

      return {
        x: lerp(PRE_HIT_X, BAT_TIP_X, t),
        y: lerp(PRE_HIT_Y, BAT_TIP_Y, t),
        z: lerp(PRE_HIT_Z, BAT_TIP_Z, t),
        rotationX: t * Math.PI * 2,
        rotationZ: t * Math.PI * 0.5,
      };
    }

    // ── PHASE 2: hit + arc (0.05 → 0.20)
    const localProgress = clamp((p - 0.05) / 0.15, 0, 1);
    const eased = smoothstep(localProgress);

    const x = lerp(BAT_TIP_X, HERO_END_X, eased);

    // 🔥 stronger arc
    const arcHeight = Math.sin(localProgress * Math.PI) * 3.2;
    const y = BAT_TIP_Y + arcHeight;

    const z = lerp(BAT_TIP_Z, HERO_END_Z, eased);

    const rotationX = localProgress * ROTATION_FACTOR * Math.PI * 0.5;
    const rotationZ = localProgress * ROTATION_FACTOR * 0.4 * Math.PI;

    return { x, y, z, rotationX, rotationZ };
  }

  // ── NORMAL SECTIONS
  const lp = clamp((p - s.start) / (s.end - s.start), 0, 1);

  const x = lerp(s.fromX, s.toX, lp);
  const y = BASE_HEIGHT + Math.abs(Math.sin(lp * Math.PI * s.bounces)) * s.amp;
  const z = Math.sin(p * Math.PI * 2.5) * 0.25;

  const rotationX = p * ROTATION_FACTOR * Math.PI;
  const rotationZ = p * ROTATION_FACTOR * 0.65 * Math.PI;

  return { x, y, z, rotationX, rotationZ };
}

// ─── BAT SWING ───────────────────────────────────────────
export function getBatsmanSwing(scrollProgress) {
  if (scrollProgress <= 0) return { rotationY: -0.3 };

  const t = clamp((scrollProgress - 0.02) / 0.13, 0, 1);

  const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  const swingAngle = eased * (Math.PI / 2.5);

  return { rotationY: -0.3 + swingAngle * 0.75 };
}

// ─── 🆕 PLAYER TRACKING (THIS IS WHAT YOU NEED) ───────────
export function getCatchPlayerState(sectionProgress, ballX = 0) {
  const p = clamp(sectionProgress, 0, 1);

  // Smooth tracking progress
  const trackT = clamp(p / 0.6, 0, 1);

  // 🔥 Rotate towards ball
  const targetRotation = ballX * -0.25;

  const rotationY = targetRotation * trackT;

  // Jump / catch animation
  const catchT = clamp(p / 0.6, 0, 1);

  const eased =
    catchT < 0.5
      ? 2 * catchT * catchT
      : -1 + (4 - 2 * catchT) * catchT;

  const posY = eased * 0.4;

  return {
    rotationY,
    posY,
    catchT,
    catching: p > 0,
  };
}