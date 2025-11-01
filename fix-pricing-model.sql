-- CORRECCIONES URGENTES AL MODELO DE PRECIOS
-- Ejecutar ANTES de ir a producción

-- 1. Reducir dramáticamente el plan FREE
UPDATE plan_limits 
SET monthly_request_limit = 10 -- Reducir de 25 a 10
WHERE plan_name = 'free';

-- 2. Ajustar plan PRO para ser rentable
UPDATE plan_limits 
SET 
    monthly_request_limit = 20000, -- Reducir de 100K a 20K
    price_eur = 79 -- Subir precio de 49€ a 79€
WHERE plan_name = 'pro';

-- 3. Ajustar plan ENTERPRISE para ser rentable  
UPDATE plan_limits 
SET 
    monthly_request_limit = 80000, -- Reducir de 1M a 80K
    price_eur = 299 -- Subir precio de 199€ a 299€
WHERE plan_name = 'enterprise';

-- 4. Ajustar plan STARTER (más conservador)
UPDATE plan_limits 
SET 
    monthly_request_limit = 5000, -- Reducir de 10K a 5K
    price_eur = 39 -- Subir de 29€ a 39€
WHERE plan_name = 'starter';

-- VERIFICAR CAMBIOS
SELECT 
    plan_name,
    price_eur as "Precio €/mes",
    monthly_request_limit as "Requests/mes",
    ROUND(monthly_request_limit * 0.001923, 2) as "Costo máximo $",
    ROUND(price_eur - (monthly_request_limit * 0.001923), 2) as "Ganancia $",
    ROUND(((price_eur - (monthly_request_limit * 0.001923)) / price_eur) * 100, 1) as "Margen %"
FROM plan_limits 
ORDER BY price_eur;