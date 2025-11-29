# B2BChat Features and Components Inventory

## 1. Authentication
- **Features**: User Registration, Login, Password Recovery.
- **Components**:
    - `src/app/login/page.tsx`: Login page.
    - `src/app/register/page.tsx`: Registration page.
    - `src/app/forgot-password/page.tsx`: Password recovery.
    - `src/lib/auth.ts`: NextAuth configuration.

## 2. Chat System
- **Features**: Real-time messaging, One-on-One Chat, Group Chat, Multimedia Support (Images/Videos), Message History.
- **Components**:
    - `src/components/chat/ChatWindow.tsx`: Main chat interface.
    - `src/components/chat/ChatSidebar.tsx`: List of conversations and contacts.
    - `src/components/chat/ChatInput.tsx`: Message input field with attachment support.
    - `src/components/chat/MessageBubble.tsx`: Individual message display.
    - `src/app/chat/page.tsx`: Main chat layout.

## 3. AI Assistant
- **Features**: AI-powered chat bot (Llama-3 via Groq), Context-aware responses.
- **Components**:
    - `src/components/chat/AIChatWindow.tsx`: Specialized chat window for AI interaction.
    - `src/app/api/chat/ai/route.ts`: API endpoint for AI processing.
    - `src/lib/ai-config.ts`: AI model configuration.

## 4. Campaigns & Ads
- **Features**: Create Ad Campaigns, Ad Dashboard, Internal Ad Display (in Chat), Marketplace API.
- **Components**:
    - `src/components/campaigns/CampaignForm.tsx`: Dashboard form for creating campaigns.
    - `src/components/campaigns/AdPreviewCard.tsx`: Reusable component for displaying ads.
    - `src/components/campaigns/AdCreativeUpload.tsx`: Media upload component.
    - `src/components/chat/InternalAdsPanel.tsx`: Sidebar in chat displaying active ads.
    - `src/app/ads-manager/page.tsx`: Ads management page.
    - `src/app/api/campaigns/*`: API routes for campaign management.

## 5. Contacts & Networking
- **Features**: User Search, Friend Requests, Contact List.
- **Components**:
    - `src/app/contacts/page.tsx`: Contacts management page.
    - `src/app/discover/page.tsx`: User discovery/search page.
    - `src/app/profile/[id]/page.tsx`: User profile view.

## 6. Admin Dashboard
- **Features**: System overview, User management, Campaign oversight.
- **Components**:
    - `src/app/admin/dashboard/page.tsx`: Main admin dashboard.
    - `src/app/dashboard/page.tsx`: User dashboard (stats).

## 7. Infrastructure
- **Database**: PostgreSQL (via Prisma).
- **Deployment**: Vercel.
- **Styling**: Tailwind CSS.
