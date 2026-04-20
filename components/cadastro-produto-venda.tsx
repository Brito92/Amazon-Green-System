"use client"

import { useState } from "react"
import {
  ShoppingCart,
  Leaf,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Upload,
  X,
  Coins,
  Package,
  Hash,
  Calendar,
  Image as ImageIcon,
  ArrowRight,
  Link as LinkIcon,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

// Tipos para plantações validadas
interface PlantacaoValidada {
  id: string
  nome: string
  tipo: "fruto" | "muda"
  especie: string
  quantidadeDisponivel: number
  unidade: string
  dataValidacao: string
  hashBlockchain: string
  status: "validado" | "pendente" | "expirado"
}

// Dados simulados de plantações validadas do usuário
const plantacoesValidadas: PlantacaoValidada[] = [
  {
    id: "1",
    nome: "Lote de Castanheira 04",
    tipo: "fruto",
    especie: "Castanha-do-Pará",
    quantidadeDisponivel: 150,
    unidade: "kg",
    dataValidacao: "15/03/2025",
    hashBlockchain: "0x7f8a3d2e1c9b4f5a6d7e8c9b0a1f2e3d4c5b6a78",
    status: "validado",
  },
  {
    id: "2",
    nome: "Viveiro de Açaí Norte",
    tipo: "muda",
    especie: "Açaí",
    quantidadeDisponivel: 200,
    unidade: "mudas",
    dataValidacao: "22/02/2025",
    hashBlockchain: "0x9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d",
    status: "validado",
  },
  {
    id: "3",
    nome: "Lote de Cupuaçu 02",
    tipo: "fruto",
    especie: "Cupuaçu",
    quantidadeDisponivel: 80,
    unidade: "kg",
    dataValidacao: "10/01/2025",
    hashBlockchain: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c",
    status: "validado",
  },
  {
    id: "4",
    nome: "Plantio de Andiroba",
    tipo: "muda",
    especie: "Andiroba",
    quantidadeDisponivel: 0,
    unidade: "mudas",
    dataValidacao: "05/12/2024",
    hashBlockchain: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f",
    status: "expirado",
  },
]

export function CadastroProdutoVenda() {
  const [plantacaoSelecionada, setPlantacaoSelecionada] = useState<PlantacaoValidada | null>(null)
  const [nomeProduto, setNomeProduto] = useState("")
  const [descricao, setDescricao] = useState("")
  const [quantidade, setQuantidade] = useState("")
  const [precoReais, setPrecoReais] = useState("")
  const [precoPontos, setPrecoPontos] = useState("")
  const [fotos, setFotos] = useState<string[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishSuccess, setPublishSuccess] = useState(false)
  const [showBlockchainError, setShowBlockchainError] = useState(false)

  const plantacaoAtual = plantacaoSelecionada
    ? plantacoesValidadas.find((p) => p.id === plantacaoSelecionada.id)
    : null

  const handlePlantacaoSelect = (id: string) => {
    const plantacao = plantacoesValidadas.find((p) => p.id === id)
    if (plantacao) {
      setPlantacaoSelecionada(plantacao)
      setShowBlockchainError(false)
      // Preenche o nome do produto automaticamente
      setNomeProduto(plantacao.tipo === "fruto" ? `${plantacao.especie} Fresco` : `Muda de ${plantacao.especie}`)
    }
  }

  const handleFotoUpload = () => {
    // Simula upload de foto
    if (fotos.length < 4) {
      const novaFoto = `/placeholder-${fotos.length + 1}.jpg`
      setFotos([...fotos, novaFoto])
    }
  }

  const handleRemoverFoto = (index: number) => {
    setFotos(fotos.filter((_, i) => i !== index))
  }

  const handleSubmitSemValidacao = () => {
    setShowBlockchainError(true)
  }

  const handlePublicar = async () => {
    if (!plantacaoAtual || plantacaoAtual.status !== "validado") {
      setShowBlockchainError(true)
      return
    }

    setIsPublishing(true)
    // Simula processo de publicação
    await new Promise((resolve) => setTimeout(resolve, 2500))
    setIsPublishing(false)
    setPublishSuccess(true)
  }

  const resetForm = () => {
    setPlantacaoSelecionada(null)
    setNomeProduto("")
    setDescricao("")
    setQuantidade("")
    setPrecoReais("")
    setPrecoPontos("")
    setFotos([])
    setIsDialogOpen(false)
    setPublishSuccess(false)
    setShowBlockchainError(false)
  }

  const isFormValid =
    plantacaoAtual &&
    plantacaoAtual.status === "validado" &&
    nomeProduto &&
    quantidade &&
    Number(quantidade) > 0 &&
    Number(quantidade) <= plantacaoAtual.quantidadeDisponivel &&
    precoReais &&
    Number(precoReais) > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ShoppingCart className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Cadastro de Produto para Venda</h1>
            <p className="text-muted-foreground">
              Coloque seus frutos e mudas no marketplace
            </p>
          </div>
        </div>
      </div>

      {/* Info Blockchain */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-4 p-4">
          <Shield className="h-6 w-6 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Verificacao de Rastreabilidade Blockchain</p>
            <p className="text-sm text-muted-foreground mt-1">
              Apenas produtos vinculados a plantacoes com Token de Validacao ativo podem ser comercializados.
              Isso garante transparencia e origem certificada para os compradores.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Erro de Validacao Blockchain */}
      {showBlockchainError && (
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Item sem rastro na Blockchain</AlertTitle>
          <AlertDescription>
            Este item nao possui rastro na blockchain e nao pode ser comercializado aqui.
            Certifique-se de selecionar uma plantacao validada antes de cadastrar o produto.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna Principal - Formulario */}
        <div className="lg:col-span-2 space-y-6">
          {/* Secao 1: Selecao de Origem */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-primary" />
                1. Selecione a Origem do Produto
              </CardTitle>
              <CardDescription>
                Escolha a plantacao validada que originou o produto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plantacao">Plantacao de Origem</Label>
                <Select onValueChange={handlePlantacaoSelect}>
                  <SelectTrigger id="plantacao" className="w-full">
                    <SelectValue placeholder="Selecione uma plantacao validada..." />
                  </SelectTrigger>
                  <SelectContent>
                    {plantacoesValidadas.map((plantacao) => (
                      <SelectItem
                        key={plantacao.id}
                        value={plantacao.id}
                        disabled={plantacao.status !== "validado" || plantacao.quantidadeDisponivel === 0}
                      >
                        <div className="flex items-center gap-2">
                          <span>{plantacao.nome}</span>
                          {plantacao.status === "validado" && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                              Validado
                            </Badge>
                          )}
                          {plantacao.status === "expirado" && (
                            <Badge variant="secondary" className="bg-destructive/10 text-destructive text-xs">
                              Expirado
                            </Badge>
                          )}
                          {plantacao.quantidadeDisponivel === 0 && (
                            <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">
                              Esgotado
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Card de Verificacao Blockchain */}
              {plantacaoAtual && (
                <div
                  className={`rounded-xl border-2 p-4 transition-all ${
                    plantacaoAtual.status === "validado"
                      ? "border-primary/30 bg-primary/5"
                      : "border-destructive/30 bg-destructive/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {plantacaoAtual.status === "validado" ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                        )}
                        <span className="font-semibold">{plantacaoAtual.nome}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Package className="h-4 w-4" />
                          <span>
                            {plantacaoAtual.tipo === "fruto" ? "Fruto" : "Muda"}: {plantacaoAtual.especie}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Validado em {plantacaoAtual.dataValidacao}</span>
                        </div>
                      </div>

                      {/* Selo de Autenticacao Blockchain */}
                      <div className="mt-3 p-3 rounded-lg bg-card border">
                        <div className="flex items-center gap-2 text-sm font-medium text-primary">
                          <Shield className="h-4 w-4" />
                          <span>Autenticado via Blockchain</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <code className="text-xs font-mono text-muted-foreground break-all">
                            {plantacaoAtual.hashBlockchain}
                          </code>
                        </div>
                      </div>
                    </div>

                    <Badge
                      variant={plantacaoAtual.status === "validado" ? "default" : "destructive"}
                      className={
                        plantacaoAtual.status === "validado"
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }
                    >
                      {plantacaoAtual.status === "validado" ? "Token Ativo" : "Token Expirado"}
                    </Badge>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Quantidade disponivel para venda:</span>
                    <span className="font-semibold text-primary">
                      {plantacaoAtual.quantidadeDisponivel} {plantacaoAtual.unidade}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Secao 2: Informacoes do Produto */}
          <Card className={!plantacaoAtual || plantacaoAtual.status !== "validado" ? "opacity-60" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-secondary" />
                2. Informacoes do Produto
              </CardTitle>
              <CardDescription>Descreva o produto que sera vendido</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Produto</Label>
                  <Input
                    id="nome"
                    placeholder="Ex: Castanha-do-Para Premium"
                    value={nomeProduto}
                    onChange={(e) => setNomeProduto(e.target.value)}
                    disabled={!plantacaoAtual || plantacaoAtual.status !== "validado"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantidade">
                    Quantidade ({plantacaoAtual?.unidade || "unidades"})
                  </Label>
                  <Input
                    id="quantidade"
                    type="number"
                    placeholder="0"
                    min="1"
                    max={plantacaoAtual?.quantidadeDisponivel || 0}
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    disabled={!plantacaoAtual || plantacaoAtual.status !== "validado"}
                  />
                  {plantacaoAtual && Number(quantidade) > plantacaoAtual.quantidadeDisponivel && (
                    <p className="text-xs text-destructive">
                      Maximo disponivel: {plantacaoAtual.quantidadeDisponivel} {plantacaoAtual.unidade}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descricao</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva as caracteristicas do seu produto..."
                  rows={3}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  disabled={!plantacaoAtual || plantacaoAtual.status !== "validado"}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="preco-reais">Preco em Reais (R$)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      R$
                    </span>
                    <Input
                      id="preco-reais"
                      type="number"
                      placeholder="0,00"
                      className="pl-10"
                      min="0"
                      step="0.01"
                      value={precoReais}
                      onChange={(e) => setPrecoReais(e.target.value)}
                      disabled={!plantacaoAtual || plantacaoAtual.status !== "validado"}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preco-pontos">Preco em Pontos (opcional)</Label>
                  <div className="relative">
                    <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-accent" />
                    <Input
                      id="preco-pontos"
                      type="number"
                      placeholder="0"
                      className="pl-10"
                      min="0"
                      value={precoPontos}
                      onChange={(e) => setPrecoPontos(e.target.value)}
                      disabled={!plantacaoAtual || plantacaoAtual.status !== "validado"}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Aceite pontos do sistema como forma de pagamento
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Secao 3: Fotos */}
          <Card className={!plantacaoAtual || plantacaoAtual.status !== "validado" ? "opacity-60" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-accent" />
                3. Fotos do Produto
              </CardTitle>
              <CardDescription>Adicione ate 4 fotos do seu produto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {fotos.map((foto, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-xl border-2 border-dashed border-border bg-muted/50 overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-primary/50" />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoverFoto(index)}
                      className="absolute top-2 right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remover foto"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {fotos.length < 4 && (
                  <button
                    type="button"
                    onClick={handleFotoUpload}
                    disabled={!plantacaoAtual || plantacaoAtual.status !== "validado"}
                    className="aspect-square rounded-xl border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center gap-2 hover:bg-muted/50 hover:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Adicionar</span>
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Lateral - Resumo */}
        <div className="space-y-6">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Resumo do Anuncio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {plantacaoAtual ? (
                <>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Origem:</span>
                      <span className="font-medium text-right">{plantacaoAtual.nome}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Especie:</span>
                      <span className="font-medium">{plantacaoAtual.especie}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Produto:</span>
                      <span className="font-medium">{nomeProduto || "-"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Quantidade:</span>
                      <span className="font-medium">
                        {quantidade ? `${quantidade} ${plantacaoAtual.unidade}` : "-"}
                      </span>
                    </div>

                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Preco em Reais:</span>
                        <span className="font-semibold text-primary">
                          {precoReais ? `R$ ${Number(precoReais).toFixed(2)}` : "-"}
                        </span>
                      </div>
                      {precoPontos && (
                        <div className="flex justify-between text-sm mt-2">
                          <span className="text-muted-foreground">Preco em Pontos:</span>
                          <span className="font-semibold text-accent flex items-center gap-1">
                            <Coins className="h-4 w-4" />
                            {precoPontos} pts
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fotos:</span>
                      <span className="font-medium">{fotos.length}/4</span>
                    </div>
                  </div>

                  {/* Status da Validacao */}
                  <div
                    className={`p-3 rounded-lg ${
                      plantacaoAtual.status === "validado"
                        ? "bg-primary/10 border border-primary/20"
                        : "bg-destructive/10 border border-destructive/20"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {plantacaoAtual.status === "validado" ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          plantacaoAtual.status === "validado" ? "text-primary" : "text-destructive"
                        }`}
                      >
                        {plantacaoAtual.status === "validado"
                          ? "Pronto para publicar"
                          : "Token de validacao expirado"}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <Leaf className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    Selecione uma plantacao validada para comecar
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button
                className="w-full"
                size="lg"
                disabled={!isFormValid}
                onClick={() => setIsDialogOpen(true)}
              >
                Publicar Produto
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              {!plantacaoAtual && (
                <Button
                  variant="outline"
                  className="w-full text-destructive hover:text-destructive"
                  onClick={handleSubmitSemValidacao}
                >
                  Tentar sem validacao
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Dialog de Confirmacao */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !isPublishing && setIsDialogOpen(open)}>
        <DialogContent>
          {publishSuccess ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <DialogTitle className="text-xl">Produto Publicado!</DialogTitle>
              <DialogDescription className="mt-2">
                Seu produto <strong>{nomeProduto}</strong> foi publicado com sucesso no marketplace.
              </DialogDescription>
              <div className="mt-4 p-3 rounded-lg bg-muted text-sm w-full">
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Shield className="h-4 w-4" />
                  <span className="font-medium">Registrado em Blockchain</span>
                </div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  <code className="font-mono text-xs text-muted-foreground">
                    TX: 0x{Math.random().toString(16).slice(2, 10)}...
                    {Math.random().toString(16).slice(2, 6)}
                  </code>
                </div>
              </div>
              <Button className="mt-6" onClick={resetForm}>
                Cadastrar Novo Produto
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Confirmar Publicacao</DialogTitle>
                <DialogDescription>
                  Revise as informacoes antes de publicar no marketplace.
                </DialogDescription>
              </DialogHeader>

              {plantacaoAtual && (
                <div className="py-4 space-y-4">
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        {plantacaoAtual.tipo === "fruto" ? (
                          <Package className="h-6 w-6 text-primary" />
                        ) : (
                          <Leaf className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{nomeProduto}</p>
                        <p className="text-sm text-muted-foreground">{plantacaoAtual.especie}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Quantidade:</span>
                        <p className="font-medium">
                          {quantidade} {plantacaoAtual.unidade}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Preco:</span>
                        <p className="font-medium text-primary">
                          R$ {Number(precoReais).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="text-primary font-medium">Origem Verificada</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{plantacaoAtual.nome}</p>
                    <code className="text-xs font-mono text-muted-foreground block mt-1 truncate">
                      {plantacaoAtual.hashBlockchain}
                    </code>
                  </div>

                  {isPublishing && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Registrando na blockchain...</span>
                        <span className="text-primary">75%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                  )}
                </div>
              )}

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isPublishing}>
                  Cancelar
                </Button>
                <Button onClick={handlePublicar} disabled={isPublishing}>
                  {isPublishing ? "Publicando..." : "Confirmar Publicacao"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
