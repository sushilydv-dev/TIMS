import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useMotionValue,
  useAnimationFrame,
} from "framer-motion";
import axios from "axios";

/* ── Fallback data ──────────────────────────────────── */
const FALLBACK = [
  { id: "f1", name: "Dr. Sarah Chen",    experience: "12 yrs exp", specialization: "Full-Stack Development",   profile_img: "" },
  { id: "f2", name: "Michael Rodriguez", experience: "8 yrs exp",  specialization: "Cloud Infrastructure",      profile_img: "" },
  { id: "f3", name: "Priya Nair",        experience: "6 yrs exp",  specialization: "UI/UX Architecture",         profile_img: "" },
  { id: "f4", name: "Arjun Mehta",       experience: "10 yrs exp", specialization: "Machine Learning",           profile_img: "" },
  { id: "f5", name: "Sneha Kapoor",      experience: "7 yrs exp",  specialization: "Cybersecurity & DevSecOps",  profile_img: "" },
];

/* ── Avatar palette ─────────────────────────────────── */
const PALETTES = [
  { bg: "from-rose-400 to-[#fc362d]",    text: "text-white" },
  { bg: "from-indigo-400 to-violet-500", text: "text-white" },
  { bg: "from-emerald-400 to-teal-500",  text: "text-white" },
  { bg: "from-amber-400 to-orange-500",  text: "text-white" },
  { bg: "from-sky-400 to-blue-500",      text: "text-white" },
];

/* ── 3D ring tuning ─────────────────────────────────── */
const AUTO_SPEED = 9;          // deg / second
const DIRECTION = 1;           // 1 or -1
const DRAG_SENSITIVITY = 0.32; // px of drag -> degrees of rotation
const FRICTION = 0.94;         // momentum decay per ~16.7ms frame
const MIN_VELOCITY = 0.4;      // deg/s — below this, momentum stops
const SNAP_EASE = 6;           // higher = snappier "click to front"

function normalizeDeg(d) {
  let x = d % 360;
  if (x > 180) x -= 360;
  if (x < -180) x += 360;
  return x;
}

function getDims() {
  if (typeof window === "undefined") {
    return { cardW: 248, cardH: 332, perspective: 1500 };
  }
  const w = window.innerWidth;
  if (w < 640) return { cardW: 156, cardH: 214, perspective: 900 };
  if (w < 1024) return { cardW: 198, cardH: 266, perspective: 1150 };
  return { cardW: 248, cardH: 332, perspective: 1500 };
}

/* ── RingCard — a single card living on the 3D ring ──
 * Important: every card gets ONE explicit transform string (built by us,
 * not composed from Framer's x/y/z/rotateY shorthands) and NO manual
 * z-index and NO `filter`. Both z-index and filter force a card out of
 * the shared 3D rendering context, which breaks the browser's native
 * back-to-front depth sorting — that's what caused the "double exposure"
 * ghosting where the front card and the hidden back card blended
 * together. Plain `opacity` + `backface-visibility: hidden` inside a
 * `transform-style: preserve-3d` ancestor is the combination that
 * reliably depth-sorts and occludes correctly. */
function RingCard({ angle, baseAngle, radius, cardW, cardH, trainer, idx, onSelect }) {
  const pal      = PALETTES[idx % PALETTES.length];
  const initials = (trainer.name || "TR").slice(0, 2).toUpperCase();
  
  // Handle file paths vs base64 URLs
  const imgUrl = trainer.profile_img?.startsWith("data:") ? trainer.profile_img : (trainer.profile_img ? `http://localhost:3000${trainer.profile_img}` : null);
  const hasImg   = imgUrl && imgUrl.length > 10;

  const transform = useTransform(angle, (a) => {
    const total = a + baseAngle;
    return `translate(-50%, -50%) rotateY(${total}deg) translateZ(${radius}px)`;
  });

  // Fades smoothly to 0 exactly as a card crosses ±90°, which is the same
  // point backface-visibility hides it — so there's no visible "pop".
  const opacity = useTransform(angle, (a) => {
    const eff = normalizeDeg(a + baseAngle);
    const cos = Math.cos((eff * Math.PI) / 180);
    return Math.pow(Math.max(0, cos), 0.85);
  });

  // A plain dark overlay (opacity-only, no filter) stands in for "depth
  // shading" on the cards approaching the side of the ring.
  const darken = useTransform(angle, (a) => {
    const eff = normalizeDeg(a + baseAngle);
    const cos = Math.cos((eff * Math.PI) / 180);
    return Math.max(0, 1 - Math.max(0, cos)) * 0.55;
  });

  return (
    <motion.div
      onClick={() => onSelect(baseAngle)}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: cardW,
        height: cardH,
        transform,
        opacity,
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
      className="group rounded-3xl overflow-hidden cursor-pointer shadow-[0_18px_45px_rgba(0,0,0,0.20)]"
    >
      {/* Background — photo or gradient avatar */}
      {hasImg ? (
        <img
          src={imgUrl}
          alt={trainer.name}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          draggable={false}
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${pal.bg} flex items-center justify-center`}>
          <span className={`text-5xl md:text-6xl font-black tracking-tight ${pal.text} opacity-30 select-none`}>
            {initials}
          </span>
        </div>
      )}

      <motion.div
        style={{ position: "absolute", inset: 0, backgroundColor: "#000", opacity: darken }}
        className="pointer-events-none"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

      {/* Bottom gradient + info */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 pt-10">
        <p className="text-white text-sm md:text-base font-extrabold leading-tight truncate">
          {trainer.name}
        </p>
        <p className="text-[#fc362d] text-[11px] md:text-xs font-bold mt-0.5">
          {trainer.experience}
        </p>
        <p className="text-white/60 text-[10px] md:text-[11px] font-medium mt-0.5 line-clamp-1">
          {trainer.specialization}
        </p>
      </div>
    </motion.div>
  );
}

/* ── Header stagger ── */
const stagger  = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const fadeItem = {
  hidden: { opacity: 0, y: 22 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

/* ── Main component ──────────────────────────────────── */
export const Projects = () => {
  const sectionRef = useRef(null);
  const headRef    = useRef(null);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [hovered, setHovered]   = useState(false);
  const [interacted, setInteracted] = useState(false);
  const [dims, setDims] = useState(getDims());

  const headInView = useInView(headRef, { once: true, margin: "-80px" });
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  // The single source of truth for ring rotation, in degrees.
  const angle = useMotionValue(0);
  const draggingRef   = useRef(false);
  const velocityRef    = useRef(0);
  const snapTargetRef  = useRef(null);

  /* Fetch */
  useEffect(() => {
    axios.get("/api/public/trainers")
      .then(({ data }) => setTrainers(Array.isArray(data) && data.length > 0 ? data : FALLBACK))
      .catch(() => setTrainers(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  /* Responsive card size / perspective */
  useEffect(() => {
    const onResize = () => setDims(getDims());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* Build the ring: pad small lists so the carousel never looks sparse */
  const base    = trainers.length > 0 ? trainers : FALLBACK;
  const minimum = 7;
  const ring    = base.length >= minimum
    ? base
    : Array.from({ length: Math.ceil(minimum / base.length) }, () => base).flat();

  const step = 360 / ring.length;
  const minRadius = (dims.cardW / 2) / Math.tan((step / 2) * (Math.PI / 180));
  const radius = Math.min(Math.max(minRadius * 1.3, dims.cardW * 0.95), 580);
  const stageHeight = dims.cardH + 170;

  /* One animation loop drives auto-rotate, momentum decay, and "snap to front" */
  useAnimationFrame((_, delta) => {
    const dt = delta / 1000;
    if (draggingRef.current) return;

    if (snapTargetRef.current !== null) {
      const current = angle.get();
      const diff = snapTargetRef.current - current;
      if (Math.abs(diff) < 0.05) {
        angle.set(snapTargetRef.current);
        snapTargetRef.current = null;
      } else {
        angle.set(current + diff * Math.min(1, dt * SNAP_EASE));
      }
      return;
    }

    if (Math.abs(velocityRef.current) > MIN_VELOCITY) {
      angle.set(angle.get() + velocityRef.current * dt);
      velocityRef.current *= Math.pow(FRICTION, dt * 60);
      return;
    }

    if (!hovered) {
      angle.set(angle.get() + DIRECTION * AUTO_SPEED * dt);
    }
  });

  const handlePanStart = useCallback(() => {
    draggingRef.current = true;
    snapTargetRef.current = null;
    velocityRef.current = 0;
    setInteracted(true);
  }, []);

  const handlePan = useCallback((_, info) => {
    angle.set(angle.get() + info.delta.x * DRAG_SENSITIVITY);
  }, [angle]);

  const handlePanEnd = useCallback((_, info) => {
    draggingRef.current = false;
    velocityRef.current = info.velocity.x * DRAG_SENSITIVITY;
  }, []);

  // Click a card to bring it to the front of the ring.
  const handleSelect = useCallback((baseAngle) => {
    const current     = angle.get();
    const desiredMod   = ((-baseAngle % 360) + 360) % 360;
    const currentMod   = ((current % 360) + 360) % 360;
    let diff = desiredMod - currentMod;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    snapTargetRef.current = current + diff;
    velocityRef.current = 0;
    setInteracted(true);
  }, [angle]);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-32 overflow-hidden bg-white"
    >
      {/* Ambient */}
      <motion.div style={{ y: bgY }}
        className="absolute left-1/3 top-1/2 w-[500px] h-[500px] rounded-full bg-rose-500/[0.03] blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <motion.div
          ref={headRef}
          variants={stagger}
          initial="hidden"
          animate={headInView ? "show" : "hidden"}
          className="text-center max-w-3xl mx-auto mb-16 px-4 md:px-8 flex flex-col items-center"
        >
          <motion.span variants={fadeItem}
            className="px-3 py-1.5 rounded-full text-xs font-bold tracking-[0.2em] uppercase text-[#fc362d] bg-[#fc362d]/10 border border-[#fc362d]/20 mb-6">
            Our Trainers
          </motion.span>
          <motion.h2 variants={fadeItem}
            className="text-3xl md:text-5xl font-extrabold text-[#0c0407] tracking-tight leading-tight mb-6">
            Meet Our Expert Instructors
          </motion.h2>
          <motion.p variants={fadeItem}
            className="text-[#636363] text-base md:text-lg leading-relaxed font-medium">
            Learn from industry professionals with years of real-world experience
            in cutting-edge technologies.
          </motion.p>
        </motion.div>

        {/* ── 3D Curved Ring Carousel ── */}
        {loading ? (
          <div className="flex gap-4 md:gap-5 px-4 overflow-hidden py-4 justify-center">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}
                className="flex-shrink-0 w-52 h-72 sm:w-64 sm:h-80 md:w-72 md:h-96 rounded-3xl bg-[#f1f5f9] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="relative" style={{ height: stageHeight }}>
           
           
            <motion.div
              onPanStart={handlePanStart}
              onPan={handlePan}
              onPanEnd={handlePanEnd}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              style={{
                perspective: dims.perspective,
                transformStyle: "preserve-3d",
                touchAction: "pan-y",
              }}
              className="absolute inset-0 flex items-center justify-center select-none cursor-grab active:cursor-grabbing"
            >
              {ring.map((trainer, i) => (
                <RingCard
                  key={`${trainer.id}-${i}`}
                  angle={angle}
                  baseAngle={i * step}
                  radius={radius}
                  cardW={dims.cardW}
                  cardH={dims.cardH}
                  trainer={trainer}
                  idx={i}
                  onSelect={handleSelect}
                />
              ))}
            </motion.div>

           
          </div>
        )}
      </div>
    </section>
  );
};

export default Projects;
