# GazaKid MindCanvas Backend API

## Setup

1. Install dependencies:
```bash
npm install
```

2. Make sure MongoDB is running locally on port 27017

3. Start the server:
```bash
npm run dev
```

## Default Admin Account
- Email: admin@mindcanvas.com
- Password: Admin123!

## API Endpoints

### Authentication

#### POST /api/auth/login
Login with email and password

Request body:
```json
{
  "email": "admin@mindcanvas.com",
  "password": "Admin123!"
}
```

Response:
```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "admin@mindcanvas.com",
    "institutionName": "مركز الأمل للتأهيل النفسي",
    "role": "admin"
  }
}
```

### User Profile

#### GET /api/user/profile
Get current user profile (requires authentication)

Headers:
```
Authorization: Bearer <token>
```

#### PUT /api/user/profile
Update user profile information

Headers:
```
Authorization: Bearer <token>
```

Request body:
```json
{
  "institutionName": "New Institution Name",
  "averageChildren": 50,
  "licenseNumber": "12345",
  "address": "New Address",
  "contactNumber": "0599 999 999"
}
```

#### PUT /api/user/account
Update account settings (email & password)

Headers:
```
Authorization: Bearer <token>
```

Request body:
```json
{
  "email": "newemail@example.com",
  "currentPassword": "current-password",
  "newPassword": "new-password"
}
```

Note: `currentPassword` is always required. `email` and `newPassword` are optional.

## Environment Variables

Create a `.env` file in the backend directory with:

```env
MONGODB_URI=mongodb://localhost:27017/gazakid-mindcanvas
JWT_SECRET=your-secret-key
PORT=5000
DEFAULT_EMAIL=admin@mindcanvas.com
DEFAULT_PASSWORD=Admin123!