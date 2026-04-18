"use client"

import { TreePine, Coins, Trophy, TrendingUp, Award, Star } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface DashboardProps {
  userName: string
}

const topProducers = [
  { name: "Maria Silva", trees: 450, points: 4500, avatar: "MS" },
  { name: "João Santos", trees: 380, points: 3800, avatar: "JS" },
  { name: "Ana Costa", trees: 320, points: 3200, avatar: "AC" },
  { name: "Pedro Lima", trees: 290, points: 2900, avatar: "PL" },
  { name: "Lucia Ferreira", trees: 250, points: 2500, avatar: "LF" },
]

const recentActivities = [
  { action: "Plantou 5 mudas de Açaí", date: "Hoje", points: "+50" },
  { action: "Resgatou Kit de Adubos", date: "Ontem", points: "-200" },
  { action: "Bônus de sequência semanal", date: "3 dias atrás", points: "+100" },
  { action: "Plantou 3 mudas de Cupuaçu", date: "5 dias atrás", points: "+30" },
]

export function Dashboard({ userName }: DashboardProps) {
  const userStats = {
    treesPlanted: 127,
    treesGoal: 200,
    totalPoints: 1580,
    rank: 8,
    streak: 7,
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary to-secondary p-6 text-primary-foreground">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold">
            Olá, {userName}! 🌱
          </h1>
          <p className="mt-2 text-primary-foreground/80">
            Continue plantando e ganhando recompensas. Você está na posição #{userStats.rank} do ranking!
          </p>
        </div>
        <TreePine className="absolute right-4 top-4 h-24 w-24 opacity-20" />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Card 1: Árvores Plantadas */}
        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Árvores Plantadas por Você
            </CardTitle>
            <TreePine className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{userStats.treesPlanted}</div>
            <Progress 
              value={(userStats.treesPlanted / userStats.treesGoal) * 100} 
              className="mt-3 h-2"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Meta: {userStats.treesGoal} árvores ({Math.round((userStats.treesPlanted / userStats.treesGoal) * 100)}%)
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Pontos Acumulados */}
        <Card className="border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pontos Acumulados
            </CardTitle>
            <Coins className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{userStats.totalPoints.toLocaleString()}</div>
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="secondary" className="bg-accent/10 text-accent">
                <TrendingUp className="mr-1 h-3 w-3" />
                +180 esta semana
              </Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Tokens simulados em Blockchain
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Sequência */}
        <Card className="border-secondary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sequência de Plantio
            </CardTitle>
            <Award className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-secondary">{userStats.streak}</span>
              <span className="text-lg text-secondary">dias</span>
            </div>
            <div className="mt-3 flex gap-1">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${
                    i < userStats.streak ? "bg-secondary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Continue plantando para manter sua sequência!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ranking and Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ranking de Produtores */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-accent" />
                  Destaques do Mês
                </CardTitle>
                <CardDescription>Top produtores com mais impacto</CardDescription>
              </div>
              <Badge className="bg-accent text-accent-foreground">
                Você: #{userStats.rank}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducers.map((producer, index) => (
                <div
                  key={producer.name}
                  className="flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-muted/50"
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                    index === 0 ? "bg-accent text-accent-foreground" :
                    index === 1 ? "bg-secondary text-secondary-foreground" :
                    index === 2 ? "bg-primary text-primary-foreground" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {index + 1}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {producer.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{producer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {producer.trees} árvores
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-accent">
                      <Star className="h-4 w-4" />
                      <span className="font-semibold">{producer.points}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">pontos</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Atividades Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>Seu histórico de ações</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${
                      activity.points.startsWith("+") ? "bg-primary" : "bg-muted-foreground"
                    }`} />
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">{activity.date}</p>
                    </div>
                  </div>
                  <Badge variant={activity.points.startsWith("+") ? "default" : "secondary"}>
                    {activity.points} pts
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
