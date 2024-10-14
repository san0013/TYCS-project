<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: *");

// Connect to the database
$host = 'localhost';
$user = 'root';
$password = '';
$dbname = 'ecommerce';
$conn = new mysqli($host, $user, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Debugging: Log incoming JSON data
    $data = json_decode(file_get_contents('php://input'), true);
    file_put_contents('php://stderr', print_r($data, TRUE)); // Log the incoming data

    // Extract product information from the data
    foreach ($data['items'] as $item) {
        $name = $item['name'];
        $price = $item['price'];
        $size = $item['size'];
        $quantity = $item['quantity'];
        $total = $price * $quantity;

        // Prepare and bind
        $stmt = $conn->prepare("INSERT INTO orders (name, price, size, quantity, total) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sdids", $name, $price, $size, $quantity, $total);

        // Execute the statement
        if (!$stmt->execute()) {
            die("Error executing statement: " . $stmt->error);
        }
    }

    // Close statement and connection
    $stmt->close();
    $conn->close();

    // Return success response
    echo json_encode(["message" => "Order submitted successfully!"]);
} else {
    echo json_encode(["message" => "Invalid request method."]);
}



