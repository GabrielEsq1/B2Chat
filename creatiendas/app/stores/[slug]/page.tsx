import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import StorePreview from '@/components/StorePreview';
import { StoreService } from '@/lib/store-service';
import '@/app/styles/builder.css'; // Reuse styles

interface Props {
    params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const store = await StoreService.getStore(params.slug);
    if (!store) return { title: 'Tienda no encontrada' };

    return {
        title: store.data.name,
        description: store.data.desc,
    };
}

export default async function StorePage({ params }: Props) {
    const store = await StoreService.getStore(params.slug);

    if (!store) {
        notFound();
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f4f4f9',
            display: 'flex',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <StorePreview
                data={store.data}
                products={store.products}
                viewMode="desktop"
                readOnly={true}
            />
            <ViewTracker slug={params.slug} />
        </div>
    );
}

import ViewTracker from '@/components/ViewTracker';
