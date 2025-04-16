# Recipe Sharing Platform

A full-stack web application for sharing and discovering recipes. Built with Flask, MongoDB, React, and TypeScript.

## Features

- User authentication (login/register)
- Create, read, update, and delete recipes
- Search recipes by title, ingredients, or description
- Filter recipes by cuisine type
- Responsive design for all devices

## Tech Stack

### Backend
- Flask (Python)
- MongoDB Atlas
- JWT Authentication
- Flask-CORS

### Frontend
- React
- TypeScript
- Chakra UI
- React Query
- Axios

## Setup

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables in `.env`:
   ```
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

5. Run the server:
   ```bash
   python app.py
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user

### Recipes
- GET `/api/recipes/search` - Search recipes
- POST `/api/recipes` - Create new recipe
- GET `/api/recipes/:id` - Get recipe by ID
- PUT `/api/recipes/:id` - Update recipe
- DELETE `/api/recipes/:id` - Delete recipe
