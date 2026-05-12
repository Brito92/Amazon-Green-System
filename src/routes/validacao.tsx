import { createFileRoute } from "@tanstack/react-router";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AuthGuard } from "@/components/AuthGuard";
import { AppShell } from "@/components/AppShell";
import { BlockchainBadge } from "@/components/BlockchainBadge";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { mineBlockchain, registerBlockchainEvent, shortHash, type BlockchainRecord } from "@/lib/blockchain";
import { methodLabel, ptDate } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import {
  Blocks,
  Check,
  Info,
  Loader2,
  ShieldCheck,
  Sprout,
  TreePine,
  X,
} from "lucide-react";

export const Route = createFileRoute("/validacao")({
  component: () => (
    <AuthGuard>
      <AppShell>
        <Validacao />
      </AppShell>
    </AuthGuard>
  ),
});

type UserRole = Database["public"]["Enums"]["user_role"];

type PlantingItem = {
  id: string;
  user_id: string;
  planted_at: string;
  status: string;
  verification_method: string;
  photo_url: string | null;
  notes: string | null;
  custom_species_name: string | null;
  species: { common_name: string | null } | null;
};

type ConsortiumItem = Database["public"]["Tables"]["consortia"]["Row"] & {
  items?: Array<{
    quantity: number;
    custom_species_name: string | null;
    species: { common_name: string | null } | null;
  }>;
  environment?: Database["public"]["Views"]["consortia_environment_dashboard"]["Row"] | null;
};

type PendingPlanting = PlantingItem & {
  profile?: { display_name: string } | null;
};

type PendingConsortium = ConsortiumItem & {
  profile?: { display_name: string } | null;
};

type ReviewItem = {
  id: string;
  type: "seedling" | "consortium";
  action: "verified" | "rejected";
  label: string;
} | null;

function formatKg(value: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(value ?? 0);
}

function buildRecordMap(records: BlockchainRecord[]) {
  return new Map(records.map((record) => [record.target_id, record]));
}

function Validacao() {
  const { user } = useAuth();
  const [plantings, setPlantings] = useState<PlantingItem[]>([]);
  const [consortia, setConsortia] = useState<ConsortiumItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>("user");
  const [registeringKey, setRegisteringKey] = useState<string | null>(null);
  const [mining, setMining] = useState(false);
  const [plantingRecords, setPlantingRecords] = useState<Map<string, BlockchainRecord>>(new Map());
  const [consortiumRecords, setConsortiumRecords] = useState<Map<string, BlockchainRecord>>(new Map());

  const isModerator = role === "admin" || role === "moderator";

  const load = async () => {
    if (!user) return;
    setLoading(true);

    const [plantingsRes, consortiaRes, profileRes, environmentRes] = await Promise.all([
      supabase
        .from("plantings")
        .select(
          "id, user_id, planted_at, status, verification_method, photo_url, notes, custom_species_name, species:species_id(common_name)",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("consortia")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("role").eq("user_id", user.id).maybeSingle(),
      supabase.from("consortia_environment_dashboard").select("*").eq("user_id", user.id),
    ]);

    const consortiumIds = (consortiaRes.data ?? []).map((row) => row.id);
    const [itemsRes, plantingChainRes, consortiumChainRes] = await Promise.all([
      consortiumIds.length
        ? supabase
            .from("consortium_items")
            .select("consortium_id, quantity, custom_species_name, species:species_id(common_name)")
            .in("consortium_id", consortiumIds)
        : Promise.resolve({ data: [] as Array<any>, error: null }),
      supabase
        .from("blockchain_records_display")
        .select("*")
        .eq("target_type", "planting")
        .eq("event_type", "muda_validada")
        .order("created_at", { ascending: false }),
      supabase
        .from("blockchain_records_display")
        .select("*")
        .eq("target_type", "consortium")
        .eq("event_type", "consorcio_validado")
        .order("created_at", { ascending: false }),
    ]);

    const itemsMap = new Map<string, ConsortiumItem["items"]>();
    for (const item of itemsRes.data ?? []) {
      const list = itemsMap.get(item.consortium_id) ?? [];
      list.push({
        quantity: item.quantity,
        custom_species_name: item.custom_species_name,
        species: item.species as { common_name: string | null } | null,
      });
      itemsMap.set(item.consortium_id, list);
    }

    const environmentMap = new Map(
      (environmentRes.data ?? []).map((row) => [row.consortium_id ?? "", row]),
    );

    setPlantings((plantingsRes.data ?? []) as PlantingItem[]);
    setConsortia(
      ((consortiaRes.data ?? []) as ConsortiumItem[]).map((row) => ({
        ...row,
        items: itemsMap.get(row.id) ?? [],
        environment: environmentMap.get(row.id) ?? null,
      })),
    );
    setPlantingRecords(
      buildRecordMap((plantingChainRes.data ?? []) as unknown as BlockchainRecord[]),
    );
    setConsortiumRecords(
      buildRecordMap((consortiumChainRes.data ?? []) as unknown as BlockchainRecord[]),
    );
    if (profileRes.data?.role) setRole(profileRes.data.role);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, [user]);

  const plantingStats = useMemo(() => countByStatus(plantings), [plantings]);
  const consortiumStats = useMemo(() => countByStatus(consortia), [consortia]);

  const handleRegister = async (
    targetType: "planting" | "consortium",
    targetId: string,
    eventType: "muda_validada" | "consorcio_validado",
  ) => {
    const key = `${targetType}:${targetId}`;
    setRegisteringKey(key);
    try {
      await registerBlockchainEvent({ targetType, targetId, eventType });
      toast.success("Evento registrado na blockchain com sucesso.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao registrar evento.");
    } finally {
      setRegisteringKey(null);
    }
  };

  const handleMine = async () => {
    setMining(true);
    try {
      const result = await mineBlockchain();
      const block = result?.blockchain?.bloco;
      toast.success(
        block?.indice
          ? `Bloco #${block.indice} minerado com sucesso.`
          : "Registros pendentes processados com sucesso.",
      );
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao minerar bloco.");
    } finally {
      setMining(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold">Validação</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe o status dos registros e envie eventos verificados para a trilha blockchain.
        </p>
      </header>

      {isModerator && (
        <Card className="border-border/60 shadow-card">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-medium">Ferramentas de moderação</div>
              <div className="text-sm text-muted-foreground">
                Processar registros pendentes em bloco ajuda a atualizar o status minerado no app.
              </div>
            </div>
            <Button onClick={() => void handleMine()} disabled={mining} className="bg-gradient-forest">
              {mining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Blocks className="mr-2 h-4 w-4" />}
              Minerar bloco
            </Button>
          </CardContent>
        </Card>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        <SummaryCard
          icon={<Sprout className="h-5 w-5 text-primary" />}
          title="Mudas"
          stats={plantingStats}
        />
        <SummaryCard
          icon={<TreePine className="h-5 w-5 text-primary" />}
          title="Consórcios"
          stats={consortiumStats}
        />
      </section>

      <Tabs defaultValue="mudas">
        <TabsList>
          <TabsTrigger value="mudas">Mudas</TabsTrigger>
          <TabsTrigger value="consorcios">Consórcios</TabsTrigger>
          {isModerator && <TabsTrigger value="moderacao">Moderação</TabsTrigger>}
        </TabsList>

        <TabsContent value="mudas" className="mt-6">
          <Card className="border-border/60 shadow-card">
            <CardContent className="p-0">
              {loading ? (
                <LoadingState />
              ) : plantings.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={<ShieldCheck className="h-10 w-10" />}
                    title="Nenhuma muda registrada"
                    description="Quando você registrar mudas simples, elas aparecerão aqui."
                  />
                </div>
              ) : (
                <ul className="divide-y divide-border/60">
                  {plantings.map((planting) => {
                    const record = plantingRecords.get(planting.id);
                    const canRegister = planting.status === "verified" && !record;
                    const label = planting.species?.common_name ?? planting.custom_species_name ?? "Muda";
                    const actionKey = `planting:${planting.id}`;

                    return (
                      <li key={planting.id} className="flex flex-col gap-3 px-4 py-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 space-y-1">
                            <div className="truncate text-sm font-medium">{label}</div>
                            <div className="text-xs text-muted-foreground">
                              Plantio em {ptDate(planting.planted_at)} · {methodLabel(planting.verification_method)}
                            </div>
                            {planting.notes && (
                              <div className="text-xs text-muted-foreground">{planting.notes}</div>
                            )}
                          </div>
                          <StatusBadge status={planting.status} />
                        </div>

                        <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-secondary/20 p-3">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-wrap items-center gap-2">
                              <BlockchainBadge record={record} />
                              {record?.external_hash && (
                                <span className="text-xs text-muted-foreground">
                                  Hash: {shortHash(record.external_hash)}
                                </span>
                              )}
                            </div>
                            {canRegister && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={registeringKey === actionKey}
                                onClick={() =>
                                  void handleRegister("planting", planting.id, "muda_validada")
                                }
                              >
                                {registeringKey === actionKey && (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Registrar na blockchain
                              </Button>
                            )}
                          </div>
                          {planting.status !== "verified" && (
                            <div className="text-xs text-muted-foreground">
                              O registro blockchain é liberado após a validação da muda.
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consorcios" className="mt-6">
          <Card className="border-border/60 shadow-card">
            <CardContent className="p-0">
              {loading ? (
                <LoadingState />
              ) : consortia.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={<ShieldCheck className="h-10 w-10" />}
                    title="Nenhum consórcio registrado"
                    description="Seus consórcios validados e pendentes aparecem aqui."
                  />
                </div>
              ) : (
                <ul className="divide-y divide-border/60">
                  {consortia.map((consortium) => {
                    const record = consortiumRecords.get(consortium.id);
                    const isLegacy =
                      consortium.measurement_mode === "legacy_area" ||
                      (consortium.items?.length ?? 0) === 0;
                    const canRegister = consortium.status === "verified" && !record;
                    const actionKey = `consortium:${consortium.id}`;

                    return (
                      <li key={consortium.id} className="flex flex-col gap-3 px-4 py-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 space-y-1">
                            <div className="truncate text-sm font-medium">{consortium.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {isLegacy
                                ? `${consortium.area_hectares ?? 0} ha (legado)`
                                : `${consortium.total_seedlings} mudas planejadas`}
                              {" · "}
                              {methodLabel(consortium.verification_method)}
                              {" · "}
                              {ptDate(consortium.created_at)}
                            </div>
                            {!isLegacy && consortium.environment && (
                              <div className="text-xs text-muted-foreground">
                                CO2 médio estimado:{" "}
                                {formatKg(consortium.environment.estimated_co2_avg_kg_year)} kg/ano
                              </div>
                            )}
                          </div>
                          <StatusBadge status={consortium.status} />
                        </div>

                        {!isLegacy ? (
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            {(consortium.items ?? []).map((item, index) => (
                              <span
                                key={`${consortium.id}-${index}`}
                                className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground"
                              >
                                {item.quantity}x{" "}
                                {item.species?.common_name ?? item.custom_species_name ?? "Espécie"}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Info className="h-3.5 w-3.5" />
                            Registro legado por hectare. O cálculo ambiental completo funciona melhor
                            no modelo por quantidade de mudas.
                          </div>
                        )}

                        <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-secondary/20 p-3">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-wrap items-center gap-2">
                              <BlockchainBadge record={record} />
                              {record?.external_hash && (
                                <span className="text-xs text-muted-foreground">
                                  Hash: {shortHash(record.external_hash)}
                                </span>
                              )}
                            </div>
                            {canRegister && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={registeringKey === actionKey}
                                onClick={() =>
                                  void handleRegister(
                                    "consortium",
                                    consortium.id,
                                    "consorcio_validado",
                                  )
                                }
                              >
                                {registeringKey === actionKey && (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Registrar na blockchain
                              </Button>
                            )}
                          </div>
                          {consortium.status !== "verified" && (
                            <div className="text-xs text-muted-foreground">
                              O registro blockchain é liberado após a validação do consórcio.
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isModerator && (
          <TabsContent value="moderacao" className="mt-6">
            <ModerationPanel />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function ModerationPanel() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"plantings" | "consortia">("plantings");
  const [pendingPlantings, setPendingPlantings] = useState<PendingPlanting[]>([]);
  const [pendingConsortia, setPendingConsortia] = useState<PendingConsortium[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewItem, setReviewItem] = useState<ReviewItem>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);

    const [plantingsRes, consortiaRes, environmentRes] = await Promise.all([
      supabase
        .from("plantings")
        .select(
          "id, user_id, planted_at, status, verification_method, photo_url, notes, custom_species_name, species:species_id(common_name)",
        )
        .eq("status", "pending")
        .order("created_at", { ascending: true }),
      supabase
        .from("consortia")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: true }),
      supabase.from("consortia_environment_dashboard").select("*"),
    ]);

    const userIds = [
      ...new Set([
        ...(plantingsRes.data ?? []).map((item) => item.user_id),
        ...(consortiaRes.data ?? []).map((item) => item.user_id),
      ]),
    ];

    const profilesRes = userIds.length
      ? await supabase.from("profiles").select("user_id, display_name").in("user_id", userIds)
      : { data: [], error: null };

    const profileMap = new Map(
      (profilesRes.data ?? []).map((profile) => [profile.user_id, profile.display_name]),
    );

    const consortiumIds = (consortiaRes.data ?? []).map((row) => row.id);
    const itemsRes = consortiumIds.length
      ? await supabase
          .from("consortium_items")
          .select("consortium_id, quantity, custom_species_name, species:species_id(common_name)")
          .in("consortium_id", consortiumIds)
      : { data: [], error: null };

    const itemsMap = new Map<string, PendingConsortium["items"]>();
    for (const item of itemsRes.data ?? []) {
      const list = itemsMap.get(item.consortium_id) ?? [];
      list.push({
        quantity: item.quantity,
        custom_species_name: item.custom_species_name,
        species: item.species as { common_name: string | null } | null,
      });
      itemsMap.set(item.consortium_id, list);
    }

    const environmentMap = new Map(
      (environmentRes.data ?? []).map((row) => [row.consortium_id ?? "", row]),
    );

    setPendingPlantings(
      ((plantingsRes.data ?? []) as unknown as PendingPlanting[]).map((item) => ({
        ...item,
        profile: { display_name: profileMap.get(item.user_id) ?? "Produtor(a)" },
      })),
    );
    setPendingConsortia(
      ((consortiaRes.data ?? []) as PendingConsortium[]).map((item) => ({
        ...item,
        profile: { display_name: profileMap.get(item.user_id) ?? "Produtor(a)" },
        items: itemsMap.get(item.id) ?? [],
        environment: environmentMap.get(item.id) ?? null,
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const submitReview = async () => {
    if (!reviewItem || !user) return;
    setSubmitting(true);

    const table = reviewItem.type === "seedling" ? "plantings" : "consortia";
    const targetUserId =
      reviewItem.type === "seedling"
        ? pendingPlantings.find((item) => item.id === reviewItem.id)?.user_id
        : pendingConsortia.find((item) => item.id === reviewItem.id)?.user_id;

    const { error: updateError } = await supabase
      .from(table)
      .update({ status: reviewItem.action })
      .eq("id", reviewItem.id);

    if (updateError) {
      toast.error(`Erro ao atualizar status: ${updateError.message}`);
      setSubmitting(false);
      return;
    }

    await supabase.from("validations").insert({
      target_id: reviewItem.id,
      target_type: reviewItem.type,
      status: reviewItem.action,
      verification_method: "hybrid",
      notes: notes.trim() || null,
      validated_by: user.id,
      validated_at: new Date().toISOString(),
    });

    if (targetUserId) {
      await supabase.rpc("recalculate_points", { _user: targetUserId });
    }

    toast.success(reviewItem.action === "verified" ? "Registro aprovado." : "Registro rejeitado.");
    setReviewItem(null);
    setNotes("");
    setSubmitting(false);
    await load();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={tab === "plantings" ? "default" : "outline"}
          size="sm"
          onClick={() => setTab("plantings")}
        >
          Mudas pendentes ({pendingPlantings.length})
        </Button>
        <Button
          variant={tab === "consortia" ? "default" : "outline"}
          size="sm"
          onClick={() => setTab("consortia")}
        >
          Consórcios pendentes ({pendingConsortia.length})
        </Button>
      </div>

      <Card className="border-border/60 shadow-card">
        <CardContent className="p-0">
          {loading ? (
            <LoadingState />
          ) : tab === "plantings" ? (
            pendingPlantings.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={<ShieldCheck className="h-10 w-10" />}
                  title="Nenhuma muda pendente"
                  description="Tudo em dia por enquanto."
                />
              </div>
            ) : (
              <ul className="divide-y divide-border/60">
                {pendingPlantings.map((planting) => {
                  const label =
                    planting.species?.common_name ?? planting.custom_species_name ?? "Muda";

                  return (
                    <li
                      key={planting.id}
                      className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{label}</div>
                        <div className="text-xs text-muted-foreground">
                          Por {planting.profile?.display_name} · {ptDate(planting.planted_at)} ·{" "}
                          {methodLabel(planting.verification_method)}
                        </div>
                        {planting.notes && (
                          <div className="mt-1 text-xs text-muted-foreground">{planting.notes}</div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setReviewItem({
                              id: planting.id,
                              type: "seedling",
                              action: "rejected",
                              label,
                            })
                          }
                        >
                          <X className="mr-2 h-4 w-4" />
                          Rejeitar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            setReviewItem({
                              id: planting.id,
                              type: "seedling",
                              action: "verified",
                              label,
                            })
                          }
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Aprovar
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )
          ) : pendingConsortia.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<ShieldCheck className="h-10 w-10" />}
                title="Nenhum consórcio pendente"
                description="Tudo em dia por enquanto."
              />
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {pendingConsortia.map((consortium) => {
                const isLegacy =
                  consortium.measurement_mode === "legacy_area" ||
                  (consortium.items?.length ?? 0) === 0;

                return (
                  <li key={consortium.id} className="flex flex-col gap-3 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 space-y-1">
                        <div className="truncate text-sm font-medium">{consortium.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Por {consortium.profile?.display_name} ·{" "}
                          {isLegacy
                            ? `${consortium.area_hectares ?? 0} ha (legado)`
                            : `${consortium.total_seedlings} mudas planejadas`}
                          {" · "}
                          {methodLabel(consortium.verification_method)}
                        </div>
                        {!isLegacy && consortium.environment && (
                          <div className="text-xs text-muted-foreground">
                            CO2 médio estimado:{" "}
                            {formatKg(consortium.environment.estimated_co2_avg_kg_year)} kg/ano
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setReviewItem({
                              id: consortium.id,
                              type: "consortium",
                              action: "rejected",
                              label: consortium.name,
                            })
                          }
                        >
                          <X className="mr-2 h-4 w-4" />
                          Rejeitar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            setReviewItem({
                              id: consortium.id,
                              type: "consortium",
                              action: "verified",
                              label: consortium.name,
                            })
                          }
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Aprovar
                        </Button>
                      </div>
                    </div>

                    {!isLegacy && (
                      <div className="flex flex-wrap gap-2">
                        {(consortium.items ?? []).map((item, index) => (
                          <span
                            key={`${consortium.id}-${index}`}
                            className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                          >
                            {item.quantity}x{" "}
                            {item.species?.common_name ?? item.custom_species_name ?? "Espécie"}
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!reviewItem}
        onOpenChange={(open) => {
          if (!open) {
            setReviewItem(null);
            setNotes("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewItem?.action === "verified" ? "Aprovar registro" : "Rejeitar registro"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {reviewItem?.action === "verified"
                ? `Confirmar a validação de "${reviewItem?.label}". Os pontos do produtor serão recalculados.`
                : `Marcar "${reviewItem?.label}" como rejeitado. O produtor não receberá pontos por este registro.`}
            </p>
            <Textarea
              placeholder="Observações opcionais..."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={500}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReviewItem(null);
                setNotes("");
              }}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button onClick={() => void submitReview()} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryCard({
  icon,
  stats,
  title,
}: {
  icon: ReactNode;
  stats: { pending: number; verified: number; rejected: number };
  title: string;
}) {
  return (
    <Card className="border-border/60 shadow-card">
      <CardHeader>
        <CardTitle className="font-display flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-2 text-center">
        <Stat label="Pendentes" tone="sun" value={stats.pending} />
        <Stat label="Verificados" tone="leaf" value={stats.verified} />
        <Stat label="Rejeitados" tone="muted" value={stats.rejected} />
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center p-10 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
    </div>
  );
}

function countByStatus(items: Array<{ status: string }>) {
  return {
    pending: items.filter((item) => item.status === "pending").length,
    verified: items.filter((item) => item.status === "verified").length,
    rejected: items.filter((item) => item.status === "rejected").length,
  };
}

function Stat({
  label,
  tone,
  value,
}: {
  label: string;
  tone: "sun" | "leaf" | "muted";
  value: number;
}) {
  const className =
    tone === "sun"
      ? "bg-sun/15 text-sun-foreground"
      : tone === "leaf"
        ? "bg-leaf/15 text-leaf-foreground"
        : "bg-muted text-muted-foreground";

  return (
    <div className={`rounded-lg px-2 py-3 ${className}`}>
      <div className="font-display text-xl font-semibold">{value}</div>
      <div className="text-[11px] uppercase tracking-wide opacity-80">{label}</div>
    </div>
  );
}
