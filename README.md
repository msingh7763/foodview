# FoodView

FoodView is a split backend + mobile frontend project for discovering food corners, browsing meals, posting customer reviews, and helping vendors manage their listings with review-driven analytics.

## What the project does

The app has two roles:

Customer users can sign up or log in, browse food corners, open a corner to see its meals, open a meal to read and write reviews, edit or delete their own reviews, and view their profile history.

Vendor users can log in to a management dashboard, register food corners, add and maintain meals for their corners, and review analytics that summarize ratings and sentiment.

## Tech Stack

- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, cors, dotenv
- Frontend: Expo, React Native, Expo Router, AsyncStorage, React Native Vector Icons

## How the system works

### 1. Authentication and sessions

Authentication is handled in the backend through `/api/signup`, `/api/login`, and `/api/logout`.

When a user signs up or logs in, the API returns a JWT token plus the user profile. The frontend stores both values in AsyncStorage and keeps them in the AuthContext.

The `AuthProvider` also checks the active route group and redirects users based on role:

- unauthenticated users go to the login screen
- customers go to the customer home flow
- vendors go to the vendor dashboard

### 2. Backend data model

The database uses four collections:

- User: stores name, email, hashed password, and role
- FoodCorner: stores a corner name, location, description, image, and the vendor who owns it
- Meal: stores the corner it belongs to, meal name, price, description, image, and average rating
- Review: stores meal id, reviewer, rating, review text, sentiment label, and timestamp

### 3. Review sentiment and meal ratings

The sentiment helper in `backend/sentiment.js` uses a simple rule-based word list to classify reviews as positive, neutral, or negative.

When a customer posts, updates, or deletes a review, the backend recalculates the meal’s average rating from all reviews for that meal.

### 4. Vendor analytics

The analytics endpoint gathers all food corners for the logged-in vendor, then all meals under those corners, then all reviews for those meals.

It returns:

- total meals
- total reviews
- average rating
- most liked meal
- least liked meal
- sentiment counts
- an AI-style summary generated from the review sentiment mix

## Backend flow

The server entry point is [`backend/server.js`](backend/server.js).

It:

1. loads environment variables
2. enables CORS and JSON parsing
3. mounts API routers
4. exposes health routes at `/health` and `/api/health`
5. connects to MongoDB
6. seeds two demo users if they do not already exist

### Mounted API routes

- `/api` -> auth routes
- `/api/foodcorners` -> food corner CRUD
- `/api/meals` -> meal CRUD
- `/api/reviews` -> review CRUD
- `/api/analytics` -> vendor dashboard analytics

### Route behavior

[`backend/routes/auth.js`](backend/routes/auth.js) handles registration, login, and logout. Passwords are hashed with bcrypt, and JWT tokens store the user id and role.

[`backend/routes/foodcorners.js`](backend/routes/foodcorners.js) lets vendors create, update, delete, and list their own corners. Customers can read all corners.

[`backend/routes/meals.js`](backend/routes/meals.js) lets vendors manage meals only for corners they own. Customers can browse meals and open meal detail pages.

[`backend/routes/reviews.js`](backend/routes/reviews.js) lets customers create, update, and delete their own reviews. It also supports fetching reviews for a meal and fetching the logged-in user’s own review history.

[`backend/routes/analytics.js`](backend/routes/analytics.js) aggregates vendor performance data and sentiment insights.

[`backend/routes/middleware.js`](backend/routes/middleware.js) protects endpoints with JWT authentication and role-based authorization.

## Frontend flow

The Expo app uses Expo Router with route groups for auth, customers, and vendors.

### App startup

[`frontend/app/_layout.js`](frontend/app/_layout.js) wraps the app in `AuthProvider`, keeps the navigation stack hidden, and uses the shared dark theme.

[`frontend/app/index.js`](frontend/app/index.js) is the splash screen. It shows the app identity while authentication state is loading.

### Auth screens

- [`frontend/app/(auth)/login.js`](<frontend/app/(auth)/login.js>): login form with demo credentials shown on screen
- [`frontend/app/(auth)/signup.js`](<frontend/app/(auth)/signup.js>): signup form with role selection between Customer and Vendor

### Customer screens

- [`frontend/app/(customer)/home.js`](<frontend/app/(customer)/home.js>): customer landing page with search, featured corners, all corners, and popular dishes
- [`frontend/app/(customer)/corner/[id].js`](<frontend/app/(customer)/corner/[id].js>): corner detail page with meal list
- [`frontend/app/(customer)/meal/[id].js`](<frontend/app/(customer)/meal/[id].js>): meal detail page with review posting, editing, deleting, and sentiment badges
- [`frontend/app/(customer)/profile.js`](<frontend/app/(customer)/profile.js>): profile page with user info and review history

### Vendor screens

- [`frontend/app/(vendor)/dashboard.js`](<frontend/app/(vendor)/dashboard.js>): analytics dashboard with totals, sentiment breakdown, and top/bottom meal performance
- [`frontend/app/(vendor)/manage-corners.js`](<frontend/app/(vendor)/manage-corners.js>): create, edit, delete, and list vendor food corners
- [`frontend/app/(vendor)/manage-meals.js`](<frontend/app/(vendor)/manage-meals.js>): create, edit, delete, and list meals under vendor corners

## API connection in the app

The frontend context in [`frontend/context.js`](frontend/context.js) is responsible for:

- storing the logged-in user and token
- reading/writing auth data in AsyncStorage
- choosing a backend API URL
- retrying requests against fallback API URLs if the first one fails
- redirecting users to the correct route group based on role

This is why the app can work with localhost, LAN, or a tunnel URL without changing the screen code.

## Demo accounts

The backend seeds these accounts automatically if they do not exist:

- Customer: `customer@foodcorner.com` / `Customer@123`
- Vendor: `vendor@foodcorner.com` / `Vendor@123`

## Environment variables

Backend `.env`:

- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`

Frontend `.env` or Expo public env values:

- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_WEB_API_URL`

## Local development

### Backend

```powershell
cd backend
npm install
npm run dev
```

### Frontend

```powershell
cd frontend
npm install
npm start
```

## Project structure

```text
backend/
	models.js
	server.js
	sentiment.js
	routes/
		auth.js
		foodcorners.js
		meals.js
		reviews.js
		analytics.js
		middleware.js

frontend/
	context.js
	app/
		_layout.js
		index.js
		(auth)/
		(customer)/
		(vendor)/
	assets/
```

## Notes

- The backend uses a simple word-based sentiment engine, not a hosted AI model.
- Vendor access is protected at the route level, so vendors can only manage their own corners and meals.
- Customer reviews update meal ratings automatically, so the UI always reflects the current average score.
