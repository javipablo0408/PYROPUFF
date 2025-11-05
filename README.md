# Pyro Puff - E-commerce Platform

Aplicación completa de e-commerce para Pyro Puff construida con Next.js 15, TypeScript, TailwindCSS y Supabase.

## 🚀 Características

- **Framework**: Next.js 15 con App Router
- **Lenguaje**: TypeScript
- **Estilos**: TailwindCSS
- **Backend**: Supabase (Auth + Storage + Database)
- **Pagos**: Stripe Checkout
- **Deploy**: Optimizado para Vercel

## 📋 Requisitos Previos

- Docker instalado (versión 20.10 o superior)
- Docker Compose instalado (versión 2.0 o superior)
- Cuenta de Supabase
- Cuenta de Stripe (para pagos)
- Variables de entorno configuradas

> **Nota**: Esta aplicación está configurada para ejecutarse con Docker y pnpm. No se requiere Node.js instalado localmente.

## 🛠️ Instalación

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd kevin
```

### 2. Configurar Variables de Entorno

```bash
# Opción 1: Usar el script automático (ya tiene credenciales de Supabase)
./setup-env.sh

# Opción 2: Crear manualmente
cp .env.example .env
# Edita .env con tus credenciales
```

**Credenciales ya configuradas:**
- ✅ Supabase URL y keys (ya configuradas en el script)

**Pendiente de configurar:**
- ⏳ Stripe keys (cuando las tengas)

### 3. Construir y Ejecutar con Docker

```bash
# Opción 1: Construir y ejecutar en un solo comando
docker-compose up -d --build

# Opción 2: Por pasos
docker-compose build
docker-compose up -d
```

### 4. Verificar que la Aplicación Está Corriendo

```bash
# Ver logs
docker-compose logs -f app

# O verificar el health check
curl http://localhost:3000/api/health
```

### 5. Acceder a la Aplicación

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🐳 Comandos Docker Útiles

```bash
# Ver logs en tiempo real
docker-compose logs -f app

# Detener la aplicación
docker-compose down

# Reiniciar
docker-compose restart

# Reconstruir después de cambios
docker-compose up -d --build

# Ejecutar comandos dentro del contenedor
docker-compose exec app sh
```

Para más detalles sobre Docker, consulta [DOCKER.md](./DOCKER.md).

## 💻 Desarrollo Local (Opcional)

Si quieres trabajar localmente sin Docker:

```bash
# Instalar pnpm (si no lo tienes)
npm install -g pnpm
# O usando corepack
corepack enable && corepack prepare pnpm@latest --activate

# Instalar dependencias
pnpm install

# Ejecutar en desarrollo
pnpm dev
```

## 📁 Estructura del Proyecto

```
/app
  ├── (public)
  │   ├── page.tsx              # Home
  │   ├── shop/                 # Tienda
  │   ├── product/[slug]/       # Detalle de producto
  │   ├── cart/                 # Carrito
  │   ├── checkout/             # Checkout
  │   ├── account/              # Cuenta de usuario
  │   ├── admin/                # Panel de administración
  │   ├── login/                # Login
  │   └── register/             # Registro
  ├── components/
  │   ├── layout/               # Navbar, Footer
  │   ├── home/                 # Componentes de la home
  │   ├── products/             # ProductCard, PriceDisplay, etc.
  │   ├── cart/                 # CartDrawer
  │   ├── checkout/             # CheckoutForm
  │   ├── admin/                # AdminDashboard, AdminTable
  │   └── auth/                 # AuthGuard
  └── lib/
      ├── supabaseClient.ts     # Cliente Supabase para cliente
      ├── supabaseServer.ts     # Cliente Supabase para servidor
      ├── auth.ts               # Utilidades de autenticación
      ├── pricing.ts            # Gestión de precios
      ├── getProducts.ts        # Obtención de productos
      └── cart.ts               # Funciones del carrito
```

## 🎨 Paleta de Colores

- **Negro**: `#000000` (pyro-black)
- **Dorado**: `#E6B422` (pyro-gold)
- **Gris claro**: `#F5F5F5` (pyro-gray)
- **Blanco**: `#FFFFFF` (pyro-white)

## 🔐 Autenticación

La aplicación utiliza Supabase Auth para:
- Registro de usuarios
- Inicio de sesión
- Recuperación de contraseña
- Gestión de roles (customer, wholesaler, admin)

## 🛒 Carrito de Compras

El carrito funciona tanto para usuarios autenticados como invitados:
- Usuarios autenticados: se guarda en la base de datos con `user_id`
- Invitados: se guarda con `guest_token` en localStorage

## 💳 Pagos

Integración con Stripe Checkout:
- Los pagos se procesan a través de Stripe
- Se crean registros en `transactions` después del pago
- Se actualiza el estado de las órdenes

## 📦 Gestión de Productos

- Precios dinámicos según el rol del usuario
- Gestión de stock
- Categorías y subcategorías
- Imágenes desde Supabase Storage

## 👨‍💼 Panel de Administración

El panel de administración (`/admin`) permite:
- Ver estadísticas (productos, pedidos, clientes, ingresos)
- Gestionar productos (CRUD)
- Gestionar cupones
- Ver facturas
- Ver pedidos

## 🚢 Deploy en Vercel

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en el dashboard de Vercel
3. Deploy automático en cada push a la rama principal

## 📝 Notas Importantes

- Asegúrate de configurar las políticas RLS en Supabase
- Configura el bucket de Storage en Supabase para las imágenes de productos
- Verifica que las tablas de la base de datos coincidan con el esquema proporcionado
- Configura los webhooks de Stripe si es necesario

## 🔧 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter

## 📄 Licencia

Este proyecto es privado y está destinado para uso exclusivo de Pyro Puff.

