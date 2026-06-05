'use client';

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Contact {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  message: string | null;
  source: string;
  created_at: string;
}

const SOURCE_LABELS: Record<string, string> = {
  accueil:      "Accueil",
  realisations: "Réalisations",
  investisseurs:"Investisseurs",
  agences:      "Agences",
  locations:    "Locations",
};

const SOURCE_COLORS: Record<string, string> = {
  accueil:       "bg-primary/10 text-primary",
  realisations:  "bg-blue-500/10 text-blue-600",
  investisseurs: "bg-amber-500/10 text-amber-700",
  agences:       "bg-purple-500/10 text-purple-700",
  locations:     "bg-green-500/10 text-green-700",
};

const AdminContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<string>("tous");

  const fetch = async () => {
    const { data } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });
    setContacts(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce contact ?")) return;
    await supabase.from("contacts").delete().eq("id", id);
    toast.success("Contact supprimé");
    fetch();
  };

  const sources = ["tous", ...Array.from(new Set(contacts.map(c => c.source)))];
  const filtered = filter === "tous" ? contacts : contacts.filter(c => c.source === filter);

  if (loading) return <p className="text-muted-foreground">Chargement…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-xl font-bold">Contacts ({contacts.length})</h2>
        <div className="flex gap-2 flex-wrap">
          {sources.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                filter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-primary/10"
              }`}
            >
              {s === "tous" ? "Tous" : SOURCE_LABELS[s] ?? s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Aucun contact pour l'instant.</p>
      ) : (
        <div className="divide-y divide-border">
          {filtered.map(c => (
            <div key={c.id} className="flex items-center gap-4 py-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="font-semibold text-sm text-foreground">{c.name ?? "—"}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${SOURCE_COLORS[c.source] ?? "bg-muted text-muted-foreground"}`}>
                    {SOURCE_LABELS[c.source] ?? c.source}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{c.email}</p>
                {c.phone && <p className="text-xs text-muted-foreground">{c.phone}</p>}
                {c.message && <p className="text-xs text-muted-foreground/70 mt-1 italic">« {c.message} »</p>}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-muted-foreground hidden sm:block">
                  {new Date(c.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
                <Button variant="ghost" size="icon" onClick={() => remove(c.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminContacts;
