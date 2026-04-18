"use client"

import { useState } from "react"
import { Upload, Leaf, Calendar, CheckCircle2, ImageIcon, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"

const speciesOptions = [
  { value: "acai", label: "Açaí", points: 10 },
  { value: "cupuacu", label: "Cupuaçu", points: 12 },
  { value: "castanha", label: "Castanha-do-Pará", points: 15 },
  { value: "cacau", label: "Cacau", points: 11 },
  { value: "andiroba", label: "Andiroba", points: 14 },
  { value: "copaiba", label: "Copaíba", points: 13 },
  { value: "buriti", label: "Buriti", points: 12 },
  { value: "pupunha", label: "Pupunha", points: 10 },
]

const recentPlantings = [
  { species: "Açaí", date: "15/04/2026", status: "verified", points: 10 },
  { species: "Cupuaçu", date: "12/04/2026", status: "pending", points: 12 },
  { species: "Castanha-do-Pará", date: "10/04/2026", status: "verified", points: 15 },
  { species: "Açaí", date: "08/04/2026", status: "verified", points: 10 },
]

export function RefloresteGanhe() {
  const [species, setSpecies] = useState("")
  const [plantingDate, setPlantingDate] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simula envio
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setSubmitSuccess(true)
    
    // Reset form after success
    setTimeout(() => {
      setSpecies("")
      setPlantingDate("")
      setImagePreview(null)
      setSubmitSuccess(false)
    }, 3000)
  }

  const selectedSpecies = speciesOptions.find(s => s.value === species)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Leaf className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Refloreste e Ganhe</h1>
          <p className="text-muted-foreground">Cadastre suas mudas e acumule pontos</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Formulário de Cadastro */}
        <Card>
          <CardHeader>
            <CardTitle>Cadastrar Nova Muda</CardTitle>
            <CardDescription>
              Preencha os dados e envie uma foto para validação
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitSuccess ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Muda Cadastrada!</h3>
                <p className="text-muted-foreground mt-2">
                  Sua muda foi enviada para validação. Em breve você receberá seus pontos.
                </p>
                {selectedSpecies && (
                  <Badge className="mt-4 bg-primary text-primary-foreground">
                    +{selectedSpecies.points} pontos (pendente)
                  </Badge>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <FieldGroup>
                  <Field>
                    <FieldLabel>Nome da Espécie</FieldLabel>
                    <Select value={species} onValueChange={setSpecies} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a espécie" />
                      </SelectTrigger>
                      <SelectContent>
                        {speciesOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center justify-between gap-4 w-full">
                              <span>{option.label}</span>
                              <Badge variant="secondary" className="ml-2">
                                +{option.points} pts
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel>Data do Plantio</FieldLabel>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="date"
                        value={plantingDate}
                        onChange={(e) => setPlantingDate(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </Field>

                  <Field>
                    <FieldLabel>Foto da Muda Plantada</FieldLabel>
                    {imagePreview ? (
                      <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                        <img
                          src={imagePreview}
                          alt="Preview da muda"
                          className="h-full w-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute right-2 top-2"
                          onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-primary/50 hover:bg-muted">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <ImageIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="text-center">
                          <p className="font-medium">Clique para enviar</p>
                          <p className="text-sm text-muted-foreground">
                            PNG, JPG até 10MB
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                  </Field>
                </FieldGroup>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!species || !plantingDate || !imagePreview || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Upload className="mr-2 h-4 w-4 animate-pulse" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Cadastrar Muda
                    </>
                  )}
                </Button>

                {selectedSpecies && (
                  <p className="text-center text-sm text-muted-foreground">
                    Você ganhará <span className="font-semibold text-primary">+{selectedSpecies.points} pontos</span> após validação
                  </p>
                )}
              </form>
            )}
          </CardContent>
        </Card>

        {/* Histórico de Plantios */}
        <Card>
          <CardHeader>
            <CardTitle>Suas Mudas Recentes</CardTitle>
            <CardDescription>
              Acompanhe o status de validação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPlantings.map((planting, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      planting.status === "verified" 
                        ? "bg-primary/10 text-primary" 
                        : "bg-accent/10 text-accent"
                    }`}>
                      <Leaf className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{planting.species}</p>
                      <p className="text-sm text-muted-foreground">{planting.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={planting.status === "verified" ? "default" : "secondary"}>
                      {planting.status === "verified" ? "Verificado" : "Pendente"}
                    </Badge>
                    <p className={`text-sm mt-1 ${
                      planting.status === "verified" ? "text-primary" : "text-muted-foreground"
                    }`}>
                      +{planting.points} pts
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-lg bg-muted/50 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Como funciona?</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Suas fotos são verificadas por nossa equipe. Após aprovação, 
                    os pontos são creditados automaticamente e registrados em blockchain.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
