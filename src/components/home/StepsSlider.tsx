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
    renderIllustration: () => <IdCardIllustration size={84} />,
  },
  {
    number: "02",
    title: "2. Answer a private question",
    description:
      "Finders keep one detail secret, like what is inside a bag. Owners answer it without seeing it first.",
    renderIllustration: () => <QuestionBubbleIllustration size={84} />,
  },
  {
    number: "03",
    title: "3. Meet and hand over",
    description:
      "Once approved you get a 6-digit code. Meet at the Security Office or Library desk and share it to close the return.",
    renderIllustration: () => <HandoverTicketIllustration code="482917" size={106} />,
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
    const cards = scrollRef.current.children;
    if (cards[index]) {
      (cards[index] as HTMLElement).scrollIntoView({
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

      {/* Cards Slider (Mobile: Horizontal Snap Slide, Desktop: 3-Column Grid with Connector Arrows) */}
      <div
        ref={scrollRef}
        className="flex md:grid md:grid-cols-3 gap-5 sm:gap-6 md:gap-8 lg:gap-12 overflow-x-auto md:overflow-visible snap-x snap-mandatory scroll-smooth pb-3 md:pb-0 -mx-4 px-4 sm:-mx-[48px] sm:px-[48px] md:mx-0 md:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {STEPS.map((step, idx) => (
          <div
            key={idx}
            className="relative w-[82vw] max-w-[310px] sm:max-w-[340px] md:w-auto shrink-0 snap-center md:snap-align-none flex flex-col"
          >
            {/* Step Card */}
            <div
              className="w-full flex-1 bg-surface border-2.5 border-ink rounded-card p-6 sm:p-7 shadow-hard-card flex flex-col justify-between gap-6 transition-transform relative overflow-hidden bg-cover bg-center"
              style={{ backgroundImage: "url('/images/paper-bg.webp')" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-start h-20">
                  {step.renderIllustration()}
                </div>
                <span className="font-hand text-xl font-bold text-ink/40">
                  step {step.number}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-ink leading-snug">
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base text-ink-soft leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>

            {/* Desktop Connector Arrow between steps */}
            {idx < STEPS.length - 1 && (
              <div
                className="hidden md:flex absolute top-1/2 -translate-y-1/2 -right-4 lg:-right-6 translate-x-1/2 z-20 pointer-events-none items-center justify-center"
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 52 28"
                  className="w-10 h-6 lg:w-12 lg:h-7 filter drop-shadow-[2px_2px_0_#231F20]"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M 2 14 C 12 12, 26 12, 36 10 L 34 4 L 50 14 L 34 24 L 36 18 C 26 16, 12 16, 2 14 Z"
                    fill="#F2B84B"
                    stroke="#231F20"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                  {/* Hand-drawn texture hatches */}
                  <line
                    x1="12"
                    y1="12"
                    x2="16"
                    y2="17"
                    stroke="#231F20"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <line
                    x1="20"
                    y1="11"
                    x2="24"
                    y2="17"
                    stroke="#231F20"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <line
                    x1="28"
                    y1="11"
                    x2="32"
                    y2="16"
                    stroke="#231F20"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            )}
          </div>
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
