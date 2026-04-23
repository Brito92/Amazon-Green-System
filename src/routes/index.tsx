import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: IndexRedirect,
});

function IndexRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.navigate({ to: user ? "/dashboard" : "/login" });
  }, [user, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-soft">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}
