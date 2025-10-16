'use client';

import { Database } from '@/lib/database.types';
import { UserService } from '@/lib/user-service';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

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
                    // Condición de seguridad: no crear usuario en la BD hasta que el email esté verificado,
                    // a menos que la variable de entorno SKIP_VERIFY_BEFORE_CREATE esté activa (para entornos de desarrollo).
                    const emailVerified = clerkUser.emailAddresses[0]?.verification?.status === 'verified';
                    const allowCreate = process.env.NEXT_PUBLIC_SKIP_VERIFY_BEFORE_CREATE === 'true' || emailVerified;

                    if (!allowCreate) {
                        console.log('Usuario no creado en la base de datos: email no verificado y SKIP_VERIFY_BEFORE_CREATE no activo.');
                    } else {
                        // Obtener límites del plan free para nuevos usuarios
                        const { PlanLimitsService } = await import('@/lib/plan-limits-service');
                        const freePlanLimits = await PlanLimitsService.getPlanLimits('free');

                        // Crear nuevo usuario en Supabase con límites correctos del plan
                        const userData = {
                            id: clerkUser.id,
                            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Usuario',
                            email: primaryEmail,
                            company: clerkUser.organizationMemberships?.[0]?.organization?.name,
                            plan: 'free',
                            api_key_limit: freePlanLimits?.api_key_limit || 3,
                            is_active: true,
                            email_verified: emailVerified,
                            clerk_user_id: clerkUser.id,
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
                    }
                } else {
                    // Usuario existente encontrado - vincular con Clerk si no está vinculado
                    const updatedData: Record<string, string | boolean> = {};
                    const currentName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();

                    // Vincular con Clerk si no está vinculado
                    const userWithClerkId = existingUser as { clerk_user_id?: string };
                    if (!userWithClerkId.clerk_user_id) {
                        updatedData.clerk_user_id = clerkUser.id;
                        console.log('Vinculando usuario existente con Clerk ID:', clerkUser.id);
                    }

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