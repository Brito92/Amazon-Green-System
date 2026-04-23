import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { greet, ptDate } from "@/lib/format";
import { Sprout, TreePine, Coins, ShoppingBag, Trophy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard")({
  component: () => (<AuthGuard><AppShell><Dashboard /></AppShell></AuthGuard>),
});

interface Stats { plantings: number; consortia: number; points: number; cart: number; }
interface Recent { id: string; type: "muda" | "consórcio"; label: string; status: string; created_at: string; }
interface Rank { user_id: string; display_name: string; total: number; }

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ plantings: 0, consortia: 0, points: 0, cart: 0 });
  const [recent, setRecent] = useState<Recent[]>([]);
  const [ranking, setRanking] = useState<Rank[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [profile, plantings, consortia, cart, recentP, recentC, allP] = await Promise.all([
        supabase.from("profiles").select("display_name, points").eq("user_id", user.id).maybeSingle(),
        supabase.from("plantings").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("consortia").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("cart_items").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("plantings").select("id, status, created_at, species:species_id(common_name)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(4),
        supabase.from("consortia").select("id, name, status, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(4),
        supabase.from("plantings").select("user_id"),
      ]);

      setName(profile.data?.display_name ?? "");
      setStats({
        plantings: plantings.count ?? 0,
        consortia: consortia.count ?? 0,
        points: profile.data?.points ?? 0,
        cart: cart.count ?? 0,
      });

      const recentItems: Recent[] = [
        ...(recentP.data ?? []).map((p): Recent => ({
          id: p.id, type: "muda",
          label: (p.species as { common_name: string } | null)?.common_name ?? "Muda",
          status: p.status, created_at: p.created_at,
        })),
        ...(recentC.data ?? []).map((c): Recent => ({
          id: c.id, type: "consórcio", label: c.name, status: c.status, created_at: c.created_at,
        })),
      ].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 6);
      setRecent(recentItems);

      // ranking por quantidade
      const counts = new Map<string, number>();
      (allP.data ?? []).forEach((r: { user_id: string }) => counts.set(r.user_id, (counts.get(r.user_id) ?? 0) + 1));
      const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
      if (top.length) {
        const ids = top.map(([id]) => id);
        const { data: profs } = await supabase.from("profiles").select("user_id, display_name").in("user_id", ids);
        const nameMap = new Map((profs ?? []).map((p) => [p.user_id, p.display_name]));
        setRanking(top.map(([id, total]) => ({ user_id: id, display_name: nameMap.get(id) ?? "Produtor(a)", total })));
      }
    })();
  }, [user]);

  const cards = [
    { label: "Mudas plantadas", value: stats.plantings, Icon: Sprout, hint: "Registros totais" },
    { label: "Consórcios SAF", value: stats.consortia, Icon: TreePine, hint: "Sistemas ativos" },
    { label: "Pontos confirmados", value: stats.points, Icon: Coins, hint: "Verificados" },
    { label: "Carrinho", value: stats.cart, Icon: ShoppingBag, hint: "Itens" },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{greet()},</p>
          <h1 className="font-display text-3xl font-semibold text-balance">{name || "Produtor(a)"} 🌿</h1>
          <p className="mt-1 text-sm text-muted-foreground">Veja seus plantios, consórcios e o que está rolando no mercado.</p>
        </div>
        <Button asChild className="bg-gradient-forest"><Link to="/refloreste">Cadastrar nova muda <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, Icon, hint }) => (
          <Card key={label} className="shadow-card border-border/60">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-display font-semibold leading-none">{value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{label} · {hint}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-card border-border/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display">Registros recentes</CardTitle>
            <Button asChild variant="ghost" size="sm"><Link to="/refloreste">Ver tudo</Link></Button>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <EmptyState icon={<Sprout className="h-10 w-10" />} title="Nada por aqui ainda"
                description="Cadastre sua primeira muda ou consórcio para começar a pontuar."
                action={<Button asChild><Link to="/refloreste">Cadastrar agora</Link></Button>} />
            ) : (
              <ul className="divide-y divide-border/60">
                {recent.map((r) => (
                  <li key={`${r.type}-${r.id}`} className="flex items-center justify-between py-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{r.label}</div>
                      <div className="text-xs text-muted-foreground">{r.type} · {ptDate(r.created_at)}</div>
                    </div>
                    <StatusBadge status={r.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display"><Trophy className="h-5 w-5 text-sun" /> Destaques do mês</CardTitle>
          </CardHeader>
          <CardContent>
            {ranking.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ainda não há plantios suficientes para o ranking.</p>
            ) : (
              <ol className="space-y-3">
                {ranking.map((r, i) => (
                  <li key={r.user_id} className="flex items-center gap-3">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${i === 0 ? "bg-sun text-sun-foreground" : "bg-secondary text-secondary-foreground"}`}>{i + 1}</span>
                    <div className="min-w-0 flex-1 truncate text-sm font-medium">{r.display_name}</div>
                    <span className="text-xs text-muted-foreground">{r.total} mudas</span>
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
