'use client';

import { useState, useEffect, useRef } from "react";
import { Phone, X } from "lucide-react";

function isAvailable(): boolean {
  const now  = new Date();
  const day  = now.getDay();   // 0=dim, 1=lun … 5=ven, 6=sam
  const hour = now.getHours();
  return day >= 1 && day <= 5 && hour >= 9 && hour < 18;
}

export function PhoneLink() {
  const [open,      setOpen]      = useState(false);
  const [available, setAvailable] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAvailable(isAvailable());
    // Rafraîchit chaque minute au cas où l'heure change en cours de navigation
    const id = setInterval(() => setAvailable(isAvailable()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Ferme la popup si clic en dehors
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (available) {
    return (
      <a
        href="tel:+33786008992"
        className="flex items-center gap-2 hover:text-primary transition-colors"
      >
        <Phone className="h-4 w-4" /> Appelez-nous directement
      </a>
    );
  }

  return (
    <div className="relative" ref={popupRef}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 text-primary-foreground/30 cursor-pointer hover:text-primary-foreground/50 transition-colors"
      >
        <Phone className="h-4 w-4" /> Appelez-nous directement
      </button>

      {open && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-72 bg-card border border-border rounded-2xl shadow-2xl p-5 z-50 text-left">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="text-2xl mb-2">🛌</p>
          <p className="font-display font-bold text-foreground text-sm mb-2">
            Mario est en pleine recharge !
          </p>
          <p className="text-muted-foreground text-xs leading-relaxed mb-3">
            Mario a posé ses outils pour la soirée : perceuse, pinceau et clé plate au repos.
          </p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Mais rassurez-vous : un message via le formulaire ci-dessus et il vous rappelle
            dès la reprise, café en main et chantier en tête.
          </p>
        </div>
      )}
    </div>
  );
}
