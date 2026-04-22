const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const isAdmin = require('../middleware/isAdmin');

const SEED_QUESTIONS = [
  {
    question: 'What is the time complexity of binary search?',
    options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
    correctIndex: 1,
    category: 'DSA',
    company: 'TCS',
    difficulty: 'Easy',
  },
  {
    question: 'Which data structure uses LIFO (Last In, First Out)?',
    options: ['Queue', 'Stack', 'Linked List', 'Tree'],
    correctIndex: 1,
    category: 'DSA',
    company: 'TCS',
    difficulty: 'Easy',
  },
  {
    question: 'What does SQL stand for?',
    options: [
      'Structured Query Language',
      'Simple Query Language',
      'Sequential Query Logic',
      'Standard Question Language',
    ],
    correctIndex: 0,
    category: 'DBMS',
    company: 'Wipro',
    difficulty: 'Easy',
  },
  {
    question: 'Which of the following is NOT a process state?',
    options: ['Running', 'Waiting', 'Compiled', 'Ready'],
    correctIndex: 2,
    category: 'OS',
    company: 'TCS',
    difficulty: 'Medium',
  },
  {
    question: 'What is the primary key in a relational database?',
    options: [
      'A key that can have duplicate values',
      'A key that uniquely identifies each record',
      'A foreign key reference',
      'An index key',
    ],
    correctIndex: 1,
    category: 'DBMS',
    company: 'Wipro',
    difficulty: 'Easy',
  },
];

// GET /api/quiz — list questions with optional filters
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = String(req.query.category);
    if (req.query.company) filter.company = String(req.query.company);

    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const questions = await Quiz.find(filter).limit(limit).lean();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/quiz/:id — single question
router.get('/:id', async (req, res) => {
  try {
    const question = await Quiz.findById(req.params.id).lean();
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/quiz — create question (admin only)
router.post('/', isAdmin, async (req, res) => {
  try {
    const { question, options, correctIndex, category, company, difficulty } = req.body;
    if (!question || !options || correctIndex === undefined) {
      return res.status(400).json({ message: 'question, options, and correctIndex are required' });
    }
    const q = new Quiz({ question, options, correctIndex, category, company, difficulty });
    await q.save();
    res.status(201).json(q);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/quiz/seed — seed sample questions (admin only)
router.post('/seed', isAdmin, async (req, res) => {
  try {
    const result = await Quiz.insertMany(SEED_QUESTIONS, { ordered: false });
    res.status(201).json({ message: `Seeded ${result.length} questions successfully` });
  } catch (err) {
    // BulkWriteError with partial success (e.g. some already exist)
    if (err.name === 'MongoBulkWriteError' && err.result) {
      const inserted = err.result.nInserted || 0;
      return res.status(201).json({ message: `Seeded ${inserted} new question(s); some may have already existed.` });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
