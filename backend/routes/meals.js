const express = require('express');
const router = express.Router();
const { Meal, FoodCorner } = require('../models');
const { authenticate, authorize } = require('./middleware');

// GET meals (optionally filtered by foodCornerId)
router.get('/', async (req, res) => {
  try {
    const { foodCornerId } = req.query;
    const filter = foodCornerId ? { foodCornerId } : {};
    const meals = await Meal.find(filter).populate('foodCornerId', 'name location');
    res.json(meals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET detailed single meal
router.get('/:id', async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id).populate('foodCornerId', 'name location vendorId');
    if (!meal) return res.status(404).json({ error: 'Meal not found' });
    res.json(meal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new meal
router.post('/', authenticate, authorize(['Vendor']), async (req, res) => {
  try {
    const { foodCornerId, name, price, description, image } = req.body;
    if (!foodCornerId || !name || !price || !description) {
      return res.status(400).json({ error: 'foodCornerId, name, price, and description are required' });
    }

    // Verify vendor owns this food corner
    const corner = await FoodCorner.findOne({ _id: foodCornerId, vendorId: req.user.id });
    if (!corner) {
      return res.status(403).json({ error: 'Unauthorized to add meals to this food corner' });
    }

    const meal = new Meal({
      foodCornerId,
      name,
      price,
      description,
      image: image || '',
      averageRating: 0
    });

    await meal.save();
    res.status(201).json(meal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update meal
router.put('/:id', authenticate, authorize(['Vendor']), async (req, res) => {
  try {
    const { name, price, description, image } = req.body;
    const meal = await Meal.findById(req.params.id).populate('foodCornerId');
    if (!meal) {
      return res.status(404).json({ error: 'Meal not found' });
    }

    // Verify ownership
    if (meal.foodCornerId.vendorId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to modify this meal' });
    }

    if (name) meal.name = name;
    if (price) meal.price = price;
    if (description) meal.description = description;
    if (image !== undefined) meal.image = image;

    await meal.save();
    res.json(meal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE meal
router.delete('/:id', authenticate, authorize(['Vendor']), async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id).populate('foodCornerId');
    if (!meal) {
      return res.status(404).json({ error: 'Meal not found' });
    }

    if (meal.foodCornerId.vendorId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this meal' });
    }

    await Meal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Meal deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
