'use client';

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Star, Save, X } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Testimonial = Tables<"testimonials">;

const AdminTestimonials = () => {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [editing, setEditing] = useState<Partial<Testimonial> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    const { data } = await supabase
      .from("testimonials")
      .select("*")
      .order("sort_order");
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const save = async () => {
    if (!editing) return;
    const { id, created_at, updated_at, ...rest } = editing as Testimonial;
    if (id) {
      const { error } = await supabase.from("testimonials").update(rest).eq("id", id);
      if (error) { toast.error("Erreur: " + error.message); return; }
    } else {
      const { error } = await supabase.from("testimonials").insert(rest as any);
      if (error) { toast.error("Erreur: " + error.message); return; }
    }
    toast.success("Avis sauvegardé !");
    setEditing(null);
    fetch();
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer cet avis ?")) return;
    await supabase.from("testimonials").delete().eq("id", id);
    toast.success("Avis supprimé");
    fetch();
  };

  if (loading) return <p className="text-muted-foreground">Chargement…</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-xl font-bold">Avis clients ({items.length})</h2>
        <Button onClick={() => setEditing({ name: "", role: "", text: "", stars: 5, sort_order: items.length + 1 })} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Ajouter
        </Button>
      </div>

      {editing && (
        <div className="border border-border rounded-xl p-6 bg-card space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Rôle / Localisation</Label>
              <Input value={editing.role ?? ""} onChange={(e) => setEditing({ ...editing, role: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Témoignage</Label>
            <Textarea value={editing.text ?? ""} onChange={(e) => setEditing({ ...editing, text: e.target.value })} rows={3} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Étoiles (1-5)</Label>
              <Input type="number" min={1} max={5} value={editing.stars ?? 5} onChange={(e) => setEditing({ ...editing, stars: parseInt(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Ordre d'affichage</Label>
              <Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) })} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={save}><Save className="h-4 w-4 mr-1" /> Sauvegarder</Button>
            <Button variant="ghost" onClick={() => setEditing(null)}><X className="h-4 w-4 mr-1" /> Annuler</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-4 p-4 border border-border rounded-lg bg-card">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-foreground">{item.name}</span>
                <span className="text-xs text-muted-foreground">{item.role}</span>
              </div>
              <p className="text-sm text-muted-foreground truncate">{item.text}</p>
              <div className="flex gap-0.5 mt-1">
                {Array.from({ length: item.stars }).map((_, j) => (
                  <Star key={j} className="h-3 w-3 fill-primary text-primary" />
                ))}
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button variant="ghost" size="icon" onClick={() => setEditing(item)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => remove(item.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminTestimonials;
