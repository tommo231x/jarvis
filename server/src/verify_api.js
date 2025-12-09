

// Actually, let's use standard http/https to avoid dependency issues if axios isn't installed.
// Or simpler: use the existing 'models' and 'db' to check logic? No, we want to test the HTTP API.
// Let's use standard fetch (Node 18+) or http.

const http = require('http');

function postRequest(path, data) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });
}

function getRequest(path, token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: path,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.end();
    });
}

async function verify() {
    console.log('1. Logging in as tommo231@gmail.com...');
    try {
        const loginData = JSON.stringify({
            username: 'tommo231@gmail.com',
            password: 'admin231'
        });

        const loginRes = await postRequest('/api/auth/login', loginData);

        if (loginRes.status !== 200) {
            console.error('Login Failed:', loginRes.status, loginRes.data);
            process.exit(1);
        }

        const token = loginRes.data.token;
        console.log('Login Successful. Token obtained.');

        console.log('\n2. Fetching Identities...');
        const identitiesRes = await getRequest('/api/identities', token);

        if (identitiesRes.status !== 200) {
            console.error('Fetch Identities Failed:', identitiesRes.status);
            process.exit(1);
        }

        const identities = identitiesRes.data;
        const tommoIdentity = identities.find(i => i.name === 'Tommo');

        if (tommoIdentity) {
            console.log('[PASS] Found Identity "Tommo":', tommoIdentity.id);
        } else {
            console.error('[FAIL] Identity "Tommo" NOT FOUND. Identities:', identities.map(i => i.name));
        }

        console.log('\n3. Fetching Services...');
        const servicesRes = await getRequest('/api/services', token);
        const services = servicesRes.data;

        // Check if any service is owned by the Tommo ID found (or expected id-tommo)
        const tommoServices = services.filter(s => s.ownerIdentityIds && s.ownerIdentityIds.includes('id-tommo'));
        console.log(`[PASS] Found ${tommoServices.length} services owned by "id-tommo".`);

    } catch (err) {
        console.error('Verification Error:', err);
    }
}

verify();
