const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Customer', 'Vendor'], required: true }
});

const FoodCornerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, default: '' },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const MealSchema = new mongoose.Schema({
  foodCornerId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodCorner', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  image: { type: String, default: '' },
  averageRating: { type: Number, default: 0 }
});

const ReviewSchema = new mongoose.Schema({
  mealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meal', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  reviewText: { type: String, required: true },
  sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const FoodCorner = mongoose.model('FoodCorner', FoodCornerSchema);
const Meal = mongoose.model('Meal', MealSchema);
const Review = mongoose.model('Review', ReviewSchema);

module.exports = { User, FoodCorner, Meal, Review };
