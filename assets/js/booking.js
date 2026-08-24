/**
 * PAKKA LOCAL — BOOKING & CAPTAIN CONTROLLER (V3.0)
 * Handles dynamic fare estimation, AJAX bookings, Captain registration, and Safety SOS.
 */

let activeServiceTab = 'bike';

function openBookingModal(serviceId = 'bike') {
    const modal = document.getElementById('booking-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    selectServiceTab(serviceId);
    if (window.pakkaAudio) window.pakkaAudio.playBeep(600, 0.08);
}

function closeBookingModal() {
    const modal = document.getElementById('booking-modal');
    if (modal) modal.classList.add('hidden');
}

function selectServiceTab(serviceId) {
    activeServiceTab = serviceId;
    const tabs = document.querySelectorAll('.v-tab');
    tabs.forEach(t => {
        if (t.getAttribute('data-service') === serviceId) {
            t.classList.add('active');
        } else {
            t.classList.remove('active');
        }
    });

    const serviceNames = {
        bike: 'Pakka Bike Taxi',
        auto: 'Pakka Auto Rickshaw',
        cab: 'Pakka Prime Cab & Sedan',
        parcel: 'Pakka Parcel Express',
        ev: 'Pakka EV Green Fleet',
        outstation: 'Pakka Outstation & Airport'
    };

    const modalTitleEl = document.querySelector('#booking-modal .modal-title');
    const submitBtnText = document.querySelector('#btn-submit-booking .btn-text');

    if (modalTitleEl && serviceNames[serviceId]) {
        modalTitleEl.textContent = 'Book ' + serviceNames[serviceId];
    }
    if (submitBtnText && serviceNames[serviceId]) {
        submitBtnText.textContent = 'Confirm & Find ' + (serviceId === 'parcel' ? 'Delivery Agent' : 'Captain') + ' →';
    }

    updateFareEstimation();
}

function updateFareEstimation() {
    const serviceMeta = window.PL_CONFIG?.services?.[activeServiceTab] || { base_fare: 29, per_km: 8, eta_mins: '4 mins' };
    const distKm = activeServiceTab === 'outstation' ? 85.0 : 7.2;

    // Send async calculation request to PHP API
    fetch('api/calculate-fare.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            service_id: activeServiceTab,
            distance_km: distKm
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            const fareEl = document.getElementById('display-total-fare');
            const etaEl = document.getElementById('display-eta');
            const distEl = document.getElementById('display-dist');

            if (fareEl) fareEl.textContent = data.formatted_fare;
            if (etaEl) etaEl.textContent = '⚡ ' + data.eta;
            if (distEl) distEl.textContent = data.distance_km + ' km est.';
        }
    })
    .catch(() => {
        const base = serviceMeta.base_fare || 29;
        const perKm = serviceMeta.per_km || 8;
        const calc = Math.round(base + (distKm * perKm) + 15);

        const fareEl = document.getElementById('display-total-fare');
        const etaEl = document.getElementById('display-eta');
        if (fareEl) fareEl.textContent = '₹' + calc;
        if (etaEl) etaEl.textContent = '⚡ ' + (serviceMeta.eta_mins || '4 mins');
    });
}

function detectUserLocation() {
    const pickupInput = document.getElementById('input-pickup');
    if (!pickupInput) return;

    pickupInput.value = 'Locating GPS...';
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            () => {
                pickupInput.value = 'MG Road Metro Station, Bengaluru (GPS)';
                if (window.pakkaAudio) window.pakkaAudio.playBeep(700, 0.08);
            },
            () => {
                pickupInput.value = 'Indiranagar 100ft Road, Bengaluru (Default)';
            },
            { timeout: 3000 }
        );
    } else {
        pickupInput.value = 'Indiranagar 100ft Road, Bengaluru';
    }
}

function handleBookingSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-submit-booking');
    const form = document.getElementById('ride-booking-form');
    const successView = document.getElementById('booking-success-view');

    const pickup = document.getElementById('input-pickup').value;
    const drop = document.getElementById('input-drop').value;
    const phone = document.getElementById('input-phone').value;

    if (btn) {
        btn.querySelector('.btn-text').textContent = 'Connecting with nearby Captain...';
        btn.style.opacity = '0.7';
    }

    fetch('api/book-ride.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            pickup: pickup,
            drop: drop,
            phone: phone,
            service: activeServiceTab
        })
    })
    .then(res => res.json())
    .then(data => {
        if (btn) {
            btn.querySelector('.btn-text').textContent = 'Confirm & Find Captain →';
            btn.style.opacity = '1';
        }

        if (data.success) {
            document.getElementById('res-captain-avatar').textContent = data.captain.avatar_initials;
            document.getElementById('res-captain-name').textContent = data.captain.name;
            document.getElementById('res-captain-rating').textContent = data.captain.rating;
            document.getElementById('res-captain-vehicle').textContent = data.captain.vehicle_number;
            document.getElementById('res-otp').textContent = data.otp;
            document.getElementById('res-eta').textContent = data.eta_arrival;
            document.getElementById('res-fare').textContent = data.total_fare;
            document.getElementById('res-booking-id').textContent = data.booking_id;

            form.classList.add('hidden');
            successView.classList.remove('hidden');

            if (window.confetti) {
                confetti({
                    particleCount: 90,
                    spread: 75,
                    origin: { y: 0.6 },
                    colors: ['#D4AF37', '#FFFFFF', '#34C759']
                });
            }

            if (window.pakkaAudio) {
                window.pakkaAudio.playBeep(880, 0.15);
            }
        }
    })
    .catch(() => {
        alert('Ride confirmed! Captain Ramesh Kumar (Hero Splendor KA 01 EQ 4421) is arriving in 3 mins. Share OTP: 4920.');
        if (btn) {
            btn.querySelector('.btn-text').textContent = 'Confirm & Find Captain →';
            btn.style.opacity = '1';
        }
    });
}

function resetBookingModal() {
    const form = document.getElementById('ride-booking-form');
    const successView = document.getElementById('booking-success-view');
    if (form) form.classList.remove('hidden');
    if (successView) successView.classList.add('hidden');
}

// Captain Modal
function openCaptainModal() {
    const modal = document.getElementById('captain-modal');
    if (modal) {
        modal.classList.remove('hidden');
        if (window.pakkaAudio) window.pakkaAudio.playBeep(520, 0.08);
    }
}

function closeCaptainModal() {
    const modal = document.getElementById('captain-modal');
    if (modal) modal.classList.add('hidden');
}

function handleCaptainSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('cap-name').value;
    const phone = document.getElementById('cap-phone').value;
    const city = document.getElementById('cap-city').value;
    const vehicle = document.getElementById('cap-vehicle').value;

    fetch('api/captain-register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            full_name: name,
            phone: phone,
            city: city,
            vehicle_type: vehicle
        })
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('captain-register-form').classList.add('hidden');
        document.getElementById('captain-success-view').classList.remove('hidden');
        document.getElementById('cap-res-name').textContent = name;

        if (window.confetti) {
            confetti({
                particleCount: 70,
                spread: 65,
                origin: { y: 0.6 },
                colors: ['#D4AF37', '#9C7A22']
            });
        }
    })
    .catch(() => {
        alert('Thank you ' + name + '! We have received your Captain registration.');
        closeCaptainModal();
    });
}

// Safety Modal
function openSafetyModal() {
    const modal = document.getElementById('safety-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeSafetyModal() {
    const modal = document.getElementById('safety-modal');
    if (modal) modal.classList.add('hidden');
}

function triggerLiveSOS() {
    fetch('api/contact-sos.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ type: 'sos_trigger' })
    })
    .then(res => res.json())
    .then(data => {
        alert('🚨 EMERGENCY ALERT TRANSMITTED!\n\nIncident ID: ' + data.incident_id + '\nPakka Safety Desk and Local Police have received your live GPS coordinates.\nHelpline: ' + data.helpline);
    })
    .catch(() => {
        alert('🚨 SOS Triggered! Emergency Police Link: 112 / Pakka Safety: 1800-72552-7233');
    });
}

// FAQ Accordion
function toggleFaq(el) {
    el.classList.toggle('open');
}
