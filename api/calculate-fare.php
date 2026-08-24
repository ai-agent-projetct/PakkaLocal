<?php
/**
 * Pakka Local — Real-Time Fare Calculator API
 */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$data = require_once __DIR__ . '/../includes/services_data.php';
$services = $data['services'];

$serviceId = isset($_POST['service_id']) ? trim($_POST['service_id']) : (isset($_GET['service_id']) ? trim($_GET['service_id']) : 'bike');
$distanceKm = isset($_POST['distance_km']) ? floatval($_POST['distance_km']) : (isset($_GET['distance_km']) ? floatval($_GET['distance_km']) : 6.5);
$isAirport = isset($_POST['is_airport']) && $_POST['is_airport'] === '1';

if ($distanceKm <= 0) {
    $distanceKm = 5.0;
}

if (!isset($services[$serviceId])) {
    $serviceId = 'bike';
}

$selected = $services[$serviceId];
$baseFare = $selected['base_fare'];
$perKm = $selected['per_km'];

// Compute transparent fare
$distanceFare = $distanceKm * $perKm;
$serviceFee = 10;
$insuranceFee = 5;
$airportToll = $isAirport ? 120 : 0;

$subTotal = $baseFare + $distanceFare + $serviceFee + $insuranceFee + $airportToll;
$totalFare = round($subTotal);

$durationMins = round($distanceKm * ($serviceId === 'bike' ? 2.2 : ($serviceId === 'auto' ? 2.8 : 3.2)));

echo json_encode([
    'success' => true,
    'service_id' => $serviceId,
    'service_name' => $selected['name'],
    'distance_km' => $distanceKm,
    'duration_mins' => $durationMins . ' mins',
    'base_fare' => $baseFare,
    'distance_fare' => round($distanceFare),
    'service_fee' => $serviceFee,
    'insurance_fee' => $insuranceFee,
    'airport_toll' => $airportToll,
    'total_fare' => $totalFare,
    'formatted_fare' => '₹' . number_format($totalFare),
    'eta' => $selected['eta_mins'],
    'time_anchor' => $selected['time_anchor'],
    'price_anchor' => $selected['price_anchor'],
    'badge' => $selected['badge']
]);
