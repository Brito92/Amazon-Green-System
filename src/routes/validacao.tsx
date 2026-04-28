import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthGuard } from "@/components/AuthGuard";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { methodLabel, ptDate } from "@/lib/format";
import { Check, Info, Loader2, ShieldCheck, Sprout, TreePine, X } from "lucide-react";

export const Route = createFileRoute("/validacao")({
  component: () => (
    <AuthGuard>
      <AppShell>
        <Validacao />
      </AppShell>
    </AuthGuard>
  ),
});

type PendingPlanting = {
  id: string;
  user_id: string;
  planted_at: string;
  verification_method: string;
  photo_url: string | null;
  notes: string | null;
  custom_species_name: string | null;
  species: { common_name: string | null } | null;
  profile?: { display_name: string } | null;
};

type PendingConsortium = Database["public"]["Tables"]["consortia"]["Row"] & {
  profile?: { display_name: string } | null;
  items?: Array<{
    quantity: number;
    custom_species_name: string | null;
    species: { common_name: string | null } | null;
  }>;
  environment?: Database["public"]["Views"]["consortia_environment_dashboard"]["Row"] | null;
};

type UserRole = Database["public"]["Enums"]["user_role"];

function formatKg(value: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(value ?? 0);
}

function Validacao() {
  const { user } = useAuth();
  const [plantings, setPlantings] = useState<Array<{ id: string; planted_at: string; status: string; verification_method: string; species: { common_name: string | null } | null }>>([]);
  const [consortia, setConsortia] = useState<Array<PendingConsortium>>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>("user");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [pl, co, prof, env] = await Promise.all([
        supabase
          .from("plantings")
          .select("id, planted_at, status, verification_method, species:species_id(common_name)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase.from("consortia").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("profiles").select("role").eq("user_id", user.id).maybeSingle(),
        supabase.from("consortia_environment_dashboard").select("*").eq("user_id", user.id),
      ]);

      const consortiumIds = (co.data ?? []).map((row) => row.id);
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

      const envMap = new Map((env.data ?? []).map((row) => [row.consortium_id ?? "", row]));

      setPlantings((pl.data ?? []) as typeof plantings);
      setConsortia(
        (co.data ?? []).map((row) => ({
          ...row,
          items: itemsMap.get(row.id) ?? [],
          environment: envMap.get(row.id) ?? null,
        })),
      );
      if (prof.data?.role) setRole(prof.data.role);
      setLoading(false);
    })();
  }, [user]);

  const counts = (arr: { status: string }[]) => ({
    pending: arr.filter((item) => item.status === "pending").length,
    verified: arr.filter((item) => item.status === "verified").length,
    rejected: arr.filter((item) => item.status === "rejected").length,
  });
  const pl = counts(plantings);
  const co = counts(consortia);
  const isModerator = role === "admin" || role === "moderator";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Validação</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acompanhe o status dos registros e, se você for moderador(a), aprove ou rejeite novos plantios e consórcios.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card className="shadow-card border-border/60">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Sprout className="h-5 w-5 text-primary" />
              Mudas
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-2 text-center">
            <Stat label="Pendentes" tone="sun" value={pl.pending} />
            <Stat label="Verificadas" tone="leaf" value={pl.verified} />
            <Stat label="Rejeitadas" tone="muted" value={pl.rejected} />
          </CardContent>
        </Card>
        <Card className="shadow-card border-border/60">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <TreePine className="h-5 w-5 text-primary" />
              Consórcios
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-2 text-center">
            <Stat label="Pendentes" tone="sun" value={co.pending} />
            <Stat label="Verificados" tone="leaf" value={co.verified} />
            <Stat label="Rejeitados" tone="muted" value={co.rejected} />
          </CardContent>
        </Card>
      </section>

      <Tabs defaultValue="mudas">
        <TabsList>
          <TabsTrigger value="mudas">Mudas</TabsTrigger>
          <TabsTrigger value="consorcios">Consórcios</TabsTrigger>
          {isModerator && <TabsTrigger value="moderacao">Moderação</TabsTrigger>}
        </TabsList>

        <TabsContent value="mudas" className="mt-6">
          <Card className="shadow-card border-border/60">
            <CardContent className="p-0">
              {loading ? null : plantings.length === 0 ? (
                <div className="p-6">
                  <EmptyState icon={<ShieldCheck className="h-10 w-10" />} title="Nenhuma muda registrada" />
                </div>
              ) : (
                <ul className="divide-y divide-border/60">
                  {plantings.map((planting) => (
                    <li key={planting.id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {planting.species?.common_name ?? "Muda"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Plantio em {ptDate(planting.planted_at)} · {methodLabel(planting.verification_method)}
                        </div>
                      </div>
                      <StatusBadge status={planting.status} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consorcios" className="mt-6">
          <Card className="shadow-card border-border/60">
            <CardContent className="p-0">
              {loading ? null : consortia.length === 0 ? (
                <div className="p-6">
                  <EmptyState icon={<ShieldCheck className="h-10 w-10" />} title="Nenhum consórcio registrado" />
                </div>
              ) : (
                <ul className="divide-y divide-border/60">
                  {consortia.map((consortium) => {
                    const isLegacy = consortium.measurement_mode === "legacy_area" || (consortium.items?.length ?? 0) === 0;
                    return (
                      <li key={consortium.id} className="flex flex-col gap-3 px-4 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
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
                          </div>
                          <StatusBadge status={consortium.status} />
                        </div>
                        {!isLegacy && (
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            {(consortium.items ?? []).map((item, index) => (
                              <span key={`${consortium.id}-${index}`} className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">
                                {item.quantity}x {item.species?.common_name ?? item.custom_species_name ?? "Espécie"}
                              </span>
                            ))}
                          </div>
                        )}
                        {!isLegacy && consortium.environment && (
                          <div className="text-xs text-muted-foreground">
                            CO2 estimado médio: {formatKg(consortium.environment.estimated_co2_avg_kg_year)} kg/ano
                          </div>
                        )}
                        {isLegacy && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Info className="h-3.5 w-3.5" />
                            Registro legado por hectare. Os indicadores ambientais completos funcionam melhor nos novos consórcios por quantidade de mudas.
                          </div>
                        )}
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
  const [pendingP, setPendingP] = useState<PendingPlanting[]>([]);
  const [pendingC, setPendingC] = useState<PendingConsortium[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewItem, setReviewItem] = useState<{ id: string; type: "seedling" | "consortium"; action: "verified" | "rejected"; label: string } | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const [pl, co, env] = await Promise.all([
      supabase
        .from("plantings")
        .select("id, user_id, planted_at, verification_method, photo_url, notes, custom_species_name, species:species_id(common_name)")
        .eq("status", "pending")
        .order("created_at", { ascending: true }),
      supabase.from("consortia").select("*").eq("status", "pending").order("created_at", { ascending: true }),
      supabase.from("consortia_environment_dashboard").select("*"),
    ]);

    const userIds = [...new Set([...(pl.data ?? []).map((x) => x.user_id), ...(co.data ?? []).map((x) => x.user_id)])];
    const profileMap = new Map<string, string>();
    if (userIds.length) {
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name").in("user_id", userIds);
      (profiles ?? []).forEach((profile) => profileMap.set(profile.user_id, profile.display_name));
    }

    const consortiumIds = (co.data ?? []).map((row) => row.id);
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

    const envMap = new Map((env.data ?? []).map((row) => [row.consortium_id ?? "", row]));

    setPendingP(
      ((pl.data ?? []) as unknown as PendingPlanting[]).map((planting) => ({
        ...planting,
        profile: { display_name: profileMap.get(planting.user_id) ?? "Produtor(a)" },
      })),
    );
    setPendingC(
      (co.data ?? []).map((consortium) => ({
        ...consortium,
        profile: { display_name: profileMap.get(consortium.user_id) ?? "Produtor(a)" },
        items: itemsMap.get(consortium.id) ?? [],
        environment: envMap.get(consortium.id) ?? null,
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
        ? pendingP.find((item) => item.id === reviewItem.id)?.user_id
        : pendingC.find((item) => item.id === reviewItem.id)?.user_id;

    const { error: updateError } = await supabase.from(table).update({ status: reviewItem.action }).eq("id", reviewItem.id);
    if (updateError) {
      toast.error("Erro ao atualizar status: " + updateError.message);
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

    toast.success(reviewItem.action === "verified" ? "Registro aprovado!" : "Registro rejeitado.");
    setReviewItem(null);
    setNotes("");
    setSubmitting(false);
    void load();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant={tab === "plantings" ? "default" : "outline"} size="sm" onClick={() => setTab("plantings")}>
          Mudas pendentes ({pendingP.length})
        </Button>
        <Button variant={tab === "consortia" ? "default" : "outline"} size="sm" onClick={() => setTab("consortia")}>
          Consórcios pendentes ({pendingC.length})
        </Button>
      </div>

      <Card className="shadow-card border-border/60">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : tab === "plantings" ? (
            pendingP.length === 0 ? (
              <div className="p-6">
                <EmptyState icon={<ShieldCheck className="h-10 w-10" />} title="Nenhuma muda pendente" description="Tudo em dia! Volte mais tarde." />
              </div>
            ) : (
              <ul className="divide-y divide-border/60">
                {pendingP.map((planting) => {
                  const label = planting.species?.common_name ?? planting.custom_species_name ?? "Muda";
                  return (
                    <li key={planting.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3 min-w-0">
                        {planting.photo_url ? (
                          <img src={planting.photo_url} alt={label} className="h-16 w-16 flex-shrink-0 rounded-md object-cover" />
                        ) : (
                          <div className="h-16 w-16 flex-shrink-0 rounded-md bg-muted flex items-center justify-center">
                            <Sprout className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{label}</div>
                          <div className="text-xs text-muted-foreground">
                            Por {planting.profile?.display_name} · {ptDate(planting.planted_at)} · {methodLabel(planting.verification_method)}
                          </div>
                          {planting.notes && <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{planting.notes}</div>}
                        </div>
                      </div>
                      <div className="flex gap-2 sm:flex-shrink-0">
                        <Button size="sm" variant="outline" onClick={() => setReviewItem({ id: planting.id, type: "seedling", action: "rejected", label })}>
                          <X className="h-4 w-4" /> Rejeitar
                        </Button>
                        <Button size="sm" onClick={() => setReviewItem({ id: planting.id, type: "seedling", action: "verified", label })}>
                          <Check className="h-4 w-4" /> Aprovar
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )
          ) : pendingC.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={<ShieldCheck className="h-10 w-10" />} title="Nenhum consórcio pendente" description="Tudo em dia! Volte mais tarde." />
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {pendingC.map((consortium) => {
                const isLegacy = consortium.measurement_mode === "legacy_area" || (consortium.items?.length ?? 0) === 0;
                return (
                  <li key={consortium.id} className="flex flex-col gap-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        {consortium.photo_url ? (
                          <img src={consortium.photo_url} alt={consortium.name} className="h-16 w-16 flex-shrink-0 rounded-md object-cover" />
                        ) : (
                          <div className="h-16 w-16 flex-shrink-0 rounded-md bg-muted flex items-center justify-center">
                            <TreePine className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
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
                            <div className="mt-1 text-xs text-muted-foreground">
                              CO2 estimado médio: {formatKg(consortium.environment.estimated_co2_avg_kg_year)} kg/ano
                            </div>
                          )}
                          {consortium.description && (
                            <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{consortium.description}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 sm:flex-shrink-0">
                        <Button size="sm" variant="outline" onClick={() => setReviewItem({ id: consortium.id, type: "consortium", action: "rejected", label: consortium.name })}>
                          <X className="h-4 w-4" /> Rejeitar
                        </Button>
                        <Button size="sm" onClick={() => setReviewItem({ id: consortium.id, type: "consortium", action: "verified", label: consortium.name })}>
                          <Check className="h-4 w-4" /> Aprovar
                        </Button>
                      </div>
                    </div>
                    {!isLegacy && (
                      <div className="flex flex-wrap gap-2">
                        {(consortium.items ?? []).map((item, index) => (
                          <span key={`${consortium.id}-${index}`} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                            {item.quantity}x {item.species?.common_name ?? item.custom_species_name ?? "Espécie"}
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

      <Dialog open={!!reviewItem} onOpenChange={(open) => { if (!open) { setReviewItem(null); setNotes(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{reviewItem?.action === "verified" ? "Aprovar registro" : "Rejeitar registro"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {reviewItem?.action === "verified"
                ? `Confirmar verificação de "${reviewItem?.label}". Os pontos do produtor serão recalculados.`
                : `Marcar "${reviewItem?.label}" como rejeitado. O produtor não receberá pontos por este registro.`}
            </p>
            <Textarea
              placeholder="Observações (opcional)..."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={500}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setReviewItem(null); setNotes(""); }} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={submitReview} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, tone, value }: { label: string; tone: "sun" | "leaf" | "muted"; value: number }) {
  const cls =
    tone === "sun"
      ? "bg-sun/15 text-sun-foreground"
      : tone === "leaf"
        ? "bg-leaf/15 text-leaf-foreground"
        : "bg-muted text-muted-foreground";
  return (
    <div className={`rounded-lg px-2 py-3 ${cls}`}>
      <div className="font-display text-xl font-semibold">{value}</div>
      <div className="text-[11px] uppercase tracking-wide opacity-80">{label}</div>
    </div>
  );
}
