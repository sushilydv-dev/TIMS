import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

import studentDashboardOc from "../../assets/student _dashboard_oc.png";
import studentDashboardMobile from "../../assets/student_dahboard_mobile.png";
import certificate from"../../assets/certificate.png"
import placement  from "../../assets/placement.jpg"

const sectionHeader = {
  eyebrow: "Student Journey",
  title: "Track, Certify, and Get Placed",
  description:
    "Follow a clear learning path from real-time progress insights to verified certifications and direct placement opportunities.",
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

const projects = [
  {
    num: 1,
    title: "Track Your Progress",
    description:
      "Monitor your learning journey with real-time performance metrics, milestone assessments, and detailed analytics designed to keep your growth on schedule.",
    src: studentDashboardOc,
    mobileSrc: studentDashboardMobile,
    imageScaleRange: [1.27, 1.5],
    
  },
  {
    num: 2,
    title: "Earn Certifications",
    description:
      "Access curated professional lecture notes, technical cheat sheets, and comprehensive study materials directly provided by your industry mentors to reinforce live training sessions",
    src: certificate,
    imageScaleRange: [1, 1],
    link: certificate,
  },
  {
    num: 3,
    title: "Secure Direct Placement",
    description:
      "TComplete your training milestones and clear your core assessments to unlock direct hiring opportunities within our team or get fast-tracked into premium roles with our enterprise partners.",
    src: placement,
    imageScaleRange: [1.25, 1],

  },
];

const ParallaxCard = ({
  i,
  title,num,
  description,
  src,
  mobileSrc,
  imageScaleRange,
  color,
  progress,
  targetScale,
  total,
}) => {
  const entryStart = i === 0 ? 0 : (i - 0.85) / total;
  const entryEnd = i === 0 ? 0 : i / total;
  const scaleStart = i / total;
  const y = useTransform(
    progress,
    [entryStart, entryEnd],
    i === 0 ? ["0vh", "0vh"] : ["115vh", "0vh"],
  );
  const imageScale = useTransform(
    progress,
    [entryStart, entryEnd],
    imageScaleRange,
  );
  const scale = useTransform(progress, [scaleStart, 1], [1, targetScale]);

  return (
    <motion.div
      className="absolute inset-0 flex h-screen items-center justify-center font-[ParallaxBody] will-change-transform "
      style={{ y, zIndex: i + 1 }}
    >
      <motion.div
        style={{ scale, top: `calc(-5vh + ${i * 25}px)` }}
        className="relative flex h-[600px] w-[min(1200px,calc(100vw-32px))] origin-top flex-col rounded-[25px] p-[50px] max-md:h-auto max-md:min-h-[620px] max-md:p-7 transition-all duration-300 ease-[0.25,1,0.5,1] cursor-pointer



     group bg-white border border-black/[0.06] hover:border-[#fc362d]/20 rounded-3xl p-6 md:p-7 flex flex-col items-start shadow-sm hover:shadow-md 

   
    "
      >
        <p className="m-0 text-center border border-gray-300 w-[4rem] h-[2rem] text-[28px] ont-bold text-[#140d0f] border border-black/12 hover:border-[#fc362d] hover:bg-[#fc362d]/5 transition-all duration-300 shadow-sm rounded-full flex items-center justify-center py-5">
          {num}
        </p>
        <div className="mt-[50px] flex h-full gap-[50px] max-md:mt-8 max-md:flex-col max-md:gap-7">
          <div className="relative top-[10%] w-[40%] text-black max-md:top-0 max-md:w-full">
            <h3 className="mb-4 text-3xl font-semibold leading-tight text-[#140d0f] max-md:text-2xl">
              {title}
            </h3>
            <p className="text-base leading-[1.35]">
              {description}
            </p>
          </div>

          <div className="relative h-full w-[60%] overflow-hidden rounded-[25px]  max-md:w-full">
            <motion.div className="relative h-full w-full" style={{ scale: imageScale }}>
              <img
                src={src}
                alt={title}
                className={`block h-full w-full ${
                  mobileSrc ? "object-contain" : "object-cover"
                }`}
              />
              {mobileSrc && (
                <img
                  src={mobileSrc}
                  alt={`${title} mobile view`}
                  className="absolute bottom-9 right-[-3rem] w-[72%] min-w-[260px] max-w-[480px] object-contain max-md:bottom-3 max-md:right-3 max-md:w-[62%] max-md:min-w-[160px] max-md:max-w-[260px]"
                />
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const CardsParallax = () => {
  const container = useRef(null);
  const headRef = useRef(null);
  const headInView = useInView(headRef, { once: true, margin: "-80px" });
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  return (
    <>
      <section className="relative py-24 md:py-32 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            ref={headRef}
            variants={stagger}
            initial="hidden"
            animate={headInView ? "show" : "hidden"}
            className="text-center max-w-3xl mx-auto px-4 md:px-8 flex flex-col items-center"
          >
            <motion.span
              variants={fadeItem}
              className="px-3 py-1.5 rounded-full text-xs font-bold tracking-[0.2em] uppercase text-[#fc362d] bg-[#fc362d]/10 border border-[#fc362d]/20 mb-6"
            >
              {sectionHeader.eyebrow}
            </motion.span>
            <motion.h2
              variants={fadeItem}
              className="text-3xl md:text-5xl font-extrabold text-[#0c0407] tracking-tight leading-tight mb-6"
            >
              {sectionHeader.title}
            </motion.h2>
            <motion.p
              variants={fadeItem}
              className="text-[#636363] text-base md:text-lg leading-relaxed font-medium"
            >
              {sectionHeader.description}
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section
        ref={container}
        className="relative mt-0 bg-white"
        style={{ height: `${(projects.length + 1) * 100}vh` }}
      >
        <div className="sticky top-0 h-screen overflow-hidden">
          {projects.map((project, i) => {
            const targetScale = 1 - (projects.length - i) * 0.05;

            return (
              <ParallaxCard
                key={project.title}
                i={i}
                {...project}
                progress={scrollYProgress}
                targetScale={targetScale}
                total={projects.length}
              />
            );
          })}
        </div>
      </section>
    </>
  );
};
