const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: {
    type: [String],
    required: true,
    validate: [(arr) => arr.length === 4, 'Options must have exactly 4 items'],
  },
  correctIndex: { type: Number, required: true, min: 0, max: 3 },
  category: { type: String, default: 'General', trim: true },
  company: {
    type: String,
    enum: ['TCS', 'Wipro', 'Infosys', 'Cognizant', 'General'],
    default: 'General',
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Quiz', quizSchema);
