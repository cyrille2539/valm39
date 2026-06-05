'use client';

import { useRef, useState, useEffect, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";

interface ShinyButtonProps {
  children: ReactNode;
  className?: string;
  size?: "sm" | "lg";
  variant?: "default" | "light" | "outline";
  href?: string;
  to?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  magnetic?: boolean;
  fullWidth?: boolean;
  lightBg?: boolean;
  disabled?: boolean;
}

export function ShinyButton({
  children,
  className = "",
  size = "lg",
  variant = "default",
  href,
  to,
  type = "button",
  onClick,
  magnetic = true,
  fullWidth = false,
  lightBg = false,
  disabled = false,
}: ShinyButtonProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [shimmer, setShimmer] = useState(false);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 180, damping: 18, mass: 0.4 });
  const sy = useSpring(my, { stiffness: 180, damping: 18, mass: 0.4 });

  useEffect(() => {
    if (!magnetic) return;
    const onMove = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 110) {
        mx.set(dx * 0.28);
        my.set(dy * 0.28);
      } else {
        mx.set(0);
        my.set(0);
      }
    };
    document.addEventListener("mousemove", onMove);
    return () => document.removeEventListener("mousemove", onMove);
  }, [magnetic, mx, my]);

  const handleEnter = () => {
    setHovered(true);
    setShimmer(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setShimmer(true)));
  };
  const handleLeave = () => { setHovered(false); setShimmer(false); };

  // Couleurs selon la variante — lightBg compense le contraste sur fond clair
  const borderColor =
    variant === "light"   ? (lightBg ? "hsl(85,30%,58%)" : "hsl(85,28%,52%)")
    : variant === "outline" ? "hsl(85,35%,42%)"
    :                         "hsl(85,35%,38%)";

  const faceBg =
    variant === "light"
      ? lightBg
        ? hovered ? "hsl(85,28%,54%)" : "hsl(85,28%,48%)"
        : hovered ? "hsl(85,25%,46%)" : "hsl(85,25%,40%)"
      : variant === "outline"
      ? hovered ? "rgba(255,255,255,0.06)" : "transparent"
      : hovered ? "hsl(85,32%,27%)" : "hsl(85,28%,21%)";

  const glowColor =
    variant === "light" ? "hsl(85 25% 50% / 0.45)" : "hsl(85 35% 38% / 0.40)";

  const sizeClass = size === "lg" ? "px-8 py-3 text-base" : "px-5 py-2.5 text-sm";
  const textColor = variant === "outline" ? "hsl(var(--primary))" : "white";

  const visual = (
    /* Glow wrapper — pas d'overflow pour ne pas clipper le box-shadow */
    <div
      style={{
        borderRadius: "9999px",
        boxShadow: hovered
          ? `0 0 22px ${glowColor}, 0 4px 18px rgba(0,0,0,0.26)`
          : "0 2px 10px rgba(0,0,0,0.20)",
        transition: "box-shadow 0.35s ease",
        display: fullWidth ? "block" : "inline-block",
      }}
    >
      {/* Bordure + overflow-hidden pour clipper le sweep */}
      <div
        className="relative rounded-full overflow-hidden"
        style={{ padding: "1.5px", background: borderColor }}
      >
        {/* Face du bouton */}
        <div
          className={`relative rounded-full flex items-center justify-center font-semibold ${sizeClass} ${className} ${fullWidth ? "w-full" : ""}`}
          style={{
            background: faceBg,
            color: textColor,
            transition: "background 0.3s ease",
          }}
        >
          {/* Ligne de brillance supérieure */}
          <span
            className="absolute top-0 left-[12%] right-[12%] h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.38), transparent)" }}
          />
          <span className="relative z-10 flex items-center gap-2">{children}</span>
        </div>

        {/* Sweep blanc — au-dessus de la face, clipé par overflow-hidden */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent 15%, rgba(255,255,255,0.55) 50%, transparent 85%)",
          }}
          initial={{ x: "-115%" }}
          animate={{ x: shimmer ? "115%" : "-115%" }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
        />
      </div>
    </div>
  );

  const eventProps = { onMouseEnter: handleEnter, onMouseLeave: handleLeave };
  let el: ReactNode;
  if (to) {
    el = <Link href={to} {...eventProps} className={fullWidth ? "block" : "inline-block"}>{visual}</Link>;
  } else if (href) {
    el = <a href={href} {...eventProps} className={fullWidth ? "block" : "inline-block"}>{visual}</a>;
  } else {
    el = (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        {...eventProps}
        className={fullWidth ? "w-full block" : "inline-block"}
      >
        {visual}
      </button>
    );
  }

  return (
    <motion.div
      ref={wrapperRef}
      style={{
        x: magnetic ? sx : 0,
        y: magnetic ? sy : 0,
        display: fullWidth ? "block" : "inline-block",
      }}
    >
      {el}
    </motion.div>
  );
}
