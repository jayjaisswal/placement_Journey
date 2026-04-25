const express = require("express");
const Lecture = require("../models/Lecture");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

const router = express.Router();

// Get all lectures
router.get("/", async (req, res) => {
  try {
    const parentOnly = req.query.parentOnly === "true"; // Get only parent folders/lectures
    let query = parentOnly
      ? { $or: [{ isFolder: true }, { parentFolder: null }] }
      : {};
    const lectures = await Lecture.find(query).populate(
      "createdBy",
      "name email",
    );
    res.status(200).json(lectures);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get individual lecture by ID (requires auth)
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("comments");

    if (!lecture) return res.status(404).json({ message: "Lecture not found" });

    // Increment view count
    lecture.views = (lecture.views || 0) + 1;
    await lecture.save();

    res.status(200).json(lecture);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get related lectures (folder structure) - returns sub-lectures and siblings
router.get("/:id/related", verifyToken, async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) return res.status(404).json({ message: "Lecture not found" });

    // Get sub-lectures (children of this folder)
    const subLectures = await Lecture.find({
      parentFolder: req.params.id,
    }).populate("createdBy", "name email");

    // Get sibling lectures (if this lecture has a parent)
    let siblings = [];
    if (lecture.parentFolder) {
      siblings = await Lecture.find({
        parentFolder: lecture.parentFolder,
        _id: { $ne: req.params.id }, // Exclude current lecture
      }).populate("createdBy", "name email");
    }

    res.status(200).json({
      current: lecture,
      subLectures: subLectures,
      siblings: siblings,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get lectures saved by user
router.get("/saved", verifyToken, async (req, res) => {
  try {
    const lectures = await Lecture.find({ savedBy: req.user._id });
    res.status(200).json(lectures);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Save lecture
router.post("/:id/save", verifyToken, async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) return res.status(404).json({ message: "Lecture not found" });

    if (!lecture.savedBy.includes(req.user._id)) {
      lecture.savedBy.push(req.user._id);
      await lecture.save();
    }
    res.status(200).json(lecture);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Unsave lecture
router.post("/:id/unsave", verifyToken, async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) return res.status(404).json({ message: "Lecture not found" });

    lecture.savedBy = lecture.savedBy.filter(
      (id) => id.toString() !== req.user._id.toString(),
    );
    await lecture.save();
    res.status(200).json(lecture);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Create lecture or folder (admin only)
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  const {
    title,
    instructor,
    url,
    videoUrl,
    duration,
    category,
    thumbnail,
    description,
    isFolder,
    parentFolder,
    resources,
  } = req.body;

  try {
    // Use videoUrl if provided, otherwise use url
    const finalVideoUrl = videoUrl || url;

    const lecture = new Lecture({
      title,
      instructor,
      videoUrl: finalVideoUrl,
      duration,
      category,
      thumbnail,
      description,
      isFolder: isFolder || false,
      parentFolder: parentFolder || null,
      resources: resources || [],
      createdBy: req.user._id,
    });

    await lecture.save();
    await lecture.populate("createdBy", "name email");
    res.status(201).json(lecture);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update lecture (admin only)
router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) return res.status(404).json({ message: "Lecture not found" });

    // Only admin or creator can update
    if (
      lecture.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this lecture" });
    }

    // Update allowed fields
    if (req.body.title) lecture.title = req.body.title;
    if (req.body.instructor) lecture.instructor = req.body.instructor;
    if (req.body.videoUrl) lecture.videoUrl = req.body.videoUrl;
    if (req.body.url) lecture.videoUrl = req.body.url; // Support both url and videoUrl
    if (req.body.duration) lecture.duration = req.body.duration;
    if (req.body.category) lecture.category = req.body.category;
    if (req.body.thumbnail) lecture.thumbnail = req.body.thumbnail;
    if (req.body.description) lecture.description = req.body.description;
    if (req.body.resources) lecture.resources = req.body.resources;
    if (typeof req.body.isFolder !== "undefined")
      lecture.isFolder = req.body.isFolder;
    if (req.body.parentFolder !== undefined)
      lecture.parentFolder = req.body.parentFolder;

    await lecture.save();
    await lecture.populate("createdBy", "name email");
    res.status(200).json(lecture);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Delete lecture (admin only)
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) return res.status(404).json({ message: "Lecture not found" });

    // Only admin or creator can delete
    if (
      lecture.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this lecture" });
    }

    // Delete all sub-lectures if this is a folder
    if (lecture.isFolder) {
      await Lecture.deleteMany({ parentFolder: req.params.id });
    }

    await Lecture.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Lecture deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
