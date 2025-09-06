-- 5. Create Payment Statistics View
CREATE OR REPLACE VIEW `payment_statistics` AS
SELECT 
    COUNT(DISTINCT p.supplier_id) as total_suppliers,
    COUNT(p.id) as total_payments,
    SUM(CASE WHEN p.payment_type = 'monthly' THEN p.amount ELSE 0 END) as monthly_payments_total,
    SUM(CASE WHEN p.payment_type = 'spot-cash' THEN p.amount ELSE 0 END) as spot_cash_total,
    SUM(p.amount) as total_amount,
    AVG(p.amount) as average_payment,
    COUNT(CASE WHEN p.status = 'pending' THEN 1 END) as pending_payments,
    COUNT(CASE WHEN p.status = 'paid' THEN 1 END) as completed_payments,
    COUNT(CASE WHEN p.status = 'cancelled' THEN 1 END) as cancelled_payments
FROM payments p
WHERE p.payment_date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR);
