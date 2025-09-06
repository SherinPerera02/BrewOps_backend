-- 3. Create Deliveries table
CREATE TABLE `deliveries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `supplier_id` int(11) NOT NULL,
  `delivery_date` datetime NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `quality_score` int(3) DEFAULT NULL CHECK (`quality_score` >= 0 AND `quality_score` <= 100),
  `rate_per_kg` decimal(10,2) NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_deliveries_supplier` (`supplier_id`),
  KEY `idx_delivery_date` (`delivery_date`),
  KEY `idx_supplier_date` (`supplier_id`, `delivery_date`),
  KEY `idx_deliveries_month` (`delivery_date`),
  CONSTRAINT `fk_deliveries_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
