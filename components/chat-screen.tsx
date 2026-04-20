"use client"

import { useMemo, useState } from "react"
import {
  Send,
  Users,
  Search,
  MessageCircle,
  LifeBuoy,
  ShoppingCart,
  Store,
  Package,
  CheckCircle2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type ChatCategory = "suporte" | "comunidade" | "compras" | "vendas"
type ProductStatus = "disponivel" | "vendido"

interface Message {
  id: string
  sender: string
  avatar: string
  content: string
  time: string
  isOwn: boolean
}

interface ProductInfo {
  name: string
  image: string
  price: string
  status: ProductStatus
  category: string
}

interface Conversation {
  id: string
  category: ChatCategory
  name: string
  avatar: string
  lastMessage: string
  time: string
  unread: number
  online: boolean
  members?: number
  product?: ProductInfo
  messages: Message[]
}

const conversations: Conversation[] = [
  {
    id: "sup-1",
    category: "suporte",
    name: "Suporte Técnico AGS",
    avatar: "ST",
    lastMessage: "Atendimento: como podemos ajudar?",
    time: "09:42",
    unread: 1,
    online: true,
    messages: [
      {
        id: "m1",
        sender: "Suporte AGS",
        avatar: "ST",
        content: "Olá! Aqui é o suporte técnico do Sistema Verde da Amazônia. Em que posso ajudar?",
        time: "09:40",
        isOwn: false,
      },
      {
        id: "m2",
        sender: "Suporte AGS",
        avatar: "ST",
        content: "Pode relatar o problema ou dúvida e envio para a equipe responsável.",
        time: "09:42",
        isOwn: false,
      },
    ],
  },
  {
    id: "com-1",
    category: "comunidade",
    name: "Comunidade Produtores",
    avatar: "CP",
    lastMessage: "Maria: Alguém tem dicas sobre Açaí?",
    time: "10:30",
    unread: 3,
    online: true,
    members: 24,
    messages: [
      {
        id: "c1",
        sender: "Maria Silva",
        avatar: "MS",
        content: "Olá pessoal! Alguém tem dicas sobre o cultivo de Açaí em área de várzea?",
        time: "10:25",
        isOwn: false,
      },
      {
        id: "c2",
        sender: "João Santos",
        avatar: "JS",
        content: "Na várzea é importante cuidar da drenagem. O Açaí gosta de umidade mas não de encharcamento constante.",
        time: "10:27",
        isOwn: false,
      },
      {
        id: "c3",
        sender: "Você",
        avatar: "EU",
        content: "Eu uso cobertura morta para ajudar a regular a umidade. Funciona muito bem!",
        time: "10:28",
        isOwn: true,
      },
    ],
  },
  {
    id: "com-2",
    category: "comunidade",
    name: "Reflorestamento & Trocas",
    avatar: "RT",
    lastMessage: "Ana: Vamos trocar sementes?",
    time: "Ontem",
    unread: 0,
    online: false,
    members: 12,
    messages: [
      {
        id: "c4",
        sender: "Ana Costa",
        avatar: "AC",
        content: "Pessoal, quem quer trocar sementes de Cupuaçu por Castanha-do-Pará?",
        time: "Ontem",
        isOwn: false,
      },
    ],
  },
  {
    id: "buy-1",
    category: "compras",
    name: "Maria Silva",
    avatar: "MS",
    lastMessage: "A muda já foi separada, podemos combinar a retirada.",
    time: "11:10",
    unread: 2,
    online: true,
    product: {
      name: "Mudas de Açaí (10 unidades)",
      image: "🌱",
      price: "250 pts",
      status: "disponivel",
      category: "Mudas",
    },
    messages: [
      {
        id: "b1",
        sender: "Maria Silva",
        avatar: "MS",
        content: "Oi! Interessada no kit de mudas de Açaí, ainda está disponível?",
        time: "10:58",
        isOwn: true,
      },
      {
        id: "b2",
        sender: "Produtor",
        avatar: "PR",
        content: "Sim, separei 10 unidades selecionadas. Posso enviar nesta semana.",
        time: "11:05",
        isOwn: false,
      },
      {
        id: "b3",
        sender: "Produtor",
        avatar: "PR",
        content: "A muda já foi separada, podemos combinar a retirada.",
        time: "11:10",
        isOwn: false,
      },
    ],
  },
  {
    id: "buy-2",
    category: "compras",
    name: "João Santos",
    avatar: "JS",
    lastMessage: "Obrigado! Retirada confirmada.",
    time: "Ontem",
    unread: 0,
    online: false,
    product: {
      name: "Kit de Adubos Orgânicos",
      image: "📦",
      price: "200 pts",
      status: "vendido",
      category: "Insumos",
    },
    messages: [
      {
        id: "b4",
        sender: "Você",
        avatar: "EU",
        content: "Bom dia! Gostaria de confirmar a compra do kit de adubos.",
        time: "Ontem",
        isOwn: true,
      },
      {
        id: "b5",
        sender: "João Santos",
        avatar: "JS",
        content: "Tudo certo, item marcado como vendido. Obrigado!",
        time: "Ontem",
        isOwn: false,
      },
    ],
  },
  {
    id: "sell-1",
    category: "vendas",
    name: "Ana Costa",
    avatar: "AC",
    lastMessage: "Gostaria de ver mais fotos das mudas.",
    time: "09:20",
    unread: 1,
    online: true,
    product: {
      name: "Mudas de Cupuaçu (5 unidades)",
      image: "🌿",
      price: "150 pts",
      status: "disponivel",
      category: "Mudas",
    },
    messages: [
      {
        id: "s1",
        sender: "Ana Costa",
        avatar: "AC",
        content: "Olá! As mudas de Cupuaçu ainda estão à venda?",
        time: "09:15",
        isOwn: false,
      },
      {
        id: "s2",
        sender: "Ana Costa",
        avatar: "AC",
        content: "Gostaria de ver mais fotos das mudas.",
        time: "09:20",
        isOwn: false,
      },
    ],
  },
  {
    id: "sell-2",
    category: "vendas",
    name: "Pedro Lima",
    avatar: "PL",
    lastMessage: "Pagamento confirmado, obrigado!",
    time: "2 dias",
    unread: 0,
    online: false,
    product: {
      name: "Consultoria Técnica com Agrônomo",
      image: "👨‍🌾",
      price: "350 pts",
      status: "vendido",
      category: "Serviços",
    },
    messages: [
      {
        id: "s3",
        sender: "Pedro Lima",
        avatar: "PL",
        content: "Fechado! Marco a consultoria para quinta-feira.",
        time: "2 dias",
        isOwn: false,
      },
      {
        id: "s4",
        sender: "Você",
        avatar: "EU",
        content: "Perfeito, até lá!",
        time: "2 dias",
        isOwn: true,
      },
    ],
  },
]

const categories: {
  id: ChatCategory
  label: string
  shortLabel: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}[] = [
  {
    id: "suporte",
    label: "Suporte técnico",
    shortLabel: "Suporte",
    icon: LifeBuoy,
    description: "Fale com nossa equipe de atendimento",
  },
  {
    id: "comunidade",
    label: "Comunidade geral",
    shortLabel: "Comunidade",
    icon: Users,
    description: "Conecte-se com outros produtores",
  },
  {
    id: "compras",
    label: "Compras",
    shortLabel: "Compras",
    icon: ShoppingCart,
    description: "Negociações dos produtos que você está comprando",
  },
  {
    id: "vendas",
    label: "Vendas",
    shortLabel: "Vendas",
    icon: Store,
    description: "Negociações dos produtos que você está vendendo",
  },
]

function statusBadge(status: ProductStatus) {
  if (status === "disponivel") {
    return (
      <Badge className="bg-primary/15 text-primary border border-primary/30 hover:bg-primary/20">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Disponível
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="bg-muted text-muted-foreground">
      <Package className="mr-1 h-3 w-3" />
      Vendido
    </Badge>
  )
}

export function ChatScreen() {
  const [activeCategory, setActiveCategory] = useState<ChatCategory>("suporte")
  const [selectedId, setSelectedId] = useState<string>("sup-1")
  const [messagesByConv, setMessagesByConv] = useState<Record<string, Message[]>>(() =>
    Object.fromEntries(conversations.map((c) => [c.id, c.messages]))
  )
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const conversationsByCategory = useMemo(
    () => conversations.filter((c) => c.category === activeCategory),
    [activeCategory]
  )

  const filteredConversations = conversationsByCategory.filter((conv) => {
    const q = searchQuery.toLowerCase()
    return (
      conv.name.toLowerCase().includes(q) ||
      (conv.product?.name.toLowerCase().includes(q) ?? false)
    )
  })

  const selectedConversation =
    conversations.find((c) => c.id === selectedId && c.category === activeCategory) ??
    conversationsByCategory[0]

  const currentMessages = selectedConversation
    ? messagesByConv[selectedConversation.id] ?? []
    : []

  const handleSelectCategory = (category: ChatCategory) => {
    setActiveCategory(category)
    setSearchQuery("")
    const first = conversations.find((c) => c.category === category)
    if (first) setSelectedId(first.id)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    const message: Message = {
      id: `${Date.now()}`,
      sender: "Você",
      avatar: "EU",
      content: newMessage,
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      isOwn: true,
    }

    setMessagesByConv((prev) => ({
      ...prev,
      [selectedConversation.id]: [...(prev[selectedConversation.id] ?? []), message],
    }))
    setNewMessage("")
  }

  const activeMeta = categories.find((c) => c.id === activeCategory)!
  const ActiveIcon = activeMeta.icon

  const canSend =
    selectedConversation !== undefined &&
    (selectedConversation.product?.status !== "vendido" || activeCategory !== "compras")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
          <MessageCircle className="h-6 w-6 text-secondary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Mensagens</h1>
          <p className="text-muted-foreground">{activeMeta.description}</p>
        </div>
      </div>

      {/* Tabs de categorias de chat */}
      <Tabs
        value={activeCategory}
        onValueChange={(value) => handleSelectCategory(value as ChatCategory)}
      >
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          {categories.map((cat) => {
            const Icon = cat.icon
            const count = conversations.filter((c) => c.category === cat.id).length
            return (
              <TabsTrigger key={cat.id} value={cat.id} className="gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{cat.label}</span>
                <span className="sm:hidden">{cat.shortLabel}</span>
                {count > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>

      <div className="grid gap-4 lg:grid-cols-3 h-[calc(100vh-340px)] min-h-[500px]">
        {/* Lista de Conversas */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <ActiveIcon className="h-4 w-4 text-primary" />
                {activeMeta.label}
              </CardTitle>
              <Badge variant="secondary">{conversationsByCategory.length}</Badge>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={
                  activeCategory === "compras" || activeCategory === "vendas"
                    ? "Buscar por produto ou contato..."
                    : "Buscar conversa..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-1 p-2">
                {filteredConversations.length === 0 && (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    Nenhuma conversa encontrada.
                  </div>
                )}
                {filteredConversations.map((conv) => {
                  const isSelected = selectedConversation?.id === conv.id
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedId(conv.id)}
                      className={cn(
                        "w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left",
                        isSelected ? "bg-primary/10" : "hover:bg-muted"
                      )}
                    >
                      <div className="relative">
                        <Avatar>
                          <AvatarFallback className="bg-secondary/20 text-secondary">
                            {conv.avatar}
                          </AvatarFallback>
                        </Avatar>
                        {conv.online && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-primary border-2 border-card" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium truncate">{conv.name}</p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {conv.time}
                          </span>
                        </div>

                        {conv.product ? (
                          <div className="mt-1 space-y-1">
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="text-base leading-none">
                                {conv.product.image}
                              </span>
                              <span className="truncate text-foreground/80">
                                {conv.product.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {statusBadge(conv.product.status)}
                              <span className="text-xs text-muted-foreground">
                                {conv.product.price}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.lastMessage}
                          </p>
                        )}
                      </div>
                      {conv.unread > 0 && (
                        <Badge className="bg-primary text-primary-foreground">
                          {conv.unread}
                        </Badge>
                      )}
                    </button>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Área de Chat */}
        <Card className="lg:col-span-2 flex flex-col">
          {/* Header do Chat */}
          <CardHeader className="border-b pb-3">
            {selectedConversation ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback className="bg-secondary/20 text-secondary">
                        {selectedConversation.avatar}
                      </AvatarFallback>
                    </Avatar>
                    {selectedConversation.online && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-primary border-2 border-card" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">
                      {selectedConversation.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {activeCategory === "compras" && "Negociação de compra"}
                      {activeCategory === "vendas" && "Negociação de venda"}
                      {activeCategory === "comunidade" &&
                        (selectedConversation.members
                          ? `${selectedConversation.members} membros`
                          : "Grupo da comunidade")}
                      {activeCategory === "suporte" &&
                        (selectedConversation.online
                          ? "Atendimento online"
                          : "Atendimento offline")}
                    </p>
                  </div>
                  {activeCategory === "comunidade" && selectedConversation.members && (
                    <Badge variant="outline" className="ml-auto">
                      <Users className="mr-1 h-3 w-3" />
                      {selectedConversation.members} membros
                    </Badge>
                  )}
                </div>

                {/* Detalhes do Produto (compra/venda) */}
                {selectedConversation.product && (
                  <div className="rounded-lg border bg-muted/40 p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-background text-2xl">
                        {selectedConversation.product.image}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium truncate">
                            {selectedConversation.product.name}
                          </p>
                          {statusBadge(selectedConversation.product.status)}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                          <span>
                            Categoria:{" "}
                            <span className="text-foreground/80">
                              {selectedConversation.product.category}
                            </span>
                          </span>
                          <span>
                            Valor:{" "}
                            <span className="text-accent font-semibold">
                              {selectedConversation.product.price}
                            </span>
                          </span>
                          <span>
                            {activeCategory === "compras" ? "Vendedor: " : "Comprador: "}
                            <span className="text-foreground/80">
                              {selectedConversation.name}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <CardTitle className="text-lg">Selecione uma conversa</CardTitle>
            )}
          </CardHeader>

          {/* Mensagens */}
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                {currentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={cn("flex gap-3", message.isOwn && "flex-row-reverse")}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback
                        className={cn(
                          "text-xs",
                          message.isOwn
                            ? "bg-primary/20 text-primary"
                            : "bg-secondary/20 text-secondary"
                        )}
                      >
                        {message.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn("max-w-[70%]", message.isOwn && "text-right")}>
                      {!message.isOwn && (
                        <p className="text-sm font-medium mb-1">{message.sender}</p>
                      )}
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2",
                          message.isOwn
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted rounded-bl-md"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{message.time}</p>
                    </div>
                  </div>
                ))}
                {currentMessages.length === 0 && (
                  <div className="py-16 text-center text-sm text-muted-foreground">
                    Inicie a conversa enviando uma mensagem.
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          {/* Input de Mensagem */}
          <div className="p-4 border-t">
            {!canSend && selectedConversation?.product?.status === "vendido" ? (
              <div className="text-center text-sm text-muted-foreground">
                Este produto já foi marcado como <strong>vendido</strong>. A conversa está
                somente para consulta.
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                  disabled={!selectedConversation}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!newMessage.trim() || !selectedConversation}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
