"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SAFLogo } from "@/components/saf-logo"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"

interface AuthScreenProps {
  onLogin: (email: string, password: string) => void
  onSignUp: (name: string, email: string, password: string) => void
}

export function AuthScreen({ onLogin, onSignUp }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isLogin) {
      onLogin(email, password)
    } else {
      onSignUp(name, email, password)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2a5a] via-[#2a3a6a] to-[#1a2a5a] flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#4a9eff] tracking-wide">
            AMAZON GREEN SYSTEM
          </h1>
          <SAFLogo size="md" className="mx-auto [&_svg]:text-primary [&_p]:text-primary" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            {!isLogin && (
              <Field>
                <FieldLabel className="text-white/80">Nome</FieldLabel>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  placeholder="Seu nome completo"
                  required={!isLogin}
                />
              </Field>
            )}
            <Field>
              <FieldLabel className="text-white/80">E-mail</FieldLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                placeholder="seu@email.com"
                required
              />
            </Field>
            <Field>
              <FieldLabel className="text-white/80">Senha</FieldLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                placeholder="••••••••"
                required
              />
            </Field>
          </FieldGroup>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-semibold"
          >
            {isLogin ? "ENTRAR" : "CADASTRAR"}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-white/70 hover:text-white text-sm transition-colors"
          >
            {isLogin ? "Não tem conta? Cadastre-se" : "Já possui uma conta?"}
          </button>
        </div>
      </div>
    </div>
  )
}
