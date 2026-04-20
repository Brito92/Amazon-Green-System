"use client"

import { useMemo, useState, useEffect } from "react"
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
  Shield,
  Hash,
  Coins,
  Leaf,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useMarketplace, type Negociacao } from "@/contexts/marketplace-context"

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

// Conversas de suporte e comunidade (estaticas)
const baseConversations: Conversation[] = [
  {
    id: "sup-1",
    category: "suporte",
    name: "Suporte Tecnico AGS",
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
        content: "Ola! Aqui e o suporte tecnico do Sistema Verde da Amazonia. Em que posso ajudar?",
        time: "09:40",
        isOwn: false,
      },
      {
        id: "m2",
        sender: "Suporte AGS",
        avatar: "ST",
        content: "Pode relatar o problema ou duvida e envio para a equipe responsavel.",
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
    lastMessage: "Maria: Alguem tem dicas sobre Acai?",
    time: "10:30",
    unread: 3,
    online: true,
    members: 24,
    messages: [
      {
        id: "c1",
        sender: "Maria Silva",
        avatar: "MS",
        content: "Ola pessoal! Alguem tem dicas sobre o cultivo de Acai em area de varzea?",
        time: "10:25",
        isOwn: false,
      },
      {
        id: "c2",
        sender: "Joao Santos",
        avatar: "JS",
        content:
          "Na varzea e importante cuidar da drenagem. O Acai gosta de umidade mas nao de encharcamento constante.",
        time: "10:27",
        isOwn: false,
      },
      {
        id: "c3",
        sender: "Voce",
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
        content: "Pessoal, quem quer trocar sementes de Cupuacu por Castanha-do-Para?",
        time: "Ontem",
        isOwn: false,
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
    label: "Suporte tecnico",
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
    description: "Negociacoes dos produtos que voce esta comprando",
  },
  {
    id: "vendas",
    label: "Vendas",
    shortLabel: "Vendas",
    icon: Store,
    description: "Negociacoes dos produtos que voce esta vendendo",
  },
]

function statusBadge(status: ProductStatus | "disponivel" | "reservado" | "vendido") {
  if (status === "disponivel") {
    return (
      <Badge className="bg-primary/15 text-primary border border-primary/30 hover:bg-primary/20">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Disponivel
      </Badge>
    )
  }
  if (status === "reservado") {
    return (
      <Badge className="bg-accent/15 text-accent border border-accent/30">
        <Package className="mr-1 h-3 w-3" />
        Reservado
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

interface ChatScreenProps {
  initialCategory?: ChatCategory
}

export function ChatScreen({ initialCategory }: ChatScreenProps) {
  const {
    minhasCompras,
    minhasVendas,
    negociacaoAtiva,
    setNegociacaoAtiva,
    enviarMensagem,
  } = useMarketplace()

  const [activeCategory, setActiveCategory] = useState<ChatCategory>(initialCategory || "suporte")
  const [selectedId, setSelectedId] = useState<string>("sup-1")
  const [messagesByConv, setMessagesByConv] = useState<Record<string, Message[]>>(() =>
    Object.fromEntries(baseConversations.map((c) => [c.id, c.messages]))
  )
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  // Se tiver uma negociacao ativa, muda para a aba de compras
  useEffect(() => {
    if (negociacaoAtiva) {
      setActiveCategory("compras")
      setSelectedId(negociacaoAtiva.id)
    }
  }, [negociacaoAtiva])

  // Converte negociacoes do marketplace para o formato de conversas
  const comprasConversations: Conversation[] = useMemo(
    () =>
      minhasCompras.map((neg) => ({
        id: neg.id,
        category: "compras" as ChatCategory,
        name: neg.vendedorNome,
        avatar: neg.vendedorAvatar,
        lastMessage: neg.mensagens[neg.mensagens.length - 1]?.conteudo || "Sem mensagens",
        time: neg.mensagens[neg.mensagens.length - 1]?.horario || neg.dataCriacao,
        unread: neg.status === "ativa" ? 1 : 0,
        online: neg.status === "ativa",
        product: {
          name: neg.produto.nome,
          image: neg.produto.tipo === "fruto" ? "fruto" : "muda",
          price: `R$ ${neg.produto.precoReais.toFixed(2)}`,
          status: neg.produto.status as ProductStatus,
          category: neg.produto.tipo === "fruto" ? "Frutos" : "Mudas",
        },
        messages: neg.mensagens.map((m) => ({
          id: m.id,
          sender: m.remetenteNome,
          avatar: m.remetenteAvatar,
          content: m.conteudo,
          time: m.horario,
          isOwn: m.isOwn,
        })),
      })),
    [minhasCompras]
  )

  const vendasConversations: Conversation[] = useMemo(
    () =>
      minhasVendas.map((neg) => ({
        id: neg.id,
        category: "vendas" as ChatCategory,
        name: neg.compradorNome,
        avatar: neg.compradorAvatar,
        lastMessage: neg.mensagens[neg.mensagens.length - 1]?.conteudo || "Sem mensagens",
        time: neg.mensagens[neg.mensagens.length - 1]?.horario || neg.dataCriacao,
        unread: neg.status === "ativa" ? 1 : 0,
        online: neg.status === "ativa",
        product: {
          name: neg.produto.nome,
          image: neg.produto.tipo === "fruto" ? "fruto" : "muda",
          price: `R$ ${neg.produto.precoReais.toFixed(2)}`,
          status: neg.produto.status as ProductStatus,
          category: neg.produto.tipo === "fruto" ? "Frutos" : "Mudas",
        },
        messages: neg.mensagens.map((m) => ({
          id: m.id,
          sender: m.remetenteNome,
          avatar: m.remetenteAvatar,
          content: m.conteudo,
          time: m.horario,
          isOwn: m.isOwn,
        })),
      })),
    [minhasVendas]
  )

  // Todas as conversas combinadas
  const allConversations = useMemo(
    () => [...baseConversations, ...comprasConversations, ...vendasConversations],
    [comprasConversations, vendasConversations]
  )

  const conversationsByCategory = useMemo(
    () => allConversations.filter((c) => c.category === activeCategory),
    [activeCategory, allConversations]
  )

  const filteredConversations = conversationsByCategory.filter((conv) => {
    const q = searchQuery.toLowerCase()
    return conv.name.toLowerCase().includes(q) || (conv.product?.name.toLowerCase().includes(q) ?? false)
  })

  const selectedConversation =
    allConversations.find((c) => c.id === selectedId && c.category === activeCategory) ??
    conversationsByCategory[0]

  // Para negociacoes, busca as mensagens atualizadas do contexto
  const currentMessages = useMemo(() => {
    if (!selectedConversation) return []

    // Se for uma negociacao (compra ou venda), busca do contexto
    if (activeCategory === "compras") {
      const negociacao = minhasCompras.find((n) => n.id === selectedConversation.id)
      if (negociacao) {
        return negociacao.mensagens.map((m) => ({
          id: m.id,
          sender: m.remetenteNome,
          avatar: m.remetenteAvatar,
          content: m.conteudo,
          time: m.horario,
          isOwn: m.isOwn,
        }))
      }
    }

    if (activeCategory === "vendas") {
      const negociacao = minhasVendas.find((n) => n.id === selectedConversation.id)
      if (negociacao) {
        return negociacao.mensagens.map((m) => ({
          id: m.id,
          sender: m.remetenteNome,
          avatar: m.remetenteAvatar,
          content: m.conteudo,
          time: m.horario,
          isOwn: m.isOwn,
        }))
      }
    }

    // Para suporte e comunidade, usa o estado local
    return messagesByConv[selectedConversation.id] ?? selectedConversation.messages
  }, [selectedConversation, activeCategory, minhasCompras, minhasVendas, messagesByConv])

  const handleSelectCategory = (category: ChatCategory) => {
    setActiveCategory(category)
    setSearchQuery("")
    setNegociacaoAtiva(null)
    const first = allConversations.find((c) => c.category === category)
    if (first) setSelectedId(first.id)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    // Se for uma negociacao, envia via contexto
    if (activeCategory === "compras" || activeCategory === "vendas") {
      enviarMensagem(selectedConversation.id, newMessage)
    } else {
      // Para suporte e comunidade, usa estado local
      const message: Message = {
        id: `${Date.now()}`,
        sender: "Voce",
        avatar: "EU",
        content: newMessage,
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        isOwn: true,
      }

      setMessagesByConv((prev) => ({
        ...prev,
        [selectedConversation.id]: [...(prev[selectedConversation.id] ?? []), message],
      }))
    }

    setNewMessage("")
  }

  const activeMeta = categories.find((c) => c.id === activeCategory)!
  const ActiveIcon = activeMeta.icon

  // Busca a negociacao selecionada para mostrar detalhes do produto
  const selectedNegociacao: Negociacao | undefined = useMemo(() => {
    if (activeCategory === "compras") {
      return minhasCompras.find((n) => n.id === selectedConversation?.id)
    }
    if (activeCategory === "vendas") {
      return minhasVendas.find((n) => n.id === selectedConversation?.id)
    }
    return undefined
  }, [activeCategory, selectedConversation, minhasCompras, minhasVendas])

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
      <Tabs value={activeCategory} onValueChange={(value) => handleSelectCategory(value as ChatCategory)}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          {categories.map((cat) => {
            const Icon = cat.icon
            let count = 0
            if (cat.id === "compras") {
              count = comprasConversations.length
            } else if (cat.id === "vendas") {
              count = vendasConversations.length
            } else {
              count = baseConversations.filter((c) => c.category === cat.id).length
            }
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
                    {activeCategory === "compras" ? (
                      <div className="space-y-2">
                        <ShoppingCart className="h-8 w-8 mx-auto text-muted-foreground/50" />
                        <p>Nenhuma negociacao de compra</p>
                        <p className="text-xs">
                          Acesse o Mercado para comprar produtos
                        </p>
                      </div>
                    ) : activeCategory === "vendas" ? (
                      <div className="space-y-2">
                        <Store className="h-8 w-8 mx-auto text-muted-foreground/50" />
                        <p>Nenhuma negociacao de venda</p>
                        <p className="text-xs">
                          Cadastre produtos para comecar a vender
                        </p>
                      </div>
                    ) : (
                      "Nenhuma conversa encontrada."
                    )}
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
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{conv.time}</span>
                        </div>

                        {conv.product ? (
                          <div className="mt-1 space-y-1">
                            <div className="flex items-center gap-1.5 text-xs">
                              {conv.product.image === "fruto" ? (
                                <Package className="h-4 w-4 text-accent" />
                              ) : (
                                <Leaf className="h-4 w-4 text-primary" />
                              )}
                              <span className="truncate text-foreground/80">{conv.product.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {statusBadge(conv.product.status)}
                              <span className="text-xs text-muted-foreground">{conv.product.price}</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                        )}
                      </div>
                      {conv.unread > 0 && (
                        <Badge className="bg-primary text-primary-foreground">{conv.unread}</Badge>
                      )}
                    </button>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Area de Chat */}
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
                    <CardTitle className="text-lg truncate">{selectedConversation.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {activeCategory === "compras" && "Negociacao de compra"}
                      {activeCategory === "vendas" && "Negociacao de venda"}
                      {activeCategory === "comunidade" &&
                        (selectedConversation.members
                          ? `${selectedConversation.members} membros`
                          : "Grupo da comunidade")}
                      {activeCategory === "suporte" &&
                        (selectedConversation.online ? "Atendimento online" : "Atendimento offline")}
                    </p>
                  </div>
                  {activeCategory === "comunidade" && selectedConversation.members && (
                    <Badge variant="outline" className="ml-auto">
                      <Users className="mr-1 h-3 w-3" />
                      {selectedConversation.members} membros
                    </Badge>
                  )}
                </div>

                {/* Detalhes do Produto (compra/venda) - Versao melhorada com dados do contexto */}
                {selectedNegociacao && (
                  <div className="rounded-lg border bg-muted/40 p-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-md ${
                          selectedNegociacao.produto.tipo === "fruto"
                            ? "bg-accent/10 text-accent"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {selectedNegociacao.produto.tipo === "fruto" ? (
                          <Package className="h-6 w-6" />
                        ) : (
                          <Leaf className="h-6 w-6" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium truncate">{selectedNegociacao.produto.nome}</p>
                          {statusBadge(selectedNegociacao.produto.status)}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                          <span>
                            Quantidade:{" "}
                            <span className="text-foreground/80">
                              {selectedNegociacao.produto.quantidade} {selectedNegociacao.produto.unidade}
                            </span>
                          </span>
                          <span>
                            Valor:{" "}
                            <span className="text-primary font-semibold">
                              R$ {selectedNegociacao.produto.precoReais.toFixed(2)}
                            </span>
                          </span>
                          {selectedNegociacao.produto.precoPontos && (
                            <span className="flex items-center gap-1">
                              <Coins className="h-3 w-3 text-accent" />
                              <span className="text-accent font-semibold">
                                {selectedNegociacao.produto.precoPontos} pts
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Selo Blockchain */}
                    <div className="mt-3 p-2 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-2 text-xs">
                        <Shield className="h-3 w-3 text-primary" />
                        <span className="text-primary font-medium">Origem Verificada em Blockchain</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Hash className="h-3 w-3 text-muted-foreground" />
                        <code className="text-xs font-mono text-muted-foreground truncate">
                          {selectedNegociacao.produto.hashBlockchain}
                        </code>
                      </div>
                    </div>
                  </div>
                )}

                {/* Detalhes do Produto (versao antiga para conversas estaticas) */}
                {selectedConversation.product && !selectedNegociacao && (
                  <div className="rounded-lg border bg-muted/40 p-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-md ${
                          selectedConversation.product.image === "fruto"
                            ? "bg-accent/10 text-accent"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {selectedConversation.product.image === "fruto" ? (
                          <Package className="h-6 w-6" />
                        ) : (
                          <Leaf className="h-6 w-6" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium truncate">{selectedConversation.product.name}</p>
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
                            <span className="text-foreground/80">{selectedConversation.name}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Selecione uma conversa para comecar</p>
              </div>
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
                          message.isOwn ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"
                        )}
                      >
                        {message.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn("max-w-[70%] space-y-1", message.isOwn && "items-end")}
                    >
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2",
                          message.isOwn
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted rounded-bl-md"
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <p
                        className={cn(
                          "text-xs text-muted-foreground",
                          message.isOwn && "text-right"
                        )}
                      >
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>

          {/* Input de Mensagem */}
          <div className="border-t p-4">
            {canSend ? (
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Enviar mensagem</span>
                </Button>
              </form>
            ) : (
              <div className="text-center py-2">
                <p className="text-sm text-muted-foreground">
                  Esta negociacao foi finalizada
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
