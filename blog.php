<?php
/**
 * PAKKA LOCAL — BLOG & NEWSROOM
 */

$data = require_once __DIR__ . '/includes/services_data.php';
$brand = $data['brand'];
?>
<!DOCTYPE html>
<html lang="en" class="pl-dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog & Newsroom — <?= htmlspecialchars($brand['name']) ?></title>
    <meta name="description" content="Read the latest news, mobility technology deep-dives, Captain stories, and urban transit trends from Pakka Local.">
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
            <span class="badge-gold">BLOG & NEWSROOM // MOBILITY, TECH & IMPACT</span>
            <h1 class="subpage-title">Stories from the Streets.<br><span class="text-gold">Engineering for Millions.</span></h1>
            <p class="subpage-lead">Discover how we are rethinking urban transit algorithms, empowering grassroots Captains, and building safe mobility solutions for India.</p>
        </div>
    </header>

    <main class="subpage-content">
        <!-- 1. Featured Story -->
        <section class="content-section">
            <div class="section-container">
                <div class="blog-featured-card">
                    <div class="blog-featured-badge">FEATURED ENGINEERING STORY</div>
                    <h2 class="blog-featured-title">How We Built a Sub-60-Second Dispatch Engine for 150+ Indian Cities</h2>
                    <p class="blog-featured-desc">A deep dive into our distributed spatial indexing, low-latency WebSocket clusters, and predictive traffic graph algorithms that match commuters to the nearest Captain in under 45 seconds.</p>
                    <div class="blog-meta-row">
                        <span>✍️ Suhasini Sharma (CPO)</span>
                        <span>📅 August 2026</span>
                        <span>⏱️ 6 Min Read</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- 2. Articles Grid -->
        <section class="content-section sec-alt-bg">
            <div class="section-container">
                <div class="section-head">
                    <span class="badge-gold">LATEST ARTICLES</span>
                    <h2 class="section-heading">Recent Stories & Insights</h2>
                </div>

                <div class="blog-grid">
                    <!-- Post 1 -->
                    <article class="blog-post-card">
                        <span class="blog-tag">CAPTAIN SPOTLIGHT</span>
                        <h3 class="post-title">From Unemployed to Earning ₹42,000/Month: Ramesh's Journey</h3>
                        <p class="post-snippet">How Pakka Local's daily instant payouts and zero joining fee gave an auto driver in Hyderabad financial freedom and pride.</p>
                        <div class="post-footer">
                            <span>📅 3 Days Ago</span>
                            <span class="read-link">Read Story →</span>
                        </div>
                    </article>

                    <!-- Post 2 -->
                    <article class="blog-post-card">
                        <span class="blog-tag">MOBILITY POLICY</span>
                        <h3 class="post-title">Why Zero Surge Pricing Is the Only Sustainable Model for Bharat</h3>
                        <p class="post-snippet">Why predictable, honest fares create long-term commuter loyalty and higher lifetime driver earnings compared to volatile surge surges.</p>
                        <div class="post-footer">
                            <span>📅 1 Week Ago</span>
                            <span class="read-link">Read Story →</span>
                        </div>
                    </article>

                    <!-- Post 3 -->
                    <article class="blog-post-card">
                        <span class="blog-tag">SAFETY & TRUST</span>
                        <h3 class="post-title">Inside Our 24x7 Safety Command Center: Real-Time AI Threat Monitoring</h3>
                        <p class="post-snippet">How automatic route deviation alerts, SOS triggers, and police coordination keep over 100,000 daily riders protected.</p>
                        <div class="post-footer">
                            <span>📅 2 Weeks Ago</span>
                            <span class="read-link">Read Story →</span>
                        </div>
                    </article>

                    <!-- Post 4 -->
                    <article class="blog-post-card">
                        <span class="blog-tag">INNOVATION</span>
                        <h3 class="post-title">The Science of ISI Helmets: Sanitization, Hairnets & Rider Safety</h3>
                        <p class="post-snippet">A look into our multi-city helmet replacement and hygiene audit program across 500,000 active bike taxi captains.</p>
                        <div class="post-footer">
                            <span>📅 3 Weeks Ago</span>
                            <span class="read-link">Read Story →</span>
                        </div>
                    </article>

                    <!-- Post 5 -->
                    <article class="blog-post-card">
                        <span class="blog-tag">EXPANSION</span>
                        <h3 class="post-title">Expanding to 50 New Tier-2 & Tier-3 Hubs in 2026</h3>
                        <p class="post-snippet">Bringing dependable app-based bike, auto, and parcel logistics to emerging cities like Indore, Surat, Coimbatore, and Patna.</p>
                        <div class="post-footer">
                            <span>📅 1 Month Ago</span>
                            <span class="read-link">Read Story →</span>
                        </div>
                    </article>

                    <!-- Post 6 -->
                    <article class="blog-post-card">
                        <span class="blog-tag">LOGISTICS</span>
                        <h3 class="post-title">Pakka Parcel: Scaling Same-Day Intra-City Delivery in Under 45 Mins</h3>
                        <p class="post-snippet">How small merchants, pharmacists, and home bakers use Pakka Parcel to power their daily local commerce.</p>
                        <div class="post-footer">
                            <span>📅 1 Month Ago</span>
                            <span class="read-link">Read Story →</span>
                        </div>
                    </article>
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
