/**
 * Test script to verify the /api/v1/offers/active endpoint works without authentication
 * 
 * Usage:
 * node test-offers-endpoint.js
 */

import fetch from 'node-fetch';

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function testOffersEndpoint() {
    console.log('🧪 Testing /api/v1/offers/active endpoint...\n');
    
    try {
        // Test 1: Without authentication (should work)
        console.log('Test 1: Fetching offers WITHOUT authentication');
        const response = await fetch(`${API_URL}/api/v1/offers/active`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ SUCCESS - Endpoint is public!');
            console.log(`Found ${data.totalOffers} active offers`);
            console.log('\nOffers:', JSON.stringify(data.offers, null, 2));
        } else {
            const error = await response.json();
            console.log('❌ FAILED - Endpoint requires authentication');
            console.log('Error:', error);
        }

        console.log('\n' + '='.repeat(50) + '\n');

        // Test 2: With invalid token (should still work since endpoint is public)
        console.log('Test 2: Fetching offers WITH invalid token');
        const response2 = await fetch(`${API_URL}/api/v1/offers/active`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer invalid_token_12345'
            }
        });

        console.log(`Status: ${response2.status} ${response2.statusText}`);
        
        if (response2.ok) {
            const data = await response2.json();
            console.log('✅ SUCCESS - Endpoint ignores invalid token (as expected for public endpoint)');
            console.log(`Found ${data.totalOffers} active offers`);
        } else {
            const error = await response2.json();
            console.log('❌ FAILED - Endpoint is rejecting invalid token (should be public)');
            console.log('Error:', error);
        }

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        console.error('\nMake sure:');
        console.error('1. Server is running');
        console.error('2. API_URL is correct (current:', API_URL + ')');
    }
}

testOffersEndpoint();
