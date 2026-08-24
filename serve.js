const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME = {
    '.html': 'text/html; charset=UTF-8',
    '.js': 'application/javascript; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.json': 'application/json'
};

const server = http.createServer((req, res) => {
    let p = req.url.split('?')[0];
    if (p === '/' || p === '') p = 'index.html';
    if (p.startsWith('/')) p = p.slice(1);
    
    const filePath = path.join(__dirname, p);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.log(`404: ${p} (${filePath})`);
            res.writeHead(404, { 'Content-Type': 'text/plain', 'Content-Length': '13' });
            res.end('404 Not Found');
            return;
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 
            'Content-Type': MIME[ext] || 'application/octet-stream',
            'Content-Length': data.length 
        });
        res.end(data);
    });
});

server.listen(3000, '127.0.0.1', () => {
    console.log('⚡ Pure Static Server listening on http://127.0.0.1:3000');
});
