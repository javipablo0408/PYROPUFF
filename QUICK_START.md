# 🚀 Inicio Rápido - Pyro Puff

## Paso 1: Configurar Variables de Entorno

```bash
./setup-env.sh
```

El archivo `.env` ya tiene las credenciales de Supabase configuradas. Solo falta agregar las de Stripe cuando las tengas.

## Paso 2: Construir y Ejecutar con Docker

```bash
docker-compose up -d --build
```

## Paso 3: Verificar que Funciona

```bash
# Ver logs
docker-compose logs -f app

# Verificar health check
curl http://localhost:3000/api/health
```

## Paso 4: Acceder a la Aplicación

Abre tu navegador en: **http://localhost:3000**

## 📋 Comandos Útiles

```bash
# Ver logs
docker-compose logs -f app

# Detener
docker-compose down

# Reiniciar
docker-compose restart

# Reconstruir después de cambios
docker-compose up -d --build
```

## ⚠️ Próximos Pasos

1. ✅ Credenciales de Supabase configuradas
2. ⏳ Agregar credenciales de Stripe al `.env`
3. 🗄️ Configurar tablas en Supabase (ver `DATABASE_SCHEMA.md`)
4. 🖼️ Crear bucket `products` en Supabase Storage

## 🆘 Problemas Comunes

### El puerto 3000 está en uso

```bash
# Cambiar el puerto en docker-compose.yml
ports:
  - "3001:3000"  # Usa 3001 en lugar de 3000
```

### Error al construir

```bash
# Limpiar y reconstruir
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```


