const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const Article = require('../models/Article');
const isAdmin = require('../middleware/isAdmin');

const ALLOWED_CATEGORIES = ['OS', 'DBMS', 'CN', 'DSA', 'OOP', 'System Design', 'Aptitude', 'Other'];

// GET /api/articles — list all (sorted newest first)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category && ALLOWED_CATEGORIES.includes(String(req.query.category))) {
      filter.category = String(req.query.category);
    }
    const articles = await Article.find(filter)
      .select('-body')
      .sort({ createdAt: -1 })
      .lean();
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/articles/:id — single article
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).lean();
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.json(article);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/articles — create (admin only)
router.post(
  '/',
  isAdmin,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('category').isIn(ALLOWED_CATEGORIES).withMessage('Invalid category'),
    body('body').trim().notEmpty().withMessage('Body content is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { title, category, subCategory, body, lectureLink, pdfLink, tags } = req.body;
      const article = new Article({ title, category, subCategory, body, lectureLink, pdfLink, tags });
      await article.save();
      res.status(201).json(article);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// PUT /api/articles/:id — update (admin only)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const allowed = ['title', 'category', 'subCategory', 'body', 'lectureLink', 'pdfLink', 'tags'];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });
    updates.updatedAt = new Date();

    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.json(article);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/articles/:id — delete (admin only)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.json({ message: 'Article deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
