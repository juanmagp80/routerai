'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { UserService } from '@/lib/user-service';
import { Database } from '@/lib/database.types';

type User = Database['public']['Tables']['users']['Row'];

export function useUserSync() {
  const { user: clerkUser, isLoaded } = useUser();
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function syncUser() {
      if (!isLoaded || !clerkUser) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress;
        if (!primaryEmail) {
          throw new Error('No se encontró email del usuario');
        }

        // Buscar usuario existente en Supabase
        let existingUser = await UserService.getUserByEmail(primaryEmail);

        if (!existingUser) {
          // Crear nuevo usuario en Supabase
          const userData = {
            id: clerkUser.id,
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Usuario',
            email: primaryEmail,
            company: clerkUser.organizationMemberships?.[0]?.organization?.name,
            plan: 'free',
            api_key_limit: 1,
            is_active: true,
            email_verified: clerkUser.emailAddresses[0]?.verification?.status === 'verified',
          };

          existingUser = await UserService.createUser(userData);
          
          // Si el usuario ya existe (error de duplicado), intentar obtenerlo
          if (!existingUser) {
            console.log('Usuario ya existe, intentando obtenerlo...');
            existingUser = await UserService.getUserByEmail(primaryEmail);
            
            if (!existingUser) {
              throw new Error('Error al crear o encontrar usuario en la base de datos');
            }
          }
        } else {
          // Actualizar datos si han cambiado
          const updatedData: Record<string, string | boolean> = {};
          const currentName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
          
          if (existingUser.name !== currentName && currentName) {
            updatedData.name = currentName;
          }
          
          if (existingUser.email_verified !== (clerkUser.emailAddresses[0]?.verification?.status === 'verified')) {
            updatedData.email_verified = clerkUser.emailAddresses[0]?.verification?.status === 'verified';
          }

          if (Object.keys(updatedData).length > 0) {
            existingUser = await UserService.updateUser(existingUser.id, updatedData);
          }
        }

        setDbUser(existingUser);
      } catch (err) {
        console.error('Error sincronizando usuario:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    }

    syncUser();
  }, [clerkUser, isLoaded]);

  return {
    dbUser,
    clerkUser,
    isLoading,
    error,
    isAuthenticated: isLoaded && !!clerkUser,
  };
}