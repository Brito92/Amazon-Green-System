import { supabase } from "@/integrations/supabase/client";

export type BlockchainTargetType = "planting" | "consortium" | "carbon_credit";
export type BlockchainEventType = "muda_validada" | "consorcio_validado" | "credito_emitido";

export type BlockchainRecord = {
  id: string;
  user_id: string;
  target_type: BlockchainTargetType;
  target_id: string;
  event_type: BlockchainEventType;
  external_transaction_id: string | null;
  external_hash: string | null;
  external_status: string | null;
  block_index: number | null;
  block_hash: string | null;
  merkle_root: string | null;
  nonce: number | null;
  mined_at: string | null;
  is_audited: boolean;
  audit_status: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

export async function registerBlockchainEvent(params: {
  targetType: BlockchainTargetType;
  targetId: string;
  eventType: BlockchainEventType;
}) {
  const { data, error } = await supabase.functions.invoke("blockchain-register-event", {
    body: {
      targetType: params.targetType,
      targetId: params.targetId,
      eventType: params.eventType,
    },
  });

  if (error) {
    throw new Error(error.message || "Falha ao registrar evento na blockchain.");
  }

  return data;
}

export async function mineBlockchain() {
  const { data, error } = await supabase.functions.invoke("blockchain-mine", {
    body: {},
  });

  if (error) {
    throw new Error(error.message || "Falha ao minerar bloco.");
  }

  return data;
}

export async function validateBlockchain() {
  const { data, error } = await supabase.functions.invoke("blockchain-validate", {
    body: {},
  });

  if (error) {
    throw new Error(error.message || "Falha ao validar blockchain.");
  }

  return data;
}

export async function getBlockchainRecords(params: {
  targetType: BlockchainTargetType;
  targetIds: string[];
  eventType: BlockchainEventType;
}) {
  if (!params.targetIds.length) return [] as BlockchainRecord[];

  const { data, error } = await supabase
    .from("blockchain_records_display")
    .select("*")
    .eq("target_type", params.targetType)
    .eq("event_type", params.eventType)
    .in("target_id", params.targetIds)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Falha ao consultar registros blockchain.");
  }

  return (data ?? []) as BlockchainRecord[];
}

export function getBlockchainStatus(record: BlockchainRecord | null | undefined) {
  if (!record) return "not_registered" as const;
  if (record.error_message) return "error" as const;
  if (record.is_audited && record.audit_status === "valido") return "audited" as const;
  if (record.block_hash || record.mined_at) return "mined" as const;
  return "pending" as const;
}

export function shortHash(hash: string | null | undefined, size = 10) {
  if (!hash) return "—";
  return `${hash.slice(0, size)}...`;
}
