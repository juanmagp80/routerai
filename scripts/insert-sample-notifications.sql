-- Insertar notificaciones de ejemplo para usuarios existentes
-- Reemplaza 'USER_ID_AQUI' con un ID de usuario real de tu base de datos

-- Obtener un usuario real de la base de datos para usar como ejemplo
WITH sample_user AS (
  SELECT clerk_user_id FROM users LIMIT 1
)
INSERT INTO public.notifications (user_id, type, title, message, metadata, read, created_at)
SELECT 
  sample_user.clerk_user_id,
  'limit_warning',
  'API Usage Warning',
  'You have used 80% of your monthly API request limit. Consider upgrading your plan to avoid service interruption.',
  '{"threshold": 80, "current_usage": 4000, "limit": 5000}',
  false,
  NOW() - INTERVAL '2 hours'
FROM sample_user

UNION ALL

SELECT 
  sample_user.clerk_user_id,
  'upgrade_suggestion',
  'Upgrade Recommendation',
  'Based on your usage patterns, we recommend upgrading to the PRO plan for better performance and higher limits.',
  '{"suggested_plan": "pro", "current_plan": "starter"}',
  false,
  NOW() - INTERVAL '1 day'
FROM sample_user

UNION ALL

SELECT 
  sample_user.clerk_user_id,
  'trial_expiring',
  'Trial Expiring Soon',
  'Your free trial will expire in 3 days. Upgrade now to continue enjoying all features.',
  '{"days_remaining": 3, "trial_end_date": "2024-11-15"}',
  true,
  NOW() - INTERVAL '2 days'
FROM sample_user

UNION ALL

SELECT 
  sample_user.clerk_user_id,
  'limit_reached',
  'API Limit Reached',
  'You have reached your monthly API request limit. Upgrade your plan or wait until next month to continue using the service.',
  '{"current_usage": 5000, "limit": 5000}',
  false,
  NOW() - INTERVAL '30 minutes'
FROM sample_user

UNION ALL

SELECT 
  sample_user.clerk_user_id,
  'general',
  'Welcome to Roulyx!',
  'Thank you for joining Roulyx. Start by creating your first API key and exploring our powerful AI models.',
  '{"welcome_message": true}',
  true,
  NOW() - INTERVAL '1 week'
FROM sample_user;

-- Verificar que se insertaron las notificaciones
SELECT 
  id, 
  type, 
  title, 
  read, 
  created_at
FROM public.notifications 
ORDER BY created_at DESC;