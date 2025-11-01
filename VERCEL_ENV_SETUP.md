# 🔧 VARIABLES DE ENTORNO PARA VERCEL

## Variables REQUERIDAS para el demo:

```bash
# Clerk Authentication (REQUERIDO)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_tu_clave_aqui
CLERK_SECRET_KEY=sk_test_tu_clave_aqui

# Supabase Database (REQUERIDO)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# Stripe Test Mode (REQUERIDO - SOLO TEST MODE)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_test_aqui
STRIPE_SECRET_KEY=sk_test_tu_clave_test_aqui

# AI Provider Keys (REQUERIDO - con límites configurados)
OPENAI_API_KEY=sk-proj-tu_clave_aqui
ANTHROPIC_API_KEY=sk-ant-api-tu_clave_aqui
GEMINI_API_KEY=AIzaSytu_clave_aqui
GROK_API_KEY=xai-tu_clave_aqui

# App URL (REQUERIDO)
NEXT_PUBLIC_APP_URL=https://tu-app.vercel.app
```

## Variables OPCIONALES para funcionalidad completa:

```bash
# Email Service (Opcional - para notificaciones por email)
RESEND_API_KEY=re_tu_clave_aqui

# Webhooks de Clerk (Opcional - para sincronización automática)
CLERK_WEBHOOK_SECRET=whsec_tu_webhook_secret_aqui

# Demo Mode (Opcional - por defecto true en producción)
DEMO_MODE=true
```

## 🚀 Cómo configurar en Vercel:

1. **Ve a tu proyecto en Vercel Dashboard**
2. **Settings → Environment Variables**
3. **Agrega TODAS las variables requeridas**
4. **Re-deploy el proyecto**

## ⚠️ IMPORTANTE:

- **NUNCA uses claves de producción** - solo test mode
- **Las claves AI tienen límites configurados** - completamente seguro
- **Sin RESEND_API_KEY el demo funciona pero sin emails**
- **Stripe está en test mode** - cero riesgo financiero

## 🧪 Para verificar configuración:

```bash
node scripts/verify-demo-mode.js
```