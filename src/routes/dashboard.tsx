import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { brl, greet, ptDate } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import {
  ArrowRight,
  Blocks,
  Coins,
  Droplets,
  Leaf,
  ShoppingBag,
  Sprout,
  TreePine,
  Trophy,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: () => (
    <AuthGuard>
      <AppShell>
        <Dashboard />
      </AppShell>
    </AuthGuard>
  ),
});

type EnvironmentSummary = Database["public"]["Views"]["user_environment_dashboard"]["Row"];
type CarbonSummary = Database["public"]["Views"]["user_carbon_credit_summary"]["Row"];
type BlockchainSummary = Database["public"]["Views"]["user_blockchain_summary"]["Row"];

type Recent = {
  id: string;
  type: "muda" | "consorcio";
  label: string;
  status: string;
  created_at: string;
};

type Rank = {
  user_id: string;
  display_name: string;
  total: number;
};

function formatNumber(value: number | null | undefined, digits = 0) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: digits }).format(value ?? 0);
}

function formatTco2(value: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(value ?? 0);
}

function Dashboard() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [points, setPoints] = useState(0);
  const [consortiaCount, setConsortiaCount] = useState(0);
  const [plantingsCount, setPlantingsCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [environment, setEnvironment] = useState<EnvironmentSummary | null>(null);
  const [carbonSummary, setCarbonSummary] = useState<CarbonSummary | null>(null);
  const [blockchainSummary, setBlockchainSummary] = useState<BlockchainSummary | null>(null);
  const [recent, setRecent] = useState<Recent[]>([]);
  const [ranking, setRanking] = useState<Rank[]>([]);

  useEffect(() => {
    if (!user) return;

    (async () => {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .slice(0, 10);

      const [
        profileRes,
        consortiaRes,
        plantingsRes,
        cartRes,
        environmentRes,
        carbonRes,
        blockchainRes,
        recentPlantingsRes,
        recentConsortiaRes,
        rankingRes,
      ] = await Promise.all([
        supabase.from("profiles").select("display_name, points").eq("user_id", user.id).maybeSingle(),
        supabase.from("consortia").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("plantings").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("cart_items").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase
          .from("user_environment_dashboard")
          .select("*")
          .eq("user_id", user.id)
          .order("reference_month", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase.from("user_carbon_credit_summary").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_blockchain_summary").select("*").eq("user_id", user.id).maybeSingle(),
        supabase
          .from("plantings")
          .select("id, status, created_at, species:species_id(common_name)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(4),
        supabase
          .from("consortia")
          .select("id, name, status, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(4),
        supabase
          .from("plantings")
          .select("user_id")
          .eq("status", "verified")
          .gte("planted_at", firstDayOfMonth),
      ]);

      setName(profileRes.data?.display_name ?? "");
      setPoints(profileRes.data?.points ?? 0);
      setConsortiaCount(consortiaRes.count ?? 0);
      setPlantingsCount(plantingsRes.count ?? 0);
      setCartCount(cartRes.count ?? 0);
      setEnvironment(environmentRes.data ?? null);
      setCarbonSummary(carbonRes.data ?? null);
      setBlockchainSummary(blockchainRes.data ?? null);

      const recentItems: Recent[] = [
        ...((recentPlantingsRes.data ?? []).map((item) => ({
          id: item.id,
          type: "muda" as const,
          label: (item.species as { common_name: string | null } | null)?.common_name ?? "Muda",
          status: item.status,
          created_at: item.created_at,
        })) ?? []),
        ...((recentConsortiaRes.data ?? []).map((item) => ({
          id: item.id,
          type: "consorcio" as const,
          label: item.name,
          status: item.status,
          created_at: item.created_at,
        })) ?? []),
      ]
        .sort((left, right) => right.created_at.localeCompare(left.created_at))
        .slice(0, 6);

      setRecent(recentItems);

      const rankingMap = new Map<string, number>();
      for (const row of rankingRes.data ?? []) {
        if (!row.user_id) continue;
        rankingMap.set(row.user_id, (rankingMap.get(row.user_id) ?? 0) + 1);
      }

      const top = [...rankingMap.entries()]
        .sort((left, right) => right[1] - left[1])
        .slice(0, 5);

      if (!top.length) {
        setRanking([]);
        return;
      }

      const ids = top.map(([id]) => id);
      const rankingProfilesRes = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", ids);

      const nameMap = new Map(
        (rankingProfilesRes.data ?? []).map((profile) => [profile.user_id, profile.display_name]),
      );

      setRanking(
        top.map(([id, total]) => ({
          user_id: id,
          display_name: nameMap.get(id) ?? "Produtor(a)",
          total,
        })),
      );
    })();
  }, [user]);

  const cards = [
    {
      label: "Mudas no sistema",
      value: formatNumber(plantingsCount),
      hint: "Registros simples cadastrados",
      icon: Sprout,
    },
    {
      label: "Consórcios ativos",
      value: formatNumber(consortiaCount),
      hint: "Fluxo principal do projeto",
      icon: TreePine,
    },
    {
      label: "CO2 estimado",
      value: `${formatNumber(environment?.estimated_co2_avg_kg_year, 1)} kg/ano`,
      hint: "Baseado em categorias ambientais",
      icon: Leaf,
    },
    {
      label: "Economia de água",
      value: `${formatNumber(environment?.estimated_water_savings_liters_month)} L/mês`,
      hint: `Uso real: ${formatNumber(environment?.actual_water_liters_month)} L/mês`,
      icon: Droplets,
    },
    {
      label: "Créditos emitidos",
      value: formatNumber(carbonSummary?.total_credits),
      hint: `${formatTco2(carbonSummary?.total_tco2)} tCO2 simuladas`,
      icon: Coins,
    },
    {
      label: "Eventos blockchain",
      value: formatNumber(blockchainSummary?.total_eventos),
      hint: `${formatNumber(blockchainSummary?.minerados)} minerados · ${formatNumber(
        blockchainSummary?.auditados_validos,
      )} auditados`,
      icon: Blocks,
    },
    {
      label: "Pontos confirmados",
      value: formatNumber(points),
      hint: "Pontuação verificada",
      icon: Coins,
    },
    {
      label: "Carrinho",
      value: formatNumber(cartCount),
      hint: "Itens disponíveis",
      icon: ShoppingBag,
    },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{greet()},</p>
          <h1 className="font-display text-3xl font-semibold text-balance">
            {name || "Produtor(a)"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Veja seus consórcios, créditos, carbono estimado e eventos blockchain.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link to="/creditos">Ver créditos</Link>
          </Button>
          <Button asChild className="bg-gradient-forest">
            <Link to="/refloreste">
              Refloreste e ganhe pontos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ hint, icon: Icon, label, value }) => (
          <Card key={label} className="border-border/60 shadow-card">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-2xl font-display font-semibold leading-none">{value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{label}</div>
                <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/60 shadow-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display">Registros recentes</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/refloreste">Ver tudo</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <EmptyState
                icon={<Sprout className="h-10 w-10" />}
                title="Nada por aqui ainda"
                description="Comece criando um consórcio ou registrando uma muda simples."
                action={
                  <Button asChild>
                    <Link to="/refloreste">Cadastrar agora</Link>
                  </Button>
                }
              />
            ) : (
              <ul className="divide-y divide-border/60">
                {recent.map((item) => (
                  <li key={`${item.type}-${item.id}`} className="flex items-center justify-between py-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{item.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.type} · {ptDate(item.created_at)}
                      </div>
                    </div>
                    <StatusBadge status={item.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <Trophy className="h-5 w-5 text-sun" />
              Destaques do mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ranking.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Ainda não há mudas validadas este mês para o ranking.
              </p>
            ) : (
              <ol className="space-y-3">
                {ranking.map((item, index) => (
                  <li key={item.user_id} className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                        index === 0
                          ? "bg-sun text-sun-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1 truncate text-sm font-medium">
                      {item.display_name}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatNumber(item.total)} mudas
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
