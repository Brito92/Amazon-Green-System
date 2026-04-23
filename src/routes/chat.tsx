import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { AuthGuard } from "@/components/AuthGuard";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ptDateTime } from "@/lib/format";
import { Headphones, MessageCircle, Search, Send, ShoppingBag, Store, Users } from "lucide-react";

const search = z.object({ c: z.string().optional() });

export const Route = createFileRoute("/chat")({
  validateSearch: search,
  component: () => (<AuthGuard><AppShell><Chat /></AppShell></AuthGuard>),
});

interface ConvRow {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string | null;
  last_message_at: string;
  product: { name: string; photo_url: string | null } | null;
}

interface Conv extends ConvRow {
  otherName: string;
  otherId: string;
}

interface Msg {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

type ChatSection = "support" | "community" | "purchases" | "sales";
const SUPPORT_CONVERSATION_ID = "support-demo";
const SUPPORT_AGENT_ID = "support-agent";
const SUPPORT_STATUS = "Agente em atendimento";
const COMMUNITY_CONVERSATION_ID = "community-demo";
const COMMUNITY_AGENT_ID = "community-hub";
const COMMUNITY_STATUS = "Produtores ativos na sala";

const CHAT_SECTIONS: { id: ChatSection; label: string; Icon: typeof Headphones }[] = [
  { id: "support", label: "Suporte tecnico", Icon: Headphones },
  { id: "community", label: "Comunidade geral", Icon: Users },
  { id: "purchases", label: "Compras", Icon: ShoppingBag },
  { id: "sales", label: "Vendas", Icon: Store },
];

function buildSupportConversation(userId: string): Conv {
  return {
    id: SUPPORT_CONVERSATION_ID,
    buyer_id: userId,
    seller_id: SUPPORT_AGENT_ID,
    product_id: null,
    last_message_at: "2026-04-23T09:42:00-04:00",
    product: null,
    otherId: SUPPORT_AGENT_ID,
    otherName: "Suporte Tecnico AGS",
  };
}

function buildSupportMessages(): Msg[] {
  return [
    {
      id: "support-msg-1",
      conversation_id: SUPPORT_CONVERSATION_ID,
      sender_id: SUPPORT_AGENT_ID,
      body: "Olá! Aqui é o suporte técnico do Sistema Verde da Amazônia. Estou acompanhando seu atendimento.",
      created_at: "2026-04-23T09:40:00-04:00",
    },
    {
      id: "support-msg-2",
      conversation_id: SUPPORT_CONVERSATION_ID,
      sender_id: SUPPORT_AGENT_ID,
      body: "Se precisar, descreva o problema ou dúvida por aqui que eu sigo com você até resolver.",
      created_at: "2026-04-23T09:42:00-04:00",
    },
  ];
}

function buildCommunityConversation(userId: string): Conv {
  return {
    id: COMMUNITY_CONVERSATION_ID,
    buyer_id: userId,
    seller_id: COMMUNITY_AGENT_ID,
    product_id: null,
    last_message_at: "2026-04-23T10:18:00-04:00",
    product: null,
    otherId: COMMUNITY_AGENT_ID,
    otherName: "Comunidade de Produtores",
  };
}

function buildCommunityMessages(): Msg[] {
  return [
    {
      id: "community-msg-1",
      conversation_id: COMMUNITY_CONVERSATION_ID,
      sender_id: COMMUNITY_AGENT_ID,
      body: "Bem-vindos à Comunidade Geral. Este espaço é para trocar experiências, divulgar eventos agrícolas e combinar trocas de insumos entre produtores.",
      created_at: "2026-04-23T10:05:00-04:00",
    },
    {
      id: "community-msg-2",
      conversation_id: COMMUNITY_CONVERSATION_ID,
      sender_id: COMMUNITY_AGENT_ID,
      body: "Feira de sementes crioulas confirmada para sábado, às 8h, no Centro Rural de Manaus. Quem quiser participar pode responder por aqui.",
      created_at: "2026-04-23T10:12:00-04:00",
    },
    {
      id: "community-msg-3",
      conversation_id: COMMUNITY_CONVERSATION_ID,
      sender_id: COMMUNITY_AGENT_ID,
      body: "Também está liberado anunciar trocas de mudas, biofertilizantes, composto orgânico e ferramentas leves entre produtores da rede.",
      created_at: "2026-04-23T10:18:00-04:00",
    },
  ];
}

function getConversationSection(conv: Conv, userId: string): ChatSection {
  const other = conv.otherName.toLowerCase();
  if (other.includes("suporte") || other.includes("atendimento") || other.includes("admin")) return "support";
  if (!conv.product_id) return "community";
  if (conv.buyer_id === userId) return "purchases";
  return "sales";
}

function formatHour(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "US";
}

function Chat() {
  const { user } = useAuth();
  const router = useRouter();
  const { c } = Route.useSearch();
  const [convs, setConvs] = useState<Conv[]>([]);
  const [active, setActive] = useState<string | null>(c ?? null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [supportMessages, setSupportMessages] = useState<Msg[]>(buildSupportMessages);
  const [communityMessages, setCommunityMessages] = useState<Msg[]>(buildCommunityMessages);
  const [text, setText] = useState("");
  const [section, setSection] = useState<ChatSection>("purchases");
  const [query, setQuery] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("conversations")
        .select("id, buyer_id, seller_id, product_id, last_message_at, product:product_id(name, photo_url)")
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("last_message_at", { ascending: false });

      const rows = (data ?? []) as unknown as ConvRow[];
      const otherIds = [...new Set(rows.map((row) => row.buyer_id === user.id ? row.seller_id : row.buyer_id))];
      const { data: profs } = otherIds.length
        ? await supabase.from("profiles").select("user_id, display_name").in("user_id", otherIds)
        : { data: [] as { user_id: string; display_name: string }[] };

      const nameMap = new Map((profs ?? []).map((profile) => [profile.user_id, profile.display_name]));
      const normalized = rows.map((row) => {
        const otherId = row.buyer_id === user.id ? row.seller_id : row.buyer_id;
        return {
          ...row,
          otherId,
          otherName: nameMap.get(otherId) ?? "Usuario",
        };
      });
      const supportConv = buildSupportConversation(user.id);
      const communityConv = buildCommunityConversation(user.id);
      const merged = [...normalized];
      if (!merged.some((conv) => conv.id === COMMUNITY_CONVERSATION_ID)) {
        merged.unshift(communityConv);
      }
      if (!merged.some((conv) => conv.id === SUPPORT_CONVERSATION_ID)) {
        merged.unshift(supportConv);
      }

      setConvs(merged);
      if (!c) {
        const firstRealConversation = normalized[0];
        if (firstRealConversation) {
          setActive(firstRealConversation.id);
          setSection(getConversationSection(firstRealConversation, user.id));
        } else {
          setSection("support");
          setActive(SUPPORT_CONVERSATION_ID);
        }
      } else if (!active && merged.length) {
        setActive(merged[0].id);
      }
    })();
  }, [user, c]);

  useEffect(() => {
    if (!active || !user) return;
    const current = convs.find((conv) => conv.id === active);
    if (current) {
      setSection(getConversationSection(current, user.id));
    }
  }, [active, convs, user]);

  useEffect(() => {
    if (!active) {
      setMessages([]);
      return;
    }
    if (active === SUPPORT_CONVERSATION_ID) {
      setMessages(supportMessages);
      return;
    }
    if (active === COMMUNITY_CONVERSATION_ID) {
      setMessages(communityMessages);
      return;
    }

    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("messages").select("*").eq("conversation_id", active).order("created_at");
      if (!cancelled) setMessages((data ?? []) as Msg[]);
    })();

    const channel = supabase.channel(`msg-${active}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${active}` },
        (payload) => setMessages((prev) => [...prev, payload.new as Msg]),
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [active, supportMessages, communityMessages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !active || !text.trim()) return;

    const body = text.trim().slice(0, 2000);
    setText("");
    if (active === SUPPORT_CONVERSATION_ID) {
      const now = new Date();
      const userMessage: Msg = {
        id: `support-user-${now.getTime()}`,
        conversation_id: SUPPORT_CONVERSATION_ID,
        sender_id: user.id,
        body,
        created_at: now.toISOString(),
      };
      setSupportMessages((prev) => [...prev, userMessage]);
      setConvs((prev) => prev.map((conv) => (
        conv.id === SUPPORT_CONVERSATION_ID ? { ...conv, last_message_at: now.toISOString() } : conv
      )));

      window.setTimeout(() => {
        const replyTime = new Date();
        const agentReply: Msg = {
          id: `support-agent-${replyTime.getTime()}`,
          conversation_id: SUPPORT_CONVERSATION_ID,
          sender_id: SUPPORT_AGENT_ID,
          body: "Recebi sua mensagem. Vou seguir com você por aqui e já estou analisando o atendimento para te orientar no próximo passo.",
          created_at: replyTime.toISOString(),
        };
        setSupportMessages((prev) => [...prev, agentReply]);
        setConvs((prev) => prev.map((conv) => (
          conv.id === SUPPORT_CONVERSATION_ID ? { ...conv, last_message_at: replyTime.toISOString() } : conv
        )));
      }, 900);
      return;
    }
    if (active === COMMUNITY_CONVERSATION_ID) {
      const now = new Date();
      const userMessage: Msg = {
        id: `community-user-${now.getTime()}`,
        conversation_id: COMMUNITY_CONVERSATION_ID,
        sender_id: user.id,
        body,
        created_at: now.toISOString(),
      };
      setCommunityMessages((prev) => [...prev, userMessage]);
      setConvs((prev) => prev.map((conv) => (
        conv.id === COMMUNITY_CONVERSATION_ID ? { ...conv, last_message_at: now.toISOString() } : conv
      )));
      return;
    }

    const { error } = await supabase.from("messages").insert({
      conversation_id: active,
      sender_id: user.id,
      body,
    });

    if (!error) {
      await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", active);
    }
  };

  const counts: Record<ChatSection, number> = {
    support: 0,
    community: 0,
    purchases: 0,
    sales: 0,
  };

  if (user) {
    convs.forEach((conv) => {
      counts[getConversationSection(conv, user.id)] += 1;
    });
  }

  const filteredConvs = convs.filter((conv) => {
    if (!user) return false;
    const matchesSection = getConversationSection(conv, user.id) === section;
    const haystack = `${conv.otherName} ${conv.product?.name ?? ""}`.toLowerCase();
    const matchesQuery = haystack.includes(query.trim().toLowerCase());
    return matchesSection && matchesQuery;
  });

  const activeConv = convs.find((conv) => conv.id === active);
  const activeIsSupport = activeConv?.id === SUPPORT_CONVERSATION_ID;
  const activeIsCommunity = activeConv?.id === COMMUNITY_CONVERSATION_ID;

  return (
    <div className="space-y-5">
      <header className="flex items-start gap-4 rounded-[2rem] border border-border/50 bg-gradient-soft px-5 py-5 shadow-card">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary">
          <MessageCircle className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-semibold">Mensagens</h1>
          <p className="mt-1 text-sm text-muted-foreground">Fale com vendedores, compradores e equipe de atendimento.</p>
        </div>
      </header>

      <div className="grid gap-2 rounded-2xl border border-border/60 bg-muted/40 p-1 md:grid-cols-2 xl:grid-cols-4">
        {CHAT_SECTIONS.map(({ id, label, Icon }) => {
          const selected = section === id;
          const count = counts[id];
          return (
            <button
              key={id}
              type="button"
              onClick={() => setSection(id)}
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
                selected ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:bg-card/70"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              {count > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <Card className="overflow-hidden rounded-[1.75rem] border-border/60 shadow-card xl:max-h-[72vh]">
          <CardContent className="flex h-full flex-col p-0">
            <div className="border-b border-border/60 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">{CHAT_SECTIONS.find((item) => item.id === section)?.label}</h2>
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  {filteredConvs.length}
                </span>
              </div>

              <div className="relative mt-4">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar conversa..."
                  className="h-11 rounded-xl border-border/70 bg-background pl-10"
                />
              </div>
            </div>

            {convs.length === 0 ? (
              <div className="p-6">
                <EmptyState icon={<MessageCircle className="h-8 w-8" />} title="Sem conversas ainda" description="Abra um produto no mercado e clique em falar com vendedor." />
              </div>
            ) : filteredConvs.length === 0 ? (
              <div className="p-6">
                <EmptyState icon={<Search className="h-8 w-8" />} title="Nenhuma conversa encontrada" description="Tente mudar a aba ou buscar por outro nome." />
              </div>
            ) : (
              <ul className="flex-1 space-y-3 overflow-y-auto p-4">
                {filteredConvs.map((conv) => {
                  const selected = active === conv.id;
                  const preview = conv.id === SUPPORT_CONVERSATION_ID
                    ? "Atendimento: como podemos ajudar?"
                    : conv.id === COMMUNITY_CONVERSATION_ID
                      ? "Eventos, trocas de insumos e avisos da rede"
                    : conv.product?.name ? `Atendimento: ${conv.product.name}` : "Conversa aberta";
                  const isSupport = user ? getConversationSection(conv, user.id) === "support" : false;

                  return (
                    <li key={conv.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setActive(conv.id);
                          router.navigate({ to: "/chat", search: { c: conv.id } });
                        }}
                        className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left transition ${
                          selected
                            ? "border-primary/20 bg-secondary shadow-soft"
                            : "border-border/50 bg-card hover:bg-muted/40"
                        }`}
                      >
                        <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-primary">
                          {getInitials(conv.otherName)}
                          <span className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-card ${isSupport ? "bg-leaf" : "bg-primary/70"}`} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <div className="truncate text-base font-semibold">{conv.otherName}</div>
                            <span className="text-xs text-muted-foreground">{formatHour(conv.last_message_at)}</span>
                          </div>
                          <div className="truncate text-sm text-muted-foreground">{preview}</div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="flex min-h-[72vh] flex-col overflow-hidden rounded-[1.75rem] border-border/60 shadow-card">
          {!activeConv ? (
            <div className="flex flex-1 items-center justify-center p-6">
              <EmptyState icon={<MessageCircle className="h-10 w-10" />} title="Selecione uma conversa" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b border-border/60 bg-card px-5 py-6">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-primary">
                  {getInitials(activeConv.otherName)}
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-card bg-leaf" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-2xl font-semibold">{activeConv.otherName}</div>
                  <div className="text-sm text-primary">
                    {activeIsSupport ? SUPPORT_STATUS : activeIsCommunity ? COMMUNITY_STATUS : "Atendimento online"}
                  </div>
                  {activeConv.product && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <ShoppingBag className="h-3 w-3" /> Referente a {activeConv.product.name}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto bg-background p-5">
                {messages.length === 0 && (
                  <p className="text-center text-xs text-muted-foreground">Envie a primeira mensagem.</p>
                )}

                {messages.map((message) => {
                  const mine = message.sender_id === user?.id;
                  return (
                    <div key={message.id} className={`flex items-start gap-3 ${mine ? "justify-end" : "justify-start"}`}>
                      {!mine && (
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-primary">
                          {getInitials(activeConv.otherName)}
                        </div>
                      )}

                      <div className={`flex max-w-[82%] flex-col ${mine ? "items-end" : "items-start"}`}>
                        <div className={`rounded-[1.35rem] px-4 py-3 text-sm leading-6 ${
                          mine
                            ? "rounded-br-md bg-primary text-primary-foreground"
                            : "rounded-bl-md bg-secondary text-secondary-foreground"
                        }`}>
                          <div>{message.body}</div>
                        </div>
                        <div className="mt-1 px-1 text-[11px] text-muted-foreground">{ptDateTime(message.created_at)}</div>
                      </div>
                    </div>
                  );
                })}

                <div ref={endRef} />
              </div>

              <form onSubmit={send} className="flex items-center gap-3 border-t border-border/60 bg-card p-4">
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  maxLength={2000}
                  className="h-12 rounded-xl border-border/70 bg-background"
                />
                <Button type="submit" size="icon" className="h-12 w-12 rounded-xl bg-gradient-forest" disabled={!text.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
