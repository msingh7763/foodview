const express = require('express');
const router = express.Router();
const { FoodCorner, Meal, Review } = require('../models');
const { authenticate, authorize } = require('./middleware');
const { generateSummary } = require('../sentiment');

router.get('/', authenticate, authorize(['Vendor']), async (req, res) => {
  try {
    // Get all Food Corners belonging to this vendor
    const vendorCorners = await FoodCorner.find({ vendorId: req.user.id });
    const vendorCornerIds = vendorCorners.map(fc => fc._id);

    // Get all Meals for these Food Corners
    const meals = await Meal.find({ foodCornerId: { $in: vendorCornerIds } });
    const mealIds = meals.map(m => m._id);

    // Get all Reviews for these meals
    const reviews = await Review.find({ mealId: { $in: mealIds } });

    // Aggregate statistics
    const totalMeals = meals.length;
    const totalReviews = reviews.length;

    let averageRating = 0;
    if (totalReviews > 0) {
      const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
      averageRating = Math.round((sum / totalReviews) * 10) / 10;
    }

    // Sort meals to find most/least liked
    const sortedMeals = [...meals].sort((a, b) => b.averageRating - a.averageRating);
    const mostLikedMeal = sortedMeals.length > 0 ? sortedMeals[0] : null;
    
    // Filter meals with rating > 0 for least liked to be meaningful, or take last
    const leastLikedMeal = sortedMeals.length > 1 ? sortedMeals[sortedMeals.length - 1] : null;

    // AI summary generation
    const aiInsight = generateSummary(reviews);

    // Breakdown for review summary page
    const mealsPerformance = meals.map(m => ({
      name: m.name,
      averageRating: m.averageRating,
      image: m.image
    }));

    // Sentiment breakdown
    let positiveReviewsCount = 0;
    let neutralReviewsCount = 0;
    let negativeReviewsCount = 0;

    reviews.forEach(r => {
      if (r.sentiment === 'positive') positiveReviewsCount++;
      else if (r.sentiment === 'negative') negativeReviewsCount++;
      else neutralReviewsCount++;
    });

    res.json({
      totalMeals,
      totalReviews,
      averageRating,
      mostLikedMeal,
      leastLikedMeal,
      aiInsight,
      mealsPerformance,
      sentimentStats: {
        positive: positiveReviewsCount,
        neutral: neutralReviewsCount,
        negative: negativeReviewsCount
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
