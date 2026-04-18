"use client"

import { useState } from "react"
import { ShoppingBag, Coins, Check, Package, Sparkles, Leaf, Users, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"

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
    name: "Kit de Adubos Orgânicos",
    description: "Kit completo com 5kg de adubo orgânico certificado para fortalecer suas mudas.",
    points: 200,
    category: "Insumos",
    icon: <Package className="h-8 w-8" />,
    available: true,
    stock: 15,
  },
  {
    id: "2",
    name: "Consultoria Técnica com Agrônomo",
    description: "1 hora de consultoria online com agrônomo especializado em sistemas agroflorestais.",
    points: 350,
    category: "Serviços",
    icon: <Users className="h-8 w-8" />,
    available: true,
    stock: 8,
  },
  {
    id: "3",
    name: "Mudas de Cupuaçu (5 unidades)",
    description: "Receba 5 mudas de Cupuaçu de alta qualidade, prontas para plantio.",
    points: 150,
    category: "Mudas",
    icon: <Leaf className="h-8 w-8" />,
    available: true,
    stock: 25,
  },
  {
    id: "4",
    name: "Mudas de Açaí (10 unidades)",
    description: "Kit com 10 mudas de Açaí selecionadas para alta produtividade.",
    points: 250,
    category: "Mudas",
    icon: <Leaf className="h-8 w-8" />,
    available: true,
    stock: 18,
  },
  {
    id: "5",
    name: "Certificado de Impacto Ambiental",
    description: "Certificado NFT registrado em blockchain comprovando sua contribuição ambiental.",
    points: 500,
    category: "Digital",
    icon: <Sparkles className="h-8 w-8" />,
    available: true,
    stock: 999,
  },
  {
    id: "6",
    name: "Kit Ferramentas Básicas",
    description: "Kit com pá, enxada e regador para manejo das suas mudas.",
    points: 400,
    category: "Ferramentas",
    icon: <Package className="h-8 w-8" />,
    available: false,
    stock: 0,
  },
]

const categories = ["Todos", "Insumos", "Serviços", "Mudas", "Digital", "Ferramentas"]

export function MercadoIncentivos() {
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [redeemSuccess, setRedeemSuccess] = useState(false)

  const userPoints = 1580

  const filteredRewards = selectedCategory === "Todos"
    ? rewards
    : rewards.filter(r => r.category === selectedCategory)

  const handleRedeem = async () => {
    if (!selectedReward) return
    setIsRedeeming(true)
    
    // Simula processo de resgate
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsRedeeming(false)
    setRedeemSuccess(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setSelectedReward(null)
    setRedeemSuccess(false)
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
            <h1 className="text-2xl font-bold">Mercado de Incentivos</h1>
            <p className="text-muted-foreground">Troque seus pontos por recompensas</p>
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

      {/* Blockchain Info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center gap-4 p-4">
          <Sparkles className="h-6 w-6 text-primary" />
          <div>
            <p className="font-medium">Rastreamento em Blockchain</p>
            <p className="text-sm text-muted-foreground">
              Todas as transações de pontos são registradas em blockchain para total transparência e segurança.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Filtros de Categoria */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
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
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                    reward.category === "Mudas" ? "bg-primary/10 text-primary" :
                    reward.category === "Serviços" ? "bg-secondary/10 text-secondary" :
                    reward.category === "Digital" ? "bg-accent/10 text-accent" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {reward.icon}
                  </div>
                  <Badge variant="secondary">{reward.category}</Badge>
                </div>
                <CardTitle className="text-lg mt-3">{reward.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {reward.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-accent">
                    <Coins className="h-5 w-5" />
                    <span className="text-xl font-bold">{reward.points}</span>
                    <span className="text-sm text-muted-foreground">pts</span>
                  </div>
                  {isAvailable && (
                    <span className="text-xs text-muted-foreground">
                      {reward.stock} disponíveis
                    </span>
                  )}
                </div>
                {canAfford && (
                  <Progress
                    value={100}
                    className="mt-3 h-1"
                  />
                )}
                {!canAfford && (
                  <div className="mt-3">
                    <Progress
                      value={(userPoints / reward.points) * 100}
                      className="h-1"
                    />
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
                    setIsDialogOpen(true)
                  }}
                >
                  {!isAvailable ? (
                    "Indisponível"
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

      {/* Dialog de Confirmação */}
      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent>
          {redeemSuccess ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <DialogTitle className="text-xl">Resgate Confirmado!</DialogTitle>
              <DialogDescription className="mt-2">
                Seu resgate de <strong>{selectedReward?.name}</strong> foi processado com sucesso. 
                Você receberá mais informações por e-mail.
              </DialogDescription>
              <div className="mt-4 p-3 rounded-lg bg-muted text-sm">
                <p className="text-muted-foreground">Transação registrada em Blockchain</p>
                <p className="font-mono text-xs mt-1">TX: 0x7f8a...3d2e</p>
              </div>
              <Button className="mt-6" onClick={closeDialog}>
                Fechar
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Confirmar Resgate</DialogTitle>
                <DialogDescription>
                  Você está prestes a resgatar:
                </DialogDescription>
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
                      <span className="font-medium text-destructive">-{selectedReward.points} pts</span>
                    </div>
                    <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
                      <span>Saldo após resgate:</span>
                      <span className="text-primary">{(userPoints - selectedReward.points).toLocaleString()} pts</span>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={closeDialog}>
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
    </div>
  )
}
