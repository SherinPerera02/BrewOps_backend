-- 4. Create Payments table
CREATE TABLE `payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `supplier_id` int(11) NOT NULL,
  `payment_type` enum('monthly', 'spot-cash') NOT NULL,
  `payment_month` varchar(7) DEFAULT NULL COMMENT 'Format: YYYY-MM for monthly payments',
  `amount` decimal(12,2) NOT NULL,
  `payment_date` datetime NOT NULL,
  `payment_method` enum('Cash', 'Bank Transfer', 'Cheque') NOT NULL DEFAULT 'Bank Transfer',
  `status` enum('pending', 'paid', 'cancelled') NOT NULL DEFAULT 'pending',
  `reference_number` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_payments_supplier` (`supplier_id`),
  KEY `idx_payment_type` (`payment_type`),
  KEY `idx_payment_month` (`payment_month`),
  KEY `idx_payment_date` (`payment_date`),
  KEY `idx_status` (`status`),
  KEY `idx_payments_month_type` (`payment_month`, `payment_type`),
  UNIQUE KEY `unique_monthly_payment` (`supplier_id`, `payment_month`, `payment_type`),
  CONSTRAINT `fk_payments_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
