const express = require('express');
const router = express.Router();
const { FoodCorner } = require('../models');
const { authenticate, authorize } = require('./middleware');

// GET all food corners
router.get('/', async (req, res) => {
  try {
    const foodCorners = await FoodCorner.find();
    res.json(foodCorners);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET user specific food corners (for vendor)
router.get('/my-corners', authenticate, authorize(['Vendor']), async (req, res) => {
  try {
    const corners = await FoodCorner.find({ vendorId: req.user.id });
    res.json(corners);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new food corner
router.post('/', authenticate, authorize(['Vendor']), async (req, res) => {
  try {
    const { name, location, description, image } = req.body;
    if (!name || !location || !description) {
      return res.status(400).json({ error: 'Name, location, and description are required' });
    }

    const foodCorner = new FoodCorner({
      name,
      location,
      description,
      image: image || '',
      vendorId: req.user.id
    });

    await foodCorner.save();
    res.status(201).json(foodCorner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update food corner
router.put('/:id', authenticate, authorize(['Vendor']), async (req, res) => {
  try {
    const { name, location, description, image } = req.body;
    const foodCorner = await FoodCorner.findOne({ _id: req.params.id, vendorId: req.user.id });
    if (!foodCorner) {
      return res.status(404).json({ error: 'Food corner not found or unauthorized' });
    }

    if (name) foodCorner.name = name;
    if (location) foodCorner.location = location;
    if (description) foodCorner.description = description;
    if (image !== undefined) foodCorner.image = image;

    await foodCorner.save();
    res.json(foodCorner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE food corner
router.delete('/:id', authenticate, authorize(['Vendor']), async (req, res) => {
  try {
    const result = await FoodCorner.findOneAndDelete({ _id: req.params.id, vendorId: req.user.id });
    if (!result) {
      return res.status(404).json({ error: 'Food corner not found or unauthorized' });
    }
    res.json({ message: 'Food corner deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
