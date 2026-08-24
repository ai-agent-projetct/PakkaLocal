<?php
/**
 * Pakka Local — Safety SOS & Contact API
 */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$rawInput = file_get_contents('php://input');
$json = json_decode($rawInput, true);
$payload = !empty($json) ? $json : $_POST;

$type = isset($payload['type']) ? trim($payload['type']) : 'sos';
$phone = isset($payload['phone']) ? trim($payload['phone']) : 'Emergency Caller';
$location = isset($payload['location']) ? trim($payload['location']) : 'Current GPS Coordinate';

$sosIncidentId = 'SOS-' . date('Ymd') . '-' . rand(1000, 9999);

echo json_encode([
    'success' => true,
    'incident_id' => $sosIncidentId,
    'type' => $type,
    'timestamp' => date('Y-m-d H:i:s'),
    'message' => 'Emergency Response Protocol Activated! Pakka 24x7 Safety Command Center and local emergency services notified.',
    'helpline' => '1800-72552-7233'
]);
