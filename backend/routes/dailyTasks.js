const express = require("express");
const DailyTask = require("../models/DailyTask");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// Get daily tasks for a specific date
router.get("/date/:date", verifyToken, async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const startOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    const endOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + 1,
    );

    const tasks = await DailyTask.find({
      user: req.userId,
      date: { $gte: startOfDay, $lt: endOfDay },
    }).sort({ time: 1 });

    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get daily tasks for a date range
router.get("/range", verifyToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = { user: req.userId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const tasks = await DailyTask.find(query).sort({ date: -1, time: 1 });

    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Create daily task
router.post("/", verifyToken, async (req, res) => {
  try {
    const { date, day, title, description, time, priority } = req.body;

    if (!date || !title) {
      return res.status(400).json({ message: "Date and title required" });
    }

    const dailyTask = new DailyTask({
      user: req.userId,
      date: new Date(date),
      day:
        day || new Date(date).toLocaleDateString("en-US", { weekday: "long" }),
      title,
      description,
      time,
      priority: priority || "medium",
    });

    await dailyTask.save();
    res.status(201).json(dailyTask);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update daily task
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const task = await DailyTask.findById(req.params.id);
    if (!task || task.user.toString() !== req.userId) {
      return res.status(404).json({ message: "Daily task not found" });
    }

    const { title, description, completed, time, priority, day } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (time !== undefined) task.time = time;
    if (priority !== undefined) task.priority = priority;
    if (day !== undefined) task.day = day;

    // If marking as completed
    if (completed !== undefined && completed === true && !task.completed) {
      task.completed = true;
      task.completedAt = new Date();
    } else if (completed === false) {
      task.completed = false;
      task.completedAt = null;
    }

    await task.save();
    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Delete daily task
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const task = await DailyTask.findById(req.params.id);
    if (!task || task.user.toString() !== req.userId) {
      return res.status(404).json({ message: "Daily task not found" });
    }

    await DailyTask.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Daily task deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get daily tasks stats
router.get("/stats/summary", verifyToken, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks = await DailyTask.find({
      user: req.userId,
      date: { $gte: today, $lt: tomorrow },
    });

    const completed = tasks.filter((t) => t.completed).length;

    res.status(200).json({
      total: tasks.length,
      completed,
      pending: tasks.length - completed,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
