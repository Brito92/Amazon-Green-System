// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  getCorsHeaders,
  jsonResponse,
  validateCorsOrigin,
} from "../_shared.ts";

Deno.serve(async (req) => {
  const requestOrigin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(requestOrigin);

  // Validate CORS origin
  if (!validateCorsOrigin(requestOrigin)) {
    return jsonResponse(
      { error: "Origin não autorizada." },
      403,
      corsHeaders,
    );
  }

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse(
        { error: "Authorization ausente." },
        401,
        corsHeaders,
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const blockchainApiBaseUrl = Deno.env.get("BLOCKCHAIN_API_BASE_URL")!;
    const blockchainApiToken = Deno.env.get("BLOCKCHAIN_API_TOKEN")!;

    const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseUserClient.auth.getUser();

    if (userError || !user) {
      return jsonResponse(
        { error: "Usuário não autenticado." },
        401,
        corsHeaders,
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile || !["admin", "moderator"].includes(profile.role)) {
      return jsonResponse(
        { error: "Sem permissão para auditar." },
        403,
        corsHeaders,
      );
    }

    const apiResponse = await fetch(`${blockchainApiBaseUrl}/validar.php`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${blockchainApiToken}`,
      },
    });

    const apiJson = await apiResponse.json();

    const auditStatus =
      apiJson?.sucesso === true || apiJson?.status === "valido" ? "valido" : "invalido";

    await supabaseAdmin.from("blockchain_audits").insert({
      user_id: user.id,
      audit_status: auditStatus,
      raw_response: apiJson,
    });

    await supabaseAdmin
      .from("blockchain_records")
      .update({
        is_audited: auditStatus === "valido",
        audit_status: auditStatus,
      })
      .not("block_hash", "is", null);

    return jsonResponse(
      {
        success: true,
        audit_status: auditStatus,
        blockchain: apiJson,
      },
      200,
      corsHeaders,
    );
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Erro inesperado." },
      500,
      corsHeaders,
    );
  }
});
