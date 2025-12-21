
const BASE_url = 'http://localhost:3000/api';

async function run() {
    try {
        console.log('0. Logging in...');
        const loginRes = await fetch(`${BASE_url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin123' })
        });
        const loginData = await loginRes.json();

        if (!loginData.success) {
            console.error('Login failed:', loginData);
            return;
        }
        const token = loginData.data.token;
        console.log('Logged in. Token:', token.substring(0, 10) + '...');

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        console.log('1. Getting Users...');
        const usersRes = await fetch(`${BASE_url}/users`, { headers });
        const users = await usersRes.json();
        const salesPerson = (users.data || users).find(u => u.role === 'sales');

        if (!salesPerson) {
            console.log('Users Response:', JSON.stringify(users).substring(0, 200));
        }

        if (!salesPerson) {
            console.error('No sales person found!');
            return;
        }
        console.log(`Found Sales Person: ${salesPerson.name} (${salesPerson.id})`);

        console.log('\n2. Creating Campaign...');
        const campaignRes = await fetch(`${BASE_url}/campaigns`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                title: 'Agent Verification Campaign',
                platform: 'facebook',
                type: 'post',
                url: 'http://example.com',
                salesPersonId: salesPerson.id,
                startDate: new Date().toISOString()
            })
        });
        const campaignJson = await campaignRes.json();
        const campaign = campaignJson.data;

        if (!campaign) {
            console.error('Campaign Creation Failed:', JSON.stringify(campaignJson, null, 2));
            return;
        }
        console.log('Campaign Created:', campaign);

        if (!campaign.referenceId || !campaign.referenceId.startsWith('FB-')) {
            throw new Error(`Invalid Campaign Ref ID: ${campaign.referenceId}`);
        }
        console.log(`✅ Campaign Ref Valid: ${campaign.referenceId}`);

        console.log('\n3. Creating Order...');
        const orderRes = await fetch(`${BASE_url}/orders`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                campaignId: campaign.id,
                products: [{ name: 'Test Widget', qty: 2, basePrice: 50 }],
                createdAt: new Date().toISOString()
            })
        });
        const order = (await orderRes.json()).data;
        console.log('Order Created:', order);

        if (!order.referenceId || !order.referenceId.startsWith(campaign.referenceId)) {
            throw new Error(`Invalid Order Ref ID: ${order.referenceId}. Should start with ${campaign.referenceId}`);
        }
        console.log(`✅ Order Ref Valid: ${order.referenceId}`);

        console.log('\n4. Cleaning Up...');
        // Delete Order
        await fetch(`${BASE_url}/orders/${order.id}`, { method: 'DELETE', headers });
        // Delete Campaign
        await fetch(`${BASE_url}/campaigns/${campaign.id}`, { method: 'DELETE', headers });
        console.log('Cleanup complete.');

    } catch (err) {
        console.error('Verification Failed:', err);
    }
}

run();
