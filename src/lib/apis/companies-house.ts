// Companies House UK API Client
// Free tier: Unlimited

const COMPANIES_HOUSE_API_KEY = process.env.COMPANIES_HOUSE_API_KEY;
const COMPANIES_HOUSE_BASE_URL = 'https://api.company-information.service.gov.uk';

export interface CompaniesHouseCompany {
    company_number: string;
    company_name: string;
    company_status: string;
    company_type: string;
    date_of_creation: string;
    registered_office_address: {
        address_line_1: string;
        locality: string;
        postal_code: string;
        country: string;
    };
    sic_codes?: string[];
}

export async function searchCompaniesHouseUK(query: string): Promise<CompaniesHouseCompany[]> {
    if (!COMPANIES_HOUSE_API_KEY) {
        console.warn('Companies House API key not configured');
        return [];
    }

    try {
        const params = new URLSearchParams({
            q: query,
            items_per_page: '5'
        });

        const auth = Buffer.from(`${COMPANIES_HOUSE_API_KEY}:`).toString('base64');

        const response = await fetch(`${COMPANIES_HOUSE_BASE_URL}/search/companies?${params}`, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('Companies House API error:', response.status);
            return [];
        }

        const data = await response.json();
        return data.items || [];
    } catch (error) {
        console.error('Companies House search error:', error);
        return [];
    }
}
