'use client';

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type BeforeAfterItem = Tables<"before_after_items">;

const AdminBeforeAfter = () => {
  const [items, setItems] = useState<BeforeAfterItem[]>([]);
  const [editing, setEditing] = useState<Partial<BeforeAfterItem> | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    const { data } = await supabase.from("before_after_items").select("*").order("sort_order");
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const uploadImage = async (file: File, field: "before_image_url" | "after_image_url") => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `before-after/${Date.now()}-${field}.${ext}`;
    const { error } = await supabase.storage.from("site-images").upload(path, file);
    if (error) { toast.error("Erreur: " + error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("site-images").getPublicUrl(path);
    setEditing({ ...editing, [field]: data.publicUrl });
    setUploading(false);
  };

  const save = async () => {
    if (!editing) return;
    const { id, created_at, updated_at, ...rest } = editing as BeforeAfterItem;
    if (id) {
      const { error } = await supabase.from("before_after_items").update(rest).eq("id", id);
      if (error) { toast.error(error.message); return; }
    } else {
      const { error } = await supabase.from("before_after_items").insert(rest as any);
      if (error) { toast.error(error.message); return; }
    }
    toast.success("Élément sauvegardé !");
    setEditing(null);
    fetchItems();
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer cet élément ?")) return;
    await supabase.from("before_after_items").delete().eq("id", id);
    toast.success("Élément supprimé");
    fetchItems();
  };

  if (loading) return <p className="text-muted-foreground">Chargement…</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-xl font-bold">Avant / Après ({items.length})</h2>
        <Button onClick={() => setEditing({ title: "", description: "", before_image_url: null, after_image_url: null, sort_order: items.length + 1 })} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Ajouter
        </Button>
      </div>

      {editing && (
        <div className="border border-border rounded-xl p-6 bg-card space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Ordre</Label>
              <Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Photo Avant</Label>
              {editing.before_image_url && (
                <img src={editing.before_image_url} alt="Avant" className="w-32 h-24 object-cover rounded-lg" />
              )}
              <Input type="file" accept="image/*" disabled={uploading} onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], "before_image_url")} />
            </div>
            <div className="space-y-2">
              <Label>Photo Après</Label>
              {editing.after_image_url && (
                <img src={editing.after_image_url} alt="Après" className="w-32 h-24 object-cover rounded-lg" />
              )}
              <Input type="file" accept="image/*" disabled={uploading} onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], "after_image_url")} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={save} disabled={uploading}><Save className="h-4 w-4 mr-1" /> Sauvegarder</Button>
            <Button variant="ghost" onClick={() => setEditing(null)}><X className="h-4 w-4 mr-1" /> Annuler</Button>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="border border-border rounded-lg p-4 bg-card space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="aspect-[4/3] rounded bg-muted flex items-center justify-center overflow-hidden">
                {item.before_image_url ? (
                  <img src={item.before_image_url} alt="Avant" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-muted-foreground">Avant</span>
                )}
              </div>
              <div className="aspect-[4/3] rounded bg-primary/10 flex items-center justify-center overflow-hidden">
                {item.after_image_url ? (
                  <img src={item.after_image_url} alt="Après" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-muted-foreground">Après</span>
                )}
              </div>
            </div>
            <h3 className="font-semibold text-sm">{item.title}</h3>
            <p className="text-xs text-muted-foreground truncate">{item.description}</p>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => setEditing(item)}>
                <Pencil className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => remove(item.id)}>
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminBeforeAfter;
