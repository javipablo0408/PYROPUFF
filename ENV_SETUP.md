# Configuración de Variables de Entorno

## ✅ Credenciales de Supabase Configuradas

Las credenciales de Supabase ya están listas. Para configurarlas:

### Opción 1: Usar el script automático

```bash
./setup-env.sh
```

### Opción 2: Crear manualmente el archivo .env

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://gmmxtbnomamtcecywapf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtbXh0Ym5vbWFtdGNlY3l3YXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNzQ1NTgsImV4cCI6MjA3Nzg1MDU1OH0.wLQ9MV-FvQglxkjIQwDt28UzlMnqF0gznh52u4axWWg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtbXh0Ym5vbWFtdGNlY3l3YXBmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI3NDU1OCwiZXhwIjoyMDc3ODUwNTU4fQ.XnX2sFNzHHlNtG_zfV_mOaTC9aIZFxig7pyN45QnZb4

# Stripe Configuration (Completar con tus credenciales)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Next.js Configuration
NEXT_TELEMETRY_DISABLED=1
```

## 📋 Información de Conexión

### Supabase
- **URL**: `https://gmmxtbnomamtcecywapf.supabase.co`
- **Host de Base de Datos**: `db.gmmxtbnomamtcecywapf.supabase.co`
- **Puerto**: `5432`
- **Base de Datos**: `postgres`
- **Usuario**: `postgres`

### PostgreSQL Connection String
```
postgresql://postgres:[YOUR_PASSWORD]@db.gmmxtbnomamtcecywapf.supabase.co:5432/postgres
```

**Nota**: Reemplaza `[YOUR_PASSWORD]` con tu contraseña de PostgreSQL de Supabase.

## 🔑 Credenciales de Stripe

Para obtener las credenciales de Stripe:

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com)
2. Navega a **Developers** > **API keys**
3. Copia las claves:
   - **Publishable key** (empieza con `pk_`)
   - **Secret key** (empieza con `sk_`)
4. Para el webhook secret:
   - Ve a **Developers** > **Webhooks**
   - Crea un endpoint webhook apuntando a: `https://tu-dominio.com/api/checkout/webhook`
   - Copia el **Signing secret** (empieza con `whsec_`)

## ✅ Verificación

Una vez configurado el `.env`, puedes verificar que todo esté correcto:

```bash
# Verificar que el archivo existe
ls -la .env

# Verificar que las variables están configuradas (sin mostrar valores sensibles)
grep -E "^[A-Z]" .env | cut -d'=' -f1
```

## 🚀 Próximos Pasos

1. ✅ Ejecuta `./setup-env.sh` o crea el `.env` manualmente
2. ⏳ Completa las credenciales de Stripe cuando las tengas
3. 🗄️ Configura las tablas en Supabase según `DATABASE_SCHEMA.md`
4. 🖼️ Crea el bucket `products` en Supabase Storage
5. ▶️ Ejecuta `npm run dev` o `docker-compose up -d`


