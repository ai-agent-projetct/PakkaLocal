/**
 * PAKKA LOCAL — LOCAL DEVELOPMENT SERVER (PHP & Node Fallback Engine)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

let PORT = parseInt(process.env.PORT, 10) || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.php': 'text/html; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.js': 'application/javascript; charset=UTF-8',
    '.json': 'application/json; charset=UTF-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];
    if (reqUrl === '/' || reqUrl === '') {
        reqUrl = '/index.html';
    }

    const filePath = path.join(PUBLIC_DIR, reqUrl);
    const ext = path.extname(filePath).toLowerCase();

    // Screenshot saving API
    if (reqUrl === '/api/save-screenshot' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const filename = data.filename || 'screenshot.png';
                const base64Data = data.image.replace(/^data:image\/png;base64,/, '');
                const savePath = path.join('C:/Users/aakas/.gemini/antigravity/brain/b3f31bbf-9f1e-419d-963f-c8e6247174d9', filename);
                fs.writeFileSync(savePath, base64Data, 'base64');
                console.log(`Saved screenshot: ${savePath}`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'ok', path: savePath }));
            } catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'error', message: e.message }));
            }
        });
        return;
    }

    // Check if PHP file requested
    if (ext === '.php') {
        handlePhpFallback(req, res, reqUrl, filePath);
        return;
    }

    // Serve static files
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }

        const mime = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': mime });
        res.end(data);
    });
});

function handlePhpFallback(req, res, reqUrl, filePath) {
    if (reqUrl.includes('/api/calculate-fare.php')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            service_id: 'bike',
            service_name: 'Pakka Bike',
            distance_km: 7.2,
            duration_mins: '15 mins',
            base_fare: 29,
            total_fare: 115,
            formatted_fare: '₹115',
            eta: '3 - 5 mins',
            time_anchor: 'Pickup in ~5 min',
            price_anchor: 'Fares from ₹29'
        }));
        return;
    }

    if (reqUrl.includes('/api/book-ride.php')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            booking_id: 'PL-8A4F19',
            status: 'CAPTAIN_ASSIGNED',
            otp: String(Math.floor(1000 + Math.random() * 9000)),
            eta_arrival: '3 mins',
            distance_km: '7.2 km',
            total_fare: '₹115',
            service: 'Pakka Bike',
            captain: {
                name: 'Suresh Kumar',
                rating: 4.92,
                total_rides: 4820,
                vehicle_number: 'Honda Shine • KA 01 EQ 4421',
                avatar_initials: 'SK'
            },
            message: 'Pakka Captain assigned! Share your 4-digit OTP upon boarding.'
        }));
        return;
    }

    if (reqUrl.includes('/api/captain-register.php')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            application_id: 'CAP-' + Math.floor(100000 + Math.random() * 900000),
            estimated_monthly_earnings: '₹32,000 - ₹38,500',
            message: 'Application received! Onboarding partner will call you in < 2 hours.'
        }));
        return;
    }

    if (reqUrl.includes('/api/contact-sos.php')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            incident_id: 'SOS-' + Date.now(),
            helpline: '1800-72552-7233',
            message: 'Emergency protocol activated.'
        }));
        return;
    }

    // Default: Process PHP include directives cleanly
    fs.readFile(filePath, 'utf8', (err, raw) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }

        let rendered = raw;

        // Safe include processor with cycle detection
        const resolveIncludes = (content, baseDir, visited = new Set()) => {
            return content.replace(/<\?php\s+(?:include|require_once|include_once)\s+__DIR__\s*\.\s*['"]([^'"]+)['"];\s*\?>/g, (match, incPath) => {
                try {
                    const fullInc = path.normalize(path.join(baseDir, incPath));
                    if (visited.has(fullInc)) return '';
                    visited.add(fullInc);
                    if (fs.existsSync(fullInc)) {
                        const incContent = fs.readFileSync(fullInc, 'utf8');
                        return resolveIncludes(incContent, path.dirname(fullInc), visited);
                    }
                    return '';
                } catch (e) {
                    return '';
                }
            });
        };

        rendered = resolveIncludes(rendered, path.dirname(filePath));

        // Clean replacements for common PHP tags
        rendered = rendered.replace(/<\?=\s*htmlspecialchars\(\$brand\['name'\]\)\s*\?>/g, 'Pakka Local');
        rendered = rendered.replace(/<\?=\s*htmlspecialchars\(\$brand\['tagline'\]\)\s*\?>/g, 'Pakka Ride. Pakka Time.');
        rendered = rendered.replace(/<\?=\s*htmlspecialchars\(\$brand\['short_desc'\]\)\s*\?>/g, "India's most dependable first-person ride network.");
        rendered = rendered.replace(/<\?=\s*json_encode\(\$data[^)]*\)\s*\?>/g, 'window.PL_CONFIG');

        // Clean out remaining PHP tags safely without leaving dangling syntax
        rendered = rendered.replace(/<\?php[\s\S]*?\?>/g, '');
        rendered = rendered.replace(/<\?=[\s\S]*?\?>/g, '');

        res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
        res.end(rendered);
    });
}

function startServer(portToTry) {
    server.listen(portToTry, '0.0.0.0', () => {
        console.log(`\n=================================================`);
        console.log(`⚡ PAKKA LOCAL 3D SCROLL-DRIVE EXPERIENCE RUNNING`);
        console.log(`   URL: http://localhost:${portToTry}`);
        console.log(`   Mode: PHP / Node Dev Server`);
        console.log(`=================================================\n`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${portToTry} in use, trying port ${portToTry + 1}...`);
            startServer(portToTry + 1);
        } else {
            console.error(err);
        }
    });
}

startServer(PORT);
