'use client';

import { AuthLogo } from '@/components/auth/AuthLogo';
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <AuthLogo size={80} className="mb-6" />
                    <div className="flex items-center justify-center space-x-2 mb-4">
                        <h1 className="text-2xl font-bold text-slate-900">Roulyx</h1>
                    </div>
                    <h2 className="text-xl font-semibold text-slate-800">
                        Get started today
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Create your account and start routing AI requests intelligently
                    </p>
                </div>

                <SignUp
                    appearance={{
                        elements: {
                            footerAction: "hidden",
                            footerActionText: "hidden",
                            footerActionLink: "hidden",
                            footer: "hidden"
                        }
                    }}
                />
            </div>
        </div>
    );
}