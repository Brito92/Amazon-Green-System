import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/lib/format";
import { Coins, MessageCircle, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/carrinho")({
  component: () => (<AuthGuard><AppShell><Carrinho /></AppShell></AuthGuard>),
});

interface Item {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price_brl: number | null;
    price_points: number | null;
    seller_id: string;
    photo_url: string | null;
  };
}

function Carrinho() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);

  const reload = async () => {
    if (!user) return;
    const { data } = await supabase.from("cart_items")
      .select("id, quantity, product:product_id(id, name, price_brl, price_points, seller_id, photo_url)")
      .eq("user_id", user.id);
    setItems((data ?? []) as unknown as Item[]);
  };

  useEffect(() => {
    reload();
  }, [user]);

  const remove = async (id: string) => {
    await supabase.from("cart_items").delete().eq("id", id);
    reload();
  };

  const clear = async () => {
    if (!user) return;
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    reload();
  };

  const talk = async (sellerId: string, productId: string) => {
    if (!user) return;
    if (sellerId === user.id) {
      toast.info("Você não pode abrir conversa com o seu próprio anúncio.");
      return;
    }

    const { data: existing } = await supabase.from("conversations").select("id")
      .eq("buyer_id", user.id).eq("seller_id", sellerId).eq("product_id", productId).maybeSingle();

    let convId = existing?.id;
    if (!convId) {
      const { data, error } = await supabase.from("conversations")
        .insert({ buyer_id: user.id, seller_id: sellerId, product_id: productId })
        .select("id")
        .single();
      if (error) {
        toast.error("Falha ao abrir conversa");
        return;
      }
      convId = data.id;
    }

    router.navigate({ to: "/chat", search: { c: convId } });
  };

  const totalBrl = items.reduce((sum, item) => sum + (item.product.price_brl ?? 0) * item.quantity, 0);
  const totalPts = items.reduce((sum, item) => sum + (item.product.price_points ?? 0) * item.quantity, 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Carrinho</h1>
          <p className="mt-1 text-sm text-muted-foreground">Revise os itens e fale com os vendedores.</p>
        </div>
        {items.length > 0 && (
          <Button variant="ghost" onClick={clear}>
            <Trash2 className="mr-2 h-4 w-4" />Limpar carrinho
          </Button>
        )}
      </header>

      {items.length === 0 ? (
        <EmptyState icon={<ShoppingCart className="h-10 w-10" />} title="Seu carrinho está vazio" description="Explore o mercado para adicionar produtos." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 shadow-card border-border/60">
            <CardContent className="divide-y divide-border/60 p-0">
              {items.map((item) => {
                const isOwnProduct = item.product.seller_id === user?.id;
                return (
                  <div key={item.id} className="flex items-center gap-4 p-4">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                      {item.product.photo_url ? <img src={item.product.photo_url} alt={item.product.name} className="h-full w-full object-cover" /> : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{item.product.name}</div>
                      <div className="text-xs text-muted-foreground">
                        qtd {item.quantity}
                        {item.product.price_brl !== null && <> · {brl(item.product.price_brl)}</>}
                        {item.product.price_points !== null && <> · {item.product.price_points} pts</>}
                        {isOwnProduct && <> · seu anúncio</>}
                      </div>
                    </div>

                    <Button size="sm" variant="outline" onClick={() => talk(item.product.seller_id, item.product.id)} disabled={isOwnProduct}>
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="h-fit shadow-card border-border/60">
            <CardHeader><CardTitle className="font-display">Resumo</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm"><span>Itens</span><span>{items.length}</span></div>
              <div className="flex justify-between text-sm"><span>Total em reais</span><span className="font-medium">{brl(totalBrl)}</span></div>
              <div className="flex justify-between text-sm"><span>Total em pontos</span><span className="inline-flex items-center gap-1 font-medium"><Coins className="h-3 w-3 text-sun" />{totalPts}</span></div>
              <Button className="mt-2 w-full bg-gradient-forest" onClick={() => toast.info("Pagamento em breve. Por ora, fale com o vendedor para combinar.")}>
                Finalizar combinando com vendedor
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
