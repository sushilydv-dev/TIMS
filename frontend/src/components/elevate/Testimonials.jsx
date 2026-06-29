import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { INSTITUTE_NAME } from "../../constants";

const TESTIMONIALS = [
  {
    name: "Arjun Mehta",
    role: "Full-Stack Engineer · Hired at Razorpay",
    avatar: "https://framerusercontent.com/images/SGBVLdHSw2BsdL7hyXRyapVb8js.png",
    quote: `The ${INSTITUTE_NAME} training system changed how I approach software development. Clear milestones, precise repository feedback from mentors, and a real portfolio project that directly landed me my full-time role.`,
    rating: 5,
  },
  {
    name: "Sneha Kapoor",
    role: "UI/UX Designer · Placed at Zomato",
    avatar: "https://framerusercontent.com/images/Qim8xH67hjKAmd5sM3sdqrE.png",
    quote: `Learning to design production-grade user journeys at ${INSTITUTE_NAME} gave me exactly the tools I needed. The structured feedback loops and live project work made my portfolio stand out immediately.`,
    rating: 5,
  },
  {
    name: "Rohan Sharma",
    role: "Cloud Engineer · Working at Infosys",
    avatar: "https://framerusercontent.com/images/tAH3RUa9yvw33f6QnXubJ3aqQrE.png",
    quote: "The cloud deployment milestones pushed me to master serverless architecture, caching layers, and CI/CD pipelines under expert guidance. I felt genuinely job-ready on day one.",
    rating: 5,
  },
  {
    name: "Priya Nair",
    role: "DevOps Specialist · Placed at Wipro",
    avatar: "https://framerusercontent.com/images/nQ7ZlW3LUqX2WBlLbzTadqZ2uo.png",
    quote: `Having a centralised workspace where every repository push was evaluated gave me the discipline and the confidence to meet enterprise-level standards. ${INSTITUTE_NAME} genuinely prepared me.`,
    rating: 5,
  },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const cardItem = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

export const Testimonials = () => {
  const sectionRef = useRef(null);
  const headRef    = useRef(null);
  const gridRef    = useRef(null);

  const headInView = useInView(headRef, { once: true, margin: "-80px" });
  const gridInView = useInView(gridRef, { once: true, margin: "-60px" });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32 px-4 md:px-8 lg:px-16 overflow-hidden bg-white">
      <motion.div
        style={{ y: bgY }}
        className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[500px] h-[500px] rounded-full bg-indigo-500/[0.025] blur-[160px] pointer-events-none"
      />

      <div className="max-w-7xl mx-auto flex flex-col items-center">

        {/* Header */}
        <motion.div
          ref={headRef}
          variants={stagger}
          initial="hidden"
          animate={headInView ? "show" : "hidden"}
          className="text-center max-w-3xl mb-16 flex flex-col items-center"
        >
          <motion.span variants={cardItem} className="px-3 py-1.5 rounded-full text-xs font-bold tracking-[0.2em] uppercase text-[#fc362d] bg-[#fc362d]/10 border border-[#fc362d]/20 mb-6">
            Alumni Stories
          </motion.span>
          <motion.h2 variants={cardItem} className="text-3xl md:text-5xl font-extrabold text-[#0c0407] tracking-tight leading-tight mb-6">
            Voices of success
          </motion.h2>
          <motion.p variants={cardItem} className="text-[#636363] text-base md:text-lg leading-relaxed font-medium">
            Real graduates. Real placements. Read how {INSTITUTE_NAME} helped them break into their dream roles.
          </motion.p>
        </motion.div>

        {/* Grid */}
        <motion.div
          ref={gridRef}
          variants={stagger}
          initial="hidden"
          animate={gridInView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
        >
          {TESTIMONIALS.map((t) => (
            <motion.div
              key={t.name}
              variants={cardItem}
              className="relative group bg-white border border-black/[0.06] hover:border-[#fc362d]/15 rounded-3xl p-8 flex flex-col shadow-sm hover:shadow-lg transition-all duration-400 cursor-default overflow-hidden"
            >
              {/* Quote icon */}
              <Quote className="absolute top-6 right-6 w-8 h-8 text-[#fc362d]/8 group-hover:text-[#fc362d]/15 transition-colors duration-300" />

              {/* Stars */}
              <div className="flex gap-0.5 mb-5">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#fc362d] stroke-[#fc362d]" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-[#3a3b50] text-sm md:text-base leading-relaxed mb-7 flex-grow font-medium">
                "{t.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-5 border-t border-black/[0.05]">
                <div className="w-11 h-11 rounded-full overflow-hidden border border-black/[0.08] bg-[#f0eef4] shrink-0">
                  <img src={t.avatar} alt={t.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0c0407]">{t.name}</p>
                  <p className="text-xs text-[#94a3b8] font-semibold mt-0.5">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};
