const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, 
  },
  rating: {
    type: Number,
    required: true,
    min: 1, 
    max: 5  
  },
  review: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
