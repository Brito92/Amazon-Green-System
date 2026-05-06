import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { MapPin, Sprout, TreePine } from "lucide-react";
import "leaflet/dist/leaflet.css";

export const Route = createFileRoute("/mapa")({
  component: () => (
    <AuthGuard>
      <AppShell>
        <MapaPage />
      </AppShell>
    </AuthGuard>
  ),
});

type LocationPoint = Database["public"]["Views"]["environment_location_points"]["Row"];

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function MapaPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const [points, setPoints] = useState<LocationPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("environment_location_points")
        .select("*")
        .order("created_at", { ascending: false });
      setPoints((data ?? []) as LocationPoint[]);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!mapRef.current || points.length === 0) return;

    let cancelled = false;

    (async () => {
      const L = await import("leaflet");
      if (cancelled || !mapRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const first = points.find((point) => point.latitude !== null && point.longitude !== null);
      const center: [number, number] = first
        ? [Number(first.latitude), Number(first.longitude)]
        : [-3.119, -60.0217];

      const map = L.map(mapRef.current).setView(center, first ? 6 : 4);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      const bounds: [number, number][] = [];

      for (const point of points) {
        if (point.latitude === null || point.longitude === null) continue;

        const lat = Number(point.latitude);
        const lng = Number(point.longitude);
        bounds.push([lat, lng]);

        const color = point.target_type === "consorcio" ? "#1f5c3d" : "#c56a00";
        const label = point.location_label ? `<br/>${point.location_label}` : "";
        const popup = `<strong>${point.title ?? "Plantio"}</strong><br/>${point.target_type === "consorcio" ? "Consórcio" : "Muda"}${label}`;

        L.circleMarker([lat, lng], {
          radius: 8,
          color,
          weight: 2,
          fillColor: color,
          fillOpacity: 0.7,
        })
          .addTo(map)
          .bindPopup(popup);
      }

      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [24, 24] });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [points]);

  const stats = useMemo(() => {
    const seedlings = points.filter((point) => point.target_type === "muda").length;
    const consortia = points.filter((point) => point.target_type === "consorcio").length;
    const verified = points.filter((point) => point.status === "verified").length;
    return { seedlings, consortia, verified, total: points.length };
  }, [points]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold">Mapa ambiental</h1>
        <p className="text-sm text-muted-foreground">
          Visualize onde suas mudas e consórcios foram registrados no sistema.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total de pontos" value={formatNumber(stats.total)} hint="Mudas e consórcios com localização" />
        <MetricCard title="Mudas" value={formatNumber(stats.seedlings)} hint="Registros simples com coordenadas" />
        <MetricCard title="Consórcios" value={formatNumber(stats.consortia)} hint="Plantios estruturados com coordenadas" />
        <MetricCard title="Validados" value={formatNumber(stats.verified)} hint="Pontos já verificados na plataforma" />
      </section>

      <Card className="shadow-card border-border/60 overflow-hidden">
        <CardHeader>
          <CardTitle className="font-display">Plantios no território</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando localizações...</p>
          ) : points.length === 0 ? (
            <EmptyState
              icon={<MapPin className="h-10 w-10" />}
              title="Nenhum ponto com localização ainda"
              description="Cadastre ou edite mudas e consórcios para salvar latitude e longitude."
            />
          ) : (
            <>
              <div ref={mapRef} className="h-[420px] w-full rounded-xl border border-border/60" />
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="gap-1.5">
                  <TreePine className="h-3.5 w-3.5 text-primary" />
                  Marcadores verdes representam consórcios
                </Badge>
                <Badge variant="outline" className="gap-1.5">
                  <Sprout className="h-3.5 w-3.5 text-orange-600" />
                  Marcadores laranja representam mudas
                </Badge>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ hint, title, value }: { hint: string; title: string; value: string }) {
  return (
    <Card className="shadow-card border-border/60">
      <CardContent className="p-5">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{title}</div>
        <div className="mt-2 text-3xl font-display font-semibold">{value}</div>
        <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
      </CardContent>
    </Card>
  );
}
