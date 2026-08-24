<?php
/**
 * PAKKA LOCAL — ABOUT US
 */

$data = require_once __DIR__ . '/includes/services_data.php';
$brand = $data['brand'];
?>
<!DOCTYPE html>
<html lang="en" class="pl-dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About Us — <?= htmlspecialchars($brand['name']) ?></title>
    <meta name="description" content="Learn about Pakka Local, our mission, leadership, and how we are revolutionising urban mobility across India.">
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
            <span class="badge-gold">ABOUT PAKKA LOCAL // OUR STORY & PURPOSE</span>
            <h1 class="subpage-title">Moving India Forward.<br><span class="text-gold">One Reliable Ride at a Time.</span></h1>
            <p class="subpage-lead">We started with a simple, unshakeable conviction: daily urban commuting in Indian cities should be fast, affordable, transparent, and safe for everyone.</p>
        </div>
    </header>

    <main class="subpage-content">
        <!-- 1. Origin & Story -->
        <section class="content-section">
            <div class="section-container">
                <div class="split-info-grid">
                    <div class="split-info-text">
                        <span class="badge-gold">OUR ROOTS</span>
                        <h2 class="section-heading">Born on Indian Streets</h2>
                        <p class="text-secondary">India’s traffic congestion costs urban commuters over 2 billion hours every single year. Long auto stand queues, arbitrary surge pricing, and sudden driver cancellations make daily travel stressful.</p>
                        <p class="text-secondary">Pakka Local was created to solve this foundational challenge. By building a hyper-local technology grid that connects commuters directly to verified bike taxi, auto rickshaw, and cab captains in under 60 seconds, we made city travel seamless, honest, and truly local.</p>
                        <div class="feature-bullets-list">
                            <div class="f-bullet"><strong>Zero Surge Guarantee:</strong> Honest fares that respect your wallet, rain or shine.</div>
                            <div class="f-bullet"><strong>ISI Helmet Hygiene:</strong> Sanitized helmets with fresh hairnets on every bike trip.</div>
                            <div class="f-bullet"><strong>Instant Captain Dispatch:</strong> Under 4-minute average doorstep arrival.</div>
                        </div>
                    </div>
                    <div class="split-info-card">
                        <div class="stat-highlight-box">
                            <div class="stat-big text-gold">25M+</div>
                            <div class="stat-desc">Daily Commuters Powered Across 150+ Cities</div>
                        </div>
                        <div class="stat-highlight-box">
                            <div class="stat-big text-gold">1.5M+</div>
                            <div class="stat-desc">Captains Earning Sustainable Daily Livelihoods</div>
                        </div>
                        <div class="stat-highlight-box">
                            <div class="stat-big text-gold">₹150Cr+</div>
                            <div class="stat-desc">Cumulative Savings for Students & Working Professionals</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 2. Mission, Vision & Values -->
        <section class="content-section sec-alt-bg">
            <div class="section-container">
                <div class="section-head text-center">
                    <span class="badge-gold">OUR GUIDING PRINCIPLES</span>
                    <h2 class="section-heading">Mission, Vision & Core Values</h2>
                </div>

                <div class="steps-grid-4">
                    <div class="step-card">
                        <div class="step-icon">🎯</div>
                        <h3 class="step-title">Our Mission</h3>
                        <p class="step-text">To provide India's most dependable, affordable, and honest first-person mobility network across every pincode.</p>
                    </div>
                    <div class="step-card">
                        <div class="step-icon">🌏</div>
                        <h3 class="step-title">Our Vision</h3>
                        <p class="step-text">An India where nobody is stranded, where zero time is wasted in gridlocks, and where millions of drivers earn with dignity.</p>
                    </div>
                    <div class="step-card">
                        <div class="step-icon">🤝</div>
                        <h3 class="step-title">Captain-First</h3>
                        <p class="step-text">We treat our Captains as true partners with instant daily payouts, free ₹5 Lakh insurance, and 24x7 ground support.</p>
                    </div>
                    <div class="step-card">
                        <div class="step-icon">🛡️</div>
                        <h3 class="step-title">Safety Obsession</h3>
                        <p class="step-text">From dual ISI helmets to in-app SOS and verified facial biometric matching, safety is non-negotiable.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- 3. Leadership Team -->
        <section class="content-section">
            <div class="section-container">
                <div class="section-head text-center">
                    <span class="badge-gold">THE TEAM</span>
                    <h2 class="section-heading">Leadership Behind Pakka Local</h2>
                    <p class="section-subheading">Passionate technologists, mobility engineers, and ground ops leaders.</p>
                </div>

                <div class="team-grid">
                    <div class="team-card">
                        <div class="team-avatar">RK</div>
                        <h3 class="team-name">Raghavendra K.</h3>
                        <span class="team-role">Co-Founder & CEO</span>
                        <p class="team-bio">12+ years in Indian hyper-local logistics and deep-tech algorithms. Passionate about building sustainable public mobility for Bharat.</p>
                    </div>

                    <div class="team-card">
                        <div class="team-avatar">SS</div>
                        <h3 class="team-name">Suhasini Sharma</h3>
                        <span class="team-role">Co-Founder & Chief Product Officer</span>
                        <p class="team-bio">Former lead architect for mass-scale transit apps. Focuses on frictionless 1-tap booking UX and AI routing systems.</p>
                    </div>

                    <div class="team-card">
                        <div class="team-avatar">VN</div>
                        <h3 class="team-name">Vikram Nair</h3>
                        <span class="team-role">Head of Safety & Ground Operations</span>
                        <p class="team-bio">Oversees our 24x7 Safety Response Command Center and nationwide Captain verification standards.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- 4. CTA Banner -->
        <section class="content-section">
            <div class="section-container">
                <div class="captain-cta-banner">
                    <div class="captain-cta-content">
                        <span class="badge-gold">JOIN THE REVOLUTION</span>
                        <h2 class="captain-cta-title">Ready for a Better Way to Move?</h2>
                        <p class="captain-cta-desc">Download the Pakka Local app today or register as a Captain to start earning daily.</p>
                        <div class="captain-action-row">
                            <button class="btn-gold-pill" onclick="openBookingModal('bike')">Book a Ride Now →</button>
                            <button class="btn-outline-gold" onclick="openCaptainModal()">Drive with Us →</button>
                        </div>
                    </div>
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
</body>
</html>
