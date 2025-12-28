// Yelp Fusion API Client
// Free tier: 5,000 calls/day

const YELP_API_KEY = process.env.B2BCHAT_EXT_YELP_KEY_PROD || process.env.YELP_API_KEY;
const YELP_BASE_URL = 'https://api.yelp.com/v3';

export interface YelpBusiness {
    id: string;
    name: string;
    phone: string;
    location: {
        address1: string;
        city: string;
        country: string;
    };
    categories: Array<{ title: string }>;
    rating: number;
    review_count: number;
}

export async function searchYelpBusinesses(query: string, location: string = 'Colombia'): Promise<YelpBusiness[]> {
    if (!YELP_API_KEY) {
        console.warn('Yelp API key not configured');
        return [];
    }

    try {
        const params = new URLSearchParams({
            term: query,
            location: location,
            limit: '10'
        });

        const response = await fetch(`${YELP_BASE_URL}/businesses/search?${params}`, {
            headers: {
                'Authorization': `Bearer ${YELP_API_KEY}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('Yelp API error:', response.status);
            return [];
        }

        const data = await response.json();
        return data.businesses || [];
    } catch (error) {
        console.error('Yelp search error:', error);
        return [];
    }
}
