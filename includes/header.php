<?php
/**
 * Pakka Local — Header Navigation Bar (with Day / Night Mode Switcher)
 */
?>
<header id="pl-header" class="pl-header">
    <div class="header-container">
        <!-- Brand Logo -->
        <a href="#scene-hero" class="pl-brand" onclick="window.scrollToProgress && window.scrollToProgress(0); return false;">
            <div class="brand-badge">
                <span class="brand-initial">PL</span>
                <span class="brand-pulse"></span>
            </div>
            <div class="brand-text">
                <span class="brand-name">PAKKA <span class="text-gold">LOCAL</span></span>
                <span class="brand-sub">PAKKA RIDE. PAKKA TIME.</span>
            </div>
        </a>

        <!-- Desktop Navigation Links -->
        <nav class="pl-nav" id="pl-nav">
            <a href="index.php" class="nav-link <?= (basename($_SERVER['PHP_SELF'] ?? '') == 'index.php' || basename($_SERVER['PHP_SELF'] ?? '') == '') ? 'active' : '' ?>">
                <span>Home</span>
            </a>
            <a href="about.php" class="nav-link <?= (basename($_SERVER['PHP_SELF'] ?? '') == 'about.php') ? 'active' : '' ?>">
                <span>About Us</span>
            </a>
            <a href="safety.php" class="nav-link <?= (basename($_SERVER['PHP_SELF'] ?? '') == 'safety.php') ? 'active' : '' ?>">
                <span>Safety</span>
            </a>
            <a href="careers.php" class="nav-link <?= (basename($_SERVER['PHP_SELF'] ?? '') == 'careers.php') ? 'active' : '' ?>">
                <span>Careers</span>
            </a>
            <a href="blog.php" class="nav-link <?= (basename($_SERVER['PHP_SELF'] ?? '') == 'blog.php') ? 'active' : '' ?>">
                <span>Blog</span>
            </a>
            <a href="contact.php" class="nav-link <?= (basename($_SERVER['PHP_SELF'] ?? '') == 'contact.php') ? 'active' : '' ?>">
                <span>Contact Us</span>
            </a>
            <button type="button" class="nav-link captain-link" onclick="openCaptainModal()">
                <span class="badge-gold">EARN ₹35K+</span>
                <span>Drive with Us</span>
            </button>
        </nav>

        <!-- Right Controls & CTAs -->
        <div class="header-actions">
            <!-- Day / Night Studio Mode Toggle -->
            <button id="theme-toggle" class="btn-theme-toggle" title="Switch between Night Drive & Day Studio Mode" onclick="toggleDayNightMode()">
                <span class="theme-icon-sun hidden">☀️ DAY</span>
                <span class="theme-icon-moon">🌙 NIGHT</span>
            </button>

            <!-- Sound Toggle -->
            <button id="sound-toggle" class="btn-icon-sound" title="Toggle City & Engine Sound" aria-label="Audio Soundscape">
                <svg class="icon-muted" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <line x1="23" y1="9" x2="17" y2="15"></line>
                    <line x1="17" y1="9" x2="23" y2="15"></line>
                </svg>
                <svg class="icon-unmuted hidden" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                </svg>
                <span class="sound-label">SOUND</span>
            </button>

            <!-- Auto Cruise Toggle -->
            <button id="cruise-toggle" class="btn-cruise" title="Sit back and let the car drive itself" onclick="toggleAutoCruise()">
                <span class="cruise-icon">⚡</span>
                <span class="cruise-text">CRUISE</span>
            </button>

            <!-- Primary Commitment CTA -->
            <button class="btn-gold-pill" onclick="openBookingModal('bike')">
                <span>Book a Ride</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
            </button>
        </div>
    </div>
</header>
