// Plan limits configuration
export const PLAN_LIMITS = {
    FREE: {
        maxCreativesPerCampaign: 1,
        rotationHours: null, // No rotation
        maxCampaigns: 1,
        maxFileSize: 2 * 1024 * 1024, // 2MB
    },
    PRO: {
        maxCreativesPerCampaign: 3,
        rotationHours: 24, // Rotate every 24 hours
        maxCampaigns: 10,
        maxFileSize: 5 * 1024 * 1024, // 5MB
    },
    BUSINESS: {
        maxCreativesPerCampaign: 10,
        rotationHours: 12, // Rotate every 12 hours
        maxCampaigns: 50,
        maxFileSize: 10 * 1024 * 1024, // 10MB
    },
    ENTERPRISE: {
        maxCreativesPerCampaign: -1, // Unlimited
        rotationHours: 6, // Rotate every 6 hours
        maxCampaigns: -1, // Unlimited
        maxFileSize: 20 * 1024 * 1024, // 20MB
    },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

export function getPlanLimits(plan: PlanType) {
    return PLAN_LIMITS[plan] || PLAN_LIMITS.FREE;
}

export function canAddCreative(currentCount: number, plan: PlanType): boolean {
    const limits = getPlanLimits(plan);
    if (limits.maxCreativesPerCampaign === -1) return true;
    return currentCount < limits.maxCreativesPerCampaign;
}

export function getRotationHours(plan: PlanType): number | null {
    return getPlanLimits(plan).rotationHours;
}
