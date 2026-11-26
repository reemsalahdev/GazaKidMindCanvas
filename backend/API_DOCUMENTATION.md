# GazaKid MindCanvas Backend API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## API Endpoints

### Authentication

#### 1. Login
- **POST** `/auth/login`
- **Body:**
```json
{
  "email": "admin@mindcanvas.com",
  "password": "Admin123!"
}
```
- **Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": { ... }
}
```

### User Management

#### 1. Get User Profile
- **GET** `/user/profile`
- **Headers:** Authorization required

#### 2. Update User Profile
- **PUT** `/user/profile`
- **Headers:** Authorization required
- **Body:**
```json
{
  "institutionName": "مركز الأمل",
  "averageChildren": 50,
  "licenseNumber": "123456",
  "address": "غزة - حي الرمال",
  "contactNumber": "0599123456"
}
```

#### 3. Update OpenAI Configuration
- **PUT** `/user/openai-config`
- **Headers:** Authorization required
- **Body:**
```json
{
  "baseUrl": "https://api.openai.com/v1",
  "apiKey": "your-openai-api-key"
}
```

#### 4. Get OpenAI Config Status
- **GET** `/user/openai-config-status`
- **Headers:** Authorization required

### Dashboard

#### 1. Get Dashboard Statistics
- **GET** `/dashboard/stats`
- **Headers:** Authorization required

#### 2. Get Mental Health Indicators
- **GET** `/dashboard/mental-health`
- **Headers:** Authorization required

#### 3. Get Chart Data
- **GET** `/dashboard/chart-data?period=7days`
- **Headers:** Authorization required
- **Query Params:** 
  - `period`: `7days`, `30days`, `6months`

#### 4. Get Recent Activities
- **GET** `/dashboard/recent-activities?limit=10`
- **Headers:** Authorization required

### Children Management

#### 1. Get All Children
- **GET** `/children?page=1&limit=10&search=&group=all&gender=all&sortBy=name&sortOrder=asc`
- **Headers:** Authorization required
- **Query Params:**
  - `page`: Page number
  - `limit`: Items per page
  - `search`: Search by name
  - `group`: Filter by group
  - `gender`: `all`, `male`, `female`
  - `sortBy`: Sort field
  - `sortOrder`: `asc` or `desc`

#### 2. Get Single Child
- **GET** `/children/:id`
- **Headers:** Authorization required

#### 3. Create Child
- **POST** `/children`
- **Headers:** Authorization required
- **Body:**
```json
{
  "name": "أحمد محمد",
  "age": 8,
  "gender": "male",
  "group": "المجموعة أ",
  "favoriteColor": "#FF6B6B",
  "additionalInfo": {
    "medicalHistory": "لا توجد أمراض مزمنة",
    "familyBackground": "عائلة مستقرة",
    "previousAssessments": "تقييم سابق إيجابي",
    "notes": "طفل نشيط ومحب للرسم"
  }
}
```

#### 4. Update Child
- **PUT** `/children/:id`
- **Headers:** Authorization required
- **Body:** Same as create (partial update supported)

#### 5. Delete Child (Soft Delete)
- **DELETE** `/children/:id`
- **Headers:** Authorization required

#### 6. Get Groups
- **GET** `/children/groups/list`
- **Headers:** Authorization required

#### 7. Update Emotional Status
- **PUT** `/children/:id/emotional-status`
- **Headers:** Authorization required
- **Body:**
```json
{
  "emotionalStatus": {
    "happiness": 70,
    "sadness": 30,
    "anger": 20,
    "fear": 25,
    "anxiety": 35
  }
}
```

#### 8. Update Psychological Indicators
- **PUT** `/children/:id/psychological-indicators`
- **Headers:** Authorization required
- **Body:**
```json
{
  "psychologicalIndicators": {
    "selfConfidence": 80,
    "socialInteraction": 75,
    "emotionalExpression": 70,
    "adaptability": 85,
    "cognitiveAbility": 90
  }
}
```

#### 9. Get Child's Drawings
- **GET** `/children/:id/drawings?page=1&limit=10&status=all`
- **Headers:** Authorization required

### Drawings Management

#### 1. Upload Drawing
- **POST** `/drawings/upload`
- **Headers:** Authorization required
- **Content-Type:** `multipart/form-data`
- **Body (FormData):**
  - `image`: Image file (required)
  - `childId`: Child ID (required)
  - `title`: Drawing title
  - `description`: Drawing description
  - `context`: JSON string of context object

#### 2. Analyze Drawing
- **POST** `/drawings/:id/analyze`
- **Headers:** Authorization required
- **Note:** Requires OpenAI configuration to be set

#### 3. Get All Drawings
- **GET** `/drawings?page=1&limit=10&childId=&status=all&isAnalyzed=`
- **Headers:** Authorization required
- **Query Params:**
  - `page`: Page number
  - `limit`: Items per page
  - `childId`: Filter by child
  - `status`: `all`, `pending`, `analyzing`, `completed`, `failed`
  - `isAnalyzed`: `true` or `false`

#### 4. Get Single Drawing
- **GET** `/drawings/:id`
- **Headers:** Authorization required

#### 5. Update Drawing
- **PUT** `/drawings/:id`
- **Headers:** Authorization required
- **Body:**
```json
{
  "title": "رسمة جديدة",
  "description": "وصف الرسمة",
  "professionalNotes": "ملاحظات المختص"
}
```

#### 6. Delete Drawing
- **DELETE** `/drawings/:id`
- **Headers:** Authorization required

#### 7. Update Emotional Status
- **PUT** `/drawings/:id/emotional-status`
- **Headers:** Authorization required
- **Body:**
```json
{
  "psychologicalState": {
    "happiness": 60,
    "sadness": 40,
    "anger": 30,
    "fear": 35,
    "anxiety": 45
  }
}
```

#### 8. Get Drawing Statistics for Child
- **GET** `/drawings/child/:childId/stats`
- **Headers:** Authorization required

## Testing Steps

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Start the Server**
```bash
npm run dev
```

3. **Test Authentication**
   - Login with default credentials
   - Save the token for other requests

4. **Configure OpenAI**
   - Use the `/user/openai-config` endpoint to set your OpenAI base URL and API key

5. **Create Test Data**
   - Create a child using `/children` endpoint
   - Upload a drawing using `/drawings/upload`
   - Analyze the drawing using `/drawings/:id/analyze`

## Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error message in Arabic"
}
```

## Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error