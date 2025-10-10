// Configuración simplificada: todos los usuarios que se registren obtienen rol admin
// El admin puede luego crear otros usuarios con roles específicos

// Función para determinar el rol basado en email
export function determineUserRole(): 'admin' | 'developer' | 'viewer' {
    // Todos los usuarios que se registren automáticamente son admin
    // Esto permite que el primer usuario configure el sistema
    // y luego cree otros usuarios con roles específicos
    return 'admin';
}

// Nota: En el futuro, si quieres restringir esto, puedes:
// 1. Cambiar esta función para devolver 'viewer' por defecto
// 2. Promover manualmente al primer usuario a admin  
// 3. Usar el sistema de creación de usuarios desde la interfaz admin