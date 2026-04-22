const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: ['OS', 'DBMS', 'CN', 'DSA', 'OOP', 'System Design', 'Aptitude', 'Other'],
  },
  subCategory: { type: String, trim: true, default: '' },
  body: { type: String, required: true },
  lectureLink: { type: String, default: '' },
  pdfLink: { type: String, default: '' },
  tags: [{ type: String, trim: true }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

articleSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Article', articleSchema);
