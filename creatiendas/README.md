# Creatiendas - Constructor de Tiendas WhatsApp

Aplicación SaaS para crear tiendas online optimizadas para WhatsApp.

## 🚀 Quick Start (Local)

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Edita .env.local con tus valores

# Ejecutar migraciones
npx prisma migrate dev

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 📦 Deployment a Vercel

**Guía completa:** Ver `deployment_guide.md` en la carpeta de artifacts

### Pasos Rápidos:

1. **Push a GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Importar en Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Importa tu repositorio
   - Configura Vercel Postgres
   - Agrega variables de entorno

3. **Ejecutar migraciones:**
   ```bash
   vercel env pull
   npx prisma migrate deploy
   ```

## 🛠 Stack Tecnológico

- **Framework:** Next.js 14 (App Router)
- **Autenticación:** NextAuth v4
- **Base de Datos:** PostgreSQL (Vercel Postgres)
- **ORM:** Prisma
- **Pagos:** Stripe
- **Deployment:** Vercel

## 📝 Variables de Entorno

Ver `.env.example` para la lista completa de variables requeridas.

### Esenciales:
- `DATABASE_URL` - URL de PostgreSQL
- `NEXTAUTH_URL` - URL de tu aplicación
- `NEXTAUTH_SECRET` - Secret para NextAuth
- `STRIPE_SECRET_KEY` - (Opcional) Clave de Stripe
- `STRIPE_WEBHOOK_SECRET` - (Opcional) Secret del webhook

## 🔐 Credenciales de Prueba (Local)

```
Email: test@example.com
Password: finalpass123
```

## 📚 Documentación

- **Deployment Guide:** `deployment_guide.md`
- **Walkthrough:** `walkthrough.md`
- **API Routes:** Ver carpeta `app/api/`

## 🎯 Características

- ✅ Autenticación completa (registro, login, recuperación de contraseña)
- ✅ Constructor visual de tiendas
- ✅ Preview en tiempo real (desktop/mobile)
- ✅ Gestión de productos con categorías
- ✅ Integración con Stripe para pagos
- ✅ Dashboard de usuario
- ✅ Tiendas públicas con URLs únicas

## 🤝 Soporte

Para problemas de deployment, consulta la sección de Troubleshooting en `deployment_guide.md`

## 📄 Licencia

Privado - Todos los derechos reservados
