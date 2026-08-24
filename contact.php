<?php
/**
 * PAKKA LOCAL — CONTACT US & CITY OFFICES
 */

$data = require_once __DIR__ . '/includes/services_data.php';
$brand = $data['brand'];
?>
<!DOCTYPE html>
<html lang="en" class="pl-dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Us — <?= htmlspecialchars($brand['name']) ?></title>
    <meta name="description" content="Get in touch with Pakka Local support, city headquarters in Bengaluru, Hyderabad, Mumbai, and 24x7 captain assistance.">
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
            <span class="badge-gold">CONTACT & SUPPORT // 24x7 DESK</span>
            <h1 class="subpage-title">We Are Always Here<br><span class="text-gold">To Help You Move.</span></h1>
            <p class="subpage-lead">Have a question regarding your ride, captain earnings, corporate partnerships, or safety? Reach out to our dedicated support teams.</p>
        </div>
    </header>

    <main class="subpage-content">
        <!-- 1. Contact Form & Quick Info -->
        <section class="content-section">
            <div class="section-container">
                <div class="split-info-grid">
                    <!-- Left: Form -->
                    <div class="contact-form-card">
                        <span class="badge-gold">SEND A MESSAGE</span>
                        <h2 class="section-heading">How Can We Help?</h2>
                        <form id="contact-form" onsubmit="handleContactSubmit(event)">
                            <div class="form-group">
                                <label for="c-role">I Am A:</label>
                                <select id="c-role" class="form-input" onchange="updateQueryOptions()">
                                    <option value="customer">Rider / Customer</option>
                                    <option value="captain">Captain / Driver Partner</option>
                                    <option value="corporate">Corporate / Business Partner</option>
                                    <option value="press">Media / Press Inquiries</option>
                                </select>
                            </div>

                            <div class="form-row-2">
                                <div class="form-group">
                                    <label for="c-name">Full Name *</label>
                                    <input type="text" id="c-name" class="form-input" placeholder="e.g. Rahul Sharma" required>
                                </div>
                                <div class="form-group">
                                    <label for="c-phone">Mobile Number *</label>
                                    <input type="tel" id="c-phone" class="form-input" placeholder="e.g. 9876543210" required>
                                </div>
                            </div>

                            <div class="form-row-2">
                                <div class="form-group">
                                    <label for="c-email">Email Address *</label>
                                    <input type="email" id="c-email" class="form-input" placeholder="e.g. rahul@example.com" required>
                                </div>
                                <div class="form-group">
                                    <label for="c-city">Your City *</label>
                                    <select id="c-city" class="form-input" required>
                                        <option value="bengaluru">Bengaluru</option>
                                        <option value="hyderabad">Hyderabad</option>
                                        <option value="mumbai">Mumbai</option>
                                        <option value="delhi">Delhi NCR</option>
                                        <option value="chennai">Chennai</option>
                                        <option value="pune">Pune</option>
                                        <option value="kolkata">Kolkata</option>
                                        <option value="other">Other City</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="c-topic">Query Topic *</label>
                                <select id="c-topic" class="form-input" required>
                                    <option value="ride">Ride & Booking Assistance</option>
                                    <option value="fare">Fare & Payment Clarification</option>
                                    <option value="lost">Lost & Found Item</option>
                                    <option value="safety">Safety & Incident Feedback</option>
                                    <option value="captain_reg">Captain Onboarding & Livelihood</option>
                                    <option value="other">Other Inquiry</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="c-message">Your Message *</label>
                                <textarea id="c-message" class="form-input" rows="4" placeholder="Describe your query or feedback in detail..." required></textarea>
                            </div>

                            <button type="submit" class="btn-gold-pill btn-large w-full">
                                <span>Submit Inquiry →</span>
                            </button>
                        </form>

                        <div id="contact-success-msg" class="contact-success hidden">
                            <span class="success-icon">✓</span>
                            <div>
                                <strong>Message Sent Successfully!</strong>
                                <p>Our support executive will respond to you via email/phone within 2 hours.</p>
                            </div>
                        </div>
                    </div>

                    <!-- Right: Direct Channels -->
                    <div class="contact-channels-wrap">
                        <div class="contact-channel-box">
                            <div class="cc-icon">📞</div>
                            <div>
                                <h3>24x7 Customer Helpline</h3>
                                <p class="cc-detail">Toll-free across India</p>
                                <span class="cc-link">1800-PAKKA-LOCAL (1800-725-525)</span>
                            </div>
                        </div>

                        <div class="contact-channel-box">
                            <div class="cc-icon">🚨</div>
                            <div>
                                <h3>Emergency Safety SOS</h3>
                                <p class="cc-detail">24x7 Rapid Command Response</p>
                                <span class="cc-link text-red">1800-PAKKA-SOS</span>
                            </div>
                        </div>

                        <div class="contact-channel-box">
                            <div class="cc-icon">✉️</div>
                            <div>
                                <h3>Email Desks</h3>
                                <p class="cc-detail">Customer Support: support@pakkalocal.in</p>
                                <p class="cc-detail">Captain Support: captain@pakkalocal.in</p>
                                <p class="cc-detail">Press & Media: press@pakkalocal.in</p>
                            </div>
                        </div>

                        <div class="contact-channel-box">
                            <div class="cc-icon">💼</div>
                            <div>
                                <h3>Corporate Partnerships</h3>
                                <p class="cc-detail">Employee travel management & B2B delivery</p>
                                <span class="cc-link">corporate@pakkalocal.in</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 2. City Offices Directory -->
        <section class="content-section sec-alt-bg">
            <div class="section-container">
                <div class="section-head text-center">
                    <span class="badge-gold">NATIONWIDE PRESENCE</span>
                    <h2 class="section-heading">Our Registered City Offices</h2>
                    <p class="section-subheading">Walk into our Captain Onboarding & Driver Support Centers.</p>
                </div>

                <div class="offices-grid">
                    <!-- Office 1 -->
                    <div class="office-card">
                        <div class="office-tag">HEADQUARTERS</div>
                        <h3 class="office-city">Bengaluru</h3>
                        <p class="office-addr">Pakka Local Tech Park, 648, 1st Main Rd, Indiranagar 100ft Rd, Bengaluru, Karnataka 560038</p>
                        <div class="office-meta">
                            <span>🕒 Mon - Sat: 9:00 AM - 7:00 PM</span>
                            <span>📞 +91 80 4567 8900</span>
                        </div>
                    </div>

                    <!-- Office 2 -->
                    <div class="office-card">
                        <div class="office-tag">REGIONAL OFFICE</div>
                        <h3 class="office-city">Hyderabad</h3>
                        <p class="office-addr">3rd Floor, Cyber Prithvi Arcade, Hitec City, Madhapur, Hyderabad, Telangana 500081</p>
                        <div class="office-meta">
                            <span>🕒 Mon - Sat: 9:00 AM - 7:00 PM</span>
                            <span>📞 +91 40 4567 8900</span>
                        </div>
                    </div>

                    <!-- Office 3 -->
                    <div class="office-card">
                        <div class="office-tag">REGIONAL OFFICE</div>
                        <h3 class="office-city">Mumbai</h3>
                        <p class="office-addr">Level 5, Trade Centre, Bandra Kurla Complex (BKC), Mumbai, Maharashtra 400051</p>
                        <div class="office-meta">
                            <span>🕒 Mon - Sat: 9:00 AM - 7:00 PM</span>
                            <span>📞 +91 22 4567 8900</span>
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
    <script>
        function updateQueryOptions() {
            const role = document.getElementById('c-role').value;
            const topic = document.getElementById('c-topic');
            if (role === 'captain') {
                topic.innerHTML = `
                    <option value="reg">How to Register as a Captain</option>
                    <option value="payout">Daily Payout / Bank Transfer Issue</option>
                    <option value="docs">Document Verification & Activation</option>
                    <option value="insurance">Captain Accidental Insurance Claim</option>
                    <option value="other">Other Captain Query</option>
                `;
            } else if (role === 'corporate') {
                topic.innerHTML = `
                    <option value="corp_commute">Employee Daily Commute Management</option>
                    <option value="b2b_parcel">B2B Express Parcel & Courier</option>
                    <option value="billing">Consolidated Invoicing & Credit</option>
                    <option value="other">Other Partnership Query</option>
                `;
            } else {
                topic.innerHTML = `
                    <option value="ride">Ride & Booking Assistance</option>
                    <option value="fare">Fare & Payment Clarification</option>
                    <option value="lost">Lost & Found Item</option>
                    <option value="safety">Safety & Incident Feedback</option>
                    <option value="other">Other Inquiry</option>
                `;
            }
        }

        function handleContactSubmit(e) {
            e.preventDefault();
            document.getElementById('contact-form').style.display = 'none';
            document.getElementById('contact-success-msg').classList.remove('hidden');
            if (window.confetti) {
                window.confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
            }
        }
    </script>
</body>
</html>
