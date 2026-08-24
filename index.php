<?php
/**
 * PAKKA LOCAL — 3D SCROLL-DRIVE & MULTI-SECTION MOBILITY PORTAL
 * "Pakka Ride. Pakka Time."
 */

$data = require_once __DIR__ . '/includes/services_data.php';
$brand = $data['brand'];
$services = $data['services'];
?>
<!DOCTYPE html>
<html lang="en" class="pl-dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title><?= htmlspecialchars($brand['name']) ?> — <?= htmlspecialchars($brand['tagline']) ?></title>
    <meta name="description" content="<?= htmlspecialchars($brand['short_desc']) ?>">
    <meta name="theme-color" content="#08080A">

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@500;700&family=Syne:wght@700;800;900&display=swap" rel="stylesheet">

    <!-- Stylesheet -->
    <link rel="stylesheet" href="assets/css/style.css?v=16.0">

    <!-- Config Fallback -->
    <script src="assets/js/config.js?v=16.0"></script>
    <script>
        (function() {
            const urlParams = new URLSearchParams(window.location.search);
            const theme = urlParams.get('theme') || urlParams.get('day');
            if (theme === 'day' || theme === '1' || theme === 'true') {
                document.documentElement.classList.add('pl-light-mode');
                document.documentElement.classList.remove('pl-dark');
            } else if (theme === 'night' || theme === '0' || theme === 'false') {
                document.documentElement.classList.remove('pl-light-mode');
                document.documentElement.classList.add('pl-dark');
            } else {
                try {
                    if (localStorage.getItem('pl_theme') === 'day') {
                        document.documentElement.classList.add('pl-light-mode');
                        document.documentElement.classList.remove('pl-dark');
                    }
                } catch(e) {}
            }
        })();
        if (typeof window.PL_CONFIG === 'undefined') {
            window.PL_CONFIG = <?= json_encode($data, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP) ?>;
        }
    </script>
</head>
<body class="bg-pl-black text-pl-white antialiased selection:bg-pl-gold selection:text-black">

    <!-- ================= CINEMATIC LOADER ================= -->
    <?php if (!isset($_GET['noloader'])): ?>
    <div id="pl-loader" class="pl-loader">
        <div class="loader-content">
            <div class="loader-brand">
                <span class="loader-logo">PAKKA <span class="text-gold">LOCAL</span></span>
                <span class="loader-tag">INITIALIZING 3D ROAD NETWORK</span>
            </div>

            <div class="loader-road-track">
                <div id="loader-car" class="loader-vehicle">🛵</div>
                <div id="loader-progress-bar" class="loader-bar"></div>
            </div>

            <div class="loader-metrics">
                <span class="loader-status-text" id="loader-status">Loading City Highway & 3D Fleet...</span>
                <span class="loader-counter" id="loader-pct">0%</span>
            </div>
        </div>
    </div>
    <?php endif; ?>

    <!-- ================= FIXED HEADER ================= -->
    <?php include __DIR__ . '/includes/header.php'; ?>

    <!-- ================= STICKY 3D SCROLL-DRIVE CONTAINER ================= -->
    <div id="drive-track-wrapper" class="drive-track-wrapper">
        
        <!-- Pinned 3D WebGL Canvas Layer -->
        <div id="canvas-container" class="canvas-container">
            <canvas id="webgl-canvas"></canvas>
        </div>

        <!-- Dynamic Floating Service Showcase HUD Card (Left Side during 3D Drive) -->
        <div id="active-service-hud" class="active-service-hud hidden">
            <div class="service-hud-card" id="hud-card-inner">
                <div class="hud-card-badge-row">
                    <span class="hud-badge-gold" id="hud-card-badge">HOARDING 01 // SOLO RUSH</span>
                    <span class="hud-price-pill" id="hud-card-price">Fares from ₹29</span>
                </div>

                <div class="hud-thumb-wrap">
                    <img id="hud-card-img" src="assets/images/billboard-bike.jpg" alt="Service Preview" class="hud-thumb-img">
                    <div class="hud-thumb-overlay"></div>
                    <div class="hud-eta-tag" id="hud-card-eta">⚡ 3 - 5 mins pickup</div>
                </div>

                <h2 class="hud-card-title" id="hud-card-title">Pakka Bike Taxi</h2>
                <p class="hud-card-slogan" id="hud-card-slogan">Beat the jam. Solo. ISI Helmet included.</p>

                <ul class="hud-card-feats" id="hud-card-feats">
                    <li>✓ Sanitized ISI Helmets & Hairnets</li>
                    <li>✓ Guaranteed Pre-fixed Pricing</li>
                    <li>✓ Nimble commute through city traffic</li>
                </ul>

                <div class="hud-card-action">
                    <button class="btn-gold-action" id="hud-card-btn" onclick="openActiveServiceModal()">
                        <span id="hud-btn-label">Book Pakka Bike Now →</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- 3D Scroll Spacers (400vh Drive Experience) -->
        <div class="drive-scroll-track">
            <!-- Hero Entrance -->
            <section id="scene-hero" class="drive-scene scene-hero">
                <div class="scene-content hero-content">
                    <div class="hero-tag-pill">
                        <span class="pulse-dot"></span>
                        <span>BHARAT MOVES ON PAKKA LOCAL // 24x7</span>
                    </div>
                    <h1 class="hero-title">
                        PAKKA <span class="text-gold">LOCAL</span>
                    </h1>
                    <p class="hero-slogan">
                        Pakka Ride. Pakka Time.
                    </p>
                    <p class="hero-desc">
                        India's most dependable ride network. Fixed fares, zero cancellations, ISI helmets, and verified Captains at your doorstep in under 4 minutes.
                    </p>

                    <!-- Quick Booking Bar -->
                    <div class="hero-quick-bar">
                        <div class="quick-bar-field" onclick="openBookingModal('bike')">
                            <span class="quick-bar-icon">📍</span>
                            <div class="quick-bar-text">
                                <span class="q-label">PICKUP LOCATION</span>
                                <span class="q-val">Indiranagar 100ft Rd, Bengaluru</span>
                            </div>
                        </div>
                        <div class="quick-bar-divider"></div>
                        <div class="quick-bar-field" onclick="openBookingModal('bike')">
                            <span class="quick-bar-icon">🏁</span>
                            <div class="quick-bar-text">
                                <span class="q-label">WHERE TO?</span>
                                <span class="q-val">Search destination or landmark...</span>
                            </div>
                        </div>
                        <button class="btn-gold-pill" onclick="openBookingModal('bike')">
                            <span>Ride Now →</span>
                        </button>
                    </div>

                    <!-- Scroll Prompt -->
                    <div class="hero-scroll-prompt" onclick="window.scrollToProgress && window.scrollToProgress(0.20)">
                        <span class="prompt-text">SCROLL TO DRIVE FORWARD</span>
                        <div class="scroll-arrow-anim">↓</div>
                    </div>
                </div>
            </section>

            <!-- Spline Highway Spacers -->
            <div class="drive-spacer" style="height: 80vh;"></div>
            <div class="drive-spacer" style="height: 80vh;"></div>
            <div class="drive-spacer" style="height: 80vh;"></div>
            <div class="drive-spacer" style="height: 80vh;"></div>
        </div>
    </div>

    <!-- ================= POST-DRIVE CONTENT SECTIONS (SCROLLS DOWN AFTER 3D DRIVE) ================= -->
    <main id="post-drive-content" class="post-drive-content">

        <!-- ================= 1. HOW PAKKA LOCAL WORKS ================= -->
        <section id="how-it-works" class="content-section sec-how-it-works">
            <div class="section-container">
                <div class="section-head text-center">
                    <span class="badge-gold">4 SIMPLE STEPS // INSTANT BOOKING</span>
                    <h2 class="section-heading">How Pakka Local Works</h2>
                    <p class="section-subheading">From your doorstep to your destination in 4 seamless, transparent steps.</p>
                </div>

                <div class="steps-grid-4">
                    <div class="step-card">
                        <div class="step-badge-num">01</div>
                        <div class="step-icon">📍</div>
                        <h3 class="step-title">Set Pickup & Drop</h3>
                        <p class="step-text">Choose your pickup address or let GPS auto-detect your location. Enter your drop destination to see pre-fixed fares instantly.</p>
                    </div>

                    <div class="step-card">
                        <div class="step-badge-num">02</div>
                        <div class="step-icon">⚡</div>
                        <h3 class="step-title">Match in Under 60s</h3>
                        <p class="step-text">Our hyper-local dispatch matches you with the nearest verified Captain across Bike, Auto, or Cab in under a minute.</p>
                    </div>

                    <div class="step-card">
                        <div class="step-badge-num">03</div>
                        <div class="step-icon">🛡️</div>
                        <h3 class="step-title">Safe & Insured Ride</h3>
                        <p class="step-text">Verify your 4-digit OTP, wear your sanitized ISI helmet, and enjoy live GPS ride tracking with ₹5 Lakh insurance coverage.</p>
                    </div>

                    <div class="step-card">
                        <div class="step-badge-num">04</div>
                        <div class="step-icon">💳</div>
                        <h3 class="step-title">Cashless & Fixed Fare</h3>
                        <p class="step-text">Arrive on time and pay transparently via UPI, Cards, or Cash. No surge pricing, no meter haggling, zero surprises.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- ================= 2. INDIA MOVES WITH PAKKA LOCAL (IMPACT & STATS) ================= -->
        <section id="impact-stats" class="content-section sec-impact-stats">
            <div class="section-container">
                <div class="section-head text-center">
                    <span class="badge-gold">NATIONAL REACH // PROVEN SCALE</span>
                    <h2 class="section-heading">India Moves with Pakka Local</h2>
                    <p class="section-subheading">Revolutionising daily urban commutes across metro cities and Tier 2/3 hubs.</p>
                </div>

                <div class="stats-counters-grid">
                    <div class="counter-card">
                        <div class="counter-num text-gold">25M+</div>
                        <div class="counter-label">Happy Commuters</div>
                        <div class="counter-sub">Across Bharat</div>
                    </div>
                    <div class="counter-card">
                        <div class="counter-num text-gold">150+</div>
                        <div class="counter-label">Indian Cities</div>
                        <div class="counter-sub">Active Road Network</div>
                    </div>
                    <div class="counter-card">
                        <div class="counter-num text-gold">1.5M+</div>
                        <div class="counter-label">Verified Captains</div>
                        <div class="counter-sub">Earning Daily</div>
                    </div>
                    <div class="counter-card">
                        <div class="counter-num text-gold">100M+</div>
                        <div class="counter-label">Safe Rides Completed</div>
                        <div class="counter-sub">4.85★ User Rating</div>
                    </div>
                </div>

                <div class="impact-features-row">
                    <div class="impact-feat-item">
                        <span class="impact-check">✓</span>
                        <div>
                            <strong>70% Faster Commutes</strong>
                            <p>Bypass gridlock traffic bottlenecks during peak hours.</p>
                        </div>
                    </div>
                    <div class="impact-feat-item">
                        <span class="impact-check">✓</span>
                        <div>
                            <strong>₹150+ Crores Saved</strong>
                            <p>Affordable last-mile connectivity for office-goers and students.</p>
                        </div>
                    </div>
                    <div class="impact-feat-item">
                        <span class="impact-check">✓</span>
                        <div>
                            <strong>Zero Surge Guarantee</strong>
                            <p>Fair, transparent fares even during rainy seasons and rush hours.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- ================= 3. YOUR SAFETY IS NEVER OPTIONAL ================= -->
        <section id="safety-shield" class="content-section sec-safety-shield">
            <div class="section-container">
                <div class="section-head text-center">
                    <span class="badge-red">24x7 SHIELD // ZERO COMPROMISE</span>
                    <h2 class="section-heading">Your Safety is Never Optional</h2>
                    <p class="section-subheading">Every single ride on Pakka Local is protected with multi-layered safety architecture.</p>
                </div>

                <div class="safety-pillars-grid">
                    <div class="safety-card">
                        <div class="safety-card-icon">🚨</div>
                        <h3 class="safety-title">In-App SOS Emergency Button</h3>
                        <p class="safety-text">One-tap emergency trigger instantly alerts our 24x7 Emergency Response Team, sends GPS coordinates to your emergency contacts, and connects to local police authorities.</p>
                    </div>

                    <div class="safety-card">
                        <div class="safety-card-icon">🪖</div>
                        <h3 class="safety-title">Mandatory Dual ISI Helmets</h3>
                        <p class="safety-text">Every Pakka Bike Captain carries a clean, sanitized ISI-certified helmet with fresh disposable hairnets for passenger hygiene and maximum road protection.</p>
                    </div>

                    <div class="safety-card">
                        <div class="safety-card-icon">💼</div>
                        <h3 class="safety-title">₹5,00,000 Accidental Insurance</h3>
                        <p class="safety-text">Every ride is 100% insured. Comprehensive accidental insurance and emergency medical coverage up to ₹5 Lakh is automatically provided at zero extra cost.</p>
                    </div>

                    <div class="safety-card">
                        <div class="safety-card-icon">🔍</div>
                        <h3 class="safety-title">Rigorous Captain Verification</h3>
                        <p class="safety-text">3-tier background check including police verification, driving license authentication, vehicle fitness tests, and daily biometric facial matching.</p>
                    </div>

                    <div class="safety-card">
                        <div class="safety-card-icon">📍</div>
                        <h3 class="safety-title">Live Ride Sharing via WhatsApp</h3>
                        <p class="safety-text">Share your live GPS tracking link with family and friends in one tap so your loved ones always know where you are in real time.</p>
                    </div>

                    <div class="safety-card">
                        <div class="safety-card-icon">🛡️</div>
                        <h3 class="safety-title">24x7 Incident Response Team</h3>
                        <p class="safety-text">Dedicated on-ground safety officers stationed across all major cities, ready to intervene and assist in any unforeseen situation.</p>
                    </div>
                </div>

                <div class="safety-cta-box">
                    <div>
                        <h4>Have questions regarding our safety protocols?</h4>
                        <p>Read our full safety charter, women safety initiatives, and insurance claim guidelines.</p>
                    </div>
                    <a href="safety.php" class="btn-gold-pill">
                        <span>Read Full Safety Charter →</span>
                    </a>
                </div>
            </div>
        </section>

        <!-- ================= 4. YOUR CITY, YOUR WAY (OUR FLEET) ================= -->
        <section id="services-fleet" class="content-section sec-services-fleet">
            <div class="section-container">
                <div class="section-head text-center">
                    <span class="badge-gold">ALL VEHICLES // ONE APP</span>
                    <h2 class="section-heading">Your City, Your Way</h2>
                    <p class="section-subheading">Choose the right ride for every occasion — from solo speed to comfortable family sedans and express parcel deliveries.</p>
                </div>

                <div class="fleet-cards-grid">
                    <!-- Service 1: Pakka Bike -->
                    <div class="fleet-card">
                        <div class="fleet-header">
                            <span class="fleet-tag">SOLO RUSH</span>
                            <span class="fleet-price">From ₹29</span>
                        </div>
                        <div class="fleet-img-wrap">
                            <img src="assets/images/billboard-bike.jpg" alt="Pakka Bike Taxi" class="fleet-img">
                        </div>
                        <h3 class="fleet-name">Pakka Bike Taxi</h3>
                        <p class="fleet-desc">The fastest way to cut through morning traffic jams. Beat the rush and reach on time with sanitized ISI helmets.</p>
                        <ul class="fleet-perks">
                            <li>✓ 3-5 mins doorstep arrival</li>
                            <li>✓ 70% cheaper than four-wheelers</li>
                            <li>✓ Perfect for solo commutes & metro hops</li>
                        </ul>
                        <button class="btn-gold-action" onclick="openBookingModal('bike')">Book Bike Taxi →</button>
                    </div>

                    <!-- Service 2: Pakka Auto -->
                    <div class="fleet-card">
                        <div class="fleet-header">
                            <span class="fleet-tag">LOCAL FAVOURITE</span>
                            <span class="fleet-price">From ₹35</span>
                        </div>
                        <div class="fleet-img-wrap">
                            <img src="assets/images/billboard-auto.jpg" alt="Pakka Auto Rickshaw" class="fleet-img">
                        </div>
                        <h3 class="fleet-name">Pakka Auto Rickshaw</h3>
                        <p class="fleet-desc">Doorstep auto pickup with zero meter bargaining and fixed digital fares. Spacious seating for up to 3 passengers with shopping bags.</p>
                        <ul class="fleet-perks">
                            <li>✓ Under 4 minutes doorstep pickup</li>
                            <li>✓ Zero cancellation by drivers</li>
                            <li>✓ Direct street route navigation</li>
                        </ul>
                        <button class="btn-gold-action" onclick="openBookingModal('auto')">Book Auto Rickshaw →</button>
                    </div>

                    <!-- Service 3: Pakka Cab -->
                    <div class="fleet-card">
                        <div class="fleet-header">
                            <span class="fleet-tag">PRIME COMFORT</span>
                            <span class="fleet-price">From ₹89</span>
                        </div>
                        <div class="fleet-img-wrap">
                            <img src="assets/images/billboard-cab.jpg" alt="Pakka Prime Cab" class="fleet-img">
                        </div>
                        <h3 class="fleet-name">Pakka Prime Cab & Sedan</h3>
                        <p class="fleet-desc">100% guaranteed AC sedans and SUVs with top-rated Captains. Designed for airport transfers, family outings, and business meetings.</p>
                        <ul class="fleet-perks">
                            <li>✓ Guaranteed AC on all rides</li>
                            <li>✓ 4.85★ top verified drivers</li>
                            <li>✓ Zero surge & airport flat rates</li>
                        </ul>
                        <button class="btn-gold-action" onclick="openBookingModal('cab')">Book Prime Cab →</button>
                    </div>

                    <!-- Service 4: Pakka Parcel -->
                    <div class="fleet-card">
                        <div class="fleet-header">
                            <span class="fleet-tag">INSTANT DELIVERY</span>
                            <span class="fleet-price">From ₹40</span>
                        </div>
                        <div class="fleet-img-wrap">
                            <img src="assets/images/billboard-parcel.jpg" alt="Pakka Parcel Express" class="fleet-img">
                        </div>
                        <h3 class="fleet-name">Pakka Parcel Express</h3>
                        <p class="fleet-desc">Send keys, lunchboxes, chargers, documents, and packages across town in under 45 minutes with live GPS delivery tracking.</p>
                        <ul class="fleet-perks">
                            <li>✓ Doorstep pickup in 10 minutes</li>
                            <li>✓ Secure delivery OTP verification</li>
                            <li>✓ Real-time route tracking</li>
                        </ul>
                        <button class="btn-gold-action" onclick="openBookingModal('parcel')">Send a Parcel →</button>
                    </div>
                </div>
            </div>
        </section>

        <!-- ================= 5. CAPTAIN / DRIVER CTA BANNER ================= -->
        <section id="drive-with-us" class="content-section sec-captain-cta">
            <div class="section-container">
                <div class="captain-cta-banner">
                    <div class="captain-cta-content">
                        <span class="badge-gold">BECOME A PAKKA CAPTAIN // EARN ₹35,000+ / MONTH</span>
                        <h2 class="captain-cta-title">Own a Bike, Auto, or Car?<br>Start Earning Daily with Pakka Local.</h2>
                        <p class="captain-cta-desc">Join 1.5+ Million verified Captains who power India's daily travel. Enjoy flexible working hours, daily instant bank payouts, zero onboarding fees, and free ₹5 Lakh accident insurance.</p>
                        
                        <div class="captain-perks-list">
                            <div class="perk-item">
                                <span class="perk-icon">💰</span>
                                <div><strong>Daily Direct Payouts</strong><p>Withdraw earnings anytime directly to your bank account via UPI.</p></div>
                            </div>
                            <div class="perk-item">
                                <span class="perk-icon">⏰</span>
                                <div><strong>Complete Flexibility</strong><p>Be your own boss. Drive 2 hours or 8 hours — whenever you want.</p></div>
                            </div>
                            <div class="perk-item">
                                <span class="perk-icon">🎁</span>
                                <div><strong>0% Commission on First 50 Rides</strong><p>Keep 100% of your earnings with special joining bonuses.</p></div>
                            </div>
                        </div>

                        <div class="captain-action-row">
                            <button class="btn-gold-pill btn-large" onclick="openCaptainModal()">
                                <span>Register as Captain Now →</span>
                            </button>
                            <span class="cta-note">⚡ Approval & onboarding in under 15 minutes!</span>
                        </div>
                    </div>

                    <div class="captain-cta-badge-card">
                        <div class="captain-stat-badge">
                            <span class="stat-highlight">₹35,000+</span>
                            <span class="stat-tag">Average Monthly Earnings</span>
                        </div>
                        <div class="captain-stat-badge">
                            <span class="stat-highlight">15 Mins</span>
                            <span class="stat-tag">Instant Verification</span>
                        </div>
                        <div class="captain-stat-badge">
                            <span class="stat-highlight">100%</span>
                            <span class="stat-tag">Insured Trips</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- ================= 6. TESTIMONIALS (VOICES OF BHARAT) ================= -->
        <section class="content-section sec-testimonials">
            <div class="section-container">
                <div class="section-head text-center">
                    <span class="badge-gold">CUSTOMER & CAPTAIN LOVE</span>
                    <h2 class="section-heading">Straight From the Heart</h2>
                    <p class="section-subheading">Here is what millions of daily commuters and captains have to say.</p>
                </div>

                <div class="testimonials-grid">
                    <div class="testimonial-card">
                        <div class="testi-stars">★★★★★</div>
                        <p class="testi-text">"Pakka Local bike taxi has saved me 45 minutes every morning on the Silk Board route. The captain always gives a clean helmet with a fresh hairnet. Absolute game changer!"</p>
                        <div class="testi-user">
                            <div class="user-avatar">AD</div>
                            <div>
                                <strong>Ananya Deshmukh</strong>
                                <span>Product Designer, Bengaluru</span>
                            </div>
                        </div>
                    </div>

                    <div class="testimonial-card">
                        <div class="testi-stars">★★★★★</div>
                        <p class="testi-text">"I have been driving with Pakka Local for 2 years. Instant daily payouts and zero commission bonuses help me take care of my family comfortably. The team treats us with genuine respect."</p>
                        <div class="testi-user">
                            <div class="user-avatar">MR</div>
                            <div>
                                <strong>Manjunath Reddy</strong>
                                <span>Pakka Auto Captain (4.9★), Hyderabad</span>
                            </div>
                        </div>
                    </div>

                    <div class="testimonial-card">
                        <div class="testi-stars">★★★★★</div>
                        <p class="testi-text">"Fixed fares with zero bargaining! When traveling late from the airport with luggage, Pakka Cab is the only service that never cancels or asks for cash extra."</p>
                        <div class="testi-user">
                            <div class="user-avatar">RK</div>
                            <div>
                                <strong>Rohit Kapoor</strong>
                                <span>Management Consultant, Mumbai</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- ================= 7. ARRIVAL, DOWNLOAD, FAQS & FOOTER ================= -->
        <?php include __DIR__ . '/includes/footer.php'; ?>

    </main>

    <!-- Modals -->
    <?php include __DIR__ . '/includes/modals.php'; ?>

    <!-- JS Scripts (Local Cached Fast Loading) -->
    <script src="assets/vendor/three.min.js"></script>
    <script src="assets/vendor/GLTFLoader.js"></script>
    <script src="assets/vendor/gsap.min.js"></script>
    <script src="assets/vendor/ScrollTrigger.min.js"></script>
    <script src="assets/vendor/lenis.min.js"></script>
    <script src="assets/vendor/confetti.browser.min.js"></script>

    <!-- Core App JS -->
    <script src="assets/js/audio.js?v=16.0"></script>
    <script src="assets/js/scene3d.js?v=16.0"></script>
    <script src="assets/js/booking.js?v=16.0"></script>
    <script src="assets/js/main.js?v=16.0"></script>
</body>
</html>
