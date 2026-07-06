const axios = require('axios');

const API_URL = 'http://localhost:5050/api';

async function runTests() {
  console.log('--- STARTING BACKEND API INTEGRATION VERIFICATION ---');
  
  let token = '';
  const testEmail = `chef.${Date.now()}@example.com`;
  
  try {
    // 1. Health check
    console.log('Testing server health check...');
    const health = await axios.get('http://localhost:5050/health');
    console.log('✔ Health OK:', health.data);

    // 2. Signup Vendor
    console.log('\nTesting Vendor Signup...');
    const signupRes = await axios.post(`${API_URL}/signup`, {
      name: 'Chef Gordon',
      email: testEmail,
      password: 'password123',
      role: 'Vendor'
    });
    token = signupRes.data.token;
    console.log('✔ Signup OK. User Registered:', signupRes.data.user.name);

    // 3. Login
    console.log('\nTesting Vendor Login...');
    const loginRes = await axios.post(`${API_URL}/login`, {
      email: testEmail,
      password: 'password123'
    });
    console.log('✔ Login OK. Token Acquired.');

    // 4. Create Food Corner
    console.log('\nTesting Create Food Corner...');
    const cornerRes = await axios.post(`${API_URL}/foodcorners`, {
      name: 'Gordon Grill House',
      location: '123 Fine St, London',
      description: 'Elegant dining and gourmet masterclasses.',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const cornerId = cornerRes.data._id;
    console.log('✔ Create Food Corner OK. ID:', cornerId);

    // 5. Create Meal
    console.log('\nTesting Create Meal...');
    const mealRes = await axios.post(`${API_URL}/meals`, {
      foodCornerId: cornerId,
      name: 'SiWellington',
      price: 49.99,
      description: 'wrapped in puff pastry with mushroom duxelles.',
      image: 'https://www.ficsi.in/blog/wp-content/uploads/2025/05/Blog-2.jpg'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const mealId = mealRes.data._id;
    console.log('✔ Create Meal OK. ID:', mealId);

    // 6. Signup a Customer to rate it
    const customerEmail = `customer.${Date.now()}@example.com`;
    console.log('\nTesting Customer Signup...');
    const custSignup = await axios.post(`${API_URL}/signup`, {
      name: 'Alice Cooper',
      email: customerEmail,
      password: 'password123',
      role: 'Customer'
    });
    const customerToken = custSignup.data.token;
    console.log('✔ Customer Registered:', custSignup.data.user.name);

    // 7. Post Review
    console.log('\nTesting Review submission & Sentiment AI tagging...');
    const reviewRes = await axios.post(`${API_URL}/reviews`, {
      mealId,
      rating: 5,
      reviewText: 'This Beef Wellington is absolutely delicious and amazing!'
    }, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    console.log('✔ Review Posted successfully. Sentiment Tagged:', reviewRes.data.sentiment);

    // 8. Fetch Analytics for the Vendor
    console.log('\nTesting Dashboard Analytics & Summaries...');
    const statsRes = await axios.get(`${API_URL}/analytics`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✔ Analytics Load OK:', {
      totalMeals: statsRes.data.totalMeals,
      totalReviews: statsRes.data.totalReviews,
      averageRating: statsRes.data.averageRating,
      aiSummary: statsRes.data.aiInsight
    });

    console.log('\n--- ALL API INTEGRATIONS VERIFIED SUCCESSFULLY ---');
    process.exit(0);

  } catch (error) {
    console.error('❌ Verification failed:', error.response ? error.response.data : error.message);
    process.exit(1);
  }
}

runTests();
