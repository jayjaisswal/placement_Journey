# 🚀 Quick Start Guide

## Installation & Running

### Step 1: Start MongoDB

```bash
# If using Docker (recommended)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or if installed locally on macOS
brew services start mongodb-community

# Or on Linux
sudo systemctl start mongodb
```

### Step 2: Start Backend

```bash
cd backend
npm install    # First time only
npm run dev    # Uses nodemon for auto-reload
```

You should see:

```
✓ MongoDB connected
✓ Server running on port 5000
```

### Step 3: Start Frontend (in new terminal)

```bash
cd frontend
npm install    # First time only
npm run dev
```

You should see:

```
✓ Vite dev server running at http://localhost:5173
```

### Step 4: Open in Browser

Navigate to http://localhost:5173

---

## 📋 Testing the Features

### 1. Authentication

- Click **Login** button in navbar
- Create new account or use existing credentials
- Observe dynamic navbar changes (Logout button appears)

### 2. Tasks & History

- Go to **Tasks** page
- Create a new task with title, due date, and priority
- Mark task as complete → moves to history automatically
- View task history to see completed/removed tasks

### 3. Daily Tasks & Calendar

- Go to **Daily Notes** page
- Click on calendar to select a date
- Add time-based tasks for that specific date
- Toggle completion, add multiple tasks

### 4. Lectures (if admin)

- Only admins see "Manage Lectures" link
- Create lecture folders first (isFolder: true)
- Create lectures inside folders (parentFolder: folderId)
- Videos embed as YouTube iframes (not redirects!)

### 5. Comments & Reviews

- Open any lecture
- Leave comments or post reviews with rating
- Like, reply to, and delete comments
- See average rating update in real-time

---

## 🔧 Configuration

### Backend .env

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/placement_journey
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

### Frontend .env

```env
VITE_API_URL=http://localhost:5000/api
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 📊 API Quick Reference

### Common Headers (for authenticated endpoints)

```
Authorization: Bearer <jwt_token_from_login>
Content-Type: application/json
```

### Useful Curl Commands

**Login:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

**Create Task:**

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Learn MongoDB",
    "priority":"high",
    "category":"Backend"
  }'
```

**Get Task History:**

```bash
curl -X GET http://localhost:5000/api/task-history \
  -H "Authorization: Bearer TOKEN"
```

**Create Lecture (Admin):**

```bash
curl -X POST http://localhost:5000/api/lectures \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"DSA - Arrays",
    "videoUrl":"dQw4w9WgXcQ",
    "videoType":"youtube",
    "description":"Learn arrays in depth"
  }'
```

---

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"

```bash
# Check if MongoDB is running
mongosh
# If connection fails, start MongoDB:
docker run -d -p 27017:27017 mongo:latest
```

### "JWT token is not valid"

- Clear browser localStorage: Open F12 → Application → Clear Storage
- Log in again
- Ensure JWT_SECRET in backend .env hasn't changed

### "API not responding"

- Check backend console for errors
- Verify CORS is enabled (it is by default)
- Ensure frontend .env has correct API URL

### "Videos not playing"

- Use YouTube video ID only (not full URL)
- Example: `videoUrl: "dQw4w9WgXcQ"` not `https://youtube.com/watch?v=dQw4w9WgXcQ`

### "Comments not showing"

- Ensure you're logged in
- Hard refresh page (Ctrl+Shift+R or Cmd+Shift+R)
- Check browser console for errors (F12)

---

## 💡 Key Features Checklist

- ✅ Beautiful Modern UI (Glassmorphism + Tailwind)
- ✅ JWT Authentication with secure passwords
- ✅ Task Management with automatic history tracking
- ✅ Daily tasks with date-specific scheduling
- ✅ Nested lecture organization
- ✅ YouTube embedded videos (no redirects!)
- ✅ Comments & review system with ratings
- ✅ Dark/Light mode toggle
- ✅ Admin role management
- ✅ Data persistence in MongoDB
- ✅ Responsive design

---

## 📚 File Structure

```
placement_Journey/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth middleware
│   ├── index.js        # Main server file
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/      # Page components
│   │   ├── context/    # Auth context
│   │   ├── App.tsx     # Main app
│   │   └── main.tsx    # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   └── .env
│
└── IMPLEMENTATION_GUIDE.md  # Full API docs
```

---

## 🎯 Next Steps After Setup

1. **Create an admin account**: Manually set `role: "admin"` in MongoDB for a user
2. **Add sample lectures**: Use the API or admin panel to create lecture folders
3. **Invite users**: Share the app URL with others to test
4. **Customize**: Update colors, add your own logo, modify tasks/lecture categories

---

## 📞 Need Help?

1. Check browser console (F12) for errors
2. Check backend terminal for server errors
3. Verify MongoDB is running (`mongosh`)
4. Re-read IMPLEMENTATION_GUIDE.md for detailed API info
5. Check .env files are configured correctly

---

**Happy Learning! 🎓**
