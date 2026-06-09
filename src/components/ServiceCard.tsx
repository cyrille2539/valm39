'use client';

import { useRef, useLayoutEffect, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface ServiceCardProps {
  title: string;
  description: string;
  stat: string;
  gradient: string;
  accentColor: string;
  index: number;
  image?: string;
  isExpanded: boolean;
  isAnyHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  to?: string;
  ctaLabel?: string;
}

const ServiceCard = ({
  title,
  description,
  stat,
  gradient,
  accentColor,
  index,
  image,
  isExpanded,
  isAnyHovered,
  onMouseEnter,
  onMouseLeave,
  to,
  ctaLabel = "Demander un devis",
}: ServiceCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [goldenHeight, setGoldenHeight] = useState<number | null>(null);
  const [hoveredLocked, setHoveredLocked] = useState(false);

  // Mesure unique au montage : largeur × φ
  useLayoutEffect(() => {
    if (cardRef.current) {
      setGoldenHeight(Math.round(cardRef.current.offsetWidth * 1.618));
    }
  }, []);

  // Verrouille la hauteur au survol, attend la fin de la transition flex pour la relâcher
  useEffect(() => {
    if (isAnyHovered) {
      setHoveredLocked(true);
    } else {
      const timer = setTimeout(() => setHoveredLocked(false), 650);
      return () => clearTimeout(timer);
    }
  }, [isAnyHovered]);

  const sharedMotionProps = {
    initial: { opacity: 0, y: 40 } as const,
    whileInView: { opacity: 1, y: 0 } as const,
    viewport: { once: true, margin: "-60px" },
    transition: { delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    onMouseEnter,
    onMouseLeave,
    className: "group relative overflow-hidden rounded-2xl cursor-pointer block ring-1 ring-white/10",
    style: {
      ...(hoveredLocked && goldenHeight
        ? { height: `${goldenHeight}px` }
        : { aspectRatio: "1 / 1.618", alignSelf: "flex-start" }
      ),
      flex: isExpanded ? "3 1 0%" : "1 1 0%",
      transition: "flex 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
      minWidth: 0,
      backdropFilter: "blur(4px) saturate(1.1)",
      WebkitBackdropFilter: "blur(4px) saturate(1.1)",
      boxShadow: [
        "inset 0 1px 0 rgba(255,255,255,0.08)",
        "0 1px 0 rgba(0,0,0,0.46)", "0 2px 0 rgba(0,0,0,0.44)",
        "0 3px 0 rgba(0,0,0,0.42)", "0 4px 0 rgba(0,0,0,0.40)",
        "0 5px 0 rgba(0,0,0,0.38)", "0 6px 0 rgba(0,0,0,0.36)",
        "0 7px 0 rgba(0,0,0,0.33)", "0 8px 0 rgba(0,0,0,0.30)",
        "0 10px 0 rgba(0,0,0,0.27)", "0 12px 0 rgba(0,0,0,0.24)",
        "0 14px 0 rgba(0,0,0,0.21)", "0 16px 0 rgba(0,0,0,0.18)",
        "0 18px 0 rgba(0,0,0,0.15)", "0 20px 0 rgba(0,0,0,0.12)",
        "0 24px 0 rgba(0,0,0,0.09)", "0 28px 0 rgba(0,0,0,0.06)",
        "0 32px 0 rgba(0,0,0,0.04)", "0 36px 0 rgba(0,0,0,0.02)",
        "1px 0 0 rgba(0,0,0,0.27)", "2px 0 0 rgba(0,0,0,0.26)",
        "3px 0 0 rgba(0,0,0,0.24)", "4px 0 0 rgba(0,0,0,0.22)",
        "5px 0 0 rgba(0,0,0,0.20)", "6px 0 0 rgba(0,0,0,0.18)",
        "7px 0 0 rgba(0,0,0,0.16)", "8px 0 0 rgba(0,0,0,0.14)",
        "10px 0 0 rgba(0,0,0,0.11)", "12px 0 0 rgba(0,0,0,0.08)",
        "14px 0 0 rgba(0,0,0,0.05)", "16px 0 0 rgba(0,0,0,0.03)",
        "18px 0 0 rgba(0,0,0,0.02)", "20px 0 0 rgba(0,0,0,0.01)",
        "2px 2px 0 rgba(0,0,0,0.21)", "4px 4px 0 rgba(0,0,0,0.18)",
        "6px 6px 0 rgba(0,0,0,0.15)", "8px 8px 0 rgba(0,0,0,0.12)",
        "10px 10px 0 rgba(0,0,0,0.09)", "12px 12px 0 rgba(0,0,0,0.07)",
        "14px 14px 0 rgba(0,0,0,0.05)", "16px 16px 0 rgba(0,0,0,0.03)",
        "0 40px 40px rgba(0,0,0,0.35)",
        "0 60px 120px rgba(0,0,0,0.28)",
      ].join(", "),
    },
  };

  const inner = (
    <>
      {image ? (
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 1023px) 50vw, 20vw"
          style={{
            transform: isExpanded ? "scale(1.05)" : "scale(1)",
            transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: gradient,
            transform: isExpanded ? "scale(1.05)" : "scale(1)",
            transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      )}

      <div
        className="absolute inset-0 opacity-[0.12] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(240,232,218,0.20) 0%, rgba(175,150,115,0.20) 100%)" }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isExpanded
            ? "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.1) 100%)"
            : "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.2) 100%)",
          transition: "background 0.6s ease",
        }}
      />

      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: "linear-gradient(160deg, rgba(255,255,255,0.08) 0%, transparent 55%)",
          borderTop: "1px solid rgba(255,255,255,0.22)",
          borderLeft: "1px solid rgba(255,255,255,0.16)",
          borderBottom: "1px solid transparent",
          borderRight: "1px solid transparent",
        }}
      />

      <div className="absolute inset-0 flex flex-col justify-end p-7">
        <h3
          className="font-display font-bold text-white leading-tight"
          style={{
            fontSize: isExpanded ? "1.75rem" : "1.25rem",
            marginBottom: isExpanded ? "0.75rem" : "0.5rem",
            transition: "font-size 0.5s ease, margin-bottom 0.5s ease",
            whiteSpace: isExpanded ? "normal" : "nowrap",
            overflow: isExpanded ? "visible" : "hidden",
            textOverflow: isExpanded ? "clip" : "ellipsis",
          }}
        >
          {title}
        </h3>

        <div
          style={{
            maxHeight: isExpanded ? "120px" : "0px",
            opacity: isExpanded ? 1 : 0,
            overflow: "hidden",
            transition: "max-height 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease",
            marginBottom: isExpanded ? "1rem" : "0",
          }}
        >
          <p className="text-white/75 text-sm leading-relaxed">{description}</p>
        </div>

        <div
          className="flex items-center gap-2 text-sm font-medium"
          style={{
            color: accentColor,
            opacity: isExpanded ? 1 : 0,
            transform: isExpanded ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.4s ease 0.1s, transform 0.4s ease 0.1s",
          }}
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </>
  );

  if (to) {
    return (
      <Link href={to} className="block" style={{ flex: isExpanded ? "3 1 0%" : "1 1 0%", minWidth: 0 }}>
        <motion.div ref={cardRef} {...sharedMotionProps} style={{ ...sharedMotionProps.style, flex: undefined }}>
          {inner}
        </motion.div>
      </Link>
    );
  }

  return <motion.div ref={cardRef} {...{ ...sharedMotionProps, className: sharedMotionProps.className.replace("block", "") }}>{inner}</motion.div>;
};

export default ServiceCard;
