SELECT clerk_user_id, email, current_plan, plan, created_at FROM users WHERE email LIKE '%@%' ORDER BY created_at DESC LIMIT 5;
