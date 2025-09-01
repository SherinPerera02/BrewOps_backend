-- Create suppliers table for the Tea Factory Management System
-- This table stores detailed information about tea leaf suppliers

CREATE TABLE IF NOT EXISTS suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL DEFAULT 'Sri Lanka',
    bank_account_number VARCHAR(50),
    bank_name VARCHAR(255),
    branch_code VARCHAR(20),
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Foreign key constraints
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes for better performance
    INDEX idx_supplier_id (supplier_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_city (city),
    INDEX idx_created_at (created_at)
);

-- Create supply_records table for tracking deliveries and transactions
CREATE TABLE IF NOT EXISTS supply_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id VARCHAR(50) NOT NULL,
    delivery_date DATE NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    quality_score DECIMAL(3,1) DEFAULT 0.0,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    tea_type VARCHAR(100),
    moisture_content DECIMAL(4,2),
    status ENUM('pending', 'approved', 'delivered', 'rejected') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE CASCADE,
    
    -- Indexes for better performance
    INDEX idx_supplier_id (supplier_id),
    INDEX idx_delivery_date (delivery_date),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    
    -- Constraints
    CHECK (quantity > 0),
    CHECK (quality_score >= 0 AND quality_score <= 10),
    CHECK (unit_price >= 0),
    CHECK (total_amount >= 0),
    CHECK (moisture_content >= 0 AND moisture_content <= 100)
);

-- Insert sample data for testing (optional)
-- Note: Make sure the user_id exists in your users table

INSERT INTO suppliers (supplier_id, user_id, name, contact_number, address, city, postal_code, bank_account_number, bank_name, branch_code) VALUES
('SUP001', 1, 'Green Valley Tea Estates', '+94771234567', '123 Tea Estate Road, Nuwara Eliya', 'Nuwara Eliya', '22200', '1234567890', 'Bank of Ceylon', '001'),
('SUP002', 2, 'Mountain Peak Suppliers', '+94777654321', '456 Highland Avenue, Kandy', 'Kandy', '20000', '0987654321', 'Commercial Bank', '002');


-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_contact ON suppliers(contact_number);
CREATE INDEX IF NOT EXISTS idx_supply_records_amount ON supply_records(total_amount);
CREATE INDEX IF NOT EXISTS idx_supply_records_quality ON supply_records(quality_score);
