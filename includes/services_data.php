<?php
/**
 * Pakka Local — Service Offerings & Platform Configuration (V3.0 Extended)
 * "Pakka Ride. Pakka Time."
 */

return [
    'brand' => [
        'name' => 'Pakka Local',
        'tagline' => 'Pakka Ride. Pakka Time.',
        'short_desc' => 'India\'s fastest, most dependable 3D-connected ride & parcel platform. Bike, Auto, Cab, SUV, EV Green & Same-day Delivery.',
        'support_phone' => '+91 1800-PAKKA-LOCAL',
        'support_email' => 'support@pakkalocal.in',
        'captain_earnings' => '₹35,000+'
    ],

    'services' => [
        'bike' => [
            'id' => 'bike',
            'name' => 'Pakka Bike',
            'hoarding_title' => 'Beat the jam. Solo.',
            'tagline' => 'Weave through peak traffic on a swift bike taxi built for one — sanitized ISI helmet included, fare fixed before you ride.',
            'base_fare' => 29,
            'per_km' => 8,
            'eta_mins' => '3 - 5 mins',
            'price_anchor' => 'Fares from ₹29',
            'time_anchor' => 'Pickup in ~5 min',
            'capacity' => '1 Passenger',
            'luggage' => '1 Backpack',
            'badge' => 'Fastest Solo Commute',
            'color' => '#D4AF37',
            'image' => 'assets/images/billboard-bike.jpg',
            'billboard_id' => 1,
            'scroll_point' => 0.15,
            'features' => [
                'Sanitized ISI Helmets & Disposable Hairnets',
                'Pre-fixed Guaranteed Pricing (Zero Surge Surprises)',
                'Nimble commute through congested city bottlenecks',
                'Real-time GPS ride-sharing with WhatsApp contacts'
            ],
            'ideal_for' => 'Daily office rush, quick metro connects, solo city hops.'
        ],

        'auto' => [
            'id' => 'auto',
            'name' => 'Pakka Auto',
            'hoarding_title' => 'The city\'s favourite three wheels.',
            'tagline' => 'Doorstep pickup, zero bargaining, fair metered pricing, and room for you and your shopping bags.',
            'base_fare' => 49,
            'per_km' => 13,
            'eta_mins' => '4 - 6 mins',
            'price_anchor' => 'Fares from ₹49',
            'time_anchor' => 'Flat fare, no haggling',
            'capacity' => '3 Passengers',
            'luggage' => '2 Medium Bags',
            'badge' => 'Zero Bargaining Guaranteed',
            'color' => '#E5B83B',
            'image' => 'assets/images/billboard-auto.jpg',
            'billboard_id' => 2,
            'scroll_point' => 0.30,
            'features' => [
                'Doorstep Arrival — No walking to distant auto stands',
                'Fair Digital Metering (No extra ₹20 demands)',
                'Spacious seating for up to 3 people',
                'UPI, Cash or In-App Wallet payments'
            ],
            'ideal_for' => 'Family shopping, wet monsoon drives, affordable everyday trips.'
        ],

        'cab' => [
            'id' => 'cab',
            'name' => 'Pakka Prime Cab',
            'hoarding_title' => 'Air-conditioned. On your time.',
            'tagline' => 'Travel in supreme AC comfort in top-rated Prime Sedans. Perfect for meetings, airport drops, and relaxing rides.',
            'base_fare' => 99,
            'per_km' => 17,
            'eta_mins' => '5 - 7 mins',
            'price_anchor' => 'Fares from ₹99',
            'time_anchor' => 'Guaranteed AC Sedans',
            'capacity' => '4 Passengers',
            'luggage' => '2-3 Large Bags',
            'badge' => 'AC Prime Comfort',
            'color' => '#F7F7F5',
            'image' => 'assets/images/billboard-cab.jpg',
            'billboard_id' => 3,
            'scroll_point' => 0.45,
            'features' => [
                '100% Guaranteed AC in Prime Clean Sedans',
                'Top-rated 4.85+ Star Captains with clean interiors',
                'Advance Scheduled Bookings for Airport / Outstation',
                'Zero Cancellation Penalties from driver side'
            ],
            'ideal_for' => 'Airport transfers, client meetings, relaxed city travel.'
        ],

        'parcel' => [
            'id' => 'parcel',
            'name' => 'Pakka Parcel',
            'hoarding_title' => 'Send it. Don\'t drive it.',
            'tagline' => 'Instant same-city pickup and doorstep delivery by the nearest verified Captain — from business documents to dabbas.',
            'base_fare' => 39,
            'per_km' => 10,
            'eta_mins' => 'Pickup in 10 mins',
            'price_anchor' => 'Starts @ ₹39',
            'time_anchor' => 'Delivered same day',
            'capacity' => 'Up to 15 kg',
            'luggage' => 'Secure courier box',
            'badge' => 'Express Same-Day Delivery',
            'color' => '#D4AF37',
            'image' => 'assets/images/billboard-parcel.jpg',
            'billboard_id' => 4,
            'scroll_point' => 0.60,
            'features' => [
                'Live GPS Tracking with OTP verification at delivery',
                'Send keys, chargers, lunch dabbas, business docs',
                'Pickup within 10 minutes from your doorstep',
                'Transit damage protection included'
            ],
            'ideal_for' => 'Forgotten items, home food deliveries, urgent business documents.'
        ],

        'ev' => [
            'id' => 'ev',
            'name' => 'Pakka EV Green',
            'hoarding_title' => '100% Electric. Zero Emission.',
            'tagline' => 'Ride clean with our whisper-quiet electric fleet of e-bikes, e-autos, and EV sedans. Eco-friendly, silent, and pocket-friendly.',
            'base_fare' => 35,
            'per_km' => 9,
            'eta_mins' => '4 - 6 mins',
            'price_anchor' => 'Starts @ ₹35',
            'time_anchor' => 'Eco-friendly & Silent',
            'capacity' => '1 to 4 Passengers',
            'luggage' => '2 Bags',
            'badge' => 'Zero Carbon Footprint',
            'color' => '#34C759',
            'image' => 'assets/images/billboard-ev.jpg',
            'billboard_id' => 5,
            'scroll_point' => 0.72,
            'features' => [
                'Zero Carbon Emissions on every kilometer',
                'Silent, vibration-free smooth electric drive',
                'Lower carbon footprint with renewable city charging',
                'Special green discount credits on every commute'
            ],
            'ideal_for' => 'Environment-conscious commuters, tech corridor hops.'
        ],

        'outstation' => [
            'id' => 'outstation',
            'name' => 'Pakka Outstation & Airport',
            'hoarding_title' => 'Highway Ready. Transparent Rates.',
            'tagline' => 'Book one-way or round-trip luxury SUVs and sedans for weekend road trips, airport transfers, and inter-city getaways.',
            'base_fare' => 1499,
            'per_km' => 14,
            'eta_mins' => 'Schedule Anytime',
            'price_anchor' => 'From ₹14/km',
            'time_anchor' => 'One-way & Round trips',
            'capacity' => '4 to 7 Passengers',
            'luggage' => '4-5 Large Bags',
            'badge' => 'Intercity & Airport XL',
            'color' => '#D4AF37',
            'image' => 'assets/images/billboard-outstation.jpg',
            'billboard_id' => 6,
            'scroll_point' => 0.84,
            'features' => [
                'Dedicated verified Highway Captains with 5+ yrs experience',
                'Toll & state permit transparency with zero hidden charges',
                'Spacious 6/7-seater SUVs (Innova, Ertiga, Scorpio)',
                'Free cancellation up to 2 hours before scheduled pickup'
            ],
            'ideal_for' => 'Weekend getaways, family outstation trips, airport bulk luggage.'
        ]
    ],

    'how_it_works' => [
        [
            'step' => '01',
            'signal' => 'red',
            'title' => 'Drop a Pin',
            'desc' => 'Set your pickup location and destination in seconds with intelligent landmark suggestions.'
        ],
        [
            'step' => '02',
            'signal' => 'amber',
            'title' => 'Pick Your Ride',
            'desc' => 'Choose between Pakka Bike, Auto, Prime Cab, EV Green, Outstation or Parcel with upfront pricing.'
        ],
        [
            'step' => '03',
            'signal' => 'green',
            'title' => 'Track Captain Live',
            'desc' => 'Get paired with the nearest verified driver in under 15 seconds. Share your OTP and glide away.'
        ]
    ],

    'stats' => [
        [
            'value' => '100+',
            'label' => 'Cities Across India',
            'sub' => 'From Metros to Tier-2 Hubs'
        ],
        [
            'value' => '50M+',
            'label' => 'Rides Completed',
            'sub' => 'Over 4.88★ Avg Customer Rating'
        ],
        [
            'value' => '2M+',
            'label' => 'Verified Captains',
            'sub' => 'Empowered Driver Partners'
        ],
        [
            'value' => '< 4 min',
            'label' => 'Avg Pickup Time',
            'sub' => 'AI-Powered Fast Dispatch'
        ]
    ],

    'safety_features' => [
        [
            'icon' => 'shield-alert',
            'title' => '24x7 Dedicated SOS Emergency',
            'desc' => 'Instant one-tap SOS connected directly to police control rooms and our 24/7 Rapid Safety Response Team.'
        ],
        [
            'icon' => 'umbrella',
            'title' => 'Comprehensive Ride Insurance',
            'desc' => 'Every single ride is insured up to ₹5,00,000 against accidental injury or hospital expenses with zero copay.'
        ],
        [
            'icon' => 'map-pin',
            'title' => 'Real-Time Trip Sharing',
            'desc' => 'Share live tracking link with WhatsApp contacts with 1 click. Family knows your exact route & ETA.'
        ],
        [
            'icon' => 'user-check',
            'title' => '100% Verified Captains',
            'desc' => 'Strict 4-point verification: Aadhaar, Police background check, Driving license & vehicle fitness check.'
        ]
    ],

    'cities' => [
        'Bengaluru', 'Hyderabad', 'Chennai', 'Delhi NCR', 'Mumbai',
        'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow',
        'Coimbatore', 'Kochi', 'Chandigarh', 'Indore', 'Surat'
    ],

    'faqs' => [
        [
            'q' => 'How is Pakka Local different from other ride apps?',
            'a' => 'Pakka Local focuses on true reliability ("Pakka") — pre-fixed fares with zero surprise surge hikes, zero driver cancellations after OTP acceptance, and verified local Captains with instant dispatch in under 4 minutes.'
        ],
        [
            'q' => 'Is a helmet provided for Pakka Bike rides?',
            'a' => 'Yes! Every Pakka Bike Captain carries a clean, sanitized ISI-certified helmet and disposable hairnet for the rider\'s comfort and safety.'
        ],
        [
            'q' => 'What is Pakka EV Green?',
            'a' => 'Pakka EV Green gives you 100% electric rides (e-bikes, e-autos, electric cabs) that produce zero carbon emissions, run whisper-quiet, and offer special green reward coins.'
        ],
        [
            'q' => 'How can I become a Pakka Local Captain?',
            'a' => 'Click "Drive with Us" in the header or footer, enter your phone number, upload your DL, RC, and Aadhaar, and start earning up to ₹35,000/month with daily payouts!'
        ],
        [
            'q' => 'Can I book an Outstation SUV for a weekend trip?',
            'a' => 'Yes! Select "Pakka Outstation & Airport", choose your destination city or airport terminal, and enjoy verified highway drivers with 100% transparent toll and permit fares.'
        ]
    ]
];
