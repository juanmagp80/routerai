'use client';

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your RouterAI account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Get started with RouterAI
                    </p>
                </div>
                <SignUp
                    appearance={{
                        elements: {
                            formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-sm normal-case"
                        }
                    }}
                />
            </div>
        </div>
    );
}