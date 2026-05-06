# Team Task Manager

A full-stack web application for managing team tasks and projects with role-based access control.

## Project Overview

Team Task Manager is a comprehensive project management tool that allows teams to create projects, assign tasks, track progress, and collaborate effectively. The application features a clean, modern interface with robust authentication and authorization systems.

## Features

### Authentication
- User signup and login
- JWT token-based authentication
- Password hashing with bcrypt
- Protected routes and middleware
- Token storage in localStorage

### Role-Based Access Control
- **Admin Role**: Can create projects, manage members, create/assign/edit/delete tasks
- **Member Role**: Can view assigned projects, update task status, view dashboard

### Project Management
- Create, read, update, delete projects
- Add/remove team members to projects
- Project member management
- Project ownership tracking

### Task Management
- Create, read, update, delete tasks
- Assign tasks to team members
- Task status tracking (Pending, In Progress, Completed)
- Priority levels (Low, Medium, High)
- Due date management
- Overdue task detection

### Dashboard Analytics
- Total projects and tasks overview
- Task status distribution
- Priority breakdown
- Recent tasks display
- Upcoming due tasks
- Completion rate tracking

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Prisma** - ORM for PostgreSQL
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **React Router** - Client-side routing
- **Tailwind CSS** - CSS framework
- **Axios** - HTTP client

### Deployment
- **Railway** - Primary deployment platform
- **PostgreSQL** - Managed database

## Database Schema

### User Model
```sql
User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  role      Role     @default(MEMBER)
  createdAt DateTime @default(now())
}
```

### Project Model
```sql
Project {
  id          String   @id @default(cuid())
  title       String
  description String?
  ownerId     String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### ProjectMember Model
```sql
ProjectMember {
  id        String   @id @default(cuid())
  projectId String
  userId    String
  createdAt DateTime @default(now())
}
```

### Task Model
```sql
Task {
  id           String     @id @default(cuid())
  title        String
  description  String?
  status       TaskStatus @default(PENDING)
  priority     Priority   @default(MEDIUM)
  dueDate      DateTime?
  projectId    String
  assignedToId String?
  createdById  String
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}
```

### Enums
```sql
enum Role { ADMIN, MEMBER }
enum TaskStatus { PENDING, IN_PROGRESS, COMPLETED }
enum Priority { LOW, MEDIUM, HIGH }
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Projects
- `POST /api/projects` - Create new project
- `GET /api/projects` - Get user's projects
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/members` - Add member to project
- `DELETE /api/projects/:id/members/:userId` - Remove member from project

### Tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks` - Get tasks (with filters)
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id/status` - Update task status
- `DELETE /api/tasks/:id` - Delete task

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Local Setup

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```
DATABASE_URL="postgresql://username:password@localhost:5432/team_task_manager"
JWT_SECRET="your_jwt_secret_key_here"
PORT=5000
CLIENT_URL="http://localhost:5173"
```

5. Generate Prisma client:
```bash
npx prisma generate
```

6. Run database migrations:
```bash
npx prisma migrate dev --name init
```

7. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```
VITE_API_URL="http://localhost:5000/api"
```

5. Start the frontend development server:
```bash
npm run dev
```

### Running the Application

1. Start the backend server (port 5000)
2. Start the frontend server (port 5173)
3. Open your browser and navigate to `http://localhost:5173`

## Railway Deployment

### Backend Deployment

1. Create a new PostgreSQL database in Railway
2. Copy the DATABASE_URL from Railway dashboard
3. Create a new Railway service for the backend
4. Add environment variables:
   ```
   DATABASE_URL="your_railway_database_url"
   JWT_SECRET="your_secure_jwt_secret"
   PORT=5000
   CLIENT_URL="https://your_frontend_url.railway.app"
   ```
5. Run Prisma migrations:
   ```bash
   npx prisma migrate deploy
   ```
6. Deploy the backend

### Frontend Deployment

1. Create a new Railway service for the frontend
2. Add environment variable:
   ```
   VITE_API_URL="https://your_backend_url.railway.app/api"
   ```
3. Deploy the frontend

### Railway Deployment Steps

1. **Create Railway Account**: Sign up at [railway.app](https://railway.app)

2. **Set Up Database**:
   - Click "New Project" → "Add a Service" → "PostgreSQL"
   - Wait for database to be ready
   - Copy the DATABASE_URL from the database service

3. **Deploy Backend**:
   - Click "New Project" → "Add a Service" → "GitHub Repo"
   - Configure to deploy from your repository
   - Add environment variables:
     ```
     DATABASE_URL="your_copied_database_url"
     JWT_SECRET="generate_a_secure_random_string"
     PORT=5000
     CLIENT_URL="https://your_app_name.railway.app"
     ```
   - Set build command: `npm install && npm run postinstall`
   - Set start command: `npm start`
   - Deploy and wait for build to complete

4. **Run Database Migrations**:
   - Open backend service console
   - Run: `npx prisma migrate deploy`

5. **Deploy Frontend**:
   - Click "New Project" → "Add a Service" → "GitHub Repo"
   - Configure to deploy from your repository
   - Add environment variable:
     ```
     VITE_API_URL="https://your_backend_service_name.railway.app/api"
     ```
   - Set build command: `cd frontend && npm install && npm run build`
   - Set start command: `cd frontend && npm run preview`
   - Deploy and wait for build to complete

6. **Test the Application**:
   - Visit your frontend URL
   - Test signup, login, and all features

## Test Credentials

### Admin Account
- **Email**: admin@test.com
- **Password**: admin123
- **Role**: ADMIN

### Member Account
- **Email**: member@test.com
- **Password**: member123
- **Role**: MEMBER

## Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://username:password@host:port/database"
JWT_SECRET="your_jwt_secret"
PORT=5000
CLIENT_URL="http://localhost:5173"
```

### Frontend (.env)
```
VITE_API_URL="http://localhost:5000/api"
```

## Validations

### Backend Validations
- Name field is required
- Valid email format required
- Password minimum 6 characters
- Role must be ADMIN or MEMBER
- Project title required
- Task title required
- Assigned user required for tasks
- Project required for tasks
- Due date must be in future
- Status must be PENDING, IN_PROGRESS, or COMPLETED
- Priority must be LOW, MEDIUM, or HIGH

### Frontend Validations
- Form validation on all inputs
- Error message display
- Loading states during API calls
- Protected route enforcement

## Error Handling

- Global error handling middleware
- Consistent error response format
- Frontend error boundaries
- User-friendly error messages
- API error interceptors

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation and sanitization
- Protected routes middleware
- Role-based access control

## Performance Considerations

- Database indexing on foreign keys
- Efficient database queries with Prisma
- Frontend code splitting
- Image optimization
- API response caching where appropriate

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the GitHub repository.

---

## Submission Checklist

- [ ] Backend configured with PostgreSQL and Prisma
- [ ] All API endpoints implemented and tested
- [ ] Authentication system working correctly
- [ ] Role-based access control implemented
- [ ] Frontend connected to backend API
- [ ] All pages and components created
- [ ] Responsive design with Tailwind CSS
- [ ] Error handling and validation implemented
- [ ] Railway deployment configured
- [ ] README documentation complete
- [ ] Test credentials working
- [ ] Database migrations tested
- [ ] Production build tested
