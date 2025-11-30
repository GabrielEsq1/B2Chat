# 🚀 Deploy Checklist - B2BChat

## ✅ Pre-Deploy Verification

### 1. Variables de Entorno en Vercel
Asegúrate de configurar estas variables en [Vercel Dashboard](https://vercel.com/dashboard):

```env
# Database
DATABASE_URL=your_production_postgres_url

# NextAuth
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# Google Maps (ya tienes la clave)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyA9by6HW1I0BPU_oNNDGueeYrnHHghmVRI

# WhatsApp (opcional, configurar después)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=

# APIs de Empresas (opcional, configurar después)
YELP_API_KEY=
GITHUB_TOKEN=
OPENCORPORATES_API_KEY=
COMPANIES_HOUSE_API_KEY=
```

### 2. Build Test
```bash
npm run build
```

### 3. Git Commit & Push
```bash
git add .
git commit -m "feat: WhatsApp integration + 5 company APIs"
git push origin main
```

### 4. Deploy a Vercel
```bash
# Si ya tienes Vercel CLI instalado:
vercel --prod

# O deploy automático al hacer push (si está conectado al repo)
```

---

## 📋 Post-Deploy Tasks

### 1. Configurar Database en Producción
- Ve a tu proveedor de PostgreSQL (Railway, Supabase, etc.)
- Copia la `DATABASE_URL`
- Pégala en Vercel Environment Variables
- Redeploy

### 2. Ejecutar Migraciones
```bash
# Opción A: Desde Vercel CLI
vercel env pull
npx prisma db push

# Opción B: Usar el endpoint /api/setup/seed
# Visita: https://your-app.vercel.app/api/setup/seed
```

### 3. Configurar Webhook de WhatsApp
- Ve a [Twilio Console](https://console.twilio.com/)
- Configura webhook: `https://your-app.vercel.app/api/whatsapp/webhook`
- Método: POST

### 4. Verificar Funcionalidades
- [ ] Login funciona
- [ ] Chat funciona
- [ ] Búsqueda de empresas (Google Places)
- [ ] Admin panel accesible
- [ ] Anuncios se muestran

---

## 🐛 Troubleshooting

**Error: "DATABASE_URL not set"**
→ Configura la variable en Vercel y redeploy

**Error: "Internal Server Error"**
→ Revisa los logs: `vercel logs --project=your-project`

**WhatsApp no funciona**
→ Normal, configura las credenciales de Twilio primero

**APIs de empresas devuelven vacío**
→ Normal, configura las API keys después

---

## ✅ Deployment Complete!

Tu app estará en: `https://your-project.vercel.app`

**Siguiente paso**: Configura las variables de entorno en Vercel para activar todas las funcionalidades.
