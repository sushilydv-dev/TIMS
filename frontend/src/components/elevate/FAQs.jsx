import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const FAQ_ITEMS = [
  {
    num: "01.",
    question: "What domains does TIMS specialize in?",
    answer: "We focus deeply on modern Full-Stack development technologies, intuitive design languages, and structured backend systems.",
  },
  {
    num: "02.",
    question: "How does the project assignment work?",
    answer: "Trainees are assigned structured milestones. All submissions are pushed directly via code repositories (like GitHub) and evaluated natively within our portal dashboard.",
  },
  {
    num: "03.",
    question: "Will I receive a formal completion certification?",
    answer: "Yes, once all coursework milestones, project deliverables, and operational requirements are fully cleared, a verified PDF certificate generates for download.",
  },
];

export const FAQs = () => {
  const [openIdx, setOpenIdx] = useState(null);

  const toggleItem = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="relative py-24 md:py-32 px-4 md:px-8 lg:px-16 overflow-hidden bg-white">
      {/* Background glow shadow */}
      <div className="absolute right-0 top-1/3 w-[300px] h-[300px] rounded-full bg-rose-500/[0.02] blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* Section Header */}
        <div className="text-center max-w-3xl mb-16 flex flex-col items-center">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="px-3 py-1.5 rounded-full text-xs font-bold tracking-[0.2em] uppercase text-[#fc362d] bg-[#fc362d]/10 border border-[#fc362d]/20 mb-6"
          >
            FAQS
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold text-[#0c0407] tracking-tight leading-tight"
          >
            Frequently Asked Questions
          </motion.h2>
        </div>

        {/* FAQs Accordion List */}
        <div className="w-full flex flex-col gap-4">
          {FAQ_ITEMS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="bg-[#fbfbfc] hover:bg-[#f7f7f7] border border-black/5 hover:border-black/10 rounded-2xl md:rounded-3xl overflow-hidden transition-all duration-300 shadow-sm shadow-black/[0.01]"
              >
                {/* Accordion Trigger Header */}
                <button
                  onClick={() => toggleItem(idx)}
                  className="w-full flex items-center justify-between p-6 md:p-8 text-left text-[#0c0407] select-none cursor-pointer group"
                >
                  <div className="flex items-center gap-4 pr-4">
                    {/* Index Number */}
                    <span className="text-sm md:text-lg font-bold text-[#fc362d] font-mono">
                      {faq.num}
                    </span>
                    {/* Question text */}
                    <span className="text-base md:text-lg lg:text-xl font-bold tracking-wide group-hover:text-black transition-colors duration-200">
                      {faq.question}
                    </span>
                  </div>

                  {/* Toggle Indicator Icon */}
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/[0.02] border border-black/10 flex items-center justify-center text-black/60 group-hover:text-[#fc362d] group-hover:border-[#fc362d]/30 transition-all duration-300 flex-shrink-0">
                    {isOpen ? (
                      <Minus className="w-4 h-4 transform rotate-180 transition-transform duration-300" />
                    ) : (
                      <Plus className="w-4 h-4 transform rotate-0 transition-transform duration-300" />
                    )}
                  </div>
                </button>

                {/* Animated Drawer Body */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                    >
                      <div className="px-6 md:px-8 pb-6 md:pb-8 pt-0 border-t border-black/[0.04]">
                        <p className="text-[#636363] text-sm md:text-base leading-relaxed pl-0 md:pl-10 font-medium">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
