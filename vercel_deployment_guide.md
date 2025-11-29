# Guía Rápida: Despliegue en Vercel (Método Web)

## ⚠️ Situación Actual
- Código listo en: `D:\B2BChat`
- Repositorio GitHub: `https://github.com/GabrielEsq1/B2Chat.git`
- Push rechazado (posible conflicto o permisos)

## ✅ Solución Recomendada: Despliegue Directo desde Local

### Paso 1: Limpiar y Preparar
```powershell
cd D:\B2BChat
git remote remove origin
```

### Paso 2: Crear Nuevo Repositorio en GitHub
1. Ve a https://github.com/new
2. Nombre: `B2BChat` (o el que prefieras)
3. **IMPORTANTE**: Marca "Private" si quieres que sea privado
4. **NO** marques "Add README" ni ningún archivo inicial
5. Click "Create repository"

### Paso 3: Subir Código
Copia los comandos que GitHub te muestra (algo como):
```powershell
cd D:\B2BChat
git remote add origin https://github.com/TU_USUARIO/B2BChat.git
git branch -M main
git push -u origin main
```

Si pide autenticación:
- Usuario: Tu username de GitHub
- Contraseña: **Personal Access Token** (no tu contraseña normal)
  - Créalo en: https://github.com/settings/tokens
  - Permisos: `repo` (completo)

### Paso 4: Conectar con Vercel
1. Ve a https://vercel.com/new
2. Click "Import Git Repository"
3. Busca y selecciona tu repositorio `B2BChat`
4. Click "Import"

### Paso 5: Configurar Variables de Entorno
En Vercel, antes de Deploy, agrega estas variables:

```
DATABASE_URL=file:./prisma/dev.db
NEXTAUTH_SECRET=tu-secret-super-largo-y-aleatorio-aqui
NEXTAUTH_URL=https://tu-proyecto.vercel.app
```

**Generar NEXTAUTH_SECRET**:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Paso 6: Deploy
1. Click "Deploy"
2. Espera 2-3 minutos
3. Vercel te dará la URL final (ej: `https://b2bchat-xyz.vercel.app`)

### Paso 7: Verificar
1. Abre la URL de Vercel
2. Deberías ver la página de login
3. Prueba con: `juan@example.com` / `usuario123`

## 🔧 Troubleshooting

**Error: "Push rejected"**
- Elimina el repo de GitHub y créalo de nuevo vacío
- Asegúrate de usar un Personal Access Token, no tu contraseña

**Error 500 en Vercel**
- Verifica las variables de entorno
- Revisa los logs en Vercel Dashboard

**404 en Vercel**
- El despliegue no se completó
- Revisa "Deployments" en tu proyecto de Vercel

## 📝 Notas Importantes
- SQLite (`file:./prisma/dev.db`) funciona en Vercel pero **no es recomendado para producción**
- Para producción real, usa PostgreSQL (ej: Supabase, Neon, Railway)
- Los usuarios de prueba ya están en la base de datos local
