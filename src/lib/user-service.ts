import { supabase } from './supabase'

interface User {
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

interface UserInsert {
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

interface UserUpdate {
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
      .maybeSingle() // Cambiado de .single() a .maybeSingle()

    if (error) {
      console.error('Error fetching user by email:', error)
      return null
    }

    return data
  }

  static async createUser(userData: UserInsert): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        
      if (error) {
        // Si es error de duplicado, no es un error real
        if (error.code === '23505') {
          console.log('Usuario ya existe, esto es normal')
          return null
        }
        console.error('Error creating user:', error)
        return null
      }

      return data?.[0] || null
    } catch (err) {
      console.error('Error in createUser:', err)
      return null
    }
  }

  static async updateUser(id: string, updates: UserUpdate): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()

      if (error) {
        console.error('Error updating user:', error)
        return null
      }

      return data?.[0] || null
    } catch (err) {
      console.error('Error in updateUser:', err)
      return null
    }
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