-- 2. Create Suppliers table
CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `supplier_id` varchar(20) NOT NULL UNIQUE,
  `name` varchar(100) NOT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `bank_account_number` varchar(30) DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `rate` decimal(10,2) NOT NULL DEFAULT 150.00,
  `is_active` boolean NOT NULL DEFAULT true,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_supplier_id` (`supplier_id`),
  KEY `idx_name` (`name`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample suppliers
INSERT INTO `suppliers` (`supplier_id`, `name`, `contact_number`, `bank_account_number`, `bank_name`, `rate`) VALUES
('SUP001', 'Green Valley Tea Suppliers', '+94771234567', '1234567890123456', 'Commercial Bank', 150.00),
('SUP002', 'Highland Tea Gardens', '+94777654321', '6543210987654321', 'Peoples Bank', 155.00),
('SUP003', 'Mountain Fresh Tea Co.', '+94712345678', '9876543210123456', 'Bank of Ceylon', 148.00);
