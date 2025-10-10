import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  '/dashboard(.*)',
  '/api/protected(.*)'
])

const isWebhookRoute = createRouteMatcher([
  '/webhook(.*)',
  '/api/stripe/webhook(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  // Skip auth for webhook routes
  if (isWebhookRoute(req)) {
    return
  }
  
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}