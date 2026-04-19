"use client"

import { TreePine, Droplets, Cloud, TrendingUp, Award, Target } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

const monthlyData = [
  { month: "Jan", trees: 12 },
  { month: "Fev", trees: 18 },
  { month: "Mar", trees: 25 },
  { month: "Abr", trees: 32 },
]

const achievements = [
  { 
    id: "1", 
    name: "Primeiro Plantio", 
    description: "Plante sua primeira muda", 
    completed: true,
    icon: "🌱"
  },
  { 
    id: "2", 
    name: "Colecionador", 
    description: "Plante 5 espécies diferentes", 
    completed: true,
    icon: "🏆"
  },
  { 
    id: "3", 
    name: "Guardião da Floresta", 
    description: "Plante 100 árvores", 
    completed: true,
    icon: "🛡️"
  },
  { 
    id: "4", 
    name: "Mestre Agroflorestal", 
    description: "Plante 500 árvores", 
    completed: false,
    progress: 25,
    icon: "👑"
  },
  { 
    id: "5", 
    name: "Sequência Perfeita", 
    description: "Plante por 30 dias seguidos", 
    completed: false,
    progress: 23,
    icon: "🔥"
  },
]

export function PainelImpacto() {
  const impactStats = {
    totalTrees: 127,
    co2Captured: 2540, // kg
    waterSaved: 15240, // litros
    biodiversity: 12, // espécies
  }

  const goals = {
    annual: { current: 127, target: 500 },
    monthly: { current: 32, target: 50 },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <TrendingUp className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Painel de Impacto</h1>
          <p className="text-muted-foreground">Acompanhe sua contribuição ambiental</p>
        </div>
      </div>

      {/* Impact Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Árvores
            </CardTitle>
            <TreePine className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{impactStats.totalTrees}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +32 este mês
            </p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              CO₂ Capturado
            </CardTitle>
            <Cloud className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">{(impactStats.co2Captured / 1000).toFixed(1)}t</div>
            <p className="text-xs text-muted-foreground mt-1">
              Equivalente a {Math.round(impactStats.co2Captured / 120)} viagens de carro
            </p>
          </CardContent>
        </Card>

        <Card className="border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Água Preservada
            </CardTitle>
            <Droplets className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{(impactStats.waterSaved / 1000).toFixed(1)}k</div>
            <p className="text-xs text-muted-foreground mt-1">
              Litros de água por ano
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Biodiversidade
            </CardTitle>
            <Award className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{impactStats.biodiversity}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Espécies diferentes plantadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Goals and Progress */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Metas de Plantio
            </CardTitle>
            <CardDescription>Acompanhe seu progresso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Meta Mensal */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Meta Mensal</span>
                <span className="text-sm text-muted-foreground">
                  {goals.monthly.current}/{goals.monthly.target} árvores
                </span>
              </div>
              <Progress value={(goals.monthly.current / goals.monthly.target) * 100} className="h-3" />
              <p className="text-xs text-muted-foreground">
                Faltam {goals.monthly.target - goals.monthly.current} árvores para bater a meta!
              </p>
            </div>

            {/* Meta Anual */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Meta Anual</span>
                <span className="text-sm text-muted-foreground">
                  {goals.annual.current}/{goals.annual.target} árvores
                </span>
              </div>
              <Progress value={(goals.annual.current / goals.annual.target) * 100} className="h-3" />
              <p className="text-xs text-muted-foreground">
                {Math.round((goals.annual.current / goals.annual.target) * 100)}% concluído
              </p>
            </div>

            {/* Gráfico simples de barras */}
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-4">Plantios por Mês (2026)</p>
              <div className="flex items-end justify-between gap-2 h-32">
                {monthlyData.map((item) => (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-primary rounded-t transition-all"
                      style={{ height: `${(item.trees / 40) * 100}%` }}
                    />
                    <span className="text-xs text-muted-foreground">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conquistas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-accent" />
              Conquistas
            </CardTitle>
            <CardDescription>Desbloqueie badges de impacto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`flex items-center gap-4 rounded-lg border p-4 transition-colors ${
                    achievement.completed ? "bg-primary/5 border-primary/20" : "opacity-80"
                  }`}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl ${
                    achievement.completed ? "bg-primary/10" : "bg-muted"
                  }`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{achievement.name}</p>
                      {achievement.completed && (
                        <Badge className="bg-primary text-primary-foreground text-xs">
                          Conquistado
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    {!achievement.completed && achievement.progress && (
                      <div className="mt-2">
                        <Progress value={achievement.progress} className="h-1" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {achievement.progress}% concluído
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Environmental Impact Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
              <TreePine className="h-10 w-10 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold">Seu Impacto Faz a Diferença!</h3>
              <p className="text-muted-foreground mt-1">
                Com suas {impactStats.totalTrees} árvores plantadas, você já contribuiu para capturar {impactStats.co2Captured}kg de CO₂ 
                e preservar {impactStats.waterSaved.toLocaleString()} litros de água por ano. Continue assim!
              </p>
            </div>
            <Badge className="bg-primary text-primary-foreground text-lg py-2 px-4">
              🌍 Herói Verde
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
