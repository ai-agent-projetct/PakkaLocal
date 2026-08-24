<?php
/**
 * Pakka Local — Captain Driver Partner Registration API
 */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$rawInput = file_get_contents('php://input');
$json = json_decode($rawInput, true);
$payload = !empty($json) ? $json : $_POST;

$fullName = isset($payload['full_name']) ? trim($payload['full_name']) : '';
$phone = isset($payload['phone']) ? trim($payload['phone']) : '';
$city = isset($payload['city']) ? trim($payload['city']) : '';
$vehicleType = isset($payload['vehicle_type']) ? trim($payload['vehicle_type']) : 'bike';

if (empty($fullName) || empty($phone) || empty($city)) {
    echo json_encode([
        'success' => false,
        'message' => 'Please provide your full name, phone number, and city.'
    ]);
    exit;
}

$applicationId = 'CAP-' . rand(100000, 999999);

echo json_encode([
    'success' => true,
    'application_id' => $applicationId,
    'applicant_name' => $fullName,
    'phone' => $phone,
    'city' => $city,
    'vehicle_type' => $vehicleType,
    'estimated_monthly_earnings' => '₹32,000 - ₹38,500',
    'status' => 'VERIFICATION_PENDING',
    'message' => 'Welcome to Pakka Local! Our local onboarding hub will call you within 2 hours to activate your Captain profile.'
]);
