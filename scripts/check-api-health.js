#!/usr/bin/env node
/**
 * API Health Check Script
 * Validates all configured APIs are accessible before deployment
 */

const fs = require('fs');
const yaml = require('js-yaml');

const CONFIG_PATH = './config/apis.yaml';
const TIMEOUT = 10000; // 10 seconds

async function checkAPI(api, config) {
    const apiKey = process.env[config.env_var];

    // Skip if API key not provided and not required
    if (!apiKey && !config.required) {
        console.log(`⏭️  ${api}: Skipped (no API key, not required)`);
        return { api, status: 'skipped', available: null };
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

        // Simple HEAD or GET request to check if endpoint is reachable
        const response = await fetch(config.endpoint, {
            method: 'HEAD',
            signal: controller.signal,
            headers: apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}
        });

        clearTimeout(timeoutId);

        if (response.ok || response.status === 401 || response.status === 403) {
            // 401/403 means endpoint exists but needs proper auth - that's OK
            console.log(`✅ ${api}: Available`);
            return { api, status: 'available', available: true };
        } else {
            console.log(`⚠️  ${api}: Unexpected status ${response.status}`);
            return { api, status: 'degraded', available: true };
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log(`❌ ${api}: Timeout`);
            return { api, status: 'timeout', available: false };
        }
        console.log(`❌ ${api}: Error - ${error.message}`);
        return { api, status: 'error', available: false, error: error.message };
    }
}

async function main() {
    console.log('🔍 Starting API Health Check...\n');

    // Load configuration
    let config;
    try {
        const fileContents = fs.readFileSync(CONFIG_PATH, 'utf8');
        config = yaml.load(fileContents);
    } catch (error) {
        console.error(`❌ Failed to load config: ${error.message}`);
        process.exit(1);
    }

    // Check all APIs
    const results = [];
    const apis = config.apis || {};

    for (const [apiName, apiConfig] of Object.entries(apis)) {
        const result = await checkAPI(apiName, apiConfig);
        results.push(result);
    }

    // Summary
    console.log('\n📊 Summary:');
    const available = results.filter(r => r.available === true).length;
    const unavailable = results.filter(r => r.available === false).length;
    const skipped = results.filter(r => r.available === null).length;

    console.log(`  ✅ Available: ${available}`);
    console.log(`  ❌ Unavailable: ${unavailable}`);
    console.log(`  ⏭️  Skipped: ${skipped}`);

    // Write results to file
    fs.writeFileSync(
        './api-health-report.json',
        JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2)
    );
    console.log('\n📝 Report saved to api-health-report.json');

    // Exit with error if critical APIs are down
    const criticalApis = Object.entries(apis)
        .filter(([_, config]) => config.required)
        .map(([name]) => name);

    const failedCritical = results.filter(
        r => r.available === false && criticalApis.includes(r.api)
    );

    if (failedCritical.length > 0) {
        console.error(`\n❌ Critical APIs unavailable: ${failedCritical.map(r => r.api).join(', ')}`);
        process.exit(1);
    }

    console.log('\n✅ Health check passed!');
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
