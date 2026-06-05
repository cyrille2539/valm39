'use client';

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface HorizontalScrollCardsProps {
  eyebrow: string;
  title: string;
  items: string[];
  bg?: string;
}

const CARD_VW = 60;
const OFFSET_VW = (100 - CARD_VW) / 2; // centre la première card

export function HorizontalScrollCards({
  eyebrow,
  title,
  items,
  bg = "bg-card",
}: HorizontalScrollCardsProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(
    scrollYProgress,
    [0, 1],
    [`${OFFSET_VW}vw`, `${OFFSET_VW - (items.length - 1) * CARD_VW}vw`]
  );

  return (
    <section
      ref={sectionRef}
      className={bg}
      style={{ height: `${items.length * 100}vh` }}
    >
      {/* pb-20 = espace pour le footer fixe desktop */}
      <div className="sticky top-0 h-screen flex flex-col overflow-hidden pb-20">

        {/* En-tête */}
        <div className="pt-24 px-8 sm:px-16 pb-6 shrink-0 text-center">
          <p className="text-primary font-display italic text-5xl mb-2">{eyebrow}</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-charcoal-soft">{title}</h2>
        </div>

        {/* Piste — centrée verticalement dans l'espace restant */}
        <div className="flex-1 overflow-hidden flex items-center">
          <motion.div
            style={{ x, width: `${items.length * CARD_VW}vw` }}
            className="flex"
          >
            {items.map((text, i) => (
              <div
                key={i}
                style={{ width: `${CARD_VW}vw`, flexShrink: 0 }}
                className={`flex flex-col justify-center px-10 sm:px-16 py-10 ${i > 0 ? "border-l border-border" : ""}`}
              >
                <span
                  className="font-display font-bold text-primary/[0.09] select-none leading-none block mb-4"
                  style={{ fontSize: "clamp(4rem, 10vw, 8rem)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p
                  className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-charcoal-soft leading-snug whitespace-pre-line"
                  style={{ maxWidth: "55vw" }}
                >
                  {text}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Barre de progression */}
        <div className="px-8 sm:px-16 pb-2 shrink-0 flex items-center gap-4 w-56">
          <div className="flex-1 h-px bg-border relative overflow-hidden rounded-full">
            <motion.div
              className="absolute inset-y-0 left-0 bg-primary rounded-full"
              style={{ scaleX: scrollYProgress, originX: 0, height: "1px" }}
            />
          </div>
          <span className="font-body text-xs text-muted-foreground uppercase tracking-widest shrink-0">
            {items.length}
          </span>
        </div>

      </div>
    </section>
  );
}
