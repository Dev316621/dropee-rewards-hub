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
      badges: {
        Row: {
          condition_type: string
          condition_value: number | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          condition_type: string
          condition_value?: number | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          condition_type?: string
          condition_value?: number | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          category: string | null
          content: string | null
          created_at: string
          excerpt: string | null
          id: string
          image_url: string | null
          is_pinned: boolean | null
          published_at: string | null
          scheduled_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_pinned?: boolean | null
          published_at?: string | null
          scheduled_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_pinned?: boolean | null
          published_at?: string | null
          scheduled_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      coupon_redemptions: {
        Row: {
          coupon_id: string
          id: string
          redeemed_at: string
          user_id: string
        }
        Insert: {
          coupon_id: string
          id?: string
          redeemed_at?: string
          user_id: string
        }
        Update: {
          coupon_id?: string
          id?: string
          redeemed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          assigned_user_id: string | null
          code: string
          created_at: string
          current_uses: number | null
          discount_type: string
          discount_value: number
          expiry_date: string | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          max_uses: number | null
        }
        Insert: {
          assigned_user_id?: string | null
          code: string
          created_at?: string
          current_uses?: number | null
          discount_type?: string
          discount_value?: number
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          max_uses?: number | null
        }
        Update: {
          assigned_user_id?: string | null
          code?: string
          created_at?: string
          current_uses?: number | null
          discount_type?: string
          discount_value?: number
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          max_uses?: number | null
        }
        Relationships: []
      }
      deliveries: {
        Row: {
          created_at: string
          description: string | null
          dropoff: string
          fee: number | null
          id: string
          is_free: boolean | null
          notes: string | null
          pickup: string
          points_earned: number | null
          receipt: string | null
          recipient_name: string | null
          status: string
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          dropoff: string
          fee?: number | null
          id?: string
          is_free?: boolean | null
          notes?: string | null
          pickup: string
          points_earned?: number | null
          receipt?: string | null
          recipient_name?: string | null
          status?: string
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          dropoff?: string
          fee?: number | null
          id?: string
          is_free?: boolean | null
          notes?: string | null
          pickup?: string
          points_earned?: number | null
          receipt?: string | null
          recipient_name?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          question: string
          updated_at: string
        }
        Insert: {
          answer?: string
          category?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      footer_links: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          label: string
          url: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          label: string
          url?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          label?: string
          url?: string
        }
        Relationships: []
      }
      free_delivery_credits: {
        Row: {
          created_at: string
          id: string
          total_credits: number
          used_credits: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          total_credits?: number
          used_credits?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          total_credits?: number
          used_credits?: number
          user_id?: string
        }
        Relationships: []
      }
      location_requests: {
        Row: {
          completed_at: string | null
          created_at: string
          delivery_id: string | null
          id: string
          latitude: number | null
          longitude: number | null
          status: string
          token: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          delivery_id?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          status?: string
          token: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          delivery_id?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          status?: string
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_requests_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_points_log: {
        Row: {
          amount: number
          created_at: string
          delivery_id: string | null
          id: string
          note: string | null
          source: string
          spin_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          delivery_id?: string | null
          id?: string
          note?: string | null
          source: string
          spin_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          delivery_id?: string | null
          id?: string
          note?: string | null
          source?: string
          spin_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_points_log_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      offers: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_weekly_highlight: boolean | null
          title: string
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_weekly_highlight?: boolean | null
          title: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_weekly_highlight?: boolean | null
          title?: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: []
      }
      partners: {
        Row: {
          created_at: string
          description: string | null
          discount_code: string | null
          display_order: number | null
          id: string
          is_featured: boolean | null
          link: string | null
          logo_url: string | null
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_code?: string | null
          display_order?: number | null
          id?: string
          is_featured?: boolean | null
          link?: string | null
          logo_url?: string | null
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_code?: string | null
          display_order?: number | null
          id?: string
          is_featured?: boolean | null
          link?: string | null
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      policy_sections: {
        Row: {
          content: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string
          date_of_birth: string | null
          full_name: string
          id: string
          phone: string | null
          profile_completed: boolean | null
          referral_code: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          profile_completed?: boolean | null
          referral_code?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          profile_completed?: boolean | null
          referral_code?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          bonus_awarded: boolean | null
          created_at: string
          id: string
          referred_id: string
          referrer_id: string
        }
        Insert: {
          bonus_awarded?: boolean | null
          created_at?: string
          id?: string
          referred_id: string
          referrer_id: string
        }
        Update: {
          bonus_awarded?: boolean | null
          created_at?: string
          id?: string
          referred_id?: string
          referrer_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      spin_config: {
        Row: {
          enabled: boolean | null
          id: string
          max_spins: number | null
          reset_day_of_week: number | null
          reset_rule: string | null
          spin_type: string
          updated_at: string
        }
        Insert: {
          enabled?: boolean | null
          id?: string
          max_spins?: number | null
          reset_day_of_week?: number | null
          reset_rule?: string | null
          spin_type: string
          updated_at?: string
        }
        Update: {
          enabled?: boolean | null
          id?: string
          max_spins?: number | null
          reset_day_of_week?: number | null
          reset_rule?: string | null
          spin_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      spin_results: {
        Row: {
          created_at: string
          id: string
          prize_type: string
          prize_value: string | null
          slot_id: string | null
          spin_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          prize_type: string
          prize_value?: string | null
          slot_id?: string | null
          spin_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          prize_type?: string
          prize_value?: string | null
          slot_id?: string | null
          spin_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spin_results_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "spin_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      spin_slots: {
        Row: {
          color: string | null
          coupon_expiry_days: number | null
          created_at: string
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          label: string
          prize_type: string
          prize_value: string | null
          probability_weight: number
          spin_type: string
        }
        Insert: {
          color?: string | null
          coupon_expiry_days?: number | null
          created_at?: string
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          prize_type?: string
          prize_value?: string | null
          probability_weight?: number
          spin_type?: string
        }
        Update: {
          color?: string | null
          coupon_expiry_days?: number | null
          created_at?: string
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          prize_type?: string
          prize_value?: string | null
          probability_weight?: number
          spin_type?: string
        }
        Relationships: []
      }
      tiers: {
        Row: {
          badge_icon: string | null
          created_at: string
          display_order: number
          id: string
          max_deliveries: number | null
          min_deliveries: number
          name: string
          perks: Json | null
        }
        Insert: {
          badge_icon?: string | null
          created_at?: string
          display_order?: number
          id?: string
          max_deliveries?: number | null
          min_deliveries?: number
          name: string
          perks?: Json | null
        }
        Update: {
          badge_icon?: string | null
          created_at?: string
          display_order?: number
          id?: string
          max_deliveries?: number | null
          min_deliveries?: number
          name?: string
          perks?: Json | null
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      generate_referral_code: { Args: never; Returns: string }
      get_user_delivery_count: { Args: { _user_id: string }; Returns: number }
      get_user_points_balance: { Args: { _user_id: string }; Returns: number }
      get_user_tier: {
        Args: { _user_id: string }
        Returns: {
          tier_badge: string
          tier_name: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
