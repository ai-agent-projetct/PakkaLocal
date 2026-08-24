<?php
/**
 * Pakka Local — Footer & Arrival Section
 */
?>

<!-- Arrival & Download Banner -->
<section id="arrival-hub" class="pl-arrival-section">
    <div class="arrival-container">
        <div class="arrival-badge">
            <span class="badge-gold">ARRIVAL // DAWN HORIZON</span>
        </div>
        <h2 class="arrival-title">Your City. Your Way.<br><span class="text-gold">Pakka On Time.</span></h2>
        <p class="arrival-subtitle">From daily office bike hops to family cab rides and instant parcel deliveries — enjoy honest pricing, zero cancellations, and instant Captain dispatch.</p>

        <!-- Download Buttons -->
        <div class="store-buttons">
            <a href="https://play.google.com" target="_blank" rel="noopener noreferrer" class="store-btn">
                <div class="store-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3.609 1.814L13.793 12 3.61 22.186a1.986 1.986 0 0 1-.22-.916V2.73c0-.337.078-.654.219-.916zM15.207 13.414l2.793 2.793-11.8 6.743 9.007-9.536zm2.793-2.828l-2.793 2.828-9.007-9.536 11.8 6.708zm1.414 1.414l2.457 1.404c.84.48.84 1.26 0 1.74l-2.457 1.404-2.121-2.274 2.121-2.274z"/>
                    </svg>
                </div>
                <div class="store-text">
                    <span class="store-sub">GET IT ON</span>
                    <span class="store-main">Google Play</span>
                </div>
            </a>

            <a href="https://apple.com/app-store" target="_blank" rel="noopener noreferrer" class="store-btn">
                <div class="store-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.64 1.36-.58.67-1.08 1.74-.95 2.77 1 .08 2.05-.53 2.67-1.28z"/>
                    </svg>
                </div>
                <div class="store-text">
                    <span class="store-sub">DOWNLOAD ON THE</span>
                    <span class="store-main">App Store</span>
                </div>
            </a>

            <button class="store-btn store-btn-web" onclick="openBookingModal('bike')">
                <div class="store-icon">🚀</div>
                <div class="store-text">
                    <span class="store-sub">NO APP REQUIRED</span>
                    <span class="store-main">Book on Web →</span>
                </div>
            </button>
        </div>

        <!-- Captain Recruitment Box -->
        <div class="captain-callout-strip">
            <div class="captain-strip-left">
                <span class="strip-tag">BECOME A PAKKA CAPTAIN</span>
                <h3>Own a Bike, Auto or Car? Start Earning Daily.</h3>
                <p>Enjoy instant daily payouts, zero hidden deductions, free accident insurance, and complete schedule freedom.</p>
            </div>
            <div class="captain-strip-right">
                <button class="btn-gold-pill" onclick="openCaptainModal()">
                    <span>Register as Captain →</span>
                </button>
            </div>
        </div>
    </div>
</section>

<!-- 2D Newsroom & FAQ Grid (WOW-Style Post-Drive Section) -->
<section id="faq-section" class="pl-faq-section">
    <div class="faq-container">
        <div class="faq-header">
            <span class="badge-gold">TRANSPARENT & CLEAR</span>
            <h3 class="section-title">Frequently Asked Questions</h3>
        </div>

        <div class="faq-accordion">
            <?php foreach ($data['faqs'] as $index => $faq): ?>
                <div class="faq-item" onclick="toggleFaq(this)">
                    <div class="faq-question">
                        <span><?= htmlspecialchars($faq['q']) ?></span>
                        <span class="faq-chevron">+</span>
                    </div>
                    <div class="faq-answer">
                        <p><?= htmlspecialchars($faq['a']) ?></p>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>

        <!-- City Coverage Directory -->
        <div class="cities-section">
            <h4 class="cities-title">Currently Powering Commutes Across 100+ Indian Cities</h4>
            <div class="city-tags">
                <?php foreach ($data['cities'] as $city): ?>
                    <span class="city-tag"><?= htmlspecialchars($city) ?></span>
                <?php endforeach; ?>
                <span class="city-tag city-tag-more">+ 85 more cities</span>
            </div>
        </div>
    </div>
</section>

<!-- Global Footer -->
<footer class="pl-footer">
    <div class="footer-container">
        <div class="footer-top">
            <div class="footer-brand-col">
                <div class="pl-brand">
                    <div class="brand-badge">
                        <span class="brand-initial">PL</span>
                    </div>
                    <div class="brand-text">
                        <span class="brand-name">PAKKA <span class="text-gold">LOCAL</span></span>
                        <span class="brand-sub">PAKKA RIDE. PAKKA TIME.</span>
                    </div>
                </div>
                <p class="footer-bio">India's dependable urban mobility grid. Built for speed, safety, and fixed transparent fares across Bike, Auto, Cab & Parcel.</p>
                <div class="footer-safety-badge">
                    <span>🛡️ ISO 27001 Certified & Insured Platform</span>
                </div>
            </div>

            <div class="footer-col">
                <h4>Company</h4>
                <ul>
                    <li><a href="about.php">About Us</a></li>
                    <li><a href="safety.php">Safety Charter</a></li>
                    <li><a href="careers.php">Careers @ Pakka Local</a></li>
                    <li><a href="blog.php">Blog & Newsroom</a></li>
                    <li><a href="contact.php">Contact Us</a></li>
                </ul>
            </div>

            <div class="footer-col">
                <h4>Services</h4>
                <ul>
                    <li><a href="index.php#services-fleet" onclick="openBookingModal('bike'); return false;">Pakka Bike Taxi</a></li>
                    <li><a href="index.php#services-fleet" onclick="openBookingModal('auto'); return false;">Pakka Auto</a></li>
                    <li><a href="index.php#services-fleet" onclick="openBookingModal('cab'); return false;">Pakka Prime Cab</a></li>
                    <li><a href="index.php#services-fleet" onclick="openBookingModal('parcel'); return false;">Pakka Parcel Express</a></li>
                </ul>
            </div>

            <div class="footer-col">
                <h4>Captain Hub</h4>
                <ul>
                    <li><a href="#" onclick="openCaptainModal(); return false;">Drive with Us (Earn ₹35K+)</a></li>
                    <li><a href="#" onclick="openCaptainModal(); return false;">Daily Payouts & Rewards</a></li>
                    <li><a href="safety.php">Captain Safety & Insurance</a></li>
                    <li><a href="contact.php">Captain Support Desk</a></li>
                </ul>
            </div>

            <div class="footer-col">
                <h4>Contact & Support</h4>
                <ul>
                    <li><a href="contact.php">City Offices (BLR / HYD / MUM)</a></li>
                    <li><span>24x7 Helpline: 1800-PAKKA-LOCAL</span></li>
                    <li><span>Email: support@pakkalocal.in</span></li>
                    <li><a href="safety.php#sos">Emergency SOS Protocol</a></li>
                </ul>
            </div>
        </div>

        <div class="footer-bottom">
            <div class="copyright">
                © <?= date('Y') ?> Pakka Local Technologies Private Limited. All rights reserved.
            </div>
            <div class="footer-socials">
                <span class="social-tag">Twitter / X</span>
                <span class="social-tag">Instagram</span>
                <span class="social-tag">LinkedIn</span>
                <span class="social-tag">YouTube</span>
            </div>
        </div>
    </div>
</footer>
