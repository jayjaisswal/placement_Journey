const express = require("express");
const TaskHistory = require("../models/TaskHistory");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// Get all task history for user
router.get("/", verifyToken, async (req, res) => {
  try {
    const { status, category, sortBy = "completedAt" } = req.query;

    let query = { user: req.userId };

    if (status) query.status = status;
    if (category) query.category = category;

    const history = await TaskHistory.find(query).sort({ [sortBy]: -1 });

    res.status(200).json(history);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get task history by date range
router.get("/range", verifyToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = { user: req.userId };

    if (startDate || endDate) {
      query.completedAt = {};
      if (startDate) query.completedAt.$gte = new Date(startDate);
      if (endDate) query.completedAt.$lte = new Date(endDate);
    }

    const history = await TaskHistory.find(query).sort({ completedAt: -1 });

    res.status(200).json(history);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get statistics from history (for graphs/progress)
router.get("/stats/summary", verifyToken, async (req, res) => {
  try {
    const completed = await TaskHistory.countDocuments({
      user: req.userId,
      status: "completed",
    });
    const removed = await TaskHistory.countDocuments({
      user: req.userId,
      status: "removed",
    });

    // Group by category
    const byCategory = await TaskHistory.aggregate([
      { $match: { user: require("mongoose").Types.ObjectId(req.userId) } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    // Group by month
    const byMonth = await TaskHistory.aggregate([
      { $match: { user: require("mongoose").Types.ObjectId(req.userId) } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$completedAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 12 },
    ]);

    res.status(200).json({
      totalCompleted: completed,
      totalRemoved: removed,
      byCategory,
      byMonth,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get history by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const history = await TaskHistory.findById(req.params.id);
    if (!history || history.user.toString() !== req.userId) {
      return res.status(404).json({ message: "History not found" });
    }
    res.status(200).json(history);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
