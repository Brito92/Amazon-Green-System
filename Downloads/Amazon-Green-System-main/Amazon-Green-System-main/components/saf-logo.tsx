"use client"

import { cn } from "@/lib/utils"

interface SAFLogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  showText?: boolean
}

export function SAFLogo({ className, size = "md", showText = true }: SAFLogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24"
  }

  const textSizes = {
    sm: "text-sm",
    md: "text-xl",
    lg: "text-3xl"
  }

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <svg
        viewBox="0 0 100 100"
        className={cn(sizeClasses[size], "text-primary")}
        fill="currentColor"
      >
        {/* Folhas estilizadas representando sustentabilidade */}
        <path d="M50 10 C30 25 20 45 25 65 C30 50 40 40 50 35 C60 40 70 50 75 65 C80 45 70 25 50 10Z" />
        <path d="M35 55 C25 60 20 75 30 85 C35 75 45 70 50 68 C55 70 65 75 70 85 C80 75 75 60 65 55 C57 60 53 65 50 68 C47 65 43 60 35 55Z" />
        <circle cx="50" cy="45" r="5" className="fill-primary-foreground" />
      </svg>
      {showText && (
        <div className="text-center">
          <p className={cn("font-bold text-primary", textSizes[size])}>SAF</p>
          <p className="text-xs text-muted-foreground">MarketLink</p>
        </div>
      )}
    </div>
  )
}
