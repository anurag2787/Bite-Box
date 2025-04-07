const express = require('express');
const router = express.Router();
const Rating = require('../models/ratings'); 

router.post('/rating', async (req, res) => {
  const { email, rating, review } = req.body;

  if (!email || !rating || !review) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const result = await Rating.findOneAndUpdate(
      { email }, 
      { email, rating, review }, 
      { new: true, upsert: true, runValidators: true } 
    );
    res.status(201).json({ message: 'Rating and review saved successfully.', data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while saving the rating and review.' });
  }
});

// Route to get all reviews
router.get('/reviews', async (req, res) => {
    try {
      const reviews = await Rating.find().sort({ createdAt: -1 }); // Sort by most recent
      res.status(200).json({ data: reviews });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching reviews.' });
    }
  });

module.exports = router;
