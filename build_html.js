
// PAKKA_CACHE_BUST
// Every build shipped assets at the SAME url (?v=17.0), so browsers kept
// serving a cached scene3d-cinematic.js from many versions earlier and the
// page looked unchanged no matter what was fixed. Stamp the build time.
function bustCache(html) {
    const stamp = Date.now().toString(36);
    return html.replace(/(src|href)="(assets\/[^"]+?)(\?v=[^"]*)?"/g,
        (m, attr, path) => `${attr}="${path}?v=${stamp}"`);
}

const fs = require('fs');
const path = require('path');

const baseDir = __dirname;

const data = {
    brand: {
        name: 'Pakka Local',
        tagline: 'Pakka Ride. Pakka Time.',
        short_desc: "India's most dependable first-person ride network. Fixed fares, zero cancellations, ISI helmets, and verified Captains at your doorstep in under 4 minutes."
    },
    how_it_works: [
        { signal: 'red', step: 'STEP 01', title: 'Set Pickup & Destination', desc: 'Choose your ride mode (Bike, Auto, Cab, Parcel, EV, or Outstation). Get upfront fixed pricing with zero surge.' },
        { signal: 'amber', step: 'STEP 02', title: 'Live Captain Matching', desc: 'Verified local Captain accepted in < 15 seconds. Track live telemetry, vehicle plate, and safety credentials.' },
        { signal: 'green', step: 'STEP 03', title: 'Board & Cruise Stress-Free', desc: 'Share 4-digit safety OTP, wear sanitized ISI helmet or enjoy AC cabin, and arrive on time. Pay with UPI or Cash.' }
    ],
    stats: [
        { value: '25M+', label: 'Happy Commuters', sub: 'Across Bharat' },
        { value: '150+', label: 'Indian Cities', sub: 'Active Road Network' },
        { value: '1.5M+', label: 'Verified Captains', sub: 'Earning Daily' },
        { value: '100M+', label: 'Safe Rides Completed', sub: '4.85★ User Rating' }
    ],
    safety_features: [
        { title: '24x7 Emergency SOS Shield', desc: 'Instant live telemetry link to police control room & trusted contacts with 1-tap SOS.' },
        { title: 'Mandatory ISI Helmets & Hairnets', desc: 'Every bike captain carries an ISI-certified sanitized safety helmet and disposable hairnet.' },
        { title: 'Strict Captain Background Checks', desc: 'Police-verified documents, driving license validation, and zero-tolerance safety training.' },
        { title: 'Real-time GPS Route Guard', desc: 'Autonomous monitoring flags route deviations, unauthorized stops, or nighttime delays.' }
    ],
    faqs: [
        { q: 'How is Pakka Local pricing fixed without surge?', a: 'We use distance-based algorithmic slab pricing that guarantees zero surge pricing even during peak office hours and rainy seasons.' },
        { q: 'Are ISI safety helmets sanitized for every ride?', a: 'Yes! Every Pakka Bike Captain carries a certified ISI helmet with fresh disposable hairnets provided for every passenger.' },
        { q: 'How do I register as a Captain and earn daily?', a: 'Click the "Drive with Us" button in the menu or on the homepage. Complete your document verification in under 15 minutes to start earning.' },
        { q: 'How does the in-app SOS emergency shield work?', a: 'Triggering SOS instantly alerts our 24x7 command center, sends your live GPS coordinates to trusted contacts, and links directly to emergency police services.' }
    ],
    cities: ['Bengaluru', 'Hyderabad', 'Mumbai', 'Delhi NCR', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Indore', 'Kochi']
};

function compilePhpToHtml(filename, outputName) {
    const srcPath = path.join(baseDir, filename);
    if (!fs.existsSync(srcPath)) return;

    let html = fs.readFileSync(srcPath, 'utf8');

    // Resolve includes
    html = html.replace(/<\?php\s+include\s+__DIR__\s*\.\s*['"]([^'"]+)['"];\s*\?>/g, (m, inc) => {
        const full = path.join(baseDir, inc);
        if (fs.existsSync(full)) {
            let incContent = fs.readFileSync(full, 'utf8');
            return incContent;
        }
        return '';
    });

    // Replace PHP brand variables
    html = html.replace(/<\?=\s*htmlspecialchars\(\$brand\['name'\]\)\s*\?>/g, data.brand.name);
    html = html.replace(/<\?=\s*htmlspecialchars\(\$brand\['tagline'\]\)\s*\?>/g, data.brand.tagline);
    html = html.replace(/<\?=\s*htmlspecialchars\(\$brand\['short_desc'\]\)\s*\?>/g, data.brand.short_desc);
    html = html.replace(/<\?=\s*json_encode\(\$data[^)]*\)\s*\?>/g, JSON.stringify(data));
    html = html.replace(/<\?=\s*date\('Y'\)\s*\?>/g, new Date().getFullYear().toString());

    // Clean out remaining PHP tags
    html = html.replace(/<\?php[\s\S]*?\?>/g, '');
    html = html.replace(/<\?=[\s\S]*?\?>/g, '');

    // In static HTML files, link internal pages to .html versions for local preview
    html = html.replace(/href="index\.php"/g, 'href="index.html"');
    html = html.replace(/href="about\.php"/g, 'href="about.html"');
    html = html.replace(/href="safety\.php"/g, 'href="safety.html"');
    html = html.replace(/href="careers\.php"/g, 'href="careers.html"');
    html = html.replace(/href="blog\.php"/g, 'href="blog.html"');
    html = html.replace(/href="contact\.php"/g, 'href="contact.html"');

    html = bustCache(html);
    fs.writeFileSync(path.join(baseDir, outputName), html, 'utf8');
    console.log(`✓ ${outputName} generated successfully! (${html.length} bytes)`);
}

// Compile all pages
compilePhpToHtml('index.php', 'index.html');
compilePhpToHtml('about.php', 'about.html');
compilePhpToHtml('safety.php', 'safety.html');
compilePhpToHtml('careers.php', 'careers.html');
compilePhpToHtml('blog.php', 'blog.html');
compilePhpToHtml('contact.php', 'contact.html');
