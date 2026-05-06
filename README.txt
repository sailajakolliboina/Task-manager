Team Task Manager - Full Stack Web Application

PROJECT OVERVIEW:
Team Task Manager is a comprehensive project management tool built with React, Node.js, Express, PostgreSQL, and Prisma. It features role-based access control, JWT authentication, and a modern responsive UI.

TECH STACK:
Frontend: React + Vite + Tailwind CSS
Backend: Node.js + Express.js + Prisma
Database: PostgreSQL
Authentication: JWT + bcrypt
Deployment: Railway

FEATURES:
- User authentication (signup/login/logout)
- Role-based access control (Admin/Member)
- Project management (CRUD operations)
- Task management with status tracking
- Team member management
- Dashboard with analytics
- Responsive design
- RESTful API

DATABASE SCHEMA:
- Users (id, name, email, password, role, createdAt)
- Projects (id, title, description, ownerId, createdAt, updatedAt)
- ProjectMembers (id, projectId, userId, createdAt)
- Tasks (id, title, description, status, priority, dueDate, projectId, assignedToId, createdById, createdAt, updatedAt)

API ENDPOINTS:
Authentication:
POST /api/auth/signup
POST /api/auth/login
GET /api/auth/me

Projects:
POST /api/projects
GET /api/projects
GET /api/projects/:id
PUT /api/projects/:id
DELETE /api/projects/:id
POST /api/projects/:id/members
DELETE /api/projects/:id/members/:userId

Tasks:
POST /api/tasks
GET /api/tasks
GET /api/tasks/:id
PUT /api/tasks/:id
DELETE /api/tasks/:id
PATCH /api/tasks/:id/status

Dashboard:
GET /api/dashboard/stats

LOCAL SETUP:
Backend:
1. cd backend
2. npm install
3. Copy .env.example to .env
4. Configure DATABASE_URL, JWT_SECRET, PORT, CLIENT_URL
5. npx prisma generate
6. npx prisma migrate dev --name init
7. npm run dev

Frontend:
1. cd frontend
2. npm install
3. Copy .env.example to .env
4. Configure VITE_API_URL
5. npm run dev

RAILWAY DEPLOYMENT:
1. Create PostgreSQL database in Railway
2. Copy DATABASE_URL
3. Deploy backend with environment variables
4. Run: npx prisma migrate deploy
5. Deploy frontend with VITE_API_URL
6. Test live application

TEST CREDENTIALS:
Admin: admin@test.com / admin123
Member: member@test.com / member123

ENVIRONMENT VARIABLES:
Backend:
DATABASE_URL="postgresql://username:password@host:port/database"
JWT_SECRET="your_jwt_secret"
PORT=5000
CLIENT_URL="http://localhost:5173"

Frontend:
VITE_API_URL="http://localhost:5000/api"

VALIDATIONS:
- Name, email, password required for signup
- Password minimum 6 characters
- Valid email format
- Project title required
- Task title required
- Assigned user required for tasks
- Due date must be in future
- Status: PENDING, IN_PROGRESS, COMPLETED
- Priority: LOW, MEDIUM, HIGH

ROLE PERMISSIONS:
Admin:
- Create/update/delete projects
- Add/remove project members
- Create/assign/edit/delete tasks
- View all dashboard stats

Member:
- View assigned projects
- View assigned tasks
- Update task status
- View dashboard stats

FILE STRUCTURE:
team-task-manager/
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── .env.example
│   ├── prisma/schema.prisma
│   └── src/
│       ├── config/prisma.js
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── projectController.js
│       │   ├── taskController.js
│       │   └── dashboardController.js
│       ├── middleware/
│       │   ├── authMiddleware.js
│       │   └── roleMiddleware.js
│       └── routes/
│           ├── authRoutes.js
│           ├── projectRoutes.js
│           ├── taskRoutes.js
│           └── dashboardRoutes.js
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── api/axios.js
│       ├── context/AuthContext.jsx
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── StatCard.jsx
│       │   └── TaskCard.jsx
│       └── pages/
│           ├── Signup.jsx
│           ├── Login.jsx
│           ├── Dashboard.jsx
│           ├── Projects.jsx
│           ├── ProjectDetails.jsx
│           ├── CreateProject.jsx
│           ├── Tasks.jsx
│           ├── CreateTask.jsx
│           └── EditTask.jsx
├── README.md
└── README.txt

SUBMISSION REQUIREMENTS:
1. Live Application URL (Railway deployed)
2. GitHub Repository Link
3. README.txt (this file)
4. Project ZIP or README.md (under 10MB)

QUALITY REQUIREMENTS:
- No syntax errors
- Frontend and backend properly connected
- JWT authentication working
- Protected routes functional
- Admin/member access control working
- SQL relationships correct
- Dashboard counts accurate
- Overdue calculation working
- App refresh maintains login state
- Clean error messages
- Railway deployment ready
