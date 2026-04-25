const express = require("express");
const Comment = require("../models/Comment");
const Lecture = require("../models/Lecture");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// Get all comments for a lecture (with pagination)
router.get("/lecture/:lectureId", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({
      lecture: req.params.lectureId,
      parentComment: null, // Only top-level comments
    })
      .populate("user", "name email")
      .populate("replies")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments({
      lecture: req.params.lectureId,
      parentComment: null,
    });

    res.status(200).json({
      comments,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get all reviews for a lecture
router.get("/lecture/:lectureId/reviews", async (req, res) => {
  try {
    const reviews = await Comment.find({
      lecture: req.params.lectureId,
      type: "review",
      rating: { $exists: true },
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    const ratings = reviews.map((r) => r.rating);
    const averageRating =
      ratings.length > 0
        ? (ratings.reduce((a, b) => a + b) / ratings.length).toFixed(1)
        : 0;

    res.status(200).json({
      reviews,
      averageRating,
      totalRatings: reviews.length,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Create comment or review
router.post("/", verifyToken, async (req, res) => {
  try {
    const { lecture, content, rating, type = "comment" } = req.body;

    if (!lecture || !content) {
      return res.status(400).json({ message: "Lecture and content required" });
    }

    const comment = new Comment({
      lecture,
      user: req.userId,
      userName: req.user.name || req.user.email,
      userAvatar: req.user.avatar,
      content,
      rating: type === "review" ? rating : undefined,
      type,
    });

    await comment.save();
    await comment.populate("user", "name email");

    // Update lecture's average rating if it's a review
    if (type === "review" && rating) {
      const reviews = await Comment.find({
        lecture,
        type: "review",
        rating: { $exists: true },
      });
      const totalRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
      const avgRating = (totalRating / reviews.length).toFixed(1);

      await Lecture.findByIdAndUpdate(lecture, {
        averageRating: avgRating,
        totalRatings: reviews.length,
      });
    }

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Add reply to comment
router.post("/:commentId/reply", verifyToken, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Reply content required" });
    }

    const parentComment = await Comment.findById(req.params.commentId);
    if (!parentComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Create new reply comment
    const reply = new Comment({
      lecture: parentComment.lecture,
      user: req.userId,
      userName: req.user.name || req.user.email,
      userAvatar: req.user.avatar,
      content,
      parentComment: req.params.commentId,
      type: "comment",
    });

    await reply.save();

    // Add to parent's replies array
    parentComment.replies.push(reply._id);
    await parentComment.save();

    res.status(201).json(reply);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Like/unlike comment
router.post("/:commentId/like", verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const hasLiked = comment.likes.includes(req.userId);

    if (hasLiked) {
      comment.likes = comment.likes.filter(
        (id) => id.toString() !== req.userId,
      );
    } else {
      comment.likes.push(req.userId);
    }

    await comment.save();
    res.status(200).json(comment);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Delete comment
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment || comment.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized to delete" });
    }

    await Comment.findByIdAndDelete(req.params.id);

    // Remove from parent's replies if it's a reply
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: req.params.id },
      });
    }

    res.status(200).json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
