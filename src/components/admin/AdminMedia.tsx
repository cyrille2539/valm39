'use client';

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Save, X, Upload, ArrowLeft, Images } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type MediaItem = Tables<"media_items">;

// ── Constantes ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: "cuisine",      label: "Cuisine" },
  { value: "parquet",      label: "Parquet" },
  { value: "cloisons",     label: "Cloisons" },
  { value: "peinture",     label: "Peinture" },
  { value: "électricité",  label: "Électricité" },
  { value: "autres",       label: "Autres travaux" },
] as const;

const DISPLAY_LOCATIONS = [
  { value: "home_before_after", label: "Accueil — Avant / Après" },
  { value: "realisations",      label: "Réalisations — Galerie" },
] as const;

// ── Types ──────────────────────────────────────────────────────────────────
interface ChantierGroup {
  id: string;
  nom: string;
  description: string;
  categorie: string;
  display_on: string[];
  location: string;
  photos: MediaItem[];
}

// ── Helpers ────────────────────────────────────────────────────────────────
function groupByChantier(items: MediaItem[]): ChantierGroup[] {
  const map = new Map<string, ChantierGroup>();
  for (const item of items) {
    const key = item.chantier_id ?? item.id;
    if (!map.has(key)) {
      map.set(key, {
        id: key,
        nom:         item.chantier_nom         ?? item.title,
        description: item.chantier_description ?? item.description,
        categorie:   item.category,
        display_on:  item.display_on ?? [],
        location:    item.location,
        photos:      [],
      });
    }
    map.get(key)!.photos.push(item);
  }
  return Array.from(map.values());
}

const thumbOf = (c: ChantierGroup) => {
  const first = c.photos[0];
  return first?.image_url ?? first?.after_image_url ?? first?.before_image_url ?? null;
};

// ── Composant principal ────────────────────────────────────────────────────
const AdminMedia = () => {
  const [items,     setItems]     = useState<MediaItem[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [view,      setView]      = useState<'list' | 'detail'>('list');
  const [chantier,  setChantier]  = useState<ChantierGroup | null>(null);

  // Formulaire chantier
  const [editingMeta,  setEditingMeta]  = useState<Partial<ChantierGroup> | null>(null);
  const [isNewChantier, setIsNewChantier] = useState(false);

  // Formulaire photo
  const [editingPhoto, setEditingPhoto] = useState<Partial<MediaItem> | null>(null);
  const [uploading,    setUploading]    = useState<string | null>(null);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchItems = async () => {
    const { data } = await supabase.from("media_items").select("*").order("sort_order");
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const chantiers = groupByChantier(items);

  // ── Upload image ─────────────────────────────────────────────────────────
  const upload = async (file: File, field: "image_url" | "before_image_url" | "after_image_url") => {
    setUploading(field);
    const ext  = file.name.split(".").pop();
    const path = `media/${Date.now()}-${field}.${ext}`;
    const { error } = await supabase.storage.from("site-images").upload(path, file);
    if (error) { toast.error("Erreur upload : " + error.message); setUploading(null); return; }
    const { data } = supabase.storage.from("site-images").getPublicUrl(path);
    setEditingPhoto(prev => prev ? { ...prev, [field]: data.publicUrl } : prev);
    setUploading(null);
  };

  // ── Sauvegarder chantier (métadonnées) ───────────────────────────────────
  const saveChantierMeta = async () => {
    if (!editingMeta?.nom?.trim()) { toast.error("Le nom est obligatoire"); return; }

    if (isNewChantier) {
      // Nouveau chantier : on passe à l'ajout de la première photo
      setIsNewChantier(false);
      setView('detail');
      setChantier({
        id:          crypto.randomUUID(),
        nom:         editingMeta.nom!,
        description: editingMeta.description ?? '',
        categorie:   editingMeta.categorie   ?? 'autres',
        display_on:  editingMeta.display_on  ?? [],
        location:    editingMeta.location    ?? '',
        photos:      [],
      });
      setEditingMeta(null);
      toast.success("Chantier créé — ajoutez maintenant les photos");
      return;
    }

    // Modifier les métadonnées de toutes les photos du chantier
    const updates = chantier!.photos.map(p =>
      supabase.from("media_items").update({
        chantier_nom:         editingMeta.nom,
        chantier_description: editingMeta.description ?? '',
        category:             editingMeta.categorie   ?? chantier!.categorie,
        display_on:           editingMeta.display_on  ?? chantier!.display_on,
        location:             editingMeta.location    ?? chantier!.location,
      }).eq("id", p.id)
    );
    await Promise.all(updates);
    toast.success("Chantier mis à jour");
    setEditingMeta(null);
    await fetchItems();
    // Rafraîchir le chantier courant
    const updated = groupByChantier((await supabase.from("media_items").select("*").order("sort_order")).data ?? []);
    setChantier(updated.find(c => c.id === chantier!.id) ?? null);
  };

  // ── Sauvegarder une photo ────────────────────────────────────────────────
  const savePhoto = async () => {
    if (!editingPhoto?.title?.trim()) { toast.error("Le titre est obligatoire"); return; }
    if (!chantier) return;

    const payload = {
      ...editingPhoto,
      chantier_id:          chantier.id,
      chantier_nom:         chantier.nom,
      chantier_description: chantier.description,
      category:             chantier.categorie,
      display_on:           chantier.display_on,
      location:             chantier.location,
      sort_order:           chantier.photos.length + 1,
    };

    const { id, created_at, updated_at, ...rest } = payload as MediaItem;
    if (id) {
      const { error } = await supabase.from("media_items").update(rest).eq("id", id);
      if (error) { toast.error(error.message); return; }
    } else {
      const { error } = await supabase.from("media_items").insert(rest as any);
      if (error) { toast.error(error.message); return; }
    }

    toast.success("Photo sauvegardée");
    setEditingPhoto(null);
    const { data } = await supabase.from("media_items").select("*").order("sort_order");
    setItems(data ?? []);
    const refreshed = groupByChantier(data ?? []);
    setChantier(refreshed.find(c => c.id === chantier.id) ?? chantier);
  };

  // ── Supprimer une photo ───────────────────────────────────────────────────
  const deletePhoto = async (id: string) => {
    if (!confirm("Supprimer cette photo ?")) return;
    await supabase.from("media_items").delete().eq("id", id);
    toast.success("Photo supprimée");
    const { data } = await supabase.from("media_items").select("*").order("sort_order");
    setItems(data ?? []);
    const refreshed = groupByChantier(data ?? []);
    const updated = refreshed.find(c => c.id === chantier?.id) ?? null;
    if (!updated || updated.photos.length === 0) { setView('list'); setChantier(null); }
    else setChantier(updated);
  };

  // ── Supprimer un chantier (toutes ses photos) ─────────────────────────────
  const deleteChantier = async (c: ChantierGroup) => {
    if (!confirm(`Supprimer le chantier "${c.nom}" et toutes ses photos ?`)) return;
    await Promise.all(c.photos.map(p => supabase.from("media_items").delete().eq("id", p.id)));
    toast.success("Chantier supprimé");
    fetchItems();
  };

  const toggleDisplay = (loc: string) => {
    const current = editingMeta?.display_on ?? [];
    const next = current.includes(loc) ? current.filter(v => v !== loc) : [...current, loc];
    setEditingMeta(prev => prev ? { ...prev, display_on: next } : prev);
  };

  // ── Render helpers ────────────────────────────────────────────────────────
  const fieldClass = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

  // ── VUE LISTE ─────────────────────────────────────────────────────────────
  if (loading) return <p className="text-muted-foreground">Chargement…</p>;

  if (view === 'list') return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-xl font-bold">Chantiers ({chantiers.length})</h2>
        <Button size="sm" onClick={() => {
          setEditingMeta({ nom:'', description:'', categorie:'autres', display_on:[], location:'' });
          setIsNewChantier(true);
        }}>
          <Plus className="h-4 w-4 mr-1" /> Nouveau chantier
        </Button>
      </div>

      {/* Formulaire nouveau chantier */}
      {isNewChantier && editingMeta && (
        <ChantierMetaForm
          data={editingMeta}
          onChange={setEditingMeta}
          onSave={saveChantierMeta}
          onCancel={() => { setEditingMeta(null); setIsNewChantier(false); }}
          toggleDisplay={toggleDisplay}
          isNew
        />
      )}

      {/* Liste des chantiers */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {chantiers.map(c => {
          const thumb = thumbOf(c);
          return (
            <div key={c.id} className="border border-border rounded-xl bg-card overflow-hidden">
              <div
                className="aspect-[4/3] bg-muted cursor-pointer relative"
                onClick={() => { setChantier(c); setView('detail'); }}
              >
                {thumb
                  ? <img src={thumb} alt={c.nom} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Pas de photo</div>
                }
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Images className="h-3 w-3" /> {c.photos.length}
                </div>
              </div>
              <div className="p-3">
                <p className="font-semibold text-sm truncate">{c.nom}</p>
                {c.location && <p className="text-xs text-muted-foreground">{c.location}</p>}
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium capitalize">{c.categorie}</span>
                  {c.display_on.map(loc => (
                    <span key={loc} className="text-[10px] px-1.5 py-0.5 rounded bg-border text-muted-foreground">
                      {loc === "home_before_after" ? "Accueil" : "Réalisations"}
                    </span>
                  ))}
                </div>
                <div className="flex gap-1 mt-2">
                  <Button variant="ghost" size="sm" className="flex-1" onClick={() => { setChantier(c); setView('detail'); }}>
                    <Pencil className="h-3 w-3 mr-1" /> Gérer
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteChantier(c)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── VUE DÉTAIL CHANTIER ───────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => { setView('list'); setChantier(null); setEditingMeta(null); setEditingPhoto(null); }}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Chantiers
        </Button>
        <h2 className="font-display text-xl font-bold flex-1 truncate">{chantier?.nom}</h2>
        <Button variant="outline" size="sm" onClick={() => setEditingMeta({
          nom:         chantier!.nom,
          description: chantier!.description,
          categorie:   chantier!.categorie,
          display_on:  [...chantier!.display_on],
          location:    chantier!.location,
        })}>
          <Pencil className="h-3 w-3 mr-1" /> Modifier infos
        </Button>
      </div>

      {/* Formulaire métadonnées chantier */}
      {editingMeta && (
        <ChantierMetaForm
          data={editingMeta}
          onChange={setEditingMeta}
          onSave={saveChantierMeta}
          onCancel={() => setEditingMeta(null)}
          toggleDisplay={toggleDisplay}
        />
      )}

      {/* Grille de photos */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Bouton ajouter */}
        <button
          onClick={() => setEditingPhoto({ title: chantier!.nom, sort_order: (chantier?.photos.length ?? 0) + 1 })}
          className="aspect-[4/3] border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
        >
          <Plus className="h-8 w-8" />
          <span className="text-sm font-medium">Ajouter une photo</span>
        </button>

        {/* Photos existantes */}
        {chantier?.photos.map(photo => {
          const thumb = photo.image_url ?? photo.after_image_url ?? photo.before_image_url;
          return (
            <div key={photo.id} className="border border-border rounded-xl bg-card overflow-hidden">
              <div className="aspect-[4/3] bg-muted relative">
                {thumb
                  ? <img src={thumb} alt={photo.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Pas d'image</div>
                }
              </div>
              <div className="p-2 flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground truncate flex-1">{photo.title}</p>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingPhoto(photo)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deletePhoto(photo.id)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Formulaire photo */}
      {editingPhoto && (
        <div className="border border-border rounded-xl p-6 bg-card space-y-4">
          <h3 className="font-display font-bold text-base">
            {editingPhoto.id ? "Modifier la photo" : "Ajouter une photo"}
          </h3>

          <div className="space-y-2">
            <Label>Titre</Label>
            <Input
              value={editingPhoto.title ?? ""}
              onChange={e => setEditingPhoto({ ...editingPhoto, title: e.target.value })}
              placeholder="Ex : Vue d'ensemble après travaux"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {(["image_url", "before_image_url", "after_image_url"] as const).map(field => {
              const labels = { image_url: "Photo principale", before_image_url: "Photo Avant", after_image_url: "Photo Après" };
              return (
                <div key={field} className="space-y-2">
                  <Label>{labels[field]}</Label>
                  {editingPhoto[field] && (
                    <div className="relative">
                      <img src={editingPhoto[field]!} alt="" className="w-full aspect-[4/3] object-cover rounded-lg" />
                      <button
                        onClick={() => setEditingPhoto({ ...editingPhoto, [field]: null })}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <label className={`flex items-center gap-2 text-sm cursor-pointer px-3 py-2 rounded-md border border-dashed border-border hover:border-primary/50 transition-colors ${uploading === field ? "opacity-50" : ""}`}>
                    <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">{uploading === field ? "Upload…" : "Choisir"}</span>
                    <input type="file" accept="image/*" className="sr-only"
                      disabled={uploading !== null}
                      onChange={e => e.target.files?.[0] && upload(e.target.files[0], field)} />
                  </label>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 pt-1">
            <Button onClick={savePhoto} disabled={uploading !== null}>
              <Save className="h-4 w-4 mr-1" /> Sauvegarder
            </Button>
            <Button variant="ghost" onClick={() => setEditingPhoto(null)}>
              <X className="h-4 w-4 mr-1" /> Annuler
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Formulaire métadonnées chantier ──────────────────────────────────────────
function ChantierMetaForm({ data, onChange, onSave, onCancel, toggleDisplay, isNew = false }: {
  data: Partial<ChantierGroup>;
  onChange: (d: Partial<ChantierGroup>) => void;
  onSave: () => void;
  onCancel: () => void;
  toggleDisplay: (loc: string) => void;
  isNew?: boolean;
}) {
  return (
    <div className="border border-border rounded-xl p-6 bg-card space-y-4">
      <h3 className="font-display font-bold text-base">
        {isNew ? "Nouveau chantier" : "Modifier les informations"}
      </h3>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nom du chantier <span className="text-destructive">*</span></Label>
          <Input
            value={data.nom ?? ""}
            onChange={e => onChange({ ...data, nom: e.target.value })}
            placeholder="Ex : Cuisine rénovée — Arbois"
          />
        </div>
        <div className="space-y-2">
          <Label>Ville</Label>
          <Input
            value={data.location ?? ""}
            onChange={e => onChange({ ...data, location: e.target.value })}
            placeholder="Ex : Lons-le-Saunier"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={data.description ?? ""}
          onChange={e => onChange({ ...data, description: e.target.value })}
          rows={2}
          placeholder="Courte description du chantier…"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Catégorie</Label>
          <select
            value={data.categorie ?? "autres"}
            onChange={e => onChange({ ...data, categorie: e.target.value })}
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Afficher sur</Label>
          <div className="flex flex-col gap-2 pt-1">
            {DISPLAY_LOCATIONS.map(loc => (
              <label key={loc.value} className="flex items-center gap-2 cursor-pointer select-none text-sm">
                <input
                  type="checkbox"
                  checked={(data.display_on ?? []).includes(loc.value)}
                  onChange={() => toggleDisplay(loc.value)}
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                {loc.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={onSave}>
          <Save className="h-4 w-4 mr-1" /> {isNew ? "Créer le chantier" : "Enregistrer"}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          <X className="h-4 w-4 mr-1" /> Annuler
        </Button>
      </div>
    </div>
  );
}

export default AdminMedia;
