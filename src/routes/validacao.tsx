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
import { ptDate, methodLabel } from "@/lib/format";
import { ShieldCheck, Sprout, TreePine, Check, X, Loader2 } from "lucide-react";

export const Route = createFileRoute("/validacao")({
  component: () => (<AuthGuard><AppShell><Validacao /></AppShell></AuthGuard>),
});

interface PItem { id: string; planted_at: string; status: string; verification_method: string; species: { common_name: string } | null; }
interface CItem { id: string; name: string; area_hectares: number; status: string; verification_method: string; created_at: string; }

interface PendingPlanting {
  id: string; user_id: string; planted_at: string; verification_method: string; photo_url: string | null; notes: string | null;
  custom_species_name: string | null;
  species: { common_name: string } | null;
  profile?: { display_name: string } | null;
}
interface PendingConsortium {
  id: string; user_id: string; name: string; description: string | null; area_hectares: number; verification_method: string;
  photo_url: string | null; species_list: string[]; created_at: string;
  profile?: { display_name: string } | null;
}

function Validacao() {
  const { user } = useAuth();
  const [plantings, setPlantings] = useState<PItem[]>([]);
  const [consortia, setConsortia] = useState<CItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"user" | "moderator" | "admin">("user");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [pl, co, prof] = await Promise.all([
        supabase.from("plantings").select("id, planted_at, status, verification_method, species:species_id(common_name)").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("consortia").select("id, name, area_hectares, status, verification_method, created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("profiles").select("role").eq("user_id", user.id).maybeSingle(),
      ]);
      setPlantings((pl.data ?? []) as unknown as PItem[]);
      setConsortia((co.data ?? []) as CItem[]);
      if (prof.data?.role) setRole(prof.data.role);
      setLoading(false);
    })();
  }, [user]);

  const counts = (arr: { status: string }[]) => ({
    pending: arr.filter((x) => x.status === "pending").length,
    verified: arr.filter((x) => x.status === "verified").length,
    rejected: arr.filter((x) => x.status === "rejected").length,
  });
  const pl = counts(plantings);
  const co = counts(consortia);
  const isModerator = role === "admin" || role === "moderator";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Validação</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acompanhe o status e o método de verificação dos seus registros.
          {isModerator && " Como moderador(a), você também pode aprovar ou rejeitar registros pendentes."}
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card className="shadow-card border-border/60">
          <CardHeader><CardTitle className="font-display flex items-center gap-2"><Sprout className="h-5 w-5 text-primary" />Mudas</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-3 gap-2 text-center">
            <Stat label="Pendentes" value={pl.pending} tone="sun" />
            <Stat label="Verificadas" value={pl.verified} tone="leaf" />
            <Stat label="Rejeitadas" value={pl.rejected} tone="muted" />
          </CardContent>
        </Card>
        <Card className="shadow-card border-border/60">
          <CardHeader><CardTitle className="font-display flex items-center gap-2"><TreePine className="h-5 w-5 text-primary" />Consórcios</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-3 gap-2 text-center">
            <Stat label="Pendentes" value={co.pending} tone="sun" />
            <Stat label="Verificados" value={co.verified} tone="leaf" />
            <Stat label="Rejeitados" value={co.rejected} tone="muted" />
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
          <Card className="shadow-card border-border/60"><CardContent className="p-0">
            {loading ? null : plantings.length === 0 ? (
              <div className="p-6"><EmptyState icon={<ShieldCheck className="h-10 w-10" />} title="Nenhuma muda registrada" /></div>
            ) : (
              <ul className="divide-y divide-border/60">
                {plantings.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{p.species?.common_name ?? "Muda"}</div>
                      <div className="text-xs text-muted-foreground">Plantio em {ptDate(p.planted_at)} · {methodLabel(p.verification_method)}</div>
                    </div>
                    <StatusBadge status={p.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="consorcios" className="mt-6">
          <Card className="shadow-card border-border/60"><CardContent className="p-0">
            {loading ? null : consortia.length === 0 ? (
              <div className="p-6"><EmptyState icon={<ShieldCheck className="h-10 w-10" />} title="Nenhum consórcio registrado" /></div>
            ) : (
              <ul className="divide-y divide-border/60">
                {consortia.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.area_hectares} ha · {methodLabel(c.verification_method)} · {ptDate(c.created_at)}</div>
                    </div>
                    <StatusBadge status={c.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent></Card>
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
    const [pl, co] = await Promise.all([
      supabase.from("plantings")
        .select("id, user_id, planted_at, verification_method, photo_url, notes, custom_species_name, species:species_id(common_name)")
        .eq("status", "pending")
        .order("created_at", { ascending: true }),
      supabase.from("consortia")
        .select("id, user_id, name, description, area_hectares, verification_method, photo_url, species_list, created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: true }),
    ]);

    const userIds = [...new Set([
      ...(pl.data ?? []).map((x) => x.user_id),
      ...(co.data ?? []).map((x) => x.user_id),
    ])];
    const profMap = new Map<string, string>();
    if (userIds.length) {
      const { data: profs } = await supabase.from("profiles").select("user_id, display_name").in("user_id", userIds);
      (profs ?? []).forEach((p) => profMap.set(p.user_id, p.display_name));
    }
    setPendingP(((pl.data ?? []) as unknown as PendingPlanting[]).map((p) => ({ ...p, profile: { display_name: profMap.get(p.user_id) ?? "Produtor(a)" } })));
    setPendingC((co.data ?? []).map((c) => ({ ...c, profile: { display_name: profMap.get(c.user_id) ?? "Produtor(a)" } })));
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const submitReview = async () => {
    if (!reviewItem || !user) return;
    setSubmitting(true);
    const table = reviewItem.type === "seedling" ? "plantings" : "consortia";
    const targetUserId = reviewItem.type === "seedling"
      ? pendingP.find((p) => p.id === reviewItem.id)?.user_id
      : pendingC.find((c) => c.id === reviewItem.id)?.user_id;

    const { error: updErr } = await supabase.from(table).update({ status: reviewItem.action }).eq("id", reviewItem.id);
    if (updErr) {
      toast.error("Erro ao atualizar status: " + updErr.message);
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
            <div className="flex items-center justify-center p-10 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
          ) : tab === "plantings" ? (
            pendingP.length === 0 ? (
              <div className="p-6"><EmptyState icon={<ShieldCheck className="h-10 w-10" />} title="Nenhuma muda pendente" description="Tudo em dia! Volte mais tarde." /></div>
            ) : (
              <ul className="divide-y divide-border/60">
                {pendingP.map((p) => {
                  const label = p.species?.common_name ?? p.custom_species_name ?? "Muda";
                  return (
                    <li key={p.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3 min-w-0">
                        {p.photo_url ? (
                          <img src={p.photo_url} alt={label} className="h-16 w-16 flex-shrink-0 rounded-md object-cover" />
                        ) : (
                          <div className="h-16 w-16 flex-shrink-0 rounded-md bg-muted flex items-center justify-center"><Sprout className="h-6 w-6 text-muted-foreground" /></div>
                        )}
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{label}</div>
                          <div className="text-xs text-muted-foreground">Por {p.profile?.display_name} · {ptDate(p.planted_at)} · {methodLabel(p.verification_method)}</div>
                          {p.notes && <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{p.notes}</div>}
                        </div>
                      </div>
                      <div className="flex gap-2 sm:flex-shrink-0">
                        <Button size="sm" variant="outline" onClick={() => setReviewItem({ id: p.id, type: "seedling", action: "rejected", label })}>
                          <X className="h-4 w-4" /> Rejeitar
                        </Button>
                        <Button size="sm" onClick={() => setReviewItem({ id: p.id, type: "seedling", action: "verified", label })}>
                          <Check className="h-4 w-4" /> Aprovar
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )
          ) : (
            pendingC.length === 0 ? (
              <div className="p-6"><EmptyState icon={<ShieldCheck className="h-10 w-10" />} title="Nenhum consórcio pendente" description="Tudo em dia! Volte mais tarde." /></div>
            ) : (
              <ul className="divide-y divide-border/60">
                {pendingC.map((c) => (
                  <li key={c.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3 min-w-0">
                      {c.photo_url ? (
                        <img src={c.photo_url} alt={c.name} className="h-16 w-16 flex-shrink-0 rounded-md object-cover" />
                      ) : (
                        <div className="h-16 w-16 flex-shrink-0 rounded-md bg-muted flex items-center justify-center"><TreePine className="h-6 w-6 text-muted-foreground" /></div>
                      )}
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{c.name}</div>
                        <div className="text-xs text-muted-foreground">Por {c.profile?.display_name} · {c.area_hectares} ha · {methodLabel(c.verification_method)}</div>
                        {c.species_list?.length > 0 && <div className="mt-1 text-xs text-muted-foreground line-clamp-1">Espécies: {c.species_list.join(", ")}</div>}
                        {c.description && <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{c.description}</div>}
                      </div>
                    </div>
                    <div className="flex gap-2 sm:flex-shrink-0">
                      <Button size="sm" variant="outline" onClick={() => setReviewItem({ id: c.id, type: "consortium", action: "rejected", label: c.name })}>
                        <X className="h-4 w-4" /> Rejeitar
                      </Button>
                      <Button size="sm" onClick={() => setReviewItem({ id: c.id, type: "consortium", action: "verified", label: c.name })}>
                        <Check className="h-4 w-4" /> Aprovar
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )
          )}
        </CardContent>
      </Card>

      <Dialog open={!!reviewItem} onOpenChange={(o) => { if (!o) { setReviewItem(null); setNotes(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewItem?.action === "verified" ? "Aprovar registro" : "Rejeitar registro"}
            </DialogTitle>
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
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setReviewItem(null); setNotes(""); }} disabled={submitting}>Cancelar</Button>
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

function Stat({ label, value, tone }: { label: string; value: number; tone: "sun" | "leaf" | "muted" }) {
  const cls = tone === "sun" ? "bg-sun/15 text-sun-foreground" : tone === "leaf" ? "bg-leaf/15 text-leaf-foreground" : "bg-muted text-muted-foreground";
  return (
    <div className={`rounded-lg px-2 py-3 ${cls}`}>
      <div className="font-display text-xl font-semibold">{value}</div>
      <div className="text-[11px] uppercase tracking-wide opacity-80">{label}</div>
    </div>
  );
}
