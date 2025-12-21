
async function test() {
    try {
        console.log('Testing health check...');
        const healthRes = await fetch('http://localhost:3000/api/health');
        const health = await healthRes.json();
        console.log('Health:', health);

        console.log('Testing login...');
        const loginRes = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123'
            })
        });
        const loginData = await loginRes.json();
        if (!loginData.success) {
            console.error('Login failed:', loginData.error);
            return;
        }
        console.log('Login successful, token received');
        const token = loginData.data.token;

        console.log('Testing campaigns list...');
        const campaignsRes = await fetch('http://localhost:3000/api/campaigns', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const campaignsData = await campaignsRes.json();
        console.log('Campaigns count:', campaignsData.data.length);
        console.log('Success!');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

test();
