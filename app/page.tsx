"use client"

import { useState, useEffect } from "react"
import { WelcomeScreen } from "@/components/welcome-screen"
import { AuthScreen } from "@/components/auth-screen"
import { Navbar } from "@/components/navbar"
import { Dashboard } from "@/components/dashboard"
import { RefloresteGanhe } from "@/components/refloreste-ganhe"
import { MercadoIncentivos } from "@/components/mercado-incentivos"
import { ChatScreen } from "@/components/chat-screen"
import { PainelImpacto } from "@/components/painel-impacto"
import { CadastroProdutoVenda } from "@/components/cadastro-produto-venda"

type Screen = "welcome" | "auth" | "app"
type Tab = "home" | "mudas" | "painel" | "vender" | "mercado" | "chat"

export default function Home() {
  const [screen, setScreen] = useState<Screen>("welcome")
  const [currentTab, setCurrentTab] = useState<Tab>("home")
  const [userName, setUserName] = useState("Produtor")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verifica se o usuário já está logado (simulação)
    const savedUser = localStorage.getItem("ags_user")
    if (savedUser) {
      setUserName(savedUser)
      setScreen("app")
    }
    setIsLoading(false)
  }, [])

  const handleContinue = () => {
    setScreen("auth")
  }

  const handleLogin = (email: string, password: string) => {
    // Simulação de login
    const name = email.split("@")[0]
    setUserName(name.charAt(0).toUpperCase() + name.slice(1))
    localStorage.setItem("ags_user", name.charAt(0).toUpperCase() + name.slice(1))
    setScreen("app")
  }

  const handleSignUp = (name: string, email: string, password: string) => {
    // Simulação de cadastro
    setUserName(name)
    localStorage.setItem("ags_user", name)
    setScreen("app")
  }

  const handleLogout = () => {
    localStorage.removeItem("ags_user")
    setScreen("welcome")
    setCurrentTab("home")
  }

  const renderContent = () => {
    switch (currentTab) {
      case "home":
        return <Dashboard userName={userName} />
      case "mudas":
        return <RefloresteGanhe />
      case "painel":
        return <PainelImpacto />
      case "vender":
        return <CadastroProdutoVenda />
      case "mercado":
        return <MercadoIncentivos />
      case "chat":
        return <ChatScreen />
      default:
        return <Dashboard userName={userName} />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (screen === "welcome") {
    return <WelcomeScreen onContinue={handleContinue} />
  }

  if (screen === "auth") {
    return <AuthScreen onLogin={handleLogin} onSignUp={handleSignUp} />
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab as Tab)}
        userName={userName}
        onLogout={handleLogout}
      />
      <main className="container mx-auto px-4 py-6">
        {renderContent()}
      </main>
    </div>
  )
}
