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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      budget_items: {
        Row: {
          client_id: string | null
          created_at: string
          description: string
          id: string
          labor_cost: number | null
          markup: number | null
          material_cost: number | null
          pieces: Json | null
          project_id: string | null
          status: string | null
          tax_rate: number | null
          total: number | null
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          description?: string
          id?: string
          labor_cost?: number | null
          markup?: number | null
          material_cost?: number | null
          pieces?: Json | null
          project_id?: string | null
          status?: string | null
          tax_rate?: number | null
          total?: number | null
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          description?: string
          id?: string
          labor_cost?: number | null
          markup?: number | null
          material_cost?: number | null
          pieces?: Json | null
          project_id?: string | null
          status?: string | null
          tax_rate?: number | null
          total?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      diary_entries: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      floor_renders: {
        Row: {
          created_at: string
          floor_id: number
          id: string
          image_url: string
          label: string | null
          render_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          floor_id: number
          id?: string
          image_url: string
          label?: string | null
          render_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          floor_id?: number
          id?: string
          image_url?: string
          label?: string | null
          render_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "floor_renders_render_id_fkey"
            columns: ["render_id"]
            isOneToOne: false
            referencedRelation: "renders"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          client_name: string
          created_at: string
          feedback: string | null
          id: string
          price: number | null
          project_name: string
          status: string | null
          texture_url: string | null
          user_id: string | null
        }
        Insert: {
          client_name: string
          created_at?: string
          feedback?: string | null
          id?: string
          price?: number | null
          project_name: string
          status?: string | null
          texture_url?: string | null
          user_id?: string | null
        }
        Update: {
          client_name?: string
          created_at?: string
          feedback?: string | null
          id?: string
          price?: number | null
          project_name?: string
          status?: string | null
          texture_url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      render_feedback: {
        Row: {
          client_name: string | null
          created_at: string
          feedback_text: string
          feedback_type: string
          id: string
          render_id: string
        }
        Insert: {
          client_name?: string | null
          created_at?: string
          feedback_text: string
          feedback_type?: string
          id?: string
          render_id: string
        }
        Update: {
          client_name?: string | null
          created_at?: string
          feedback_text?: string
          feedback_type?: string
          id?: string
          render_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "render_feedback_render_id_fkey"
            columns: ["render_id"]
            isOneToOne: false
            referencedRelation: "renders"
            referencedColumns: ["id"]
          },
        ]
      }
      renders: {
        Row: {
          created_at: string
          has_new_feedback: boolean
          id: string
          image_url: string
          prompt: string | null
          share_token: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          has_new_feedback?: boolean
          id?: string
          image_url: string
          prompt?: string | null
          share_token?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          has_new_feedback?: boolean
          id?: string
          image_url?: string
          prompt?: string | null
          share_token?: string | null
          user_id?: string
        }
        Relationships: []
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
