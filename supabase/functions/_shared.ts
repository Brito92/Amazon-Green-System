// @ts-nocheck
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

/**
 * Get CORS headers with restricted origins for security
 * Falls back to allowing single origin if ALLOWED_ORIGINS not set
 */
export function getCorsHeaders(requestOrigin?: string): Record<string, string> {
  const allowedOriginsEnv = Deno.env.get("ALLOWED_ORIGINS");
  const allowedOriginsList = allowedOriginsEnv
    ? allowedOriginsEnv.split(",").map((o) => o.trim())
    : ["https://zgcdpprvvkyjzxrxbvpk.supabase.co"];

  // If request origin is provided and in allowlist, use it; otherwise use first allowed
  const origin =
    requestOrigin && allowedOriginsList.includes(requestOrigin)
      ? requestOrigin
      : allowedOriginsList[0];

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Max-Age": "86400",
  };
}

/**
 * Build JSON response with secure CORS headers
 */
export function jsonResponse(
  data: unknown,
  status = 200,
  corsHeaders?: Record<string, string>,
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...(corsHeaders || getCorsHeaders()),
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

/**
 * Blockchain event validation schema
 */
export const blockchainEventSchema = z.object({
  targetType: z.enum(["planting", "consortium", "carbon_credit"]),
  targetId: z.string().uuid("ID deve ser um UUID válido"),
  eventType: z.enum([
    "muda_validada",
    "consorcio_validado",
    "credito_emitido",
  ]),
});

export type BlockchainEventPayload = z.infer<typeof blockchainEventSchema>;

/**
 * Safely parse and validate request body
 */
export async function parseAndValidateBody<T>(
  req: Request,
  schema: z.ZodSchema<T>,
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");
      return { success: false, error: errors };
    }

    return { success: true, data: parsed.data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao processar corpo da requisição",
    };
  }
}

/**
 * Validate CORS origin against allowlist
 */
export function validateCorsOrigin(requestOrigin?: string): boolean {
  if (!requestOrigin) return true; // Allow if no origin header

  const allowedOriginsEnv = Deno.env.get("ALLOWED_ORIGINS");
  if (!allowedOriginsEnv) return true; // If not configured, allow all (safer than hard-blocking)

  const allowedOriginsList = allowedOriginsEnv.split(",").map((o) => o.trim());
  return allowedOriginsList.includes(requestOrigin);
}
