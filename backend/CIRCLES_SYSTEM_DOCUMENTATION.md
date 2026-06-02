# MentorCircle - Circles System API Documentation (Merged)

**Version:** 2.0 (Merged)  
**Status:** ✅ Production Ready with Advanced Features  
**Last Updated:** June 1, 2026

---

## OVERVIEW

The Circles System provides secure, production-grade community management with:

- ✅ **Public & Private Circles** (instant join vs approval-based)
- ✅ **Join Request Workflow** (creator approval system for private circles)
- ✅ **Role-Based Security** (mentor-only actions)
- ✅ **Rate Limiting** (100/day authenticated, 20/day anonymous)
- ✅ **Database Optimization** (indexed fields, optimized queries)
- ✅ **Complete Permissions** (custom DRF permissions)

---

## 1) USER ROLES

Users have two role options:

```
ROLE_CHOICES:
  - 'student': Can join circles, learn from peers and mentors
  - 'mentor': Can mentor in circles, provide guidance
```

Accessing user role:

```python
user_role = request.user.profile.role  # 'student' or 'mentor'
is_mentor = request.user.profile.role == 'mentor'
```

Mentor-only actions:
- Be assigned as circle mentors
- Create mentor-specific content
- Access mentor-only features

---

## 2) PUBLIC & PRIVATE CIRCLES

Every circle has an `is_private` field:

```
is_private = False  → Public Circle (instant join)
is_private = True   → Private Circle (request approval)
```

### Creating Circles

#### Public Circle (Instant Join)
```json
{
  "name": "Python for Beginners",
  "description": "Learn Python together",
  "domain": "computer_science",
  "skill_level": "beginner",
  "location": "Online",
  "preferred_language": "english",
  "max_members": 30,
  "is_private": false
}
```

Response: `201 Created`  
User instantly becomes a member.

#### Private Circle (Request Approval)
```json
{
  "name": "Advanced AI Study Group",
  "description": "In-depth exploration of AI/ML",
  "domain": "data_science",
  "skill_level": "advanced",
  "location": "Online",
  "preferred_language": "english",
  "max_members": 15,
  "is_private": true
}
```

Response: `201 Created`  
Creator can approve/reject member requests.

---

## 3) JOIN REQUEST SYSTEM

Join Request model:

```python
JoinRequest(
    user: User,
    circle: Circle,
    status: 'pending'|'accepted'|'rejected',
    message: str,
    created_at: DateTime,
    updated_at: DateTime
)
```

Duplicate protection:
- Only one pending request per user per circle.

---

## 4) SECURE JOIN LOGIC

### Public Circle Join Flow

```
POST /api/circles/join/<circle_id>/
  ↓
Check: is_private == False?
  ↓ YES
Check: already member?  → 400
Check: circle full?     → 400
Add user to members     → 200
```

### Private Circle Join Flow

```
POST /api/circles/join/<circle_id>/
  ↓
Check: is_private == True?
  ↓ YES
Check: already member?      → 400
Check: pending exists?      → 400
Create JoinRequest(pending) → 200 (request pending)
```

### Approval Flow

```
POST /api/circles/request/<request_id>/approve/
  ↓
Check: creator only?  → 403
Check: still pending? → 400
Check: has space?     → 400
Accept + add member   → 200
```

### Rejection Flow

```
POST /api/circles/request/<request_id>/reject/
  ↓
Check: creator only?  → 403
Check: still pending? → 400
Reject request        → 200
```

---

## 5) PERMISSIONS (CUSTOM DRF)

Implemented permission classes:

- `IsCircleCreator`: creator-only (update/delete/approve/reject)
- `IsCircleMember`: members + creator can access member content
- `IsMentorUser`: users with `role='mentor'` only
- `CanJoinCircle`: blocks join if already member or circle full
- `CanLeaveCircle`: blocks creator leaving; blocks non-members
- `CanManageJoinRequest`: creator-only join request management

---

## 6) RATE LIMITING

Configured in `settings.py`:

```python
REST_FRAMEWORK = {
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.UserRateThrottle",
        "rest_framework.throttling.AnonRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "user": "100/day",
        "anon": "20/day",
    },
}
```

HTTP 429 example:

```json
{
  "detail": "Request was throttled. Expected available in 86400 seconds."
}
```

---

## 7) DATABASE OPTIMIZATION

Indexed fields:
- `domain`, `location`, `preferred_language`, `skill_level`
- `created_at`, `created_by`

Query optimization guidance:
- Use `select_related('created_by')` for FK
- Use `prefetch_related('members', 'mentors')` for M2M

---

## 8) SECURITY VALIDATIONS

- Prevent duplicate joins / duplicate pending requests
- Prevent joining full circles (max members)
- Max 5 mentors enforcement
- Creator cannot leave
- Creator-only admin actions for join requests / circle management
- Request user validation via `request.user` (no user id from frontend)
- Proper HTTP status codes (200/201/400/403/404/429)

---

## 9) API ENDPOINTS

### Base URL

```
http://localhost:8000/api/circles/
```

### Circle Management

#### CREATE: `POST /api/circles/create/`

```bash
curl -X POST http://localhost:8000/api/circles/create/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Python for Beginners",
    "description": "Learning Python together",
    "domain": "computer_science",
    "skill_level": "beginner",
    "location": "Online",
    "preferred_language": "english",
    "is_private": false
  }'
```

Response: `201 Created`

#### LIST: `GET /api/circles/`

```bash
curl -X GET "http://localhost:8000/api/circles/?page=1&limit=20" \
  -H "Authorization: Bearer <token>"
```

Response: `200 OK` (paginated)

#### DETAIL: `GET /api/circles/<circle_id>/`

```bash
curl -X GET http://localhost:8000/api/circles/1/ \
  -H "Authorization: Bearer <token>"
```

Response: `200 OK`

### Circle Membership

#### JOIN: `POST /api/circles/join/<circle_id>/`

```bash
# Public circle (instant join)
curl -X POST http://localhost:8000/api/circles/join/1/ \
  -H "Authorization: Bearer <token>"

# Private circle (request approval)
curl -X POST http://localhost:8000/api/circles/join/2/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"I want to join!\"}"
```

Responses:
- Public: `200 OK` (user added)
- Private: `200 OK` (request pending)
- Full: `400 Bad Request`
- Already member: `400 Bad Request`

#### LEAVE: `POST /api/circles/leave/<circle_id>/`

```bash
curl -X POST http://localhost:8000/api/circles/leave/1/ \
  -H "Authorization: Bearer <token>"
```

Response: `200 OK`

### Join Request Management

#### REQUEST: `POST /api/circles/request/<circle_id>/`

```bash
curl -X POST http://localhost:8000/api/circles/request/2/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"I'd love to join this circle!\"}"
```

Response: `201 Created` (request pending)

#### APPROVE: `POST /api/circles/request/<request_id>/approve/`

```bash
curl -X POST http://localhost:8000/api/circles/request/5/approve/ \
  -H "Authorization: Bearer <creator_token>"
```

Response: `200 OK`

#### REJECT: `POST /api/circles/request/<request_id>/reject/`

```bash
curl -X POST http://localhost:8000/api/circles/request/5/reject/ \
  -H "Authorization: Bearer <creator_token>"
```

Response: `200 OK`

#### PENDING REQUESTS: `GET /api/circles/<circle_id>/pending-requests/`

```bash
curl -X GET http://localhost:8000/api/circles/1/pending-requests/ \
  -H "Authorization: Bearer <creator_token>"
```

Response: `200 OK`

### Circle Discovery

#### SEARCH: `GET /api/circles/search/`

```bash
curl -X GET "http://localhost:8000/api/circles/search/?search=Python" \
  -H "Authorization: Bearer <token>"

curl -X GET "http://localhost:8000/api/circles/search/?domain=computer_science&skill_level=beginner&location=Online" \
  -H "Authorization: Bearer <token>"

curl -X GET "http://localhost:8000/api/circles/search/?page=2&limit=50" \
  -H "Authorization: Bearer <token>"
```

Response: `200 OK`

#### MY CIRCLES: `GET /api/circles/my-circles/`

```bash
curl -X GET http://localhost:8000/api/circles/my-circles/ \
  -H "Authorization: Bearer <token>"
```

Response: `200 OK`

---

## 10) IMPLEMENTATION FILES

```
circles/
├── models.py
├── serializers.py
├── views.py
├── permissions.py
├── urls.py
├── admin.py
└── migrations/
```

---

## TESTING WORKFLOW (MANUAL)

1. Create two users and login (save tokens).
2. Create a public circle (creator becomes member).
3. Join public circle as another user.
4. Create a private circle.
5. Join private circle (creates pending request).
6. Creator lists pending requests.
7. Creator approves or rejects the request.
8. Verify membership via circle detail.

---

## ERROR RESPONSES (EXAMPLES)

### 400 Bad Request

```json
{
  "error": "Circle is full",
  "detail": "This circle has reached its maximum capacity of 30 members"
}
```

```json
{
  "error": "You are already a member of this circle",
  "detail": "Cannot join a circle twice"
}
```

### 403 Forbidden

```json
{
  "error": "Only the circle creator can approve requests",
  "detail": "You don't have permission to perform this action"
}
```

### 404 Not Found

```json
{
  "error": "Circle not found",
  "detail": "The requested circle does not exist"
}
```

---

## FRONTEND INTEGRATION NOTES

- Prefer using `is_member`, `is_full`, `available_spots` from API responses to drive UI logic.
- Handle `400` responses by displaying `detail` to the user.

