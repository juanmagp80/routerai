import { Database } from './database.types'
import { supabase } from './supabase'

type ApiKey = Database['public']['Tables']['api_keys']['Row']
type ApiKeyInsert = Database['public']['Tables']['api_keys']['Insert']

export class ApiKeyService {
  static async getApiKeysByUserId(userId: string): Promise<ApiKey[]> {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching API keys:', error)
      return []
    }

    return data || []
  }

  static async createApiKey(apiKeyData: ApiKeyInsert): Promise<ApiKey | null> {
    const { data, error } = await supabase
      .from('api_keys')
      .insert(apiKeyData)
      .select()
      .single()

    if (error) {
      console.error('Error creating API key:', error)
      return null
    }

    return data
  }

  static async deleteApiKey(id: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting API key:', error)
      return false
    }

    return true
  }

  static async validateApiKey(keyValue: string): Promise<ApiKey | null> {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('key_hash', keyValue) // Cambiado de key_value a key_hash
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error validating API key:', error)
      return null
    }

    return data
  }

  static async updateLastUsed(id: string): Promise<void> {
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', id)
  }

  // Generar una nueva API key
  static generateApiKey(): string {
    const prefix = 'rtr_' // router-ai prefix
    const randomPart = Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    return `${prefix}${randomPart}`
  }
}