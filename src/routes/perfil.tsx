import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { AppShell } from "@/components/AppShell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { parseOptionalLatitude, parseOptionalLongitude } from "@/lib/security-validation";
import { Loader2, MapPin, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/perfil")({
  component: () => (
    <AuthGuard>
      <AppShell>
        <PerfilPage />
      </AppShell>
    </AuthGuard>
  ),
});

function PerfilPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  useEffect(() => {
    if (!user) return;

    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select(
          "display_name, city, state, producer_location_label, producer_latitude, producer_longitude",
        )
        .eq("user_id", user.id)
        .maybeSingle();

      setDisplayName(data?.display_name ?? "");
      setCity(data?.city ?? "");
      setState(data?.state ?? "");
      setLocationLabel(data?.producer_location_label ?? "");
      setLatitude(data?.producer_latitude?.toString() ?? "");
      setLongitude(data?.producer_longitude?.toString() ?? "");
      setLoading(false);
    })();
  }, [user]);

  const captureLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Seu navegador não suporta geolocalização.");
      return;
    }

    setCapturing(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(7));
        setLongitude(position.coords.longitude.toFixed(7));
        setCapturing(false);
        toast.success("Localização capturada com sucesso.");
      },
      () => {
        setCapturing(false);
        toast.error("Não foi possível capturar sua localização.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  };

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    let parsedLatitude: number | null;
    let parsedLongitude: number | null;
    try {
      parsedLatitude = parseOptionalLatitude(latitude);
      parsedLongitude = parseOptionalLongitude(longitude);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Coordenadas inválidas.");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim() || "Produtor(a)",
        city: city.trim() || null,
        state: state.trim() || null,
        producer_location_label: locationLabel.trim() || null,
        producer_latitude: parsedLatitude,
        producer_longitude: parsedLongitude,
      })
      .eq("user_id", user.id);

    setSaving(false);

    if (error) {
      toast.error("Não foi possível salvar seu perfil.");
      return;
    }

    toast.success("Perfil atualizado com sucesso.");
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold">Perfil do produtor</h1>
        <p className="text-sm text-muted-foreground">
          Atualize seus dados públicos e informe onde suas mudas e consórcios estão localizados.
        </p>
      </header>

      <Alert className="border-primary/20 bg-secondary/40">
        <MapPin className="h-4 w-4" />
        <AlertTitle>Localização simples e funcional</AlertTitle>
        <AlertDescription>
          Nesta versão, você pode informar cidade, estado, uma descrição do local de plantio e,
          se quiser, capturar latitude e longitude atuais pelo navegador.
        </AlertDescription>
      </Alert>

      <Card className="shadow-card border-border/60">
        <CardHeader>
          <CardTitle className="font-display">Dados públicos do produtor</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando seu perfil...
            </div>
          ) : (
            <form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Nome público</Label>
                <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input value={city} onChange={(event) => setCity(event.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <Input value={state} onChange={(event) => setState(event.target.value)} />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Local de plantio</Label>
                <Textarea
                  rows={3}
                  value={locationLabel}
                  onChange={(event) => setLocationLabel(event.target.value)}
                  placeholder="Ex.: Comunidade São José, ramal X, zona rural de Iranduba."
                />
              </div>

              <div className="space-y-2">
                <Label>Latitude</Label>
                <Input value={latitude} onChange={(event) => setLatitude(event.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Longitude</Label>
                <Input value={longitude} onChange={(event) => setLongitude(event.target.value)} />
              </div>

              <div className="sm:col-span-2 flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void captureLocation()}
                  disabled={capturing}
                >
                  {capturing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Usar minha localização atual
                </Button>

                <Button type="submit" disabled={saving} className="bg-gradient-forest">
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Salvar perfil
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
