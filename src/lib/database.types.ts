export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          company?: string
          plan: string
          api_key_limit: number
          is_active: boolean
          email_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          company?: string
          plan?: string
          api_key_limit?: number
          is_active?: boolean
          email_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          company?: string
          plan?: string
          api_key_limit?: number
          is_active?: boolean
          email_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      api_keys: {
        Row: {
          id: string
          user_id: string
          name: string
          key_hash: string
          is_active: boolean
          created_at: string
          last_used_at?: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          key_hash: string
          is_active?: boolean
          created_at?: string
          last_used_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          key_hash?: string
          is_active?: boolean
          created_at?: string
          last_used_at?: string
        }
      }
      usage_records: {
        Row: {
          id: string
          user_id: string
          api_key_id: string
          model_used: string
          input_tokens: number
          output_tokens: number
          cost: number
          request_data: unknown
          response_data: unknown
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          api_key_id: string
          model_used: string
          input_tokens: number
          output_tokens: number
          cost: number
          request_data?: unknown
          response_data?: unknown
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          api_key_id?: string
          model_used?: string
          input_tokens?: number
          output_tokens?: number
          cost?: number
          request_data?: unknown
          response_data?: unknown
          created_at?: string
        }
      }
    }
  }
}