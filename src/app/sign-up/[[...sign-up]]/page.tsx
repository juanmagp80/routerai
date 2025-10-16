'use client';

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your Roulix account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Get started with Roulix
                    </p>
                </div>
                <SignUp
                    appearance={{
                        elements: {
                            formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-sm normal-case font-medium rounded-md px-4 py-2 transition-colors",
                            formFieldLabel: "text-sm font-medium text-gray-700 mb-1",
                            formFieldInput: "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm",
                            footerAction: "hidden",
                            footerActionText: "hidden",
                            footerActionLink: "hidden",
                            footer: "hidden",
                            dividerLine: "bg-gray-300",
                            dividerText: "text-gray-500 text-sm",
                            socialButtonsBlockButton: "border border-gray-300 hover:bg-gray-50 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                            headerTitle: "text-2xl font-bold text-gray-900 mb-2",
                            headerSubtitle: "text-sm text-gray-600",
                            card: "shadow-lg border border-gray-200 rounded-lg bg-white",
                            cardBox: "p-8"
                        },
                        variables: {
                            colorPrimary: "#2563eb"
                        },
                        layout: {
                            socialButtonsPlacement: "top",
                            showOptionalFields: false
                        }
                    }}
                />
            </div>
        </div>
    );
}