# Configuración de Variables de Entorno para Docker

## Problema

Si la aplicación no se conecta a Supabase en Docker, probablemente las variables de entorno no están configuradas correctamente.

## Solución

### Opción 1: Usar archivo .env (Recomendado)

Asegúrate de que el archivo `.env` existe en el mismo directorio que `docker-compose.yml` con el siguiente contenido:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://gmmxtbnomamtcecywapf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtbXh0Ym5vbWFtdGNlY3l3YXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNzQ1NTgsImV4cCI6MjA3Nzg1MDU1OH0.wLQ9MV-FvQglxkjIQwDt28UzlMnqF0gznh52u4axWWg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtbXh0Ym5vbWFtdGNlY3l3YXBmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI3NDU1OCwiZXhwIjoyMDc3ODUwNTU4fQ.XnX2sFNzHHlNtG_zfV_mOaTC9aIZFxig7pyN45QnZb4

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application Configuration
NEXT_PUBLIC_APP_URL=http://192.168.1.59:8080
PORT=8080
```

### Opción 2: Configurar variables en la plataforma de deployment

Si estás usando una plataforma de deployment (Railway, Render, Fly.io, etc.), configura las variables de entorno directamente en el panel de control de la plataforma:

1. **NEXT_PUBLIC_SUPABASE_URL**: `https://gmmxtbnomamtcecywapf.supabase.co`
2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtbXh0Ym5vbWFtdGNlY3l3YXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNzQ1NTgsImV4cCI6MjA3Nzg1MDU1OH0.wLQ9MV-FvQglxkjIQwDt28UzlMnqF0gznh52u4axWWg`
3. **SUPABASE_SERVICE_ROLE_KEY**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtbXh0Ym5vbWFtdGNlY3l3YXBmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI3NDU1OCwiZXhwIjoyMDc3ODUwNTU4fQ.XnX2sFNzHHlNtG_zfV_mOaTC9aIZFxig7pyN45QnZb4`
4. **NEXT_PUBLIC_APP_URL**: `http://192.168.1.59:8080` (o la URL de tu deployment)
5. **PORT**: `8080`

### Verificación

Para verificar que las variables están disponibles, puedes ejecutar:

```bash
docker-compose config
```

Esto mostrará la configuración completa con las variables resueltas.

## Nota Importante

Las variables que empiezan con `NEXT_PUBLIC_` deben estar disponibles durante el **build time** (cuando se construye la imagen Docker) porque Next.js las incorpora en el bundle del cliente.

Las otras variables (como `SUPABASE_SERVICE_ROLE_KEY`) solo necesitan estar disponibles en **runtime** (cuando el contenedor está corriendo).

