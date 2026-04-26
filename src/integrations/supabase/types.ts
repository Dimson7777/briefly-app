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
      assumptions: {
        Row: {
          brief_id: string
          content: string
          created_at: string
          id: string
        }
        Insert: {
          brief_id: string
          content: string
          created_at?: string
          id?: string
        }
        Update: {
          brief_id?: string
          content?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assumptions_brief_id_fkey"
            columns: ["brief_id"]
            isOneToOne: false
            referencedRelation: "briefs"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_history: {
        Row: {
          amount_cents: number | null
          created_at: string
          currency: string | null
          event: string
          id: string
          plan: string | null
          stripe_event_id: string | null
          user_id: string
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string
          currency?: string | null
          event: string
          id?: string
          plan?: string | null
          stripe_event_id?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number | null
          created_at?: string
          currency?: string | null
          event?: string
          id?: string
          plan?: string | null
          stripe_event_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      briefs: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          client_company: string | null
          client_name: string | null
          created_at: string
          deadline: string | null
          goals: string | null
          id: string
          overview: string | null
          project_type: string | null
          raw_notes: string | null
          revision_limit: number | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          client_company?: string | null
          client_name?: string | null
          created_at?: string
          deadline?: string | null
          goals?: string | null
          id?: string
          overview?: string | null
          project_type?: string | null
          raw_notes?: string | null
          revision_limit?: number | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          client_company?: string | null
          client_name?: string | null
          created_at?: string
          deadline?: string | null
          goals?: string | null
          id?: string
          overview?: string | null
          project_type?: string | null
          raw_notes?: string | null
          revision_limit?: number | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      deliverables: {
        Row: {
          brief_id: string
          created_at: string
          description: string | null
          id: string
          sort_order: number
          title: string
        }
        Insert: {
          brief_id: string
          created_at?: string
          description?: string | null
          id?: string
          sort_order?: number
          title: string
        }
        Update: {
          brief_id?: string
          created_at?: string
          description?: string | null
          id?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliverables_brief_id_fkey"
            columns: ["brief_id"]
            isOneToOne: false
            referencedRelation: "briefs"
            referencedColumns: ["id"]
          },
        ]
      }
      exclusions: {
        Row: {
          brief_id: string
          content: string
          created_at: string
          id: string
        }
        Insert: {
          brief_id: string
          content: string
          created_at?: string
          id?: string
        }
        Update: {
          brief_id?: string
          content?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exclusions_brief_id_fkey"
            columns: ["brief_id"]
            isOneToOne: false
            referencedRelation: "briefs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company: string | null
          created_at: string
          current_period_end: string | null
          full_name: string | null
          id: string
          plan: string
          theme: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          current_period_end?: string | null
          full_name?: string | null
          id: string
          plan?: string
          theme?: string
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          current_period_end?: string | null
          full_name?: string | null
          id?: string
          plan?: string
          theme?: string
          updated_at?: string
        }
        Relationships: []
      }
      timeline_items: {
        Row: {
          brief_id: string
          created_at: string
          due_date: string | null
          id: string
          label: string
          sort_order: number
        }
        Insert: {
          brief_id: string
          created_at?: string
          due_date?: string | null
          id?: string
          label: string
          sort_order?: number
        }
        Update: {
          brief_id?: string
          created_at?: string
          due_date?: string | null
          id?: string
          label?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "timeline_items_brief_id_fkey"
            columns: ["brief_id"]
            isOneToOne: false
            referencedRelation: "briefs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
