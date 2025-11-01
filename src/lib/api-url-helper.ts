/**
 * Utility to get the correct base URL for API examples and curl commands
 */
export function getApiBaseUrl(): string {
  // En el navegador, usar la URL actual
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // En el servidor, usar variables de entorno con fallbacks apropiados
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Para desarrollo local
  return 'http://localhost:3000';
}

/**
 * Generate a complete API URL for documentation and examples
 */
export function getApiUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
}

/**
 * Generate a curl command for API documentation
 */
export function generateCurlCommand(
  method: string = 'POST',
  endpoint: string,
  data?: any,
  apiKey?: string
): string {
  const url = getApiUrl(endpoint);
  const headers = [
    '"Content-Type: application/json"',
    apiKey ? `"Authorization: Bearer ${apiKey}"` : '"Authorization: Bearer YOUR_API_KEY"'
  ];
  
  let command = `curl -X ${method} "${url}"`;
  
  headers.forEach(header => {
    command += ` \\\n  -H ${header}`;
  });
  
  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    command += ` \\\n  -d '${JSON.stringify(data, null, 2)}'`;
  }
  
  return command;
}