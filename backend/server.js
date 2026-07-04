require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const authRoutes = require('./routes/auth');
const foodCornerRoutes = require('./routes/foodcorners');
const mealRoutes = require('./routes/meals');
const reviewRoutes = require('./routes/reviews');
const analyticsRoutes = require('./routes/analytics');
const { User } = require('./models');

const app = express();

app.use(cors());
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));
// Routes
app.use('/api', authRoutes);
app.use('/api/foodcorners', foodCornerRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to Food Corner Review & Smart Rating API');
});

const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/foodcorner';
const DEMO_CUSTOMER = {
  name: 'Demo Customer',
  email: 'customer@foodcorner.com',
  password: 'Customer@123',
  role: 'Customer'
};
const DEMO_VENDOR = {
  name: 'Demo Vendor',
  email: 'vendor@foodcorner.com',
  password: 'Vendor@123',
  role: 'Vendor'
};

async function ensureDemoUser({ name, email, password, role }) {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({
    name,
    email,
    password: hashedPassword,
    role
  });
}

async function seedDemoUsers() {
  await ensureDemoUser(DEMO_CUSTOMER);
  await ensureDemoUser(DEMO_VENDOR);
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB database successfully');
    return seedDemoUsers();
  })
  .then(() => {
    console.log('Demo login users are ready');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Demo customer: ${DEMO_CUSTOMER.email} / ${DEMO_CUSTOMER.password}`);
      console.log(`Demo vendor: ${DEMO_VENDOR.email} / ${DEMO_VENDOR.password}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB database connection error:', err);
    console.log('Starting server in fallback mode without active DB connection...');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running in fallback mode on port ${PORT}`);
    });
  });

module.exports = app; // For testing
