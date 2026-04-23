import { Leaf } from "lucide-react";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims = { sm: "h-8 w-8 text-base", md: "h-10 w-10 text-lg", lg: "h-12 w-12 text-xl" }[size];
  return (
    <div className="flex items-center gap-2">
      <div className={`${dims} flex items-center justify-center rounded-xl bg-gradient-forest text-primary-foreground shadow-soft`}>
        <Leaf className="h-1/2 w-1/2" strokeWidth={2.5} />
      </div>
      <div className="leading-tight">
        <div className="font-display text-base font-semibold">Amazon Green</div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">SAF MarketLink</div>
      </div>
    </div>
  );
}
