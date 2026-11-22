"use client";

import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  IdCardIllustration,
  QuestionBubbleIllustration,
  HandoverTicketIllustration,
} from "@/components/illustrations/Illustrations";

const STEPS = [
  {
    number: "01",
    title: "1. Verify once",
    description:
      "Upload a photo of your college ID. An admin checks it by hand, then you can post and message.",
    renderIllustration: () => (
      <IdCardIllustration size={72} className="w-14 sm:w-16 md:w-14 lg:w-[72px] h-auto" />
    ),
  },
  {
    number: "02",
    title: "2. Answer a private question",
    description:
      "Finders keep one detail secret, like what is inside a bag. Owners answer it without seeing it first.",
    renderIllustration: () => (
      <QuestionBubbleIllustration size={74} className="w-14 sm:w-16 md:w-14 lg:w-[74px] h-auto" />
    ),
  },
  {
    number: "03",
    title: "3. Meet and hand over",
    description:
      "Once approved you get a 6-digit code. Meet at the Security Office or Library desk and share it to close the return.",
    renderIllustration: () => (
      <HandoverTicketIllustration code="482917" size={74} className="w-14 sm:w-16 md:w-14 lg:w-[74px] h-auto" />
    ),
  },
];

export function StepsSlider() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    if (clientWidth === 0) return;
    const index = Math.round(scrollLeft / (clientWidth * 0.85));
    setActiveIndex(Math.min(Math.max(index, 0), STEPS.length - 1));
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const cards = scrollRef.current.querySelectorAll<HTMLElement>("[data-step-card]");
    if (cards[index]) {
      cards[index].scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
      setActiveIndex(index);
    }
  };

  const handlePrev = () => {
    const nextIdx = Math.max(0, activeIndex - 1);
    scrollToIndex(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = Math.min(STEPS.length - 1, activeIndex + 1);
    scrollToIndex(nextIdx);
  };

  return (
    <div className="space-y-4">
      {/* Mobile Swipe Hint */}
      <div className="flex md:hidden items-center justify-between text-xs text-ink-soft">
        <span className="font-hand text-base text-coral font-semibold">
          swipe cards to step through
        </span>
        <span className="font-mono font-bold text-ink">
          {activeIndex + 1} of {STEPS.length}
        </span>
      </div>

      {/* Cards Slider (Mobile: Horizontal Snap Slide, Desktop & Tablet: Flex Row with In-Flow Connector Arrows) */}
      <div
        ref={scrollRef}
        className="flex md:flex-row md:items-stretch md:justify-between gap-4 sm:gap-5 md:gap-2 lg:gap-4 xl:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory scroll-smooth pb-3 md:pb-0 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {STEPS.map((step, idx) => (
          <React.Fragment key={idx}>
            {/* Step Card Column */}
            <div
              data-step-card
              className="w-[82vw] max-w-[310px] sm:max-w-[340px] md:max-w-none md:w-0 md:flex-1 shrink-0 snap-center md:snap-align-none flex flex-col"
            >
              <div
                className="w-full h-full bg-surface border-2.5 border-ink rounded-card p-5 sm:p-5 md:p-3.5 lg:p-6 shadow-hard-card flex flex-col justify-between gap-3.5 sm:gap-4 lg:gap-6 transition-transform relative overflow-hidden bg-cover bg-center"
                style={{ backgroundImage: "url('/images/paper-bg.webp')" }}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center justify-start h-14 sm:h-16 lg:h-20 shrink-0">
                    {step.renderIllustration()}
                  </div>
                  <span className="font-hand text-base sm:text-lg md:text-[15px] lg:text-xl font-bold text-ink/40 whitespace-nowrap shrink-0">
                    step {step.number}
                  </span>
                </div>

                <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
                  <h3 className="font-serif text-base sm:text-lg md:text-[15px] lg:text-2xl font-bold text-ink leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm md:text-[13px] lg:text-base text-ink-soft leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>

            {/* In-Flow Connector Arrow between cards on Tablet & Desktop */}
            {idx < STEPS.length - 1 && (
              <div
                className="hidden md:flex shrink-0 items-center justify-center self-center px-0.5 lg:px-1.5 z-10 pointer-events-none select-none"
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 44 24"
                  className="w-5 h-3 md:w-5 md:h-3 lg:w-10 lg:h-6 filter drop-shadow-[1.5px_1.5px_0_#231F20] lg:drop-shadow-[2px_2px_0_#231F20] transition-all"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M 2 12 C 9 10, 18 10, 26 8 L 24 3 L 41 12 L 24 21 L 26 16 C 18 14, 9 14, 2 12 Z"
                    fill="#F2B84B"
                    stroke="#231F20"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                  <line
                    x1="9"
                    y1="10"
                    x2="13"
                    y2="15"
                    stroke="#231F20"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <line
                    x1="17"
                    y1="9"
                    x2="21"
                    y2="15"
                    stroke="#231F20"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Mobile Slider Navigation Bar */}
      <div className="flex md:hidden items-center justify-between pt-2">
        {/* Step Indicator Dots */}
        <div className="flex items-center gap-2">
          {STEPS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToIndex(idx)}
              className={`h-3 rounded-full border-2 border-ink transition-all ${
                activeIndex === idx
                  ? "w-8 bg-yellow shadow-hard-btn"
                  : "w-3 bg-surface hover:bg-paper"
              }`}
              aria-label={`Go to step ${idx + 1}`}
            />
          ))}
        </div>

        {/* Previous and Next Slide Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={activeIndex === 0}
            className={`w-10 h-10 rounded-full border-2 border-ink flex items-center justify-center transition shadow-hard-btn active:translate-x-[1px] active:translate-y-[1px] ${
              activeIndex === 0
                ? "bg-paper text-ink/30 cursor-not-allowed opacity-50"
                : "bg-surface text-ink hover:bg-yellow"
            }`}
            aria-label="Previous step"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <button
            onClick={handleNext}
            disabled={activeIndex === STEPS.length - 1}
            className={`w-10 h-10 rounded-full border-2 border-ink flex items-center justify-center transition shadow-hard-btn active:translate-x-[1px] active:translate-y-[1px] ${
              activeIndex === STEPS.length - 1
                ? "bg-paper text-ink/30 cursor-not-allowed opacity-50"
                : "bg-surface text-ink hover:bg-yellow"
            }`}
            aria-label="Next step"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}
