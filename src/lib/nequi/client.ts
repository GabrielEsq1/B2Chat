// Nequi API Client for Colombia
// Documentation: https://conectate.nequi.com.co/

const NEQUI_API_BASE = process.env.NEQUI_API_URL || 'https://api.nequi.com.co';
const NEQUI_CLIENT_ID = process.env.NEQUI_CLIENT_ID;
const NEQUI_CLIENT_SECRET = process.env.NEQUI_CLIENT_SECRET;
const NEQUI_API_KEY = process.env.NEQUI_API_KEY;

interface NequiAuthResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

interface NequiTransaction {
    transactionId: string;
    amount: number;
    phone: string;
    message: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface NequiBalanceResponse {
    balance: number;
    currency: string;
}

// Token cache (in production, use Redis)
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
    // Check if cached token is still valid
    if (cachedToken && cachedToken.expiresAt > Date.now()) {
        return cachedToken.token;
    }

    if (!NEQUI_CLIENT_ID || !NEQUI_CLIENT_SECRET) {
        throw new Error('Nequi credentials not configured');
    }

    try {
        const auth = Buffer.from(`${NEQUI_CLIENT_ID}:${NEQUI_CLIENT_SECRET}`).toString('base64');

        const response = await fetch(`${NEQUI_API_BASE}/oauth/token`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        });

        if (!response.ok) {
            throw new Error(`Nequi auth failed: ${response.status}`);
        }

        const data: NequiAuthResponse = await response.json();

        // Cache token
        cachedToken = {
            token: data.access_token,
            expiresAt: Date.now() + (data.expires_in * 1000) - 60000 // 1 min buffer
        };

        return data.access_token;
    } catch (error) {
        console.error('Nequi authentication error:', error);
        throw error;
    }
}

export async function nequiGetBalance(phoneNumber: string): Promise<number> {
    const token = await getAccessToken();

    try {
        const response = await fetch(`${NEQUI_API_BASE}/api/v1/balance`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'x-api-key': NEQUI_API_KEY || ''
            },
            body: JSON.stringify({
                phoneNumber
            })
        });

        if (!response.ok) {
            throw new Error(`Nequi balance query failed: ${response.status}`);
        }

        const data: NequiBalanceResponse = await response.json();
        return data.balance;
    } catch (error) {
        console.error('Nequi balance error:', error);
        throw error;
    }
}

export async function nequiSendMoney(
    fromPhone: string,
    toPhone: string,
    amount: number,
    message: string
): Promise<NequiTransaction> {
    const token = await getAccessToken();

    try {
        const response = await fetch(`${NEQUI_API_BASE}/api/v1/push-payments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'x-api-key': NEQUI_API_KEY || ''
            },
            body: JSON.stringify({
                phoneNumber: toPhone,
                code: '420', // Push payment code
                value: amount,
                messageToUser: message
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Nequi send failed: ${error.message || response.status}`);
        }

        const data = await response.json();
        return {
            transactionId: data.transactionId,
            amount: data.value,
            phone: toPhone,
            message: data.messageToUser,
            status: data.status
        };
    } catch (error) {
        console.error('Nequi send money error:', error);
        throw error;
    }
}

export async function nequiRequestMoney(
    fromPhone: string,
    toPhone: string,
    amount: number,
    message: string
): Promise<NequiTransaction> {
    const token = await getAccessToken();

    try {
        const response = await fetch(`${NEQUI_API_BASE}/api/v1/payment-requests`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'x-api-key': NEQUI_API_KEY || ''
            },
            body: JSON.stringify({
                phoneNumber: toPhone,
                value: amount,
                messageToUser: message
            })
        });

        if (!response.ok) {
            throw new Error(`Nequi request failed: ${response.status}`);
        }

        const data = await response.json();
        return {
            transactionId: data.transactionId,
            amount: data.value,
            phone: toPhone,
            message: data.messageToUser,
            status: data.status
        };
    } catch (error) {
        console.error('Nequi request money error:', error);
        throw error;
    }
}

export async function nequiDeposit(phoneNumber: string, amount: number): Promise<NequiTransaction> {
    // Simulated deposit (in production, integrate with bank or PSE)
    return {
        transactionId: `DEP-${Date.now()}`,
        amount,
        phone: phoneNumber,
        message: 'Depósito desde cuenta bancaria',
        status: 'APPROVED'
    };
}

export async function nequiWithdraw(phoneNumber: string, amount: number): Promise<NequiTransaction> {
    // Withdrawal to bank account (requires additional Nequi API endpoints)
    return {
        transactionId: `WTH-${Date.now()}`,
        amount,
        phone: phoneNumber,
        message: 'Retiro a cuenta bancaria',
        status: 'PENDING'
    };
}

export async function nequiGetTransactionStatus(transactionId: string): Promise<string> {
    const token = await getAccessToken();

    try {
        const response = await fetch(`${NEQUI_API_BASE}/api/v1/transactions/${transactionId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'x-api-key': NEQUI_API_KEY || ''
            }
        });

        if (!response.ok) {
            throw new Error(`Nequi transaction status failed: ${response.status}`);
        }

        const data = await response.json();
        return data.status;
    } catch (error) {
        console.error('Nequi transaction status error:', error);
        throw error;
    }
}
