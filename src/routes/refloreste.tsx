import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import type { Database } from "@/integrations/supabase/types";
import { uploadMedia } from "@/lib/upload";
import { methodLabel, ptDate } from "@/lib/format";
import { Droplets, Info, Leaf, Loader2, Plus, Sprout, TreePine, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/refloreste")({
  component: () => (
    <AuthGuard>
      <AppShell>
        <Refloreste />
      </AppShell>
    </AuthGuard>
  ),
});

type SpeciesWithCo2 = Database["public"]["Views"]["species_with_co2"]["Row"];
type Co2Category = Database["public"]["Tables"]["species_co2_categories"]["Row"];
type ConsortiumRow = Database["public"]["Tables"]["consortia"]["Row"];
type ConsortiumItemRow = Database["public"]["Tables"]["consortium_items"]["Row"];
type WaterBalanceRow = Database["public"]["Views"]["consortia_water_balance"]["Row"];
type EnvironmentRow = Database["public"]["Views"]["consortia_environment_dashboard"]["Row"];

type Planting = {
  id: string;
  planted_at: string;
  status: string;
  verification_method: string;
  notes: string | null;
  photo_url: string | null;
  species: { common_name: string | null } | null;
  consortium: { id: string; name: string } | null;
};

type ConsortiumItem = ConsortiumItemRow & {
  species: SpeciesWithCo2 | null;
};

type Consortium = ConsortiumRow & {
  items: ConsortiumItem[];
  environment: EnvironmentRow | null;
  waterBalance: WaterBalanceRow | null;
};

type SpeciesDraft = {
  commonName: string;
  categoryId: string;
};

type ConsortiumDraftItem = {
  localId: string;
  speciesId: string;
  quantity: string;
};

const CATEGORY_GUIDE = [
  {
    slug: "arborea-climax",
    title: "Arbórea Clímax",
    body: "Árvores altas, madeira densa e crescimento mais lento.",
  },
  {
    slug: "arborea-pioneira",
    title: "Arbórea Pioneira",
    body: "Árvores de crescimento rápido, comuns no início da recuperação da área.",
  },
  {
    slug: "palmeiras",
    title: "Palmeiras",
    body: "Espécies como açaí, buriti e pupunha, com estipe fibroso.",
  },
  {
    slug: "arbustiva",
    title: "Arbustiva",
    body: "Espécies menores, com múltiplos caules lenhosos.",
  },
  {
    slug: "herbacea",
    title: "Herbácea",
    body: "Plantas de pequeno porte e tecido não lenhoso.",
  },
  {
    slug: "nao-sei-classificar",
    title: "Não sei classificar",
    body: "Use quando houver dúvida. O cadastro funciona, mas a estimativa ambiental fica pendente.",
  },
];

function getSpeciesLabel(species: SpeciesWithCo2 | null | undefined) {
  if (!species?.common_name) return "Espécie";
  return species.scientific_name
    ? `${species.common_name} - ${species.scientific_name}`
    : species.common_name;
}

function getCategoryTone(categorySlug: string | null | undefined) {
  if (categorySlug === "nao-sei-classificar") return "bg-muted text-muted-foreground";
  if (categorySlug === "arborea-climax") return "bg-primary/10 text-primary";
  if (categorySlug === "arborea-pioneira") return "bg-leaf/20 text-primary";
  if (categorySlug === "palmeiras") return "bg-secondary text-secondary-foreground";
  return "bg-accent text-accent-foreground";
}

function formatKg(value: number | null | undefined) {
  if (value === null || value === undefined) return "0";
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(value);
}

function formatLiters(value: number | null | undefined) {
  if (value === null || value === undefined) return "0";
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(value);
}

function getCurrentMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

function Refloreste() {
  const { user } = useAuth();
  const [species, setSpecies] = useState<SpeciesWithCo2[]>([]);
  const [categories, setCategories] = useState<Co2Category[]>([]);
  const [consortia, setConsortia] = useState<Consortium[]>([]);
  const [plantings, setPlantings] = useState<Planting[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    if (!user) return;
    setLoading(true);

    const [speciesRes, categoriesRes, consortiaRes, plantingsRes, environmentRes, waterRes] =
      await Promise.all([
        supabase
          .from("species_with_co2")
          .select("*")
          .order("common_name"),
        supabase
          .from("species_co2_categories")
          .select("*")
          .eq("is_user_selectable", true)
          .order("sort_order"),
        supabase
          .from("consortia")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("plantings")
          .select(
            "id, planted_at, status, verification_method, notes, photo_url, species:species_id(common_name), consortium:consortium_id(id, name)",
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("consortia_environment_dashboard")
          .select("*")
          .eq("user_id", user.id),
        supabase
          .from("consortia_water_balance")
          .select("*")
          .eq("user_id", user.id),
      ]);

    if (speciesRes.error || categoriesRes.error || consortiaRes.error || plantingsRes.error) {
      toast.error("Não foi possível carregar seus registros ambientais.");
      setLoading(false);
      return;
    }

    const consortiumIds = (consortiaRes.data ?? []).map((row) => row.id);
    const itemsRes = consortiumIds.length
      ? await supabase
          .from("consortium_items")
          .select("*")
          .in("consortium_id", consortiumIds)
          .order("created_at")
      : { data: [], error: null };

    if (itemsRes.error) {
      toast.error("Não foi possível carregar a composição dos consórcios.");
      setLoading(false);
      return;
    }

    const speciesRows = speciesRes.data ?? [];
    const speciesMap = new Map(speciesRows.map((row) => [row.id ?? "", row]));
    const envMap = new Map((environmentRes.data ?? []).map((row) => [row.consortium_id ?? "", row]));

    const waterLatestMap = new Map<string, WaterBalanceRow>();
    for (const row of waterRes.data ?? []) {
      if (!row.consortium_id) continue;
      const current = waterLatestMap.get(row.consortium_id);
      if (!current || (row.reference_month ?? "") > (current.reference_month ?? "")) {
        waterLatestMap.set(row.consortium_id, row);
      }
    }

    const itemsByConsortium = new Map<string, ConsortiumItem[]>();
    for (const item of itemsRes.data ?? []) {
      const enriched: ConsortiumItem = {
        ...item,
        species: item.species_id ? speciesMap.get(item.species_id) ?? null : null,
      };
      const list = itemsByConsortium.get(item.consortium_id) ?? [];
      list.push(enriched);
      itemsByConsortium.set(item.consortium_id, list);
    }

    setSpecies(speciesRows);
    setCategories(categoriesRes.data ?? []);
    setPlantings((plantingsRes.data ?? []) as unknown as Planting[]);
    setConsortia(
      (consortiaRes.data ?? []).map((row) => ({
        ...row,
        items: itemsByConsortium.get(row.id) ?? [],
        environment: envMap.get(row.id) ?? null,
        waterBalance: waterLatestMap.get(row.id) ?? null,
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    void reload();
  }, [user]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Refloreste e Ganhe</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Registre mudas e consórcios SAF, acompanhe carbono estimado e controle o uso de água.
        </p>
      </header>

      <Tabs defaultValue="muda">
        <TabsList>
          <TabsTrigger value="muda">
            <Sprout className="mr-2 h-4 w-4" />
            Nova muda
          </TabsTrigger>
          <TabsTrigger value="consorcio">
            <TreePine className="mr-2 h-4 w-4" />
            Novo consórcio
          </TabsTrigger>
          <TabsTrigger value="agua">
            <Droplets className="mr-2 h-4 w-4" />
            Controle de água
          </TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="muda" className="mt-6">
          <NewPlantingCard
            categories={categories}
            consortia={consortia}
            onCreated={reload}
            species={species}
          />
        </TabsContent>

        <TabsContent value="consorcio" className="mt-6">
          <NewConsortiumCard
            categories={categories}
            onCreated={reload}
            species={species}
          />
        </TabsContent>

        <TabsContent value="agua" className="mt-6">
          <WaterLogCard consortia={consortia} onCreated={reload} />
        </TabsContent>

        <TabsContent value="historico" className="mt-6 space-y-6">
          {loading ? (
            <Card className="shadow-card border-border/60">
              <CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando histórico ambiental...
              </CardContent>
            </Card>
          ) : (
            <>
              <HistoryConsortia consortia={consortia} plantings={plantings} />
              <HistoryPlantings consortia={consortia} onChange={reload} plantings={plantings} />
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CategoryHelp({ categories }: { categories: Co2Category[] }) {
  const visibleCategories = CATEGORY_GUIDE.filter((guide) =>
    categories.some((category) => category.slug === guide.slug),
  );

  return (
    <Alert className="border-border/60 bg-muted/40">
      <Leaf className="h-4 w-4" />
      <AlertTitle>Ajuda para classificar espécies</AlertTitle>
      <AlertDescription className="space-y-1">
        {visibleCategories.map((guide) => (
          <p key={guide.slug}>
            <span className="font-medium">{guide.title}:</span> {guide.body}
          </p>
        ))}
      </AlertDescription>
    </Alert>
  );
}

function InlineSpeciesCreator({
  categories,
  onCreated,
  disabled = false,
}: {
  categories: Co2Category[];
  onCreated: (createdId: string) => Promise<void> | void;
  disabled?: boolean;
}) {
  const { user } = useAuth();
  const [draft, setDraft] = useState<SpeciesDraft>({
    commonName: "",
    categoryId: categories[0]?.id ?? "",
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!draft.categoryId && categories[0]?.id) {
      setDraft((current) => ({ ...current, categoryId: categories[0]?.id ?? "" }));
    }
  }, [categories, draft.categoryId]);

  const submit = async () => {
    if (!user || !draft.commonName.trim() || !draft.categoryId || disabled) return;
    setBusy(true);

    const { data, error } = await supabase
      .from("species")
      .insert({
        common_name: draft.commonName.trim(),
        created_by: user.id,
        is_custom: true,
        co2_category_id: draft.categoryId,
      })
      .select("id")
      .single();

    setBusy(false);

    if (error || !data) {
      toast.error("Não foi possível cadastrar a espécie.");
      return;
    }

    toast.success("Espécie cadastrada com categoria ambiental.");
    setDraft({ commonName: "", categoryId: categories[0]?.id ?? "" });
    await onCreated(data.id);
  };

  return (
    <div className={`space-y-3 rounded-xl border border-dashed border-border/70 p-4 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr_auto]">
        <Input
          placeholder="Cadastrar nova espécie..."
          value={draft.commonName}
          disabled={disabled}
          onChange={(event) =>
            setDraft((current) => ({ ...current, commonName: event.target.value }))
          }
        />
        <Select
          value={draft.categoryId}
          disabled={disabled}
          onValueChange={(value) => setDraft((current) => ({ ...current, categoryId: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Categoria ambiental" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="secondary"
          disabled={busy || !draft.commonName.trim() || !draft.categoryId || disabled}
          onClick={() => void submit()}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {disabled 
          ? "Desabilitado: você já selecionou uma espécie acima." 
          : "Espécies personalizadas ficam visíveis só para você. Moderadores e admins ainda podem vê-las para revisar registros pendentes."}
      </p>
      {!disabled && <CategoryHelp categories={categories} />}
    </div>
  );
}

function NewPlantingCard({
  categories,
  consortia,
  onCreated,
  species,
}: {
  categories: Co2Category[];
  consortia: Consortium[];
  onCreated: () => Promise<void> | void;
  species: SpeciesWithCo2[];
}) {
  const { user } = useAuth();
  const [speciesId, setSpeciesId] = useState<string>("");
  const [consortiumId, setConsortiumId] = useState<string>("none");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [method, setMethod] = useState<Database["public"]["Enums"]["verification_method"]>("photo");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !speciesId) {
      toast.error("Selecione a espécie da muda.");
      return;
    }

    setBusy(true);

    try {
      let photoUrl: string | null = null;
      if (file) photoUrl = await uploadMedia(file, user.id, "plantings");

      const { error } = await supabase.from("plantings").insert({
        user_id: user.id,
        species_id: speciesId,
        consortium_id: consortiumId === "none" ? null : consortiumId,
        planted_at: date,
        notes: notes || null,
        verification_method: method,
        photo_url: photoUrl,
      });

      if (error) throw error;

      toast.success("Muda cadastrada com sucesso.");
      setSpeciesId("");
      setConsortiumId("none");
      setNotes("");
      setFile(null);
      await onCreated();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao cadastrar a muda.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="shadow-card border-border/60">
      <CardHeader>
        <CardTitle className="font-display">Cadastro simples de muda</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-border/60 bg-muted/40">
          <Sprout className="h-4 w-4" />
          <AlertTitle>Fluxo rápido</AlertTitle>
          <AlertDescription>
            Use esta opção para registrar plantios isolados ou para anexar uma muda a um consórcio existente.
          </AlertDescription>
        </Alert>

        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Espécie</Label>
            <Select value={speciesId} onValueChange={setSpeciesId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a espécie da muda" />
              </SelectTrigger>
              <SelectContent>
                {species.map((item) => (
                  <SelectItem key={item.id ?? item.common_name ?? "species"} value={item.id ?? ""}>
                    {getSpeciesLabel(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <InlineSpeciesCreator
              categories={categories}
              disabled={!!speciesId}
              onCreated={async (createdId) => {
                setSpeciesId(createdId);
                await onCreated();
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Data do plantio</Label>
            <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Consórcio (opcional)</Label>
            <Select value={consortiumId} onValueChange={setConsortiumId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem consórcio</SelectItem>
                {consortia.map((consortium) => (
                  <SelectItem key={consortium.id} value={consortium.id}>
                    {consortium.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Método de verificação</Label>
            <Select value={method} onValueChange={(value) => setMethod(value as typeof method)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="photo">Foto / laudo</SelectItem>
                <SelectItem value="time">Tempo estimado</SelectItem>
                <SelectItem value="hybrid">Híbrido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Foto</Label>
            <Input type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Observações</Label>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Local do plantio, observações, condições do solo..."
              rows={3}
            />
          </div>

          <Button type="submit" disabled={busy} className="sm:col-span-2 bg-gradient-forest">
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cadastrar muda
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function NewConsortiumCard({
  categories,
  onCreated,
  species,
}: {
  categories: Co2Category[];
  onCreated: () => Promise<void> | void;
  species: SpeciesWithCo2[];
}) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [method, setMethod] = useState<Database["public"]["Enums"]["verification_method"]>("hybrid");
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<ConsortiumDraftItem[]>([
    { localId: crypto.randomUUID(), speciesId: "", quantity: "1" },
    { localId: crypto.randomUUID(), speciesId: "", quantity: "1" },
  ]);
  const [busy, setBusy] = useState(false);

  const totalSeedlings = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const distinctSpecies = new Set(items.map((item) => item.speciesId).filter(Boolean)).size;
  const lowDiversity = distinctSpecies === 2;

  const updateItem = (localId: string, patch: Partial<ConsortiumDraftItem>) => {
    setItems((current) =>
      current.map((item) => (item.localId === localId ? { ...item, ...patch } : item)),
    );
  };

  const addItemRow = () => {
    setItems((current) => [
      ...current,
      { localId: crypto.randomUUID(), speciesId: "", quantity: "1" },
    ]);
  };

  const removeItemRow = (localId: string) => {
    setItems((current) => current.filter((item) => item.localId !== localId));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    const normalizedItems = items
      .map((item) => ({
        speciesId: item.speciesId,
        quantity: Number(item.quantity),
      }))
      .filter((item) => item.speciesId && item.quantity > 0);

    const normalizedDistinctSpecies = new Set(normalizedItems.map((item) => item.speciesId)).size;
    const normalizedTotal = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);

    if (!name.trim()) {
      toast.error("Informe o nome do consórcio.");
      return;
    }
    if (normalizedTotal < 3) {
      toast.error("Um consórcio precisa ter pelo menos 3 mudas.");
      return;
    }
    if (normalizedDistinctSpecies < 2) {
      toast.error("Um consórcio precisa ter pelo menos 2 espécies diferentes.");
      return;
    }

    setBusy(true);

    try {
      let photoUrl: string | null = null;
      if (file) photoUrl = await uploadMedia(file, user.id, "consortia");

      const fallbackSpeciesList = normalizedItems
        .map((item) => species.find((entry) => entry.id === item.speciesId)?.common_name)
        .filter(Boolean) as string[];

      const { data: consortium, error: consortiumError } = await supabase
        .from("consortia")
        .insert({
          user_id: user.id,
          name: name.trim(),
          description: description || null,
          photo_url: photoUrl,
          species_list: [...new Set(fallbackSpeciesList)],
          verification_method: method,
          measurement_mode: "seedling_quantity",
        })
        .select("id")
        .single();

      if (consortiumError || !consortium) {
        throw consortiumError ?? new Error("Não foi possível criar o consórcio.");
      }

      const { error: itemsError } = await supabase.from("consortium_items").insert(
        normalizedItems.map((item) => ({
          consortium_id: consortium.id,
          species_id: item.speciesId,
          quantity: item.quantity,
        })),
      );

      if (itemsError) {
        await supabase.from("consortia").delete().eq("id", consortium.id);
        throw itemsError;
      }

      toast.success("Consórcio cadastrado com composição ambiental.");
      setName("");
      setDescription("");
      setMethod("hybrid");
      setFile(null);
      setItems([
        { localId: crypto.randomUUID(), speciesId: "", quantity: "1" },
        { localId: crypto.randomUUID(), speciesId: "", quantity: "1" },
      ]);
      await onCreated();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao cadastrar o consórcio.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="shadow-card border-border/60">
      <CardHeader>
        <CardTitle className="font-display">Cadastro principal de consórcio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-primary/20 bg-secondary/40">
          <TreePine className="h-4 w-4" />
          <AlertTitle>Regras mínimas de sustentabilidade</AlertTitle>
          <AlertDescription>
            O consórcio é o fluxo principal do sistema. Ele precisa ter pelo menos 3 mudas e 2 espécies diferentes.
          </AlertDescription>
        </Alert>

        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Nome do consórcio</Label>
              <Input value={name} onChange={(event) => setName(event.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Método de verificação</Label>
              <Select value={method} onValueChange={(value) => setMethod(value as typeof method)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="photo">Foto / laudo</SelectItem>
                  <SelectItem value="time">Tempo estimado</SelectItem>
                  <SelectItem value="hybrid">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Foto</Label>
              <Input type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Descrição</Label>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                placeholder="Descreva o sistema, o manejo e os objetivos do consórcio."
              />
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-border/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-medium">Composição por espécies</h3>
                <p className="text-sm text-muted-foreground">
                  Defina as espécies e quantidades. O sistema calcula carbono e referência hídrica a partir disso.
                </p>
              </div>
              <Button type="button" variant="outline" onClick={addItemRow}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar espécie
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={item.localId} className="grid gap-3 rounded-xl border border-border/50 p-3 sm:grid-cols-[1.6fr_0.6fr_auto]">
                <div className="space-y-2">
                  <Label>Espécie {index + 1}</Label>
                  <Select value={item.speciesId} onValueChange={(value) => updateItem(item.localId, { speciesId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma espécie" />
                    </SelectTrigger>
                    <SelectContent>
                      {species.map((entry) => (
                        <SelectItem key={entry.id ?? entry.common_name ?? "species"} value={entry.id ?? ""}>
                          {getSpeciesLabel(entry)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={item.quantity}
                    onChange={(event) => updateItem(item.localId, { quantity: event.target.value })}
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItemRow(item.localId)}
                    disabled={items.length <= 2}
                    aria-label="Remover espécie"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <InlineSpeciesCreator categories={categories} onCreated={onCreated} />

            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard
                title="Total de mudas"
                value={String(totalSeedlings)}
                hint="Mínimo obrigatório: 3"
              />
              <MetricCard
                title="Espécies diferentes"
                value={String(distinctSpecies)}
                hint="Mínimo obrigatório: 2"
              />
              <MetricCard
                title="Diversidade"
                value={lowDiversity ? "Mínima" : distinctSpecies > 2 ? "Boa" : "Insuficiente"}
                hint={lowDiversity ? "Considere incluir mais espécies." : "Maior variedade aumenta resiliência."}
              />
            </div>

            {lowDiversity && (
              <Alert className="border-sun/30 bg-sun/10">
                <Info className="h-4 w-4" />
                <AlertTitle>Diversidade baixa</AlertTitle>
                <AlertDescription>
                  O consórcio atende o mínimo, mas mais espécies podem aumentar a resiliência e o impacto ambiental.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Button type="submit" disabled={busy} className="bg-gradient-forest">
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cadastrar consórcio
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function WaterLogCard({
  consortia,
  onCreated,
}: {
  consortia: Consortium[];
  onCreated: () => Promise<void> | void;
}) {
  const { user } = useAuth();
  const [consortiumId, setConsortiumId] = useState<string>(consortia[0]?.id ?? "");
  const [recordedAt, setRecordedAt] = useState(getCurrentMonthStart());
  const [waterLiters, setWaterLiters] = useState("");
  const [irrigationMethod, setIrrigationMethod] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!consortiumId && consortia[0]?.id) setConsortiumId(consortia[0].id);
  }, [consortia, consortiumId]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !consortiumId || !waterLiters) {
      toast.error("Informe consórcio e litros utilizados.");
      return;
    }

    setBusy(true);

    const { error } = await supabase.from("water_logs").insert({
      user_id: user.id,
      consortium_id: consortiumId,
      recorded_at: recordedAt,
      water_liters: Number(waterLiters),
      irrigation_method: irrigationMethod || null,
      source_type: sourceType || null,
      notes: notes || null,
    });

    setBusy(false);

    if (error) {
      toast.error("Não foi possível registrar o uso de água.");
      return;
    }

    toast.success("Uso de água registrado.");
    setWaterLiters("");
    setIrrigationMethod("");
    setSourceType("");
    setNotes("");
    await onCreated();
  };

  return (
    <Card className="shadow-card border-border/60">
      <CardHeader>
        <CardTitle className="font-display">Controle de água</CardTitle>
      </CardHeader>
      <CardContent>
        {consortia.length === 0 ? (
          <EmptyState
            icon={<Droplets className="h-10 w-10" />}
            title="Crie um consórcio para acompanhar água"
            description="O controle de água foi pensado para o consórcio, onde a comparação com a referência ambiental fica mais útil."
          />
        ) : (
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Consórcio</Label>
              <Select value={consortiumId} onValueChange={setConsortiumId}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha o consórcio" />
                </SelectTrigger>
                <SelectContent>
                  {consortia.map((consortium) => (
                    <SelectItem key={consortium.id} value={consortium.id}>
                      {consortium.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data do registro</Label>
              <Input type="date" value={recordedAt} onChange={(event) => setRecordedAt(event.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Litros usados</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={waterLiters}
                onChange={(event) => setWaterLiters(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Método de irrigação</Label>
              <Input
                value={irrigationMethod}
                onChange={(event) => setIrrigationMethod(event.target.value)}
                placeholder="Gotejamento, manual, aspersao..."
              />
            </div>

            <div className="space-y-2">
              <Label>Fonte de água</Label>
              <Input
                value={sourceType}
                onChange={(event) => setSourceType(event.target.value)}
                placeholder="Chuva, caixa, poço, igarape..."
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Observações</Label>
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={2}
                placeholder="Condições climáticas, turno da irrigação ou observações importantes."
              />
            </div>

            <Button type="submit" disabled={busy} className="sm:col-span-2 bg-gradient-forest">
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrar água
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function MetricCard({ hint, title, value }: { hint: string; title: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{title}</div>
      <div className="mt-2 text-2xl font-display font-semibold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

function HistoryConsortia({
  consortia,
  plantings,
}: {
  consortia: Consortium[];
  plantings: Planting[];
}) {
  if (consortia.length === 0) return null;

  return (
    <Card className="shadow-card border-border/60">
      <CardHeader>
        <CardTitle className="font-display">Meus consórcios</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-2">
        {consortia.map((consortium) => {
          const linkedPlantings = plantings.filter((planting) => planting.consortium?.id === consortium.id);
          const speciesCount = consortium.items.length;
          const lowDiversity = speciesCount > 0 && speciesCount <= 2;
          const isLegacy = consortium.measurement_mode === "legacy_area" || consortium.items.length === 0;

          return (
            <div key={consortium.id} className="rounded-xl border border-border/60 bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-display text-lg font-semibold">{consortium.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {methodLabel(consortium.verification_method)} ·{" "}
                    {isLegacy
                      ? `${consortium.area_hectares ?? 0} ha (legado)`
                      : `${consortium.total_seedlings} mudas planejadas`}
                  </div>
                </div>
                <StatusBadge status={consortium.status} />
              </div>

              {consortium.description && (
                <p className="mt-2 text-sm text-muted-foreground">{consortium.description}</p>
              )}

              {isLegacy ? (
                <Alert className="mt-4 border-border/60 bg-muted/30">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Consórcio legado</AlertTitle>
                  <AlertDescription>
                    Este registro veio do modelo antigo por hectare. Ele continua visível, mas os novos cálculos ambientais funcionam melhor em consórcios por quantidade de mudas.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Composição do consórcio
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {consortium.items.map((item) => (
                        <span
                          key={item.id}
                          className="rounded-full border border-border/60 px-3 py-1 text-xs"
                        >
                          {item.quantity}x {item.species?.common_name ?? item.custom_species_name ?? "Espécie"}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <MetricCard
                      title="CO2 estimado"
                      value={`${formatKg(consortium.environment?.estimated_co2_avg_kg_year)} kg/ano`}
                      hint={`Faixa: ${formatKg(consortium.environment?.estimated_co2_min_kg_year)} a ${formatKg(consortium.environment?.estimated_co2_max_kg_year)} kg`}
                    />
                    <MetricCard
                      title="Referência de água"
                      value={`${formatLiters(consortium.environment?.estimated_water_avg_liters_month)} L/mês`}
                      hint={`Faixa: ${formatLiters(consortium.environment?.estimated_water_min_liters_month)} a ${formatLiters(consortium.environment?.estimated_water_max_liters_month)} L`}
                    />
                    <MetricCard
                      title="Água usada"
                      value={`${formatLiters(consortium.waterBalance?.actual_water_liters_month)} L/mês`}
                      hint={
                        consortium.waterBalance?.reference_month
                          ? `Registro de ${ptDate(consortium.waterBalance.reference_month)}`
                          : "Sem registro mensal"
                      }
                    />
                    <MetricCard
                      title="Economia estimada"
                      value={`${formatLiters(consortium.waterBalance?.estimated_water_savings_liters_month)} L/mês`}
                      hint={`Excesso atual: ${formatLiters(consortium.waterBalance?.estimated_water_excess_liters_month)} L`}
                    />
                  </div>

                  {lowDiversity && (
                    <Alert className="border-sun/30 bg-sun/10">
                      <Info className="h-4 w-4" />
                      <AlertTitle>Diversidade mínima</AlertTitle>
                      <AlertDescription>
                        O consórcio cumpre o mínimo, mas incluir mais espécies pode melhorar resiliência, água e biodiversidade.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              <div className="mt-4 text-xs text-muted-foreground">
                {linkedPlantings.length} muda(s) individuais vinculadas
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function HistoryPlantings({
  consortia,
  onChange,
  plantings,
}: {
  consortia: Consortium[];
  onChange: () => Promise<void> | void;
  plantings: Planting[];
}) {
  const link = async (plantingId: string, value: string) => {
    const consortiumId = value === "none" ? null : value;
    const { error } = await supabase.from("plantings").update({ consortium_id: consortiumId }).eq("id", plantingId);
    if (error) {
      toast.error("Não foi possível atualizar o vínculo da muda.");
      return;
    }
    toast.success("Vínculo da muda atualizado.");
    await onChange();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("plantings").delete().eq("id", id);
    if (error) {
      toast.error("Não foi possível excluir a muda.");
      return;
    }
    toast.success("Muda removida.");
    await onChange();
  };

  return (
    <Card className="shadow-card border-border/60">
      <CardHeader>
        <CardTitle className="font-display">Minhas mudas</CardTitle>
      </CardHeader>
      <CardContent>
        {plantings.length === 0 ? (
          <EmptyState icon={<Sprout className="h-10 w-10" />} title="Você ainda não cadastrou mudas" />
        ) : (
          <ul className="divide-y divide-border/60">
            {plantings.map((planting) => (
              <li
                key={planting.id}
                className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {planting.species?.common_name ?? "Muda"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {ptDate(planting.planted_at)} · {methodLabel(planting.verification_method)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={planting.consortium?.id ?? "none"} onValueChange={(value) => void link(planting.id, value)}>
                    <SelectTrigger className="h-8 w-52 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem consórcio</SelectItem>
                      {consortia.map((consortium) => (
                        <SelectItem key={consortium.id} value={consortium.id}>
                          {consortium.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <StatusBadge status={planting.status} />
                  <Button size="icon" variant="ghost" onClick={() => void remove(planting.id)} aria-label="Remover muda">
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
