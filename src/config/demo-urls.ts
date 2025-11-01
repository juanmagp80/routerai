/**
 * Demo configuration for consistent URL generation
 */
export const DEMO_CONFIG = {
    // Production demo URL - update this with your actual deployment URL
    DEMO_BASE_URL: 'https://roulyx-demo.vercel.app',

    // Development URL
    DEV_BASE_URL: 'http://localhost:3000',

    // Get appropriate URL based on environment
    getBaseUrl(): string {
        // In browser, always use current origin
        if (typeof window !== 'undefined') {
            return window.location.origin;
        }

        // Server-side: use env var or fallback to demo URL
        return process.env.NEXT_PUBLIC_APP_URL || this.DEMO_BASE_URL;
    },

    // Generate API URL
    getApiUrl(endpoint: string): string {
        const baseUrl = this.getBaseUrl();
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        return `${baseUrl}${cleanEndpoint}`;
    }
} as const;

/**
 * Generate consistent curl commands for documentation
 */
export function generateDemoCurlCommand(
    endpoint: string,
    method: string = 'POST',
    data?: unknown,
    apiKey: string = 'YOUR_API_KEY'
): string {
    const url = DEMO_CONFIG.getApiUrl(endpoint);

    let command = `curl -X ${method} "${url}"`;

    // Add headers
    command += ` \\\n  -H "Content-Type: application/json"`;
    command += ` \\\n  -H "Authorization: Bearer ${apiKey}"`;

    // Add data if provided
    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
        command += ` \\\n  -d '${JSON.stringify(data, null, 2)}'`;
    }

    return command;
}