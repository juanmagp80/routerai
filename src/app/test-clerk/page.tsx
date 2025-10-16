'use client';

import { useAuth, useUser } from '@clerk/nextjs';

export default function TestClerkPage() {
    const { isLoaded: authLoaded, userId } = useAuth();
    const { isLoaded: userLoaded, user } = useUser();

    if (!authLoaded || !userLoaded) {
        return <div className="p-8">Loading Clerk...</div>;
    }

    return (
        <div className="p-8">
            <h1>Clerk Test Page</h1>
            <div>
                <p>Auth loaded: {authLoaded ? 'Yes' : 'No'}</p>
                <p>User loaded: {userLoaded ? 'Yes' : 'No'}</p>
                <p>User ID: {userId || 'Not logged in'}</p>
                <p>User email: {user?.emailAddresses?.[0]?.emailAddress || 'No email'}</p>
            </div>
            <div className="mt-4">
                <p>Clerk Publishable Key: {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'Set' : 'Not set'}</p>
            </div>
        </div>
    );
}