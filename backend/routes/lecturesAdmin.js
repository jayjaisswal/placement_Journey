const express = require("express");
const Lecture = require("../models/Lecture");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

const router = express.Router();

// Get all lectures (public) - with nested structure support
router.get("/", async (req, res) => {
  try {
    const { category, isFolder, parentFolder } = req.query;
    let query = {};

    if (category) query.category = category;
    if (isFolder !== undefined) query.isFolder = isFolder === "true";
    if (parentFolder) query.parentFolder = parentFolder;
    else if (!category && !isFolder) query.isFolder = false; // Show non-folder items by default

    const lectures = await Lecture.find(query)
      .populate("createdBy", "name email")
      .populate("parentFolder", "title")
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json(lectures);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get folder structure (nested directories)
router.get("/folders/tree", async (req, res) => {
  try {
    const folders = await Lecture.find({ isFolder: true })
      .populate("parentFolder", "title")
      .sort({ order: 1 });

    res.status(200).json(folders);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get lectures by category (with nested structure)
router.get("/category/:category", async (req, res) => {
  try {
    const lectures = await Lecture.find({
      category: req.params.category,
      isFolder: false,
    })
      .populate("createdBy", "name email")
      .populate("parentFolder", "title");

    res.status(200).json(lectures);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get lecture by ID (increment views and get comments/ratings)
router.get("/:id", async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("savedBy", "name email")
      .populate("parentFolder", "title")
      .populate("comments");

    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    // Increment views (only if token is provided for authenticated user)
    const token = req.header("Authorization");
    if (token) {
      lecture.views = (lecture.views || 0) + 1;
      await lecture.save();
    }

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
    const subLectures = await Lecture.find({ parentFolder: req.params.id })
      .populate("createdBy", "name email")
      .sort({ order: 1 });

    // Get sibling lectures (if this lecture has a parent)
    let siblings = [];
    if (lecture.parentFolder) {
      siblings = await Lecture.find({
        parentFolder: lecture.parentFolder,
        _id: { $ne: req.params.id }, // Exclude current lecture
      })
        .populate("createdBy", "name email")
        .sort({ order: 1 });
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

// Create lecture or folder (admin only)
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      instructor,
      category,
      isFolder,
      parentFolder,
      subfolder,
      order,
      videoUrl,
      videoType,
      duration,
      thumbnail,
      lectureNotes,
      resources,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title required" });
    }

    const lecture = new Lecture({
      title,
      description,
      instructor,
      category,
      isFolder: isFolder || false,
      parentFolder: parentFolder || null,
      subfolder: subfolder,
      order: order || 0,
      videoUrl,
      videoType: videoType || "youtube",
      duration,
      thumbnail,
      lectureNotes,
      resources,
      createdBy: req.userId,
    });

    await lecture.save();
    await lecture.populate("parentFolder", "title");

    res.status(201).json(lecture);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update lecture (admin only)
router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    const {
      title,
      description,
      instructor,
      category,
      isFolder,
      parentFolder,
      subfolder,
      order,
      videoUrl,
      videoType,
      duration,
      thumbnail,
      lectureNotes,
      lectureNotesFile,
      resources,
    } = req.body;

    if (title !== undefined) lecture.title = title;
    if (description !== undefined) lecture.description = description;
    if (instructor !== undefined) lecture.instructor = instructor;
    if (category !== undefined) lecture.category = category;
    if (isFolder !== undefined) lecture.isFolder = isFolder;
    if (parentFolder !== undefined) lecture.parentFolder = parentFolder;
    if (subfolder !== undefined) lecture.subfolder = subfolder;
    if (order !== undefined) lecture.order = order;
    if (videoUrl !== undefined) lecture.videoUrl = videoUrl;
    if (videoType !== undefined) lecture.videoType = videoType;
    if (duration !== undefined) lecture.duration = duration;
    if (thumbnail !== undefined) lecture.thumbnail = thumbnail;
    if (lectureNotes !== undefined) lecture.lectureNotes = lectureNotes;
    if (lectureNotesFile !== undefined)
      lecture.lectureNotesFile = lectureNotesFile;
    if (resources !== undefined) lecture.resources = resources;

    await lecture.save();
    res.status(200).json(lecture);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Delete lecture (admin only)
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    await Lecture.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Lecture deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Save lecture (user)
router.post("/:id/save", verifyToken, async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    if (!lecture.savedBy.includes(req.userId)) {
      lecture.savedBy.push(req.userId);
      await lecture.save();
    }

    res.status(200).json(lecture);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Unsave lecture (user)
router.post("/:id/unsave", verifyToken, async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    lecture.savedBy = lecture.savedBy.filter(
      (id) => id.toString() !== req.userId,
    );
    await lecture.save();

    res.status(200).json(lecture);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get user's saved lectures
router.get("/user/saved", verifyToken, async (req, res) => {
  try {
    const lectures = await Lecture.find({ savedBy: req.userId }).populate(
      "createdBy",
      "name email",
    );

    res.status(200).json(lectures);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
