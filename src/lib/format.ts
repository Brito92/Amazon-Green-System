export const brl = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export const ptDate = (value: string | Date | null | undefined) => {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(date);
};

export const ptDateTime = (value: string | Date | null | undefined) => {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

export const greet = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
};

export const statusLabel = (status: string) => {
  switch (status) {
    case "verified":
      return "Verificado";
    case "pending":
      return "Pendente";
    case "rejected":
      return "Rejeitado";
    default:
      return status;
  }
};

export const methodLabel = (method: string) => {
  switch (method) {
    case "photo":
      return "Foto / laudo";
    case "time":
      return "Tempo estimado";
    case "hybrid":
      return "Híbrido";
    default:
      return method;
  }
};
