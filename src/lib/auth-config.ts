// Configuración simplificada: todos los usuarios que se registren obtienen rol admin
// El admin puede luego crear otros usuarios con roles específicos

// Función para determinar el rol basado en email
export function determineUserRole(): 'admin' | 'developer' | 'viewer' {
    // Por seguridad, el comportamiento por defecto del cliente es asignar 'viewer'
    // Esto evita que los usuarios creados desde el cliente obtengan privilegios de admin.
    // El webhook en el servidor hará una comprobación para asignar admin al primer usuario
    // si no existen administradores.
    return 'viewer';
}

// Nota: En el futuro, si quieres restringir esto, puedes:
// 1. Cambiar esta función para devolver 'viewer' por defecto
// 2. Promover manualmente al primer usuario a admin  
// 3. Usar el sistema de creación de usuarios desde la interfaz admin