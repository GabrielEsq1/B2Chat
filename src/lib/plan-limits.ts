// Plan types as string union since PlanType enum doesn't exist in schema
export type PlanType = 'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';

export const PLAN_LIMITS: Record<PlanType, {
    name: string;
    price: number;
    currency: string;
    credits: number;
    maxStores: number;
    features: string[];
}> = {
    FREE: {
        name: "Freemium",
        price: 0,
        currency: "COP",
        credits: 10,
        maxStores: 1,
        features: [
            "1 Tienda Virtual",
            "Chat Básico",
            "10 USD en Créditos",
            "1 Campaña Email de Prueba"
        ]
    },
    PRO: {
        name: "Básico",
        price: 60000,
        currency: "COP",
        credits: 200,
        maxStores: 1,
        features: [
            "1 Tienda Completa",
            "Chat Ilimitado",
            "200 USD en Créditos",
            "Acceso a Anuncios"
        ]
    },
    BUSINESS: {
        name: "Profesional",
        price: 150000, // Starting price
        currency: "COP",
        credits: 500, // Starting credits
        maxStores: 5, // Multi-store
        features: [
            "Multi-tienda",
            "Analíticas Avanzadas",
            "500-1000 USD en Créditos",
            "Prioridad en Anuncios"
        ]
    },
    ENTERPRISE: {
        name: "Enterprise",
        price: 2000,
        currency: "USD",
        credits: 999999, // Unlimited effectively
        maxStores: 999,
        features: [
            "Integración APIs",
            "Soporte 24/7",
            "Créditos Personalizados",
            "Todo Ilimitado"
        ]
    }
};

export const CREDIT_COSTS = {
    AD_CREATION: 5, // 5 USD per ad creation
    EMAIL_CAMPAIGN: 10, // 10 USD per campaign
    PREMIUM_MESSAGE: 0.05 // 0.05 USD per premium message
};

// Helper functions
export function canAddCreative(currentCount: number, plan: PlanType): boolean {
    const limits: Record<PlanType, number> = {
        FREE: 1,
        PRO: 3,
        BUSINESS: 10,
        ENTERPRISE: 999
    };
    return currentCount < limits[plan];
}

export function getRotationHours(plan: PlanType): number {
    const hours: Record<PlanType, number> = {
        FREE: 24,
        PRO: 12,
        BUSINESS: 6,
        ENTERPRISE: 1
    };
    return hours[plan];
}
