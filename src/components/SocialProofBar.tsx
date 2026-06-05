'use client';

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  stars: number;
}

const fallbackTestimonials: Testimonial[] = [
  { id: "1", name: "Marie L.",    role: "Propriétaire Airbnb — Lons-le-Saunier", text: "Notre taux de réservation a bondi de 35 % après la rénovation. Un travail remarquable, les voyageurs en parlent dans leurs avis.", stars: 5 },
  { id: "2", name: "Thierry M.",  role: "Investisseur immobilier — Dole",         text: "Devis tenu à l'euro près, chantier livré en avance. Je recommande ValM39 à tous mes associés.", stars: 5 },
  { id: "3", name: "Sophie R.",   role: "Particulière — Champagnole",             text: "La cuisine posée est exactement ce que je rêvais. Finition impeccable, artisan à l'écoute.", stars: 5 },
  { id: "4", name: "Agence Immo Jura", role: "Agence immobilière — Lons-le-Saunier", text: "Nos biens rénovés par ValM39 se vendent 15 % plus vite. Un partenaire de confiance.", stars: 5 },
];

function TestimonialCard({ t, index }: { t: Testimonial; index: number }) {
  const delay = `${(index % 4) * 1.5}s`;
  return (
    <div
      className="relative shrink-0 flex flex-col gap-4 rounded-2xl p-5 select-none overflow-hidden"
      style={{
        width: 292,
        background: "rgba(255, 251, 244, 0.52)",
        backdropFilter: "blur(18px) saturate(1.6)",
        WebkitBackdropFilter: "blur(18px) saturate(1.6)",
        border: "1px solid rgba(255,255,255,0.62)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.92), inset 1px 0 0 rgba(255,255,255,0.6), 0 2px 12px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.10)",
      }}
    >
      {/* Sweep shimmer */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.52) 50%, transparent 62%)",
          animation: `card-shimmer 7s ease-in-out ${delay} infinite`,
          pointerEvents: "none",
        }}
      />
      {/* Auteur */}
      <div>
        <p className="text-sm font-semibold text-charcoal-soft leading-tight">{t.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{t.role}</p>
      </div>

      {/* Citation */}
      <p className="text-sm text-foreground/75 leading-relaxed flex-1">
        « {t.text} »
      </p>

      {/* Étoiles */}
      <div className="flex gap-1">
        {Array.from({ length: t.stars }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
        ))}
      </div>
    </div>
  );
}

const SocialProofBar = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(fallbackTestimonials);

  useEffect(() => {
    supabase
      .from("testimonials")
      .select("id, name, role, text, stars")
      .order("sort_order")
      .then(({ data }) => {
        if (data && data.length > 0) setTestimonials(data);
      });
  }, []);

  const items = [...testimonials, ...testimonials];

  return (
    <section
      className="py-8 border-b border-border overflow-hidden marquee-viewport"
      style={{
        background: "linear-gradient(120deg, hsl(38,32%,90%) 0%, hsl(44,40%,94%) 40%, hsl(32,26%,88%) 100%)",
      }}
    >
      <div className="flex gap-6 marquee-track">
        {items.map((t, i) => (
          <TestimonialCard key={i} t={t} index={i} />
        ))}
      </div>
    </section>
  );
};

export default SocialProofBar;
