import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { statusLabel } from "@/lib/format";

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { className: string; Icon: React.ComponentType<{ className?: string }> }> = {
    verified: { className: "bg-leaf/20 text-leaf-foreground border border-leaf/30", Icon: CheckCircle2 },
    pending: { className: "bg-sun/20 text-sun-foreground border border-sun/30", Icon: Clock },
    rejected: { className: "bg-destructive/15 text-destructive border border-destructive/30", Icon: XCircle },
  };
  const cfg = map[status] ?? map.pending;
  return (
    <Badge variant="outline" className={`gap-1.5 font-medium ${cfg.className}`}>
      <cfg.Icon className="h-3 w-3" />
      {statusLabel(status)}
    </Badge>
  );
}
