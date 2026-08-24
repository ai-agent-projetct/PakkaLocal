<?php
/**
 * Pakka Local — Ride Booking & Driver Dispatch API
 */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$data = require_once __DIR__ . '/../includes/services_data.php';

// Accept JSON or POST
$rawInput = file_get_contents('php://input');
$json = json_decode($rawInput, true);
$payload = !empty($json) ? $json : $_POST;

$pickup = isset($payload['pickup']) ? trim($payload['pickup']) : '';
$drop = isset($payload['drop']) ? trim($payload['drop']) : '';
$service = isset($payload['service']) ? trim($payload['service']) : 'bike';
$phone = isset($payload['phone']) ? trim($payload['phone']) : '';
$userName = isset($payload['user_name']) ? trim($payload['user_name']) : 'Rider';

if (empty($pickup) || empty($drop)) {
    echo json_encode([
        'success' => false,
        'message' => 'Please provide both pickup and drop-off locations.'
    ]);
    exit;
}

$captains = [
    'bike' => [
        ['name' => 'Suresh Kumar', 'rating' => 4.92, 'rides' => 4820, 'vehicle' => 'Honda Shine • KA 01 EQ 4421', 'avatar' => 'SK'],
        ['name' => 'Ramesh Patil', 'rating' => 4.88, 'rides' => 3120, 'vehicle' => 'Hero Splendor+ • DL 04 AX 9102', 'avatar' => 'RP'],
        ['name' => 'Karthik Raja', 'rating' => 4.95, 'rides' => 5400, 'vehicle' => 'TVS Raider 125 • TN 09 BK 2045', 'avatar' => 'KR']
    ],
    'auto' => [
        ['name' => 'Manjunath Reddy', 'rating' => 4.91, 'rides' => 6100, 'vehicle' => 'Bajaj Compact Auto • KA 05 MC 1982', 'avatar' => 'MR'],
        ['name' => 'Shiva Shankar', 'rating' => 4.85, 'rides' => 4200, 'vehicle' => 'Piaggio Ape Auto • MH 12 AQ 5510', 'avatar' => 'SS']
    ],
    'cab' => [
        ['name' => 'Anil Sharma', 'rating' => 4.96, 'rides' => 7450, 'vehicle' => 'Maruti Suzuki Dzire (AC) • DL 01 CS 8831', 'avatar' => 'AS'],
        ['name' => 'Venkatesh Rao', 'rating' => 4.93, 'rides' => 5900, 'vehicle' => 'Toyota Etios (AC) • KA 04 NC 7720', 'avatar' => 'VR']
    ],
    'parcel' => [
        ['name' => 'Vikram Singh', 'rating' => 4.94, 'rides' => 3800, 'vehicle' => 'Express Courier TVS • MH 02 DP 1198', 'avatar' => 'VS']
    ]
];

$categoryCaptains = isset($captains[$service]) ? $captains[$service] : $captains['bike'];
$assignedCaptain = $categoryCaptains[array_rand($categoryCaptains)];

$bookingId = 'PL-' . strtoupper(substr(md5(uniqid(rand(), true)), 0, 8));
$otp = strval(rand(1000, 9999));
$estMinutes = rand(3, 6);

// Mock distance calculation
$dist = rand(35, 120) / 10.0;
$serviceMeta = isset($data['services'][$service]) ? $data['services'][$service] : $data['services']['bike'];
$estFare = round($serviceMeta['base_fare'] + ($dist * $serviceMeta['per_km']) + 15);

echo json_encode([
    'success' => true,
    'booking_id' => $bookingId,
    'status' => 'CAPTAIN_ASSIGNED',
    'otp' => $otp,
    'eta_arrival' => $estMinutes . ' mins',
    'distance_km' => $dist . ' km',
    'total_fare' => '₹' . $estFare,
    'pickup' => $pickup,
    'drop' => $drop,
    'service' => $serviceMeta['name'],
    'service_id' => $service,
    'captain' => [
        'name' => $assignedCaptain['name'],
        'rating' => $assignedCaptain['rating'],
        'total_rides' => $assignedCaptain['rides'],
        'vehicle_number' => $assignedCaptain['vehicle'],
        'avatar_initials' => $assignedCaptain['avatar'],
        'phone_masked' => '+91 98XXX-XX' . rand(100, 999)
    ],
    'message' => 'Pakka Captain assigned! Share your 4-digit OTP upon boarding.'
]);
