# Docker Setup - Pyro Puff

Esta guía explica cómo construir y ejecutar la aplicación Pyro Puff usando Docker y pnpm.

## 📋 Requisitos Previos

- Docker instalado (versión 20.10 o superior)
- Docker Compose instalado (versión 2.0 o superior)
- Archivo `.env` configurado con las variables de entorno necesarias

## 🚀 Inicio Rápido

### 1. Configurar Variables de Entorno

Copia el archivo `.env.example` a `.env` y completa las variables:

```bash
cp .env.example .env
# O ejecuta el script automático
./setup-env.sh
```

Edita el archivo `.env` y agrega tus credenciales:
- Supabase URL y keys (ya configuradas)
- Stripe keys (cuando las tengas)
- URL de la aplicación

### 2. Construir y Ejecutar con Docker Compose

```bash
# Construir y ejecutar en un solo comando
docker-compose up -d --build
```

O usando los scripts de npm/pnpm:

```bash
# Si tienes pnpm instalado localmente
pnpm docker:build
pnpm docker:up
```

La aplicación estará disponible en `http://localhost:3000`

### 3. Ver Logs

```bash
docker-compose logs -f app
# O con el script
pnpm docker:logs
```

### 4. Detener la Aplicación

```bash
docker-compose down
# O con el script
pnpm docker:down
```

## 🐳 Comandos Docker Útiles

### Usando pnpm scripts (recomendado)

```bash
# Construir imagen
pnpm docker:build

# Iniciar contenedores
pnpm docker:up

# Detener contenedores
pnpm docker:down

# Ver logs
pnpm docker:logs

# Reiniciar
pnpm docker:restart
```

### Comandos Docker directos

```bash
# Construir sin cache
docker build --no-cache -t pyro-puff .

# Ejecutar contenedor individual
docker run -p 3000:3000 --env-file .env pyro-puff

# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar el contenedor
docker-compose restart

# Reconstruir y reiniciar
docker-compose up -d --build

# Ejecutar comandos dentro del contenedor
docker-compose exec app sh
```

### Instalar dependencias localmente (si es necesario)

Si quieres trabajar localmente con pnpm:

```bash
# Instalar pnpm globalmente (si no lo tienes)
npm install -g pnpm

# O usando corepack (recomendado)
corepack enable
corepack prepare pnpm@latest --activate

# Instalar dependencias
pnpm install

# Ejecutar en desarrollo
pnpm dev
```

## 📦 Optimizaciones del Dockerfile

El Dockerfile utiliza multi-stage build para optimizar el tamaño de la imagen:

1. **Stage `deps`**: Instala solo las dependencias usando pnpm
2. **Stage `builder`**: Construye la aplicación Next.js con pnpm
3. **Stage `runner`**: Imagen de producción mínima con solo los archivos necesarios

### Características de pnpm

- **Más rápido**: pnpm es más rápido que npm/yarn
- **Menos espacio**: Usa hard links para ahorrar espacio en disco
- **Mejor manejo de dependencias**: Evita duplicados y problemas de peer dependencies
- **Lockfile**: Usa `pnpm-lock.yaml` para builds reproducibles

## 🔧 Configuración de Producción

Para producción, asegúrate de:

1. Configurar `NEXT_PUBLIC_APP_URL` con la URL real de tu dominio
2. Configurar las variables de entorno de producción
3. Habilitar HTTPS
4. Configurar el webhook de Stripe con la URL correcta

### Ejemplo de .env para Producción

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## 🚢 Deploy en Producción

### Opción 1: Docker Compose en Servidor

1. Copia los archivos al servidor
2. Configura el `.env` de producción
3. Ejecuta `docker-compose up -d`

### Opción 2: Usar un Servicio de Container Registry

1. Construye la imagen: `docker build -t your-registry/pyro-puff:latest .`
2. Sube la imagen: `docker push your-registry/pyro-puff:latest`
3. Despliega en tu servicio (AWS ECS, Google Cloud Run, etc.)

### Opción 3: Vercel (Recomendado)

Vercel no requiere Docker. Simplemente conecta tu repositorio y despliega directamente.

## 🔍 Troubleshooting

### Error: Cannot find module

Si encuentras errores de módulos no encontrados, asegúrate de que el build se completó correctamente:

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Error: Puerto en uso

Si el puerto 3000 ya está en uso, cambia el puerto en `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Cambia 3001 por el puerto que prefieras
```

### Error: Variables de entorno no encontradas

Asegúrate de que el archivo `.env` existe y contiene todas las variables necesarias. Verifica que no haya espacios extras o caracteres especiales.

## 📝 Notas

- La imagen de producción usa `standalone` output de Next.js para reducir el tamaño
- El usuario `nextjs` se ejecuta sin privilegios root por seguridad
- Los healthchecks están configurados para monitorear el estado del contenedor

