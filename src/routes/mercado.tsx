import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { uploadMedia } from "@/lib/upload";
import { brl, ptDate } from "@/lib/format";
import { ShieldCheck, Coins, Loader2, ShoppingBag, MessageCircle, Store, Gift, PackagePlus, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/mercado")({
  component: () => (<AuthGuard><AppShell><Mercado /></AppShell></AuthGuard>),
});

interface Product {
  id: string; seller_id: string; kind: "sale" | "incentive"; origin: "verified_planting" | "rural_other";
  name: string; description: string | null; contact: string | null;
  quantity: number; price_brl: number | null; price_points: number | null;
  blockchain_verified: boolean; blockchain_hash: string | null; sustainable_impact: string | null;
  photo_url: string | null; status: string; created_at: string;
  source_planting_id: string | null; source_consortium_id: string | null;
}
interface Incentive {
  id: string; name: string; description: string | null; category: string | null;
  points_cost: number; available: boolean; stock: number; photo_url: string | null;
}

function Mercado() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [incentives, setIncentives] = useState<Incentive[]>([]);
  const [sellers, setSellers] = useState<Map<string, string>>(new Map());
  const [points, setPoints] = useState(0);

  const reload = async () => {
    const [{ data: prods }, { data: incs }, { data: profile }] = await Promise.all([
      supabase.from("products").select("*").eq("is_active", true).eq("kind", "sale").order("created_at", { ascending: false }),
      supabase.from("incentive_items").select("*").eq("available", true).order("points_cost"),
      user ? supabase.from("profiles").select("points").eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null }),
    ]);
    const list = (prods ?? []) as Product[];
    setProducts(list);
    setIncentives((incs ?? []) as Incentive[]);
    setPoints(profile?.points ?? 0);
    const ids = [...new Set(list.map((p) => p.seller_id))];
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("user_id, display_name").in("user_id", ids);
      setSellers(new Map((profs ?? []).map((p) => [p.user_id, p.display_name])));
    }
  };
  useEffect(() => { reload(); }, [user]);

  const mineAll = async () => {
    if (!user) return [];
    const { data } = await supabase.from("products").select("*").eq("seller_id", user.id).order("created_at", { ascending: false });
    return (data ?? []) as Product[];
  };
  const [mine, setMine] = useState<Product[]>([]);
  useEffect(() => { mineAll().then(setMine); }, [user, products]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Mercado</h1>
          <p className="mt-1 text-sm text-muted-foreground">Compre, troque por pontos ou venda produtos rurais sustentáveis.</p>
        </div>
        <Badge variant="outline" className="gap-1 border-sun/40 bg-sun/15 text-sun-foreground self-start sm:self-auto">
          <Coins className="h-3 w-3" /> {points} pts disponíveis
        </Badge>
      </header>

      <Tabs defaultValue="sale">
        <TabsList>
          <TabsTrigger value="sale"><Store className="mr-2 h-4 w-4" />Produtos à venda</TabsTrigger>
          <TabsTrigger value="incentive"><Gift className="mr-2 h-4 w-4" />Incentivos</TabsTrigger>
          <TabsTrigger value="mine"><PackagePlus className="mr-2 h-4 w-4" />Área de venda</TabsTrigger>
        </TabsList>

        <TabsContent value="sale" className="mt-6">
          <ProductGrid products={products} sellers={sellers} onChange={reload} />
        </TabsContent>
        <TabsContent value="incentive" className="mt-6">
          <IncentiveGrid items={incentives} userPoints={points} onChange={reload} />
        </TabsContent>
        <TabsContent value="mine" className="mt-6 space-y-6">
          <NewProductCard onCreated={reload} />
          <Card className="shadow-card border-border/60">
            <CardHeader><CardTitle className="font-display">Meus anúncios</CardTitle></CardHeader>
            <CardContent>
              {mine.length === 0 ? <EmptyState icon={<Store className="h-10 w-10" />} title="Você ainda não tem anúncios" /> : (
                <ul className="divide-y divide-border/60">
                  {mine.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {ptDate(p.created_at)} · qtd {p.quantity}
                          {p.price_brl ? ` · ${brl(p.price_brl)}` : ""}
                          {p.price_points ? ` · ${p.price_points} pts` : ""}
                          {p.blockchain_verified && " · Blockchain ✓"}
                          {" · "}{p.origin === "verified_planting" ? "Origem validada" : "Item rural"}
                        </div>
                      </div>
                      <StatusBadge status={p.status} />
                      <Button size="icon" variant="ghost" onClick={async () => {
                        await supabase.from("products").delete().eq("id", p.id);
                        toast.success("Anúncio removido");
                        reload();
                      }}><Trash2 className="h-4 w-4" /></Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProductGrid({ products, sellers, onChange }: { products: Product[]; sellers: Map<string, string>; onChange: () => void; }) {
  const { user } = useAuth();
  const router = useRouter();
  const [detail, setDetail] = useState<Product | null>(null);
  const visibleProducts = user ? products.filter((product) => product.seller_id !== user.id) : products;

  const addToCart = async (p: Product) => {
    if (!user) return;
    if (p.seller_id === user.id) {
      toast.info("Seu próprio anúncio fica disponível apenas para gerenciamento.");
      return;
    }
    const { error } = await supabase.from("cart_items").upsert({ user_id: user.id, product_id: p.id, quantity: 1 }, { onConflict: "user_id,product_id" });
    if (error) toast.error("Não foi possível adicionar"); else toast.success("Adicionado ao carrinho");
    onChange();
  };

  const talkSeller = async (p: Product) => {
    if (!user) return;
    if (p.seller_id === user.id) { toast.info("Este é seu próprio anúncio"); return; }
    const { data: existing } = await supabase.from("conversations").select("id")
      .eq("buyer_id", user.id).eq("seller_id", p.seller_id).eq("product_id", p.id).maybeSingle();
    let convId = existing?.id;
    if (!convId) {
      const { data, error } = await supabase.from("conversations").insert({ buyer_id: user.id, seller_id: p.seller_id, product_id: p.id }).select("id").single();
      if (error) { toast.error("Não foi possível abrir conversa"); return; }
      convId = data.id;
    }
    router.navigate({ to: "/chat", search: { c: convId } });
  };

  if (visibleProducts.length === 0) {
    return <EmptyState icon={<ShoppingBag className="h-10 w-10" />} title="Nenhum produto disponível" description="Volte mais tarde ou cadastre um anúncio na Área de venda." />;
  }
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleProducts.map((p) => (
          <Card key={p.id} className="overflow-hidden shadow-card border-border/60 flex flex-col">
            {p.photo_url ? (
              <div className="aspect-[5/3] w-full bg-muted">
                <img src={p.photo_url} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
              </div>
            ) : (
              <div className="aspect-[5/3] w-full bg-gradient-soft flex items-center justify-center text-primary/40">
                <Store className="h-10 w-10" />
              </div>
            )}
            <CardContent className="p-4 flex flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-base font-semibold">{p.name}</h3>
                {p.blockchain_verified && (
                  <Badge variant="outline" className="gap-1 border-leaf/30 bg-leaf/15 text-leaf-foreground">
                    <ShieldCheck className="h-3 w-3" /> Blockchain
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{p.description}</p>
              <div className="mt-2 text-xs text-muted-foreground">Vendedor: {sellers.get(p.seller_id) ?? "—"}</div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {p.price_brl !== null && <span className="font-display text-lg font-semibold">{brl(p.price_brl)}</span>}
                {p.price_points !== null && (
                  <Badge variant="outline" className="gap-1 border-sun/40 bg-sun/15 text-sun-foreground">
                    <Coins className="h-3 w-3" /> {p.price_points} pts
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">qtd {p.quantity}</Badge>
              </div>

              <div className="mt-auto pt-4 flex gap-2">
                <Button size="sm" className="flex-1 bg-gradient-forest" onClick={() => addToCart(p)}>
                  <ShoppingBag className="mr-1 h-4 w-4" /> Carrinho
                </Button>
                <Button size="sm" variant="outline" onClick={() => setDetail(p)} aria-label="Ver detalhes">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => talkSeller(p)} aria-label="Falar com vendedor">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ProductDetailDialog product={detail} sellers={sellers} onClose={() => setDetail(null)} onAdd={addToCart} onTalk={talkSeller} />
    </>
  );
}

function ProductDetailDialog({ product, sellers, onClose, onAdd, onTalk }: {
  product: Product | null; sellers: Map<string, string>;
  onClose: () => void; onAdd: (p: Product) => void; onTalk: (p: Product) => void;
}) {
  const { user } = useAuth();
  const isOwnProduct = !!product && product.seller_id === user?.id;

  return (
    <Dialog open={!!product} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        {product && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display">{product.name}</DialogTitle>
              <DialogDescription>Vendedor: {sellers.get(product.seller_id) ?? "—"}</DialogDescription>
            </DialogHeader>
            {product.photo_url && (
              <div className="overflow-hidden rounded-lg bg-muted">
                <img src={product.photo_url} alt={product.name} className="h-48 w-full object-cover" />
              </div>
            )}
            <div className="space-y-2 text-sm">
              {product.description && <p>{product.description}</p>}
              {product.sustainable_impact && (
                <div className="rounded-lg bg-secondary/60 p-3 text-xs">
                  <div className="font-semibold mb-1">Impacto sustentável</div>
                  {product.sustainable_impact}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>Quantidade: <span className="text-foreground">{product.quantity}</span></div>
                <div>Origem: <span className="text-foreground">{product.origin === "verified_planting" ? "Plantio verificado" : "Item rural"}</span></div>
                {product.price_brl !== null && <div>Preço: <span className="text-foreground">{brl(product.price_brl)}</span></div>}
                {product.price_points !== null && <div>Pontos: <span className="text-foreground">{product.price_points} pts</span></div>}
                {product.contact && <div className="col-span-2">Contato: <span className="text-foreground">{product.contact}</span></div>}
              </div>
              {product.blockchain_verified && (
                <div className="rounded-lg border border-leaf/30 bg-leaf/10 p-3 text-xs">
                  <div className="flex items-center gap-1 font-semibold text-leaf-foreground"><ShieldCheck className="h-3 w-3" /> Blockchain verificado</div>
                  {product.blockchain_hash && <div className="mt-1 font-mono break-all opacity-70">{product.blockchain_hash}</div>}
                </div>
              )}
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              {isOwnProduct ? (
                <div className="w-full rounded-lg bg-secondary/60 px-3 py-3 text-sm text-muted-foreground">
                  Este anúncio é seu. Você pode gerenciá-lo na área de venda.
                </div>
              ) : (
                <>
                  <Button variant="outline" onClick={() => onTalk(product)}><MessageCircle className="mr-1 h-4 w-4" />Falar com vendedor</Button>
                  <Button className="bg-gradient-forest" onClick={() => { onAdd(product); onClose(); }}>
                    <ShoppingBag className="mr-1 h-4 w-4" /> Adicionar ao carrinho
                  </Button>
                </>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function IncentiveGrid({ items, userPoints, onChange }: { items: Incentive[]; userPoints: number; onChange: () => void; }) {
  const { user } = useAuth();
  const [busyId, setBusyId] = useState<string | null>(null);

  const redeem = async (item: Incentive) => {
    if (!user) return;
    if (userPoints < item.points_cost) { toast.error("Pontos insuficientes para resgatar"); return; }
    if (item.stock <= 0) { toast.error("Sem estoque disponível"); return; }
    setBusyId(item.id);
    try {
      const { error: ledgerErr } = await supabase.from("points_ledger").insert({
        user_id: user.id,
        source_type: "redeem",
        source_id: item.id,
        points_delta: -item.points_cost,
        description: `Resgate: ${item.name}`,
      });
      if (ledgerErr) throw ledgerErr;

      await supabase.from("profiles").update({ points: userPoints - item.points_cost }).eq("user_id", user.id);
      await supabase.from("incentive_items").update({ stock: item.stock - 1 }).eq("id", item.id);

      toast.success(`Resgatado: ${item.name}`);
      onChange();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha no resgate");
    } finally { setBusyId(null); }
  };

  if (items.length === 0) {
    return <EmptyState icon={<Gift className="h-10 w-10" />} title="Nenhum incentivo disponível" />;
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((i) => {
        const canRedeem = userPoints >= i.points_cost && i.stock > 0;
        return (
          <Card key={i.id} className="overflow-hidden shadow-card border-border/60 flex flex-col">
            <div className="aspect-[5/3] w-full bg-gradient-soft flex items-center justify-center text-primary/40">
              {i.photo_url ? <img src={i.photo_url} alt={i.name} className="h-full w-full object-cover" /> : <Gift className="h-10 w-10" />}
            </div>
            <CardContent className="p-4 flex flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-base font-semibold">{i.name}</h3>
                {i.category && <Badge variant="outline" className="text-xs capitalize">{i.category}</Badge>}
              </div>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{i.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="gap-1 border-sun/40 bg-sun/15 text-sun-foreground">
                  <Coins className="h-3 w-3" /> {i.points_cost} pts
                </Badge>
                <Badge variant="outline" className="text-xs">{i.stock > 0 ? `${i.stock} em estoque` : "Esgotado"}</Badge>
              </div>
              <Button className="mt-auto mt-4 bg-gradient-forest" disabled={!canRedeem || busyId === i.id} onClick={() => redeem(i)}>
                {busyId === i.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {canRedeem ? "Resgatar" : userPoints < i.points_cost ? "Pontos insuficientes" : "Esgotado"}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function NewProductCard({ onCreated }: { onCreated: () => void }) {
  const { user } = useAuth();
  const [mode, setMode] = useState<"verified_planting" | "rural_other">("rural_other");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [contact, setContact] = useState("");
  const [qty, setQty] = useState("1");
  const [priceBrl, setPriceBrl] = useState("");
  const [pricePts, setPricePts] = useState("");
  const [impact, setImpact] = useState("");
  const [sourceId, setSourceId] = useState<string>("");
  const [sources, setSources] = useState<{ id: string; label: string; status: string }[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (mode !== "verified_planting" || !user) return;
    (async () => {
      const [{ data: pl }, { data: co }] = await Promise.all([
        supabase.from("plantings").select("id, status, species:species_id(common_name)").eq("user_id", user.id).eq("status", "verified"),
        supabase.from("consortia").select("id, name, status").eq("user_id", user.id).eq("status", "verified"),
      ]);
      const plList = (pl ?? []).map((p) => ({ id: `p:${p.id}`, label: `Muda · ${(p.species as { common_name: string } | null)?.common_name ?? ""}`, status: p.status }));
      const coList = (co ?? []).map((c) => ({ id: `c:${c.id}`, label: `Consórcio · ${c.name}`, status: c.status }));
      setSources([...plList, ...coList]);
    })();
  }, [mode, user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (mode === "verified_planting" && !sourceId) { toast.error("Selecione a origem verificada"); return; }
    if (mode === "rural_other" && !impact.trim()) { toast.error("Descreva o impacto sustentável"); return; }
    setBusy(true);
    try {
      let photo_url: string | null = null;
      if (file) photo_url = await uploadMedia(file, user.id, "products");
      const sourcePlanting = sourceId.startsWith("p:") ? sourceId.slice(2) : null;
      const sourceConsortium = sourceId.startsWith("c:") ? sourceId.slice(2) : null;
      const hash = mode === "verified_planting"
        ? "0x" + Array.from(crypto.getRandomValues(new Uint8Array(16))).map((b) => b.toString(16).padStart(2, "0")).join("")
        : null;
      const { error } = await supabase.from("products").insert({
        seller_id: user.id, kind: "sale" as const, origin: mode, name,
        description: desc || null, contact: contact || null,
        quantity: Number(qty) || 1,
        price_brl: priceBrl ? Number(priceBrl) : null,
        price_points: pricePts ? Number(pricePts) : null,
        blockchain_verified: mode === "verified_planting",
        blockchain_hash: hash,
        sustainable_impact: impact || null,
        source_planting_id: sourcePlanting,
        source_consortium_id: sourceConsortium,
        photo_url,
      });
      if (error) throw error;
      toast.success("Anúncio publicado!");
      setName(""); setDesc(""); setContact(""); setQty("1"); setPriceBrl(""); setPricePts(""); setImpact(""); setSourceId(""); setFile(null);
      onCreated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao publicar");
    } finally { setBusy(false); }
  };

  return (
    <Card className="shadow-card border-border/60">
      <CardHeader><CardTitle className="font-display">Cadastrar produto</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Modo de cadastro</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="verified_planting">Origem validada (muda/consórcio verificado)</SelectItem>
                <SelectItem value="rural_other">Outro item rural sustentável</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mode === "verified_planting" && (
            <div className="space-y-2 sm:col-span-2">
              <Label>Origem verificada</Label>
              <Select value={sourceId} onValueChange={setSourceId}>
                <SelectTrigger><SelectValue placeholder={sources.length ? "Selecione" : "Você ainda não tem origens verificadas"} /></SelectTrigger>
                <SelectContent>
                  {sources.map((s) => (<SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>))}
                </SelectContent>
              </Select>
              {sources.length === 0 && (
                <p className="text-xs text-muted-foreground">Cadastre uma muda ou consórcio e aguarde a verificação para liberar este modo.</p>
              )}
            </div>
          )}

          <div className="space-y-2 sm:col-span-2">
            <Label>Nome do produto</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Descrição</Label>
            <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Quantidade</Label>
            <Input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Contato</Label>
            <Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="WhatsApp, e-mail..." />
          </div>
          <div className="space-y-2">
            <Label>Preço (R$)</Label>
            <Input type="number" step="0.01" min="0" value={priceBrl} onChange={(e) => setPriceBrl(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Preço (pontos)</Label>
            <Input type="number" min="0" value={pricePts} onChange={(e) => setPricePts(e.target.value)} />
          </div>
          {mode === "rural_other" && (
            <div className="space-y-2 sm:col-span-2">
              <Label>Impacto sustentável</Label>
              <Textarea value={impact} onChange={(e) => setImpact(e.target.value)} rows={2}
                placeholder="Como este item contribui para reflorestamento, preservação ou agricultura regenerativa?" />
            </div>
          )}
          <div className="space-y-2 sm:col-span-2">
            <Label>Foto</Label>
            <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
          <Button type="submit" disabled={busy} className="sm:col-span-2 bg-gradient-forest">
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Publicar produto
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
