import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Capacitor } from "@capacitor/core";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowRight,
  Download,
  Droplets,
  Leaf,
  MapPinned,
  ShieldCheck,
  Sprout,
  Trees,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: IndexEntry,
});

function IndexEntry() {
  const isNativeApp = Capacitor.isNativePlatform();

  if (isNativeApp) {
    return (
      <NativeIndexRedirect />
    );
  }

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-soft">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

const impactCards = [
  {
    value: "Consórcios + mudas",
    label: "Registro ambiental completo",
    description: "O sistema organiza plantios simples e agroflorestais em uma mesma plataforma.",
  },
  {
    value: "CO2 estimado",
    label: "Indicadores ambientais",
    description: "Cada espécie entra em categorias ecológicas que ajudam a estimar captura de carbono.",
  },
  {
    value: "Água monitorada",
    label: "Uso consciente",
    description: "O aplicativo registra consumo real e compara com referências ambientais.",
  },
];

const features = [
  {
    icon: Sprout,
    title: "Cadastro de plantios",
    description:
      "Permite registrar mudas simples, consórcios agroflorestais, espécies, quantidades e método de verificação.",
  },
  {
    icon: Droplets,
    title: "Água e carbono",
    description:
      "Transforma o plantio em indicadores ambientais visuais, com leitura de água, CO2 estimado e economia.",
  },
  {
    icon: MapPinned,
    title: "Localização dos plantios",
    description:
      "Salva latitude e longitude diretamente no cadastro da muda ou do consórcio e mostra tudo em mapa.",
  },
  {
    icon: ShieldCheck,
    title: "Validação e rastreabilidade",
    description:
      "Os registros podem ser validados e se tornam base para pontuação, vitrine de produtores e créditos simulados.",
  },
];

const publicSteps = [
  "O produtor registra a muda ou o consórcio pelo aplicativo.",
  "O sistema vincula espécies, quantidade, localização, água e estimativa de carbono.",
  "Os dados aparecem no dashboard, no mapa e na vitrine de produtores.",
  "Consórcios validados podem originar créditos ambientais simulados dentro da plataforma.",
];

function PresentationLanding() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(106,191,110,0.18),transparent_30%),linear-gradient(180deg,#faf7ee_0%,#f6f2e7_32%,#f8f6ef_100%)] text-foreground">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute -left-12 top-20 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-leaf/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-earth/15 blur-3xl" />
        </div>

        <div className="relative mx-auto flex max-w-7xl flex-col gap-14 px-6 py-8 lg:px-10 lg:py-10">
          <header className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-3 py-1 text-xs font-medium text-primary shadow-soft backdrop-blur">
                <Leaf className="h-3.5 w-3.5" />
                Amazônia Sustentável em dados, território e impacto
              </div>
              <p className="mt-4 text-sm text-muted-foreground">Amazon Green System</p>
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <a
                href="/apk/amazon-green-system.apk"
                download
                className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/85 px-4 py-2 text-sm font-medium text-foreground shadow-soft transition hover:-translate-y-0.5 hover:border-primary/30"
              >
                <Download className="h-4 w-4" />
                Baixar APK
              </a>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft transition hover:-translate-y-0.5 hover:opacity-95"
              >
                Acessar
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </header>

          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="max-w-3xl">
              <h1 className="text-balance font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Uma plataforma para registrar, visualizar e valorizar plantios sustentáveis na Amazônia.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                O Amazon Green System organiza mudas, consórcios agroflorestais, localização, uso de água,
                estimativa de carbono e créditos ambientais simulados em uma experiência simples, acessível e
                pronta para celular.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:-translate-y-0.5 hover:opacity-95"
                >
                  Acessar o sistema
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="/apk/amazon-green-system.apk"
                  download
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-white/90 px-6 py-3 text-sm font-semibold text-foreground shadow-soft transition hover:-translate-y-0.5 hover:border-primary/35"
                >
                  <Download className="h-4 w-4" />
                  Baixar APK
                </a>
              </div>

              <p className="mt-3 text-sm text-muted-foreground">
                Para ativar o download, coloque o arquivo final em{" "}
                <span className="rounded bg-primary/8 px-2 py-1 font-mono text-xs text-primary">
                  /public/apk/amazon-green-system.apk
                </span>
                .
              </p>
            </div>

            <div className="relative">
              <div className="rounded-[2rem] border border-primary/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.96),rgba(237,244,233,0.95))] p-6 shadow-[0_24px_80px_-36px_rgba(31,92,61,0.45)] backdrop-blur">
                <div className="grid gap-4">
                  <div className="rounded-3xl bg-gradient-forest p-5 text-primary-foreground">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-primary-foreground/75">Visão do projeto</p>
                        <h2 className="mt-2 text-2xl font-semibold">Monitoramento ambiental com foco no território</h2>
                      </div>
                      <Trees className="h-10 w-10 text-primary-foreground/85" />
                    </div>
                    <p className="mt-4 text-sm leading-6 text-primary-foreground/85">
                      Cadastro, validação, mapa de plantios, vitrine de produtores e valorização do impacto positivo.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    {impactCards.map((card) => (
                      <article key={card.label} className="rounded-3xl border border-primary/10 bg-white/90 p-4 shadow-card">
                        <p className="text-sm font-semibold text-primary">{card.value}</p>
                        <h3 className="mt-2 text-base font-semibold text-foreground">{card.label}</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.description}</p>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-6 lg:px-10">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-[1.75rem] border border-primary/10 bg-white/88 p-6 shadow-card backdrop-blur"
            >
              <div className="inline-flex rounded-2xl bg-secondary p-3 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[2rem] border border-primary/10 bg-white/90 p-7 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Impacto positivo</p>
            <h2 className="mt-3 text-3xl font-semibold text-foreground">Como o sistema se conecta com a Amazônia Sustentável</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              A proposta é dar visibilidade a quem planta, organiza dados ambientais de forma prática e mostra que
              reflorestamento, diversidade de espécies, água e território podem ser acompanhados em uma mesma
              plataforma digital.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-secondary p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Para o produtor</p>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  Mais organização, visibilidade, rastreabilidade dos plantios e oportunidade de apresentação do
                  impacto ambiental.
                </p>
              </div>
              <div className="rounded-3xl bg-secondary p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Para parceiros</p>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  Uma forma clara de visualizar consórcios, mapa de plantios, dados de água, CO2 e créditos simulados.
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-primary/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(240,247,236,0.98))] p-7 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Fluxo resumido</p>
            <h2 className="mt-3 text-3xl font-semibold text-foreground">Do cadastro ao mapa e aos créditos simulados</h2>
            <div className="mt-6 space-y-4">
              {publicSteps.map((step, index) => (
                <div key={step} className="flex gap-4 rounded-3xl border border-primary/8 bg-white/85 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-7 text-foreground">{step}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-10">
        <div className="rounded-[2rem] border border-primary/10 bg-gradient-forest p-8 text-primary-foreground shadow-soft">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-foreground/75">
                Aplicativo Android
              </p>
              <h2 className="mt-3 text-3xl font-semibold">Leve o sistema para campo com o APK do projeto</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-primary-foreground/85">
                Esta apresentação fica separada do restante do sistema. O aplicativo continua funcionando nas rotas
                internas, enquanto esta tela serve como portal de entrada, apresentação institucional e ponto de
                download do APK.
              </p>
            </div>
            <div className="flex flex-col gap-3 lg:items-end">
              <a
                href="/apk/amazon-green-system.apk"
                download
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary transition hover:-translate-y-0.5"
              >
                <Download className="h-4 w-4" />
                Baixar APK
              </a>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-white/8"
              >
                Acessar o sistema
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
