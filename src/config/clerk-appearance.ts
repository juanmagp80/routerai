export const clerkAppearance = {
    elements: {
        // Primary buttons
        formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-sm normal-case font-medium rounded-md px-4 py-2 transition-colors",

        // Form elements
        formFieldLabel: "text-sm font-medium text-gray-700 mb-1",
        formFieldInput: "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm",

        // Hide footer and branding elements
        footerAction: "hidden",
        footerActionText: "hidden",
        footerActionLink: "hidden",
        footer: "hidden",

        // Dividers
        dividerLine: "bg-gray-300",
        dividerText: "text-gray-500 text-sm",

        // Social buttons
        socialButtonsBlockButton: "border border-gray-300 hover:bg-gray-50 rounded-md px-4 py-2 text-sm font-medium transition-colors",
        socialButtonsBlockButtonText: "text-gray-700",

        // Headers
        headerTitle: "text-2xl font-bold text-gray-900 mb-2",
        headerSubtitle: "text-sm text-gray-600",

        // Card styling
        card: "shadow-lg border border-gray-200 rounded-lg bg-white",
        cardBox: "p-8",

        // Additional elements to hide
        main: "space-y-6",
        rootBox: "w-full max-w-md"
    },
    variables: {
        colorPrimary: "#2563eb",
        colorBackground: "#ffffff",
        colorText: "#374151",
        colorTextSecondary: "#6b7280",
        colorDanger: "#dc2626",
        colorSuccess: "#059669",
        colorWarning: "#d97706",
        colorTextOnPrimaryBackground: "#ffffff",
        borderRadius: "0.375rem",
        fontFamily: '"Inter", system-ui, sans-serif',
        fontSize: "14px"
    },
    layout: {
        socialButtonsPlacement: "top" as const,
        showOptionalFields: false
    }
};