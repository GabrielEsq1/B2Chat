import crypto from 'crypto';

const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;

interface PayPalWebhookHeaders {
    'paypal-transmission-id': string;
    'paypal-transmission-time': string;
    'paypal-transmission-sig': string;
    'paypal-cert-url': string;
    'paypal-auth-algo': string;
}

/**
 * Verifies PayPal webhook signature to prevent unauthorized requests
 * Based on PayPal's official verification algorithm
 */
export async function verifyPayPalWebhook(
    headers: Record<string, string>,
    body: any
): Promise<boolean> {
    if (!PAYPAL_WEBHOOK_ID) {
        console.warn('[PayPal Security] PAYPAL_WEBHOOK_ID not configured - skipping verification');
        return true; // In dev, allow without verification (not recommended for prod)
    }

    try {
        const transmissionId = headers['paypal-transmission-id'];
        const transmissionTime = headers['paypal-transmission-time'];
        const transmissionSig = headers['paypal-transmission-sig'];
        const certUrl = headers['paypal-cert-url'];
        const authAlgo = headers['paypal-auth-algo'];

        if (!transmissionId || !transmissionTime || !transmissionSig || !certUrl) {
            console.error('[PayPal Security] Missing required headers');
            return false;
        }

        // Construct the expected message
        const expectedMessage = `${transmissionId}|${transmissionTime}|${PAYPAL_WEBHOOK_ID}|${crc32(JSON.stringify(body))}`;

        // Fetch PayPal's certificate
        const certResponse = await fetch(certUrl);
        if (!certResponse.ok) {
            console.error('[PayPal Security] Failed to fetch certificate');
            return false;
        }
        const cert = await certResponse.text();

        // Verify signature
        const verifier = crypto.createVerify(authAlgo || 'SHA256');
        verifier.update(expectedMessage);

        const isValid = verifier.verify(cert, transmissionSig, 'base64');

        if (!isValid) {
            console.error('[PayPal Security] Signature verification failed');
        }

        return isValid;
    } catch (error) {
        console.error('[PayPal Security] Verification error:', error);
        return false;
    }
}

/**
 * CRC32 checksum (required by PayPal)
 */
function crc32(str: string): number {
    const table = makeCRCTable();
    let crc = 0 ^ (-1);

    for (let i = 0; i < str.length; i++) {
        crc = (crc >>> 8) ^ table[(crc ^ str.charCodeAt(i)) & 0xFF];
    }

    return (crc ^ (-1)) >>> 0;
}

function makeCRCTable(): number[] {
    let c;
    const crcTable = [];
    for (let n = 0; n < 256; n++) {
        c = n;
        for (let k = 0; k < 8; k++) {
            c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        crcTable[n] = c;
    }
    return crcTable;
}
