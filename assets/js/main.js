/**
 * PAKKA LOCAL — MAIN DRIVE CONTROLLER & DYNAMIC HUD SYNCHRONIZER (V8.0)
 * Integrates Lenis smooth scroll, GSAP ScrollTrigger, MiniMap HUD, Cockpit Speedometer,
 * Auto-Cruise, Auto-Hiding Top Navigation Menu, and Banner-Only Dynamic Floating HUD Card.
 */

let lenis = null;
let isAutoCruising = false;
let autoCruiseInterval = null;
let currentProgress = 0.0;
let lastScrollY = 0;
let lastScrollTime = performance.now();
let smoothedSpeed = 0;
let isDayMode = false;
let currentActiveService = null;
let isHeaderTemporarilyShown = false;

// Precise Banner-Only Proximity Ranges (HUD card appears ONLY when the 3D banner is in view!)
const serviceData = {
    bike: {
        key: 'bike',
        badge: 'HOARDING 01 // SOLO RUSH',
        price: 'Fares from ₹29',
        title: 'Pakka Bike Taxi',
        slogan: 'Beat the jam. Solo. Sanitized ISI helmet included.',
        image: 'assets/images/billboard-bike.jpg',
        eta: '⚡ 3 - 5 mins pickup',
        feats: [
            'Sanitized ISI Helmets & Hairnets',
            'Guaranteed Pre-fixed Pricing (No surge)',
            'Nimble commute through congested bottlenecks'
        ],
        btnLabel: 'Book Pakka Bike Now →',
        range: [0.12, 0.18] // Banner at 0.15
    },
    auto: {
        key: 'auto',
        badge: 'HOARDING 02 // THREE WHEELS',
        price: 'Fares from ₹49',
        title: 'Pakka Auto Rickshaw',
        slogan: "The city's favourite 3 wheels. Zero bargaining guaranteed.",
        image: 'assets/images/billboard-auto.jpg',
        eta: '⚡ 4 - 6 mins pickup',
        feats: [
            'Doorstep Arrival — No auto stand walks',
            'Fair Digital Metering (Zero extra demands)',
            'Spacious seating for 3 with shopping luggage'
        ],
        btnLabel: 'Book Pakka Auto Now →',
        range: [0.27, 0.33] // Banner at 0.30
    },
    cab: {
        key: 'cab',
        badge: 'HOARDING 03 // AC PRIME COMFORT',
        price: 'Fares from ₹99',
        title: 'Pakka Prime Cab & Sedan',
        slogan: '100% Guaranteed AC Sedans. Clean interiors & top captains.',
        image: 'assets/images/billboard-cab.jpg',
        eta: '⚡ 5 - 7 mins pickup',
        feats: [
            '100% Guaranteed AC in Clean Sedans',
            'Top 4.85★ Verified Captains with clean cars',
            'Advance scheduled bookings for meetings & airport'
        ],
        btnLabel: 'Book Prime Cab Now →',
        range: [0.42, 0.48] // Banner at 0.45
    },
    parcel: {
        key: 'parcel',
        badge: 'HOARDING 04 // SAME-DAY LOGISTICS',
        price: 'Starts @ ₹39',
        title: 'Pakka Parcel Express',
        slogan: "Send it. Don't drive it. Same-day instant doorstep pickup & delivery.",
        image: 'assets/images/billboard-parcel.jpg',
        eta: '⚡ Pickup in 10 mins',
        feats: [
            'Live GPS Tracking with Delivery OTP Verification',
            'Send keys, chargers, lunch dabbas & business docs',
            'Transit damage protection included'
        ],
        btnLabel: 'Send a Parcel Now →',
        range: [0.57, 0.63] // Banner at 0.60
    },
    ev: {
        key: 'ev',
        badge: 'HOARDING 05 // 100% ELECTRIC',
        price: 'Starts @ ₹35',
        title: 'Pakka EV Green Fleet',
        slogan: '100% Electric. Zero Emission. Eco-friendly & whisper quiet.',
        image: 'assets/images/billboard-ev.jpg',
        eta: '⚡ 4 - 6 mins pickup',
        feats: [
            'Zero Carbon Emissions on every kilometer',
            'Silent, vibration-free smooth electric drive',
            'Earn special green commute reward coins'
        ],
        btnLabel: 'Book Pakka EV Now →',
        range: [0.69, 0.75] // Banner at 0.72
    },
    outstation: {
        key: 'outstation',
        badge: 'HOARDING 06 // INTERCITY & AIRPORT',
        price: 'From ₹14/km',
        title: 'Pakka Outstation & Airport',
        slogan: 'Highway ready luxury SUVs & sedans for family getaways.',
        image: 'assets/images/billboard-outstation.jpg',
        eta: '⚡ 24x7 Scheduled Trips',
        feats: [
            'Verified Highway Captains (5+ yrs exp)',
            'Transparent tolls & state permit pricing',
            'Spacious 6/7-seater SUVs (Innova, Ertiga, Scorpio)'
        ],
        btnLabel: 'Book Outstation SUV Now →',
        range: [0.81, 0.87] // Banner at 0.84
    }
};

// Zone Definitions for MiniMap HUD
const zones = [
    { start: 0.00, end: 0.12, name: 'Boulevard Start' },
    { start: 0.12, end: 0.18, name: 'Pakka Bike Hoarding' },
    { start: 0.18, end: 0.27, name: 'Corner Right Turn' },
    { start: 0.27, end: 0.33, name: 'Pakka Auto Highway' },
    { start: 0.33, end: 0.42, name: 'Flyover Ramp Climb' },
    { start: 0.42, end: 0.48, name: 'Prime Cab Elevated Viaduct' },
    { start: 0.48, end: 0.57, name: 'Flyover Descent & Left Turn' },
    { start: 0.57, end: 0.63, name: 'Parcel Logistics Pass' },
    { start: 0.63, end: 0.69, name: 'Clean Energy Turn' },
    { start: 0.69, end: 0.75, name: 'EV Green Corridor' },
    { start: 0.75, end: 0.81, name: 'Intercity Highway Merge' },
    { start: 0.81, end: 0.87, name: 'Outstation Airport Portal' },
    { start: 0.87, end: 0.93, name: 'Signal Intersection' },
    { start: 0.93, end: 0.97, name: 'Metro Viaduct Telemetry' },
    { start: 0.97, end: 1.00, name: 'Dawn Horizon Arrival' }
];

function initAllApp() {
    initLoader();
    initSmoothScroll();
    initScrollTriggers();
    initThemePreference();
    initHeaderHoverTrigger();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllApp);
} else {
    initAllApp();
}

// Query parameter progress preview (e.g. ?p=0.15 for Bike, ?p=0.30 for Auto, ?p=0.45 for Cab)
const urlParams = new URLSearchParams(window.location.search);
const pParam = urlParams.get('p');
if (pParam !== null && window.pakka3D) {
    const targetP = parseFloat(pParam);
    setTimeout(() => {
        window.pakka3D.updateDriveProgress(targetP);
    }, 500);
}

/* ================= 1. THEME SWITCHER ================= */
function initThemePreference() {
    const urlParams = new URLSearchParams(window.location.search);
    const themeParam = urlParams.get('theme') || urlParams.get('day');

    if (themeParam === 'day' || themeParam === '1' || themeParam === 'true') {
        setDayMode(true);
        return;
    } else if (themeParam === 'night' || themeParam === '0' || themeParam === 'false') {
        setDayMode(false);
        return;
    }

    try {
        const savedTheme = localStorage.getItem('pl_theme');
        if (savedTheme === 'day') {
            setDayMode(true);
        } else {
            setDayMode(false);
        }
    } catch (e) {
        setDayMode(false);
    }
}

function toggleDayNightMode() {
    setDayMode(!isDayMode);
}

function setDayMode(day) {
    isDayMode = !!day;
    try {
        localStorage.setItem('pl_theme', isDayMode ? 'day' : 'night');
    } catch (e) {}

    const htmlEl = document.documentElement;
    const bodyEl = document.body;
    const themeBtn = document.getElementById('theme-toggle');
    const sunIcon = themeBtn?.querySelector('.theme-icon-sun');
    const moonIcon = themeBtn?.querySelector('.theme-icon-moon');

    if (isDayMode) {
        htmlEl.setAttribute('data-theme', 'day');
        htmlEl.classList.add('pl-light-mode');
        htmlEl.classList.remove('pl-dark');
        bodyEl.classList.add('pl-light-mode');
        bodyEl.classList.remove('pl-dark');
        if (sunIcon) sunIcon.classList.remove('hidden');
        if (moonIcon) moonIcon.classList.add('hidden');
    } else {
        htmlEl.setAttribute('data-theme', 'night');
        htmlEl.classList.remove('pl-light-mode');
        htmlEl.classList.add('pl-dark');
        bodyEl.classList.remove('pl-light-mode');
        bodyEl.classList.add('pl-dark');
        if (sunIcon) sunIcon.classList.add('hidden');
        if (moonIcon) moonIcon.classList.remove('hidden');
    }

    if (window.pakka3D && typeof window.pakka3D.setDayNightMode === 'function') {
        window.pakka3D.setDayNightMode(isDayMode);
    }

    if (window.pakkaAudio) {
        window.pakkaAudio.playBeep(isDayMode ? 750 : 450, 0.08);
    }
}

/* ================= 2. LOADER SEQUENCE ================= */
function initLoader() {
    const loader = document.getElementById('pl-loader');
    if (!loader) return;

    const progressBar = document.getElementById('loader-progress-bar');
    const pctLabel = document.getElementById('loader-pct');
    const statusLabel = document.getElementById('loader-status');

    if (progressBar) progressBar.style.width = '100%';
    if (pctLabel) pctLabel.textContent = '100%';
    if (statusLabel) statusLabel.textContent = 'Engine Ready. Ignition!';

    setTimeout(() => {
        loader.classList.add('loaded');
        setTimeout(() => {
            if (loader.parentNode) loader.style.display = 'none';
        }, 300);
    }, 200);
}

/* ================= 3. LENIS SMOOTH SCROLL & HEADER AUTO-HIDE ================= */
function initSmoothScroll() {
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.5,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            smoothTouch: false,
            wheelMultiplier: 0.95
        });

        lenis.on('scroll', onScrollUpdate);

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    } else {
        window.addEventListener('scroll', onScrollUpdate);
    }
}

function initHeaderHoverTrigger() {
    const header = document.getElementById('pl-header');
    if (!header) return;

    window.addEventListener('mousemove', (e) => {
        if (currentProgress > 0.02) {
            if (e.clientY < 50) {
                header.classList.remove('header-hidden');
                isHeaderTemporarilyShown = true;
            } else if (e.clientY > 90 && isHeaderTemporarilyShown) {
                header.classList.add('header-hidden');
                isHeaderTemporarilyShown = false;
            }
        }
    });
}

function onScrollUpdate(e) {
    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    const track = document.getElementById('drive-track-wrapper');
    
    if (track) {
        const trackHeight = track.offsetHeight - window.innerHeight;
        if (trackHeight > 0) {
            currentProgress = Math.max(0, Math.min(scrollY / trackHeight, 1.0));
        } else {
            currentProgress = 0;
        }
    } else {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (maxScroll > 0) currentProgress = Math.max(0, Math.min(scrollY / maxScroll, 1.0));
    }

    // 🌟 AUTO-HIDE TOP HEADER ON SCROLL in 3D drive zone
    const header = document.getElementById('pl-header');
    if (header && !isHeaderTemporarilyShown) {
        if (scrollY > 60 && currentProgress < 0.98) {
            header.classList.add('header-hidden');
        } else {
            header.classList.remove('header-hidden');
        }
    }

    // Update 3D Camera along Winding Spline
    if (window.pakka3D) {
        window.pakka3D.updateDriveProgress(currentProgress);
    }

    // Speedometer & Progress Fill
    const now = performance.now();
    const dt = (now - lastScrollTime) / 1000;
    if (dt > 0.01) {
        const dScroll = Math.abs(scrollY - lastScrollY);
        const rawSpeed = (dScroll / dt) * 0.045;
        smoothedSpeed += (rawSpeed - smoothedSpeed) * 0.18;

        if (window.pakkaAudio) {
            window.pakkaAudio.setSpeed(smoothedSpeed);
        }

        lastScrollY = scrollY;
        lastScrollTime = now;
    }

    updateDynamicActiveServiceHUD(currentProgress);
}

/* ================= 4. DYNAMIC ACTIVE SERVICE HUD (BANNER ONLY!) ================= */
function updateDynamicActiveServiceHUD(progress) {
    const hudContainer = document.getElementById('active-service-hud');
    const zoneLabel = document.getElementById('hud-active-zone-label');
    if (!hudContainer) return;

    let matchedService = null;
    for (const key in serviceData) {
        const svc = serviceData[key];
        if (progress >= svc.range[0] && progress <= svc.range[1]) {
            matchedService = svc;
            break;
        }
    }

    if (matchedService) {
        // Show ONLY while passing the banner!
        currentActiveService = matchedService.key;
        hudContainer.classList.remove('hidden');

        document.getElementById('hud-card-badge').textContent = matchedService.badge;
        document.getElementById('hud-card-price').textContent = matchedService.price;
        document.getElementById('hud-card-img').src = matchedService.image;
        document.getElementById('hud-card-eta').textContent = matchedService.eta;
        document.getElementById('hud-card-title').textContent = matchedService.title;
        document.getElementById('hud-card-slogan').textContent = matchedService.slogan;
        document.getElementById('hud-btn-label').textContent = matchedService.btnLabel;

        const featsList = document.getElementById('hud-card-feats');
        if (featsList) {
            featsList.innerHTML = matchedService.feats.map(f => `<li>✓ ${f}</li>`).join('');
        }

        if (zoneLabel) zoneLabel.textContent = matchedService.title.toUpperCase();
    } else {
        // 🌟 When driving on open road/corner turns between banners, completely disappear!
        hudContainer.classList.add('hidden');
        currentActiveService = null;

        const currentZone = zones.find(z => progress >= z.start && progress <= z.end);
        if (zoneLabel && currentZone) {
            zoneLabel.textContent = currentZone.name.toUpperCase();
        }
    }

    // Top Nav Link Highlights
    const navLinks = document.querySelectorAll('.pl-nav .nav-link');
    navLinks.forEach(link => {
        const targetProg = parseFloat(link.getAttribute('data-scroll-target'));
        if (targetProg && Math.abs(progress - targetProg) < 0.08) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function openActiveServiceModal() {
    if (typeof openBookingModal === 'function') {
        openBookingModal(currentActiveService || 'bike');
    }
}

/* ================= 5. GTA 5 TACTICAL RADAR HUD & VEHICLE SWITCHER ================= */
function updateGtaRadarHUD(progress) {
    const activeRoute = document.getElementById('gta-radar-active-route');
    const playerBlip = document.getElementById('gta-player-blip');
    const streetLabel = document.getElementById('gta-street-name');
    const districtLabel = document.getElementById('gta-district-name');
    const hpFill = document.getElementById('gta-hp-fill');
    const hpVal = document.getElementById('gta-hp-val');
    const armFill = document.getElementById('gta-arm-fill');
    const armVal = document.getElementById('gta-arm-val');

    // Route line fill
    if (activeRoute) {
        const offset = 260 - (progress * 260);
        activeRoute.style.strokeDashoffset = offset;
    }

    // Player Blip position & rotation on tactical radar
    if (playerBlip) {
        const t = progress;
        const px = 20 + t * 165;
        const py = 110 - t * 95 + Math.sin(t * Math.PI * 2) * 8;
        const angleDeg = (t * 360 * 1.2) % 360;
        playerBlip.setAttribute('transform', `translate(${px}, ${py}) rotate(${angleDeg})`);
    }

    // GTA 5 Street & District Names based on progress
    if (streetLabel && districtLabel) {
        if (progress < 0.18) {
            streetLabel.textContent = 'INDIRANAGAR 100FT RD';
            districtLabel.textContent = 'DOWNTOWN';
        } else if (progress < 0.38) {
            streetLabel.textContent = 'NATIONAL ARENA BLVD';
            districtLabel.textContent = 'SPORTS DISTRICT';
        } else if (progress < 0.58) {
            streetLabel.textContent = 'CENTRAL TERMINAL INTERCHANGE';
            districtLabel.textContent = 'METRO CORRIDOR';
        } else if (progress < 0.78) {
            streetLabel.textContent = 'ELECTRONIC CITY FLYOVER';
            districtLabel.textContent = 'TECH HUB';
        } else {
            streetLabel.textContent = 'KEMPEGOWDA AIRPORT EXPRESSWAY';
            districtLabel.textContent = 'AIRPORT T2';
        }
    }

    // Telemetry Bars (HP & Armor)
    if (hpFill && hpVal) {
        const hp = Math.max(90, Math.min(100, Math.round(96 + Math.sin(progress * 10) * 4)));
        hpFill.style.width = hp + '%';
        hpVal.textContent = hp + '%';
    }

    if (armFill && armVal) {
        const arm = Math.max(88, Math.min(100, Math.round(98 - progress * 8)));
        armFill.style.width = arm + '%';
        armVal.textContent = arm + '%';
    }

    // Update active state on vehicle switcher buttons
    const vehMap = [
        { key: 'bike', range: [0.0, 0.22] },
        { key: 'auto', range: [0.22, 0.42] },
        { key: 'cab', range: [0.42, 0.58] },
        { key: 'parcel', range: [0.58, 1.0] }
    ];

    vehMap.forEach(v => {
        const btn = document.getElementById(`gta-veh-${v.key}`);
        if (btn) {
            if (progress >= v.range[0] && progress < v.range[1]) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    });
}

window.selectGtaVehicle = function(vehicleKey, targetProgress) {
    const btn = document.getElementById(`gta-veh-${vehicleKey}`);
    document.querySelectorAll('.gta-veh-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    window.scrollToProgress(targetProgress);
};

window.cycleGtaCameraMode = function() {
    if (window.pakka3D && typeof window.pakka3D.cycleCameraMode === 'function') {
        const mode = window.pakka3D.cycleCameraMode();
        const lbl = document.getElementById('gta-cam-mode-label');
        if (lbl) {
            lbl.textContent = `CAM: ${mode.toUpperCase()}`;
        }
        if (window.pakkaAudio) {
            window.pakkaAudio.playBeep(640, 0.06);
        }
    }
};

// Keyboard Shortcuts: 1-4 for Vehicles, V for Camera
window.addEventListener('keydown', (e) => {
    if (['input', 'textarea', 'select'].includes(document.activeElement?.tagName?.toLowerCase())) return;
    
    if (e.key === '1') {
        window.selectGtaVehicle('bike', 0.15);
    } else if (e.key === '2') {
        window.selectGtaVehicle('auto', 0.30);
    } else if (e.key === '3') {
        window.selectGtaVehicle('cab', 0.50);
    } else if (e.key === '4') {
        window.selectGtaVehicle('parcel', 0.62);
    } else if (e.key === 'v' || e.key === 'V' || e.key === 'c' || e.key === 'C') {
        window.cycleGtaCameraMode();
    }
});

/* ================= 6. CLICK-TO-SCROLL TO PROGRESS ================= */
window.scrollToProgress = function(targetProgress) {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const targetScrollY = targetProgress * maxScroll;

    if (lenis) {
        lenis.scrollTo(targetScrollY, { duration: 1.5 });
    } else {
        window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
    }

    if (window.pakkaAudio) {
        window.pakkaAudio.playBeep(520, 0.08);
    }
};

/* ================= 7. AUTO-CRUISE MODE ================= */
function toggleAutoCruise() {
    isAutoCruising = !isAutoCruising;
    const btn = document.getElementById('cruise-toggle');

    if (btn) {
        if (isAutoCruising) {
            btn.classList.add('active');
            btn.querySelector('.cruise-text').textContent = 'CRUISING';
            startAutoCruise();
            if (window.pakkaAudio && window.pakkaAudio.isMuted) {
                window.pakkaAudio.toggleMute();
            }
        } else {
            btn.classList.remove('active');
            btn.querySelector('.cruise-text').textContent = 'CRUISE';
            stopAutoCruise();
        }
    }
}

function startAutoCruise() {
    if (autoCruiseInterval) clearInterval(autoCruiseInterval);
    autoCruiseInterval = setInterval(() => {
        if (!isAutoCruising) return;
        let nextProg = currentProgress + 0.0010;
        if (nextProg >= 0.999) nextProg = 0.0;
        window.scrollToProgress(nextProg);
    }, 40);
}

function stopAutoCruise() {
    if (autoCruiseInterval) {
        clearInterval(autoCruiseInterval);
        autoCruiseInterval = null;
    }
}

function initScrollTriggers() {
    document.querySelectorAll('.nav-link[data-scroll-target]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = parseFloat(link.getAttribute('data-scroll-target'));
            window.scrollToProgress(target);
        });
    });

    // Auto Screenshot Export Trigger
    const urlParams = new URLSearchParams(window.location.search);
    const exportName = urlParams.get('export_shot');
    if (exportName) {
        setTimeout(() => {
            if (window.pakka3D && window.pakka3D.renderer && window.pakka3D.canvas) {
                const pParam = urlParams.get('p');
                if (pParam !== null) {
                    const progVal = parseFloat(pParam);
                    window.pakka3D.progress = progVal;
                    window.pakka3D.targetProgress = progVal;
                    window.pakka3D.updateDriveProgress(progVal);
                }
                window.pakka3D.renderer.render(window.pakka3D.scene, window.pakka3D.camera);
                const dataUrl = window.pakka3D.canvas.toDataURL('image/png');
                fetch('/api/save-screenshot', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filename: exportName, image: dataUrl })
                }).then(() => console.log('Exported screenshot successfully: ' + exportName));
            }
        }, 1200);
    }
}
