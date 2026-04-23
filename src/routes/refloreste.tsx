import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { uploadMedia } from "@/lib/upload";
import { ptDate, methodLabel } from "@/lib/format";
import { Sprout, TreePine, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/refloreste")({
  component: () => (<AuthGuard><AppShell><Refloreste /></AppShell></AuthGuard>),
});

interface Species { id: string; common_name: string; scientific_name: string | null; }
interface Consortium { id: string; name: string; area_hectares: number; status: string; species_list: string[]; verification_method: string; description: string | null; photo_url: string | null; }
interface Planting { id: string; planted_at: string; status: string; verification_method: string; notes: string | null; photo_url: string | null; species: { common_name: string } | null; consortium: { id: string; name: string } | null; }

function Refloreste() {
  const { user } = useAuth();
  const [species, setSpecies] = useState<Species[]>([]);
  const [consortia, setConsortia] = useState<Consortium[]>([]);
  const [plantings, setPlantings] = useState<Planting[]>([]);

  const reload = async () => {
    if (!user) return;
    const [sp, co, pl] = await Promise.all([
      supabase.from("species").select("id, common_name, scientific_name").order("common_name"),
      supabase.from("consortia").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("plantings").select("id, planted_at, status, verification_method, notes, photo_url, species:species_id(common_name), consortium:consortium_id(id, name)").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);
    setSpecies(sp.data ?? []);
    setConsortia((co.data ?? []) as Consortium[]);
    setPlantings((pl.data ?? []) as unknown as Planting[]);
  };

  useEffect(() => { reload(); }, [user]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Refloreste e Ganhe</h1>
        <p className="mt-1 text-sm text-muted-foreground">Cadastre mudas e consórcios SAF. Após verificação, suas pontuações são confirmadas.</p>
      </header>

      <Tabs defaultValue="muda">
        <TabsList>
          <TabsTrigger value="muda"><Sprout className="mr-2 h-4 w-4" />Nova muda</TabsTrigger>
          <TabsTrigger value="consorcio"><TreePine className="mr-2 h-4 w-4" />Novo consórcio</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="muda" className="mt-6">
          <NewPlantingCard species={species} consortia={consortia} onCreated={reload} onSpeciesAdded={reload} />
        </TabsContent>

        <TabsContent value="consorcio" className="mt-6">
          <NewConsortiumCard onCreated={reload} />
        </TabsContent>

        <TabsContent value="historico" className="mt-6 space-y-6">
          <HistoryConsortia consortia={consortia} plantings={plantings} />
          <HistoryPlantings plantings={plantings} consortia={consortia} onChange={reload} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NewPlantingCard({ species, consortia, onCreated, onSpeciesAdded }: { species: Species[]; consortia: Consortium[]; onCreated: () => void; onSpeciesAdded: () => void; }) {
  const { user } = useAuth();
  const [speciesId, setSpeciesId] = useState<string>("");
  const [newSpecies, setNewSpecies] = useState("");
  const [consortiumId, setConsortiumId] = useState<string>("none");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [method, setMethod] = useState("photo");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(false);

  const addSpecies = async () => {
    if (!newSpecies.trim() || !user) return;
    setAdding(true);
    const { data, error } = await supabase.from("species").insert({ common_name: newSpecies.trim(), created_by: user.id }).select().single();
    setAdding(false);
    if (error) { toast.error("Não foi possível cadastrar espécie"); return; }
    toast.success("Espécie cadastrada");
    setNewSpecies("");
    setSpeciesId(data.id);
    onSpeciesAdded();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !speciesId) { toast.error("Selecione a espécie"); return; }
    setBusy(true);
    try {
      let photo_url: string | null = null;
      if (file) photo_url = await uploadMedia(file, user.id, "plantings");
      const { error } = await supabase.from("plantings").insert({
        user_id: user.id,
        species_id: speciesId,
        consortium_id: consortiumId === "none" ? null : consortiumId,
        planted_at: date,
        notes: notes || null,
        verification_method: method as "photo" | "time" | "hybrid",
        photo_url,
      });
      if (error) throw error;
      toast.success("Muda cadastrada! Aguardando verificação.");
      setSpeciesId(""); setConsortiumId("none"); setNotes(""); setFile(null);
      onCreated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao cadastrar");
    } finally { setBusy(false); }
  };

  return (
    <Card className="shadow-card border-border/60">
      <CardHeader><CardTitle className="font-display">Cadastrar muda</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Espécie</Label>
            <Select value={speciesId} onValueChange={setSpeciesId}>
              <SelectTrigger><SelectValue placeholder="Selecione a espécie" /></SelectTrigger>
              <SelectContent>
                {species.map((s) => (<SelectItem key={s.id} value={s.id}>{s.common_name}{s.scientific_name ? ` — ${s.scientific_name}` : ""}</SelectItem>))}
              </SelectContent>
            </Select>
            <div className="flex gap-2 pt-1">
              <Input placeholder="Não encontrou? Cadastrar nova espécie..." value={newSpecies} onChange={(e) => setNewSpecies(e.target.value)} />
              <Button type="button" variant="secondary" onClick={addSpecies} disabled={adding || !newSpecies.trim()}>
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Data do plantio</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Consórcio (opcional)</Label>
            <Select value={consortiumId} onValueChange={setConsortiumId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem consórcio</SelectItem>
                {consortia.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Método de verificação</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="photo">Foto / laudo</SelectItem>
                <SelectItem value="time">Tempo estimado</SelectItem>
                <SelectItem value="hybrid">Híbrido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Foto</Label>
            <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Observações</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Local, condições do solo, observações..." rows={3} />
          </div>

          <Button type="submit" disabled={busy} className="sm:col-span-2 bg-gradient-forest">
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Cadastrar muda
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function NewConsortiumCard({ onCreated }: { onCreated: () => void }) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [desc, setDesc] = useState("");
  const [speciesText, setSpeciesText] = useState("");
  const [method, setMethod] = useState("hybrid");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      let photo_url: string | null = null;
      if (file) photo_url = await uploadMedia(file, user.id, "consortia");
      const { error } = await supabase.from("consortia").insert({
        user_id: user.id, name, area_hectares: Number(area) || 0,
        description: desc || null, photo_url,
        species_list: speciesText.split(",").map((s) => s.trim()).filter(Boolean),
        verification_method: method as "photo" | "time" | "hybrid",
      });
      if (error) throw error;
      toast.success("Consórcio cadastrado!");
      setName(""); setArea(""); setDesc(""); setSpeciesText(""); setFile(null);
      onCreated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao cadastrar");
    } finally { setBusy(false); }
  };

  return (
    <Card className="shadow-card border-border/60">
      <CardHeader><CardTitle className="font-display">Cadastrar consórcio SAF</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Nome do consórcio</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Área (hectares)</Label>
            <Input type="number" step="0.01" min="0" value={area} onChange={(e) => setArea(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Método de verificação</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="photo">Foto / laudo</SelectItem>
                <SelectItem value="time">Tempo estimado</SelectItem>
                <SelectItem value="hybrid">Híbrido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Espécies (separadas por vírgula)</Label>
            <Input value={speciesText} onChange={(e) => setSpeciesText(e.target.value)} placeholder="Açaí, Cupuaçu, Andiroba..." />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Descrição</Label>
            <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Foto</Label>
            <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
          <Button type="submit" disabled={busy} className="sm:col-span-2 bg-gradient-forest">
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Cadastrar consórcio
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function HistoryConsortia({ consortia, plantings }: { consortia: Consortium[]; plantings: Planting[] }) {
  if (consortia.length === 0) return null;
  return (
    <Card className="shadow-card border-border/60">
      <CardHeader><CardTitle className="font-display">Meus consórcios</CardTitle></CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {consortia.map((c) => {
          const linked = plantings.filter((p) => p.consortium?.id === c.id);
          const speciesSet = new Set([...c.species_list, ...linked.map((p) => p.species?.common_name).filter(Boolean) as string[]]);
          return (
            <div key={c.id} className="rounded-xl border border-border/60 bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-display text-lg font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.area_hectares} ha · {methodLabel(c.verification_method)}</div>
                </div>
                <StatusBadge status={c.status} />
              </div>
              {c.description && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{c.description}</p>}
              <div className="mt-3 flex flex-wrap gap-1">
                {[...speciesSet].slice(0, 6).map((s) => (
                  <span key={s} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{s}</span>
                ))}
              </div>
              <div className="mt-3 text-xs text-muted-foreground">{linked.length} muda(s) vinculadas</div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function HistoryPlantings({ plantings, consortia, onChange }: { plantings: Planting[]; consortia: Consortium[]; onChange: () => void }) {
  const link = async (plantingId: string, value: string) => {
    const consortiumId = value === "none" ? null : value;
    const { error } = await supabase.from("plantings").update({ consortium_id: consortiumId }).eq("id", plantingId);
    if (error) toast.error("Não foi possível atualizar"); else { toast.success("Vínculo atualizado"); onChange(); }
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from("plantings").delete().eq("id", id);
    if (error) toast.error("Não foi possível excluir"); else { toast.success("Muda removida"); onChange(); }
  };
  return (
    <Card className="shadow-card border-border/60">
      <CardHeader><CardTitle className="font-display">Minhas mudas</CardTitle></CardHeader>
      <CardContent>
        {plantings.length === 0 ? (
          <EmptyState icon={<Sprout className="h-10 w-10" />} title="Você ainda não cadastrou mudas" />
        ) : (
          <ul className="divide-y divide-border/60">
            {plantings.map((p) => (
              <li key={p.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{p.species?.common_name ?? "Muda"}</div>
                  <div className="text-xs text-muted-foreground">
                    {ptDate(p.planted_at)} · {methodLabel(p.verification_method)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={p.consortium?.id ?? "none"} onValueChange={(v) => link(p.id, v)}>
                    <SelectTrigger className="h-8 w-44 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem consórcio</SelectItem>
                      {consortia.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <StatusBadge status={p.status} />
                  <Button size="icon" variant="ghost" onClick={() => remove(p.id)} aria-label="Remover">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
