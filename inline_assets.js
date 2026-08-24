const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const cssPath = path.join(baseDir, 'assets', 'css', 'style.css');
const css = fs.readFileSync(cssPath, 'utf8');

const pages = ['index.html', 'about.html', 'safety.html', 'careers.html', 'blog.html', 'contact.html'];

pages.forEach(p => {
    const htmlPath = path.join(baseDir, p);
    if (fs.existsSync(htmlPath)) {
        let html = fs.readFileSync(htmlPath, 'utf8');
        html = html.replace(/<link[^>]*rel="stylesheet"[^>]*>/gi, `<style>\n${css}\n</style>`);
        fs.writeFileSync(htmlPath, html, 'utf8');
        console.log(`✓ Embedded CSS in ${p}! New size: ${html.length}`);
    }
});
