// Basic rule-based sentiment analyzer
const positiveWords = new Set([
  'good', 'great', 'delicious', 'tasty', 'amazing', 'love', 'excellent', 
  'best', 'awesome', 'fresh', 'friendly', 'fast', 'yummy', 'clean', 'perfect',
  'nice', 'satisfied', 'wonderful', 'highly', 'fantastic', 'sweet', 'crispy'
]);

const negativeWords = new Set([
  'bad', 'worst', 'terrible', 'disgusting', 'horrible', 'slow', 'cold', 
  'stale', 'rude', 'dirty', 'expensive', 'burnt', 'undercooked', 'flavorless',
  'hate', 'poor', 'bland', 'greasy', 'nasty', 'disappointed', 'disappointing'
]);

function analyzeSentiment(text) {
  if (!text) return 'neutral';
  
  const tokens = text.toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
    .split(/\s+/);
    
  let positiveScore = 0;
  let negativeScore = 0;
  
  tokens.forEach(token => {
    if (positiveWords.has(token)) positiveScore++;
    if (negativeWords.has(token)) negativeScore++;
  });
  
  if (positiveScore > negativeScore) {
    return 'positive';
  } else if (negativeScore > positiveScore) {
    return 'negative';
  }
  return 'neutral';
}

function generateSummary(reviews) {
  if (!reviews || reviews.length === 0) {
    return "No reviews yet. Feedback will populate once customers start rating and reviewing meals.";
  }

  // Count sentiments
  let posCount = 0;
  let negCount = 0;
  let neuCount = 0;
  
  // Find key phrases
  const mealFeedbacks = {};
  
  reviews.forEach(r => {
    if (r.sentiment === 'positive') posCount++;
    else if (r.sentiment === 'negative') negCount++;
    else neuCount++;
  });

  const percentPositive = Math.round((posCount / reviews.length) * 100);
  
  if (percentPositive >= 75) {
    return `Customers are highly satisfied! (${percentPositive}% positive feedback). Most popular dishes are receiving glowing reviews. Keep up the high standard.`;
  } else if (percentPositive >= 50) {
    return `Generally positive feedback (${percentPositive}% positive). Some customers noted minor issues. Check lowest rated meals to improve customer satisfaction.`;
  } else {
    return `Critical feedback received (${negCount} negative reviews). Customers have raised issues about quality or service. Urgently check underperforming meals.`;
  }
}

module.exports = { analyzeSentiment, generateSummary };
