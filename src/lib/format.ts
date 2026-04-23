export const brl = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
};

export const ptDate = (value: string | Date | null | undefined) => {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(d);
};

export const ptDateTime = (value: string | Date | null | undefined) => {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(d);
};

export const greet = () => {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
};

export const statusLabel = (s: string) => {
  switch (s) {
    case "verified": return "Verificado";
    case "pending": return "Pendente";
    case "rejected": return "Rejeitado";
    default: return s;
  }
};

export const methodLabel = (m: string) => {
  switch (m) {
    case "photo": return "Foto / laudo";
    case "time": return "Tempo estimado";
    case "hybrid": return "Híbrido";
    default: return m;
  }
};
