'use client';

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PhoneLink } from "@/components/PhoneLink";
import { ShinyButton } from "@/components/ui/shiny-button";
import { Layout } from "@/components/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { HorizontalScrollCards } from "@/components/HorizontalScrollCards";
import { ContactForm } from "@/components/ContactForm";
import { VerticalCarousel } from "@/components/VerticalCarousel";

const heroHome = "/assets/hero-investisseurs.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

export default function Investisseurs() {
  usePageMeta({
    title: "Rénovation pour investisseurs immobiliers — ValM39 Jura",
    description: "Maximisez le rendement de votre patrimoine immobilier dans le Jura (39). +10 à +20 % à la revente, loyers revalorisés. Devis transparent et gratuit. ValM39.",
    canonical: "https://www.valm39.fr/investisseurs",
    ogUrl: "https://www.valm39.fr/investisseurs",
  });

  return (
    <Layout>
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <motion.div className="absolute inset-0" initial={{ scale: 1.18 }} animate={{ scale: 1 }} transition={{ duration: 11, ease: [0.25, 0.46, 0.45, 0.94] }}>
          <img src={heroHome} alt="Rénovation pour investisseurs immobiliers" className="w-full h-full object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/60 to-transparent" />
        <motion.div className="absolute top-0 left-0 right-0 bg-charcoal z-10" initial={{ height: "50%" }} animate={{ height: 0 }} transition={{ delay: 0.1, duration: 0.9, ease: [0.76, 0, 0.24, 1] }} />
        <motion.div className="absolute bottom-0 left-0 right-0 bg-charcoal z-10" initial={{ height: "50%" }} animate={{ height: 0 }} transition={{ delay: 0.1, duration: 0.9, ease: [0.76, 0, 0.24, 1] }} />

        <div className="relative z-20 max-w-6xl mx-auto px-6 flex items-center min-h-screen">
          <div className="max-w-2xl">
            <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9, duration: 0.5 }} className="text-primary font-display italic text-lg mb-4">
              Pour les investisseurs immobiliers
            </motion.p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-2">
              {"Maximisez le rendement".split(" ").map((word, i) => (
                <span key={i} className="inline-block overflow-hidden mr-[0.25em]">
                  <motion.span className="inline-block" initial={{ y: "110%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.95 + i * 0.09, type: "spring", stiffness: 120, damping: 14 }}>{word}</motion.span>
                </span>
              ))}
            </h1>
            <div className="overflow-hidden mb-6">
              <motion.span className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold italic text-olive-light leading-tight inline-block" initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.4, type: "spring", stiffness: 90, damping: 14 }}>
                de votre patrimoine
              </motion.span>
            </div>
            <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6, duration: 0.6 }} className="text-lg sm:text-xl text-primary-foreground/80 mb-8 leading-relaxed">
              Une rénovation ciblée qui augmente la valeur locative et le prix de revente de vos biens<br />avec un ROI mesurable dès les premiers mois.
            </motion.p>
            <motion.div initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.75, type: "spring", stiffness: 200, damping: 20 }}>
              <ShinyButton href="#contact" size="lg" variant="light">Étudier mon projet <ArrowRight className="h-5 w-5" /></ShinyButton>
            </motion.div>
          </div>
        </div>
      </section>

      <HorizontalScrollCards
        eyebrow="Ce que vous vivez"
        title="Des freins à la rentabilité ?"
        bg="bg-card"
        items={[
          "Votre rendement locatif stagne\nmalgré un bon emplacement.",
          "Impossible de justifier un loyer plus élevé\navec des finitions vieillissantes.",
          "Les locataires de qualité passent\nau profit de biens mieux rénovés.",
          "Vous hésitez à investir dans la rénovation\nsans garantie de retour.",
        ]}
      />

      <VerticalCarousel
        eyebrow="Ce que nous vous apportons"
        title="Un investissement qui rapporte"
        bg="bg-background"
        items={[
          "+10 à +20 % sur la valeur du bien à la revente",
          "Loyers revalorisés grâce à des prestations haut de gamme",
          "Réduction du turnover locataire avec des finitions durables",
          "Travaux réalisés dans les délais pour une remise en location rapide",
          "Devis détaillé et transparent pour maîtriser votre budget",
          "Accompagnement de A à Z : pas de gestion de chantier pour vous",
        ]}
      />

      <section id="contact" className="py-20 sm:py-28 lg:pb-32 bg-charcoal">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="max-w-2xl mx-auto px-6 text-center">
          <motion.p variants={fadeUp} className="text-olive-light font-display italic text-5xl mb-3">Parlons de votre projet</motion.p>
          <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-6">Étudions ensemble votre investissement</motion.h2>
          <motion.p variants={fadeUp} className="text-primary-foreground/70 mb-10 leading-relaxed">
            Décrivez-nous votre bien et vos objectifs. Nous vous recontactons sous 24h<br />avec une estimation chiffrée du potentiel de valorisation.
          </motion.p>
          <ContactForm source="investisseurs" />
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 text-primary-foreground/50 text-sm">
            <span>Gratuit · Sans engagement · Réponse sous 24h</span>
            <span className="hidden sm:inline text-primary-foreground/20">|</span>
            <PhoneLink />
          </motion.div>
        </motion.div>
      </section>
    </Layout>
  );
}
