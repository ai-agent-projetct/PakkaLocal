# Pakka Local — 3D Scroll-Drive Web Experience 🛵🛺🚗📦

> *"Pakka Ride. Pakka Time."*

A first-person 3D scroll-driven taxi & mobility web platform inspired by the interaction mechanics of **wonderland.studio/works/wow-media** and **fmgshipping.pro/en**, featuring services inspired by **Rapido** (Bike Taxi, Auto, Prime Cab & SUV, Parcel Express).

---

## 🌟 Key Features

1. **3D First-Person Road Journey (Three.js & Spline Traversal)**:
   - Catmull-Rom 3D curve winding down an Indian urban avenue from dusk to dawn.
   - Wet reflective asphalt road with specular sheen and lane markings.
   - 4 giant roadside hoardings with neon glowing gold borders and high-res screen graphics.
   - Moving 3D low-poly traffic (motorcycles, auto-rickshaws, sedans) with glowing headlights and red tail lights.
   - Overhead metro bridge / flyover gantry and traffic light rig (Red → Amber → Green).
   - Mouse look-around parallax and subtle engine idle micro-vibration.

2. **Interactive Automotive HUD**:
   - **MiniMap**: Real-time route tracker showing vehicle progress with clickable checkpoint nodes.
   - **Speedometer**: Live km/h telemetry that revs with scroll velocity and auto-cruise mode.
   - **Auto-Cruise Mode**: One-click autonomous scenic drive.
   - **Web Audio Engine**: Realistic procedural engine revs, speed pitch shifting, and city ambiance (muted by default).

3. **PHP Architecture & Endpoints**:
   - `index.php`: Master layout & dynamic service injection.
   - `includes/services_data.php`: Full configuration of all ride types, pricing, ETA, and safety data.
   - `api/calculate-fare.php`: Real-time transparent fare estimator.
   - `api/book-ride.php`: Instant ride booking & Captain assignment with secure 4-digit OTP.
   - `api/captain-register.php`: Driver partner onboarding flow (₹35,000/mo earnings calculator).
   - `api/contact-sos.php`: 24x7 Safety SOS emergency dispatch trigger.

4. **Brand System & Strict Color Tokens**:
   - `--pl-black`: `#0A0A0A`
   - `--pl-charcoal`: `#1C1C1E`
   - `--pl-gray`: `#8C8C90`
   - `--pl-gray-light`: `#C7C7CC`
   - `--pl-white`: `#F7F7F5`
   - `--pl-gold`: `#D4AF37`
   - `--pl-gold-deep`: `#9C7A22`

---

## 🚀 Quick Start

### Option 1: Run with PHP
If you have PHP installed (e.g. XAMPP, WAMP, Laragon, or PHP CLI):
```bash
cd pakka-local
php -S localhost:8000
```
Then open `http://localhost:8000` in your browser.

### Option 2: Run with Node.js
```bash
cd pakka-local
node server.js
# or
npm start
```
Then open `http://localhost:8080` in your browser.

### Option 3: Double-Click on Windows
Double-click `start-server.bat` in the `pakka-local` folder.

---

## 📂 Project Directory Structure

```
pakka-local/
├── index.php                 # Main entry page
├── server.js                 # Local dev server runner
├── package.json              # Project scripts
├── start-server.bat          # 1-click Windows launcher
├── includes/
│   ├── header.php            # Navigation, audio toggle, quick CTA
│   ├── footer.php            # Arrival banner, app download, FAQs
│   ├── modals.php            # Booking, Captain partner & SOS modals
│   └── services_data.php     # PHP services data layer
├── api/
│   ├── calculate-fare.php    # Live fare calculation endpoint
│   ├── book-ride.php         # Ride booking & driver assignment
│   ├── captain-register.php  # Captain partner registration
│   └── contact-sos.php       # Emergency SOS response
└── assets/
    ├── css/
    │   └── style.css         # Complete design system & HUD styles
    └── js/
        ├── audio.js          # Web Audio sound synthesizer
        ├── scene3d.js        # Three.js 3D WebGL engine & spline
        ├── booking.js        # Modals & AJAX controller
        └── main.js           # Scroll synchronization & HUD logic
```
