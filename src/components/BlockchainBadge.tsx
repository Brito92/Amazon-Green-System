import { Badge } from "@/components/ui/badge";
import { getBlockchainStatus, type BlockchainRecord } from "@/lib/blockchain";
import { Blocks, CheckCircle2, Clock3, ShieldAlert, ShieldCheck } from "lucide-react";

export function BlockchainBadge({ record }: { record?: BlockchainRecord | null }) {
  const status = getBlockchainStatus(record);

  if (status === "not_registered") {
    return (
      <Badge variant="outline" className="gap-1.5 text-muted-foreground">
        <Blocks className="h-3 w-3" />
        Não registrado
      </Badge>
    );
  }

  if (status === "pending") {
    return (
      <Badge variant="outline" className="gap-1.5 border-sun/30 bg-sun/10 text-sun-foreground">
        <Clock3 className="h-3 w-3" />
        Aguardando mineração
      </Badge>
    );
  }

  if (status === "mined") {
    return (
      <Badge variant="outline" className="gap-1.5 border-leaf/30 bg-leaf/10 text-leaf-foreground">
        <CheckCircle2 className="h-3 w-3" />
        Minerado
      </Badge>
    );
  }

  if (status === "audited") {
    return (
      <Badge variant="outline" className="gap-1.5 border-primary/30 bg-primary/10 text-primary">
        <ShieldCheck className="h-3 w-3" />
        Auditado
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="gap-1.5 border-destructive/30 bg-destructive/10 text-destructive"
    >
      <ShieldAlert className="h-3 w-3" />
      Erro
    </Badge>
  );
}
