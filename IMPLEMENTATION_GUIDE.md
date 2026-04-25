# Placement Journey - Complete MERN Implementation Guide

## 🎯 Project Overview

A full-stack MERN (MongoDB, Express, React, Node.js) application with:

- **JWT-based Authentication** with secure password hashing
- **Routine Discipline Tracker** with task history and daily notes
- **Nested Lecture Portal** with YouTube embedded videos
- **Admin Panel** for managing content
- **Comments & Review System** for lectures
- **Data Visualization** with progress tracking

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js v16+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. **Navigate to backend**

   ```bash
   cd backend
   npm install
   ```

2. **Configure .env**

   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/placement_journey
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   NODE_ENV=development
   ```

3. **Start MongoDB** (if running locally)

   ```bash
   # macOS
   brew services start mongodb-community

   # Ubuntu/Linux
   sudo systemctl start mongodb

   # Or use Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

4. **Start backend server**
   ```bash
   npm run dev  # with nodemon for hot reload
   # or
   npm start    # simple start
   ```

### Frontend Setup

1. **Navigate to frontend**

   ```bash
   cd frontend
   npm install
   ```

2. **Configure .env**

   ```env
   VITE_API_URL=http://localhost:5000/api
   REACT_APP_API_URL=http://localhost:5000/api
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Access the app**
   - Open http://localhost:5173 in your browser

---

## 📚 API Documentation

### Authentication Endpoints

#### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure_password"
}

Response:
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure_password"
}

Response:
{
  "token": "jwt_token_here",
  "user": { ... }
}
```

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer jwt_token_here

Response:
{
  "id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user"
}
```

### Task Management

#### Create Task

```http
POST /api/tasks
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "title": "Learn React Hooks",
  "description": "Study custom hooks and useEffect",
  "priority": "high",
  "dueDate": "2026-05-01",
  "category": "Frontend"
}

Response: { task object with timestamps }
```

#### Get All Tasks

```http
GET /api/tasks
Authorization: Bearer jwt_token_here

Response: [ { task }, { task }, ... ]
```

#### Update Task (Mark as Complete moves to history)

```http
PUT /api/tasks/:taskId
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "title": "Learn React Hooks",
  "completed": true  # This moves task to history
}

Response: { updated task }
```

#### Delete Task (Moves to history with status 'removed')

```http
DELETE /api/tasks/:taskId
Authorization: Bearer jwt_token_here

Response:
{
  "message": "Task deleted and moved to history",
  "history": { history object }
}
```

### Task History

#### Get All History

```http
GET /api/task-history
Authorization: Bearer jwt_token_here

Optional query params:
- status: "completed" or "removed"
- category: "Frontend", "Backend", etc.
- sortBy: field to sort by (default: "completedAt")

Response: [ { history_item }, ... ]
```

#### Get History by Date Range

```http
GET /api/task-history/range?startDate=2026-01-01&endDate=2026-12-31
Authorization: Bearer jwt_token_here

Response: [ { history_item }, ... ]
```

#### Get History Statistics

```http
GET /api/task-history/stats/summary
Authorization: Bearer jwt_token_here

Response:
{
  "totalCompleted": 25,
  "totalRemoved": 3,
  "byCategory": [ {"_id": "Frontend", "count": 10}, ... ],
  "byMonth": [ {"_id": "2026-04", "count": 15}, ... ]
}
```

### Daily Tasks

#### Create Daily Task

```http
POST /api/daily-tasks
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "date": "2026-04-25",
  "day": "Friday",
  "title": "Morning DSA Practice",
  "time": "09:00",
  "priority": "high"
}

Response: { daily_task }
```

#### Get Daily Tasks for Specific Date

```http
GET /api/daily-tasks/date/2026-04-25
Authorization: Bearer jwt_token_here

Response: [ { daily_task }, { daily_task }, ... ]
```

#### Get Daily Tasks Statistics (Today)

```http
GET /api/daily-tasks/stats/summary
Authorization: Bearer jwt_token_here

Response:
{
  "total": 5,
  "completed": 3,
  "pending": 2
}
```

### Lectures (with Nested Structure)

#### Get All Lectures

```http
GET /api/lectures
Optional query params:
- isFolder: "true" to get only folders
- parentFolder: id of parent folder
- category: filter by category

Response: [ { lecture }, ... ]
```

#### Get Lecture by ID

```http
GET /api/lectures/:lectureId

Response:
{
  "_id": "id",
  "title": "DSA - Arrays",
  "description": "...",
  "videoUrl": "youtube_video_id",
  "videoType": "youtube",
  "isFolder": false,
  "parentFolder": "parent_folder_id",
  "averageRating": 4.5,
  "totalRatings": 12,
  "comments": [ { comment }, ... ]
}
```

#### Get Folder Structure

```http
GET /api/lectures/folders/tree

Response: [ { folder_item }, ... ]
```

#### Create Lecture (Admin Only)

```http
POST /api/lectures
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "title": "DSA - Arrays",
  "description": "Comprehensive arrays tutorial",
  "videoUrl": "youtube_video_id or 'dQw4w9WgXcQ'",
  "videoType": "youtube",
  "duration": "45:30",
  "thumbnail": "image_url",
  "isFolder": false,
  "parentFolder": "parent_folder_id (optional)",
  "category": "DSA"
}

Response: { lecture }
```

#### Create Folder (Admin Only)

```http
POST /api/lectures
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "title": "Data Structures",
  "isFolder": true,
  "order": 1
}

Response: { folder }
```

#### Update Lecture (Admin Only)

```http
PUT /api/lectures/:lectureId
Authorization: Bearer jwt_token_here
Content-Type: application/json

{ ... fields to update ... }

Response: { updated_lecture }
```

#### Delete Lecture (Admin Only)

```http
DELETE /api/lectures/:lectureId
Authorization: Bearer jwt_token_here

Response: { "message": "Lecture deleted" }
```

#### Save/Unsave Lecture

```http
POST /api/lectures/:lectureId/save
POST /api/lectures/:lectureId/unsave
Authorization: Bearer jwt_token_here

Response: { lecture with updated savedBy array }
```

### Comments & Reviews

#### Get Comments for Lecture

```http
GET /api/comments/lecture/:lectureId
Optional: ?page=1&limit=10

Response:
{
  "comments": [ { comment }, ... ],
  "total": 50,
  "pages": 5,
  "currentPage": 1
}
```

#### Get Reviews for Lecture

```http
GET /api/comments/lecture/:lectureId/reviews

Response:
{
  "reviews": [ { review }, ... ],
  "averageRating": 4.5,
  "totalRatings": 12
}
```

#### Post Comment

```http
POST /api/comments
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "lecture": "lecture_id",
  "content": "Great explanation!",
  "type": "comment"
}

Response: { comment }
```

#### Post Review

```http
POST /api/comments
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "lecture": "lecture_id",
  "content": "Very detailed tutorial",
  "rating": 5,
  "type": "review"
}

Response: { review with updated lecture ratings }
```

#### Reply to Comment

```http
POST /api/comments/:commentId/reply
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "content": "Thanks for the feedback!"
}

Response: { reply_comment }
```

#### Like/Unlike Comment

```http
POST /api/comments/:commentId/like
Authorization: Bearer jwt_token_here

Response: { comment with updated likes array }
```

#### Delete Comment

```http
DELETE /api/comments/:commentId
Authorization: Bearer jwt_token_here

Response: { "message": "Comment deleted" }
```

---

## 🗄️ Database Schema

### User

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "user" | "admin",
  avatar: String,
  bio: String,
  taskHistoryCount: Number,
  totalTasksCompleted: Number,
  totalTasksRemoved: Number,
  theme: "light" | "dark",
  createdAt: Date,
  updatedAt: Date
}
```

### Task

```javascript
{
  user: ObjectId (ref: User),
  title: String,
  description: String,
  completed: Boolean,
  dueDate: Date,
  priority: "low" | "medium" | "high",
  category: String,
  createdAt: Date,
  updatedAt: Date
}
```

### TaskHistory

```javascript
{
  user: ObjectId (ref: User),
  title: String,
  description: String,
  priority: String,
  category: String,
  status: "completed" | "removed",
  originalTaskId: ObjectId (ref: Task),
  dueDate: Date,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### DailyTask

```javascript
{
  user: ObjectId (ref: User),
  date: Date,
  day: String (Monday, Tuesday, etc.),
  title: String,
  description: String,
  completed: Boolean,
  priority: String,
  time: String (HH:MM format),
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Lecture

```javascript
{
  title: String,
  description: String,
  instructor: String,
  category: String,
  parentFolder: ObjectId (ref: Lecture),
  isFolder: Boolean,
  subfolder: String,
  order: Number,
  videoUrl: String,
  videoType: "youtube" | "vimeo" | "file" | "html5",
  duration: String,
  thumbnail: String,
  lectureNotes: String,
  lectureNotesFile: String,
  resources: [{ title, url, type }],
  createdBy: ObjectId (ref: User),
  savedBy: [ObjectId (ref: User)],
  views: Number,
  comments: [ObjectId (ref: Comment)],
  averageRating: Number,
  totalRatings: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Comment

```javascript
{
  lecture: ObjectId (ref: Lecture),
  user: ObjectId (ref: User),
  userName: String,
  userAvatar: String,
  content: String,
  rating: Number (1-5),
  type: "comment" | "review",
  parentComment: ObjectId (ref: Comment),
  likes: [ObjectId (ref: User)],
  replies: [{ user, userName, content, createdAt }],
  isApproved: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### DailyNote

```javascript
{
  user: ObjectId (ref: User),
  date: Date,
  title: String,
  content: String,
  tags: [String],
  mood: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Authentication Flow

1. **User Registration**: Password is hashed with bcrypt (10 salt rounds)
2. **JWT Token**: Valid for 7 days, stored in localStorage
3. **Protected Routes**: All authenticated endpoints require JWT in Authorization header
4. **Token Format**: `Authorization: Bearer <token>`
5. **Admin Verification**: Some endpoints check `user.role === "admin"`

---

## 🎨 UI Components

### Calendar Component

- Interactive calendar selector
- Daily task management
- Task completion tracking
- Time-based scheduling

### YouTube Player Component

- Embedded video iframe (no redirects)
- Share and report options
- Video metadata display

### Comments Section

- Comment and review modes
- Star ratings for reviews
- Nested replies
- Like/unlike functionality
- User mentions

### Navbar

- Dynamic login/logout button
- Admin indicators
- Dark/light mode toggle
- Mobile responsive

---

## 🧪 Testing

### Test Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Create Task

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","priority":"high"}'
```

---

## 📝 Key Features Implemented

✅ JWT-based authentication with password hashing
✅ Task management with automatic history tracking
✅ Daily tasks with date-specific organization
✅ Nested lecture folder structure
✅ YouTube embedded video player (no redirects)
✅ Comments and review system with ratings
✅ Task history visualization
✅ Beautiful glassmorphism UI
✅ Dark/light mode support
✅ Admin role management
✅ MongoDB data persistence

---

## 🚨 Common Issues & Solutions

### MongoDB Connection Error

- Ensure MongoDB is running on port 27017
- Check `MONGO_URI` in `.env` file
- Try: `mongosh` to test connection

### JWT Token Invalid

- Clear localStorage and login again
- Ensure `JWT_SECRET` matches between requests
- Check token expiration (7 days)

### CORS Errors

- Backend CORS is enabled for localhost
- Check frontend API URL matches backend

### Video Not Playing

- Ensure YouTube video ID is correct format
- Try video ID only (without youtube.com/)
- Check browser allows embedded content

---

## 📖 Next Steps

1. Create admin page for lecture management
2. Add bulk upload for lectures
3. Implement email notifications
4. Add offline support with service workers
5. Optimize media loading
6. Add advanced search and filters
7. Implement user profiles and badges

---

## 📄 License

MIT License - Feel free to use and modify for your needs.

---

## 🤝 Support

For issues or questions, please check the error logs:

- Backend: Terminal where `npm start` is running
- Frontend: Browser console (F12)
- MongoDB: Check MongoDB logs

Happy coding! 🚀
