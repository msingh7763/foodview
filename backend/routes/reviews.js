const express = require('express');
const router = express.Router();
const { Review, Meal } = require('../models');
const { authenticate, authorize } = require('./middleware');
const { analyzeSentiment } = require('../sentiment');

// Recalculates average rating of a meal
async function updateMealAverageRating(mealId) {
  const reviews = await Review.find({ mealId });
  if (reviews.length === 0) {
    await Meal.findByIdAndUpdate(mealId, { averageRating: 0 });
    return;
  }
  const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
  const avg = Math.round((sum / reviews.length) * 10) / 10;
  await Meal.findByIdAndUpdate(mealId, { averageRating: avg });
}

// POST review
router.post('/', authenticate, authorize(['Customer']), async (req, res) => {
  try {
    const { mealId, rating, reviewText } = req.body;
    if (!mealId || !rating || !reviewText) {
      return res.status(400).json({ error: 'mealId, rating, and reviewText are required' });
    }

    const sentiment = analyzeSentiment(reviewText);

    const review = new Review({
      mealId,
      userId: req.user.id,
      rating,
      reviewText,
      sentiment
    });

    await review.save();
    await updateMealAverageRating(mealId);

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET reviews for a meal
router.get('/', async (req, res) => {
  try {
    const { mealId, sortBy } = req.query;
    const filter = mealId ? { mealId } : {};
    
    let query = Review.find(filter).populate('userId', 'name email');
    
    if (sortBy === 'highest') {
      query = query.sort({ rating: -1, createdAt: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const reviews = await query;
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET user specific reviews
router.get('/my-reviews', authenticate, async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user.id }).populate('mealId', 'name price image');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update review
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { rating, reviewText } = req.body;
    const review = await Review.findOne({ _id: req.params.id, userId: req.user.id });
    if (!review) {
      return res.status(404).json({ error: 'Review not found or unauthorized' });
    }

    if (rating) review.rating = rating;
    if (reviewText) {
      review.reviewText = reviewText;
      review.sentiment = analyzeSentiment(reviewText);
    }

    await review.save();
    await updateMealAverageRating(review.mealId);

    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE review
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, userId: req.user.id });
    if (!review) {
      return res.status(404).json({ error: 'Review not found or unauthorized' });
    }

    const mealId = review.mealId;
    await Review.findByIdAndDelete(req.params.id);
    await updateMealAverageRating(mealId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
