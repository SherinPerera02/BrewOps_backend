# Authentication Token Usage - Updated to jwtToken

## Backend Changes Made

All authentication endpoints now return `jwtToken` instead of `token`:

### 1. Login/Register Response Format

```javascript
// OLD format
{
  success: true,
  message: "Login successful",
  token: "eyJhbGciOiJIUzI1NiIs...",
  user: { ... }
}

// NEW format
{
  success: true,
  message: "Login successful",
  jwtToken: "eyJhbGciOiJIUzI1NiIs...",
  user: { ... }
}
```

### 2. Files Updated

- `controllers/newAuthController.js` - Updated register & login
- `controllers/authController.js` - Updated login
- `routes/authRoutes.js` - Updated login route

## Frontend Requirements

### 1. Store Token After Login/Register

```javascript
// After successful login/register
const response = await axios.post(
  "http://localhost:5000/api/auth/login",
  loginData
);

if (response.data.success) {
  // Store using jwtToken key
  localStorage.setItem("jwtToken", response.data.jwtToken);
}
```

### 2. Retrieve Token for API Calls

```javascript
// For all authenticated API calls
const token = localStorage.getItem("jwtToken");

const response = await axios.get("http://localhost:5000/api/suppliers", {
  headers: { Authorization: `Bearer ${token}` },
});
```

### 3. Remove Token on Logout

```javascript
// On logout
localStorage.removeItem("jwtToken");
```

## Updated Frontend Files

- `ShowSupplier_Fixed.jsx` - Now uses `jwtToken`
- `CreateSupplier` component should use `jwtToken`
- `CreateSupplyRecord` component should use `jwtToken`
- `TeaFactoryPayment` component should use `jwtToken`

## Migration for Existing Users

If you have existing users with tokens stored as 'token', you may want to:

```javascript
// Check for old token and migrate
const oldToken = localStorage.getItem("token");
const newToken = localStorage.getItem("jwtToken");

if (oldToken && !newToken) {
  localStorage.setItem("jwtToken", oldToken);
  localStorage.removeItem("token");
}
```

## All API Endpoints That Require Authentication

- `GET /api/suppliers`
- `POST /api/suppliers`
- `GET /api/suppliers/:id`
- `PUT /api/suppliers/:id`
- `DELETE /api/suppliers/:id`
- `GET /api/deliveries`
- `POST /api/deliveries`
- `GET /api/payments`
- `POST /api/payments/monthly`
- `POST /api/payments/spot-cash`
- And all other protected routes...

All of these should use:

```javascript
headers: {
  Authorization: `Bearer ${localStorage.getItem("jwtToken")}`;
}
```
