-- WARNING: These statements are destructive. Make a backup before running on production.

-- This script is defensive: it detects which columns exist in your schema and then
-- builds dynamic SQL to preview and (optionally) delete sample/demo rows inserted
-- by the seeder scripts. It avoids errors caused by missing columns.

-- IMPORTANT: Inspect the PREVIEW output (RAISE NOTICE or SELECTs) before running the deletes.

DO $$
DECLARE
  has_key_hash BOOLEAN := false;
  has_key_prefix BOOLEAN := false;
  has_key_value BOOLEAN := false;
  has_model_name BOOLEAN := false;
  has_model_used BOOLEAN := false;
  qry TEXT;
  cnt BIGINT;
BEGIN
  -- Detect columns in api_keys
  SELECT EXISTS(
    SELECT 1 FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'key_hash'
  ) INTO has_key_hash;

  SELECT EXISTS(
    SELECT 1 FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'key_prefix'
  ) INTO has_key_prefix;

  SELECT EXISTS(
    SELECT 1 FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'key_value'
  ) INTO has_key_value;

  -- Detect model column in usage_records
  SELECT EXISTS(
    SELECT 1 FROM information_schema.columns WHERE table_name = 'usage_records' AND column_name = 'model_name'
  ) INTO has_model_name;

  SELECT EXISTS(
    SELECT 1 FROM information_schema.columns WHERE table_name = 'usage_records' AND column_name = 'model_used'
  ) INTO has_model_used;

  RAISE NOTICE 'Detected api_keys columns: key_hash=% key_prefix=% key_value=%', has_key_hash, has_key_prefix, has_key_value;
  RAISE NOTICE 'Detected usage_records model columns: model_name=% model_used=%', has_model_name, has_model_used;

  -- Build dynamic condition for api_keys matching seed pattern
  IF has_key_hash THEN
    qry := 'SELECT id FROM api_keys WHERE key_hash LIKE ''rtr_%'' OR name = ''Clave Principal''';
  ELSIF has_key_prefix THEN
    qry := 'SELECT id FROM api_keys WHERE key_prefix LIKE ''rtr_%'' OR name = ''Clave Principal''';
  ELSIF has_key_value THEN
    qry := 'SELECT id FROM api_keys WHERE key_value LIKE ''rtr_%'' OR name = ''Clave Principal''';
  ELSE
    RAISE NOTICE 'No api_keys column found matching key_hash/key_prefix/key_value. Aborting dynamic cleanup.';
    RETURN;
  END IF;

  -- Create temporary table with candidate api_key ids
  EXECUTE 'CREATE TEMP TABLE tmp_sample_api_keys ON COMMIT DROP AS ' || qry;

  EXECUTE 'SELECT COUNT(*) FROM tmp_sample_api_keys' INTO cnt;
  RAISE NOTICE 'Found % candidate api keys to inspect', cnt;

  -- Preview usage records referencing those keys (limit 200)
  RAISE NOTICE 'Previewing up to 200 usage_records linked to candidate api_keys (showing in result set)...';
  EXECUTE 'SELECT ur.* FROM usage_records ur JOIN tmp_sample_api_keys t ON ur.api_key_id = t.id LIMIT 200';

  -- Show a count of usage records to be deleted
  EXECUTE 'SELECT COUNT(*) FROM usage_records WHERE api_key_id IN (SELECT id FROM tmp_sample_api_keys)' INTO cnt;
  RAISE NOTICE 'Usage records referencing candidate keys: %', cnt;

  -- If there are usage records, delete them
  IF cnt > 0 THEN
    RAISE NOTICE 'Deleting % usage_records (api_key_id IN tmp_sample_api_keys)...', cnt;
    EXECUTE 'DELETE FROM usage_records WHERE api_key_id IN (SELECT id FROM tmp_sample_api_keys)';
    RAISE NOTICE 'Deleted usage_records.';
  ELSE
    RAISE NOTICE 'No usage_records to delete.';
  END IF;

  -- Now delete the api_keys themselves
  EXECUTE 'SELECT COUNT(*) FROM tmp_sample_api_keys' INTO cnt;
  IF cnt > 0 THEN
    RAISE NOTICE 'Deleting % api_keys (from tmp_sample_api_keys)...', cnt;
    EXECUTE 'DELETE FROM api_keys WHERE id IN (SELECT id FROM tmp_sample_api_keys)';
    RAISE NOTICE 'Deleted api_keys.';
  ELSE
    RAISE NOTICE 'No api_keys to delete.';
  END IF;

  -- Optional: handle legacy 'model_used' vs 'model_name' column previews
  IF has_model_name THEN
    RAISE NOTICE 'Previewing recent usage_records by model_name (gpt-4, gpt-3.5-turbo, claude...):';
    EXECUTE 'SELECT * FROM usage_records WHERE model_name IN (''gpt-4'',''gpt-3.5-turbo'',''claude-3-sonnet'',''claude-3-haiku'') AND created_at > NOW() - INTERVAL ''30 days'' LIMIT 200';
  ELSIF has_model_used THEN
    RAISE NOTICE 'Previewing recent usage_records by model_used (legacy schema):';
    EXECUTE 'SELECT * FROM usage_records WHERE model_used IN (''gpt-4'',''gpt-3.5-turbo'',''claude-3-sonnet'',''claude-3-haiku'') AND created_at > NOW() - INTERVAL ''30 days'' LIMIT 200';
  ELSE
    RAISE NOTICE 'No model_name/model_used column found in usage_records; skipping model-based preview.';
  END IF;

END
$$;

-- End of cleanup script
-- Cleanup script to remove sample/demo data inserted by the project's sample data scripts
-- Usage:
-- 1) Review the DELETE queries below and adjust filters if necessary.
-- 2) Run from psql, supabase SQL editor, or via your DB admin UI.

-- WARNING: These statements are destructive. Make a backup before running on production.

-- 1) Identify API keys that look like the ones created by the sample script
--    The JS seeder prefixes keys with 'rtr_' and names them 'Clave Principal'.
-- Nota: el esquema usa columnas como key_hash y key_prefix en lugar de key_value.
SELECT id, user_id, name, key_hash, key_prefix, created_at
FROM api_keys
WHERE (key_hash LIKE 'rtr_%' OR key_prefix LIKE 'rtr_%')
  OR name = 'Clave Principal'
LIMIT 100;

-- 2) Preview usage records that reference those API keys
-- Preview usage records that reference API keys matching the seed pattern
SELECT ur.*
FROM usage_records ur
JOIN api_keys k ON ur.api_key_id = k.id
WHERE (k.key_hash LIKE 'rtr_%' OR k.key_prefix LIKE 'rtr_%') OR k.name = 'Clave Principal'
LIMIT 200;

-- 3) Delete usage records created by the sample API keys (preview above first!)
--    This removes the sample usage entries inserted by scripts/insert-sample-data.js
DELETE FROM usage_records
WHERE api_key_id IN (
  SELECT id FROM api_keys WHERE (key_hash LIKE 'rtr_%' OR key_prefix LIKE 'rtr_%') OR name = 'Clave Principal'
);

-- 4) Delete the sample API keys themselves
DELETE FROM api_keys
WHERE (key_hash LIKE 'rtr_%' OR key_prefix LIKE 'rtr_%') OR name = 'Clave Principal';

-- 5) Optional: If you also used the SQL seeder that inserted rows with api_key id values like
-- 'api_key_example_1' and a placeholder user id, you can remove rows using the model names used
-- by the seed (gpt-4, gpt-3.5-turbo, claude-3-sonnet, claude-3-haiku) AND a recent created_at.
-- Preview first:
-- Preview usage records by model names. The current schema uses `model_name`.
SELECT * FROM usage_records
WHERE model_name IN ('gpt-4','gpt-3.5-turbo','claude-3-sonnet','claude-3-haiku')
  AND created_at > NOW() - INTERVAL '30 days'
LIMIT 200;

-- Then delete if it matches what you expect:
-- DELETE FROM usage_records
-- WHERE model_name IN ('gpt-4','gpt-3.5-turbo','claude-3-sonnet','claude-3-haiku')
--   AND created_at > NOW() - INTERVAL '30 days';

-- 6) Optional: remove api_keys generated by the SQL seeder pattern 'rtr_' as well
-- DELETE FROM api_keys WHERE key_value LIKE 'rtr_%';

-- 7) If you want to reset counts for a specific user (replace USER_ID):
-- DELETE FROM usage_records WHERE user_id = 'USER_ID';
-- DELETE FROM api_keys WHERE user_id = 'USER_ID' AND (key_value LIKE 'rtr_%' OR name = 'Clave Principal');

-- End of cleanup script
