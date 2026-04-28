import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { greet, ptDate } from "@/lib/format";
import { ArrowRight, Coins, Droplets, Leaf, ShoppingBag, Sprout, TreePine, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

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
type Recent = { id: string; type: "muda" | "consórcio"; label: string; status: string; created_at: string };
type Rank = { user_id: string; display_name: string; total: number };

function formatNumber(value: number | null | undefined, digits = 0) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: digits }).format(value ?? 0);
}

function Dashboard() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [points, setPoints] = useState(0);
  const [consortiaCount, setConsortiaCount] = useState(0);
  const [plantingsCount, setPlantingsCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [totalSeedlings, setTotalSeedlings] = useState(0);
  const [environment, setEnvironment] = useState<EnvironmentSummary | null>(null);
  const [recent, setRecent] = useState<Recent[]>([]);
  const [ranking, setRanking] = useState<Rank[]>([]);

  useEffect(() => {
    if (!user) return;

    (async () => {
      // Get current month boundaries
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [
        profileRes,
        consortiaRes,
        plantingsRes,
        cartRes,
        envRes,
        recentPlantingsRes,
        recentConsortiaRes,
        rankingBaseRes,
        rankingPlantingsRes,
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
        supabase.from("consortia_environment_dashboard").select("user_id, total_seedlings"),
        // New query for ranking: validated plantings from current month
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
      setEnvironment(envRes.data ?? null);

      const totalFromUser = (rankingBaseRes.data ?? [])
        .filter((row) => row.user_id === user.id)
        .reduce((sum, row) => sum + (row.total_seedlings ?? 0), 0);
      setTotalSeedlings(totalFromUser);

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
          type: "consórcio" as const,
          label: item.name,
          status: item.status,
          created_at: item.created_at,
        })) ?? []),
      ]
        .sort((left, right) => right.created_at.localeCompare(left.created_at))
        .slice(0, 6);
      setRecent(recentItems);

      // New ranking logic: group by user_id and count plantings
      const plantingsByUser = new Map<string, number>();
      for (const row of rankingPlantingsRes.data ?? []) {
        const userId = row.user_id;
        if (!userId) continue;
        const total = plantingsByUser.get(userId) ?? 0;
        plantingsByUser.set(userId, total + 1);
      }

      const top = [...plantingsByUser.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      if (top.length) {
        const ids = top.map(([id]) => id);
        const profilesRes = await supabase.from("profiles").select("user_id, display_name").in("user_id", ids);
        const nameMap = new Map((profilesRes.data ?? []).map((profile) => [profile.user_id, profile.display_name]));
        setRanking(
          top.map(([id, total]) => ({
            user_id: id,
            display_name: nameMap.get(id) ?? "Produtor(a)",
            total,
          })),
        );
      } else {
        setRanking([]);
      }
    })();
  }, [user]);

  const cards = [
    {
      label: "Mudas no sistema",
      value: formatNumber(plantingsCount),
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
          <h1 className="font-display text-3xl font-semibold text-balance">{name || "Produtor(a)"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Veja seus consórcios, carbono estimado e uso de água.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild className="bg-gradient-forest">
            <Link to="/refloreste">
              Refloreste e ganhe pontos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ hint, icon: Icon, label, value }) => (
          <Card key={label} className="shadow-card border-border/60">
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
        <Card className="lg:col-span-2 shadow-card border-border/60">
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

        <Card className="shadow-card border-border/60">
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
                    <div className="min-w-0 flex-1 truncate text-sm font-medium">{item.display_name}</div>
                    <span className="text-xs text-muted-foreground">{formatNumber(item.total)} mudas</span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </section>
      <footer className="mt-8 rounded-2xl bg-gradient-forest p-6 text-white shadow-lg relative overflow-hidden">
        {/* Camada de brilho para dar profundidade ao gradiente */}
        <div className="absolute inset-0 bg-white/10 opacity-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center gap-4 text-center md:flex-row md:text-left md:justify-between">
          <div className="max-w-2xl">
            <p className="text-lg font-semibold font-display leading-relaxed">
              Integramos tecnologia com práticas tradicionais da Amazônia, 
              promovendo produção sustentável através da gestão inteligente 
              de sistemas agroflorestais.
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Leaf className="h-6 w-6 text-white" />
          </div>
        </div>
      </footer>
    </div>
  );
}
