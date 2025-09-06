-- Additional indexes for better performance
CREATE INDEX IF NOT EXISTS `idx_deliveries_month` ON `deliveries` (DATE_FORMAT(`delivery_date`, '%Y-%m'));
CREATE INDEX IF NOT EXISTS `idx_suppliers_active_name` ON `suppliers` (`is_active`, `name`);
