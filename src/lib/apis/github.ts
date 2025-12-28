// GitHub Organizations API Client
// Free tier: 5,000 calls/hour (unauthenticated)

const GITHUB_TOKEN = process.env.B2BCHAT_EXT_GITHUB_TOKEN_PROD || process.env.GITHUB_TOKEN;
const GITHUB_API_URL = 'https://api.github.com';

export interface GitHubOrg {
    id: number;
    login: string;
    description: string;
    blog: string;
    location: string;
    email: string;
    public_repos: number;
    followers: number;
}

export async function searchGitHubOrganizations(query: string): Promise<GitHubOrg[]> {
    try {
        const headers: HeadersInit = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'B2BChat'
        };

        if (GITHUB_TOKEN) {
            headers['Authorization'] = `token ${GITHUB_TOKEN}`;
        }

        // Search for organizations
        const searchResponse = await fetch(
            `${GITHUB_API_URL}/search/users?q=${encodeURIComponent(query)}+type:org&per_page=5`,
            { headers }
        );

        if (!searchResponse.ok) {
            console.error('GitHub search error:', searchResponse.status);
            return [];
        }

        const searchData = await searchResponse.json();
        const orgs = searchData.items || [];

        // Fetch full details for each org
        const detailedOrgs = await Promise.all(
            orgs.slice(0, 3).map(async (org: any) => {
                try {
                    const detailResponse = await fetch(`${GITHUB_API_URL}/orgs/${org.login}`, { headers });
                    if (detailResponse.ok) {
                        return await detailResponse.json();
                    }
                } catch (error) {
                    console.error(`Error fetching org ${org.login}:`, error);
                }
                return null;
            })
        );

        return detailedOrgs.filter(org => org !== null);
    } catch (error) {
        console.error('GitHub API error:', error);
        return [];
    }
}
