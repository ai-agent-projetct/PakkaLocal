<?php
/**
 * PAKKA LOCAL — SAFETY & TRUST CHARTER
 */

$data = require_once __DIR__ . '/includes/services_data.php';
$brand = $data['brand'];
?>
<!DOCTYPE html>
<html lang="en" class="pl-dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Safety Charter — <?= htmlspecialchars($brand['name']) ?></title>
    <meta name="description" content="Discover Pakka Local's 24x7 safety protocols, SOS emergency response, dual ISI helmet standards, and ₹5 Lakh insurance coverage.">
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
            <span class="badge-red">SAFETY & TRUST CHARTER // 24x7 SHIELD</span>
            <h1 class="subpage-title">Your Safety Is<br><span class="text-gold">Never Optional.</span></h1>
            <p class="subpage-lead">We hold ourselves to the highest safety benchmarks in Indian mobility. From mandatory dual ISI helmets to 24x7 SOS emergency teams and ₹5 Lakh insurance, every ride is strictly safeguarded.</p>
        </div>
    </header>

    <main class="subpage-content">
        <!-- 1. The 6 Safety Pillars -->
        <section class="content-section">
            <div class="section-container">
                <div class="section-head text-center">
                    <span class="badge-gold">MULTI-LAYERED PROTECTION</span>
                    <h2 class="section-heading">Our 6 Core Safety Pillars</h2>
                    <p class="section-subheading">Comprehensive safety protocols active before, during, and after every ride.</p>
                </div>

                <div class="safety-pillars-grid">
                    <div class="safety-card" id="sos">
                        <div class="safety-card-icon">🚨</div>
                        <h3 class="safety-title">1. In-App SOS Emergency Button</h3>
                        <p class="safety-text">Triggering the SOS button in the app instantly sends an urgent high-priority alert to our 24x7 Command Center, relays live GPS coordinates to your designated emergency contacts, and links directly to 112 police authorities.</p>
                    </div>

                    <div class="safety-card">
                        <div class="safety-card-icon">🪖</div>
                        <h3 class="safety-title">2. Mandatory Dual ISI Helmets</h3>
                        <p class="safety-text">Every Pakka Bike Captain carries a sanitized, ISI-marked helmet for the pillion rider accompanied by fresh disposable hairnets for top hygiene and safety.</p>
                    </div>

                    <div class="safety-card">
                        <div class="safety-card-icon">💼</div>
                        <h3 class="safety-title">3. ₹5,00,000 Automatic Insurance</h3>
                        <p class="safety-text">Every single trip booked through Pakka Local comes with ₹5 Lakh accidental medical coverage and disability insurance for both the rider and the captain at ₹0 extra cost.</p>
                    </div>

                    <div class="safety-card">
                        <div class="safety-card-icon">🔍</div>
                        <h3 class="safety-title">4. 3-Tier Captain Verification</h3>
                        <p class="safety-text">Before onboarding, every Captain undergoes strict criminal background checks with local police databases, driving license verification via Vahan API, and daily facial selfie match.</p>
                    </div>

                    <div class="safety-card">
                        <div class="safety-card-icon">📍</div>
                        <h3 class="safety-title">5. Real-Time WhatsApp Trip Share</h3>
                        <p class="safety-text">With a single tap, share your active live GPS trip link with loved ones so they can watch your vehicle move in real time until you reach home safely.</p>
                    </div>

                    <div class="safety-card">
                        <div class="safety-card-icon">🛡️</div>
                        <h3 class="safety-title">6. 24x7 Incident Response Team</h3>
                        <p class="safety-text">Dedicated emergency field officers and medical dispatch coordination units stationed across all 150+ operational cities, active round the clock.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- 2. Women's Safety & Night Commute Protocols -->
        <section class="content-section sec-alt-bg">
            <div class="section-container">
                <div class="split-info-grid">
                    <div class="split-info-text">
                        <span class="badge-gold">WOMEN SAFETY & NIGHT RIDES</span>
                        <h2 class="section-heading">Specially Designed Protection for Late-Night Commutes</h2>
                        <p class="text-secondary">We understand the importance of total peace of mind when travelling late at night or through unfamiliar routes.</p>
                        
                        <div class="feature-bullets-list">
                            <div class="f-bullet"><strong>Number Masking:</strong> Phone numbers are fully anonymized. Neither passenger nor captain can see personal phone numbers.</div>
                            <div class="f-bullet"><strong>AI Route Deviation Alerts:</strong> If the vehicle stops unexpectedly or diverges from the GPS suggested path, our safety algorithm automatically initiates a check-in call.</div>
                            <div class="f-bullet"><strong>Night Safety Desk:</strong> Specialized dedicated women support operators active between 8 PM and 6 AM daily.</div>
                        </div>
                    </div>

                    <div class="split-info-card">
                        <div class="stat-highlight-box">
                            <div class="stat-big text-gold">&lt; 15s</div>
                            <div class="stat-desc">Average SOS Emergency Call Connect Time</div>
                        </div>
                        <div class="stat-highlight-box">
                            <div class="stat-big text-gold">100%</div>
                            <div class="stat-desc">Anonymized Private Calling on all Trips</div>
                        </div>
                        <div class="stat-highlight-box">
                            <div class="stat-big text-gold">0</div>
                            <div class="stat-desc">Tolerance Policy for Misconduct or Rash Driving</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 3. Insurance Claim & Emergency Support -->
        <section class="content-section">
            <div class="section-container">
                <div class="section-head text-center">
                    <span class="badge-gold">NEED ASSISTANCE?</span>
                    <h2 class="section-heading">Emergency & Insurance Claim Directory</h2>
                    <p class="section-subheading">We are here to assist you 24 hours a day, 7 days a week.</p>
                </div>

                <div class="steps-grid-4">
                    <div class="step-card">
                        <div class="step-icon">📞</div>
                        <h3 class="step-title">National Helpline</h3>
                        <p class="step-text">Call <strong>1800-PAKKA-LOCAL</strong> (Toll-Free) for immediate support or ride assistance.</p>
                    </div>
                    <div class="step-card">
                        <div class="step-icon">🚓</div>
                        <h3 class="step-title">Police Emergency</h3>
                        <p class="step-text">Direct integrated dial to <strong>112 (National Emergency Response)</strong> directly via in-app SOS.</p>
                    </div>
                    <div class="step-card">
                        <div class="step-icon">📑</div>
                        <h3 class="step-title">Insurance Claims</h3>
                        <p class="step-text">Email <strong>claims@pakkalocal.in</strong> with your Ride ID for instant paperless claim processing.</p>
                    </div>
                    <div class="step-card">
                        <div class="step-icon">✉️</div>
                        <h3 class="step-title">Safety Desk</h3>
                        <p class="step-text">Email <strong>safety@pakkalocal.in</strong> for grievance redressal and feedback.</p>
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
