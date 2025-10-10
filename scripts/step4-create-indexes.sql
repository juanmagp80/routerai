-- PASO 5: Crear índices
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX idx_usage_records_user_id ON public.usage_records(user_id);
CREATE INDEX idx_usage_records_created_at ON public.usage_records(created_at);

-- Verificar que los índices se crearon
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'api_keys', 'usage_records');