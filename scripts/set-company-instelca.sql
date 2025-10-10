-- Safe script to set company = 'Instelca' for two users
-- It will backup affected rows before updating.

BEGIN;

-- Create backup tables if they don't exist
CREATE TABLE IF NOT EXISTS backup_users_instelca (LIKE users INCLUDING ALL);
CREATE TABLE IF NOT EXISTS backup_api_keys_instelca (LIKE api_keys INCLUDING ALL);
CREATE TABLE IF NOT EXISTS backup_usage_records_instelca (LIKE usage_records INCLUDING ALL);

-- Target users (by id or email)
-- 1) user_33t2Znh2CEyo72pUNBXLCPOiIvK (yomvi122@gmail.com)
-- 2) user_1760127156921_zttx2u9r0 (juangpdev@gmail.com)

-- Preview current rows
SELECT 'Preview users to update' AS info;
SELECT id, email, name, company, clerk_user_id, status FROM users WHERE id IN ('user_33t2Znh2CEyo72pUNBXLCPOiIvK','user_1760127156921_zttx2u9r0');

-- Backup user rows
INSERT INTO backup_users_instelca
SELECT * FROM users WHERE id IN ('user_33t2Znh2CEyo72pUNBXLCPOiIvK','user_1760127156921_zttx2u9r0');

-- Backup related api_keys and usage_records
INSERT INTO backup_api_keys_instelca
SELECT * FROM api_keys WHERE user_id IN ('user_33t2Znh2CEyo72pUNBXLCPOiIvK','user_1760127156921_zttx2u9r0');

INSERT INTO backup_usage_records_instelca
SELECT * FROM usage_records WHERE user_id IN ('user_33t2Znh2CEyo72pUNBXLCPOiIvK','user_1760127156921_zttx2u9r0');

-- Perform updates
UPDATE users
SET company = 'Instelca'
WHERE id IN ('user_33t2Znh2CEyo72pUNBXLCPOiIvK','user_1760127156921_zttx2u9r0');

-- Also update related api_keys and usage_records company if those tables have a company column
-- We'll check and update conditionally. If column doesn't exist, these statements will error; so we wrap in DO blocks.

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'company') THEN
        UPDATE api_keys SET company = 'Instelca' WHERE user_id IN ('user_33t2Znh2CEyo72pUNBXLCPOiIvK','user_1760127156921_zttx2u9r0');
    END IF;
END
$$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usage_records' AND column_name = 'company') THEN
        UPDATE usage_records SET company = 'Instelca' WHERE user_id IN ('user_33t2Znh2CEyo72pUNBXLCPOiIvK','user_1760127156921_zttx2u9r0');
    END IF;
END
$$;

-- Validate
SELECT 'Backups and updates done. Verify the rows below' AS info;
SELECT id, email, name, company FROM users WHERE id IN ('user_33t2Znh2CEyo72pUNBXLCPOiIvK','user_1760127156921_zttx2u9r0');

COMMIT;

-- If something looks wrong, run ROLLBACK instead of COMMIT above.
