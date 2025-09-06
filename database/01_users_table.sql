-- Individual table creation scripts

-- 1. Create Users table (matching existing structure)
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL UNIQUE,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin', 'manager', 'staff', 'supplier', 'operator') NOT NULL DEFAULT 'staff',
  `phone` varchar(20) DEFAULT NULL,
  `employee_id` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_email` (`email`),
  UNIQUE KEY `unique_employee_id` (`employee_id`),
  KEY `idx_email` (`email`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert your existing users (with ON DUPLICATE KEY UPDATE to avoid conflicts)
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`, `employee_id`, `created_at`) VALUES
(2, 'Sachin', 'sachin@gmail.com', '$2b$10$PHI/ashDSHwEjwkF3yGHcOgt4uw0vOoafgh0nsCW6LKr4jdkd8okm', 'manager', '0714228754', 'MAN456', '2025-08-16 14:28:02'),
(4, 'Sherin Perera', 'sherin@gmail.com', '$2b$10$StXn4zhzca6w/UTa51XA6OCcqL0vZ2VQnZsraaSUk/oUQnI8JmQX6', 'supplier', '0712128456', 'SUP123', '2025-08-16 14:42:05'),
(5, 'Kalpani', 'kalpani@gmail.com', '$2b$10$T15dUDBpGCR9uLUj2zVkGOOe0ri2VFR3pbVBoCzZ9fniKt2LpTkVW', 'staff', '0712345670', 'STF789', '2025-08-16 17:09:52'),
(6, 'Muthumali', 'muthumali@gmail.com', '$2b$10$LPFwLxA63EHXpeiKREsEsuROC12qBTJFNMifPtxEgGCuyP4x0BI4G', 'manager', '0714228778', 'MAN457', '2025-08-17 12:18:58'),
(7, 'Sherin Perera', 'smperera574@gmail.com', '$2b$10$YqDLzAu34UZ.UKfJf6ClHeCpIExbcBjll9kagwm2KS883Ix9pKAw2', 'staff', '0712345678', 'STF791', '2025-08-27 14:15:47'),
(8, 'John Doe Employee', 'john.employee@company.com', '$2b$10$XgrJnH1EkKLeySBCclJf.uLqOYCw2f0eHCwSdXck3zeDU8FbbGynS', 'supplier', '0771234567', 'SUP125', '2025-09-02 09:29:37')
ON DUPLICATE KEY UPDATE 
  `name` = VALUES(`name`),
  `role` = VALUES(`role`),
  `phone` = VALUES(`phone`),
  `employee_id` = VALUES(`employee_id`);
