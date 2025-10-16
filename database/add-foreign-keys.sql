-- Script para agregar las referencias de clave foránea después de crear las tablas
-- Ejecutar DESPUÉS de create-model-learning-tables.sql

-- Agregar referencia de clave foránea a la tabla users si existe
DO $$
DECLARE
    users_exists BOOLEAN;
    users_id_type TEXT;
BEGIN
    -- Verificar si la tabla users existe
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
    ) INTO users_exists;
    
    IF users_exists THEN
        -- Obtener el tipo de la columna id en users
        SELECT data_type INTO users_id_type
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'id' AND table_schema = 'public';
        
        RAISE NOTICE 'Tabla users encontrada con id de tipo: %', users_id_type;
        
        -- Solo agregar la referencia si los tipos son compatibles
        IF users_id_type IN ('text', 'character varying') THEN
            -- Agregar clave foránea para user_model_preferences
            BEGIN
                ALTER TABLE user_model_preferences 
                ADD CONSTRAINT fk_user_model_preferences_user_id 
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
                
                RAISE NOTICE 'Clave foránea agregada a user_model_preferences';
            EXCEPTION
                WHEN duplicate_object THEN
                    RAISE NOTICE 'Clave foránea ya existe en user_model_preferences';
                WHEN OTHERS THEN
                    RAISE WARNING 'Error agregando clave foránea a user_model_preferences: %', SQLERRM;
            END;
            
            -- Agregar clave foránea para user_model_feedback
            BEGIN
                ALTER TABLE user_model_feedback 
                ADD CONSTRAINT fk_user_model_feedback_user_id 
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
                
                RAISE NOTICE 'Clave foránea agregada a user_model_feedback';
            EXCEPTION
                WHEN duplicate_object THEN
                    RAISE NOTICE 'Clave foránea ya existe en user_model_feedback';
                WHEN OTHERS THEN
                    RAISE WARNING 'Error agregando clave foránea a user_model_feedback: %', SQLERRM;
            END;
        ELSE
            RAISE WARNING 'Tipo de users.id (%) no es compatible con TEXT. Las claves foráneas no se agregaron.', users_id_type;
        END IF;
    ELSE
        RAISE WARNING 'Tabla users no encontrada. Las claves foráneas no se agregaron.';
    END IF;
END $$;