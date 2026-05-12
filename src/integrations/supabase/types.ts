export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      blockchain_audits: {
        Row: {
          audit_status: string
          created_at: string
          id: string
          raw_response: Json | null
          user_id: string | null
          validated_at: string
        }
        Insert: {
          audit_status: string
          created_at?: string
          id?: string
          raw_response?: Json | null
          user_id?: string | null
          validated_at?: string
        }
        Update: {
          audit_status?: string
          created_at?: string
          id?: string
          raw_response?: Json | null
          user_id?: string | null
          validated_at?: string
        }
        Relationships: []
      }
      blockchain_blocks: {
        Row: {
          block_hash: string
          block_index: number
          created_at: string
          difficulty: number | null
          external_status: string | null
          id: string
          merkle_root: string | null
          mined_at: string | null
          nonce: number | null
          previous_hash: string | null
          raw_response: Json | null
          total_transactions: number | null
        }
        Insert: {
          block_hash: string
          block_index: number
          created_at?: string
          difficulty?: number | null
          external_status?: string | null
          id?: string
          merkle_root?: string | null
          mined_at?: string | null
          nonce?: number | null
          previous_hash?: string | null
          raw_response?: Json | null
          total_transactions?: number | null
        }
        Update: {
          block_hash?: string
          block_index?: number
          created_at?: string
          difficulty?: number | null
          external_status?: string | null
          id?: string
          merkle_root?: string | null
          mined_at?: string | null
          nonce?: number | null
          previous_hash?: string | null
          raw_response?: Json | null
          total_transactions?: number | null
        }
        Relationships: []
      }
      blockchain_records: {
        Row: {
          api_response: Json | null
          audit_status: string | null
          block_hash: string | null
          block_index: number | null
          created_at: string
          error_message: string | null
          event_type: string
          external_hash: string | null
          external_status: string | null
          external_transaction_id: string | null
          id: string
          is_audited: boolean
          merkle_root: string | null
          mined_at: string | null
          nonce: number | null
          request_payload: Json
          target_id: string
          target_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          api_response?: Json | null
          audit_status?: string | null
          block_hash?: string | null
          block_index?: number | null
          created_at?: string
          error_message?: string | null
          event_type: string
          external_hash?: string | null
          external_status?: string | null
          external_transaction_id?: string | null
          id?: string
          is_audited?: boolean
          merkle_root?: string | null
          mined_at?: string | null
          nonce?: number | null
          request_payload: Json
          target_id: string
          target_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          api_response?: Json | null
          audit_status?: string | null
          block_hash?: string | null
          block_index?: number | null
          created_at?: string
          error_message?: string | null
          event_type?: string
          external_hash?: string | null
          external_status?: string | null
          external_transaction_id?: string | null
          id?: string
          is_audited?: boolean
          merkle_root?: string | null
          mined_at?: string | null
          nonce?: number | null
          request_payload?: Json
          target_id?: string
          target_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      carbon_credit_credits: {
        Row: {
          blockchain_reference: string
          buyer_user_id: string | null
          consortium_id: string
          created_at: string
          credit_amount_tco2: number
          estimated_co2_kg_year: number
          id: string
          issued_at: string
          listed_at: string | null
          notes: string | null
          price_brl: number | null
          retired_at: string | null
          sold_at: string | null
          status: string
          token_code: string
          updated_at: string
          user_id: string
        }
        Insert: {
          blockchain_reference: string
          buyer_user_id?: string | null
          consortium_id: string
          created_at?: string
          credit_amount_tco2?: number
          estimated_co2_kg_year?: number
          id?: string
          issued_at?: string
          listed_at?: string | null
          notes?: string | null
          price_brl?: number | null
          retired_at?: string | null
          sold_at?: string | null
          status?: string
          token_code: string
          updated_at?: string
          user_id: string
        }
        Update: {
          blockchain_reference?: string
          buyer_user_id?: string | null
          consortium_id?: string
          created_at?: string
          credit_amount_tco2?: number
          estimated_co2_kg_year?: number
          id?: string
          issued_at?: string
          listed_at?: string | null
          notes?: string | null
          price_brl?: number | null
          retired_at?: string | null
          sold_at?: string | null
          status?: string
          token_code?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carbon_credit_credits_consortium_id_fkey"
            columns: ["consortium_id"]
            isOneToOne: false
            referencedRelation: "consortia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carbon_credit_credits_consortium_id_fkey"
            columns: ["consortium_id"]
            isOneToOne: false
            referencedRelation: "consortia_co2_summary"
            referencedColumns: ["consortium_id"]
          },
          {
            foreignKeyName: "carbon_credit_credits_consortium_id_fkey"
            columns: ["consortium_id"]
            isOneToOne: false
            referencedRelation: "consortia_environment_dashboard"
            referencedColumns: ["consortium_id"]
          },
          {
            foreignKeyName: "carbon_credit_credits_consortium_id_fkey"
            columns: ["consortium_id"]
            isOneToOne: false
            referencedRelation: "consortia_environment_summary"
            referencedColumns: ["consortium_id"]
          },
          {
            foreignKeyName: "carbon_credit_credits_consortium_id_fkey"
            columns: ["consortium_id"]
            isOneToOne: false
            referencedRelation: "consortia_water_balance"
            referencedColumns: ["consortium_id"]
          },
          {
            foreignKeyName: "carbon_credit_credits_consortium_id_fkey"
            columns: ["consortium_id"]
            isOneToOne: false
            referencedRelation: "consortia_water_reference_summary"
            referencedColumns: ["consortium_id"]
          },
          {
            foreignKeyName: "carbon_credit_credits_consortium_id_fkey"
            columns: ["consortium_id"]
            isOneToOne: false
            referencedRelation: "producer_public_consortia"
            referencedColumns: ["consortium_id"]
          },
        ]
      }
      carbon_credit_transactions: {
        Row: {
          amount_tco2: number
          buyer_user_id: string | null
          created_at: string
          credit_id: string
          event_type: string
          id: string
          notes: string | null
          price_brl: number | null
          seller_user_id: string
        }
        Insert: {
          amount_tco2?: number
          buyer_user_id?: string | null
          created_at?: string
          credit_id: string
          event_type: string
          id?: string
          notes?: string | null
          price_brl?: number | null
          seller_user_id: string
        }
        Update: {
          amount_tco2?: number
          buyer_user_id?: string | null
          created_at?: string
          credit_id?: string
          event_type?: string
          id?: string
          notes?: string | null
          price_brl?: number | null
          seller_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carbon_credit_transactions_credit_id_fkey"
            columns: ["credit_id"]
            isOneToOne: false
            referencedRelation: "carbon_credit_credits"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      consortia: {
        Row: {
          area_hectares: number | null
          bonus_points: number
          created_at: string
          description: string | null
          id: string
          latitude: number | null
          location_label: string | null
          longitude: number | null
          measurement_mode: string
          name: string
          photo_url: string | null
          points: number
          species_list: string[]
          status: Database["public"]["Enums"]["record_status"]
          total_seedlings: number
          updated_at: string
          user_id: string
          verification_method: Database["public"]["Enums"]["verification_method"]
        }
        Insert: {
          area_hectares?: number | null
          bonus_points?: number
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number | null
          location_label?: string | null
          longitude?: number | null
          measurement_mode?: string
          name: string
          photo_url?: string | null
          points?: number
          species_list?: string[]
          status?: Database["public"]["Enums"]["record_status"]
          total_seedlings?: number
          updated_at?: string
          user_id: string
          verification_method?: Database["public"]["Enums"]["verification_method"]
        }
        Update: {
          area_hectares?: number | null
          bonus_points?: number
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number | null
          location_label?: string | null
          longitude?: number | null
          measurement_mode?: string
          name?: string
          photo_url?: string | null
          points?: number
          species_list?: string[]
          status?: Database["public"]["Enums"]["record_status"]
          total_seedlings?: number
          updated_at?: string
          user_id?: string
          verification_method?: Database["public"]["Enums"]["verification_method"]
        }
        Relationships: []
      }
      consortium_items: {
        Row: {
          consortium_id: string
          created_at: string
          custom_species_name: string | null
          id: string
          notes: string | null
          quantity: number
          species_id: string | null
          updated_at: string
        }
        Insert: {
          consortium_id: string
          created_at?: string
          custom_species_name?: string | null
          id?: string
          notes?: string | null
          quantity: number
          species_id?: string | null
          updated_at?: string
        }
        Update: {
          consortium_id?: string
          created_at?: string
          custom_species_name?: string | null
          id?: string
          notes?: string | null
          quantity?: number
          species_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consortium_items_consortium_id_fkey"
            columns: ["consortium_id"]
            isOneToOne: false
            referencedRelation: "consortia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consortium_items_consortium_id_fkey"
            columns: ["consortium_id"]
            isOneToOne: false
            referencedRelation: "consortia_co2_summary"
            referencedColumns: ["consortium_id"]
          },
          {
            foreignKeyName: "consortium_items_consortium_id_fkey"
            columns: ["consortium_id"]
            isOneToOne: false
            referencedRelation: "consortia_environment_dashboard"
            referencedColumns: ["consortium_id"]
          },
          {
            foreignKeyName: "consortium_items_consortium_id_fkey"
            columns: ["consortium_id"]
            isOneToOne: false
            referencedRelation: "consortia_environment_summary"
            referencedColumns: ["consortium_id"]
          },
          {
            foreignKeyName: "consortium_items_consortium_id_fkey"
            columns: ["consortium_id"]
            isOneToOne: false
            referencedRelation: "consortia_water_balance"
            referencedColumns: ["consortium_id"]
          },
          {
            foreignKeyName: "consortium_items_consortium_id_fkey"
            columns: ["consortium_id"]
            isOneToOne: false
            referencedRelation: "consortia_water_reference_summary"
            referencedColumns: ["consortium_id"]
          },
          {
            foreignKeyName: "consortium_items_consortium_id_fkey"
            columns: ["consortium_id"]
            isOneToOne: false
            referencedRelation: "producer_public_consortia"
            referencedColumns: ["consortium_id"]
          },
          {
            foreignKeyName: "consortium_items_species_id_fkey"
            columns: ["species_id"]
            isOneToOne: false
            referencedRelation: "species"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consortium_items_species_id_fkey"
            columns: ["species_id"]
            isOneToOne: false
            referencedRelation: "species_with_co2"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          last_message_at: string
          product_id: string | null
          seller_id: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          last_message_at?: string
          product_id?: string | null
          seller_id: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          last_message_at?: string
          product_id?: string | null
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      incentive_items: {
        Row: {
          available: boolean
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          photo_url: string | null
          points_cost: number
          stock: number
          updated_at: string
        }
        Insert: {
          available?: boolean
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          photo_url?: string | null
          points_cost?: number
          stock?: number
          updated_at?: string
        }
        Update: {
          available?: boolean
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          photo_url?: string | null
          points_cost?: number
          stock?: number
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      negotiation_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          negotiation_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          negotiation_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          negotiation_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "negotiation_messages_negotiation_id_fkey"
            columns: ["negotiation_id"]
            isOneToOne: false
            referencedRelation: "negotiations"
            referencedColumns: ["id"]
          },
        ]
      }
      negotiations: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          product_id: string
          seller_id: string
          status: Database["public"]["Enums"]["negotiation_status"]
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          product_id: string
          seller_id: string
          status?: Database["public"]["Enums"]["negotiation_status"]
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          product_id?: string
          seller_id?: string
          status?: Database["public"]["Enums"]["negotiation_status"]
          updated_at?: string
        }
        Relationships: []
      }
      plantings: {
        Row: {
          consortium_id: string | null
          created_at: string
          custom_species_name: string | null
          id: string
          latitude: number | null
          location_label: string | null
          longitude: number | null
          notes: string | null
          photo_url: string | null
          planted_at: string
          points: number
          species_id: string | null
          status: Database["public"]["Enums"]["record_status"]
          updated_at: string
          user_id: string
          verification_method: Database["public"]["Enums"]["verification_method"]
        }
        Insert: {
          consortium_id?: string | null
          created_at?: string
          custom_species_name?: string | null
          id?: string
          latitude?: number | null
          location_label?: string | null
          longitude?: number | null
          notes?: string | null
          photo_url?: string | null
          planted_at?: string
          points?: number
          species_id?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
          user_id: string
          verification_method?: Database["public"]["Enums"]["verification_method"]
        }
        Update: {
          consortium_id?: string | null
          created_at?: string
          custom_species_name?: string | null
          id?: string
          latitude?: number | null
          location_label?: string | null
          longitude?: number | null
          notes?: string | null
          photo_url?: string | null
          planted_at?: string
          points?: number
          species_id?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
          user_id?: string
          verification_method?: Database["public"]["Enums"]["verification_method"]
        }
        Relationships: [
          {
            foreignKeyName: "plantings_consortium_id_fkey"
            columns: ["consortium_id"]
            isOneToOne: false
            referencedRelation: "consortia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plantings_consortium_id_fkey"
            columns: ["consortium_id"]
            isOneToOne: false
            referencedRelation: "consortia_co2_summary"
            referencedColumns: ["consortium_id"]
          },
          {
            foreignKeyName: "plantings_consortium_id_fkey"
            columns: ["consortium_id"]
            isOneToOne: false
            referencedRelation: "consortia_environment_dashboard"
            referencedColumns: ["consortium_id"]
          },
          {
            foreignKeyName: "plantings_consortium_id_fkey"
            columns: ["consortium_id"]
            isOneToOne: false
            referencedRelation: "consortia_environment_summary"
            referencedColumns: ["consortium_id"]
          },
          {
            foreignKeyName: "plantings_consortium_id_fkey"
            columns: ["consortium_id"]
            isOneToOne: false
            referencedRelation: "consortia_water_balance"
            referencedColumns: ["consortium_id"]
          },
          {
            foreignKeyName: "plantings_consortium_id_fkey"
            columns: ["consortium_id"]
            isOneToOne: false
            referencedRelation: "consortia_water_reference_summary"
            referencedColumns: ["consortium_id"]
          },
          {
            foreignKeyName: "plantings_consortium_id_fkey"
            columns: ["consortium_id"]
            isOneToOne: false
            referencedRelation: "producer_public_consortia"
            referencedColumns: ["consortium_id"]
          },
          {
            foreignKeyName: "plantings_species_id_fkey"
            columns: ["species_id"]
            isOneToOne: false
            referencedRelation: "species"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plantings_species_id_fkey"
            columns: ["species_id"]
            isOneToOne: false
            referencedRelation: "species_with_co2"
            referencedColumns: ["id"]
          },
        ]
      }
      points_ledger: {
        Row: {
          created_at: string
          description: string | null
          id: string
          points_delta: number
          source_id: string | null
          source_type: Database["public"]["Enums"]["points_source"]
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          points_delta: number
          source_id?: string | null
          source_type: Database["public"]["Enums"]["points_source"]
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          points_delta?: number
          source_id?: string | null
          source_type?: Database["public"]["Enums"]["points_source"]
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          blockchain_hash: string | null
          blockchain_verified: boolean
          commercial_verification_note: string | null
          contact: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          kind: Database["public"]["Enums"]["product_kind"]
          name: string
          origin: Database["public"]["Enums"]["product_origin"]
          photo_url: string | null
          price_brl: number | null
          price_points: number | null
          product_type: Database["public"]["Enums"]["product_type"]
          quantity: number
          seller_id: string
          source_consortium_id: string | null
          source_planting_id: string | null
          species_id: string | null
          status: Database["public"]["Enums"]["record_status"]
          sustainable_category: string | null
          sustainable_impact: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          blockchain_hash?: string | null
          blockchain_verified?: boolean
          commercial_verification_note?: string | null
          contact?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          kind?: Database["public"]["Enums"]["product_kind"]
          name: string
          origin?: Database["public"]["Enums"]["product_origin"]
          photo_url?: string | null
          price_brl?: number | null
          price_points?: number | null
          product_type?: Database["public"]["Enums"]["product_type"]
          quantity?: number
          seller_id: string
          source_consortium_id?: string | null
          source_planting_id?: string | null
          species_id?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          sustainable_category?: string | null
          sustainable_impact?: string | null
          unit?: string
          updated_at?: string
        }
        Update: {
          blockchain_hash?: string | null
          blockchain_verified?: boolean
          commercial_verification_note?: string | null
          contact?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          kind?: Database["public"]["Enums"]["product_kind"]
          name?: string
          origin?: Database["public"]["Enums"]["product_origin"]
          photo_url?: string | null
          price_brl?: number | null
          price_points?: number | null
          product_type?: Database["public"]["Enums"]["product_type"]
          quantity?: number
          seller_id?: string
          source_consortium_id?: string | null
          source_planting_id?: string | null
          species_id?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          sustainable_category?: string | null
          sustainable_impact?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_source_consortium_id_fkey"
            columns: ["source_consortium_id"]
            isOneToOne: false
            referencedRelation: "consortia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_source_consortium_id_fkey"
            columns: ["source_consortium_id"]
            isOneToOne: false
            referencedRelation: "consortia_co2_summary"
            referencedColumns: ["consortium_id"]
          },
          {
            foreignKeyName: "products_source_consortium_id_fkey"
            columns: ["source_consortium_id"]
            isOneToOne: false
            referencedRelation: "consortia_environment_dashboard"
            referencedColumns: ["consortium_id"]
          },
          {
            foreignKeyName: "products_source_consortium_id_fkey"
            columns: ["source_consortium_id"]
            isOneToOne: false
            referencedRelation: "consortia_environment_summary"
            referencedColumns: ["consortium_id"]
          },
          {
            foreignKeyName: "products_source_consortium_id_fkey"
            columns: ["source_consortium_id"]
            isOneToOne: false
            referencedRelation: "consortia_water_balance"
            referencedColumns: ["consortium_id"]
          },
          {
            foreignKeyName: "products_source_consortium_id_fkey"
            columns: ["source_consortium_id"]
            isOneToOne: false
            referencedRelation: "consortia_water_reference_summary"
            referencedColumns: ["consortium_id"]
          },
          {
            foreignKeyName: "products_source_consortium_id_fkey"
            columns: ["source_consortium_id"]
            isOneToOne: false
            referencedRelation: "producer_public_consortia"
            referencedColumns: ["consortium_id"]
          },
          {
            foreignKeyName: "products_source_planting_id_fkey"
            columns: ["source_planting_id"]
            isOneToOne: false
            referencedRelation: "plantings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_species_id_fkey"
            columns: ["species_id"]
            isOneToOne: false
            referencedRelation: "species"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_species_id_fkey"
            columns: ["species_id"]
            isOneToOne: false
            referencedRelation: "species_with_co2"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          display_name: string
          email: string | null
          full_name: string | null
          id: string
          points: number
          producer_latitude: number | null
          producer_location_label: string | null
          producer_longitude: number | null
          role: Database["public"]["Enums"]["user_role"]
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          display_name?: string
          email?: string | null
          full_name?: string | null
          id?: string
          points?: number
          producer_latitude?: number | null
          producer_location_label?: string | null
          producer_longitude?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          display_name?: string
          email?: string | null
          full_name?: string | null
          id?: string
          points?: number
          producer_latitude?: number | null
          producer_location_label?: string | null
          producer_longitude?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      species: {
        Row: {
          base_points: number
          co2_category_id: string | null
          co2_factor_kg_per_seedling_year: number | null
          co2_factor_source: string | null
          common_name: string
          created_at: string
          created_by: string | null
          id: string
          is_custom: boolean
          scientific_name: string | null
          slug: string | null
          updated_at: string
          water_reference_liters_per_seedling_month: number | null
        }
        Insert: {
          base_points?: number
          co2_category_id?: string | null
          co2_factor_kg_per_seedling_year?: number | null
          co2_factor_source?: string | null
          common_name: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_custom?: boolean
          scientific_name?: string | null
          slug?: string | null
          updated_at?: string
          water_reference_liters_per_seedling_month?: number | null
        }
        Update: {
          base_points?: number
          co2_category_id?: string | null
          co2_factor_kg_per_seedling_year?: number | null
          co2_factor_source?: string | null
          common_name?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_custom?: boolean
          scientific_name?: string | null
          slug?: string | null
          updated_at?: string
          water_reference_liters_per_seedling_month?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "species_co2_category_id_fkey"
            columns: ["co2_category_id"]
            isOneToOne: false
            referencedRelation: "species_co2_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      species_co2_categories: {
        Row: {
          approximate_height: string | null
          co2_avg_kg_year: number
          co2_max_kg_year: number
          co2_min_kg_year: number
          created_at: string
          description: string | null
          dominant_structure: string | null
          id: string
          is_user_selectable: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
          water_avg_liters_month: number
          water_max_liters_month: number
          water_min_liters_month: number
        }
        Insert: {
          approximate_height?: string | null
          co2_avg_kg_year?: number
          co2_max_kg_year?: number
          co2_min_kg_year?: number
          created_at?: string
          description?: string | null
          dominant_structure?: string | null
          id?: string
          is_user_selectable?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
          water_avg_liters_month?: number
          water_max_liters_month?: number
          water_min_liters_month?: number
        }
        Update: {
          approximate_height?: string | null
          co2_avg_kg_year?: number
          co2_max_kg_year?: number
          co2_min_kg_year?: number
          created_at?: string
          description?: string | null
          dominant_structure?: string | null
          id?: string
          is_user_selectable?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
          water_avg_liters_month?: number
          water_max_liters_month?: number
          water_min_liters_month?: number
        }
        Relationships: []
      }
      validations: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["record_status"]
          target_id: string
          target_type: Database["public"]["Enums"]["validation_target"]
          validated_at: string | null
          validated_by: string | null
          verification_method: Database["public"]["Enums"]["verification_method"]
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          target_id: string
          target_type: Database["public"]["Enums"]["validation_target"]
          validated_at?: string | null
          validated_by?: string | null
          verification_method?: Database["public"]["Enums"]["verification_method"]
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          target_id?: string
          target_type?: Database["public"]["Enums"]["validation_target"]
          validated_at?: string | null
          validated_by?: string | null
          verification_method?: Database["public"]["Enums"]["verification_method"]
        }
        Relationships: []
      }
      water_logs: {
        Row: {
          consortium_id: string | null
          created_at: string
          id: string
          irrigation_method: string | null
          notes: string | null
          planting_id: string | null
          recorded_at: string
          source_type: string | null
          user_id: string
          water_liters: number
        }
        Insert: {
          consortium_id?: string | null
          created_at?: string
          id?: string
          irrigation_method?: string | null
          notes?: string | null
          planting_id?: string | null
          recorded_at?: string
          source_type?: string | null
          user_id: string
          water_liters: number
        }
        Update: {
          consortium_id?: string | null
          created_at?: string
          id?: string
          irrigation_method?: string | null
          notes?: string | null
          planting_id?: string | null
          recorded_at?: string
          source_type?: string | null
          user_id?: string
          water_liters?: number
        }
        Relationships: [
          {
            foreignKeyName: "water_logs_consortium_id_fkey"
            columns: ["consortium_id"]
            isOneToOne: false
            referencedRelation: "consortia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "water_logs_consortium_id_fkey"
            columns: ["consortium_id"]
            isOneToOne: false
            referencedRelation: "consortia_co2_summary"
            referencedColumns: ["consortium_id"]
          },
          {
            foreignKeyName: "water_logs_consortium_id_fkey"
            columns: ["consortium_id"]
            isOneToOne: false
            referencedRelation: "consortia_environment_dashboard"
            referencedColumns: ["consortium_id"]
          },
          {
            foreignKeyName: "water_logs_consortium_id_fkey"
            columns: ["consortium_id"]
            isOneToOne: false
            referencedRelation: "consortia_environment_summary"
            referencedColumns: ["consortium_id"]
          },
          {
            foreignKeyName: "water_logs_consortium_id_fkey"
            columns: ["consortium_id"]
            isOneToOne: false
            referencedRelation: "consortia_water_balance"
            referencedColumns: ["consortium_id"]
          },
          {
            foreignKeyName: "water_logs_consortium_id_fkey"
            columns: ["consortium_id"]
            isOneToOne: false
            referencedRelation: "consortia_water_reference_summary"
            referencedColumns: ["consortium_id"]
          },
          {
            foreignKeyName: "water_logs_consortium_id_fkey"
            columns: ["consortium_id"]
            isOneToOne: false
            referencedRelation: "producer_public_consortia"
            referencedColumns: ["consortium_id"]
          },
          {
            foreignKeyName: "water_logs_planting_id_fkey"
            columns: ["planting_id"]
            isOneToOne: false
            referencedRelation: "plantings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      blockchain_records_display: {
        Row: {
          audit_status: string | null
          block_hash: string | null
          block_index: number | null
          created_at: string | null
          error_message: string | null
          event_type: string | null
          external_hash: string | null
          external_status: string | null
          external_transaction_id: string | null
          id: string | null
          is_audited: boolean | null
          merkle_root: string | null
          mined_at: string | null
          nonce: number | null
          target_id: string | null
          target_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          audit_status?: string | null
          block_hash?: string | null
          block_index?: number | null
          created_at?: string | null
          error_message?: string | null
          event_type?: string | null
          external_hash?: string | null
          external_status?: string | null
          external_transaction_id?: string | null
          id?: string | null
          is_audited?: boolean | null
          merkle_root?: string | null
          mined_at?: string | null
          nonce?: number | null
          target_id?: string | null
          target_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          audit_status?: string | null
          block_hash?: string | null
          block_index?: number | null
          created_at?: string | null
          error_message?: string | null
          event_type?: string | null
          external_hash?: string | null
          external_status?: string | null
          external_transaction_id?: string | null
          id?: string | null
          is_audited?: boolean | null
          merkle_root?: string | null
          mined_at?: string | null
          nonce?: number | null
          target_id?: string | null
          target_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      consortia_co2_summary: {
        Row: {
          consortium_id: string | null
          estimated_co2_avg_kg_year: number | null
          estimated_co2_max_kg_year: number | null
          estimated_co2_min_kg_year: number | null
          name: string | null
          status: Database["public"]["Enums"]["record_status"] | null
          total_seedlings: number | null
          user_id: string | null
        }
        Relationships: []
      }
      consortia_environment_dashboard: {
        Row: {
          consortium_id: string | null
          estimated_co2_avg_kg_year: number | null
          estimated_co2_max_kg_year: number | null
          estimated_co2_min_kg_year: number | null
          estimated_water_avg_liters_month: number | null
          estimated_water_max_liters_month: number | null
          estimated_water_min_liters_month: number | null
          name: string | null
          status: Database["public"]["Enums"]["record_status"] | null
          total_seedlings: number | null
          user_id: string | null
        }
        Relationships: []
      }
      consortia_environment_summary: {
        Row: {
          consortium_id: string | null
          estimated_co2_kg_year: number | null
          name: string | null
          total_seedlings: number | null
          user_id: string | null
        }
        Relationships: []
      }
      consortia_water_balance: {
        Row: {
          actual_water_liters_month: number | null
          consortium_id: string | null
          estimated_water_avg_liters_month: number | null
          estimated_water_excess_liters_month: number | null
          estimated_water_max_liters_month: number | null
          estimated_water_min_liters_month: number | null
          estimated_water_savings_liters_month: number | null
          name: string | null
          reference_month: string | null
          total_seedlings: number | null
          user_id: string | null
        }
        Relationships: []
      }
      consortia_water_reference_summary: {
        Row: {
          consortium_id: string | null
          estimated_water_avg_liters_month: number | null
          estimated_water_max_liters_month: number | null
          estimated_water_min_liters_month: number | null
          name: string | null
          total_seedlings: number | null
          user_id: string | null
        }
        Relationships: []
      }
      consortia_water_usage_monthly: {
        Row: {
          actual_water_liters_month: number | null
          consortium_id: string | null
          reference_month: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "water_logs_consortium_id_fkey"
            columns: ["consortium_id"]
            isOneToOne: false
            referencedRelation: "consortia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "water_logs_consortium_id_fkey"
            columns: ["consortium_id"]
            isOneToOne: false
            referencedRelation: "consortia_co2_summary"
            referencedColumns: ["consortium_id"]
          },
          {
            foreignKeyName: "water_logs_consortium_id_fkey"
            columns: ["consortium_id"]
            isOneToOne: false
            referencedRelation: "consortia_environment_dashboard"
            referencedColumns: ["consortium_id"]
          },
          {
            foreignKeyName: "water_logs_consortium_id_fkey"
            columns: ["consortium_id"]
            isOneToOne: false
            referencedRelation: "consortia_environment_summary"
            referencedColumns: ["consortium_id"]
          },
          {
            foreignKeyName: "water_logs_consortium_id_fkey"
            columns: ["consortium_id"]
            isOneToOne: false
            referencedRelation: "consortia_water_balance"
            referencedColumns: ["consortium_id"]
          },
          {
            foreignKeyName: "water_logs_consortium_id_fkey"
            columns: ["consortium_id"]
            isOneToOne: false
            referencedRelation: "consortia_water_reference_summary"
            referencedColumns: ["consortium_id"]
          },
          {
            foreignKeyName: "water_logs_consortium_id_fkey"
            columns: ["consortium_id"]
            isOneToOne: false
            referencedRelation: "producer_public_consortia"
            referencedColumns: ["consortium_id"]
          },
        ]
      }
      environment_location_points: {
        Row: {
          created_at: string | null
          happened_at: string | null
          latitude: number | null
          location_label: string | null
          longitude: number | null
          status: string | null
          target_id: string | null
          target_type: string | null
          title: string | null
          user_id: string | null
        }
        Relationships: []
      }
      producer_public_consortia: {
        Row: {
          consortium_id: string | null
          created_at: string | null
          description: string | null
          estimated_co2_avg_kg_year: number | null
          estimated_water_avg_liters_month: number | null
          name: string | null
          photo_url: string | null
          total_seedlings: number | null
          user_id: string | null
          verification_method:
            | Database["public"]["Enums"]["verification_method"]
            | null
        }
        Relationships: []
      }
      producer_public_summary: {
        Row: {
          actual_water_liters_month: number | null
          avatar_url: string | null
          city: string | null
          consortia_count: number | null
          display_name: string | null
          estimated_co2_avg_kg_year: number | null
          estimated_water_savings_liters_month: number | null
          full_name: string | null
          listed_credits: number | null
          points: number | null
          producer_latitude: number | null
          producer_location_label: string | null
          producer_longitude: number | null
          reference_month: string | null
          revenue_brl: number | null
          sold_credits: number | null
          state: string | null
          total_credits: number | null
          total_seedlings: number | null
          total_tco2: number | null
          user_id: string | null
          verified_plantings_count: number | null
        }
        Relationships: []
      }
      species_with_co2: {
        Row: {
          base_points: number | null
          co2_avg_kg_year: number | null
          co2_category_description: string | null
          co2_category_height: string | null
          co2_category_id: string | null
          co2_category_name: string | null
          co2_category_slug: string | null
          co2_category_structure: string | null
          co2_max_kg_year: number | null
          co2_min_kg_year: number | null
          common_name: string | null
          created_at: string | null
          created_by: string | null
          id: string | null
          is_custom: boolean | null
          scientific_name: string | null
          slug: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "species_co2_category_id_fkey"
            columns: ["co2_category_id"]
            isOneToOne: false
            referencedRelation: "species_co2_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_blockchain_summary: {
        Row: {
          auditados_validos: number | null
          minerados: number | null
          pendentes: number | null
          total_eventos: number | null
          user_id: string | null
        }
        Relationships: []
      }
      user_carbon_credit_summary: {
        Row: {
          listed_credits: number | null
          listed_tco2: number | null
          retired_credits: number | null
          revenue_brl: number | null
          sold_credits: number | null
          sold_tco2: number | null
          total_credits: number | null
          total_tco2: number | null
          user_id: string | null
        }
        Relationships: []
      }
      user_co2_summary: {
        Row: {
          estimated_co2_avg_kg_year: number | null
          estimated_co2_max_kg_year: number | null
          estimated_co2_min_kg_year: number | null
          user_id: string | null
        }
        Relationships: []
      }
      user_environment_dashboard: {
        Row: {
          actual_water_liters_month: number | null
          estimated_co2_avg_kg_year: number | null
          estimated_co2_max_kg_year: number | null
          estimated_co2_min_kg_year: number | null
          estimated_water_avg_liters_month: number | null
          estimated_water_excess_liters_month: number | null
          estimated_water_max_liters_month: number | null
          estimated_water_min_liters_month: number | null
          estimated_water_savings_liters_month: number | null
          reference_month: string | null
          user_id: string | null
        }
        Relationships: []
      }
      user_water_balance: {
        Row: {
          actual_water_liters_month: number | null
          estimated_water_avg_liters_month: number | null
          estimated_water_excess_liters_month: number | null
          estimated_water_max_liters_month: number | null
          estimated_water_min_liters_month: number | null
          estimated_water_savings_liters_month: number | null
          reference_month: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_conversation_participant: {
        Args: { _conv: string; _user: string }
        Returns: boolean
      }
      is_negotiation_participant: {
        Args: { _neg: string; _user: string }
        Returns: boolean
      }
      recalculate_consortium_points: {
        Args: { _consortium_id: string }
        Returns: undefined
      }
      recalculate_consortium_total_seedlings: {
        Args: { _consortium_id: string }
        Returns: undefined
      }
      recalculate_points: { Args: { _user: string }; Returns: undefined }
    }
    Enums: {
      negotiation_status: "open" | "in_progress" | "closed" | "cancelled"
      points_source:
        | "planting"
        | "consortium"
        | "redeem"
        | "adjustment"
        | "sale"
      product_kind: "sale" | "incentive"
      product_origin: "verified_planting" | "rural_other"
      product_type: "seedling" | "harvest" | "service" | "material" | "other"
      record_status: "pending" | "verified" | "rejected"
      user_role: "user" | "moderator" | "admin"
      validation_target: "seedling" | "consortium"
      verification_method: "photo" | "time" | "hybrid"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      negotiation_status: ["open", "in_progress", "closed", "cancelled"],
      points_source: ["planting", "consortium", "redeem", "adjustment", "sale"],
      product_kind: ["sale", "incentive"],
      product_origin: ["verified_planting", "rural_other"],
      product_type: ["seedling", "harvest", "service", "material", "other"],
      record_status: ["pending", "verified", "rejected"],
      user_role: ["user", "moderator", "admin"],
      validation_target: ["seedling", "consortium"],
      verification_method: ["photo", "time", "hybrid"],
    },
  },
} as const
