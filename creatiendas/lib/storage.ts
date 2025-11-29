import fs from 'fs';
import path from 'path';
import { put, list } from '@vercel/blob';

export interface Store {
    id: string;
    slug: string;
    data: any; // StoreData
    products: any[]; // Product[]
    createdAt: string;
}

interface IStorage {
    getStores(): Promise<Store[]>;
    getStore(slug: string): Promise<Store | null>;
    saveStore(store: Store): Promise<void>;
    updateStore(slug: string, store: Store): Promise<void>;
}

// --- Vercel Blob Storage (Persistent Cloud Storage) ---
// This backend uses Vercel Blob to store store data as JSON files.
// It is used when the BLOB_READ_WRITE_TOKEN environment variable is present.
class VercelBlobStorage implements IStorage {

    async getStores(): Promise<Store[]> {
        // Listing all stores from Blob
        // This might be slow if there are thousands, but fine for now.
        try {
            const { blobs } = await list({ prefix: 'stores/' });
            const stores: Store[] = [];

            for (const blob of blobs) {
                // We only need the content if we are listing details, 
                // but for a simple list we might just return metadata?
                // The interface expects Store objects.
                // Fetching every single JSON might be too heavy.
                // For this demo, let's just fetch the first 10 or so, or just return empty if not strictly needed by the UI.
                // The current UI doesn't seem to list all stores anywhere public.
                // So we can return empty or implement a basic fetch.
                const res = await fetch(blob.url);
                if (res.ok) {
                    const store = await res.json();
                    stores.push(store);
                }
            }
            return stores;
        } catch (error) {
            console.error("Error listing stores from Blob:", error);
            return [];
        }
    }

    async getStore(slug: string): Promise<Store | null> {
        try {
            // List to find the specific file: stores/{slug}.json
            // We use prefix to filter.
            const { blobs } = await list({ prefix: `stores/${slug}.json`, limit: 1 });

            if (blobs.length === 0) return null;

            // Found it, now fetch content
            const blob = blobs[0];
            const res = await fetch(blob.url);
            if (!res.ok) return null;

            return await res.json();
        } catch (error) {
            console.error(`Error getting store ${slug} from Blob:`, error);
            return null;
        }
    }

    async saveStore(store: Store): Promise<void> {
        // Overwrite or create stores/{slug}.json
        await put(`stores/${store.slug}.json`, JSON.stringify(store), {
            access: 'public',
            addRandomSuffix: false, // Important to keep the URL/Path predictable
            contentType: 'application/json'
        });
    }

    async updateStore(slug: string, store: Store): Promise<void> {
        await this.saveStore(store);
    }
}

// --- In-Memory Storage (Fallback) ---
class InMemoryStorage implements IStorage {
    private stores: Store[] = [];

    async getStores(): Promise<Store[]> {
        return this.stores;
    }

    async getStore(slug: string): Promise<Store | null> {
        return this.stores.find(s => s.slug === slug) || null;
    }

    async saveStore(store: Store): Promise<void> {
        const index = this.stores.findIndex(s => s.slug === store.slug);
        if (index >= 0) {
            this.stores[index] = store;
        } else {
            this.stores.push(store);
        }
    }

    async updateStore(slug: string, store: Store): Promise<void> {
        await this.saveStore(store);
    }
}

// --- File System Storage (For Local Development) ---
class FileStorage implements IStorage {
    private dbFile = path.join(process.cwd(), 'data', 'stores.json');
    private dataDir = path.join(process.cwd(), 'data');

    constructor() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }

    private readDB(): Store[] {
        if (!fs.existsSync(this.dbFile)) {
            return [];
        }
        try {
            const data = fs.readFileSync(this.dbFile, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error("Error reading DB:", error);
            return [];
        }
    }

    private writeDB(stores: Store[]) {
        fs.writeFileSync(this.dbFile, JSON.stringify(stores, null, 2));
    }

    async getStores(): Promise<Store[]> {
        return this.readDB();
    }

    async getStore(slug: string): Promise<Store | null> {
        const stores = this.readDB();
        return stores.find(s => s.slug === slug) || null;
    }

    async saveStore(store: Store): Promise<void> {
        const stores = this.readDB();
        const index = stores.findIndex(s => s.slug === store.slug);
        if (index >= 0) {
            stores[index] = store;
        } else {
            stores.push(store);
        }
        this.writeDB(stores);
    }

    async updateStore(slug: string, store: Store): Promise<void> {
        await this.saveStore(store);
    }
}

// Select storage based on environment and configuration
// If BLOB_READ_WRITE_TOKEN is present, use Blob (even locally, if desired, or strictly prod).
// The user requested "Migrar todo el flujo... para que use Vercel Blob".
const hasBlob = !!process.env.BLOB_READ_WRITE_TOKEN;
const isProduction = process.env.NODE_ENV === 'production';

export const storage = hasBlob
    ? new VercelBlobStorage()
    : (isProduction ? new InMemoryStorage() : new FileStorage());

// Global variable to persist in-memory data across hot-reloads in dev if we were using it,
// or across lambda invocations if the container is reused in prod.
// For prod, we might want to attach it to globalThis to survive some re-renders if possible,
