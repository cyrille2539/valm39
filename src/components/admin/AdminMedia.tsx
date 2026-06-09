'use client';

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Save, X, Upload, ArrowLeft, Images, Home } from "lucide-react";
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
  { value: "realisations", label: "Réalisations — Galerie" },
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

// Entrée dédiée accueil avant/après (pas dans la grille photos régulières)
const isPairRecord = (p: MediaItem) => {
  const d = p.display_on ?? [];
  return d.includes("home_before_after") && !d.includes("realisations");
};

function groupByChantier(items: MediaItem[]): ChantierGroup[] {
  const map = new Map<string, ChantierGroup>();
  for (const item of items) {
    const key = item.chantier_id ?? item.id;
    if (!map.has(key)) {
      map.set(key, {
        id:          key,
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
  const regular = c.photos.filter(p => !isPairRecord(p));
  const first = regular[0] ?? c.photos[0];
  return first?.image_url ?? first?.after_image_url ?? first?.before_image_url ?? null;
};

const photoUrl = (p: MediaItem) =>
  p.image_url ?? p.after_image_url ?? p.before_image_url ?? null;

// ── Composant principal ────────────────────────────────────────────────────
const AdminMedia = () => {
  const [items,         setItems]         = useState<MediaItem[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [view,          setView]          = useState<'list' | 'detail'>('list');
  const [chantier,      setChantier]      = useState<ChantierGroup | null>(null);
  const [editingMeta,   setEditingMeta]   = useState<Partial<ChantierGroup> | null>(null);
  const [isNewChantier, setIsNewChantier] = useState(false);
  const [editingPhoto,  setEditingPhoto]  = useState<Partial<MediaItem> | null>(null);
  const [uploading,     setUploading]     = useState<string | null>(null);

  // Paire Avant/Après accueil (une par chantier)
  const [homeAvantUrl, setHomeAvantUrl] = useState<string | null>(null);
  const [homeApresUrl, setHomeApresUrl] = useState<string | null>(null);
  const [homePairId,   setHomePairId]   = useState<string | undefined>(undefined);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchItems = async () => {
    const { data } = await supabase.from("media_items").select("*").order("sort_order");
    setItems(data ?? []);
    setLoading(false);
    return data ?? [];
  };

  useEffect(() => { fetchItems(); }, []);

  const chantiers = groupByChantier(items);

  // ── Ouvrir détail ────────────────────────────────────────────────────────
  const openDetail = (c: ChantierGroup) => {
    setChantier(c);
    setView('detail');
    setEditingMeta(null);
    setEditingPhoto(null);
    const pair = c.photos.find(isPairRecord);
    setHomeAvantUrl(pair?.before_image_url ?? null);
    setHomeApresUrl(pair?.after_image_url  ?? null);
    setHomePairId(pair?.id);
  };

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

  // ── Upsert paire accueil ─────────────────────────────────────────────────
  const upsertPair = async (avant: string | null, apres: string | null) => {
    if (!chantier) return;
    const displayOn = avant && apres ? ["home_before_after"] : [];

    if (!avant && !apres) {
      if (homePairId) {
        await supabase.from("media_items").delete().eq("id", homePairId);
        setHomePairId(undefined);
      }
      return;
    }

    if (homePairId) {
      await supabase.from("media_items").update({
        before_image_url: avant,
        after_image_url:  apres,
        display_on:       displayOn,
        chantier_nom:     chantier.nom,
        description:      chantier.description,
      }).eq("id", homePairId);
    } else {
      const { data: rec } = await supabase.from("media_items").insert({
        chantier_id:          chantier.id,
        chantier_nom:         chantier.nom,
        chantier_description: chantier.description,
        category:             chantier.categorie as any,
        display_on:           displayOn,
        title:                chantier.nom,
        description:          chantier.description,
        before_image_url:     avant,
        after_image_url:      apres,
        image_url:            null,
        location:             chantier.location,
        sort_order:           0,
      } as any).select("id").single();
      if (rec) setHomePairId(rec.id);
    }
    // Rafraîchir le compteur de la liste
    fetchItems();
  };

  // ── Toggles photo ────────────────────────────────────────────────────────
  const toggleAvant = async (photo: MediaItem) => {
    const url = photoUrl(photo);
    if (!url) return;
    const newAvant = homeAvantUrl === url ? null : url;
    setHomeAvantUrl(newAvant);
    await upsertPair(newAvant, homeApresUrl);
  };

  const toggleApres = async (photo: MediaItem) => {
    const url = photoUrl(photo);
    if (!url) return;
    const newApres = homeApresUrl === url ? null : url;
    setHomeApresUrl(newApres);
    await upsertPair(homeAvantUrl, newApres);
  };

  const toggleCatCard = async (photo: MediaItem) => {
    const current = photo.display_on ?? [];
    const hasCatCard = current.includes("cat_card");

    if (hasCatCard) {
      await supabase.from("media_items")
        .update({ display_on: current.filter(v => v !== "cat_card") })
        .eq("id", photo.id);
    } else {
      // Retirer cat_card des autres photos de la même catégorie
      const sameCategory = items.filter(i =>
        i.id !== photo.id &&
        i.category === photo.category &&
        (i.display_on ?? []).includes("cat_card")
      );
      await Promise.all(sameCategory.map(i =>
        supabase.from("media_items")
          .update({ display_on: (i.display_on ?? []).filter(v => v !== "cat_card") })
          .eq("id", i.id)
      ));
      await supabase.from("media_items")
        .update({ display_on: [...current, "cat_card"] })
        .eq("id", photo.id);
    }

    const data = await fetchItems();
    const groups = groupByChantier(data);
    const updated = groups.find(c => c.id === chantier?.id);
    if (updated) setChantier(updated);
  };

  // ── Sauvegarder métadonnées chantier ─────────────────────────────────────
  const saveChantierMeta = async () => {
    try {
      if (!editingMeta?.nom?.trim()) { toast.error("Le nom est obligatoire"); return; }

      if (isNewChantier) {
        setIsNewChantier(false);
        openDetail({
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

      if (!chantier) { toast.error("Aucun chantier sélectionné"); return; }

      const chantierId    = chantier.id;
      const regularPhotos = chantier.photos.filter(p => !isPairRecord(p));
      const pairRecord    = chantier.photos.find(isPairRecord);
      const newMeta = {
        nom:         editingMeta.nom!,
        description: editingMeta.description ?? '',
        categorie:   editingMeta.categorie   ?? chantier.categorie,
        display_on:  editingMeta.display_on  ?? chantier.display_on,
        location:    editingMeta.location    ?? '',
      };

      if (regularPhotos.length === 0 && !pairRecord) {
        // Chantier sans photos : mise à jour de l'état local uniquement
        setChantier(prev => prev ? { ...prev, ...newMeta } : prev);
        setEditingMeta(null);
        toast.success("Chantier mis à jour");
        return;
      }

      for (const p of regularPhotos) {
        const { error } = await supabase.from("media_items").update({
          chantier_nom:         newMeta.nom,
          chantier_description: newMeta.description,
          category:             newMeta.categorie as any,
          display_on:           newMeta.display_on,
          location:             newMeta.location,
        }).eq("id", p.id);
        if (error) throw error;
      }

      if (pairRecord) {
        const { error } = await supabase.from("media_items").update({
          chantier_nom:         newMeta.nom,
          chantier_description: newMeta.description,
          title:                newMeta.nom,
          description:          newMeta.description,
        }).eq("id", pairRecord.id);
        if (error) throw error;
      }

      toast.success("Chantier mis à jour");
      setEditingMeta(null);
      setChantier(prev => prev ? { ...prev, ...newMeta } : prev);

      const data = await fetchItems();
      const groups = groupByChantier(data);
      const refreshed = groups.find(c => c.id === chantierId);
      if (refreshed) openDetail(refreshed);

    } catch (err: any) {
      toast.error("Erreur lors de la sauvegarde : " + (err?.message ?? String(err)));
    }
  };

  // ── Sauvegarder une photo ────────────────────────────────────────────────
  const savePhoto = async () => {
    if (!editingPhoto?.title?.trim()) { toast.error("Le titre est obligatoire"); return; }
    if (!chantier) return;

    const regularCount = chantier.photos.filter(p => !isPairRecord(p)).length;
    const payload = {
      ...editingPhoto,
      chantier_id:          chantier.id,
      chantier_nom:         chantier.nom,
      chantier_description: chantier.description,
      category:             chantier.categorie,
      display_on:           chantier.display_on,
      location:             chantier.location,
      sort_order:           regularCount + 1,
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
    const data = await fetchItems();
    const groups = groupByChantier(data);
    const updated = groups.find(c => c.id === chantier.id);
    if (updated) openDetail(updated);
  };

  // ── Supprimer une photo ───────────────────────────────────────────────────
  const deletePhoto = async (id: string) => {
    if (!confirm("Supprimer cette photo ?")) return;
    await supabase.from("media_items").delete().eq("id", id);
    toast.success("Photo supprimée");
    const data = await fetchItems();
    const groups = groupByChantier(data);
    const updated = groups.find(c => c.id === chantier?.id);
    const remaining = updated?.photos.filter(p => !isPairRecord(p)) ?? [];
    if (!updated || remaining.length === 0) { setView('list'); setChantier(null); }
    else openDetail(updated);
  };

  // ── Supprimer un chantier ─────────────────────────────────────────────────
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

  // ── VUE LISTE ─────────────────────────────────────────────────────────────
  if (loading) return <p className="text-muted-foreground">Chargement…</p>;

  if (view === 'list') return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-xl font-bold">Chantiers ({chantiers.length})</h2>
        <Button size="sm" onClick={() => {
          setEditingMeta({ nom: '', description: '', categorie: 'autres', display_on: [], location: '' });
          setIsNewChantier(true);
        }}>
          <Plus className="h-4 w-4 mr-1" /> Nouveau chantier
        </Button>
      </div>

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

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {chantiers.map(c => {
          const thumb = thumbOf(c);
          const regularCount = c.photos.filter(p => !isPairRecord(p)).length;
          const hasHomePair = c.photos.some(isPairRecord);
          return (
            <div key={c.id} className="border border-border rounded-xl bg-card overflow-hidden">
              <div className="aspect-[4/3] bg-muted cursor-pointer relative" onClick={() => openDetail(c)}>
                {thumb
                  ? <img src={thumb} alt={c.nom} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Pas de photo</div>
                }
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Images className="h-3 w-3" /> {regularCount}
                </div>
                {hasHomePair && (
                  <div className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1 font-medium">
                    <Home className="h-2.5 w-2.5" /> Accueil
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="font-semibold text-sm truncate">{c.nom}</p>
                {c.location && <p className="text-xs text-muted-foreground">{c.location}</p>}
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium capitalize">{c.categorie}</span>
                  {(c.display_on ?? []).includes("realisations") && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-border text-muted-foreground">Réalisations</span>
                  )}
                </div>
                <div className="flex gap-1 mt-2">
                  <Button variant="ghost" size="sm" className="flex-1" onClick={() => openDetail(c)}>
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
  const regularPhotos = chantier?.photos.filter(p => !isPairRecord(p)) ?? [];

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

      {editingMeta && (
        <ChantierMetaForm
          data={editingMeta}
          onChange={setEditingMeta}
          onSave={saveChantierMeta}
          onCancel={() => setEditingMeta(null)}
          toggleDisplay={toggleDisplay}
        />
      )}

      {/* Légende des badges */}
      <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500" /> Avant (page d'accueil)</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" /> Après (page d'accueil)</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-primary" /> Carte catégorie (carousel)</span>
      </div>

      {/* Grille de photos */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Formulaire ajout inline / bouton + */}
        {editingPhoto && !editingPhoto.id ? (
          <div className="border border-border rounded-xl p-4 bg-card space-y-3">
            <h3 className="font-display font-bold text-sm">Ajouter une photo</h3>
            <div className="space-y-1.5">
              <Label className="text-xs">Titre</Label>
              <Input
                value={editingPhoto.title ?? ""}
                onChange={e => setEditingPhoto({ ...editingPhoto, title: e.target.value })}
                placeholder="Ex : Vue d'ensemble après travaux"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Photo à ajouter</Label>
              {editingPhoto.image_url && (
                <div className="relative">
                  <img src={editingPhoto.image_url} alt="" className="w-full aspect-[4/3] object-cover rounded-lg" />
                  <button
                    onClick={() => setEditingPhoto({ ...editingPhoto, image_url: null })}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <label className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md border border-dashed border-border hover:border-primary/50 transition-colors ${uploading === "image_url" ? "opacity-50" : ""}`}>
                <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground text-sm">{uploading === "image_url" ? "Upload…" : "Choisir"}</span>
                <input type="file" accept="image/*" className="sr-only"
                  disabled={uploading !== null}
                  onChange={e => e.target.files?.[0] && upload(e.target.files[0], "image_url")} />
              </label>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={savePhoto} disabled={uploading !== null}>
                <Save className="h-3 w-3 mr-1" /> Sauvegarder
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingPhoto(null)}>
                <X className="h-3 w-3 mr-1" /> Annuler
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setEditingPhoto({ title: chantier!.nom, sort_order: regularPhotos.length + 1 })}
            className="aspect-[4/3] border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
          >
            <Plus className="h-8 w-8" />
            <span className="text-sm font-medium">Ajouter une photo</span>
          </button>
        )}

        {/* Photos existantes */}
        {regularPhotos.map(photo => {
          const url = photoUrl(photo);
          const isAvant   = !!url && homeAvantUrl === url;
          const isApres   = !!url && homeApresUrl === url;
          const isCatCard = (photo.display_on ?? []).includes("cat_card");
          return (
            <div key={photo.id} className="border border-border rounded-xl bg-card overflow-hidden">
              <div className="aspect-[4/3] bg-muted relative">
                {url
                  ? <img src={url} alt={photo.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Pas d'image</div>
                }
                {/* Indicateurs actifs */}
                <div className="absolute top-1.5 left-1.5 flex gap-1">
                  {isAvant   && <span className="bg-amber-500   text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold leading-none">Av</span>}
                  {isApres   && <span className="bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold leading-none">Ap</span>}
                  {isCatCard && <span className="bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 rounded-full font-bold leading-none">Carte</span>}
                </div>
              </div>

              {/* Toggles de rôle */}
              <div className="px-2 pt-1.5 pb-1 flex flex-wrap gap-1">
                <button
                  onClick={() => toggleAvant(photo)}
                  title="Désigner comme photo Avant pour l'accueil"
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border transition-colors ${
                    isAvant
                      ? 'bg-amber-500 border-amber-500 text-white'
                      : 'border-border text-muted-foreground hover:border-amber-400 hover:text-amber-600'
                  }`}
                >
                  Avant
                </button>
                <button
                  onClick={() => toggleApres(photo)}
                  title="Désigner comme photo Après pour l'accueil"
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border transition-colors ${
                    isApres
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-border text-muted-foreground hover:border-emerald-400 hover:text-emerald-600'
                  }`}
                >
                  Après
                </button>
                <button
                  onClick={() => toggleCatCard(photo)}
                  title="Utiliser comme image de la carte catégorie dans le carousel"
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border transition-colors ${
                    isCatCard
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'border-border text-muted-foreground hover:border-primary/50 hover:text-primary'
                  }`}
                >
                  Carte
                </button>
              </div>

              {/* Actions */}
              <div className="px-2 pb-2 flex items-center justify-between gap-2">
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

      {/* Info paire accueil */}
      {(homeAvantUrl || homeApresUrl) && (
        <div className="flex items-center gap-3 text-sm border border-border rounded-lg px-4 py-3 bg-card">
          <Home className="h-4 w-4 text-primary shrink-0" />
          <span className="text-muted-foreground">
            Accueil Avant/Après :{' '}
            {homeAvantUrl && homeApresUrl
              ? <span className="text-foreground font-medium">paire active — visible sur la page d'accueil</span>
              : <span className="text-amber-600">manque la photo {!homeAvantUrl ? '"Avant"' : '"Après"'} pour activer la paire</span>
            }
          </span>
          {(homeAvantUrl || homeApresUrl) && (
            <button
              onClick={async () => {
                if (homePairId) await supabase.from("media_items").delete().eq("id", homePairId);
                setHomeAvantUrl(null); setHomeApresUrl(null); setHomePairId(undefined);
                toast.success("Paire retirée de l'accueil");
                fetchItems();
              }}
              className="ml-auto text-xs text-destructive hover:underline shrink-0"
            >
              Retirer
            </button>
          )}
        </div>
      )}

      {/* Formulaire édition photo existante */}
      {editingPhoto?.id && (
        <div className="border border-border rounded-xl p-6 bg-card space-y-4">
          <h3 className="font-display font-bold text-base">Modifier la photo</h3>
          <div className="space-y-2">
            <Label>Titre</Label>
            <Input
              value={editingPhoto.title ?? ""}
              onChange={e => setEditingPhoto({ ...editingPhoto, title: e.target.value })}
              placeholder="Ex : Vue d'ensemble après travaux"
            />
          </div>
          <div className="space-y-2">
            <Label>Photo à ajouter</Label>
            {editingPhoto.image_url && (
              <div className="relative">
                <img src={editingPhoto.image_url} alt="" className="w-full max-w-xs aspect-[4/3] object-cover rounded-lg" />
                <button
                  onClick={() => setEditingPhoto({ ...editingPhoto, image_url: null })}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            <label className={`flex items-center gap-2 text-sm cursor-pointer px-3 py-2 rounded-md border border-dashed border-border hover:border-primary/50 transition-colors w-fit ${uploading === "image_url" ? "opacity-50" : ""}`}>
              <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">{uploading === "image_url" ? "Upload…" : "Choisir"}</span>
              <input type="file" accept="image/*" className="sr-only"
                disabled={uploading !== null}
                onChange={e => e.target.files?.[0] && upload(e.target.files[0], "image_url")} />
            </label>
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
