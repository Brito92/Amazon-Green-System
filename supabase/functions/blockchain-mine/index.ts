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
        { error: "Sem permissão para minerar." },
        403,
        corsHeaders,
      );
    }

    const apiResponse = await fetch(`${blockchainApiBaseUrl}/minerar.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${blockchainApiToken}`,
      },
      body: JSON.stringify({}),
    });

    const apiJson = await apiResponse.json();
    const block = apiJson?.bloco;

    if (!apiJson?.sucesso || !block) {
      return jsonResponse(
        {
          error: apiJson?.mensagem ?? "Falha ao minerar bloco.",
          blockchain: apiJson,
        },
        500,
        corsHeaders,
      );
    }

    const minedAt = block.timestamp ? new Date(block.timestamp).toISOString() : new Date().toISOString();

    const { error: blockInsertError } = await supabaseAdmin.from("blockchain_blocks").insert({
      block_index: block.indice,
      block_hash: block.hash,
      previous_hash: block.hash_anterior,
      merkle_root: block.merkle_root,
      nonce: block.nonce,
      difficulty: block.dificuldade,
      total_transactions: block.total_transacoes,
      external_status: block.status,
      mined_at: minedAt,
      raw_response: apiJson,
    });

    if (blockInsertError) {
      return jsonResponse(
        { error: blockInsertError.message },
        500,
        corsHeaders,
      );
    }

    await supabaseAdmin
      .from("blockchain_records")
      .update({
        external_status: "minerado",
        block_index: block.indice,
        block_hash: block.hash,
        merkle_root: block.merkle_root,
        nonce: block.nonce,
        mined_at: minedAt,
      })
      .eq("external_status", "pendente");

    return jsonResponse(
      {
        success: true,
        message: "Bloco minerado com sucesso.",
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
