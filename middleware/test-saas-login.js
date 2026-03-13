const fetch = require('node-fetch');
const config = {
    url: 'https://guardianservice.app',
    username: 'camichichet',
    password: 'test'
};

async function testLogin() {
    console.log(`Testing login for ${config.username} at ${config.url}`);
    try {
        const loginRes = await fetch(`${config.url}/api/v1/accounts/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: config.username, password: config.password })
        });
        
        console.log(`Login status: ${loginRes.status}`);
        if (loginRes.ok) {
            const data = await loginRes.json();
            console.log('Login successful!');
            console.log(`RefreshToken: ${data.refreshToken ? 'Yes' : 'No'}`);
            
            const tokenRes = await fetch(`${config.url}/api/v1/accounts/access-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: data.refreshToken })
            });
            
            console.log(`Token status: ${tokenRes.status}`);
            if (tokenRes.ok) {
                const tokenData = await tokenRes.json();
                console.log('AccessToken obtained!');
            }
        } else {
            const text = await loginRes.text();
            console.log(`Login failed text: ${text}`);
        }
    } catch (err) {
        console.error(`Error: ${err.message}`);
    }
}

testLogin();
