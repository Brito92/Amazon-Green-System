import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { brl, ptDate } from "@/lib/format";
import { Coins, Droplets, Leaf, MapPin, Search, Sprout, TreePine, UserRound } from "lucide-react";

export const Route = createFileRoute("/produtores")({
  component: () => (
    <AuthGuard>
      <AppShell>
        <ProdutoresPage />
      </AppShell>
    </AuthGuard>
  ),
});

type ProducerSummary = Database["public"]["Views"]["producer_public_summary"]["Row"];
type ProducerConsortium = Database["public"]["Views"]["producer_public_consortia"]["Row"];

function formatNumber(value: number | null | undefined, digits = 0) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: digits,
  }).format(value ?? 0);
}

function formatTco2(value: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(value ?? 0);
}

function verificationMethodLabel(method: string | null | undefined) {
  switch (method) {
    case "photo":
      return "Foto / laudo";
    case "time":
      return "Registro declarado";
    case "hybrid":
      return "Híbrido";
    default:
      return "Não informado";
  }
}

function getLocationLabel(producer: ProducerSummary) {
  if (producer.producer_location_label) return producer.producer_location_label;
  if (producer.city && producer.state) return `${producer.city} - ${producer.state}`;
  if (producer.city) return producer.city;
  if (producer.state) return producer.state;
  return "Localização não informada";
}

function initials(name: string | null | undefined) {
  return (name ?? "P")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function ProdutoresPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [producers, setProducers] = useState<ProducerSummary[]>([]);
  const [consortia, setConsortia] = useState<ProducerConsortium[]>([]);
  const [selectedProducerId, setSelectedProducerId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [summaryRes, consortiaRes] = await Promise.all([
        supabase
          .from("producer_public_summary")
          .select("*")
          .order("total_seedlings", { ascending: false }),
        supabase
          .from("producer_public_consortia")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      setProducers((summaryRes.data ?? []) as ProducerSummary[]);
      setConsortia((consortiaRes.data ?? []) as ProducerConsortium[]);
      setLoading(false);
    })();
  }, []);

  const filteredProducers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return producers;
    return producers.filter((producer) =>
      [producer.display_name, producer.city, producer.state]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query)),
    );
  }, [producers, search]);

  const selectedProducer = useMemo(
    () => producers.find((producer) => producer.user_id === selectedProducerId) ?? null,
    [producers, selectedProducerId],
  );

  const selectedConsortia = useMemo(
    () =>
      consortia.filter((consortium) => consortium.user_id === selectedProducerId).slice(0, 6),
    [consortia, selectedProducerId],
  );

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold">Conheça os produtores</h1>
        <p className="text-sm text-muted-foreground">
          Descubra quem está reflorestando, cultivando consórcios e gerando impacto ambiental positivo na plataforma.
        </p>
      </header>

      <Card className="shadow-card border-border/60">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, cidade ou estado"
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card className="shadow-card border-border/60">
          <CardContent className="p-6 text-sm text-muted-foreground">
            Carregando vitrine de produtores...
          </CardContent>
        </Card>
      ) : filteredProducers.length === 0 ? (
        <EmptyState
          icon={<UserRound className="h-10 w-10" />}
          title="Nenhum produtor encontrado"
          description="Ajuste a busca ou aguarde novos registros verificados na plataforma."
        />
      ) : (
        <div className="grid gap-4">
          {filteredProducers.map((producer) => (
            <Card key={producer.user_id ?? producer.display_name} className="shadow-card border-border/60">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <Avatar className="h-16 w-16 border border-border/60">
                    <AvatarImage src={producer.avatar_url ?? undefined} alt={producer.display_name ?? "Produtor"} />
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      {initials(producer.display_name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1 space-y-3">
                    <div>
                      <h2 className="truncate font-display text-xl font-semibold uppercase tracking-tight">
                        {producer.display_name}
                      </h2>
                      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{getLocationLabel(producer)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="gap-1.5">
                        <Sprout className="h-3.5 w-3.5" />
                        {formatNumber(producer.verified_plantings_count)} mudas
                      </Badge>
                      <Badge variant="outline" className="gap-1.5">
                        <TreePine className="h-3.5 w-3.5" />
                        {formatNumber(producer.consortia_count)} consórcios
                      </Badge>
                      <Badge variant="outline" className="gap-1.5">
                        <Leaf className="h-3.5 w-3.5" />
                        {formatTco2(producer.estimated_co2_avg_kg_year)} kg/ano
                      </Badge>
                      <Badge variant="outline" className="gap-1.5">
                        <Droplets className="h-3.5 w-3.5" />
                        {formatNumber(producer.estimated_water_savings_liters_month)} L/mês
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center">
                  <Button className="bg-gradient-forest" onClick={() => setSelectedProducerId(producer.user_id)}>
                    Informações do produtor
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedProducer} onOpenChange={(open) => !open && setSelectedProducerId(null)}>
        <DialogContent className="max-w-3xl">
          {selectedProducer && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">
                  {selectedProducer.display_name}
                </DialogTitle>
              </DialogHeader>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Avatar className="h-20 w-20 border border-border/60">
                  <AvatarImage
                    src={selectedProducer.avatar_url ?? undefined}
                    alt={selectedProducer.display_name ?? "Produtor"}
                  />
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    {initials(selectedProducer.display_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{getLocationLabel(selectedProducer)}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{formatNumber(selectedProducer.points)} pts confirmados</Badge>
                    <Badge variant="outline">{formatNumber(selectedProducer.total_credits)} créditos emitidos</Badge>
                    <Badge variant="outline">{brl(selectedProducer.revenue_brl ?? 0)} em receita simulada</Badge>
                    {selectedProducer.producer_latitude !== null &&
                      selectedProducer.producer_longitude !== null && (
                        <Badge variant="outline">
                          {selectedProducer.producer_latitude.toFixed(4)},{" "}
                          {selectedProducer.producer_longitude.toFixed(4)}
                        </Badge>
                      )}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  title="Mudas validadas"
                  value={String(selectedProducer.verified_plantings_count ?? 0)}
                  hint="Registros simples verificados"
                />
                <MetricCard
                  title="Consórcios"
                  value={String(selectedProducer.consortia_count ?? 0)}
                  hint={`${formatNumber(selectedProducer.total_seedlings)} mudas planejadas`}
                />
                <MetricCard
                  title="CO2 estimado"
                  value={`${formatTco2(selectedProducer.estimated_co2_avg_kg_year)} kg/ano`}
                  hint={`${formatTco2(selectedProducer.total_tco2)} tCO2 em créditos`}
                />
                <MetricCard
                  title="Água monitorada"
                  value={`${formatNumber(selectedProducer.actual_water_liters_month)} L/mês`}
                  hint={`${formatNumber(selectedProducer.estimated_water_savings_liters_month)} L/mês de economia`}
                />
              </div>

              <Card className="shadow-card border-border/60">
                <CardHeader>
                  <CardTitle className="font-display text-lg">Consórcios em destaque</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedConsortia.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Este produtor ainda não possui consórcios públicos disponíveis.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {selectedConsortia.map((consortium) => (
                        <li
                          key={consortium.consortium_id}
                          className="rounded-xl border border-border/60 p-4"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-1">
                              <div className="font-medium">{consortium.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {ptDate(consortium.created_at)} · {verificationMethodLabel(consortium.verification_method)}
                              </div>
                              {consortium.description && (
                                <p className="text-sm text-muted-foreground">
                                  {consortium.description}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline">
                                {formatNumber(consortium.total_seedlings)} mudas
                              </Badge>
                              <Badge variant="outline">
                                {formatTco2(consortium.estimated_co2_avg_kg_year)} kg/ano
                              </Badge>
                              <Badge variant="outline">
                                {formatNumber(consortium.estimated_water_avg_liters_month)} L/mês
                              </Badge>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
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
