# B2BChat Mobile App (Expo/React Native)

## Setup Instructions

### 1. Initialize Expo Project
```bash
cd mobile
npx create-expo-app@latest . --template blank-typescript
```

### 2. Install Dependencies
```bash
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install axios socket.io-client
npm install @react-native-async-storage/async-storage
npm install expo-notifications
```

### 3. Project Structure
```
mobile/
├── src/
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── ChatListScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   ├── MarketplaceScreen.tsx
│   │   ├── StoreDetailScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── SocialHubScreen.tsx
│   ├── components/
│   │   ├── MessageBubble.tsx
│   │   ├── StoreCard.tsx
│   │   └── ProductCard.tsx
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   └── AuthNavigator.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── socket.ts
│   │   └── auth.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useSocket.ts
│   └── types/
│       └── index.ts
├── App.tsx
└── package.json
```

### 4. Features to Implement

#### Authentication
- Login with email/password
- WhatsApp OTP login
- Token storage with AsyncStorage
- Auto-login on app start

#### Chat
- Real-time messaging with Socket.IO
- Message history
- Typing indicators
- Push notifications

#### Marketplace
- Browse stores
- View products
- Contact sellers

#### Profile
- View/edit profile
- Manage stores
- View subscription

#### Social Hub Lite
- View connected accounts
- Basic analytics

### 5. API Integration
Base URL: `https://your-domain.com` or `http://localhost:3000` for dev

Endpoints:
- POST /api/auth/login
- POST /api/auth/login-whatsapp
- GET /api/marketplace/stores
- GET /api/chat/conversations
- WebSocket: /api/socket/io

### 6. Push Notifications Setup
```bash
npm install expo-notifications
```

Configure in `app.json`:
```json
{
  "expo": {
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#2563eb"
    }
  }
}
```

### 7. Build & Deploy
```bash
# Development build
eas build --profile development --platform ios
eas build --profile development --platform android

# Production build
eas build --profile production --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

### 8. Environment Variables
Create `.env`:
```
API_URL=https://your-domain.com
SOCKET_URL=https://your-domain.com
```

## Next Steps
1. Initialize Expo project
2. Set up navigation
3. Implement authentication
4. Connect to Socket.IO
5. Build chat interface
6. Implement marketplace views
7. Add push notifications
8. Test on iOS/Android
9. Deploy to app stores
