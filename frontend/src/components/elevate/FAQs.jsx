import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { INSTITUTE_NAME } from "../../constants";

const FAQ_ITEMS = [
  {
    num: "01",
    question: `What domains does ${INSTITUTE_NAME} specialise in?`,
    answer: `${INSTITUTE_NAME} offers programs in Full-Stack Web Development, UI/UX Design, Cloud Infrastructure & DevOps, AI & Machine Learning, Business Management, and Cybersecurity — each co-designed with industry practitioners.`,
  },
  {
    num: "02",
    question: "How does the project assignment and evaluation work?",
    answer: `Trainees are assigned structured milestones with clear deliverables. All submissions are pushed via code repositories (GitHub) and evaluated directly within our ${INSTITUTE_NAME} portal dashboard by assigned mentors.`,
  },
  {
    num: "03",
    question: "Will I receive a formal completion certificate?",
    answer: "Yes. Once all coursework milestones, project deliverables, and assessment requirements are cleared, a verified digital certificate is generated and available for download and LinkedIn sharing.",
  },
  {
    num: "04",
    question: "Is placement support included in all programs?",
    answer: `Yes — every ${INSTITUTE_NAME} program includes dedicated placement support: resume reviews, mock interviews, referrals to our 120+ industry partner network, and continued alumni network access post-graduation.`,
  },
  {
    num: "05",
    question: "Can I enroll if I'm a complete beginner?",
    answer: "Absolutely. Many programs are designed for beginners with zero prior experience. Our structured curriculum takes you from foundations to production-ready skills progressively, with mentor support at each stage.",
  },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const rowItem = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export const FAQs = () => {
  const [openIdx, setOpenIdx] = useState(null);
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section className="relative py-24 md:py-32 px-4 md:px-8 lg:px-16 overflow-hidden bg-[#fafafa]">
      <div className="absolute right-0 top-1/3 w-[300px] h-[300px] rounded-full bg-rose-500/[0.025] blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto flex flex-col items-center">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-3 py-1.5 rounded-full text-xs font-bold tracking-[0.2em] uppercase text-[#fc362d] bg-[#fc362d]/10 border border-[#fc362d]/20 mb-6">
            FAQs
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#0c0407] tracking-tight leading-tight">
            Frequently asked questions
          </h2>
        </motion.div>

        {/* Accordion */}
        <motion.div
          ref={sectionRef}
          variants={stagger}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="w-full flex flex-col gap-3"
        >
          {FAQ_ITEMS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <motion.div
                key={faq.num}
                variants={rowItem}
                className="bg-white border border-black/[0.06] hover:border-black/[0.10] rounded-2xl md:rounded-3xl overflow-hidden transition-colors duration-250 shadow-sm"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between px-6 md:px-8 py-5 md:py-6 text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-4 pr-4 min-w-0">
                    <span className="text-xs font-black text-[#fc362d] font-mono shrink-0 tabular-nums">
                      {faq.num}
                    </span>
                    <span className="text-sm md:text-base lg:text-[1.05rem] font-bold text-[#0c0407] group-hover:text-black leading-snug">
                      {faq.question}
                    </span>
                  </div>
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all duration-250 ${isOpen ? "border-[#fc362d]/30 bg-[#fc362d]/5 text-[#fc362d]" : "border-black/[0.08] text-black/50 group-hover:border-[#fc362d]/25 group-hover:text-[#fc362d]"}`}>
                    {isOpen
                      ? <Minus className="w-3.5 h-3.5" />
                      : <Plus  className="w-3.5 h-3.5" />
                    }
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="px-6 md:px-8 pb-6 pt-0 border-t border-black/[0.05]">
                        <p className="text-[#636363] text-sm md:text-base leading-relaxed pl-8 font-medium pt-4">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
};
