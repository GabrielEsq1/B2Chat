# 💰 Nequi API Integration - Setup Guide

## 🔐 Credenciales Necesarias

Para activar la integración completa de Nequi, necesitas obtener credenciales de [Nequi Conecta](https://conecta.nequi.com.co):

### 1. Registro en Nequi Conecta
1. Visita `https://conecta.nequi.com.co`
2. Crea una cuenta de desarrollador
3. Solicita acceso al entorno de pruebas (sandbox)

### 2. Obtener Credenciales
Recibirás 3 claves importantes:
- **Client ID**: Identificador de tu aplicación
- **Client Secret**: Clave secreta
- **API Key**: Llave para endpoints específicos

### 3. Agregar a `.env.local`
```env
# Nequi API
NEQUI_API_URL=https://api.nequi.com.co
NEQUI_CLIENT_ID=tu_client_id_aqui
NEQUI_CLIENT_SECRET=tu_client_secret_aqui
NEQUI_API_KEY=tu_api_key_aqui
```

---

## 🚀 Endpoints Implementados

### 1. Consultar Saldo
```typescript
GET /api/nequi/balance
```
Retorna el saldo actual del usuario en Nequi.

### 2. Enviar Dinero
```typescript
POST /api/nequi/send
Body: {
  "recipientPhone": "+573001234567",
  "amount": 50000,
  "message": "Pago por servicio"
}
```

### 3. Depositar
```typescript
POST /api/nequi/deposit
Body: {
  "amount": 100000,
  "method": "PSE"
}
```

### 4. Retirar
```typescript
POST /api/nequi/withdraw
Body: {
  "amount": 50000,
  "destination": "Cuenta Bancolombia"
}
```

---

## 🎯 Flujo de Uso

1. **Usuario se loguea** en B2BChat
2. **Navega a** `/monedero`
3. **Balanace automático** desde Nequi API
4. **Realiza transacciones** (enviar, depositar, retirar)
5. **Historial guardado** en base de datos

---

## 🔧 Próximos Pasos

### Fase 1: Certificación

1. Completa el desarrollo
2. Envía casos de prueba a `certificacion@conecta.nequi.com`
3. Incluye video/GIF del flujo de usuario
4. Espera aprobación (4 días hábiles)
5. Recibe claves de producción

### Fase 2: Migración a Producción
```env
# Production
NEQUI_API_URL=https://api-prod.nequi.com.co
NEQUI_CLIENT_ID=produccion_client_id
NEQUI_CLIENT_SECRET=produccion_secret
NEQUI_API_KEY=produccion_api_key
```

---

## 📊 Características Implementadas

- ✅ Autenticación OAuth 2.0
- ✅ Token caching (eficiencia)
- ✅ Consulta de saldo
- ✅ Enviar dinero (push payments)
- ✅ Solicitar dinero
- ✅ Depósitos (simulado sandbox)
- ✅ Retiros (simulado sandbox)
- ✅ Historial de transacciones
- ✅ Manejo de errores robusto

---

## 💡 Uso del Monedero

Una vez configurado, los usuarios pueden:

1. **Ver saldo real** de Nequi
2. **Enviar dinero** a otros números
3. **Recibir pagos** en tiempo real
4. **Depositar** desde PSE/bancos
5. **Retirar** a cuentas bancarias
6. **Historial completo** de transacciones

---

## 🐛 Modo Sandbox (Testing)

Sin credenciales, el sistema funciona en modo simulado:
- Balance: datos mock
- Transacciones: se guardan pero no ejecutan en Nequi
- Útil para desarrollo y demos

---

## 📞 Soporte

**Nequi Conecta**: conecta@nequi.com.co
**Certificación**:  certificacion@conecta.nequi.com
**Documentación**: https://conecta.nequi.com.co/docs
