<?php
/**
 * Pakka Local — Interactive Modals (Booking, Captain Onboarding, Safety SOS)
 */
?>

<!-- ================= 1. BOOKING MODAL ================= -->
<div id="booking-modal" class="pl-modal-backdrop hidden" onclick="if(event.target === this) closeBookingModal()">
    <div class="pl-modal-card">
        <div class="modal-header">
            <div class="modal-title-group">
                <span class="badge-gold">INSTANT DISPATCH // V3.0</span>
                <h3 class="modal-title">Book Your Pakka Ride</h3>
                <p class="modal-desc">Upfront fixed fares. 100% verified Captain in &lt; 4 mins.</p>
            </div>
            <button class="modal-close" onclick="closeBookingModal()" aria-label="Close modal">✕</button>
        </div>

        <form id="ride-booking-form" onsubmit="handleBookingSubmit(event)">
            <!-- Vehicle Selector Tabs (6 Categories) -->
            <div class="vehicle-tabs vehicle-tabs-v3">
                <button type="button" class="v-tab active" data-service="bike" onclick="selectServiceTab('bike')">
                    <div class="v-tab-icon">🛵</div>
                    <div class="v-tab-info">
                        <span class="v-name">Pakka Bike</span>
                        <span class="v-time">~4m • ₹29+</span>
                    </div>
                </button>
                <button type="button" class="v-tab" data-service="auto" onclick="selectServiceTab('auto')">
                    <div class="v-tab-icon">🛺</div>
                    <div class="v-tab-info">
                        <span class="v-name">Pakka Auto</span>
                        <span class="v-time">~5m • ₹49+</span>
                    </div>
                </button>
                <button type="button" class="v-tab" data-service="cab" onclick="selectServiceTab('cab')">
                    <div class="v-tab-icon">🚗</div>
                    <div class="v-tab-info">
                        <span class="v-name">Prime Cab</span>
                        <span class="v-time">~6m • ₹99+</span>
                    </div>
                </button>
                <button type="button" class="v-tab" data-service="ev" onclick="selectServiceTab('ev')">
                    <div class="v-tab-icon">⚡</div>
                    <div class="v-tab-info">
                        <span class="v-name">EV Green</span>
                        <span class="v-time">~5m • ₹35+</span>
                    </div>
                </button>
                <button type="button" class="v-tab" data-service="parcel" onclick="selectServiceTab('parcel')">
                    <div class="v-tab-icon">📦</div>
                    <div class="v-tab-info">
                        <span class="v-name">Parcel</span>
                        <span class="v-time">Express • ₹39+</span>
                    </div>
                </button>
                <button type="button" class="v-tab" data-service="outstation" onclick="selectServiceTab('outstation')">
                    <div class="v-tab-icon">✈️</div>
                    <div class="v-tab-info">
                        <span class="v-name">Outstation</span>
                        <span class="v-time">Airport • ₹14/km</span>
                    </div>
                </button>
            </div>

            <!-- Locations input -->
            <div class="inputs-group">
                <div class="input-row">
                    <div class="input-indicator green-dot"></div>
                    <div class="input-field-wrap">
                        <label>PICKUP LOCATION</label>
                        <input type="text" id="input-pickup" required placeholder="Enter pickup address, landmark, or metro station..." value="Indiranagar 100ft Road, Bengaluru">
                    </div>
                    <button type="button" class="btn-location-gps" onclick="detectUserLocation()" title="Use Current GPS">📍</button>
                </div>

                <div class="input-connector-line"></div>

                <div class="input-row">
                    <div class="input-indicator red-dot"></div>
                    <div class="input-field-wrap">
                        <label>DROP LOCATION</label>
                        <input type="text" id="input-drop" required placeholder="Where do you want to go?" value="Koramangala 5th Block, Bengaluru">
                    </div>
                </div>

                <div class="input-row input-phone-row">
                    <div class="input-indicator gold-dot"></div>
                    <div class="input-field-wrap">
                        <label>PHONE NUMBER (FOR DRIVER CALL / OTP)</label>
                        <input type="tel" id="input-phone" required placeholder="10-digit mobile number" value="98765 43210">
                    </div>
                </div>
            </div>

            <!-- Fare & Route Breakdown -->
            <div class="fare-estimation-box" id="fare-breakdown-box">
                <div class="fare-main">
                    <div>
                        <span class="fare-label">Guaranteed Upfront Fare</span>
                        <div class="fare-amount" id="display-total-fare">₹115</div>
                    </div>
                    <div class="fare-eta-block">
                        <span class="fare-eta-badge" id="display-eta">⚡ 4 mins away</span>
                        <span class="fare-distance" id="display-dist">7.2 km est.</span>
                    </div>
                </div>
                <div class="fare-perks">
                    <span>🛡️ ₹5L Insurance Included</span>
                    <span>🚫 Zero Cancellation Fee</span>
                    <span>💳 UPI / Cash / Cards</span>
                </div>
            </div>

            <!-- Form Action -->
            <div class="modal-actions">
                <button type="submit" class="btn-submit-booking" id="btn-submit-booking">
                    <span class="btn-text">Confirm & Find Captain →</span>
                    <span class="btn-spinner hidden"></span>
                </button>
            </div>
        </form>

        <!-- Driver Assigned State (Shows dynamically after booking) -->
        <div id="booking-success-view" class="booking-success-view hidden">
            <div class="captain-status-badge">
                <span class="status-pulse"></span>
                <span>CAPTAIN EN ROUTE</span>
            </div>

            <div class="captain-card">
                <div class="captain-avatar-circle" id="res-captain-avatar">SK</div>
                <div class="captain-details">
                    <h4 class="captain-name" id="res-captain-name">Suresh Kumar</h4>
                    <div class="captain-rating">⭐ <span id="res-captain-rating">4.92</span> (4,820 rides)</div>
                    <div class="captain-vehicle" id="res-captain-vehicle">Honda Shine • KA 01 EQ 4421</div>
                </div>
            </div>

            <div class="otp-banner">
                <span class="otp-label">SHARE WITH CAPTAIN UPON BOARDING:</span>
                <div class="otp-code" id="res-otp">4892</div>
            </div>

            <div class="ride-trip-meta">
                <div class="meta-item">
                    <span class="meta-label">Est. Arrival</span>
                    <span class="meta-val" id="res-eta">3 mins</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Estimated Fare</span>
                    <span class="meta-val text-gold" id="res-fare">₹115</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Booking ID</span>
                    <span class="meta-val" id="res-booking-id">PL-9A3F1</span>
                </div>
            </div>

            <div class="success-actions">
                <button type="button" class="btn-sos-inline" onclick="openSafetyModal()">🚨 SOS / Emergency</button>
                <button type="button" class="btn-close-success" onclick="resetBookingModal()">Book Another Ride</button>
            </div>
        </div>
    </div>
</div>

<!-- ================= 2. CAPTAIN ONBOARDING MODAL ================= -->
<div id="captain-modal" class="pl-modal-backdrop hidden" onclick="if(event.target === this) closeCaptainModal()">
    <div class="pl-modal-card">
        <div class="modal-header">
            <div class="modal-title-group">
                <span class="badge-gold">CAPTAIN PARTNER PROGRAM</span>
                <h3 class="modal-title">Drive & Earn with Pakka Local</h3>
                <p class="modal-desc">Earn up to ₹35,000/month with daily direct bank payouts & lowest platform fee.</p>
            </div>
            <button class="modal-close" onclick="closeCaptainModal()" aria-label="Close modal">✕</button>
        </div>

        <form id="captain-register-form" onsubmit="handleCaptainSubmit(event)">
            <div class="captain-earnings-preview">
                <div class="preview-item">
                    <span class="prev-title">Estimated Monthly Earnings</span>
                    <span class="prev-value text-gold" id="cap-earning-calc">₹32,000 - ₹38,000</span>
                </div>
                <div class="prev-sub">Based on 8-10 rides/day • Daily direct bank settlements</div>
            </div>

            <div class="inputs-group">
                <div class="input-row">
                    <div class="input-indicator gold-dot"></div>
                    <div class="input-field-wrap">
                        <label>FULL NAME (AS PER AADHAAR)</label>
                        <input type="text" id="cap-name" required placeholder="Enter your legal full name">
                    </div>
                </div>

                <div class="input-row">
                    <div class="input-indicator gold-dot"></div>
                    <div class="input-field-wrap">
                        <label>MOBILE NUMBER (FOR REGISTRATION OTP)</label>
                        <input type="tel" id="cap-phone" required placeholder="10-digit mobile number">
                    </div>
                </div>

                <div class="input-row">
                    <div class="input-indicator gold-dot"></div>
                    <div class="input-field-wrap">
                        <label>OPERATING CITY</label>
                        <select id="cap-city" class="custom-select" required>
                            <option value="Bengaluru">Bengaluru</option>
                            <option value="Hyderabad">Hyderabad</option>
                            <option value="Chennai">Chennai</option>
                            <option value="Delhi NCR">Delhi NCR</option>
                            <option value="Mumbai">Mumbai</option>
                            <option value="Pune">Pune</option>
                            <option value="Kolkata">Kolkata</option>
                            <option value="Ahmedabad">Ahmedabad</option>
                        </select>
                    </div>
                </div>

                <div class="input-row">
                    <div class="input-indicator gold-dot"></div>
                    <div class="input-field-wrap">
                        <label>VEHICLE YOU OWN / WILL DRIVE</label>
                        <select id="cap-vehicle" class="custom-select" required>
                            <option value="bike">Motorcycle / Scooter (Bike Taxi & Delivery)</option>
                            <option value="auto">Auto-Rickshaw (3-Wheeler CNG/Electric/Petrol)</option>
                            <option value="cab">Car / Sedan / SUV (AC Cab)</option>
                            <option value="ev">Electric Scooter / EV Auto (Green Fleet)</option>
                            <option value="parcel">Delivery Only (TVS / Hero Bike)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="modal-actions">
                <button type="submit" class="btn-submit-booking">
                    <span>Submit & Start Onboarding →</span>
                </button>
            </div>
        </form>

        <div id="captain-success-view" class="booking-success-view hidden">
            <div class="captain-status-badge">
                <span class="status-pulse"></span>
                <span>APPLICATION RECEIVED</span>
            </div>
            <p class="mt-3 text-white text-center">Thanks <strong id="cap-res-name" class="text-gold"></strong>! Our city onboarding partner will call you in <strong>&lt; 2 hours</strong> for free document verification and Captain kit dispatch.</p>
            <div class="mt-4 text-center">
                <button type="button" class="btn-gold-pill" onclick="closeCaptainModal()">Got It</button>
            </div>
        </div>
    </div>
</div>

<!-- ================= 3. SAFETY SOS MODAL ================= -->
<div id="safety-modal" class="pl-modal-backdrop hidden" onclick="if(event.target === this) closeSafetyModal()">
    <div class="pl-modal-card safety-modal-card">
        <div class="modal-header">
            <div class="modal-title-group">
                <span class="badge-red">24x7 SAFETY COMMAND</span>
                <h3 class="modal-title">Emergency Response Center</h3>
                <p class="modal-desc">Direct satellite link to Pakka Safety Taskforce & Police Emergency.</p>
            </div>
            <button class="modal-close" onclick="closeSafetyModal()" aria-label="Close modal">✕</button>
        </div>

        <div class="safety-content-box">
            <div class="sos-trigger-banner" onclick="triggerLiveSOS()">
                <div class="sos-big-btn">🚨</div>
                <div class="sos-btn-text">
                    <h4>TRIGGER ONE-TAP SOS</h4>
                    <p>Transmits live GPS coordinates to local police and emergency contacts instantly.</p>
                </div>
            </div>

            <div class="safety-grid">
                <div class="s-card">
                    <h5>🛡️ ₹5 Lakh Ride Insurance</h5>
                    <p>Every active ride is protected by HDFC ERGO accidental insurance with zero deductible.</p>
                </div>
                <div class="s-card">
                    <h5>📍 Live WhatsApp Tracking</h5>
                    <p>Share a dynamic live GPS link so your family can watch your car move in real-time.</p>
                </div>
                <div class="s-card">
                    <h5>📞 24x7 Safety Helpline</h5>
                    <p>Call toll-free: <strong>1800-72552-7233</strong> for immediate human assistance.</p>
                </div>
                <div class="s-card">
                    <h5>👮 Verified Captain Database</h5>
                    <p>All drivers undergo Aadhaar biometric and criminal background verification.</p>
                </div>
            </div>
        </div>
    </div>
</div>
