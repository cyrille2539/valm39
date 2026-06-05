'use client';

import { motion } from "framer-motion";
import Image from "next/image";

const AnimatedLogo = () => {
  return (
    <motion.div
      className="select-none cursor-pointer"
      style={{ height: 72, overflow: "visible", display: "flex", alignItems: "flex-start" }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.1 }}
    >
      <Image
        src="/assets/logo-valm392.png"
        alt="ValM39 — Artisan rénovation intérieure dans le Jura"
        width={144}
        height={144}
        style={{ width: 144, height: 144, objectFit: "contain", flexShrink: 0 }}
        priority
      />
    </motion.div>
  );
};

export default AnimatedLogo;
