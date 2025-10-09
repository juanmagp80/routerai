import { supabase } from './supabase'
import { Database } from './database.types'

type User = Database['public']['Tables']['users']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']
type UserUpdate = Database['public']['Tables']['users']['Update']

export class UserService {
  static async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching user:', error)
      return null
    }

    return data
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      console.error('Error fetching user by email:', error)
      return null
    }

    return data
  }

  static async createUser(userData: UserInsert): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single()

    if (error) {
      console.error('Error creating user:', error)
      return null
    }

    return data
  }

  static async updateUser(id: string, updates: UserUpdate): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      return null
    }

    return data
  }

  // Crear o actualizar usuario desde Clerk
  static async syncUserFromClerk(clerkUser: {
    id: string
    emailAddresses: Array<{ emailAddress: string }>
    firstName?: string | null
    lastName?: string | null
  }): Promise<User | null> {
    const email = clerkUser.emailAddresses[0]?.emailAddress
    if (!email) return null

    const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Usuario'

    // Verificar si el usuario ya existe
    const existingUser = await this.getUserById(clerkUser.id)
    
    if (existingUser) {
      // Actualizar usuario existente
      return await this.updateUser(clerkUser.id, { name, email })
    } else {
      // Crear nuevo usuario
      return await this.createUser({
        id: clerkUser.id,
        name,
        email,
        plan: 'free',
        api_key_limit: 3,
        is_active: true,
        email_verified: true
      })
    }
  }
}