# Account Management System

A full stack application with account management features built with Angular and Node.js.

## Features

- User authentication (login/register)
- Admin dashboard for account management
- User management (CRUD operations)
- Role-based access control
- Secure API with JWT authentication

## Technology Stack

### Frontend
- Angular 19
- Angular Router
- Reactive Forms
- Bootstrap 5 (for styling)

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- JWT authentication

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
```
git clone <repository-url>
```

2. Install dependencies for both frontend and backend
```
npm install
cd backend && npm install
```

3. Configure environment variables
   - Rename `.env.example` to `.env` in the backend folder
   - Update MongoDB URI and JWT secret

4. Start MongoDB server (if using local MongoDB)

5. Start the backend server
```
cd backend
node server.js
```

6. In a new terminal, start the Angular development server
```
ng serve
```

7. Open your browser and navigate to `http://localhost:4200`

## Default Credentials

- Admin: 
  - Email: admin@example.com
  - Password: admin123

- User:
  - Email: user@example.com
  - Password: user123

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `GET /api/auth/logout` - Logout

### User Management
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID (admin only)
- `POST /api/users` - Create new user (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

## License

This project is licensed under the MIT License.
