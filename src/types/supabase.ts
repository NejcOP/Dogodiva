// Auto-generated Supabase database types
// Generated from the schema in supabase/migrations/001_init_schema.sql

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          email: string;
          phone: string | null;
          avatar_url: string | null;
          role: 'customer' | 'provider' | 'admin';
          city: string | null;
          country: string;
          bio: string | null;
          upcoming_event: {
            event_type: string;
            event_date: string;
            guest_count: number | null;
            budget: number | null;
          };
          email_notifications: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          email: string;
          phone?: string | null;
          avatar_url?: string | null;
          role?: 'customer' | 'provider' | 'admin';
          city?: string | null;
          country?: string;
          bio?: string | null;
          upcoming_event?: {
            event_type: string;
            event_date: string;
            guest_count: number | null;
            budget: number | null;
          };
          email_notifications?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          email?: string;
          phone?: string | null;
          avatar_url?: string | null;
          role?: 'customer' | 'provider' | 'admin';
          city?: string | null;
          country?: string;
          bio?: string | null;
          upcoming_event?: {
            event_type: string;
            event_date: string;
            guest_count: number | null;
            budget: number | null;
          };
          email_notifications?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          parent_id: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon?: string | null;
          parent_id?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          icon?: string | null;
          parent_id?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      provider_profiles: {
        Row: {
          id: string;
          user_id: string;
          business_name: string;
          slug: string;
          description: string | null;
          logo_url: string | null;
          cover_image_url: string | null;
          email: string | null;
          phone: string | null;
          website: string | null;
          city: string | null;
          address: string | null;
          postal_code: string | null;
          vat_number: string | null;
          verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
          subscription_plan: 'basic' | 'premium' | 'business';
          region: string | null;
          main_category_id: string | null;
          service_areas: string[];
          detailed_description: string | null;
          instagram: string | null;
          facebook: string | null;
          starting_price: number | null;
          subscription_status: 'active' | 'inactive' | 'cancelled';
          average_rating: number;
          total_reviews: number;
          is_featured: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_name: string;
          slug: string;
          description?: string | null;
          logo_url?: string | null;
          cover_image_url?: string | null;
          email?: string | null;
          phone?: string | null;
          website?: string | null;
          city?: string | null;
          address?: string | null;
          postal_code?: string | null;
          vat_number?: string | null;
          verification_status?: 'unverified' | 'pending' | 'verified' | 'rejected';
          subscription_plan?: 'basic' | 'premium' | 'business';
          region?: string | null;
          main_category_id?: string | null;
          service_areas?: string[];
          detailed_description?: string | null;
          instagram?: string | null;
          facebook?: string | null;
          starting_price?: number | null;
          subscription_status?: 'active' | 'inactive' | 'cancelled';
          average_rating?: number;
          total_reviews?: number;
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          business_name?: string;
          slug?: string;
          description?: string | null;
          logo_url?: string | null;
          cover_image_url?: string | null;
          email?: string | null;
          phone?: string | null;
          website?: string | null;
          city?: string | null;
          address?: string | null;
          postal_code?: string | null;
          vat_number?: string | null;
          verification_status?: 'unverified' | 'pending' | 'verified' | 'rejected';
          subscription_plan?: 'basic' | 'premium' | 'business';
          region?: string | null;
          main_category_id?: string | null;
          service_areas?: string[];
          detailed_description?: string | null;
          instagram?: string | null;
          facebook?: string | null;
          starting_price?: number | null;
          subscription_status?: 'active' | 'inactive' | 'cancelled';
          average_rating?: number;
          total_reviews?: number;
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      provider_services: {
        Row: {
          id: string;
          provider_id: string;
          category_id: string;
          title: string;
          description: string | null;
          price_from: number | null;
          price_to: number | null;
          price_type: 'per_hour' | 'per_day' | 'per_event' | 'per_person';
          city: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          category_id: string;
          title: string;
          description?: string | null;
          price_from?: number | null;
          price_to?: number | null;
          price_type?: 'per_hour' | 'per_day' | 'per_event' | 'per_person';
          city?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          category_id?: string;
          title?: string;
          description?: string | null;
          price_from?: number | null;
          price_to?: number | null;
          price_type?: 'per_hour' | 'per_day' | 'per_event' | 'per_person';
          city?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      provider_gallery: {
        Row: {
          id: string;
          provider_id: string;
          image_url: string;
          caption: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          image_url: string;
          caption?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          image_url?: string;
          caption?: string | null;
          display_order?: number;
          created_at?: string;
        };
      };
      provider_availability: {
        Row: {
          id: string;
          provider_id: string;
          date: string;
          start_time: string | null;
          end_time: string | null;
          status: 'available' | 'booked' | 'unavailable';
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          date: string;
          start_time?: string | null;
          end_time?: string | null;
          status?: 'available' | 'booked' | 'unavailable';
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          date?: string;
          start_time?: string | null;
          end_time?: string | null;
          status?: 'available' | 'booked' | 'unavailable';
          notes?: string | null;
          created_at?: string;
        };
      };
      provider_unavailable_dates: {
        Row: {
          id: string;
          provider_id: string;
          unavailable_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          unavailable_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          unavailable_date?: string;
          created_at?: string;
        };
      };
      inquiries: {
        Row: {
          id: string;
          customer_id: string;
          provider_id: string;
          service_id: string | null;
          event_type: string | null;
          event_date: string | null;
          location: string | null;
          guest_count: number | null;
          budget: number | null;
          message: string | null;
          status: 'pending' | 'contacted' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          provider_id: string;
          service_id?: string | null;
          event_type?: string | null;
          event_date?: string | null;
          location?: string | null;
          guest_count?: number | null;
          budget?: number | null;
          message?: string | null;
          status?: 'pending' | 'contacted' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          provider_id?: string;
          service_id?: string | null;
          event_type?: string | null;
          event_date?: string | null;
          location?: string | null;
          guest_count?: number | null;
          budget?: number | null;
          message?: string | null;
          status?: 'pending' | 'contacted' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          customer_id: string;
          provider_id: string;
          service_id: string | null;
          inquiry_id: string | null;
          event_date: string | null;
          event_location: string | null;
          guest_count: number | null;
          total_price: number | null;
          platform_commission: number | null;
          provider_amount: number | null;
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          payment_status: 'pending' | 'paid' | 'refunded';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          provider_id: string;
          service_id?: string | null;
          inquiry_id?: string | null;
          event_date?: string | null;
          event_location?: string | null;
          guest_count?: number | null;
          total_price?: number | null;
          platform_commission?: number | null;
          provider_amount?: number | null;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          payment_status?: 'pending' | 'paid' | 'refunded';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          provider_id?: string;
          service_id?: string | null;
          inquiry_id?: string | null;
          event_date?: string | null;
          event_location?: string | null;
          guest_count?: number | null;
          total_price?: number | null;
          platform_commission?: number | null;
          provider_amount?: number | null;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          payment_status?: 'pending' | 'paid' | 'refunded';
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          customer_id: string;
          provider_id: string;
          booking_id: string;
          rating: number;
          comment: string | null;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          provider_id: string;
          booking_id: string;
          rating: number;
          comment?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          provider_id?: string;
          booking_id?: string;
          rating?: number;
          comment?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          provider_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider_id?: string;
          created_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          provider_id: string;
          plan_name: string;
          price: number | null;
          billing_interval: 'monthly' | 'annual';
          status: 'active' | 'inactive' | 'cancelled';
          current_period_start: string | null;
          current_period_end: string | null;
          external_subscription_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          plan_name: string;
          price?: number | null;
          billing_interval?: 'monthly' | 'annual';
          status?: 'active' | 'inactive' | 'cancelled';
          current_period_start?: string | null;
          current_period_end?: string | null;
          external_subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          plan_name?: string;
          price?: number | null;
          billing_interval?: 'monthly' | 'annual';
          status?: 'active' | 'inactive' | 'cancelled';
          current_period_start?: string | null;
          current_period_end?: string | null;
          external_subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string | null;
          type: string;
          is_read: boolean;
          related_inquiry_id: string | null;
          related_booking_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message?: string | null;
          type: string;
          is_read?: boolean;
          related_inquiry_id?: string | null;
          related_booking_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string | null;
          type?: string;
          is_read?: boolean;
          related_inquiry_id?: string | null;
          related_booking_id?: string | null;
          created_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          customer_id: string;
          provider_id: string;
          inquiry_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          provider_id: string;
          inquiry_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          provider_id?: string;
          inquiry_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          message: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          message?: string;
          is_read?: boolean;
          created_at?: string;
        };
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          subject: string;
          message: string;
          status: 'new' | 'read' | 'responded';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          subject: string;
          message: string;
          status?: 'new' | 'read' | 'responded';
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          subject?: string;
          message?: string;
          status?: 'new' | 'read' | 'responded';
          created_at?: string;
        };
      };
      ai_event_plans: {
        Row: {
          id: string;
          user_id: string;
          event_type: string;
          event_date: string | null;
          location: string | null;
          guest_count: number | null;
          budget: number | null;
          preferences: Record<string, any> | null;
          generated_plan: Record<string, any> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_type: string;
          event_date?: string | null;
          location?: string | null;
          guest_count?: number | null;
          budget?: number | null;
          preferences?: Record<string, any> | null;
          generated_plan?: Record<string, any> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_type?: string;
          event_date?: string | null;
          location?: string | null;
          guest_count?: number | null;
          budget?: number | null;
          preferences?: Record<string, any> | null;
          generated_plan?: Record<string, any> | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      provider_applications: {
        Row: {
          id: string;
          business_name: string;
          contact_person: string;
          email: string;
          phone: string;
          category_id: string;
          city: string;
          website: string | null;
          description: string | null;
          region: string | null;
          specialization: string | null;
          expertise_areas: string[];
          terms_accepted_at: string | null;
          founding_partner_number: number | null;
          user_id: string | null;
          status: 'pending' | 'approved' | 'rejected';
          submitted_by: string | null;
          reviewed_by: string | null;
          review_notes: string | null;
          created_at: string;
          updated_at: string;
          reviewed_at: string | null;
        };
        Insert: {
          id?: string;
          business_name: string;
          contact_person: string;
          email: string;
          phone: string;
          category_id: string;
          city: string;
          website?: string | null;
          description?: string | null;
          region?: string | null;
          specialization?: string | null;
          expertise_areas?: string[];
          terms_accepted_at?: string | null;
          founding_partner_number?: number | null;
          user_id?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          submitted_by?: string | null;
          reviewed_by?: string | null;
          review_notes?: string | null;
          created_at?: string;
          updated_at?: string;
          reviewed_at?: string | null;
        };
        Update: {
          id?: string;
          business_name?: string;
          contact_person?: string;
          email?: string;
          phone?: string;
          category_id?: string;
          city?: string;
          website?: string | null;
          description?: string | null;
          region?: string | null;
          specialization?: string | null;
          expertise_areas?: string[];
          terms_accepted_at?: string | null;
          founding_partner_number?: number | null;
          user_id?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          submitted_by?: string | null;
          reviewed_by?: string | null;
          review_notes?: string | null;
          created_at?: string;
          updated_at?: string;
          reviewed_at?: string | null;
        };
      };
      marketplace_requests: {
        Row: {
          id: string;
          customer_id: string;
          title: string;
          event_type: string;
          event_date: string | null;
          location: string;
          guest_count: number | null;
          budget_min: number | null;
          budget_max: number | null;
          description: string;
          category_ids: string[];
          status: 'open' | 'closed' | 'completed' | 'cancelled';
          accepted_offer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          title: string;
          event_type: string;
          event_date?: string | null;
          location: string;
          guest_count?: number | null;
          budget_min?: number | null;
          budget_max?: number | null;
          description: string;
          category_ids?: string[];
          status?: 'open' | 'closed' | 'completed' | 'cancelled';
          accepted_offer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          title?: string;
          event_type?: string;
          event_date?: string | null;
          location?: string;
          guest_count?: number | null;
          budget_min?: number | null;
          budget_max?: number | null;
          description?: string;
          category_ids?: string[];
          status?: 'open' | 'closed' | 'completed' | 'cancelled';
          accepted_offer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      marketplace_offers: {
        Row: {
          id: string;
          request_id: string;
          provider_id: string;
          message: string;
          price: number | null;
          status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          provider_id: string;
          message: string;
          price?: number | null;
          status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          request_id?: string;
          provider_id?: string;
          message?: string;
          price?: number | null;
          status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
          created_at?: string;
          updated_at?: string;
        };
      };
      marketplace_messages: {
        Row: {
          id: string;
          request_id: string;
          provider_id: string;
          sender_id: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          provider_id: string;
          sender_id: string;
          message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          request_id?: string;
          provider_id?: string;
          sender_id?: string;
          message?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_marketplace_offer: {
        Args: { p_offer_id: string };
        Returns: Database['public']['Tables']['marketplace_requests']['Row'];
      };
      submit_provider_application: {
        Args: {
          p_business_name: string;
          p_contact_person: string;
          p_email: string;
          p_phone: string;
          p_category_id: string;
          p_city: string;
          p_region: string;
          p_website: string | null;
          p_description: string;
          p_terms_accepted: boolean;
        };
        Returns: Database['public']['Tables']['provider_applications']['Row'];
      };
      claim_provider_applications: {
        Args: Record<string, never>;
        Returns: Database['public']['Tables']['provider_applications']['Row'][];
      };
      approve_provider_application: {
        Args: { p_application_id: string; p_review_notes?: string | null };
        Returns: Database['public']['Tables']['provider_applications']['Row'];
      };
      reject_provider_application: {
        Args: { p_application_id: string; p_review_notes: string };
        Returns: Database['public']['Tables']['provider_applications']['Row'];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
