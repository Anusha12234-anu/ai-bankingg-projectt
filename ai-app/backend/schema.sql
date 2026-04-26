-- AI-Guided Accessible Banking App - Database Schema (MySQL)

CREATE DATABASE IF NOT EXISTS ai_banking_db;
USE ai_banking_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    voice_pattern_id VARCHAR(255), -- Reference to stored voice pattern for verification
    biometric_id VARCHAR(255),    -- Reference to biometric data (if handled by server)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    recipient_account VARCHAR(20) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    transaction_type ENUM('transfer', 'bill_payment', 'withdrawal', 'deposit') NOT NULL,
    status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
    reference_id VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Sample Data
INSERT INTO users (name, email, phone_number, account_number, balance)
VALUES ('John Doe', 'john@example.com', '1234567890', '9876543210', 12458.50);
