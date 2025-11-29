# 🧪 Test Users - B2BChat Database

This document contains credentials and information for all test users created by the seed script.

## 🔑 Universal Password

**All test users have the same password for easy testing:**
```
Password: test123
```

---

## 👑 Admin Users (5 Total)

### Super Administrators (Full System Access)

| Name | Email | Phone | Role |
|------|-------|-------|------|
| Super Admin Principal | superadmin@b2bchat.com | +573100000001 | SUPERADMIN |
| Super Admin Secundario | superadmin2@b2bchat.com | +573100000002 | SUPERADMIN |

### Company Administrators (Campaign Management)

| Name | Email | Phone | Role |
|------|-------|-------|------|
| Admin Empresa Uno | admin1@b2bchat.com | +573100000003 | ADMIN_EMPRESA |
| Admin Empresa Dos | admin2@b2bchat.com | +573100000004 | ADMIN_EMPRESA |
| Admin Empresa Tres | admin3@b2bchat.com | +573100000005 | ADMIN_EMPRESA |

### Admin Features to Test
- ✅ Admin Dashboard
- ✅ Campaign Management (Create, Edit, Delete)
- ✅ Ad Creative Management
- ✅ User Management
- ✅ Analytics and Reports
- ✅ System Configuration

---

## 🤖 AI Bot Users (50 Total)

### Bot Personality Types

| Personality | Count | Example Name | Description |
|-------------|-------|--------------|-------------|
| BUSINESS_ADVISOR | 5 | Asesora de Negocios 🎯 | Estrategias y análisis de mercado |
| NEWS_BOT | 5 | Noticias B2B 📰 | Tendencias y noticias de industria |
| TASK_ASSISTANT | 5 | Asistente Virtual ✅ | Tareas y organización |
| INDUSTRY_EXPERT | 5 | Experto Industrial 📊 | Análisis de sectores |
| SALES_COACH | 5 | Coach de Ventas 💼 | Habilidades de venta B2B |
| TECH_SUPPORT | 5 | Soporte Técnico 🔧 | Ayuda técnica y software |
| HR_ASSISTANT | 5 | Asistente de RRHH 👥 | Gestión de talento |
| NETWORKING_COACH | 5 | Coach de Networking 🤝 | Conexiones empresariales |
| FINANCE_ADVISOR | 5 | Asesor Financiero 💰 | Gestión financiera |
| MARKETING_GURU | 5 | Gurú de Marketing 📱 | Marketing digital |

### Bot Email Pattern
- **Format**: `bot[1-50]@b2bchat.bot`
- **Example**: `bot1@b2bchat.bot`, `bot25@b2bchat.bot`

### Bot Phone Pattern
- **Format**: `+5731[00000001-00000050]`
- **Example**: `+573100000001`, `+573100000025`

### Bot Testing
- ✅ Start conversations with bots
- ✅ Test different bot personalities
- ✅ Verify bot responses (welcome messages)
- ✅ Check bot profiles show personality type

---

## 👥 Regular Business Users (245 Total)

### User Distribution

#### Industries (20 Categories)
- Tecnología
- Marketing
- Finanzas
- Salud
- Manufactura
- Retail
- Educación
- Consultoría
- Logística
- Telecomunicaciones
- Energía
- Construcción
- Turismo
- Alimentación
- Farmacéutica
- Automotriz
- Textil
- Comercio
- Servicios
- TI

#### Positions (23 Roles)
- CEO, CTO, CFO, COO, CMO
- Gerente General
- Director de Operaciones
- Director de Marketing
- Director de Ventas
- Director de RRHH
- Gerente de Proyecto
- Gerente de Producto
- Gerente de TI
- Consultor Senior
- Analista de Negocios
- Desarrollador Senior
- Diseñador UX
- Especialista en Marketing
- Contador
- Abogado Corporativo
- Ingeniero
- Arquitecto de Soluciones
- Product Manager

### Sample Regular Users

Here are 10 example users you can use for testing:

| Name | Email | Phone | Industry | Position |
|------|-------|-------|----------|----------|
| User 1 | [Generated] | +573000000100 | [Random] | [Random] |
| User 2 | [Generated] | +573000000101 | [Random] | [Random] |
| ... | ... | ... | ... | ... |

> **Note**: All 245 users have unique Spanish/Latin American names, emails following pattern `[name][number]@empresa.co`, and phones starting at `+573000000100`

### Regular User Email Pattern
- **Format**: `[firstname].[lastname][number]@empresa.co`
- **Example**: `carlos.garcia1@empresa.co`, `maria.lopez15@empresa.co`

### Regular User Phone Pattern
- **Format**: `+5730000001[00-44]`
- **Range**: `+573000000100` to `+573000000344`

---

## 💬 Test Data Created

### Conversations (100 Total)
- Random users paired with random bots
- Each conversation has a welcome message from the bot
- Test real-time messaging, read receipts, notifications

### Friend Requests (80 Total)
- **50 ACCEPTED** - Users already connected
- **30 PENDING** - Awaiting acceptance
- Test friend request flow, accept/reject functionality

### Groups (10 Total)

| Group Name | Description |
|------------|-------------|
| Emprendedores Tech | Grupo profesional para emprendedores tecnológicos |
| Marketing Digital Colombia | Profesionales de marketing digital |
| CEOs y Directores | Líderes empresariales |
| Fintech Innovadores | Innovación en servicios financieros |
| Retail y Comercio | Sector retail y comercio |
| Manufactura y Logística | Industria manufacturera y logística |
| Consultores B2B | Consultores de negocios |
| Startups Latam | Startups latinoamericanas |
| Inteligencia Artificial | IA y tecnología |
| Transformación Digital | Transformación empresarial |

- Each group has 5-15 members
- Group creator is admin
- Test group chat, member management, group settings

---

## 🧪 Testing Scenarios

### 1. Admin Flow Testing
```
1. Login as: superadmin@b2bchat.com / test123
2. Access admin dashboard
3. Create new ad campaign
4. Upload creative assets
5. Set budget and targeting
6. Launch campaign
7. View campaign analytics
```

### 2. Regular User Flow Testing
```
1. Login as any regular user
2. View contacts list (should show other users)
3. View existing conversations (should have bot conversations)
4. Start new chat with another user
5. Send messages
6. Join a group
7. Edit profile
```

### 3. Bot Interaction Testing
```
1. Login as regular user
2. Find AI bot in contacts
3. Start conversation
4. Verify bot personality showing correctly
5. Check welcome message received
```

### 4. Networking Testing
```
1. Login as regular user
2. Browse user directory
3. Send friend request
4. Accept pending requests
5. Check connections list
```

### 5. Group Features Testing
```
1. Join existing group
2. Create new group
3. Add members to group
4. Send group messages
5. Test group admin features
```

---

## 🚀 Running the Seed Script

### Via Browser (Easiest)
1. Make sure dev server is running: `npm run dev`
2. Navigate to: `http://localhost:3000/api/setup/seed`
3. Wait for response (may take 20-30 seconds)
4. Check console for success message

### Via PowerShell/CMD
```powershell
# Using curl (if available)
curl http://localhost:3000/api/setup/seed

# Or using Invoke-WebRequest (PowerShell)
Invoke-WebRequest -Uri "http://localhost:3000/api/setup/seed" -Method GET
```

### Expected Response
```json
{
  "success": true,
  "message": "Database seeded successfully with 300 users!",
  "stats": {
    "totalUsers": 300,
    "admins": 5,
    "bots": 50,
    "regularUsers": 245,
    "conversations": 100,
    "messages": 100,
    "friendRequests": 80,
    "groups": 10,
    "groupMembers": 100+
  }
}
```

---

## 🔍 Verifying the Data

### Using Prisma Studio
```bash
npx prisma studio
```
Then browse:
- **User** table: Should have 300 users
- **Conversation** table: Should have 100 conversations
- **Message** table: Should have 100+ messages
- **Group** table: Should have 10 groups
- **FriendRequest** table: Should have 80 friend requests

### Using the App
1. Login with any test user
2. Navigate through all features
3. Verify data appears correctly
4. Test all interactions

---

## 💡 Quick Test User Reference

### For Quick Testing - Use These:

**Admin Access:**
- Email: `admin1@b2bchat.com`
- Password: `test123`

**Regular User:**
- Email: `carlos.garcia1@empresa.co` (or any from the list)
- Password: `test123`

**AI Bot (for viewing):**
- Email: `bot1@b2bchat.bot`
- Password: `test123`
- Note: Bots show with 🤖 indicator

---

## 🎯 Production Readiness

> [!IMPORTANT]
> **Before deploying to production:**
> - ❌ DO NOT run this seed script in production
> - ✅ Remove or secure the `/api/setup/seed` endpoint
> - ✅ Use strong passwords for real admin accounts
> - ✅ Implement proper user registration flow
> - ✅ Add email verification
> - ✅ Implement rate limiting

---

## 📊 Database Statistics After Seed

| Entity | Count | Notes |
|--------|-------|-------|
| Total Users | 300 | 5 admins + 50 bots + 245 regular |
| Admins | 5 | 2 SUPERADMIN + 3 ADMIN_EMPRESA |
| AI Bots | 50 | 10 personality types, 5 each |
| Regular Users | 245 | Diverse industries and positions |
| Conversations | 100 | User-bot initial conversations |
| Messages | 100+ | Welcome messages |
| Friend Requests | 80 | 50 accepted + 30 pending |
| Groups | 10 | Various professional topics |
| Group Members | 100+ | 5-15 members per group |

---

## 🛠️ Troubleshooting

### "Database already has significant data"
- The seed script checks user count first
- If more than 50 users exist, it won't re-seed
- **Solution**: Clear database first or modify the check

### Clear Database and Re-seed
```bash
# Reset database
npx prisma migrate reset

# Then run seed again
# Visit: http://localhost:3000/api/setup/seed
```

### Seed Takes Too Long
- Creating 300 users takes time (20-30 seconds expected)
- Check console for progress logs
- If it times out, check server logs for errors

---

**Created by:** B2BChat Seed Script v2.0  
**Date:** 2025-11-26  
**Total Test Users:** 300  
**Password:** test123 (for all users)
