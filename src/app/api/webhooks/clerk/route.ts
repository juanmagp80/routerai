import { supabaseAdmin, TABLES } from '@/lib/supabase';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';

// Webhook para manejar eventos de Clerk (registro de usuarios)
export async function POST(req: NextRequest) {
    try {
        // Verificar que tenemos la clave secreta del webhook
        const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
        if (!WEBHOOK_SECRET) {
            throw new Error('Please add CLERK_WEBHOOK_SECRET to your .env.local');
        }

        // Obtener headers
        const headerPayload = headers();
        const svix_id = headerPayload.get('svix-id');
        const svix_timestamp = headerPayload.get('svix-timestamp');
        const svix_signature = headerPayload.get('svix-signature');

        if (!svix_id || !svix_timestamp || !svix_signature) {
            return new Response('Error occurred -- no svix headers', {
                status: 400,
            });
        }

        // Obtener el body
        const body = await req.text();

        // Crear una instancia del webhook
        const wh = new Webhook(WEBHOOK_SECRET);
        let evt;

        try {
            evt = wh.verify(body, {
                'svix-id': svix_id,
                'svix-timestamp': svix_timestamp,
                'svix-signature': svix_signature,
            }) as { type: string; data: Record<string, unknown> };
        } catch (err) {
            console.error('Error verifying webhook:', err);
            return new Response('Error occurred', {
                status: 400,
            });
        }

        // Manejar el evento de usuario creado
        if (evt.type === 'user.created') {
            const userData = evt.data as {
                id: string;
                email_addresses: Array<{ email_address: string }>;
                first_name?: string;
                last_name?: string;
            };

            const { id, email_addresses, first_name, last_name } = userData;

            if (email_addresses && email_addresses.length > 0) {
                const email = email_addresses[0].email_address;
                const name = `${first_name || ''} ${last_name || ''}`.trim() || email;

                // Determinar rol automáticamente
                // Por defecto los nuevos usuarios serán 'viewer'.
                // Si no existe ningún admin en la base de datos, el primer usuario registrado será admin.
                let role: 'admin' | 'developer' | 'viewer' = 'viewer';

                try {
                    if (supabaseAdmin) {
                        const { data: admins } = await supabaseAdmin
                            .from(TABLES.USERS)
                            .select('id')
                            .eq('role', 'admin')
                            .limit(1);

                        if (!admins || admins.length === 0) {
                            role = 'admin';
                        }
                    } else {
                        console.warn('supabaseAdmin not initialized, defaulting new user to viewer');
                        role = 'viewer';
                    }
                } catch (err) {
                    console.error('Error checking existing admins:', err);
                    // si falla la comprobación, mantener viewer por seguridad
                    role = 'viewer';
                }

                // Crear usuario en nuestra base de datos.
                // IMPORTANT: No crear registros de empresa/tenant automáticamente aquí.

                if (supabaseAdmin) {
                    // New users get the default free plan and default API key limit.
                    // Role can be 'admin' for the very first user, but that should not imply an automatic enterprise plan.
                    const apiKeyLimit = 3;

                    const { error } = await supabaseAdmin
                        .from(TABLES.USERS)
                        .upsert({
                            id: id, // Usar el ID de Clerk como ID principal
                            clerk_user_id: id,
                            name,
                            email,
                            role,
                            // No tocar company ni crear equipos aquí: el usuario es nuevo y no debe tener otros usuarios asociados.
                            api_key_limit: apiKeyLimit,
                            status: 'active',
                            plan: 'free',
                            is_active: true,
                            email_verified: true,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        });

                    if (error) {
                        console.error('Error creating/upserting user in database:', error);
                    } else {
                    }
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}