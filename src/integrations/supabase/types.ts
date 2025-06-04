export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          password_hash: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          password_hash: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          password_hash?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          architectural_diagram: string | null
          completion_time: string | null
          created_at: string
          email: string | null
          employee_id: string | null
          excel_id: string | null
          group_name: string | null
          hackathon_participation: string | null
          id: string
          idea1_title: string | null
          idea2_title: string | null
          idea3_title: string | null
          is_admin: boolean | null
          last_modified_time: string | null
          name: string | null
          name2: string | null
          problem1: string | null
          problem2: string | null
          problem3: string | null
          roi1: string | null
          roi2: string | null
          roi3: string | null
          selected_idea: string | null
          solution1: string | null
          solution2: string | null
          solution3: string | null
          start_time: string | null
        }
        Insert: {
          architectural_diagram?: string | null
          completion_time?: string | null
          created_at?: string
          email?: string | null
          employee_id?: string | null
          excel_id?: string | null
          group_name?: string | null
          hackathon_participation?: string | null
          id?: string
          idea1_title?: string | null
          idea2_title?: string | null
          idea3_title?: string | null
          is_admin?: boolean | null
          last_modified_time?: string | null
          name?: string | null
          name2?: string | null
          problem1?: string | null
          problem2?: string | null
          problem3?: string | null
          roi1?: string | null
          roi2?: string | null
          roi3?: string | null
          selected_idea?: string | null
          solution1?: string | null
          solution2?: string | null
          solution3?: string | null
          start_time?: string | null
        }
        Update: {
          architectural_diagram?: string | null
          completion_time?: string | null
          created_at?: string
          email?: string | null
          employee_id?: string | null
          excel_id?: string | null
          group_name?: string | null
          hackathon_participation?: string | null
          id?: string
          idea1_title?: string | null
          idea2_title?: string | null
          idea3_title?: string | null
          is_admin?: boolean | null
          last_modified_time?: string | null
          name?: string | null
          name2?: string | null
          problem1?: string | null
          problem2?: string | null
          problem3?: string | null
          roi1?: string | null
          roi2?: string | null
          roi3?: string | null
          selected_idea?: string | null
          solution1?: string | null
          solution2?: string | null
          solution3?: string | null
          start_time?: string | null
        }
        Relationships: []
      }
      votes: {
        Row: {
          created_at: string
          id: string
          voted_for_employee_id: string
          voter_employee_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          voted_for_employee_id: string
          voter_employee_id: string
        }
        Update: {
          created_at?: string
          id?: string
          voted_for_employee_id?: string
          voter_employee_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_voted_for_employee_id_fkey"
            columns: ["voted_for_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "votes_voter_employee_id_fkey"
            columns: ["voter_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      voting_sessions: {
        Row: {
          created_at: string
          current_employee_id: string | null
          id: string
          is_active: boolean
          session_end: string
          session_start: string
        }
        Insert: {
          created_at?: string
          current_employee_id?: string | null
          id?: string
          is_active?: boolean
          session_end?: string
          session_start?: string
        }
        Update: {
          created_at?: string
          current_employee_id?: string | null
          id?: string
          is_active?: boolean
          session_end?: string
          session_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "voting_sessions_current_employee_id_fkey"
            columns: ["current_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["employee_id"]
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
