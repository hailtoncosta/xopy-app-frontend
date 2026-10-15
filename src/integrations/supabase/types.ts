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
      admin_settings: {
        Row: {
          created_at: string | null
          id: string
          settings: Json
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          settings: Json
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          settings?: Json
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      clip_comments: {
        Row: {
          clip_id: string
          comment: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          clip_id: string
          comment: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          clip_id?: string
          comment?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clip_comments_clip_id_fkey"
            columns: ["clip_id"]
            isOneToOne: false
            referencedRelation: "dynamic_clips"
            referencedColumns: ["id"]
          },
        ]
      }
      clip_likes: {
        Row: {
          clip_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          clip_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          clip_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clip_likes_clip_id_fkey"
            columns: ["clip_id"]
            isOneToOne: false
            referencedRelation: "dynamic_clips"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          service_provider_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          service_provider_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          service_provider_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_service_provider_id_fkey"
            columns: ["service_provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_service_provider_id_fkey"
            columns: ["service_provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      dynamic_banners: {
        Row: {
          alt_text: string | null
          button_text: string | null
          created_at: string | null
          description: string | null
          id: number
          image_url: string
          is_active: boolean | null
          link_url: string | null
          order_index: number | null
          target_blank: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          alt_text?: string | null
          button_text?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          image_url: string
          is_active?: boolean | null
          link_url?: string | null
          order_index?: number | null
          target_blank?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          alt_text?: string | null
          button_text?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          image_url?: string
          is_active?: boolean | null
          link_url?: string | null
          order_index?: number | null
          target_blank?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      dynamic_categories: {
        Row: {
          created_at: string | null
          icon_name: string
          id: string
          is_active: boolean | null
          label: string
          order_index: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          icon_name: string
          id: string
          is_active?: boolean | null
          label: string
          order_index?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          icon_name?: string
          id?: string
          is_active?: boolean | null
          label?: string
          order_index?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      dynamic_category_chips: {
        Row: {
          chip_id: string
          created_at: string
          icon_name: string
          id: number
          is_active: boolean | null
          label: string
          order_index: number | null
          updated_at: string
        }
        Insert: {
          chip_id: string
          created_at?: string
          icon_name: string
          id?: number
          is_active?: boolean | null
          label: string
          order_index?: number | null
          updated_at?: string
        }
        Update: {
          chip_id?: string
          created_at?: string
          icon_name?: string
          id?: number
          is_active?: boolean | null
          label?: string
          order_index?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      dynamic_clips: {
        Row: {
          author_avatar: string | null
          author_name: string | null
          category: string | null
          comments: number | null
          created_at: string | null
          description: string | null
          duration: string | null
          id: string
          is_active: boolean | null
          likes: number | null
          linked_product_id: string | null
          linked_product_section: string | null
          linked_product_type: string | null
          order_index: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_url: string
        }
        Insert: {
          author_avatar?: string | null
          author_name?: string | null
          category?: string | null
          comments?: number | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          is_active?: boolean | null
          likes?: number | null
          linked_product_id?: string | null
          linked_product_section?: string | null
          linked_product_type?: string | null
          order_index?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_url: string
        }
        Update: {
          author_avatar?: string | null
          author_name?: string | null
          category?: string | null
          comments?: number | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          is_active?: boolean | null
          likes?: number | null
          linked_product_id?: string | null
          linked_product_section?: string | null
          linked_product_type?: string | null
          order_index?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string
        }
        Relationships: []
      }
      dynamic_news_banners: {
        Row: {
          alt_text: string | null
          created_at: string | null
          description: string | null
          id: number
          image_url: string | null
          is_active: boolean | null
          order_index: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          order_index?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          order_index?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      dynamic_popular_categories: {
        Row: {
          banner_image_url: string | null
          banner_subtitle: string | null
          banner_title: string | null
          created_at: string | null
          filter_chips: Json | null
          id: string
          image_url: string
          is_active: boolean | null
          name: string
          order_index: number | null
          store: string
          updated_at: string | null
        }
        Insert: {
          banner_image_url?: string | null
          banner_subtitle?: string | null
          banner_title?: string | null
          created_at?: string | null
          filter_chips?: Json | null
          id: string
          image_url: string
          is_active?: boolean | null
          name: string
          order_index?: number | null
          store: string
          updated_at?: string | null
        }
        Update: {
          banner_image_url?: string | null
          banner_subtitle?: string | null
          banner_title?: string | null
          created_at?: string | null
          filter_chips?: Json | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          name?: string
          order_index?: number | null
          store?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      dynamic_product_detail_banners: {
        Row: {
          alt_text: string | null
          created_at: string | null
          description: string | null
          id: number
          image_url: string | null
          is_active: boolean | null
          order_index: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          order_index?: number | null
          title?: string
          updated_at?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          order_index?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      dynamic_products: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: number
          image_url: string
          is_active: boolean | null
          is_essential: boolean | null
          is_featured: boolean | null
          is_offer: boolean | null
          is_top_choice: boolean | null
          name: string
          order_index: number | null
          price: string
          product_group: string | null
          rating: number | null
          source_product_id: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: number
          image_url: string
          is_active?: boolean | null
          is_essential?: boolean | null
          is_featured?: boolean | null
          is_offer?: boolean | null
          is_top_choice?: boolean | null
          name: string
          order_index?: number | null
          price: string
          product_group?: string | null
          rating?: number | null
          source_product_id?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: number
          image_url?: string
          is_active?: boolean | null
          is_essential?: boolean | null
          is_featured?: boolean | null
          is_offer?: boolean | null
          is_top_choice?: boolean | null
          name?: string
          order_index?: number | null
          price?: string
          product_group?: string | null
          rating?: number | null
          source_product_id?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dynamic_products_source_product_id_fkey"
            columns: ["source_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dynamic_products_source_product_id_fkey"
            columns: ["source_product_id"]
            isOneToOne: false
            referencedRelation: "products_public_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      dynamic_promotional_banners: {
        Row: {
          alt_text: string | null
          created_at: string | null
          description: string | null
          id: number
          image_url: string | null
          is_active: boolean | null
          order_index: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          order_index?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          order_index?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      dynamic_rentals: {
        Row: {
          available: boolean | null
          category: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string
          is_active: boolean | null
          location: string | null
          name: string
          order_index: number | null
          period: string | null
          popular: boolean | null
          price: string
          rating: number | null
          updated_at: string | null
        }
        Insert: {
          available?: boolean | null
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          location?: string | null
          name: string
          order_index?: number | null
          period?: string | null
          popular?: boolean | null
          price: string
          rating?: number | null
          updated_at?: string | null
        }
        Update: {
          available?: boolean | null
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          location?: string | null
          name?: string
          order_index?: number | null
          period?: string | null
          popular?: boolean | null
          price?: string
          rating?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      dynamic_store_data: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          id: number
          is_active: boolean | null
          store_description: string | null
          store_logo: string | null
          store_name: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          store_description?: string | null
          store_logo?: string | null
          store_name: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          store_description?: string | null
          store_logo?: string | null
          store_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      mercado_pago_tokens: {
        Row: {
          access_token: string
          created_at: string | null
          expires_at: string | null
          expires_in: number | null
          id: string
          lojista_id: string
          public_key: string | null
          refresh_token: string | null
          updated_at: string | null
          user_id_mp: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_at?: string | null
          expires_in?: number | null
          id?: string
          lojista_id: string
          public_key?: string | null
          refresh_token?: string | null
          updated_at?: string | null
          user_id_mp: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_at?: string | null
          expires_in?: number | null
          id?: string
          lojista_id?: string
          public_key?: string | null
          refresh_token?: string | null
          updated_at?: string | null
          user_id_mp?: string
        }
        Relationships: []
      }
      mercado_pago_transactions: {
        Row: {
          approved_at: string | null
          card_brand: string | null
          card_last_four_digits: string | null
          created_at: string | null
          id: string
          installments: number | null
          mp_payment_id: string
          mp_response: Json | null
          mp_status: string
          mp_status_detail: string | null
          net_amount: number | null
          order_id: string
          payment_method_id: string | null
          payment_type_id: string | null
          qr_code: string | null
          qr_code_base64: string | null
          refunded_at: string | null
          transaction_amount: number
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          card_brand?: string | null
          card_last_four_digits?: string | null
          created_at?: string | null
          id?: string
          installments?: number | null
          mp_payment_id: string
          mp_response?: Json | null
          mp_status: string
          mp_status_detail?: string | null
          net_amount?: number | null
          order_id: string
          payment_method_id?: string | null
          payment_type_id?: string | null
          qr_code?: string | null
          qr_code_base64?: string | null
          refunded_at?: string | null
          transaction_amount: number
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          card_brand?: string | null
          card_last_four_digits?: string | null
          created_at?: string | null
          id?: string
          installments?: number | null
          mp_payment_id?: string
          mp_response?: Json | null
          mp_status?: string
          mp_status_detail?: string | null
          net_amount?: number | null
          order_id?: string
          payment_method_id?: string | null
          payment_type_id?: string | null
          qr_code?: string | null
          qr_code_base64?: string | null
          refunded_at?: string | null
          transaction_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mercado_pago_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message_type: string | null
          sender_id: string | null
          sender_type: string
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          sender_id?: string | null
          sender_type: string
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          sender_id?: string | null
          sender_type?: string
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
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          buyer_id: string
          cancelled_at: string | null
          created_at: string | null
          delivery_address: Json | null
          delivery_type: string | null
          id: string
          marketplace_fee: number
          metadata: Json | null
          order_type: string | null
          paid_at: string | null
          payment_method: string | null
          product_id: string | null
          rental_id: string | null
          rental_info: Json | null
          seller_amount: number
          seller_id: string
          shipping_cost: number | null
          status: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          buyer_id: string
          cancelled_at?: string | null
          created_at?: string | null
          delivery_address?: Json | null
          delivery_type?: string | null
          id?: string
          marketplace_fee?: number
          metadata?: Json | null
          order_type?: string | null
          paid_at?: string | null
          payment_method?: string | null
          product_id?: string | null
          rental_id?: string | null
          rental_info?: Json | null
          seller_amount: number
          seller_id: string
          shipping_cost?: number | null
          status?: string | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string
          cancelled_at?: string | null
          created_at?: string | null
          delivery_address?: Json | null
          delivery_type?: string | null
          id?: string
          marketplace_fee?: number
          metadata?: Json | null
          order_type?: string | null
          paid_at?: string | null
          payment_method?: string | null
          product_id?: string | null
          rental_id?: string | null
          rental_info?: Json | null
          seller_amount?: number
          seller_id?: string
          shipping_cost?: number | null
          status?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_rental_id_fkey"
            columns: ["rental_id"]
            isOneToOne: false
            referencedRelation: "dynamic_rentals"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          commission_rate: number
          created_at: string | null
          id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          commission_rate?: number
          created_at?: string | null
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          commission_rate?: number
          created_at?: string | null
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      product_images: {
        Row: {
          created_at: string | null
          id: string
          image_path: string
          image_url: string
          is_primary: boolean | null
          product_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_path: string
          image_url: string
          is_primary?: boolean | null
          product_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_path?: string
          image_url?: string
          is_primary?: boolean | null
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          admin_comments: string | null
          approval_date: string | null
          approval_status: string | null
          category: string
          condition: string | null
          created_at: string | null
          description: string
          expires_at: string | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          location: string | null
          manufacturing_date: string | null
          price: number
          product_type: string
          quantity: number
          seller_info: Json
          seller_type: string
          status: string | null
          title: string
          unit: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_comments?: string | null
          approval_date?: string | null
          approval_status?: string | null
          category: string
          condition?: string | null
          created_at?: string | null
          description: string
          expires_at?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          location?: string | null
          manufacturing_date?: string | null
          price: number
          product_type: string
          quantity?: number
          seller_info: Json
          seller_type: string
          status?: string | null
          title: string
          unit?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_comments?: string | null
          approval_date?: string | null
          approval_status?: string | null
          category?: string
          condition?: string | null
          created_at?: string | null
          description?: string
          expires_at?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          location?: string | null
          manufacturing_date?: string | null
          price?: number
          product_type?: string
          quantity?: number
          seller_info?: Json
          seller_type?: string
          status?: string | null
          title?: string
          unit?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          platform: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          platform?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          platform?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      rental_inquiries: {
        Row: {
          admin_notes: string | null
          city: string
          created_at: string
          daily_rate: number | null
          deposit_amount: number | null
          description: string
          equipment_type: string
          id: string
          name: string
          payment_method: string | null
          payment_status: string | null
          phone: string
          pix_code: string | null
          pix_qr_code: string | null
          rental_days: number | null
          rental_item_id: string | null
          rental_item_name: string | null
          status: string
          total_amount: number | null
          updated_at: string
          user_id: string | null
          whatsapp_contact: string | null
        }
        Insert: {
          admin_notes?: string | null
          city: string
          created_at?: string
          daily_rate?: number | null
          deposit_amount?: number | null
          description: string
          equipment_type: string
          id?: string
          name: string
          payment_method?: string | null
          payment_status?: string | null
          phone: string
          pix_code?: string | null
          pix_qr_code?: string | null
          rental_days?: number | null
          rental_item_id?: string | null
          rental_item_name?: string | null
          status?: string
          total_amount?: number | null
          updated_at?: string
          user_id?: string | null
          whatsapp_contact?: string | null
        }
        Update: {
          admin_notes?: string | null
          city?: string
          created_at?: string
          daily_rate?: number | null
          deposit_amount?: number | null
          description?: string
          equipment_type?: string
          id?: string
          name?: string
          payment_method?: string | null
          payment_status?: string | null
          phone?: string
          pix_code?: string | null
          pix_qr_code?: string | null
          rental_days?: number | null
          rental_item_id?: string | null
          rental_item_name?: string | null
          status?: string
          total_amount?: number | null
          updated_at?: string
          user_id?: string | null
          whatsapp_contact?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rental_inquiries_rental_item_id_fkey"
            columns: ["rental_item_id"]
            isOneToOne: false
            referencedRelation: "dynamic_rentals"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_stores: {
        Row: {
          address: string | null
          business_name: string
          city: string | null
          created_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          phone: string | null
          state: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          business_name: string
          city?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          business_name?: string
          city?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      service_providers: {
        Row: {
          address: string | null
          category: string
          city: string | null
          created_at: string | null
          daily_rate: number
          description: string | null
          documents: Json | null
          email: string
          experience: string
          id: string
          name: string
          neighborhood: string | null
          phone: string
          specialties: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          category: string
          city?: string | null
          created_at?: string | null
          daily_rate: number
          description?: string | null
          documents?: Json | null
          email: string
          experience: string
          id?: string
          name: string
          neighborhood?: string | null
          phone: string
          specialties?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          category?: string
          city?: string | null
          created_at?: string | null
          daily_rate?: number
          description?: string | null
          documents?: Json | null
          email?: string
          experience?: string
          id?: string
          name?: string
          neighborhood?: string | null
          phone?: string
          specialties?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_service_providers_user_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_addresses: {
        Row: {
          city: string
          complement: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          label: string
          neighborhood: string
          number: string
          state: string
          street: string
          type: string
          updated_at: string | null
          user_id: string
          zip_code: string
        }
        Insert: {
          city: string
          complement?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          label: string
          neighborhood: string
          number: string
          state: string
          street: string
          type?: string
          updated_at?: string | null
          user_id: string
          zip_code: string
        }
        Update: {
          city?: string
          complement?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          label?: string
          neighborhood?: string
          number?: string
          state?: string
          street?: string
          type?: string
          updated_at?: string | null
          user_id?: string
          zip_code?: string
        }
        Relationships: []
      }
      user_payment_methods: {
        Row: {
          card_brand: string | null
          card_expiry_month: string | null
          card_expiry_year: string | null
          card_holder_name: string | null
          card_last_four: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          mp_card_token: string | null
          mp_customer_id: string | null
          payment_type: string
          pix_key: string | null
          pix_key_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          card_brand?: string | null
          card_expiry_month?: string | null
          card_expiry_year?: string | null
          card_holder_name?: string | null
          card_last_four?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          mp_card_token?: string | null
          mp_customer_id?: string | null
          payment_type: string
          pix_key?: string | null
          pix_key_type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          card_brand?: string | null
          card_expiry_month?: string | null
          card_expiry_year?: string | null
          card_holder_name?: string | null
          card_last_four?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          mp_card_token?: string | null
          mp_customer_id?: string | null
          payment_type?: string
          pix_key?: string | null
          pix_key_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_verified: boolean | null
          phone: string | null
          updated_at: string | null
          user_type: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          is_verified?: boolean | null
          phone?: string | null
          updated_at?: string | null
          user_type?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          phone?: string | null
          updated_at?: string | null
          user_type?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      products_public_safe: {
        Row: {
          approval_date: string | null
          approval_status: string | null
          category: string | null
          condition: string | null
          created_at: string | null
          description: string | null
          expires_at: string | null
          id: string | null
          images: string[] | null
          is_featured: boolean | null
          location: string | null
          manufacturing_date: string | null
          price: number | null
          product_type: string | null
          quantity: number | null
          seller_info: Json | null
          seller_type: string | null
          status: string | null
          title: string | null
          unit: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          approval_date?: string | null
          approval_status?: string | null
          category?: string | null
          condition?: string | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string | null
          images?: string[] | null
          is_featured?: boolean | null
          location?: string | null
          manufacturing_date?: string | null
          price?: number | null
          product_type?: string | null
          quantity?: number | null
          seller_info?: never
          seller_type?: string | null
          status?: string | null
          title?: string | null
          unit?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          approval_date?: string | null
          approval_status?: string | null
          category?: string | null
          condition?: string | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string | null
          images?: string[] | null
          is_featured?: boolean | null
          location?: string | null
          manufacturing_date?: string | null
          price?: number | null
          product_type?: string | null
          quantity?: number | null
          seller_info?: never
          seller_type?: string | null
          status?: string | null
          title?: string | null
          unit?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      service_providers_public: {
        Row: {
          category: string | null
          city: string | null
          created_at: string | null
          daily_rate: number | null
          description: string | null
          experience: string | null
          id: string | null
          name: string | null
          neighborhood: string | null
          specialties: string | null
          status: string | null
        }
        Insert: {
          category?: string | null
          city?: string | null
          created_at?: string | null
          daily_rate?: number | null
          description?: string | null
          experience?: string | null
          id?: string | null
          name?: string | null
          neighborhood?: string | null
          specialties?: string | null
          status?: string | null
        }
        Update: {
          category?: string | null
          city?: string | null
          created_at?: string | null
          daily_rate?: number | null
          description?: string | null
          experience?: string | null
          id?: string | null
          name?: string | null
          neighborhood?: string | null
          specialties?: string | null
          status?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_access_provider_contact: {
        Args: { provider_id: string }
        Returns: boolean
      }
      can_access_seller_contact: {
        Args: { product_id: string }
        Returns: boolean
      }
      check_user_access_to_conversation: {
        Args: { target_conversation_id: string }
        Returns: boolean
      }
      deactivate_expired_products: { Args: never; Returns: number }
      get_expired_products: {
        Args: never
        Returns: {
          expires_at: string
          id: string
          title: string
          user_id: string
        }[]
      }
      get_public_service_providers: {
        Args: { provider_category?: string }
        Returns: {
          category: string
          city: string
          created_at: string
          daily_rate: number
          description: string
          experience: string
          id: string
          name: string
          neighborhood: string
          specialties: string
          status: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_approved_store_owner: { Args: never; Returns: boolean }
      is_product_owner: { Args: { product_id: string }; Returns: boolean }
      set_product_expiration_30_days: {
        Args: { product_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "service_provider"
      product_status: "pending" | "approved" | "rejected"
      seller_type: "pessoa_fisica" | "pessoa_juridica"
      user_type: "customer" | "service_provider" | "store_owner" | "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "moderator", "user", "service_provider"],
      product_status: ["pending", "approved", "rejected"],
      seller_type: ["pessoa_fisica", "pessoa_juridica"],
      user_type: ["customer", "service_provider", "store_owner", "admin"],
    },
  },
} as const
