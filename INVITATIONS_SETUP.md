# Configuración del Sistema de Invitaciones

Este documento explica cómo configurar y ejecutar el sistema de invitaciones por email.

## 1. Ejecutar la Migración de Base de Datos

### Opción A: Supabase SQL Editor (Recomendado)
1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a "SQL Editor" en el menú lateral
3. Copia y pega el contenido completo de `scripts/create-invitations-table.sql`
4. Haz clic en "Run" para ejecutar la migración
5. Deberías ver el mensaje "Success. No rows returned" si todo salió bien

### Opción B: Terminal con psql
```bash
# Si tienes psql instalado y configurado
psql -h <tu-host-supabase> -U postgres -d postgres -f scripts/create-invitations-table.sql
```

### Verificar la Migración
Ejecuta esta consulta para confirmar que la tabla se creó correctamente:
```sql
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'invitations' 
ORDER BY ordinal_position;
```

## 2. Configurar Variables de Entorno

### RESEND_API_KEY (Requerido para envío de emails)
1. Crea una cuenta en [Resend](https://resend.com)
2. Obtén tu API key desde el dashboard
3. Añade la clave a tu `.env.local`:
```bash
RESEND_API_KEY=re_tu_clave_aqui
```

### NEXT_PUBLIC_APP_URL (Requerido para links de invitación)
Añade la URL de tu aplicación a `.env.local`:
```bash
# Para desarrollo local
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Para producción
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

### Para Envíos de Producción (Opcional)
Si quieres enviar emails a direcciones externas, necesitas verificar un dominio en Resend:
1. Ve a [Resend Domains](https://resend.com/domains)
2. Añade tu dominio y configura los registros DNS requeridos
3. Actualiza el `from` en `src/lib/email-service.ts` para usar tu dominio verificado

## 3. Probar el Sistema

### Opción A: UI Admin
1. Inicia el servidor de desarrollo: `npm run dev`
2. Ve a `/admin/users`
3. Haz clic en "Add User"
4. Marca "Send invitation email" 
5. Completa el formulario y envía

### Opción B: API directa
```bash
# Crear invitación
curl -X POST http://localhost:3000/api/admin/users/invite \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'

# Aceptar invitación (simular click en email)
curl -X POST http://localhost:3000/api/invites/accept \
  -H "Content-Type: application/json" \
  -d '{"token":"token-de-la-invitacion","clerk_user_id":"user_xxx"}'
```

## 4. Funcionalidades del Sistema

### Características Implementadas
- ✅ Expiración automática de invitaciones (7 días)
- ✅ Límite de reenvíos por invitación (máximo 5)
- ✅ Tokens únicos de un solo uso
- ✅ Validación de expiración y uso
- ✅ Asignación automática de company del invitador
- ✅ Template HTML de email con estilos

### Flujo de Invitación
1. Admin crea usuario con "Send invitation email" marcado
2. Sistema genera token único y guarda en DB
3. Envía email con link de aceptación
4. Usuario hace clic en link → token se valida
5. Si válido: se crea/actualiza usuario y se marca invitación como usada

### Campos de la Tabla `invitations`
- `id`: UUID único
- `email`: Email del invitado
- `name`: Nombre del invitado
- `token`: Token único para aceptación
- `created_by`: ID del usuario que envió la invitación
- `expires_at`: Fecha de expiración (7 días por defecto)
- `resend_count`: Número de reenvíos (máx 5)
- `is_used`: Marca si la invitación ya fue aceptada
- `created_at`: Fecha de creación
- `accepted_at`: Fecha de aceptación
- `accepted_by`: Clerk user ID que aceptó

## 5. Solución de Problemas

### Error "Domain not verified"
- Configura un dominio verificado en Resend
- O usa el email permitido para pruebas en desarrollo

### Error "Column does not exist"
- Asegúrate de ejecutar la migración completa
- Verifica que la tabla existe con la consulta de verificación

### Emails no llegan
- Verifica RESEND_API_KEY en .env.local
- Revisa logs de la aplicación para errores
- Confirma que el dominio del remitente está verificado

### Token expirado/inválido
- Las invitaciones expiran en 7 días
- Los tokens solo se pueden usar una vez
- Crea una nueva invitación si es necesario