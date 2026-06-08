'use client';

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface HorizontalScrollCardsProps {
  eyebrow: string;
  title: string;
  items: string[];
  bg?: string;
}

export function HorizontalScrollCards({
  eyebrow,
  title,
  items,
  bg = "bg-card",
}: HorizontalScrollCardsProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Cartes plus larges sur mobile pour éviter le texte trop wrappé
  const cardVw  = isMobile ? 85 : 60;
  const offsetVw = (100 - cardVw) / 2;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(
    scrollYProgress,
    [0, 1],
    [`${offsetVw}vw`, `${offsetVw - (items.length - 1) * cardVw}vw`]
  );

  return (
    <section
      ref={sectionRef}
      className={bg}
      style={{ height: `${items.length * 100}vh` }}
    >
      {/* pb-20 = espace pour le footer fixe desktop / bottom nav mobile */}
      <div className="sticky top-0 h-screen flex flex-col overflow-hidden pb-20">

        {/* En-tête */}
        <div className="pt-20 sm:pt-24 px-6 sm:px-16 pb-4 sm:pb-6 shrink-0 text-center">
          <p className="text-primary font-display italic text-4xl sm:text-5xl mb-2">{eyebrow}</p>
          <h2 className="font-display text-2xl sm:text-3xl sm:text-4xl font-bold text-charcoal-soft">{title}</h2>
        </div>

        {/* Piste — centrée verticalement dans l'espace restant */}
        <div className="flex-1 overflow-hidden flex items-center">
          <motion.div
            style={{ x, width: `${items.length * cardVw}vw` }}
            className="flex"
          >
            {items.map((text, i) => (
              <div
                key={i}
                style={{ width: `${cardVw}vw`, flexShrink: 0 }}
                className={`flex flex-col justify-center px-6 sm:px-16 py-8 sm:py-10 ${i > 0 ? "border-l border-border" : ""}`}
              >
                <span
                  className="font-display font-bold text-primary/[0.09] select-none leading-none block mb-3 sm:mb-4"
                  style={{ fontSize: "clamp(3rem, 8vw, 8rem)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p
                  className="font-display text-xl sm:text-2xl lg:text-4xl font-bold text-charcoal-soft leading-snug whitespace-pre-line"
                  style={{ maxWidth: `${cardVw - 10}vw` }}
                >
                  {text}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Barre de progression */}
        <div className="px-6 sm:px-16 pb-2 shrink-0 w-48 sm:w-56">
          <div className="h-px bg-border relative overflow-hidden rounded-full">
            <motion.div
              className="absolute inset-y-0 left-0 bg-primary rounded-full"
              style={{ scaleX: scrollYProgress, originX: 0, height: "1px" }}
            />
          </div>
        </div>

      </div>
    </section>
  );
}
