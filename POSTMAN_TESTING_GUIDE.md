# BrewOps Payment Module - Postman Testing Guide

## Setup Instructions

### 1. Start Your Server

```bash
cd "d:\Main_Project\BrewOps_backend"
npm start
```

Your server should be running on `http://localhost:5000`

### 2. Create Database Tables

First, run the database setup script:

```bash
node database/setup.js
```

## Postman Collection Setup

### Base URL

Set environment variable: `BASE_URL = http://localhost:5000`

---

## 🔐 Authentication Endpoints

### 1. User Login

**Method:** `POST`  
**URL:** `{{BASE_URL}}/api/users/login`  
**Headers:**

```
Content-Type: application/json
```

**Body (raw JSON):**

```json
{
  "email": "sachin@gmail.com",
  "password": "your_password_here"
}
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "name": "Sachin",
    "email": "sachin@gmail.com",
    "role": "manager"
  }
}
```

**⚠️ Important:** Save the token from the response and use it for protected routes!

---

## 🏭 Supplier Endpoints

### 2. Get All Suppliers

**Method:** `GET`  
**URL:** `{{BASE_URL}}/api/suppliers`  
**Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

### 3. Get Active Suppliers

**Method:** `GET`  
**URL:** `{{BASE_URL}}/api/suppliers/active`  
**Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

### 4. Create New Supplier

**Method:** `POST`  
**URL:** `{{BASE_URL}}/api/suppliers`  
**Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body (raw JSON):**

```json
{
  "name": "Green Valley Tea Suppliers",
  "contact_number": "+94771234567",
  "bank_account_number": "1234567890123456",
  "bank_name": "Commercial Bank",
  "rate": 150.0
}
```

### 5. Get Single Supplier

**Method:** `GET`  
**URL:** `{{BASE_URL}}/api/suppliers/1`  
**Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

### 6. Update Supplier

**Method:** `PUT`  
**URL:** `{{BASE_URL}}/api/suppliers/1`  
**Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body (raw JSON):**

```json
{
  "name": "Updated Supplier Name",
  "contact_number": "+94777777777",
  "rate": 160.0,
  "is_active": true
}
```

### 7. Delete Supplier (Soft Delete)

**Method:** `DELETE`  
**URL:** `{{BASE_URL}}/api/suppliers/1`  
**Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 📦 Delivery Endpoints

### 8. Create Delivery

**Method:** `POST`  
**URL:** `{{BASE_URL}}/api/deliveries`  
**Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body (raw JSON):**

```json
{
  "supplier_id": 1,
  "quantity": 50.5,
  "quality_score": 85,
  "rate_per_kg": 150.0
}
```

### 9. Get All Deliveries

**Method:** `GET`  
**URL:** `{{BASE_URL}}/api/deliveries`  
**Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Query Parameters (optional):**

- `supplier_id`: Filter by supplier ID
- `start_date`: Filter from date (YYYY-MM-DD)
- `end_date`: Filter to date (YYYY-MM-DD)

Example: `{{BASE_URL}}/api/deliveries?supplier_id=1&start_date=2025-09-01`

### 10. Get Monthly Summary

**Method:** `GET`  
**URL:** `{{BASE_URL}}/api/deliveries/monthly-summary/2025-09`  
**Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

### 11. Update Delivery

**Method:** `PUT`  
**URL:** `{{BASE_URL}}/api/deliveries/1`  
**Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body (raw JSON):**

```json
{
  "quantity": 60.0,
  "quality_score": 90,
  "rate_per_kg": 155.0
}
```

---

## 💰 Payment Endpoints

### 12. Get Payment Statistics

**Method:** `GET`  
**URL:** `{{BASE_URL}}/api/payments/statistics`  
**Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

### 13. Get All Payments

**Method:** `GET`  
**URL:** `{{BASE_URL}}/api/payments`  
**Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Query Parameters (optional):**

- `month`: Filter by month (YYYY-MM)
- `supplier_id`: Filter by supplier ID
- `payment_type`: Filter by type (monthly/spot-cash)

Example: `{{BASE_URL}}/api/payments?month=2025-09&payment_type=monthly`

### 14. Process Monthly Payment

**Method:** `POST`  
**URL:** `{{BASE_URL}}/api/payments/monthly`  
**Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body (raw JSON):**

```json
{
  "supplier_id": 1,
  "month": "2025-09",
  "amount": 7575.0,
  "payment_method": "Bank Transfer"
}
```

### 15. Process Spot Cash Payment

**Method:** `POST`  
**URL:** `{{BASE_URL}}/api/payments/spot-cash`  
**Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body (raw JSON):**

```json
{
  "supplier_id": 1,
  "quantity": 25.0,
  "rate_per_kg": 150.0,
  "payment_method": "Cash"
}
```

### 16. Update Payment Status

**Method:** `PATCH`  
**URL:** `{{BASE_URL}}/api/payments/1/status`  
**Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body (raw JSON):**

```json
{
  "status": "paid"
}
```

_Valid status values: pending, paid, cancelled_

---

## 🧪 Testing Sequence

### Recommended Testing Order:

1. **Login** to get authentication token
2. **Create Suppliers** (2-3 suppliers)
3. **Create Deliveries** for different suppliers
4. **Process Spot Cash Payments**
5. **Get Monthly Summary**
6. **Process Monthly Payments**
7. **View Payment Statistics**

---

## 🚨 Common Issues & Solutions

### Issue 1: "Token is not provided"

**Solution:** Add `Bearer ` prefix to your token in Authorization header

### Issue 2: "Not authorized, user not found"

**Solution:** Make sure you're using a valid token from a successful login

### Issue 3: "Database error"

**Solution:** Run `node database/setup.js` to create tables

### Issue 4: "Validation failed"

**Solution:** Check the required fields in request body match the examples

---

## 📊 Sample Test Data

### Test Suppliers:

```json
[
  {
    "name": "Green Valley Tea",
    "contact_number": "+94771234567",
    "bank_account_number": "1234567890123456",
    "bank_name": "Commercial Bank",
    "rate": 150.0
  },
  {
    "name": "Highland Gardens",
    "contact_number": "+94777654321",
    "bank_account_number": "6543210987654321",
    "bank_name": "Peoples Bank",
    "rate": 155.0
  }
]
```

### Test Deliveries:

```json
[
  {
    "supplier_id": 1,
    "quantity": 45.5,
    "quality_score": 85,
    "rate_per_kg": 150.0
  },
  {
    "supplier_id": 2,
    "quantity": 32.0,
    "quality_score": 92,
    "rate_per_kg": 155.0
  }
]
```

---

## 🎯 Expected Results

- **Successful requests** return status `200/201` with `"success": true`
- **Authentication failures** return status `401`
- **Validation errors** return status `400` with error details
- **Permission errors** return status `403`
- **Not found errors** return status `404`

Start testing with the login endpoint and work your way through the payment workflow!
