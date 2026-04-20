"use client"

import { Button } from "@/components/ui/button"
import { SAFLogo } from "@/components/saf-logo"

interface WelcomeScreenProps {
  onContinue: () => void
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d3320] via-[#1a4a35] to-[#0d3320] flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md w-full space-y-12">
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[#4a9eff] leading-tight text-balance">
            Bem-vindo ao Amazon Green System
          </h1>
          <p className="text-[#8ab4c7] text-lg">
            Conecte, compre e converse com produtores locais.
          </p>
        </div>

        <SAFLogo size="lg" className="mx-auto [&_svg]:text-[#4a9eff] [&_p]:text-[#4a9eff]" />

        <Button
          onClick={onContinue}
          className="w-full max-w-xs mx-auto bg-[#2a4a5a]/80 hover:bg-[#3a5a6a] text-white border border-[#4a6a7a]/50 rounded-full py-6 text-lg font-medium transition-all"
        >
          CONTINUAR
        </Button>
      </div>
    </div>
  )
}
