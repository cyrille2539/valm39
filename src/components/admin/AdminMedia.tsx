'use client';

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Save, X, Upload } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type MediaItem = Tables<"media_items">;

const CATEGORIES = [
  { value: "cuisine",  label: "Cuisine" },
  { value: "parquet",  label: "Parquet" },
  { value: "cloisons", label: "Cloisons" },
  { value: "peinture",      label: "Peinture" },
  { value: "électricité",   label: "Électricité" },
  { value: "autres",        label: "Autres travaux" },
] as const;

const DISPLAY_LOCATIONS = [
  { value: "home_before_after", label: "Accueil — Avant / Après" },
  { value: "realisations",      label: "Réalisations — Galerie" },
] as const;

type DisplayLoc = (typeof DISPLAY_LOCATIONS)[number]["value"];

const EMPTY: Partial<MediaItem> = {
  title: "",
  description: "",
  location: "",
  category: "autres",
  image_url: null,
  before_image_url: null,
  after_image_url: null,
  display_on: [],
  sort_order: 0,
};

// Résoud l'image d'aperçu : image_url › after › before
const thumbUrl = (item: Partial<MediaItem>) =>
  item.image_url ?? item.after_image_url ?? item.before_image_url ?? null;

const AdminMedia = () => {
  const [items, setItems]       = useState<MediaItem[]>([]);
  const [editing, setEditing]   = useState<Partial<MediaItem> | null>(null);
  const [uploading, setUploading] = useState<string | null>(null); // champ en cours
  const [loading, setLoading]   = useState(true);

  const fetch = async () => {
    const { data } = await supabase.from("media_items").select("*").order("sort_order");
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  // ── Upload ─────────────────────────────────────────────────────────────────
  const upload = async (file: File, field: "image_url" | "before_image_url" | "after_image_url") => {
    setUploading(field);
    const ext  = file.name.split(".").pop();
    const path = `media/${Date.now()}-${field}.${ext}`;
    const { error } = await supabase.storage.from("site-images").upload(path, file);
    if (error) { toast.error("Erreur upload : " + error.message); setUploading(null); return; }
    const { data } = supabase.storage.from("site-images").getPublicUrl(path);
    setEditing(prev => prev ? { ...prev, [field]: data.publicUrl } : prev);
    setUploading(null);
  };

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const save = async () => {
    if (!editing?.title?.trim()) { toast.error("Le titre est obligatoire"); return; }
    const { id, created_at, updated_at, ...rest } = editing as MediaItem;
    if (id) {
      const { error } = await supabase.from("media_items").update(rest).eq("id", id);
      if (error) { toast.error(error.message); return; }
    } else {
      const { error } = await supabase.from("media_items").insert(rest as any);
      if (error) { toast.error(error.message); return; }
    }
    toast.success("Média sauvegardé !");
    setEditing(null);
    fetch();
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce média ?")) return;
    await supabase.from("media_items").delete().eq("id", id);
    toast.success("Média supprimé");
    fetch();
  };

  // ── Toggle emplacement ─────────────────────────────────────────────────────
  const toggleLoc = (loc: DisplayLoc) => {
    const current: string[] = editing?.display_on ?? [];
    const next = current.includes(loc)
      ? current.filter(v => v !== loc)
      : [...current, loc];
    setEditing(prev => prev ? { ...prev, display_on: next } : prev);
  };

  if (loading) return <p className="text-muted-foreground">Chargement…</p>;

  return (
    <div className="space-y-6">
      {/* ── En-tête ── */}
      <div className="flex justify-between items-center">
        <h2 className="font-display text-xl font-bold">Médias ({items.length})</h2>
        <Button onClick={() => setEditing({ ...EMPTY, sort_order: items.length + 1 })} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Ajouter
        </Button>
      </div>

      {/* ── Formulaire ── */}
      {editing && (
        <div className="border border-border rounded-xl p-6 bg-card space-y-5">

          {/* Titre + ordre */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-2">
              <Label>Titre <span className="text-destructive">*</span></Label>
              <Input value={editing.title ?? ""} onChange={e => setEditing({ ...editing, title: e.target.value })} placeholder="Ex : Cuisine rénovée" />
            </div>
            <div className="space-y-2">
              <Label>Ordre</Label>
              <Input type="number" value={editing.sort_order ?? 0}
                onChange={e => setEditing({ ...editing, sort_order: parseInt(e.target.value) })} />
            </div>
          </div>

          {/* Ville + catégorie */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ville</Label>
              <Input value={editing.location ?? ""} onChange={e => setEditing({ ...editing, location: e.target.value })} placeholder="Ex : Lons-le-Saunier" />
            </div>
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <select
                value={editing.category ?? "autres"}
                onChange={e => setEditing({ ...editing, category: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          {/* Description (optionnel) */}
          <div className="space-y-2">
            <Label>Description <span className="text-muted-foreground text-xs">(optionnel)</span></Label>
            <Textarea value={editing.description ?? ""} onChange={e => setEditing({ ...editing, description: e.target.value })} rows={2} placeholder="Courte description du chantier…" />
          </div>

          {/* Emplacements d'affichage */}
          <div className="space-y-2">
            <Label>Afficher sur</Label>
            <div className="flex flex-wrap gap-3">
              {DISPLAY_LOCATIONS.map(loc => {
                const checked = (editing.display_on ?? []).includes(loc.value);
                return (
                  <label key={loc.value} className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={checked} onChange={() => toggleLoc(loc.value as DisplayLoc)}
                      className="h-4 w-4 rounded border-input accent-primary" />
                    <span className="text-sm">{loc.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Photos */}
          <div className="grid sm:grid-cols-3 gap-4">
            {(["before_image_url", "after_image_url", "image_url"] as const).map(field => {
              const labels = {
                before_image_url: "Photo Avant",
                after_image_url:  "Photo Après",
                image_url:        "Photo principale",
              };
              const hints = {
                before_image_url: "",
                after_image_url:  "",
                image_url:        "Si vide → utilise la photo Après",
              };
              return (
                <div key={field} className="space-y-2">
                  <Label>{labels[field]}</Label>
                  {hints[field] && <p className="text-xs text-muted-foreground">{hints[field]}</p>}
                  {editing[field] && (
                    <div className="relative">
                      <img src={editing[field]!} alt="" className="w-full aspect-[4/3] object-cover rounded-lg" />
                      <button
                        onClick={() => setEditing({ ...editing, [field]: null })}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80"
                        aria-label="Supprimer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <label className={`flex items-center gap-2 text-sm cursor-pointer px-3 py-2 rounded-md border border-dashed border-border hover:border-primary/50 transition-colors ${uploading === field ? "opacity-50" : ""}`}>
                    <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">{uploading === field ? "Upload…" : "Choisir une image"}</span>
                    <input type="file" accept="image/*" className="sr-only"
                      disabled={uploading !== null}
                      onChange={e => e.target.files?.[0] && upload(e.target.files[0], field)} />
                  </label>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button onClick={save} disabled={uploading !== null}>
              <Save className="h-4 w-4 mr-1" /> Sauvegarder
            </Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              <X className="h-4 w-4 mr-1" /> Annuler
            </Button>
          </div>
        </div>
      )}

      {/* ── Liste ── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => {
          const thumb = thumbUrl(item);
          return (
            <div key={item.id} className="border border-border rounded-lg p-4 bg-card space-y-2">
              {/* Aperçu */}
              <div className="aspect-[4/3] rounded-lg bg-muted overflow-hidden">
                {thumb ? (
                  <img src={thumb} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Pas d'image</div>
                )}
              </div>
              {/* Méta */}
              <div>
                <p className="font-semibold text-sm truncate">{item.title}</p>
                {item.location && <p className="text-xs text-muted-foreground">{item.location}</p>}
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium capitalize">{item.category}</span>
                  {(item.display_on ?? []).map(loc => (
                    <span key={loc} className="text-[10px] px-1.5 py-0.5 rounded bg-border text-muted-foreground">
                      {loc === "home_before_after" ? "Accueil" : "Réalisations"}
                    </span>
                  ))}
                </div>
              </div>
              {/* Actions */}
              <div className="flex gap-1 pt-1">
                <Button variant="ghost" size="sm" onClick={() => setEditing(item)}>
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => remove(item.id)}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminMedia;
