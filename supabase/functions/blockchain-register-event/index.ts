import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type TargetType = "planting" | "consortium" | "carbon_credit";
type EventType = "muda_validada" | "consorcio_validado" | "credito_emitido";

type RequestBody = {
  targetType: TargetType;
  targetId: string;
  eventType: EventType;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Authorization header ausente." }, 401);
    }

    const body = (await req.json()) as RequestBody;

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
      return jsonResponse({ error: "Usuário não autenticado." }, 401);
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    const existingRes = await supabaseAdmin
      .from("blockchain_records")
      .select("id")
      .eq("target_type", body.targetType)
      .eq("target_id", body.targetId)
      .eq("event_type", body.eventType)
      .maybeSingle();

    if (existingRes.data?.id) {
      return jsonResponse(
        {
          success: false,
          message: "Este evento já foi registrado anteriormente.",
          existingId: existingRes.data.id,
        },
        409,
      );
    }

    const payload = await buildBlockchainPayload({
      supabaseAdmin,
      userId: user.id,
      targetType: body.targetType,
      targetId: body.targetId,
      eventType: body.eventType,
    });

    const apiResponse = await fetch(`${blockchainApiBaseUrl}/registrar.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${blockchainApiToken}`,
      },
      body: JSON.stringify(payload),
    });

    const apiJson = await apiResponse.json();
    const transaction = apiJson?.transacao ?? null;

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("blockchain_records")
      .insert({
        user_id: user.id,
        target_type: body.targetType,
        target_id: body.targetId,
        event_type: body.eventType,
        request_payload: payload,
        api_response: apiJson,
        external_transaction_id: transaction?.id ? String(transaction.id) : null,
        external_hash: transaction?.hash ?? null,
        external_status: transaction?.status ?? null,
        error_message: apiJson?.sucesso === false ? apiJson?.mensagem ?? "Falha na API externa." : null,
      })
      .select("*")
      .single();

    if (insertError) {
      return jsonResponse(
        {
          error: insertError.message,
          blockchain_response: apiJson,
        },
        500,
      );
    }

    return jsonResponse(
      {
        success: true,
        message: "Evento registrado na blockchain com sucesso.",
        record: inserted,
        blockchain: apiJson,
      },
      200,
    );
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Erro inesperado." },
      500,
    );
  }
});

async function buildBlockchainPayload({
  supabaseAdmin,
  userId,
  targetType,
  targetId,
  eventType,
}: {
  supabaseAdmin: ReturnType<typeof createClient>;
  userId: string;
  targetType: TargetType;
  targetId: string;
  eventType: EventType;
}) {
  if (targetType === "planting" && eventType === "muda_validada") {
    const { data: planting, error } = await supabaseAdmin
      .from("plantings")
      .select(`
        id,
        user_id,
        planted_at,
        status,
        verification_method,
        species:species_id (
          common_name,
          scientific_name,
          co2_category_id
        )
      `)
      .eq("id", targetId)
      .eq("user_id", userId)
      .single();

    if (error || !planting) throw new Error("Muda não encontrada.");
    if (planting.status !== "verified") {
      throw new Error("Somente mudas validadas podem ser registradas.");
    }

    return {
      remetente: "Amazon Green System",
      dados: {
        evento: "muda_validada",
        titulo: "Plantio de muda validado",
        planting_id: planting.id,
        usuario_id: planting.user_id,
        especie: planting.species?.common_name ?? "Espécie não informada",
        nome_cientifico: planting.species?.scientific_name ?? null,
        metodo_validacao: planting.verification_method,
        data_plantio: planting.planted_at,
        status: planting.status,
      },
    };
  }

  if (targetType === "consortium" && eventType === "consorcio_validado") {
    const { data: consortium, error } = await supabaseAdmin
      .from("consortia")
      .select(`
        id,
        user_id,
        name,
        status,
        total_seedlings,
        verification_method
      `)
      .eq("id", targetId)
      .eq("user_id", userId)
      .single();

    if (error || !consortium) throw new Error("Consórcio não encontrado.");
    if (consortium.status !== "verified") {
      throw new Error("Somente consórcios validados podem ser registrados.");
    }

    const { data: env } = await supabaseAdmin
      .from("consortia_environment_dashboard")
      .select("*")
      .eq("consortium_id", consortium.id)
      .maybeSingle();

    const { data: items } = await supabaseAdmin
      .from("consortium_items")
      .select("quantity, species:species_id(common_name)")
      .eq("consortium_id", consortium.id);

    return {
      remetente: "Amazon Green System",
      dados: {
        evento: "consorcio_validado",
        titulo: "Consórcio validado",
        consortium_id: consortium.id,
        usuario_id: consortium.user_id,
        nome: consortium.name,
        total_mudas: consortium.total_seedlings,
        especies_diferentes: items?.length ?? 0,
        especies: (items ?? []).map((item) => ({
          nome: item.species?.common_name ?? "Espécie",
          quantidade: item.quantity,
        })),
        metodo_validacao: consortium.verification_method,
        co2_estimado_kg_ano: env?.estimated_co2_avg_kg_year ?? 0,
        agua_estimada_litros_mes: env?.estimated_water_avg_liters_month ?? 0,
        status: consortium.status,
      },
    };
  }

  if (targetType === "carbon_credit" && eventType === "credito_emitido") {
    const { data: credit, error } = await supabaseAdmin
      .from("carbon_credit_credits")
      .select(`
        id,
        user_id,
        consortium_id,
        token_code,
        credit_amount_tco2,
        estimated_co2_kg_year,
        status
      `)
      .eq("id", targetId)
      .eq("user_id", userId)
      .single();

    if (error || !credit) throw new Error("Crédito não encontrado.");

    return {
      remetente: "Amazon Green System",
      dados: {
        evento: "credito_emitido",
        titulo: "Crédito ambiental emitido",
        credit_id: credit.id,
        usuario_id: credit.user_id,
        consortium_id: credit.consortium_id,
        token_code: credit.token_code,
        estimated_co2_kg_year: credit.estimated_co2_kg_year,
        credit_amount_tco2: credit.credit_amount_tco2,
        status: credit.status,
      },
    };
  }

  throw new Error("Combinação de targetType e eventType não suportada.");
}
