# MentorCircle 

MentorCircle is a modern STEM learning collaboration platform where students and mentors connect through focused learning circles. 

The platform enables: 

* mentor-guided communities 
* peer collaboration 
* private/public learning circles 
* discussions and resources 
* role-based participation 
* AI-inspired collaborative learning workflows 

--- 

# Features 

## Authentication 

* JWT Authentication 
* Signup/Login 
* Role selection (Student / Mentor) 
* Profile management 
* Protected routes 

--- 

## Circles System 

* Public and Private circles 
* Create circle 
* Join circle 
* Join request approval system 
* Owner / Mentor / Member roles 
* Leave circle 
* Archive/Delete circle 
* Ownership transfer logic 

--- 

## Mentors & Peers 

* Mentor discovery 
* Peer collaboration 
* Role-based rendering 
* Clean participant filtering 
* Duplicate prevention 

--- 

## Discussions 

* Circle-based discussions 
* Real-time-ready architecture 
* Private circle access control 

--- 

## Profile System 

* Editable profile 
* Profile image upload 
* Skills & interests 
* Learning goals 
* Mentor expertise 

--- 

# Tech Stack 

## Frontend 

* React.js 
* React Router 
* Tailwind CSS 
* Axios 
* React Hot Toast 
* Lucide Icons 

--- 

## Backend 

* Django 
* Django REST Framework 
* JWT Authentication 
* SQLite/PostgreSQL 
* DRF Pagination 

--- 

# Project Structure 

## Frontend 

```bash 
frontend/ 
├── src/ 
│   ├── api/ 
│   ├── components/ 
│   ├── context/ 
│   ├── layouts/ 
│   ├── pages/ 
│   ├── routes/ 
│   ├── services/ 
│   └── utils/ 
``` 

## Backend 

```bash 
backend/ 
├── users/ 
├── circles/ 
├── mentors/ 
├── discussions/ 
├── ai_engine/ 
└── backend/ 
``` 

--- 

# Setup Instructions 

## Clone Repository 

```bash 
git clone <repo-url> 
cd MentorCircle 
``` 

--- 

## Environment Setup 

First, create environment files:

### Backend
Copy `backend/.env.example` to `backend/.env` and update as needed:
```bash
cd backend
cp .env.example .env
```

### Frontend
Copy `frontend/.env.example` to `frontend/.env` and update as needed:
```bash
cd frontend
cp .env.example .env
```

--- 

## Backend Setup 

```bash 
cd backend 

# Create virtual environment
python -m venv venv 

# Windows 
venv\Scripts\activate 

# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt 

# Run migrations
python manage.py migrate 

# Start server
python manage.py runserver 
``` 

Backend runs on: 
```bash 
http://127.0.0.1:8000 
``` 

--- 

## Frontend Setup 

```bash 
cd frontend 

# Install dependencies
npm install 

# Start development server
npm run dev 
``` 

Frontend runs on: 
```bash 
http://localhost:5173 
``` 

--- 

# API Documentation 

Swagger: 
```bash 
/api/docs/ 
``` 

Redoc: 
```bash 
/api/redoc/ 
``` 

--- 

# Main API Endpoints 

## Authentication 

```bash 
/api/auth/signup/ 
/api/auth/login/ 
/api/auth/profile/ 
/api/auth/logout/ 
``` 

## Circles 

```bash 
/api/circles/ 
/api/circles/<id>/ 
/api/circles/create/ 
/api/circles/join/ 
/api/circles/leave/ 
``` 

--- 

# Role Hierarchy 

## Owner 

* manages circle 
* accepts requests 
* archives circles 
* transfers ownership 

## Mentor 

* guides learners 
* participates in discussions 

## Member 

* joins circles 
* collaborates with peers 

--- 

# UI Theme 

* Navy Blue + White SaaS theme 
* Rounded modern cards 
* Responsive layouts 
* Minimal clean interface 

--- 

# Important System Behaviors 

* Soft delete architecture 
* Duplicate participant prevention 
* Private circle request approval flow 
* Ownership transfer logic 
* Role-based rendering consistency 
* Pagination support 

--- 

# Future Improvements 

* WebSockets discussions 
* Notifications 
* AI recommendations 
* Resource sharing 
* Live collaboration 
* Circle analytics 

--- 

# Author 

Built for collaborative STEM learning and mentor-driven communities.
