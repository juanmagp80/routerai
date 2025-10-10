import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client for browser/client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations (has elevated permissions)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Database table names
export const TABLES = {
  USERS: 'users',
  API_KEYS: 'api_keys',
  USAGE_RECORDS: 'usage_records',
  TASKS: 'tasks',
  NOTIFICATIONS: 'notifications',
  PLAN_LIMITS: 'plan_limits',
  API_KEY_USAGE: 'api_key_usage',
  USAGE_LOGS: 'usage_logs',
} as const;

// TypeScript types based on your actual database structure
export interface User {
  id: string; // text primary key
  name: string;
  email: string;
  company?: string;
  plan?: string; // 'free', 'starter', 'pro', 'enterprise'
  role?: string; // 'admin', 'developer', 'viewer' (we're adding this)
  status: string; // 'active', 'inactive', etc.
  department?: string;
  clerk_user_id?: string;
  api_key_limit?: number;
  is_active?: boolean;
  email_verified?: boolean;
  monthly_requests_used?: number;
  last_reset_date?: string;
  free_trial_expires_at?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  last_active?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  key_hash: string;
  key_prefix: string;
  status: 'active' | 'inactive' | 'revoked';
  permissions?: Record<string, unknown>;
  rate_limit_per_minute?: number;
  rate_limit_per_day?: number;
  expires_at?: string;
  last_used_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UsageRecord {
  id: string;
  user_id: string;
  api_key_id?: string;
  model_name: string;
  provider: string;
  input_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
  cost_usd?: number;
  latency_ms?: number;
  status?: 'success' | 'error' | 'timeout';
  error_message?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
}