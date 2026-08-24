/**
 * PAKKA LOCAL — CLIENT CONFIGURATION & SERVICES TELEMETRY
 * Guaranteed fallback configuration if running without PHP CLI.
 */

window.PL_CONFIG = {
    brand: {
        name: "Pakka Local",
        tagline: "Pakka Ride. Pakka Time.",
        short_desc: "India's fastest 3D scroll-drive mobility platform.",
        currency: "₹",
        sos_number: "1800-72552-7233"
    },
    services: {
        bike: {
            id: "bike",
            name: "Pakka Bike Taxi",
            badge: "HOARDING 01 // SOLO RUSH",
            tagline: "Beat the jam. Solo. Sanitized ISI helmet included.",
            base_fare: 29,
            per_km: 8,
            eta_mins: "3 - 5 mins",
            image: "assets/images/billboard-bike.jpg",
            cta: "Book Pakka Bike"
        },
        auto: {
            id: "auto",
            name: "Pakka Auto Rickshaw",
            badge: "HOARDING 02 // THREE WHEELS",
            tagline: "The city's favourite 3 wheels. Zero bargaining guaranteed.",
            base_fare: 49,
            per_km: 13,
            eta_mins: "4 - 6 mins",
            image: "assets/images/billboard-auto.jpg",
            cta: "Book Pakka Auto"
        },
        cab: {
            id: "cab",
            name: "Pakka Prime Cab & Sedan",
            badge: "HOARDING 03 // AC PRIME COMFORT",
            tagline: "100% Guaranteed AC Sedans. Clean interiors & top captains.",
            base_fare: 99,
            per_km: 16,
            eta_mins: "5 - 7 mins",
            image: "assets/images/billboard-cab.jpg",
            cta: "Book Prime Cab"
        },
        parcel: {
            id: "parcel",
            name: "Pakka Parcel Express",
            badge: "HOARDING 04 // SAME-DAY LOGISTICS",
            tagline: "Send it. Don't drive it. Same-day instant doorstep pickup & delivery.",
            base_fare: 39,
            per_km: 9,
            eta_mins: "Pickup in 10 mins",
            image: "assets/images/billboard-parcel.jpg",
            cta: "Send a Parcel"
        },
        ev: {
            id: "ev",
            name: "Pakka EV Green Fleet",
            badge: "HOARDING 05 // 100% ELECTRIC",
            tagline: "100% Electric. Zero Emission. Eco-friendly & whisper quiet.",
            base_fare: 35,
            per_km: 10,
            eta_mins: "4 - 6 mins",
            image: "assets/images/billboard-ev.jpg",
            cta: "Book Pakka EV"
        },
        outstation: {
            id: "outstation",
            name: "Pakka Outstation & Airport",
            badge: "HOARDING 06 // INTERCITY & AIRPORT",
            tagline: "Highway ready luxury SUVs & sedans for family getaways.",
            base_fare: 499,
            per_km: 14,
            eta_mins: "24x7 Scheduled",
            image: "assets/images/billboard-outstation.jpg",
            cta: "Book Outstation"
        }
    }
};
