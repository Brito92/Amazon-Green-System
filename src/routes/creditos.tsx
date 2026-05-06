import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { brl, ptDateTime } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Coins, Leaf, Loader2, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/creditos")({
  component: () => (
    <AuthGuard>
      <AppShell>
        <CreditosPage />
      </AppShell>
    </AuthGuard>
  ),
});

type CarbonCredit = Database["public"]["Tables"]["carbon_credit_credits"]["Row"];
type CarbonCreditTx = Database["public"]["Tables"]["carbon_credit_transactions"]["Row"];
type CarbonSummary = Database["public"]["Views"]["user_carbon_credit_summary"]["Row"];
type EnvironmentRow = Database["public"]["Views"]["consortia_environment_dashboard"]["Row"];
type ConsortiumRow = Database["public"]["Tables"]["consortia"]["Row"];

type ConsortiumOption = ConsortiumRow & {
  environment: EnvironmentRow | null;
  hasCredit: boolean;
};

type CreditWithMeta = CarbonCredit & {
  consortiumName?: string;
  sellerName?: string;
  buyerName?: string;
};

type ListingDialogState =
  | { creditId: string; type: "list" }
  | { creditId: string; type: "buy" }
  | { creditId: string; type: "retire" }
  | { creditId: string; type: "cancel" }
  | null;

function formatTco2(value: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(value ?? 0);
}

function creditStatusLabel(status: string) {
  switch (status) {
    case "issued":
      return "Emitido";
    case "listed":
      return "Listado";
    case "sold":
      return "Vendido";
    case "retired":
      return "Aposentado";
    case "cancelled":
      return "Cancelado";
    default:
      return status;
  }
}

function tokenFragment(token: string) {
  if (!token) return "AGS";
  return token.slice(0, 12);
}

function randomTokenCode() {
  return `AGS-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

function randomBlockchainRef() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return `0x${Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")}`;
}

function CreditosPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<CarbonSummary | null>(null);
  const [availableConsortia, setAvailableConsortia] = useState<ConsortiumOption[]>([]);
  const [myCredits, setMyCredits] = useState<CreditWithMeta[]>([]);
  const [marketCredits, setMarketCredits] = useState<CreditWithMeta[]>([]);
  const [walletCredits, setWalletCredits] = useState<CreditWithMeta[]>([]);
  const [transactions, setTransactions] = useState<CarbonCreditTx[]>([]);

  const [selectedConsortiumId, setSelectedConsortiumId] = useState("");
  const [emissionNotes, setEmissionNotes] = useState("");
  const [emitting, setEmitting] = useState(false);

  const [dialogState, setDialogState] = useState<ListingDialogState>(null);
  const [priceDraft, setPriceDraft] = useState("");
  const [actionNotes, setActionNotes] = useState("");
  const [acting, setActing] = useState(false);

  const selectedConsortium = useMemo(
    () => availableConsortia.find((item) => item.id === selectedConsortiumId) ?? null,
    [availableConsortia, selectedConsortiumId],
  );

  const reload = async () => {
    if (!user) return;
    setLoading(true);

    const [
      consortiaRes,
      envRes,
      myCreditsRes,
      marketCreditsRes,
      walletCreditsRes,
      summaryRes,
      txRes,
    ] = await Promise.all([
      supabase
        .from("consortia")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "verified")
        .order("created_at", { ascending: false }),
      supabase
        .from("consortia_environment_dashboard")
        .select("*")
        .eq("user_id", user.id),
      supabase
        .from("carbon_credit_credits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("carbon_credit_credits")
        .select("*")
        .eq("status", "listed")
        .neq("user_id", user.id)
        .order("listed_at", { ascending: false }),
      supabase
        .from("carbon_credit_credits")
        .select("*")
        .eq("buyer_user_id", user.id)
        .order("sold_at", { ascending: false }),
      supabase
        .from("user_carbon_credit_summary")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("carbon_credit_transactions")
        .select("*")
        .or(`seller_user_id.eq.${user.id},buyer_user_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    const myRows = (myCreditsRes.data ?? []) as CarbonCredit[];
    const allRows = [
      ...myRows,
      ...((marketCreditsRes.data ?? []) as CarbonCredit[]),
      ...((walletCreditsRes.data ?? []) as CarbonCredit[]),
    ];

    const consortiumIds = [...new Set(allRows.map((row) => row.consortium_id))];
    const userIds = [
      ...new Set(
        allRows.flatMap((row) => [row.user_id, row.buyer_user_id]).filter(Boolean) as string[],
      ),
    ];

    const [consortiumNamesRes, profilesRes] = await Promise.all([
      consortiumIds.length
        ? supabase.from("consortia").select("id, name").in("id", consortiumIds)
        : Promise.resolve({ data: [] as Array<{ id: string; name: string }>, error: null }),
      userIds.length
        ? supabase.from("profiles").select("user_id, display_name").in("user_id", userIds)
        : Promise.resolve({
            data: [] as Array<{ user_id: string; display_name: string }>,
            error: null,
          }),
    ]);

    const consortiumNameMap = new Map(
      (consortiumNamesRes.data ?? []).map((item) => [item.id, item.name]),
    );
    const profileMap = new Map(
      (profilesRes.data ?? []).map((item) => [item.user_id, item.display_name]),
    );
    const envMap = new Map((envRes.data ?? []).map((item) => [item.consortium_id ?? "", item]));
    const issuedConsortiumIds = new Set(myRows.map((row) => row.consortium_id));

    setAvailableConsortia(
      ((consortiaRes.data ?? []) as ConsortiumRow[]).map((consortium) => ({
        ...consortium,
        environment: envMap.get(consortium.id) ?? null,
        hasCredit: issuedConsortiumIds.has(consortium.id),
      })),
    );
    setMyCredits(
      myRows.map((row) => ({
        ...row,
        consortiumName: consortiumNameMap.get(row.consortium_id),
        buyerName: row.buyer_user_id ? profileMap.get(row.buyer_user_id) : undefined,
      })),
    );
    setMarketCredits(
      ((marketCreditsRes.data ?? []) as CarbonCredit[]).map((row) => ({
        ...row,
        consortiumName: consortiumNameMap.get(row.consortium_id),
        sellerName: profileMap.get(row.user_id),
      })),
    );
    setWalletCredits(
      ((walletCreditsRes.data ?? []) as CarbonCredit[]).map((row) => ({
        ...row,
        consortiumName: consortiumNameMap.get(row.consortium_id),
        sellerName: profileMap.get(row.user_id),
      })),
    );
    setSummary(summaryRes.data ?? null);
    setTransactions((txRes.data ?? []) as CarbonCreditTx[]);
    setLoading(false);
  };

  useEffect(() => {
    void reload();
  }, [user]);

  useEffect(() => {
    if (!selectedConsortiumId) {
      const first = availableConsortia.find((item) => !item.hasCredit);
      if (first) setSelectedConsortiumId(first.id);
    }
  }, [availableConsortia, selectedConsortiumId]);

  const emitCredit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !selectedConsortium) return;
    if (selectedConsortium.hasCredit) {
      toast.error("Este consórcio já possui crédito emitido.");
      return;
    }

    const estimatedCo2 = Number(selectedConsortium.environment?.estimated_co2_avg_kg_year ?? 0);
    const creditAmount = Number((estimatedCo2 / 1000).toFixed(4));

    if (estimatedCo2 <= 0 || creditAmount <= 0) {
      toast.error("Este consórcio ainda não tem lastro ambiental suficiente para emissão.");
      return;
    }

    setEmitting(true);
    const tokenCode = randomTokenCode();
    const blockchainReference = randomBlockchainRef();

    const { data, error } = await supabase
      .from("carbon_credit_credits")
      .insert({
        user_id: user.id,
        consortium_id: selectedConsortium.id,
        estimated_co2_kg_year: estimatedCo2,
        credit_amount_tco2: creditAmount,
        status: "issued",
        token_code: tokenCode,
        blockchain_reference: blockchainReference,
        notes: emissionNotes.trim() || null,
      })
      .select("*")
      .single();

    if (error || !data) {
      setEmitting(false);
      toast.error("Não foi possível emitir o crédito.");
      return;
    }

    await supabase.from("carbon_credit_transactions").insert({
      credit_id: data.id,
      seller_user_id: user.id,
      event_type: "issued",
      amount_tco2: data.credit_amount_tco2,
      notes: emissionNotes.trim() || "Crédito emitido a partir de consórcio validado.",
    });

    toast.success("Crédito de carbono emitido com sucesso.");
    setEmissionNotes("");
    setSelectedConsortiumId("");
    setEmitting(false);
    await reload();
  };

  const activeCredit = dialogState
    ? [...myCredits, ...marketCredits, ...walletCredits].find(
        (row) => row.id === dialogState.creditId,
      ) ?? null
    : null;

  const submitAction = async () => {
    if (!user || !dialogState || !activeCredit) return;
    setActing(true);

    if (dialogState.type === "list") {
      const price = Number(priceDraft);
      if (!price || price <= 0) {
        toast.error("Informe um preço válido para listar o crédito.");
        setActing(false);
        return;
      }

      const { error } = await supabase
        .from("carbon_credit_credits")
        .update({
          status: "listed",
          price_brl: price,
          listed_at: new Date().toISOString(),
        })
        .eq("id", activeCredit.id);

      if (error) {
        toast.error("Não foi possível listar o crédito.");
        setActing(false);
        return;
      }

      await supabase.from("carbon_credit_transactions").insert({
        credit_id: activeCredit.id,
        seller_user_id: activeCredit.user_id,
        event_type: "listed",
        amount_tco2: activeCredit.credit_amount_tco2,
        price_brl: price,
        notes: actionNotes.trim() || "Crédito disponibilizado para negociação interna.",
      });

      toast.success("Crédito listado para comercialização.");
    }

    if (dialogState.type === "buy") {
      const { error } = await supabase
        .from("carbon_credit_credits")
        .update({
          status: "sold",
          buyer_user_id: user.id,
          sold_at: new Date().toISOString(),
        })
        .eq("id", activeCredit.id);

      if (error) {
        toast.error("Não foi possível concluir a compra simulada.");
        setActing(false);
        return;
      }

      await supabase.from("carbon_credit_transactions").insert({
        credit_id: activeCredit.id,
        seller_user_id: activeCredit.user_id,
        buyer_user_id: user.id,
        event_type: "sold",
        amount_tco2: activeCredit.credit_amount_tco2,
        price_brl: activeCredit.price_brl,
        notes: actionNotes.trim() || "Compra simulada de crédito de carbono.",
      });

      toast.success("Crédito adquirido com sucesso.");
    }

    if (dialogState.type === "retire") {
      const { error } = await supabase
        .from("carbon_credit_credits")
        .update({
          status: "retired",
          retired_at: new Date().toISOString(),
        })
        .eq("id", activeCredit.id);

      if (error) {
        toast.error("Não foi possível aposentar o crédito.");
        setActing(false);
        return;
      }

      await supabase.from("carbon_credit_transactions").insert({
        credit_id: activeCredit.id,
        seller_user_id: activeCredit.user_id,
        buyer_user_id: activeCredit.buyer_user_id,
        event_type: "retired",
        amount_tco2: activeCredit.credit_amount_tco2,
        price_brl: activeCredit.price_brl,
        notes: actionNotes.trim() || "Crédito retirado de circulação.",
      });

      toast.success("Crédito aposentado.");
    }

    if (dialogState.type === "cancel") {
      const { error } = await supabase
        .from("carbon_credit_credits")
        .update({
          status: "issued",
          listed_at: null,
          price_brl: null,
        })
        .eq("id", activeCredit.id);

      if (error) {
        toast.error("Não foi possível cancelar a listagem.");
        setActing(false);
        return;
      }

      await supabase.from("carbon_credit_transactions").insert({
        credit_id: activeCredit.id,
        seller_user_id: activeCredit.user_id,
        event_type: "cancelled",
        amount_tco2: activeCredit.credit_amount_tco2,
        notes: actionNotes.trim() || "Listagem cancelada pelo emissor.",
      });

      toast.success("Listagem cancelada.");
    }

    setPriceDraft("");
    setActionNotes("");
    setDialogState(null);
    setActing(false);
    await reload();
  };

  const metrics = [
    {
      title: "Créditos emitidos",
      value: String(summary?.total_credits ?? 0),
      hint: `${formatTco2(summary?.total_tco2)} tCO2 simuladas`,
    },
    {
      title: "Disponíveis para venda",
      value: String(summary?.listed_credits ?? 0),
      hint: `${formatTco2(summary?.listed_tco2)} tCO2 listadas`,
    },
    {
      title: "Vendidos",
      value: String(summary?.sold_credits ?? 0),
      hint: `${formatTco2(summary?.sold_tco2)} tCO2 comercializadas`,
    },
    {
      title: "Receita simulada",
      value: brl(summary?.revenue_brl ?? 0),
      hint: "Baseada nas vendas concluídas na plataforma",
    },
  ];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold">Créditos de carbono</h1>
        <p className="text-sm text-muted-foreground">
          Emita, liste, negocie e aposente créditos simulados a partir de consórcios validados.
        </p>
      </header>

      <Alert className="border-primary/20 bg-secondary/40">
        <ShieldCheck className="h-4 w-4" />
        <AlertTitle>Simulação acadêmica</AlertTitle>
        <AlertDescription>
          Este módulo representa uma tokenização interna. Ele não publica ativos em blockchain
          real, mas cria rastreabilidade, listagem e histórico de transações dentro da plataforma.
        </AlertDescription>
      </Alert>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title} className="shadow-card border-border/60">
            <CardContent className="p-5">
              <div className="text-2xl font-display font-semibold">{metric.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{metric.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">{metric.hint}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Tabs defaultValue="emitir">
        <TabsList>
          <TabsTrigger value="emitir">
            <Sparkles className="mr-2 h-4 w-4" />
            Emitir
          </TabsTrigger>
          <TabsTrigger value="meus">
            <Coins className="mr-2 h-4 w-4" />
            Meus créditos
          </TabsTrigger>
          <TabsTrigger value="mercado">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Mercado
          </TabsTrigger>
          <TabsTrigger value="carteira">
            <Leaf className="mr-2 h-4 w-4" />
            Carteira
          </TabsTrigger>
        </TabsList>

        <TabsContent value="emitir" className="mt-6">
          <Card className="shadow-card border-border/60">
            <CardHeader>
              <CardTitle className="font-display">Emissão básica de crédito</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando consórcios validados...
                </div>
              ) : availableConsortia.length === 0 ? (
                <EmptyState
                  icon={<Leaf className="h-10 w-10" />}
                  title="Nenhum consórcio validado disponível"
                  description="Somente consórcios verificados podem gerar créditos simulados."
                />
              ) : (
                <form onSubmit={emitCredit} className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Consórcio de origem</Label>
                    <Select value={selectedConsortiumId} onValueChange={setSelectedConsortiumId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um consórcio validado" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableConsortia.map((consortium) => (
                          <SelectItem
                            key={consortium.id}
                            value={consortium.id}
                            disabled={consortium.hasCredit}
                          >
                            {consortium.name}
                            {consortium.hasCredit ? " - crédito já emitido" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <MetricPreview
                    title="CO2 médio estimado"
                    value={`${formatTco2(
                      Number(selectedConsortium?.environment?.estimated_co2_avg_kg_year ?? 0),
                    )} kg/ano`}
                    hint="Base da emissão simulada"
                  />
                  <MetricPreview
                    title="Crédito gerado"
                    value={`${formatTco2(
                      Number(selectedConsortium?.environment?.estimated_co2_avg_kg_year ?? 0) /
                        1000,
                    )} tCO2`}
                    hint="Conversão interna simplificada"
                  />

                  <div className="space-y-2 sm:col-span-2">
                    <Label>Observações</Label>
                    <Textarea
                      rows={3}
                      value={emissionNotes}
                      onChange={(event) => setEmissionNotes(event.target.value)}
                      placeholder="Contexto do consórcio, validação, observações técnicas..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={
                      emitting ||
                      !selectedConsortium ||
                      selectedConsortium.hasCredit ||
                      Number(selectedConsortium.environment?.estimated_co2_avg_kg_year ?? 0) <= 0
                    }
                    className="sm:col-span-2 bg-gradient-forest"
                  >
                    {emitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Emitir crédito simulado
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meus" className="mt-6">
          <CreditsList
            emptyTitle="Você ainda não emitiu créditos"
            emptyDescription="Emita um crédito a partir de um consórcio validado para iniciar a rastreabilidade."
            credits={myCredits}
            actionArea={(credit) => (
              <div className="flex flex-wrap gap-2">
                {credit.status === "issued" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDialogState({ creditId: credit.id, type: "list" })}
                  >
                    Listar
                  </Button>
                )}
                {credit.status === "listed" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDialogState({ creditId: credit.id, type: "cancel" })}
                  >
                    Cancelar listagem
                  </Button>
                )}
                {(credit.status === "issued" || credit.status === "sold") && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDialogState({ creditId: credit.id, type: "retire" })}
                  >
                    Aposentar
                  </Button>
                )}
              </div>
            )}
          />
        </TabsContent>

        <TabsContent value="mercado" className="mt-6">
          <CreditsList
            emptyTitle="Nenhum crédito disponível no mercado"
            emptyDescription="Quando outros produtores listarem créditos simulados, eles aparecerão aqui."
            credits={marketCredits}
            actionArea={(credit) => (
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="bg-gradient-forest"
                  onClick={() => setDialogState({ creditId: credit.id, type: "buy" })}
                >
                  Comprar
                </Button>
              </div>
            )}
            showSeller
          />
        </TabsContent>

        <TabsContent value="carteira" className="mt-6 space-y-6">
          <CreditsList
            emptyTitle="Sua carteira ainda está vazia"
            emptyDescription="Créditos adquiridos no mercado aparecem aqui para acompanhamento e aposentadoria."
            credits={walletCredits}
            actionArea={(credit) => (
              <div className="flex flex-wrap gap-2">
                {credit.status === "sold" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDialogState({ creditId: credit.id, type: "retire" })}
                  >
                    Aposentar
                  </Button>
                )}
              </div>
            )}
            showSeller
          />

          <Card className="shadow-card border-border/60">
            <CardHeader>
              <CardTitle className="font-display">Últimas transações</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma movimentação registrada ainda.</p>
              ) : (
                <ul className="divide-y divide-border/60">
                  {transactions.map((transaction) => (
                    <li key={transaction.id} className="py-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-medium capitalize">{transaction.event_type}</div>
                        <Badge variant="outline">{formatTco2(transaction.amount_tco2)} tCO2</Badge>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {ptDateTime(transaction.created_at)}
                        {transaction.price_brl !== null ? ` - ${brl(transaction.price_brl)}` : ""}
                      </div>
                      {transaction.notes && (
                        <div className="mt-1 text-xs text-muted-foreground">{transaction.notes}</div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!dialogState}
        onOpenChange={(open) => {
          if (!open) {
            setDialogState(null);
            setPriceDraft("");
            setActionNotes("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogState?.type === "list" && "Listar crédito para venda"}
              {dialogState?.type === "buy" && "Comprar crédito"}
              {dialogState?.type === "retire" && "Aposentar crédito"}
              {dialogState?.type === "cancel" && "Cancelar listagem"}
            </DialogTitle>
          </DialogHeader>

          {activeCredit && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border/60 p-4">
                <div className="font-medium">{activeCredit.consortiumName ?? "Consórcio"}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Token {tokenFragment(activeCredit.token_code)} -{" "}
                  {formatTco2(activeCredit.credit_amount_tco2)} tCO2
                </div>
                {activeCredit.price_brl !== null && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    Valor atual: {brl(activeCredit.price_brl)}
                  </div>
                )}
              </div>

              {dialogState?.type === "list" && (
                <div className="space-y-2">
                  <Label>Preço sugerido (R$)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={priceDraft}
                    onChange={(event) => setPriceDraft(event.target.value)}
                    placeholder="Ex.: 150.00"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  rows={3}
                  value={actionNotes}
                  onChange={(event) => setActionNotes(event.target.value)}
                  placeholder="Observações para auditoria interna e histórico da transação..."
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogState(null)}
              disabled={acting}
            >
              Fechar
            </Button>
            <Button onClick={() => void submitAction()} disabled={acting} className="bg-gradient-forest">
              {acting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MetricPreview({ hint, title, value }: { hint: string; title: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{title}</div>
      <div className="mt-2 text-2xl font-display font-semibold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

function CreditsList({
  actionArea,
  credits,
  emptyDescription,
  emptyTitle,
  showSeller = false,
}: {
  actionArea: (credit: CreditWithMeta) => React.ReactNode;
  credits: CreditWithMeta[];
  emptyDescription: string;
  emptyTitle: string;
  showSeller?: boolean;
}) {
  return (
    <Card className="shadow-card border-border/60">
      <CardContent className="p-0">
        {credits.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<Coins className="h-10 w-10" />}
              title={emptyTitle}
              description={emptyDescription}
            />
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {credits.map((credit) => (
              <li key={credit.id} className="p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-medium">
                        {credit.consortiumName ?? "Consórcio sem nome"}
                      </div>
                      <Badge variant="outline">{creditStatusLabel(credit.status)}</Badge>
                      <Badge variant="outline">{formatTco2(credit.credit_amount_tco2)} tCO2</Badge>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Token {credit.token_code} - emitido em {ptDateTime(credit.issued_at)}
                    </div>

                    {showSeller && credit.sellerName && (
                      <div className="text-xs text-muted-foreground">
                        Emissor: {credit.sellerName}
                      </div>
                    )}

                    {credit.buyerName && (
                      <div className="text-xs text-muted-foreground">
                        Comprador: {credit.buyerName}
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      Lastro estimado: {credit.estimated_co2_kg_year} kg/ano
                    </div>

                    {credit.price_brl !== null && (
                      <div className="text-sm font-medium">{brl(credit.price_brl)}</div>
                    )}

                    {credit.notes && (
                      <div className="text-xs text-muted-foreground">{credit.notes}</div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">{actionArea(credit)}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
