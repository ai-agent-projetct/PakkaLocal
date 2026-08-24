<?php
/**
 * PAKKA LOCAL — CAREERS
 */

$data = require_once __DIR__ . '/includes/services_data.php';
$brand = $data['brand'];
?>
<!DOCTYPE html>
<html lang="en" class="pl-dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Careers — <?= htmlspecialchars($brand['name']) ?></title>
    <meta name="description" content="Join Pakka Local and build high-scale, real-time mobility algorithms and products for 100M+ Indians.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@500;700&family=Syne:wght@700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css?v=16.0">
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
<body class="bg-pl-black text-pl-white antialiased selection:bg-pl-gold selection:text-black subpage-body">

    <!-- Header -->
    <?php include __DIR__ . '/includes/header.php'; ?>

    <!-- Subpage Hero Banner -->
    <header class="subpage-hero">
        <div class="section-container">
            <span class="badge-gold">CAREERS @ PAKKA LOCAL // BUILD THE FUTURE</span>
            <h1 class="subpage-title">Solve Hard Mobility Problems.<br><span class="text-gold">Impact Millions Daily.</span></h1>
            <p class="subpage-lead">We are building the real-time transportation grid for 1.4 Billion people. Join our team of passionate engineers, product builders, data scientists, and operations pioneers.</p>
        </div>
    </header>

    <main class="subpage-content">
        <!-- 1. Why Work With Us -->
        <section class="content-section">
            <div class="section-container">
                <div class="section-head text-center">
                    <span class="badge-gold">WHY PAKKA LOCAL</span>
                    <h2 class="section-heading">Built For High Impact & Growth</h2>
                </div>

                <div class="steps-grid-4">
                    <div class="step-card">
                        <div class="step-icon">🚀</div>
                        <h3 class="step-title">True Massive Scale</h3>
                        <p class="step-text">Our dispatch engine processes millions of GPS pings every second. Work on distributed systems that touch real lives daily.</p>
                    </div>
                    <div class="step-card">
                        <div class="step-icon">💎</div>
                        <h3 class="step-title">Top Compensation & ESOPs</h3>
                        <p class="step-text">We reward exceptional talent with top-tier salaries, lucrative wealth-building equity packages, and performance bonuses.</p>
                    </div>
                    <div class="step-card">
                        <div class="step-icon">🏥</div>
                        <h3 class="step-title">Comprehensive Health Cover</h3>
                        <p class="step-text">Full medical, dental, and wellness insurance up to ₹10 Lakh covering you, your spouse, children, and parents.</p>
                    </div>
                    <div class="step-card">
                        <div class="step-icon">⚡</div>
                        <h3 class="step-title">Unlimited Ride Credits</h3>
                        <p class="step-text">Generous monthly Pakka Local ride credits for all employees across Bike, Auto, and Cab.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- 2. Open Positions -->
        <section class="content-section sec-alt-bg" id="open-roles">
            <div class="section-container">
                <div class="section-head text-center">
                    <span class="badge-gold">WE ARE HIRING</span>
                    <h2 class="section-heading">Explore Open Opportunities</h2>
                    <p class="section-subheading">Find your dream role across Engineering, Product, Design, and Operations.</p>
                </div>

                <div class="jobs-list">
                    <!-- Job 1 -->
                    <div class="job-card">
                        <div class="job-info">
                            <span class="job-dept">ENGINEERING // DISTRIBUTED SYSTEMS</span>
                            <h3 class="job-title">Staff Backend Engineer — Real-time Dispatch</h3>
                            <div class="job-meta">
                                <span>📍 Bengaluru, Karnataka (Hybrid)</span>
                                <span>💼 Full-Time</span>
                                <span>⚡ 5+ Years Exp</span>
                            </div>
                            <p class="job-desc">Design and scale high-throughput spatial geohash dispatch services processing 50K+ ride requests/minute in Go and Rust.</p>
                        </div>
                        <div class="job-action">
                            <button class="btn-gold-action" onclick="openJobApplicationModal('Staff Backend Engineer — Real-time Dispatch')">Apply Now →</button>
                        </div>
                    </div>

                    <!-- Job 2 -->
                    <div class="job-card">
                        <div class="job-info">
                            <span class="job-dept">ENGINEERING // FRONTEND & WEBGL</span>
                            <h3 class="job-title">Senior Frontend Engineer — 3D & Web</h3>
                            <div class="job-meta">
                                <span>📍 Bengaluru / Remote</span>
                                <span>💼 Full-Time</span>
                                <span>⚡ 4+ Years Exp</span>
                            </div>
                            <p class="job-desc">Architect rich Three.js 3D web experiences, fluid booking flows, and micro-frontend client applications.</p>
                        </div>
                        <div class="job-action">
                            <button class="btn-gold-action" onclick="openJobApplicationModal('Senior Frontend Engineer — 3D & Web')">Apply Now →</button>
                        </div>
                    </div>

                    <!-- Job 3 -->
                    <div class="job-card">
                        <div class="job-info">
                            <span class="job-dept">PRODUCT & DESIGN</span>
                            <h3 class="job-title">Lead Product Manager — Captain Livelihoods</h3>
                            <div class="job-meta">
                                <span>📍 Bengaluru, Karnataka</span>
                                <span>💼 Full-Time</span>
                                <span>⚡ 4+ Years Exp</span>
                            </div>
                            <p class="job-desc">Own the core Captain experience: instant payouts, incentive gamification, onboarding funnels, and loyalty programs.</p>
                        </div>
                        <div class="job-action">
                            <button class="btn-gold-action" onclick="openJobApplicationModal('Lead Product Manager — Captain Livelihoods')">Apply Now →</button>
                        </div>
                    </div>

                    <!-- Job 4 -->
                    <div class="job-card">
                        <div class="job-info">
                            <span class="job-dept">GROUND OPERATIONS</span>
                            <h3 class="job-title">City Operations Manager — Hyderabad</h3>
                            <div class="job-meta">
                                <span>📍 Hyderabad, Telangana</span>
                                <span>💼 Full-Time</span>
                                <span>⚡ 3+ Years Exp</span>
                            </div>
                            <p class="job-desc">Drive supply acquisition, Captain engagement, driver onboarding centers, and city-level fulfillment metrics.</p>
                        </div>
                        <div class="job-action">
                            <button class="btn-gold-action" onclick="openJobApplicationModal('City Operations Manager — Hyderabad')">Apply Now →</button>
                        </div>
                    </div>

                    <!-- Job 5 -->
                    <div class="job-card">
                        <div class="job-info">
                            <span class="job-dept">DATA SCIENCE & AI</span>
                            <h3 class="job-title">Senior Data Scientist — ETA & Demand Forecasting</h3>
                            <div class="job-meta">
                                <span>📍 Bengaluru, Karnataka</span>
                                <span>💼 Full-Time</span>
                                <span>⚡ 4+ Years Exp</span>
                            </div>
                            <p class="job-desc">Build machine learning models to forecast traffic bottlenecks, optimal repositioning routes, and sub-minute ETAs.</p>
                        </div>
                        <div class="job-action">
                            <button class="btn-gold-action" onclick="openJobApplicationModal('Senior Data Scientist — ETA & Demand Forecasting')">Apply Now →</button>
                        </div>
                    </div>
                </div>

                <div class="careers-general-box text-center">
                    <h3>Don't see your specific role?</h3>
                    <p>We are always looking for exceptional engineers, operational leaders, and creative minds. Send your resume directly to our talent team.</p>
                    <a href="mailto:careers@pakkalocal.in" class="btn-outline-gold">Email Resume to careers@pakkalocal.in →</a>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <?php include __DIR__ . '/includes/footer.php'; ?>
    </main>

    <!-- Modals -->
    <?php include __DIR__ . '/includes/modals.php'; ?>

    <script src="assets/js/audio.js?v=16.0"></script>
    <script src="assets/js/booking.js?v=16.0"></script>
    <script src="assets/js/main.js?v=16.0"></script>
    <script>
        function openJobApplicationModal(jobTitle) {
            alert(`Thank you for your interest in ${jobTitle}! Please send your resume and LinkedIn profile to careers@pakkalocal.in with the subject line "[Application] ${jobTitle}". Our recruitment team will get back to you within 48 hours.`);
        }
    </script>
</body>
</html>
