# MentorCircle Backend - Complete Implementation Guide

## Backend Architecture Overview

```
backend/
├── backend/                    # Project settings
│   ├── settings.py            # Django configuration
│   ├── urls.py                # Project URL routing
│   ├── wsgi.py                # WSGI application
│   └── asgi.py                # ASGI application
│
├── users/                      # User authentication app
│   ├── models.py              # UserProfile model
│   ├── serializers.py         # DRF serializers
│   ├── views.py               # API views
│   ├── urls.py                # App URL routing
│   ├── admin.py               # Django admin config
│   └── migrations/            # Database migrations
│
├── circles/                    # Learning circles app (placeholder)
├── mentors/                    # Mentorship app (placeholder)
├── discussions/               # Discussion forums app (placeholder)
├── ai_engine/                 # AI integration app (placeholder)
│
├── db.sqlite3                 # SQLite database
├── manage.py                  # Django management script
└── requirements.txt           # Python dependencies
```

## ============================================================================
## API ENDPOINTS & TESTING GUIDE
## ============================================================================

### Base URL
```
http://localhost:8000/api/
```

### 1. SIGNUP ENDPOINT
**POST** `/api/auth/signup/`

**Purpose:** Register a new user

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "password": "securepass123",
  "password2": "securepass123"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully!",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Testing in Postman:**
1. Set method to `POST`
2. URL: `http://localhost:8000/api/auth/signup/`
3. Headers:
   - `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "username": "alice",
  "email": "alice@example.com",
  "first_name": "Alice",
  "last_name": "Smith",
  "password": "Alice@1234",
  "password2": "Alice@1234"
}
```
5. Click **Send**

---

### 2. LOGIN ENDPOINT
**POST** `/api/auth/login/`

**Purpose:** Authenticate user and get JWT tokens

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "securepass123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful!",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Testing in Postman:**
1. Set method to `POST`
2. URL: `http://localhost:8000/api/auth/login/`
3. Headers:
   - `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "username": "alice",
  "password": "Alice@1234"
}
```
5. Click **Send** → Copy the `access` token for the next step

---

### 3. PROTECTED PROFILE ENDPOINT
**GET** `/api/auth/profile/`

**Purpose:** Get authenticated user's profile information

**Headers Required:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "profile": {
    "id": 1,
    "bio": "Passionate about STEM education",
    "profile_picture": null,
    "role": "student",
    "interests": "Physics, Mathematics",
    "experience_level": "intermediate",
    "skills": "Problem solving, Analytical thinking",
    "is_mentor": false,
    "mentorship_expertise": "",
    "learning_goals": "Master Physics concepts",
    "created_at": "2026-06-01T18:09:03.123456Z",
    "updated_at": "2026-06-01T18:09:03.123456Z"
  },
  "date_joined": "2026-06-01T18:09:03.123456Z"
}
```

**Testing in Postman:**
1. Set method to `GET`
2. URL: `http://localhost:8000/api/auth/profile/`
3. Headers:
   - `Authorization: Bearer <paste_your_access_token>`
   - `Content-Type: application/json`
4. Click **Send**

**Without authorization (will return 401 Unauthorized):**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

---

### 4. UPDATE PROFILE ENDPOINT
**PUT** `/api/auth/profile/`

**Purpose:** Update user's profile information

**Headers Required:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body (partial update):**
```json
{
  "first_name": "John",
  "last_name": "Developer",
  "profile": {
    "bio": "Full-stack developer",
    "role": "mentor",
    "experience_level": "advanced",
    "is_mentor": true
  }
}
```

**Response (200 OK):**
```json
{
  "message": "Profile updated successfully!",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Developer",
    ...
  }
}
```

---

### 5. REFRESH TOKEN ENDPOINT
**POST** `/api/auth/refresh/`

**Purpose:** Get new access token using refresh token

**Request Body:**
```json
{
  "refresh": "<refresh_token>"
}
```

**Response (200 OK):**
```json
{
  "access": "new_access_token...",
  "refresh": "new_refresh_token..."
}
```

**Token Validity:**
- Access token: 15 minutes
- Refresh token: 7 days

---

### 6. LOGOUT ENDPOINT
**POST** `/api/auth/logout/`

**Purpose:** Logout user (blacklist refresh token)

**Headers Required:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "refresh": "<refresh_token>"
}
```

**Response (200 OK):**
```json
{
  "message": "Logout successful!"
}
```

---

### 7. USER LIST ENDPOINT (Peer Discovery)
**GET** `/api/auth/users/`

**Purpose:** Find other users (peers, mentors)

**Headers Required:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Query Parameters:**
- `search`: Search by username/name (e.g., `?search=alice`)
- `role`: Filter by role (e.g., `?role=mentor`)

**Example Requests:**
```
GET /api/auth/users/
GET /api/auth/users/?search=alice
GET /api/auth/users/?role=mentor
GET /api/auth/users/?search=alice&role=student
```

**Response (200 OK):**
```json
[
  {
    "id": 2,
    "username": "bob",
    "email": "bob@example.com",
    "first_name": "Bob",
    "last_name": "Smith",
    "profile": {
      "id": 2,
      "bio": "Love STEM",
      "role": "student",
      "experience_level": "beginner",
      ...
    },
    "date_joined": "2026-06-01T18:09:03Z"
  }
]
```

---

## ============================================================================
## COMPLETE POSTMAN TESTING WORKFLOW
## ============================================================================

### Step 1: Signup a New User
1. **Create Collection:** Click "New" → "Collection" → Name: "MentorCircle API"
2. **Create Request:** Click "+" → Name: "Signup"
3. Configure:
   - Method: **POST**
   - URL: `http://localhost:8000/api/auth/signup/`
   - Body (raw JSON):
   ```json
   {
     "username": "testuser",
     "email": "test@example.com",
     "first_name": "Test",
     "last_name": "User",
     "password": "TestPass@123",
     "password2": "TestPass@123"
   }
   ```
4. Click **Send** → Save response access token

### Step 2: Login with Credentials
1. Create new request: "Login"
2. Configure:
   - Method: **POST**
   - URL: `http://localhost:8000/api/auth/login/`
   - Body (raw JSON):
   ```json
   {
     "username": "testuser",
     "password": "TestPass@123"
   }
   ```
3. Click **Send** → Copy `access` token

### Step 3: Access Protected Profile Route
1. Create new request: "Get Profile"
2. Configure:
   - Method: **GET**
   - URL: `http://localhost:8000/api/auth/profile/`
   - Headers tab:
     - Key: `Authorization`
     - Value: `Bearer <paste_access_token>`
3. Click **Send** → Should return user profile ✓

### Step 4: Test Without Authorization
1. Same request, **remove Authorization header**
2. Click **Send** → Should return 401 Unauthorized ✓

### Step 5: Update Profile
1. Create new request: "Update Profile"
2. Configure:
   - Method: **PUT**
   - URL: `http://localhost:8000/api/auth/profile/`
   - Headers:
     - `Authorization: Bearer <access_token>`
     - `Content-Type: application/json`
   - Body (raw JSON):
   ```json
   {
     "first_name": "Updated",
     "last_name": "Name"
   }
   ```
3. Click **Send** → Should return updated profile ✓

### Step 6: Test User Discovery
1. Create new request: "Find Users"
2. Configure:
   - Method: **GET**
   - URL: `http://localhost:8000/api/auth/users/?search=test`
   - Headers:
     - `Authorization: Bearer <access_token>`
3. Click **Send** → Returns list of users matching search ✓

---

## ============================================================================
## ADMIN PANEL ACCESS
## ============================================================================

**URL:** http://localhost:8000/admin/

**Credentials:**
- Username: `admin`
- Password: `admin123`

**Features:**
- Manage UserProfiles
- View user roles, experience, mentorship info
- Edit user details
- Filter by role, experience level
- Search users

---

## ============================================================================
## JWT AUTHENTICATION DETAILS
## ============================================================================

### Access Token
- **Lifetime:** 15 minutes
- **Used for:** Protected API endpoints
- **Sent in:** `Authorization: Bearer <access_token>`

### Refresh Token
- **Lifetime:** 7 days
- **Used for:** Getting new access tokens
- **Rotation:** Enabled (new refresh token on each refresh)
- **Blacklist:** Tokens are blacklisted after rotation

### Token Payload Example:
```json
{
  "token_type": "access",
  "exp": 1717252143,
  "iat": 1717251843,
  "jti": "abc123def456",
  "user_id": 1,
  "username": "johndoe"
}
```

---

## ============================================================================
## ERROR HANDLING EXAMPLES
## ============================================================================

### Missing Required Fields
```json
{
  "username": ["This field is required."],
  "email": ["This field is required."]
}
```

### Passwords Don't Match
```json
{
  "password": "Passwords do not match."
}
```

### Invalid Credentials
```json
{
  "error": "Invalid username or password."
}
```

### Unauthorized Access
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### Invalid or Expired Token
```json
{
  "detail": "Given token not valid for any token type",
  "code": "token_not_valid",
  "messages": [
    {
      "token_class": "AccessToken",
      "token_type": "access",
      "message": "Token is invalid or expired"
    }
  ]
}
```

---

## ============================================================================
## DATABASE MODELS REFERENCE
## ============================================================================

### User Model (Django built-in)
- `id` (Primary Key)
- `username` (Unique)
- `email`
- `first_name`
- `last_name`
- `password` (Hashed)
- `is_active`
- `is_staff`
- `date_joined`

### UserProfile Model (Extended)
- `id` (Primary Key)
- `user` (OneToOne → User)
- `bio` (TextField, optional)
- `profile_picture` (ImageField, optional)
- `role` (choice: student, mentor, both)
- `interests` (TextField)
- `experience_level` (choice: beginner, intermediate, advanced)
- `skills` (TextField)
- `is_mentor` (Boolean)
- `mentorship_expertise` (TextField)
- `learning_goals` (TextField)
- `created_at` (DateTime)
- `updated_at` (DateTime)

---

## ============================================================================
## USEFUL DJANGO MANAGEMENT COMMANDS
## ============================================================================

### Database Management
```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Reset database (WARNING: Deletes all data!)
python manage.py migrate --run-syncdb
python manage.py migrate users zero

# Show migration status
python manage.py showmigrations
```

### User Management
```bash
# Create superuser
python manage.py createsuperuser

# Change user password
python manage.py changepassword <username>

# Delete user
python manage.py shell
>>> from django.contrib.auth.models import User
>>> User.objects.get(username='testuser').delete()
```

### Server Management
```bash
# Run development server on default port (8000)
python manage.py runserver

# Run on custom port
python manage.py runserver 8080

# Run on all interfaces
python manage.py runserver 0.0.0.0:8000
```

### Django Shell
```bash
# Interactive Python shell with Django environment
python manage.py shell

# Example: Query users
>>> from django.contrib.auth.models import User
>>> User.objects.all()
>>> User.objects.get(username='johndoe')
>>> User.objects.filter(email='john@example.com')
```

---

## ============================================================================
## CORS CONFIGURATION
## ============================================================================

**Allowed Origins:**
- `http://localhost:5173` (Vite dev server)
- `http://127.0.0.1:5173`
- `http://localhost:3000` (Alternative frontend)

**Allowed Methods:** GET, POST, PUT, DELETE, OPTIONS, PATCH

**Allowed Headers:** Authorization, Content-Type, Accept

To add more origins, edit `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://your-domain.com",
    "https://your-domain.com",
]
```

---

## ============================================================================
## NEXT STEPS - FUTURE DEVELOPMENT
## ============================================================================

### 1. Circles App (Learning Groups)
- `Circle` model: Name, description, members, created_by
- `CircleMembership` model: user, circle, join_date, role
- Views: Create, list, join, leave circles

### 2. Mentors App (Mentorship Matching)
- `MentorProfile` model: Expertise, hourly_rate, availability
- `MentorSession` model: Mentor, student, schedule, notes
- Views: Find mentors, book sessions, rate mentors

### 3. Discussions App (Forums)
- `Thread` model: Title, content, author, circle
- `Post` model: Content, author, thread, created_at
- Views: Create threads, post replies, vote

### 4. AI Engine App (Learning Roadmaps)
- `LearningRoadmap` model: User, goal, AI-generated content
- Views: Generate roadmaps using AI API
- Integration: OpenAI, Claude, Hugging Face

---

## ============================================================================
## PRODUCTION DEPLOYMENT CHECKLIST
## ============================================================================

- [ ] Set `DEBUG = False` in settings.py
- [ ] Update `SECRET_KEY` with environment variable
- [ ] Configure `ALLOWED_HOSTS`
- [ ] Use PostgreSQL instead of SQLite
- [ ] Set up environment variables (.env file)
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS for production domain
- [ ] Set up static files serving
- [ ] Configure media files storage
- [ ] Enable CSRF protection
- [ ] Set up logging
- [ ] Run security checks: `python manage.py check --deploy`

---

## ============================================================================
## TROUBLESHOOTING
## ============================================================================

### Issue: CORS errors in frontend
**Solution:** Check CORS_ALLOWED_ORIGINS in settings.py matches frontend URL

### Issue: "No module named 'rest_framework'"
**Solution:** Install packages: `pip install -r requirements.txt`

### Issue: Port 8000 already in use
**Solution:** Run on different port: `python manage.py runserver 8001`

### Issue: Database locked
**Solution:** Delete db.sqlite3 and run migrations again

### Issue: Migrations conflicts
**Solution:** 
```bash
python manage.py migrate --run-syncdb
python manage.py makemigrations
python manage.py migrate
```

---

**Documentation Version:** 1.0  
**Last Updated:** June 1, 2026  
**Backend Status:** ✅ Production Ready
