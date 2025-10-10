# Admin Role Management Setup Guide

## Overview
This system uses a simplified approach: **every user who registers or logs in through Clerk automatically gets admin privileges**. Admins can then create and manage other users with specific roles through the admin interface.

## Simplified Approach Benefits
- **Easy Setup**: No complex configuration of emails or domains
- **Immediate Access**: First user to register can immediately access admin features
- **Controlled Growth**: Admins manually create users with appropriate roles
- **Security**: Only admin-created users can access the system beyond the initial registration

## Features

### 1. Automatic Admin Assignment
- **All Registered Users**: Anyone who registers through Clerk gets admin role
- **Google & Email Login**: Works with both authentication methods
- **Immediate Access**: No waiting for manual approval

### 2. Manual User Creation
- **Admin Interface**: Admins create users with specific roles (admin/developer/viewer)
- **Role Assignment**: Each new user gets the role assigned by the admin
- **Invitation System**: Option to send invitation emails to new users

### 3. Role Management
- **Role Promotion**: Admins can change user roles anytime
- **User Deactivation**: Ability to deactivate users without deleting them
- **Audit Trail**: Track role changes and user activities

## Setup Process

### Step 1: Environment Variables
Add these variables to your `.env.local` file:

```env
# Clerk Webhook Secret (get this from Clerk Dashboard)
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Supabase Configuration (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 2: Configure Clerk Webhook

1. **Go to Clerk Dashboard**: https://dashboard.clerk.com
2. **Select your application**
3. **Navigate to Webhooks** (in the left sidebar)
4. **Click "Add Endpoint"**
5. **Configure the webhook**:
   - **Endpoint URL**: `https://yourdomain.com/api/webhooks/clerk`
   - **Events to listen for**: 
     - ✅ `user.created`
   - **Click "Create"**
6. **Copy the webhook secret** and add it to your `.env.local` as `CLERK_WEBHOOK_SECRET`

### Step 3: First User Registration

1. **Deploy your application** to your hosting platform
2. **Register the first user** (you) through the login page
3. **Access admin interface** at `/admin`
4. **Start creating users** with appropriate roles

## Usage Workflow

### Initial Setup
1. **You register** → Automatically get admin role
2. **Access admin panel** → Full system access
3. **Create team members** → Assign appropriate roles
4. **Configure system** → Set up API keys, billing, etc.

### Ongoing Management
1. **Team members request access** → Contact existing admin
2. **Admin creates user account** → Assigns appropriate role
3. **User receives invitation** → Can log in with assigned permissions
4. **Role changes as needed** → Admin can promote/demote users

## Role Hierarchy
- **Admin**: Full access, can create/manage users, system configuration
- **Developer**: API access, can create/manage API keys
- **Viewer**: Read-only access to basic features

## Security Considerations

### Pros of This Approach
- **Simple setup**: No complex configuration needed
- **Quick start**: Immediate access for the first user
- **Controlled access**: Only admin-created users can access the system
- **Flexible**: Easy to change approach later if needed

### Security Notes
- **First user is critical**: Make sure YOU register first
- **Monitor registrations**: Check who registers during initial period
- **Regular audits**: Review user list and roles regularly
- **Webhook security**: Always verify webhook signatures

### Future Restrictions (Optional)
If you want to restrict automatic admin assignment later:

1. **Edit `/src/lib/auth-config.ts`**:
```typescript
export function determineUserRole(email: string): 'admin' | 'developer' | 'viewer' {
  // Change this to 'viewer' to stop auto-admin assignment
  return 'viewer';
}
```

2. **Manually promote users** through the admin interface
3. **Use invitation system** for controlled user creation

## Troubleshooting

### "No Admin Access" Error
1. Check if you're logged in with the same account that registered first
2. Verify webhook is working (check Clerk dashboard logs)
3. Check Supabase users table to confirm your role

### Webhook Not Working
1. Verify `CLERK_WEBHOOK_SECRET` is correctly set
2. Check webhook URL is accessible from internet
3. Verify SSL certificate is valid
4. Check Clerk dashboard for webhook delivery logs

### Database Issues
1. Verify Supabase service role key has correct permissions
2. Check database schema is up to date
3. Verify user was created in Supabase users table