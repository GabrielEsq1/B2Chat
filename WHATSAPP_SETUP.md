# WhatsApp Integration Guide

## 🚀 Setup Instructions

### 1. Create Twilio Account
1. Go to [twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up for free trial ($15 credit)
3. Verify your phone number

### 2. Enable WhatsApp Sandbox
1. Go to [Twilio Console > Messaging > Try it out > Send a WhatsApp message](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn)
2. Send "join [your-code]" to the sandbox number (e.g., +1 415 523 8886)
3. You'll receive a confirmation message

### 3. Get Credentials
From your [Twilio Console Dashboard](https://console.twilio.com/):
- **Account SID**: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
- **Auth Token**: Click "Show" to reveal
- **WhatsApp Number**: whatsapp:+14155238886 (or your verified number)

### 4. Add to `.env.local`
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### 5. Configure Webhook
1. Go to [Twilio Console > Messaging > Settings > WhatsApp Sandbox Settings](https://console.twilio.com/us1/develop/sms/settings/whatsapp-sandbox)
2. Set "WHEN A MESSAGE COMES IN" webhook to:
   ```
   https://your-domain.vercel.app/api/whatsapp/webhook
   ```
   OR for local testing with ngrok:
   ```
   https://abc123.ngrok.io/api/whatsapp/webhook
   ```
3. Set HTTP method to **POST**
4. Click **Save**

---

## 🧪 Testing Locally with ngrok

1. Install ngrok:
   ```bash
   npm install -g ngrok
   ```

2. Start your dev server:
   ```bash
   npm run dev
   ```

3. In another terminal, expose port 3000:
   ```bash
   ngrok http 3000
   ```

4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

5. Set as webhook in Twilio Console

6. Send a WhatsApp message to your sandbox number

7. Check console logs to see webhook received

---

## 📱 How It Works

### Sending Messages (B2BChat → WhatsApp)
```typescript
// User sends message in B2BChat
POST /api/whatsapp/send
{
  "conversationId": "conv-123",
  "text": "Hola, estoy interesado en tus servicios",
  "recipientPhone": "+573001234567"
}

// Message delivered to WhatsApp via Twilio
```

### Receiving Messages (WhatsApp → B2BChat)
```
1. User replies on WhatsApp
2. Twilio sends POST to /api/whatsapp/webhook
3. Message saved to conversation in database
4. (Optional) Socket.IO emits event to update UI
5. (Optional) AI responds if bot conversation
```

---

## 💰 Pricing

### Twilio WhatsApp Pricing:
- **Trial**: $15 free credit
- **Production**:
  - Business-initiated: $0.005/message
  - User-initiated: Free (24-hour window)
  - Session messages: $0.0042/message

### Cost Example:
- 1,000 messages/month = ~$5
- 10,000 messages/month = ~$50

---

## 🔧 Next Steps

1. **Restart your dev server** after adding env vars
2. **Test send endpoint**:
   ```bash
   curl -X POST http://localhost:3000/api/whatsapp/send \
     -H "Content-Type: application/json" \
     -d '{
       "conversationId": "your-conv-id",
       "text": "Test from B2BChat",
       "recipientPhone": "+573001234567"
     }'
   ```

3. **Add WhatsApp button to chat UI** (next implementation step)

4. **Deploy to Vercel** and update webhook URL

---

## 🎯 Integration Status

- ✅ Twilio client created
- ✅ Send endpoint `/api/whatsapp/send`
- ✅ Webhook endpoint `/api/whatsapp/webhook`
- ⏳ UI button in ChatWindow
- ⏳ Webhook configured in Twilio
- ⏳ Production deployment

---

## 🐛 Troubleshooting

**Problem**: Messages not sending
- Check env vars are set correctly
- Verify Twilio credentials
- Check phone format: `whatsapp:+573001234567`

**Problem**: Webhook not receiving
- Verify ngrok is running
- Check webhook URL in Twilio Console
- Ensure endpoint is POST, not GET

**Problem**: "User not found" in webhook
- User must exist in DB with matching phone
- Phone format must match exactly
