"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

// Tipos
export interface ProdutoVenda {
  id: string
  nome: string
  descricao: string
  especie: string
  tipo: "fruto" | "muda"
  quantidade: number
  unidade: string
  precoReais: number
  precoPontos?: number
  fotos: string[]
  vendedorId: string
  vendedorNome: string
  vendedorAvatar: string
  plantacaoOrigem: string
  hashBlockchain: string
  dataPublicacao: string
  status: "disponivel" | "reservado" | "vendido"
}

export interface Negociacao {
  id: string
  produtoId: string
  produto: ProdutoVenda
  compradorId: string
  compradorNome: string
  compradorAvatar: string
  vendedorId: string
  vendedorNome: string
  vendedorAvatar: string
  status: "ativa" | "finalizada" | "cancelada"
  dataCriacao: string
  mensagens: MensagemNegociacao[]
}

export interface MensagemNegociacao {
  id: string
  remetenteId: string
  remetenteNome: string
  remetenteAvatar: string
  conteudo: string
  horario: string
  isOwn: boolean
}

// Produtos de exemplo (do usuario e de outros)
const produtosIniciais: ProdutoVenda[] = [
  {
    id: "prod-1",
    nome: "Castanha-do-Para Premium",
    descricao: "Castanhas frescas colhidas diretamente da floresta, com certificacao de origem sustentavel.",
    especie: "Castanha-do-Para",
    tipo: "fruto",
    quantidade: 50,
    unidade: "kg",
    precoReais: 45.00,
    precoPontos: 180,
    fotos: [],
    vendedorId: "user-current",
    vendedorNome: "Voce",
    vendedorAvatar: "EU",
    plantacaoOrigem: "Lote de Castanheira 04",
    hashBlockchain: "0x7f8a3d2e1c9b4f5a6d7e8c9b0a1f2e3d4c5b6a78",
    dataPublicacao: "18/04/2025",
    status: "disponivel",
  },
  {
    id: "prod-2",
    nome: "Mudas de Acai Selecionadas",
    descricao: "Mudas de alta qualidade, prontas para plantio. Desenvolvidas em viveiro controlado.",
    especie: "Acai",
    tipo: "muda",
    quantidade: 100,
    unidade: "mudas",
    precoReais: 8.50,
    precoPontos: 35,
    fotos: [],
    vendedorId: "user-current",
    vendedorNome: "Voce",
    vendedorAvatar: "EU",
    plantacaoOrigem: "Viveiro de Acai Norte",
    hashBlockchain: "0x9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d",
    dataPublicacao: "15/04/2025",
    status: "disponivel",
  },
  {
    id: "prod-3",
    nome: "Cupuacu Organico",
    descricao: "Frutos frescos de cupuacu, ideais para producao de polpa e derivados.",
    especie: "Cupuacu",
    tipo: "fruto",
    quantidade: 30,
    unidade: "kg",
    precoReais: 25.00,
    precoPontos: 100,
    fotos: [],
    vendedorId: "user-maria",
    vendedorNome: "Maria Silva",
    vendedorAvatar: "MS",
    plantacaoOrigem: "Sitio Esperanca",
    hashBlockchain: "0x4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b",
    dataPublicacao: "12/04/2025",
    status: "disponivel",
  },
  {
    id: "prod-4",
    nome: "Mudas de Andiroba",
    descricao: "Mudas nativas de andiroba, excelentes para reflorestamento e producao de oleo.",
    especie: "Andiroba",
    tipo: "muda",
    quantidade: 50,
    unidade: "mudas",
    precoReais: 12.00,
    precoPontos: 50,
    fotos: [],
    vendedorId: "user-joao",
    vendedorNome: "Joao Santos",
    vendedorAvatar: "JS",
    plantacaoOrigem: "Viveiro Verde",
    hashBlockchain: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c",
    dataPublicacao: "10/04/2025",
    status: "disponivel",
  },
  {
    id: "prod-5",
    nome: "Castanha Premium Lote Especial",
    descricao: "Selecao especial de castanhas de grande porte, colheita premium.",
    especie: "Castanha-do-Para",
    tipo: "fruto",
    quantidade: 25,
    unidade: "kg",
    precoReais: 65.00,
    precoPontos: 260,
    fotos: [],
    vendedorId: "user-ana",
    vendedorNome: "Ana Costa",
    vendedorAvatar: "AC",
    plantacaoOrigem: "Reserva Florestal Ana",
    hashBlockchain: "0x6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d",
    dataPublicacao: "08/04/2025",
    status: "disponivel",
  },
]

// Negociacoes iniciais de exemplo
const negociacoesIniciais: Negociacao[] = [
  {
    id: "neg-1",
    produtoId: "prod-3",
    produto: produtosIniciais[2],
    compradorId: "user-current",
    compradorNome: "Voce",
    compradorAvatar: "EU",
    vendedorId: "user-maria",
    vendedorNome: "Maria Silva",
    vendedorAvatar: "MS",
    status: "ativa",
    dataCriacao: "19/04/2025",
    mensagens: [
      {
        id: "msg-1",
        remetenteId: "user-current",
        remetenteNome: "Voce",
        remetenteAvatar: "EU",
        conteudo: "Ola! Tenho interesse no Cupuacu Organico. Ainda esta disponivel?",
        horario: "10:30",
        isOwn: true,
      },
      {
        id: "msg-2",
        remetenteId: "user-maria",
        remetenteNome: "Maria Silva",
        remetenteAvatar: "MS",
        conteudo: "Ola! Sim, esta disponivel. Sao 30kg de cupuacu fresco, colhidos ontem!",
        horario: "10:35",
        isOwn: false,
      },
    ],
  },
]

interface MarketplaceContextType {
  produtos: ProdutoVenda[]
  meusProdutos: ProdutoVenda[]
  produtosOutros: ProdutoVenda[]
  negociacoes: Negociacao[]
  minhasCompras: Negociacao[]
  minhasVendas: Negociacao[]
  adicionarProduto: (produto: Omit<ProdutoVenda, "id" | "dataPublicacao" | "status">) => void
  removerProduto: (id: string) => void
  atualizarProduto: (id: string, dados: Partial<ProdutoVenda>) => void
  iniciarNegociacao: (produto: ProdutoVenda) => string
  enviarMensagem: (negociacaoId: string, conteudo: string) => void
  finalizarNegociacao: (negociacaoId: string) => void
  negociacaoAtiva: Negociacao | null
  setNegociacaoAtiva: (negociacao: Negociacao | null) => void
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined)

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [produtos, setProdutos] = useState<ProdutoVenda[]>(produtosIniciais)
  const [negociacoes, setNegociacoes] = useState<Negociacao[]>(negociacoesIniciais)
  const [negociacaoAtiva, setNegociacaoAtiva] = useState<Negociacao | null>(null)

  const currentUserId = "user-current"

  const meusProdutos = produtos.filter((p) => p.vendedorId === currentUserId)
  const produtosOutros = produtos.filter((p) => p.vendedorId !== currentUserId)
  const minhasCompras = negociacoes.filter((n) => n.compradorId === currentUserId)
  const minhasVendas = negociacoes.filter((n) => n.vendedorId === currentUserId)

  const adicionarProduto = useCallback(
    (produto: Omit<ProdutoVenda, "id" | "dataPublicacao" | "status">) => {
      const novoProduto: ProdutoVenda = {
        ...produto,
        id: `prod-${Date.now()}`,
        dataPublicacao: new Date().toLocaleDateString("pt-BR"),
        status: "disponivel",
      }
      setProdutos((prev) => [novoProduto, ...prev])
    },
    []
  )

  const removerProduto = useCallback((id: string) => {
    setProdutos((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const atualizarProduto = useCallback((id: string, dados: Partial<ProdutoVenda>) => {
    setProdutos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...dados } : p))
    )
  }, [])

  const iniciarNegociacao = useCallback(
    (produto: ProdutoVenda): string => {
      // Verifica se ja existe negociacao ativa para este produto
      const negociacaoExistente = negociacoes.find(
        (n) => n.produtoId === produto.id && n.compradorId === currentUserId && n.status === "ativa"
      )

      if (negociacaoExistente) {
        setNegociacaoAtiva(negociacaoExistente)
        return negociacaoExistente.id
      }

      const novaNegociacao: Negociacao = {
        id: `neg-${Date.now()}`,
        produtoId: produto.id,
        produto,
        compradorId: currentUserId,
        compradorNome: "Voce",
        compradorAvatar: "EU",
        vendedorId: produto.vendedorId,
        vendedorNome: produto.vendedorNome,
        vendedorAvatar: produto.vendedorAvatar,
        status: "ativa",
        dataCriacao: new Date().toLocaleDateString("pt-BR"),
        mensagens: [
          {
            id: `msg-${Date.now()}`,
            remetenteId: currentUserId,
            remetenteNome: "Voce",
            remetenteAvatar: "EU",
            conteudo: `Ola! Tenho interesse no produto "${produto.nome}". Podemos negociar?`,
            horario: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            isOwn: true,
          },
        ],
      }

      setNegociacoes((prev) => [novaNegociacao, ...prev])
      setNegociacaoAtiva(novaNegociacao)
      return novaNegociacao.id
    },
    [negociacoes]
  )

  const enviarMensagem = useCallback((negociacaoId: string, conteudo: string) => {
    const novaMensagem: MensagemNegociacao = {
      id: `msg-${Date.now()}`,
      remetenteId: currentUserId,
      remetenteNome: "Voce",
      remetenteAvatar: "EU",
      conteudo,
      horario: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      isOwn: true,
    }

    setNegociacoes((prev) =>
      prev.map((n) =>
        n.id === negociacaoId
          ? { ...n, mensagens: [...n.mensagens, novaMensagem] }
          : n
      )
    )

    // Atualiza a negociacao ativa se for a mesma
    setNegociacaoAtiva((prev) =>
      prev?.id === negociacaoId
        ? { ...prev, mensagens: [...prev.mensagens, novaMensagem] }
        : prev
    )
  }, [])

  const finalizarNegociacao = useCallback((negociacaoId: string) => {
    setNegociacoes((prev) =>
      prev.map((n) =>
        n.id === negociacaoId ? { ...n, status: "finalizada" } : n
      )
    )

    // Marca o produto como vendido
    const negociacao = negociacoes.find((n) => n.id === negociacaoId)
    if (negociacao) {
      setProdutos((prev) =>
        prev.map((p) =>
          p.id === negociacao.produtoId ? { ...p, status: "vendido" } : p
        )
      )
    }
  }, [negociacoes])

  return (
    <MarketplaceContext.Provider
      value={{
        produtos,
        meusProdutos,
        produtosOutros,
        negociacoes,
        minhasCompras,
        minhasVendas,
        adicionarProduto,
        removerProduto,
        atualizarProduto,
        iniciarNegociacao,
        enviarMensagem,
        finalizarNegociacao,
        negociacaoAtiva,
        setNegociacaoAtiva,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  )
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext)
  if (context === undefined) {
    throw new Error("useMarketplace deve ser usado dentro de um MarketplaceProvider")
  }
  return context
}
