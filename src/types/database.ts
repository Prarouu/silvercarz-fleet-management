/**
 * Supabase database types for the `public` schema.
 *
 * Keep this file aligned with SQL migrations under `supabase/migrations/`.
 * When a linked Supabase project is available, regenerate with:
 *
 *   pnpm dlx supabase gen types typescript --project-id <project-id> --schema public > src/types/database.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: Database['public']['Enums']['app_role'];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: Database['public']['Enums']['app_role'];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: Database['public']['Enums']['app_role'];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      vehicles: {
        Row: {
          id: string;
          vehicle_name: string;
          vehicle_number: string;
          brand: string;
          color: string | null;
          fuel_type: Database['public']['Enums']['fuel_type'];
          transmission_type: Database['public']['Enums']['transmission_type'];
          default_daily_rate: number;
          availability_status: Database['public']['Enums']['vehicle_availability'];
          image_path: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vehicle_name: string;
          vehicle_number: string;
          brand: string;
          color?: string | null;
          fuel_type: Database['public']['Enums']['fuel_type'];
          transmission_type: Database['public']['Enums']['transmission_type'];
          default_daily_rate: number;
          availability_status?: Database['public']['Enums']['vehicle_availability'];
          image_path?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          vehicle_name?: string;
          vehicle_number?: string;
          brand?: string;
          color?: string | null;
          fuel_type?: Database['public']['Enums']['fuel_type'];
          transmission_type?: Database['public']['Enums']['transmission_type'];
          default_daily_rate?: number;
          availability_status?: Database['public']['Enums']['vehicle_availability'];
          image_path?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      invoice_sequences: {
        Row: {
          id: string;
          prefix: string;
          year: number;
          current_sequence: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          prefix: string;
          year: number;
          current_sequence?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          prefix?: string;
          year?: number;
          current_sequence?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          invoice_number: string;
          vehicle_id: string;
          mode: Database['public']['Enums']['rental_mode'];
          customer_name: string;
          address: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          place_to_visit: string | null;
          document_submitted: boolean;
          contact_number: string | null;
          invoice_date: string;
          delivery_date: string;
          return_date: string;
          driver_name: string | null;
          daily_charge: number;
          fuel_range: string | null;
          duration: number | null;
          booking_amount: number;
          payment_method: Database['public']['Enums']['payment_method'] | null;
          total_amount: number;
          status: Database['public']['Enums']['booking_status'];
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invoice_number: string;
          vehicle_id: string;
          mode: Database['public']['Enums']['rental_mode'];
          customer_name: string;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          place_to_visit?: string | null;
          document_submitted?: boolean;
          contact_number?: string | null;
          invoice_date?: string;
          delivery_date: string;
          return_date: string;
          driver_name?: string | null;
          daily_charge: number;
          fuel_range?: string | null;
          duration?: number | null;
          booking_amount?: number;
          payment_method?: Database['public']['Enums']['payment_method'] | null;
          total_amount?: number;
          status?: Database['public']['Enums']['booking_status'];
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invoice_number?: string;
          vehicle_id?: string;
          mode?: Database['public']['Enums']['rental_mode'];
          customer_name?: string;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          place_to_visit?: string | null;
          document_submitted?: boolean;
          contact_number?: string | null;
          invoice_date?: string;
          delivery_date?: string;
          return_date?: string;
          driver_name?: string | null;
          daily_charge?: number;
          fuel_range?: string | null;
          duration?: number | null;
          booking_amount?: number;
          payment_method?: Database['public']['Enums']['payment_method'] | null;
          total_amount?: number;
          status?: Database['public']['Enums']['booking_status'];
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'bookings_vehicle_id_fkey';
            columns: ['vehicle_id'];
            isOneToOne: false;
            referencedRelation: 'vehicles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bookings_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: Database['public']['Enums']['app_role'];
      };
      ensure_own_profile: {
        Args: Record<PropertyKey, never>;
        Returns: Database['public']['Tables']['profiles']['Row'];
      };
      is_active_staff: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      max_booking_invoice_sequence: {
        Args: {
          p_prefix: string;
          p_year: number;
        };
        Returns: number;
      };
      next_invoice_sequence: {
        Args: {
          p_prefix: string;
          p_year: number;
        };
        Returns: number;
      };
      peek_next_invoice_sequence: {
        Args: {
          p_prefix: string;
          p_year: number;
        };
        Returns: number;
      };
    };
    Enums: {
      app_role: 'owner' | 'manager';
      fuel_type: 'petrol' | 'diesel' | 'cng' | 'electric' | 'hybrid';
      transmission_type: 'manual' | 'automatic' | 'amt' | 'cvt' | 'dct';
      vehicle_availability: 'available' | 'booked' | 'maintenance' | 'reserved' | 'inactive';
      rental_mode: 'with_driver' | 'without_driver';
      payment_method: 'cash' | 'upi' | 'card' | 'bank_transfer' | 'cheque' | 'other';
      booking_status: 'draft' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled';
    };
    CompositeTypes: Record<string, never>;
  };
};

type PublicSchema = Database['public'];

export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row'];
export type TablesInsert<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Update'];
export type Enums<T extends keyof PublicSchema['Enums']> = PublicSchema['Enums'][T];
