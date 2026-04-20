"use client"

import { useState } from "react"
import {
  ShoppingBag,
  Coins,
  Check,
  Package,
  Sparkles,
  Leaf,
  Users,
  ArrowRight,
  Shield,
  Hash,
  Store,
  Edit2,
  Trash2,
  MessageCircle,
  Eye,
  Filter,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useMarketplace, type ProdutoVenda } from "@/contexts/marketplace-context"

interface MercadoIncentivosProps {
  onNavigateToChat?: () => void
}

interface Reward {
  id: string
  name: string
  description: string
  points: number
  category: string
  icon: React.ReactNode
  available: boolean
  stock?: number
}

const rewards: Reward[] = [
  {
    id: "1",
    name: "Kit de Adubos Organicos",
    description: "Kit completo com 5kg de adubo organico certificado para fortalecer suas mudas.",
    points: 200,
    category: "Insumos",
    icon: <Package className="h-8 w-8" />,
    available: true,
    stock: 15,
  },
  {
    id: "2",
    name: "Consultoria Tecnica com Agronomo",
    description: "1 hora de consultoria online com agronomo especializado em sistemas agroflorestais.",
    points: 350,
    category: "Servicos",
    icon: <Users className="h-8 w-8" />,
    available: true,
    stock: 8,
  },
  {
    id: "3",
    name: "Mudas de Cupuacu (5 unidades)",
    description: "Receba 5 mudas de Cupuacu de alta qualidade, prontas para plantio.",
    points: 150,
    category: "Mudas",
    icon: <Leaf className="h-8 w-8" />,
    available: true,
    stock: 25,
  },
  {
    id: "4",
    name: "Mudas de Acai (10 unidades)",
    description: "Kit com 10 mudas de Acai selecionadas para alta produtividade.",
    points: 250,
    category: "Mudas",
    icon: <Leaf className="h-8 w-8" />,
    available: true,
    stock: 18,
  },
  {
    id: "5",
    name: "Certificado de Impacto Ambiental",
    description: "Certificado NFT registrado em blockchain comprovando sua contribuicao ambiental.",
    points: 500,
    category: "Digital",
    icon: <Sparkles className="h-8 w-8" />,
    available: true,
    stock: 999,
  },
  {
    id: "6",
    name: "Kit Ferramentas Basicas",
    description: "Kit com pa, enxada e regador para manejo das suas mudas.",
    points: 400,
    category: "Ferramentas",
    icon: <Package className="h-8 w-8" />,
    available: false,
    stock: 0,
  },
]

const rewardCategories = ["Todos", "Insumos", "Servicos", "Mudas", "Digital", "Ferramentas"]
const productCategories = ["Todos", "Frutos", "Mudas"]

export function MercadoIncentivos({ onNavigateToChat }: MercadoIncentivosProps) {
  const [activeTab, setActiveTab] = useState<"produtos" | "incentivos" | "meus-produtos">("produtos")
  const [selectedRewardCategory, setSelectedRewardCategory] = useState("Todos")
  const [selectedProductCategory, setSelectedProductCategory] = useState("Todos")
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<ProdutoVenda | null>(null)
  const [isRewardDialogOpen, setIsRewardDialogOpen] = useState(false)
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<ProdutoVenda | null>(null)
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [redeemSuccess, setRedeemSuccess] = useState(false)

  const {
    produtosOutros,
    meusProdutos,
    removerProduto,
    iniciarNegociacao,
  } = useMarketplace()

  const userPoints = 1580

  const filteredRewards =
    selectedRewardCategory === "Todos"
      ? rewards
      : rewards.filter((r) => r.category === selectedRewardCategory)

  const filteredProducts =
    selectedProductCategory === "Todos"
      ? produtosOutros
      : produtosOutros.filter((p) =>
          selectedProductCategory === "Frutos" ? p.tipo === "fruto" : p.tipo === "muda"
        )

  const handleRedeem = async () => {
    if (!selectedReward) return
    setIsRedeeming(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsRedeeming(false)
    setRedeemSuccess(true)
  }

  const closeRewardDialog = () => {
    setIsRewardDialogOpen(false)
    setSelectedReward(null)
    setRedeemSuccess(false)
  }

  const handleComprar = (produto: ProdutoVenda) => {
    iniciarNegociacao(produto)
    if (onNavigateToChat) {
      onNavigateToChat()
    }
  }

  const handleDeleteProduct = () => {
    if (productToDelete) {
      removerProduto(productToDelete.id)
      setIsDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
            <ShoppingBag className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Mercado</h1>
            <p className="text-muted-foreground">Compre produtos e troque seus pontos</p>
          </div>
        </div>

        {/* Saldo de Pontos */}
        <Card className="w-full md:w-auto">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
              <Coins className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Seu Saldo</p>
              <p className="text-2xl font-bold text-accent">{userPoints.toLocaleString()} pts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="produtos" className="gap-2">
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">Produtos a Venda</span>
            <span className="sm:hidden">Produtos</span>
            {produtosOutros.filter((p) => p.status === "disponivel").length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {produtosOutros.filter((p) => p.status === "disponivel").length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="incentivos" className="gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Incentivos</span>
            <span className="sm:hidden">Pontos</span>
          </TabsTrigger>
          <TabsTrigger value="meus-produtos" className="gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Minhas Ofertas</span>
            <span className="sm:hidden">Ofertas</span>
            {meusProdutos.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {meusProdutos.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab: Produtos a Venda */}
        <TabsContent value="produtos" className="space-y-6 mt-6">
          {/* Blockchain Info */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex items-center gap-4 p-4">
              <Shield className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium">Origem Verificada em Blockchain</p>
                <p className="text-sm text-muted-foreground">
                  Todos os produtos possuem rastreabilidade certificada, garantindo origem sustentavel.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Filtros */}
          <div className="flex flex-wrap gap-2">
            <Filter className="h-4 w-4 text-muted-foreground mt-2" />
            {productCategories.map((category) => (
              <Button
                key={category}
                variant={selectedProductCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedProductCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Grid de Produtos */}
          {filteredProducts.filter((p) => p.status === "disponivel").length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Store className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Nenhum produto disponivel no momento</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Novos produtos serao adicionados em breve
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts
                .filter((p) => p.status === "disponivel")
                .map((produto) => (
                  <Card key={produto.id} className="flex flex-col transition-all hover:border-primary/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div
                          className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                            produto.tipo === "fruto"
                              ? "bg-accent/10 text-accent"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {produto.tipo === "fruto" ? (
                            <Package className="h-7 w-7" />
                          ) : (
                            <Leaf className="h-7 w-7" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {produto.tipo === "fruto" ? "Fruto" : "Muda"}
                          </Badge>
                          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                            <Shield className="h-3 w-3 mr-1" />
                            Verificado
                          </Badge>
                        </div>
                      </div>
                      <CardTitle className="text-lg mt-3">{produto.nome}</CardTitle>
                      <CardDescription className="line-clamp-2">{produto.descricao}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3 flex-1">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Vendedor:</span>
                          <span className="font-medium">{produto.vendedorNome}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Quantidade:</span>
                          <span className="font-medium">
                            {produto.quantidade} {produto.unidade}
                          </span>
                        </div>
                        <div className="border-t pt-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-bold text-primary">
                              R$ {produto.precoReais.toFixed(2)}
                            </span>
                            {produto.precoPontos && (
                              <span className="flex items-center gap-1 text-accent">
                                <Coins className="h-4 w-4" />
                                <span className="font-semibold">{produto.precoPontos} pts</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setSelectedProduct(produto)
                          setIsProductDialogOpen(true)
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Detalhes
                      </Button>
                      <Button className="flex-1" onClick={() => handleComprar(produto)}>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Comprar
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        {/* Tab: Incentivos */}
        <TabsContent value="incentivos" className="space-y-6 mt-6">
          {/* Blockchain Info */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex items-center gap-4 p-4">
              <Sparkles className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium">Rastreamento em Blockchain</p>
                <p className="text-sm text-muted-foreground">
                  Todas as transacoes de pontos sao registradas em blockchain para total transparencia.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Filtros */}
          <div className="flex flex-wrap gap-2">
            {rewardCategories.map((category) => (
              <Button
                key={category}
                variant={selectedRewardCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRewardCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Grid de Recompensas */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRewards.map((reward) => {
              const canAfford = userPoints >= reward.points
              const isAvailable = reward.available && (reward.stock ?? 0) > 0

              return (
                <Card
                  key={reward.id}
                  className={`transition-all ${
                    !isAvailable ? "opacity-60" : canAfford ? "hover:border-primary/50" : ""
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                          reward.category === "Mudas"
                            ? "bg-primary/10 text-primary"
                            : reward.category === "Servicos"
                              ? "bg-secondary/10 text-secondary"
                              : reward.category === "Digital"
                                ? "bg-accent/10 text-accent"
                                : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {reward.icon}
                      </div>
                      <Badge variant="secondary">{reward.category}</Badge>
                    </div>
                    <CardTitle className="text-lg mt-3">{reward.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{reward.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-accent">
                        <Coins className="h-5 w-5" />
                        <span className="text-xl font-bold">{reward.points}</span>
                        <span className="text-sm text-muted-foreground">pts</span>
                      </div>
                      {isAvailable && (
                        <span className="text-xs text-muted-foreground">{reward.stock} disponiveis</span>
                      )}
                    </div>
                    {canAfford && <Progress value={100} className="mt-3 h-1" />}
                    {!canAfford && (
                      <div className="mt-3">
                        <Progress value={(userPoints / reward.points) * 100} className="h-1" />
                        <p className="text-xs text-muted-foreground mt-1">
                          Faltam {reward.points - userPoints} pontos
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      disabled={!canAfford || !isAvailable}
                      onClick={() => {
                        setSelectedReward(reward)
                        setIsRewardDialogOpen(true)
                      }}
                    >
                      {!isAvailable ? (
                        "Indisponivel"
                      ) : !canAfford ? (
                        "Pontos Insuficientes"
                      ) : (
                        <>
                          Resgatar
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Tab: Meus Produtos */}
        <TabsContent value="meus-produtos" className="space-y-6 mt-6">
          {meusProdutos.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Voce ainda nao cadastrou produtos</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Use a aba &quot;Vender&quot; para cadastrar seus produtos
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {meusProdutos.map((produto) => (
                <Card
                  key={produto.id}
                  className={`flex flex-col ${produto.status !== "disponivel" ? "opacity-70" : ""}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                          produto.tipo === "fruto"
                            ? "bg-accent/10 text-accent"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {produto.tipo === "fruto" ? (
                          <Package className="h-7 w-7" />
                        ) : (
                          <Leaf className="h-7 w-7" />
                        )}
                      </div>
                      <Badge
                        variant={produto.status === "disponivel" ? "default" : "secondary"}
                        className={
                          produto.status === "disponivel"
                            ? "bg-primary text-primary-foreground"
                            : produto.status === "vendido"
                              ? "bg-muted text-muted-foreground"
                              : "bg-accent/20 text-accent"
                        }
                      >
                        {produto.status === "disponivel"
                          ? "Disponivel"
                          : produto.status === "vendido"
                            ? "Vendido"
                            : "Reservado"}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-3">{produto.nome}</CardTitle>
                    <CardDescription className="line-clamp-2">{produto.descricao}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3 flex-1">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Quantidade:</span>
                        <span className="font-medium">
                          {produto.quantidade} {produto.unidade}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Publicado:</span>
                        <span className="font-medium">{produto.dataPublicacao}</span>
                      </div>
                      <div className="border-t pt-3 mt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-primary">
                            R$ {produto.precoReais.toFixed(2)}
                          </span>
                          {produto.precoPontos && (
                            <span className="flex items-center gap-1 text-accent">
                              <Coins className="h-4 w-4" />
                              <span className="font-semibold">{produto.precoPontos} pts</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Selo Blockchain */}
                    <div className="mt-3 p-2 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-2 text-xs">
                        <Shield className="h-3 w-3 text-primary" />
                        <span className="text-primary font-medium">Blockchain</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Hash className="h-3 w-3 text-muted-foreground" />
                        <code className="text-xs font-mono text-muted-foreground truncate">
                          {produto.hashBlockchain.slice(0, 20)}...
                        </code>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      disabled={produto.status !== "disponivel"}
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-destructive hover:text-destructive"
                      disabled={produto.status !== "disponivel"}
                      onClick={() => {
                        setProductToDelete(produto)
                        setIsDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remover
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog de Detalhes do Produto */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-lg">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProduct.nome}</DialogTitle>
                <DialogDescription>Detalhes do produto</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-xl ${
                      selectedProduct.tipo === "fruto"
                        ? "bg-accent/10 text-accent"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {selectedProduct.tipo === "fruto" ? (
                      <Package className="h-8 w-8" />
                    ) : (
                      <Leaf className="h-8 w-8" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{selectedProduct.especie}</p>
                    <p className="text-sm text-muted-foreground">
                      Vendido por {selectedProduct.vendedorNome}
                    </p>
                  </div>
                </div>

                <p className="text-muted-foreground">{selectedProduct.descricao}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Quantidade:</span>
                    <p className="font-medium">
                      {selectedProduct.quantidade} {selectedProduct.unidade}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Origem:</span>
                    <p className="font-medium">{selectedProduct.plantacaoOrigem}</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <Shield className="h-4 w-4" />
                    <span>Autenticado via Blockchain</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <code className="text-xs font-mono text-muted-foreground break-all">
                      {selectedProduct.hashBlockchain}
                    </code>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      R$ {selectedProduct.precoReais.toFixed(2)}
                    </p>
                    {selectedProduct.precoPontos && (
                      <p className="flex items-center gap-1 text-accent">
                        <Coins className="h-4 w-4" />
                        <span className="font-semibold">{selectedProduct.precoPontos} pts</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsProductDialogOpen(false)}>
                  Fechar
                </Button>
                <Button
                  onClick={() => {
                    setIsProductDialogOpen(false)
                    handleComprar(selectedProduct)
                  }}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Iniciar Negociacao
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmacao de Resgate */}
      <Dialog open={isRewardDialogOpen} onOpenChange={closeRewardDialog}>
        <DialogContent>
          {redeemSuccess ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <DialogTitle className="text-xl">Resgate Confirmado!</DialogTitle>
              <DialogDescription className="mt-2">
                Seu resgate de <strong>{selectedReward?.name}</strong> foi processado com sucesso.
                Voce recebera mais informacoes por e-mail.
              </DialogDescription>
              <div className="mt-4 p-3 rounded-lg bg-muted text-sm">
                <p className="text-muted-foreground">Transacao registrada em Blockchain</p>
                <p className="font-mono text-xs mt-1">TX: 0x7f8a...3d2e</p>
              </div>
              <Button className="mt-6" onClick={closeRewardDialog}>
                Fechar
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Confirmar Resgate</DialogTitle>
                <DialogDescription>Voce esta prestes a resgatar:</DialogDescription>
              </DialogHeader>

              {selectedReward && (
                <div className="py-4">
                  <div className="flex items-center gap-4 p-4 rounded-lg border">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      {selectedReward.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{selectedReward.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedReward.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-accent">
                        <Coins className="h-4 w-4" />
                        <span className="font-bold">{selectedReward.points}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">pts</p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-lg bg-muted">
                    <div className="flex justify-between text-sm">
                      <span>Seu saldo atual:</span>
                      <span className="font-medium">{userPoints.toLocaleString()} pts</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span>Custo do resgate:</span>
                      <span className="font-medium text-destructive">
                        -{selectedReward.points} pts
                      </span>
                    </div>
                    <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
                      <span>Saldo apos resgate:</span>
                      <span className="text-primary">
                        {(userPoints - selectedReward.points).toLocaleString()} pts
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={closeRewardDialog}>
                  Cancelar
                </Button>
                <Button onClick={handleRedeem} disabled={isRedeeming}>
                  {isRedeeming ? "Processando..." : "Confirmar Resgate"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Alert Dialog para deletar produto */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Produto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o produto &quot;{productToDelete?.nome}&quot;? Esta acao
              nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
