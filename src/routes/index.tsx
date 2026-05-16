import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Capacitor } from "@capacitor/core";
import { useEffect } from "react";
import {
  ArrowRight,
  Download,
  Droplets,
  Leaf,
  Loader2,
  MapPinned,
  ShieldCheck,
  Sprout,
  Trees,
  Link2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  component: IndexEntry,
});

function IndexEntry() {
  const isNativeApp = Capacitor.isNativePlatform();
  if (isNativeApp) return <NativeIndexRedirect />;
  return <PresentationLanding />;
}

function NativeIndexRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.navigate({ to: user ? "/dashboard" : "/login" });
  }, [loading, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f9fafb]">
      <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
    </div>
  );
}

// ATUALIZADO: Informações mais precisas sobre o ecossistema
const impactCards = [
  {
    value: "SAFs e Plantios",
    label: "Gestão territorial",
    description: "O sistema organiza desde mudas isoladas até consórcios agroflorestais complexos em uma mesma base de dados.",
  },
  {
    value: "Métricas ESG",
    label: "CO₂ e Água monitorados",
    description: "Categorias ecológicas automatizam a estimativa de carbono e o balanço hídrico de cada projeto.",
  },
  {
    value: "Economia Verde",
    label: "Créditos e Pontuação",
    description: "O impacto ambiental verificado é convertido em ativos digitais simulados e ranking de produtores.",
  },
];

// ATUALIZADO: Inclusão de Blockchain, Geolocalização e Moderação
const features = [
  {
    icon: MapPinned,
    title: "Geolocalização Precisa",
    description:
      "Captura de latitude e longitude (GPS) no momento do plantio, criando um mapa real do reflorestamento na Amazônia.",
  },
  {
    icon: Droplets,
    title: "Indicadores Inteligentes",
    description:
      "Cálculo automático de tCO₂ e economia de água (L/mês) baseado em métricas ecológicas de cada espécie plantada.",
  },
  {
    icon: ShieldCheck,
    title: "Moderação Humana",
    description:
      "Governança rigorosa onde moderadores analisam fotos, métodos e dados antes de qualquer aprovação na plataforma.",
  },
  {
    icon: Link2, // Novo ícone para Blockchain
    title: "Registro em Blockchain",
    description:
      "Eventos críticos, como plantios validados e créditos emitidos, ganham um hash criptográfico imutável e auditável.",
  },
];

// ATUALIZADO: Passo a passo cobrindo todo o ciclo do ativo ambiental
const publicSteps = [
  "O produtor vai a campo e registra o plantio pelo aplicativo, informando espécies, fotos e coordenadas GPS.",
  "A plataforma cruza os dados das espécies com categorias ecológicas para gerar métricas de água e carbono.",
  "A equipe de moderação audita os dados. Se aprovado, o registro é selado permanentemente na Blockchain.",
  "O consórcio validado entra na vitrine pública e origina créditos ambientais negociáveis no ecossistema.",
];

function PresentationLanding() {
  return (
    <main className="min-h-screen bg-[#f9fafb] text-zinc-800">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="absolute right-0 top-32 h-72 w-72 rounded-full bg-teal-100/60 blur-3xl" />
        </div>

        <div className="mx-auto flex max-w-7xl flex-col gap-14 px-6 py-8 lg:px-10 lg:py-12">
          <header className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-white px-3 py-1 text-xs font-medium text-emerald-700 shadow-sm">
                <Leaf className="h-3.5 w-3.5" />
                Amazônia Sustentável em dados, território e impacto
              </div>
              <p className="mt-4 text-sm text-zinc-500">Amazon Green System</p>
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <a
                href="/apk/app-debug.apk"
                download
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-700"
              >
                <Download className="h-4 w-4" />
                Baixar APK
              </a>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700"
              >
                Acessar
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </header>

          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="max-w-3xl">
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
                Uma plataforma para registrar, visualizar e valorizar plantios sustentáveis na Amazônia.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
                O Amazon Green System organiza mudas, consórcios agroflorestais, localização exata via GPS,
                estimativa de carbono, uso de água e rastreabilidade blockchain em uma experiência simples, 
                acessível e pronta para celular.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700"
                >
                  Acessar o sistema
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="/apk/app-debug.apk"
                  download
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-700"
                >
                  <Download className="h-4 w-4" />
                  Baixar APK
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[2rem] border border-zinc-200/70 bg-white p-6 shadow-[0_24px_60px_-30px_rgba(16,94,71,0.25)]">
                <div className="grid gap-4">
                  <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 p-5 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-emerald-50/85">Visão do projeto</p>
                        <h2 className="mt-2 text-2xl font-semibold">Monitoramento ambiental de ponta a ponta</h2>
                      </div>
                      <Trees className="h-10 w-10 text-emerald-50/90" />
                    </div>
                    <p className="mt-4 text-sm leading-6 text-emerald-50/90">
                      Do plantio no território à emissão do crédito verde: cadastro, moderação, selo blockchain, 
                      mapa interativo e vitrine de produtores.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    {impactCards.map((card) => (
                      <article
                        key={card.label}
                        className="rounded-2xl border border-zinc-200/70 bg-[#fbfdfb] p-4"
                      >
                        <p className="text-sm font-semibold text-emerald-700">{card.value}</p>
                        <h3 className="mt-2 text-base font-semibold text-zinc-900">{card.label}</h3>
                        <p className="mt-2 text-sm leading-6 text-zinc-600">{card.description}</p>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-6 pb-6 lg:px-10">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200"
            >
              <div className="inline-flex rounded-xl bg-emerald-50 p-3 text-emerald-700">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-zinc-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* IMPACTO + FLUXO */}
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[2rem] border border-zinc-200/70 bg-white p-7 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">Ecossistema Confiável</p>
            <h2 className="mt-3 text-3xl font-semibold text-zinc-900">
              Conectando quem planta à Amazônia Sustentável
            </h2>
            <p className="mt-4 text-sm leading-7 text-zinc-600">
              A proposta é dar visibilidade a quem protege a floresta, organizando dados ambientais com 
              o mais alto nível de segurança cibernética e transparência pública.
            </p>
            
            {/* ATUALIZADO: Grid de 3 colunas para incluir a Transparência/Blockchain */}
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Produtores</p>
                <p className="mt-2 text-sm leading-6 text-zinc-700">
                  Organização do plantio, vitrine pública do impacto gerado e geração de renda via créditos simulados.
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Parceiros</p>
                <p className="mt-2 text-sm leading-6 text-zinc-700">
                  Acesso claro ao mapa de plantios, dados ESG consolidados (água e CO2) e compra de créditos simulados.
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Segurança</p>
                <p className="mt-2 text-sm leading-6 text-zinc-700">
                  Cada aprovação gera um registro imutável em Blockchain, eliminando fraudes e dupla contagem de impacto.
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-zinc-200/70 bg-white p-7 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">Fluxo resumido</p>
            <h2 className="mt-3 text-3xl font-semibold text-zinc-900">
              Do cadastro em campo ao ativo digital
            </h2>
            <div className="mt-6 space-y-3">
              {publicSteps.map((step, index) => (
                <div
                  key={step}
                  className="flex gap-4 rounded-2xl border border-zinc-200/70 bg-[#fbfdfb] p-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-7 text-zinc-700">{step}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      {/* CTA APK */}
      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-10">
        <div className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-600 to-teal-600 p-8 text-white shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-50/85">
                Aplicativo Android
              </p>
              <h2 className="mt-3 text-3xl font-semibold">Leve o sistema para campo com o APK do projeto</h2>
            </div>
            <div className="flex flex-col gap-3 lg:items-end">
              <a
                href="/apk/app-debug.apk"
                download
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-700 transition hover:-translate-y-0.5"
              >
                <Download className="h-4 w-4" />
                Baixar APK
              </a>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                Acessar o sistema
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Simples */}
      <footer className="mt-8 border-t border-zinc-200/60 bg-white py-6 text-center text-xs text-zinc-500">
        <p>© 2026 Amazon Green System. Preservando o bioma com tecnologia e governança.</p>
      </footer>
    </main>
  );
}