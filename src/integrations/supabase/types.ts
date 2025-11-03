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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          account_type: string
          balance: number
          category: string
          created_at: string
          id: string
          name: string
          savings_amount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_type: string
          balance?: number
          category: string
          created_at?: string
          id?: string
          name: string
          savings_amount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_type?: string
          balance?: number
          category?: string
          created_at?: string
          id?: string
          name?: string
          savings_amount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      balance_sheets: {
        Row: {
          assets: Json
          created_at: string | null
          id: string
          liabilities: Json
          notes: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assets?: Json
          created_at?: string | null
          id?: string
          liabilities?: Json
          notes?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assets?: Json
          created_at?: string | null
          id?: string
          liabilities?: Json
          notes?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      business_information: {
        Row: {
          created_at: string | null
          id: string
          information: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          information?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          information?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cash_flow_items: {
        Row: {
          amount: number
          created_at: string
          flow_type: Database["public"]["Enums"]["flow_type"]
          frequency: string
          id: string
          inflow_category: Database["public"]["Enums"]["inflow_category"] | null
          linked_account_id: string | null
          name: string
          notes: string | null
          outflow_category:
            | Database["public"]["Enums"]["outflow_category"]
            | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          flow_type: Database["public"]["Enums"]["flow_type"]
          frequency?: string
          id?: string
          inflow_category?:
            | Database["public"]["Enums"]["inflow_category"]
            | null
          linked_account_id?: string | null
          name: string
          notes?: string | null
          outflow_category?:
            | Database["public"]["Enums"]["outflow_category"]
            | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          flow_type?: Database["public"]["Enums"]["flow_type"]
          frequency?: string
          id?: string
          inflow_category?:
            | Database["public"]["Enums"]["inflow_category"]
            | null
          linked_account_id?: string | null
          name?: string
          notes?: string | null
          outflow_category?:
            | Database["public"]["Enums"]["outflow_category"]
            | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_flow_items_linked_account_id_fkey"
            columns: ["linked_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      invite_codes: {
        Row: {
          code: string
          created_at: string | null
          created_by: string
          id: string
          is_used: boolean | null
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by: string
          id?: string
          is_used?: boolean | null
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string
          id?: string
          is_used?: boolean | null
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      net_worth_history: {
        Row: {
          calculated_from_balance_sheet_id: string | null
          id: string
          month: number
          net_worth: number
          recorded_at: string | null
          user_id: string
          year: number
        }
        Insert: {
          calculated_from_balance_sheet_id?: string | null
          id?: string
          month: number
          net_worth: number
          recorded_at?: string | null
          user_id: string
          year: number
        }
        Update: {
          calculated_from_balance_sheet_id?: string | null
          id?: string
          month?: number
          net_worth?: number
          recorded_at?: string | null
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "net_worth_history_calculated_from_balance_sheet_id_fkey"
            columns: ["calculated_from_balance_sheet_id"]
            isOneToOne: false
            referencedRelation: "balance_sheets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      statements_of_purpose: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "client"
      flow_type: "inflow" | "outflow"
      inflow_category:
        | "salary"
        | "investment_income"
        | "interest_income"
        | "business_income"
        | "other_income"
      outflow_category: "savings" | "transfers" | "expenses" | "debt_payments"
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
      app_role: ["super_admin", "client"],
      flow_type: ["inflow", "outflow"],
      inflow_category: [
        "salary",
        "investment_income",
        "interest_income",
        "business_income",
        "other_income",
      ],
      outflow_category: ["savings", "transfers", "expenses", "debt_payments"],
    },
  },
} as const
