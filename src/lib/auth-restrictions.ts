import { auth, currentUser } from '@clerk/nextjs/server';

const AUTHORIZED_ADMIN_EMAIL = 'agentroutermcp@gmail.com';

export async function isAuthorizedForSaasData(): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (!userId) return false;

    const user = await currentUser();
    if (!user) return false;

    // Check if user's primary email matches the authorized admin email
    const primaryEmail = user.emailAddresses.find(email => email.id === user.primaryEmailAddressId);
    
    return primaryEmail?.emailAddress === AUTHORIZED_ADMIN_EMAIL;
  } catch (error) {
    console.error('Error checking admin authorization:', error);
    return false;
  }
}

export async function requireSaasDataAccess() {
  const isAuthorized = await isAuthorizedForSaasData();
  
  if (!isAuthorized) {
    throw new Error('Access denied: This section is restricted to authorized administrators only.');
  }
  
  return true;
}