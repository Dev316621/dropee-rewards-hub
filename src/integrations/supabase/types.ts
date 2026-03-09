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
      api_integrations: {
        Row: {
          api_key_encrypted: string | null
          base_url: string
          created_at: string
          headers_json: Json | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          api_key_encrypted?: string | null
          base_url?: string
          created_at?: string
          headers_json?: Json | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          api_key_encrypted?: string | null
          base_url?: string
          created_at?: string
          headers_json?: Json | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
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
          booking_enabled: boolean
          booking_label: string | null
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
          booking_enabled?: boolean
          booking_label?: string | null
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
          booking_enabled?: boolean
          booking_label?: string | null
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
      hub_delivery_agents: {
        Row: {
          created_at: string
          delivery_fee: number
          email: string | null
          id: string
          is_active: boolean
          name: string
          phone: string
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          delivery_fee?: number
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          phone?: string
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          delivery_fee?: number
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      hub_order_status_log: {
        Row: {
          changed_at: string
          changed_by: string
          id: string
          new_status: string
          old_status: string | null
          order_id: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string
          id?: string
          new_status: string
          old_status?: string | null
          order_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string
          id?: string
          new_status?: string
          old_status?: string | null
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hub_order_status_log_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "hub_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      hub_orders: {
        Row: {
          assigned_agent_id: string | null
          created_at: string
          customer_address: string
          customer_name: string
          customer_phone: string
          external_order_id: string
          id: string
          items: Json
          latitude: number | null
          longitude: number | null
          notes: string | null
          status: string
          total: number
          updated_at: string
          website_id: string
        }
        Insert: {
          assigned_agent_id?: string | null
          created_at?: string
          customer_address?: string
          customer_name?: string
          customer_phone?: string
          external_order_id?: string
          id?: string
          items?: Json
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          status?: string
          total?: number
          updated_at?: string
          website_id: string
        }
        Update: {
          assigned_agent_id?: string | null
          created_at?: string
          customer_address?: string
          customer_name?: string
          customer_phone?: string
          external_order_id?: string
          id?: string
          items?: Json
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          status?: string
          total?: number
          updated_at?: string
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hub_orders_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "hub_delivery_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_orders_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "hub_websites"
            referencedColumns: ["id"]
          },
        ]
      }
      hub_websites: {
        Row: {
          api_key: string
          created_at: string
          id: string
          is_active: boolean
          label_color: string
          name: string
        }
        Insert: {
          api_key?: string
          created_at?: string
          id?: string
          is_active?: boolean
          label_color?: string
          name: string
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: string
          is_active?: boolean
          label_color?: string
          name?: string
        }
        Relationships: []
      }
      live_orders: {
        Row: {
          assigned_to: string | null
          created_at: string
          dropoff: string
          estimated_fee: number | null
          id: string
          notes: string | null
          pickup: string
          service_type_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          dropoff: string
          estimated_fee?: number | null
          id?: string
          notes?: string | null
          pickup: string
          service_type_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          dropoff?: string
          estimated_fee?: number | null
          id?: string
          notes?: string | null
          pickup?: string
          service_type_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_orders_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
        ]
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
      pricing_addons: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          name: string
          price: number
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          price?: number
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          price?: number
        }
        Relationships: []
      }
      pricing_config: {
        Row: {
          id: string
          key: string
          label: string
          updated_at: string
          value: number
        }
        Insert: {
          id?: string
          key: string
          label?: string
          updated_at?: string
          value?: number
        }
        Update: {
          id?: string
          key?: string
          label?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      pricing_zones: {
        Row: {
          center_lat: number
          center_lng: number
          color: string | null
          created_at: string
          id: string
          is_active: boolean
          multiplier: number
          name: string
          radius_km: number
        }
        Insert: {
          center_lat?: number
          center_lng?: number
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          multiplier?: number
          name: string
          radius_km?: number
        }
        Update: {
          center_lat?: number
          center_lng?: number
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          multiplier?: number
          name?: string
          radius_km?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          digital_file_url: string | null
          discount_expires_at: string | null
          discount_percent: number | null
          display_order: number
          external_url: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          name: string
          original_price: number | null
          price: number
          product_type: string
          stock: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          digital_file_url?: string | null
          discount_expires_at?: string | null
          discount_percent?: number | null
          display_order?: number
          external_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          name: string
          original_price?: number | null
          price?: number
          product_type?: string
          stock?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          digital_file_url?: string | null
          discount_expires_at?: string | null
          discount_percent?: number | null
          display_order?: number
          external_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          name?: string
          original_price?: number | null
          price?: number
          product_type?: string
          stock?: number | null
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
          plus_code: string | null
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
          plus_code?: string | null
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
          plus_code?: string | null
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
      service_bookings: {
        Row: {
          addons: Json | null
          created_at: string
          dropoff: string
          estimated_fee: number | null
          id: string
          latitude: number | null
          longitude: number | null
          notes: string | null
          pickup: string
          service_type_id: string | null
          status: string
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          addons?: Json | null
          created_at?: string
          dropoff: string
          estimated_fee?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          pickup: string
          service_type_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          addons?: Json | null
          created_at?: string
          dropoff?: string
          estimated_fee?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          pickup?: string
          service_type_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_bookings_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
        ]
      }
      service_types: {
        Row: {
          base_price: number
          created_at: string
          description: string | null
          display_order: number
          icon: string | null
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          base_price?: number
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          base_price?: number
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      shop_orders: {
        Row: {
          created_at: string
          delivery_address: string | null
          id: string
          items: Json
          notes: string | null
          phone: string | null
          plus_code: string | null
          status: string
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_address?: string | null
          id?: string
          items?: Json
          notes?: string | null
          phone?: string | null
          plus_code?: string | null
          status?: string
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_address?: string | null
          id?: string
          items?: Json
          notes?: string | null
          phone?: string | null
          plus_code?: string | null
          status?: string
          total?: number
          updated_at?: string
          user_id?: string
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
      spin_preset_wins: {
        Row: {
          created_at: string
          id: string
          slot_id: string
          spin_type: string
          used: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          slot_id: string
          spin_type?: string
          used?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          slot_id?: string
          spin_type?: string
          used?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spin_preset_wins_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "spin_slots"
            referencedColumns: ["id"]
          },
        ]
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
      tracked_orders: {
        Row: {
          created_at: string
          external_order_id: string
          id: string
          integration_id: string
          last_checked_at: string | null
          last_response: Json | null
          status: string
          tracking_url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          external_order_id?: string
          id?: string
          integration_id: string
          last_checked_at?: string | null
          last_response?: Json | null
          status?: string
          tracking_url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          external_order_id?: string
          id?: string
          integration_id?: string
          last_checked_at?: string | null
          last_response?: Json | null
          status?: string
          tracking_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracked_orders_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "api_integrations"
            referencedColumns: ["id"]
          },
        ]
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
