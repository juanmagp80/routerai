// Alias para el webhook de Stripe - redirige a la ubicación correcta
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  // Obtener la URL base
  const baseUrl = request.nextUrl.origin
  
  // Redirigir al endpoint correcto
  const correctUrl = `${baseUrl}/api/stripe/webhook`
  
  // Hacer la petición al endpoint correcto manteniendo todos los headers
  const headers = new Headers()
  request.headers.forEach((value, key) => {
    headers.set(key, value)
  })
  
  const body = await request.text()
  
  const response = await fetch(correctUrl, {
    method: 'POST',
    headers: headers,
    body: body
  })
  
  // Devolver la respuesta tal como la recibimos
  const responseText = await response.text()
  
  return new Response(responseText, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  })
}