"use client";

// Shared motion pieces. Every screen uses these so the app moves the same way everywhere.
// Reduced motion is handled once by <MotionConfig reducedMotion="user"> in providers.js.
import { useEffect, useRef } from "react";
import { animate, motion, useReducedMotion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1];

// Fade and rise when a page opens. Give it key={pathname}.
export function PageTransition({ children, className = "" }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

// Staggered entrance for a list or grid. Wrap each child in <RevealItem>.
export function Reveal({ children, className = "", delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: delay } } }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className = "" }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  );
}

// A card that lifts on hover and presses in on tap.
export function PressableCard({ children, className = "", ...rest }) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

// Animates a number from its old value to its new one.
export function CountUp({ value = 0, duration = 0.8, className = "" }) {
  const ref = useRef(null);
  const previous = useRef(0);
  const reduced = useReducedMotion();
  const target = Number(value) || 0;

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (reduced) {
      node.textContent = target.toLocaleString();
      previous.current = target;
      return undefined;
    }

    const controls = animate(previous.current, target, {
      duration,
      ease: EASE,
      onUpdate: (latest) => {
        node.textContent = Math.round(latest).toLocaleString();
      },
    });
    previous.current = target;
    return () => controls.stop();
  }, [target, duration, reduced]);

  return (
    <span ref={ref} className={className}>
      {target.toLocaleString()}
    </span>
  );
}

// Shakes on "wrong", pops on "correct". Pass state = "correct" | "wrong" | null.
export function AnswerFeedback({ state, children, className = "" }) {
  const variants = {
    idle: { x: 0, scale: 1 },
    correct: { scale: [1, 1.03, 1], transition: { duration: 0.3 } },
    wrong: { x: [0, -8, 8, -5, 5, 0], transition: { duration: 0.35 } },
  };

  return (
    <motion.div className={className} animate={state || "idle"} variants={variants}>
      {children}
    </motion.div>
  );
}

// A bar that fills smoothly to percent (0 to 100).
export function ProgressBar({ percent = 0, className = "", barClassName = "" }) {
  const width = Math.max(0, Math.min(100, Number(percent) || 0));

  return (
    <div className={`h-2.5 w-full overflow-hidden rounded-full bg-slate-800 ${className}`}>
      <motion.div
        className={`h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 ${barClassName}`}
        initial={{ width: 0 }}
        animate={{ width: `${width}%` }}
        transition={{ duration: 0.5, ease: EASE }}
      />
    </div>
  );
}

// A full-screen confetti burst. Fires each time `fire` changes to a truthy value.
export function Confetti({ fire }) {
  const canvasRef = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!fire || reduced || !canvas) return undefined;

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colours = ["#34d399", "#22d3ee", "#facc15", "#f472b6", "#a78bfa"];
    const pieces = Array.from({ length: 120 }, () => ({
      x: canvas.width / 2,
      y: canvas.height / 3,
      vx: (Math.random() - 0.5) * 16,
      vy: Math.random() * -14 - 4,
      size: Math.random() * 6 + 4,
      spin: Math.random() * Math.PI,
      colour: colours[Math.floor(Math.random() * colours.length)],
    }));

    const start = performance.now();
    let frame;

    const draw = (now) => {
      const elapsed = now - start;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const piece of pieces) {
        piece.vy += 0.35;
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.spin += 0.2;

        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - elapsed / 1600);
        ctx.translate(piece.x, piece.y);
        ctx.rotate(piece.spin);
        ctx.fillStyle = piece.colour;
        ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.6);
        ctx.restore();
      }

      if (elapsed < 1600) {
        frame = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [fire, reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
    />
  );
}

// Soft coloured shapes that drift behind the app. Purely decorative.
const SHAPES = [
  { left: "6%", top: "18%", size: 46, colour: "#fde047", delay: "0s", round: true },
  { left: "88%", top: "12%", size: 34, colour: "#f472b6", delay: "1.2s", round: false },
  { left: "78%", top: "62%", size: 58, colour: "#38bdf8", delay: "0.6s", round: true },
  { left: "14%", top: "74%", size: 38, colour: "#a78bfa", delay: "2s", round: false },
  { left: "48%", top: "88%", size: 30, colour: "#34d399", delay: "1.6s", round: true },
  { left: "56%", top: "6%", size: 26, colour: "#fb923c", delay: "2.6s", round: false },
];

export function FloatingShapes() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      {SHAPES.map((shape, index) => (
        <span
          key={index}
          className="tt-shape absolute"
          style={{
            left: shape.left,
            top: shape.top,
            width: shape.size,
            height: shape.size,
            background: shape.colour,
            borderRadius: shape.round ? "9999px" : "30%",
            animationDelay: shape.delay,
          }}
        />
      ))}
    </div>
  );
}
