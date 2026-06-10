'use client';

import { useState } from "react";
import { ArrowRight, CheckCircle } from "lucide-react";
import { ShinyButton } from "@/components/ui/shiny-button";
import { supabase } from "@/integrations/supabase/client";

interface ContactFormProps {
  source: string;
  ctaLabel?: string;
}

export function ContactForm({
  source,
  ctaLabel = "Envoyer ma demande",
}: ContactFormProps) {
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [phone,   setPhone]   = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: dbError } = await supabase.from("contacts").insert({
      name:    name.trim()    || null,
      email:   email.trim(),
      phone:   phone.trim(),
      message: message.trim() || null,
      source,
    });

    setLoading(false);
    if (dbError) {
      setError("Une erreur est survenue. Réessayez dans un instant.");
    } else {
      setSuccess(true);
      fetch("/api/notify-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message, source }),
      }).catch(() => {});
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <CheckCircle className="h-10 w-10 text-primary" />
        <p className="text-primary-foreground font-display font-bold text-lg">Message reçu !</p>
        <p className="text-primary-foreground/60 text-sm">Nous vous recontactons sous 24h.</p>
      </div>
    );
  }

  const inputClass = "w-full rounded-full px-5 py-3 bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto mb-8">
      <input
        type="text"
        placeholder="Votre nom"
        value={name}
        onChange={e => setName(e.target.value)}
        className={inputClass}
      />
      <input
        type="email"
        placeholder="Votre email *"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        className={inputClass}
      />
      <input
        type="tel"
        placeholder="Votre téléphone *"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        required
        className={inputClass}
      />
      <textarea
        placeholder="Parlez nous de votre projet"
        value={message}
        onChange={e => setMessage(e.target.value)}
        rows={5}
        className="w-full rounded-2xl px-5 py-3 bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
      />
      {error && <p className="text-red-400 text-xs text-center">{error}</p>}
      <ShinyButton type="submit" size="lg" variant="light" fullWidth disabled={loading}>
        {loading ? "Envoi en cours…" : ctaLabel} <ArrowRight className="h-5 w-5" />
      </ShinyButton>
    </form>
  );
}
