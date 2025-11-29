import { prisma } from '@/lib/prisma';

// Types
export interface Product {
    id: number;
    name: string;
    description: string;
    category: string;
    price: string;
    image: string | null;
}

export interface StoreData {
    id?: string;
    title: string;
    name: string;
    desc: string;
    whatsapp: string;
    color: string;
    font?: string;
    logo: string | null;
    heroBg: string | null;
    slug: string;
    socials: {
        instagram: string;
        facebook: string;
        tiktok: string;
        email: string;
        phone: string;
    };
    about: {
        heroTitle: string;
        heroSubtitle: string;
        mission: string;
        vision: string;
        values: string[];
        timeline: string[];
        diff: string[];
        team: string;
        ctaText: string;
        gallery: string[];
    };
    careers: {
        title: string;
        desc: string;
        benefits: string[];
        ctaText: string;
    };
}

export function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD') // Split accented characters
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with -
        .replace(/^-+|-+$/g, '') // Trim - from start and end
        .replace(/-+/g, '-'); // Replace multiple - with single -
}

export interface Store {
    id: string;
    slug: string;
    data: StoreData;
    products: Product[];
    createdAt: string;
}

export const StoreService = {
    createStore: async (name: string, data: StoreData, products: Product[]) => {
        // This method might be redundant if we use the API route, but keeping it for compatibility
        // logic should be moved to API or this service used by API.
        // For now, let's assume API handles creation and this is mostly for reading.
        return null;
    },

    getStore: async (slug: string) => {
        const store = await prisma.store.findUnique({
            where: { slug }
        });

        if (!store) return null;

        return {
            id: store.id,
            slug: store.slug,
            data: store.data as unknown as StoreData,
            products: store.products as unknown as Product[],
            createdAt: store.createdAt.toISOString(),
        };
    },

    updateStore: async (slug: string, data: StoreData, products: Product[]) => {
        // Logic moved to API
        return null;
    }
};
