-- WARNING: Destructive operation. Review output of PREVIEW steps before running DELETEs.
-- Back up and remove all users (and related api_keys / usage_records) except 'yomvi122@gmail.com'.
-- Run in Supabase SQL editor or psql as a privileged (service) role.

BEGIN;

-- 1) Ensure backup tables exist (structure copied from live tables)
CREATE TABLE IF NOT EXISTS backup_users (LIKE users INCLUDING ALL);
CREATE TABLE IF NOT EXISTS backup_api_keys (LIKE api_keys INCLUDING ALL);
CREATE TABLE IF NOT EXISTS backup_usage_records (LIKE usage_records INCLUDING ALL);

-- 2) Preview: list candidate user ids and counts (DO NOT RUN IF YOU DIDN'T INTEND TO DELETE)
-- Replace the email below if needed.
SELECT 'Preview: candidate users to remove (email != yomvi122@gmail.com)' AS info;
SELECT id, email, name, company, created_at FROM users WHERE lower(email) <> lower('yomvi122@gmail.com') ORDER BY created_at DESC LIMIT 200;

SELECT count(*) AS candidate_user_count FROM users WHERE lower(email) <> lower('yomvi122@gmail.com');
SELECT count(*) AS candidate_api_keys FROM api_keys WHERE user_id IN (SELECT id FROM users WHERE lower(email) <> lower('yomvi122@gmail.com'));
SELECT count(*) AS candidate_usage_records FROM usage_records WHERE user_id IN (SELECT id FROM users WHERE lower(email) <> lower('yomvi122@gmail.com'));

-- 3) BACKUP: copy candidates into backup tables
INSERT INTO backup_users
SELECT * FROM users WHERE lower(email) <> lower('yomvi122@gmail.com');

INSERT INTO backup_api_keys
SELECT * FROM api_keys WHERE user_id IN (SELECT id FROM users WHERE lower(email) <> lower('yomvi122@gmail.com'));

INSERT INTO backup_usage_records
SELECT * FROM usage_records WHERE user_id IN (SELECT id FROM users WHERE lower(email) <> lower('yomvi122@gmail.com'));

-- 4) Validate backup counts (should match candidate_* counts above)
SELECT count(*) AS backed_up_users FROM backup_users WHERE lower(email) <> lower('yomvi122@gmail.com');
SELECT count(*) AS backed_up_api_keys FROM backup_api_keys WHERE user_id IN (SELECT id FROM backup_users);
SELECT count(*) AS backed_up_usage_records FROM backup_usage_records WHERE user_id IN (SELECT id FROM backup_users);

-- 5) If previews and backups look correct, run deletes below.
-- Uncomment the DELETE block to perform deletion. Keep the transaction open until you confirm.

DELETE FROM usage_records WHERE user_id IN (SELECT id FROM users WHERE lower(email) <> lower('yomvi122@gmail.com'));
DELETE FROM api_keys WHERE user_id IN (SELECT id FROM users WHERE lower(email) <> lower('yomvi122@gmail.com'));
DELETE FROM users WHERE lower(email) <> lower('yomvi122@gmail.com');

-- 6) After DELETES: commit the transaction
COMMIT;

-- 7) If you change your mind before committing, rollback:
-- ROLLBACK;

-- NOTE: This script assumes the schema names and FK cascades in the repo. Adjust if your DB differs.
