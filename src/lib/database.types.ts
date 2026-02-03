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
      Account: {
        Row: {
          access_token: string | null
          expires_at: number | null
          id: string
          id_token: string | null
          provider: string
          providerAccountId: string
          refresh_token: string | null
          scope: string | null
          session_state: string | null
          token_type: string | null
          type: string
          userId: string
        }
        Insert: {
          access_token?: string | null
          expires_at?: number | null
          id: string
          id_token?: string | null
          provider: string
          providerAccountId: string
          refresh_token?: string | null
          scope?: string | null
          session_state?: string | null
          token_type?: string | null
          type: string
          userId: string
        }
        Update: {
          access_token?: string | null
          expires_at?: number | null
          id?: string
          id_token?: string | null
          provider?: string
          providerAccountId?: string
          refresh_token?: string | null
          scope?: string | null
          session_state?: string | null
          token_type?: string | null
          type?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Account_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Goal: {
        Row: {
          createdAt: string
          current: number
          deadline: string | null
          description: string | null
          id: string
          projectId: string
          target: number
          title: string
          unit: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          current?: number
          deadline?: string | null
          description?: string | null
          id: string
          projectId: string
          target: number
          title: string
          unit: string
          updatedAt: string
        }
        Update: {
          createdAt?: string
          current?: number
          deadline?: string | null
          description?: string | null
          id?: string
          projectId?: string
          target?: number
          title?: string
          unit?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Goal_projectId_fkey"
            columns: ["projectId"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["id"]
          },
        ]
      }
      Metric: {
        Row: {
          id: string
          metadata: Json | null
          projectId: string
          recordedAt: string
          type: Database["public"]["Enums"]["MetricType"]
          value: number
        }
        Insert: {
          id: string
          metadata?: Json | null
          projectId: string
          recordedAt?: string
          type: Database["public"]["Enums"]["MetricType"]
          value: number
        }
        Update: {
          id?: string
          metadata?: Json | null
          projectId?: string
          recordedAt?: string
          type?: Database["public"]["Enums"]["MetricType"]
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "Metric_projectId_fkey"
            columns: ["projectId"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["id"]
          },
        ]
      }
      Project: {
        Row: {
          createdAt: string
          description: string | null
          domain: string | null
          githubAccessToken: string | null
          githubRepo: string | null
          id: string
          isPublic: boolean
          name: string
          plausibleApiKey: string | null
          plausibleSiteId: string | null
          slug: string
          stripeAccountId: string | null
          stripeWebhookSecret: string | null
          twitterAccessToken: string | null
          twitterHandle: string | null
          updatedAt: string
          userId: string
        }
        Insert: {
          createdAt?: string
          description?: string | null
          domain?: string | null
          githubAccessToken?: string | null
          githubRepo?: string | null
          id: string
          isPublic?: boolean
          name: string
          plausibleApiKey?: string | null
          plausibleSiteId?: string | null
          slug: string
          stripeAccountId?: string | null
          stripeWebhookSecret?: string | null
          twitterAccessToken?: string | null
          twitterHandle?: string | null
          updatedAt: string
          userId: string
        }
        Update: {
          createdAt?: string
          description?: string | null
          domain?: string | null
          githubAccessToken?: string | null
          githubRepo?: string | null
          id?: string
          isPublic?: boolean
          name?: string
          plausibleApiKey?: string | null
          plausibleSiteId?: string | null
          slug?: string
          stripeAccountId?: string | null
          stripeWebhookSecret?: string | null
          twitterAccessToken?: string | null
          twitterHandle?: string | null
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Project_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Session: {
        Row: {
          expires: string
          id: string
          sessionToken: string
          userId: string
        }
        Insert: {
          expires: string
          id: string
          sessionToken: string
          userId: string
        }
        Update: {
          expires?: string
          id?: string
          sessionToken?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Session_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      User: {
        Row: {
          createdAt: string
          email: string
          id: string
          image: string | null
          name: string | null
          updatedAt: string
          username: string | null
        }
        Insert: {
          createdAt?: string
          email: string
          id: string
          image?: string | null
          name?: string | null
          updatedAt: string
          username?: string | null
        }
        Update: {
          createdAt?: string
          email?: string
          id?: string
          image?: string | null
          name?: string | null
          updatedAt?: string
          username?: string | null
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
      MetricType:
        | "MRR"
        | "TOTAL_USERS"
        | "ACTIVE_USERS"
        | "GITHUB_COMMITS"
        | "GITHUB_PRS"
        | "TWITTER_FOLLOWERS"
        | "TWITTER_IMPRESSIONS"
        | "PAGE_VIEWS"
        | "UPTIME_PERCENTAGE"
        | "NEW_SUBSCRIBERS"
        | "CHURN_RATE"
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
      MetricType: [
        "MRR",
        "TOTAL_USERS",
        "ACTIVE_USERS",
        "GITHUB_COMMITS",
        "GITHUB_PRS",
        "TWITTER_FOLLOWERS",
        "TWITTER_IMPRESSIONS",
        "PAGE_VIEWS",
        "UPTIME_PERCENTAGE",
        "NEW_SUBSCRIBERS",
        "CHURN_RATE",
      ],
    },
  },
} as const
