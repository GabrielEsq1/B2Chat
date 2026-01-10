---
description: Configuración de Dominio Personalizado y Email B2BChat
---

# Configuración de Dominio y Email (b2bchat.co)

Sigue estos pasos EXACTOS para conectar tu dominio `b2bchat.co` con Vercel (App) y Systeme.io (Email) usando Namecheap.

## PASO 1: Configurar Namecheap (DNS)

1. Ve a **Namecheap > Dashboard > Domain List**.
2. Haz clic en **Manage** junto a `b2bchat.co`.
3. Ve a la pestaña **Advanced DNS**.
4. **Elimina** cualquier registro existente que diga "Parking Page" o redirija a `parkingpage.namecheap.com`.

### A. Conectar la APP (Vercel)
Agrega estos 2 registros para que `b2bchat.co` muestre tu aplicación:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| **A Record** | `@` | `76.76.21.21` | Automatic |
| **CNAME Record** | `www` | `cname.vercel-dns.com` | Automatic |

---

## PASO 2: Configurar Systeme.io (Email)

Para que los correos (copias de chat) lleguen a la bandeja de entrada y no a SPAM, debes autenticar el dominio.

1. Entra a **Systeme.io > Configuración > Correos (o Dominios personalizados)**.
2. Agrega el dominio `b2bchat.co` si no lo has hecho.
3. El sistema te dará **3 registros CNAME únicos** (no uses los de creatiendas.co).
4. Ve a **Namecheap > Advanced DNS** y agrégalos así:

| Type | Host (Name) | Value (Target) | TTL |
|------|-------------|----------------|-----|
| **CNAME** | `[copia_lo_que_dice_systeme]` | `[valor_de_systeme]` | Automatic |
| **CNAME** | `[copia_lo_que_dice_systeme]` | `[valor_de_systeme]` | Automatic |
| **CNAME** | `[copia_lo_que_dice_systeme]` | `[valor_de_systeme]` | Automatic |

> **IMPORTANTE**: En Namecheap, si el Host dice `cname.b2bchat.co`, solo copia la parte `cname`. Namecheap agrega el dominio automáticamente.

---

## PASO 3: Verificación Técnica

Una vez configurado:
1. Espera 1-24 horas para la propagación DNS.
2. En **Systeme.io**, verifica que el estado del dominio cambie a "Verificado" o "Activo".
3. En **Vercel**, agrega el dominio `b2bchat.co` en Settings > Domains.
