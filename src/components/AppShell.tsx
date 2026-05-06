import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";
import {
  Coins,
  Home,
  LogOut,
  Map,
  Menu,
  MessageCircle,
  ShieldCheck,
  ShoppingCart,
  Sprout,
  Store,
  UserCircle2,
  Users,
  X,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/refloreste", label: "Refloreste e Ganhe", icon: Sprout },
  { to: "/mapa", label: "Mapa", icon: Map },
  { to: "/perfil", label: "Meu Perfil", icon: UserCircle2 },
  { to: "/produtores", label: "Produtores", icon: Users },
  { to: "/creditos", label: "Créditos", icon: Coins },
  { to: "/validacao", label: "Validação", icon: ShieldCheck },
  { to: "/mercado", label: "Mercado", icon: Store },
  { to: "/carrinho", label: "Carrinho", icon: ShoppingCart },
  { to: "/chat", label: "Chat", icon: MessageCircle },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const path = useRouterState({ select: (state) => state.location.pathname });
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [points, setPoints] = useState(0);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, points")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setName(data.display_name);
        setPoints(data.points);
      });
  }, [user, path]);

  const handleSignOut = async () => {
    await signOut();
    router.navigate({ to: "/login" });
  };

  const initials = (name || user?.email || "U").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur lg:hidden">
        <Logo size="sm" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen((value) => !value)}
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      <div className="lg:flex">
        <aside
          className={`${
            open ? "block" : "hidden"
          } border-r border-border/60 bg-sidebar text-sidebar-foreground lg:fixed lg:inset-y-0 lg:block lg:w-64`}
        >
          <div className="flex h-full flex-col p-5">
            <div className="mb-8 hidden lg:block">
              <Logo />
            </div>

            <nav className="flex flex-1 flex-col gap-1">
              {NAV.map(({ icon: Icon, label, to }) => {
                const active = path.startsWith(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-forest text-xs font-semibold text-primary-foreground">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{name || user?.email}</div>
                  <div className="text-xs text-muted-foreground">{points} pts confirmados</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full justify-start gap-2 text-muted-foreground"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" /> Sair
              </Button>
            </div>
          </div>
        </aside>

        <main className="w-full lg:pl-64">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8 lg:py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
