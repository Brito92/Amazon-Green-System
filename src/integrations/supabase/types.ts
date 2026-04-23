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
  public: {
    Tables: {
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
          area_hectares: number
          bonus_points: number
          created_at: string
          description: string | null
          id: string
          name: string
          photo_url: string | null
          points: number
          species_list: string[]
          status: Database["public"]["Enums"]["record_status"]
          updated_at: string
          user_id: string
          verification_method: Database["public"]["Enums"]["verification_method"]
        }
        Insert: {
          area_hectares?: number
          bonus_points?: number
          created_at?: string
          description?: string | null
          id?: string
          name: string
          photo_url?: string | null
          points?: number
          species_list?: string[]
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
          user_id: string
          verification_method?: Database["public"]["Enums"]["verification_method"]
        }
        Update: {
          area_hectares?: number
          bonus_points?: number
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          photo_url?: string | null
          points?: number
          species_list?: string[]
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
          user_id?: string
          verification_method?: Database["public"]["Enums"]["verification_method"]
        }
        Relationships: []
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
            foreignKeyName: "plantings_species_id_fkey"
            columns: ["species_id"]
            isOneToOne: false
            referencedRelation: "species"
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
          common_name: string
          created_at: string
          created_by: string | null
          id: string
          is_custom: boolean
          scientific_name: string | null
          slug: string | null
          updated_at: string
        }
        Insert: {
          base_points?: number
          common_name: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_custom?: boolean
          scientific_name?: string | null
          slug?: string | null
          updated_at?: string
        }
        Update: {
          base_points?: number
          common_name?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_custom?: boolean
          scientific_name?: string | null
          slug?: string | null
          updated_at?: string
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
    }
    Views: {
      [_ in never]: never
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
