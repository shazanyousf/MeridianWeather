/**
 * AI Service - Provides rule-based weather recommendations & advisories.
 * Generates intelligent suggestions based on weather conditions.
 */

/**
 * Generate clothing recommendations based on temperature & condition.
 */
const getClothingRecommendation = ({ temperature, condition, windSpeed }) => {
  let clothing = [];

  if (temperature >= 30) {
    clothing = ['Light t-shirt', 'Shorts', 'Sunglasses', 'Sunscreen', 'Hat', 'Breathable cotton clothes'];
  } else if (temperature >= 24) {
    clothing = ['T-shirt', 'Light trousers', 'Comfortable shoes'];
  } else if (temperature >= 18) {
    clothing = ['Long-sleeve shirt', 'Light jacket', 'Denim'];
  } else if (temperature >= 10) {
    clothing = ['Sweater', 'Jacket', 'Warm trousers', 'Scarf'];
  } else if (temperature >= 0) {
    clothing = ['Heavy coat', 'Woolen sweater', 'Gloves', 'Warm cap'];
  } else {
    clothing = ['Thermal wear', 'Heavy winter jacket', 'Snow boots', 'Gloves', 'Woolen cap', 'Ear muffs'];
  }

  if (condition === 'rain' || condition === 'drizzle') {
    clothing.push('Raincoat or umbrella', 'Waterproof shoes');
  }
  if (condition === 'snow') {
    clothing.push('Waterproof winter jacket', 'Insulated boots');
  }
  if (windSpeed > 30) {
    clothing.push('Windbreaker');
  }

  return clothing;
};

/**
 * Generate health advisory based on weather.
 */
const getHealthAdvisory = ({ temperature, humidity, condition, aqi }) => {
  const advisory = [];

  if (aqi && aqi >= 4) {
    advisory.push({ level: 'warning', message: 'Air quality is poor. Avoid outdoor activities and wear a mask.' });
  }
  if (temperature >= 35) {
    advisory.push({ level: 'warning', message: 'Extreme heat detected. Stay hydrated and avoid sun exposure.' });
  }
  if (temperature <= 0) {
    advisory.push({ level: 'warning', message: 'Freezing temperatures. Dress warmly and limit time outdoors.' });
  }
  if (humidity > 80) {
    advisory.push({ level: 'info', message: 'High humidity may cause discomfort. Keep cool and stay hydrated.' });
  }
  if (condition === 'storm') {
    advisory.push({ level: 'danger', message: 'Thunderstorm in your area. Seek shelter indoors.' });
  }

  if (advisory.length === 0) {
    advisory.push({ level: 'info', message: 'Weather conditions are favorable for most activities.' });
  }

  return advisory;
};

/**
 * Generate outdoor activity suggestions.
 */
const getActivitySuggestion = ({ temperature, condition, precipitationProbability, windSpeed }) => {
  const activities = [
    { name: 'Morning Walk', icon: '🚶', goodFor: (t) => t >= 10 && t <= 28 },
    { name: 'Cycling', icon: '🚴', goodFor: (t) => t >= 15 && t <= 30 },
    { name: 'Picnic', icon: '🧺', goodFor: (t) => t >= 18 && t <= 30 },
    { name: 'Running', icon: '🏃', goodFor: (t) => t >= 8 && t <= 25 },
    { name: 'Swimming', icon: '🏊', goodFor: (t) => t >= 25 },
    { name: 'Photography', icon: '📷', goodFor: (t) => t >= 0 },
    { name: 'Hiking', icon: '🥾', goodFor: (t) => t >= 12 && t <= 28 },
    { name: 'Gardening', icon: '🌱', goodFor: (t) => t >= 15 && t <= 30 },
  ];

  const tooRainy = condition === 'rain' || condition === 'storm' || (precipitationProbability && precipitationProbability > 60);
  const tooWindy = windSpeed > 40;

  const suitable = activities.filter((a) => a.goodFor(temperature) && !tooRainy && !tooWindy);

  return {
    suitable: suitable.slice(0, 4).map((a) => a.name),
    notRecommended: tooRainy ? ['Outdoor sports', 'Gym in open air'] : tooWindy ? ['Cycling', 'Kite flying'] : [],
  };
};

/**
 * Generate travel suggestions.
 */
const getTravelSuggestion = ({ temperature, condition, precipitationProbability }) => {
  if (condition === 'storm') {
    return { rating: 1, suggestion: 'Avoid travel due to severe weather.', reason: 'Thunderstorm warning in effect.' };
  }
  if (precipitationProbability && precipitationProbability > 70) {
    return { rating: 2, suggestion: 'Consider postponing travel.', reason: 'High chance of rain.' };
  }
  if (temperature > 38) {
    return { rating: 3, suggestion: 'Travel with caution.', reason: 'Extreme heat; carry water and plan for shade.' };
  }
  if (condition === 'snow') {
    return { rating: 2, suggestion: 'Travel with caution.', reason: 'Snowy conditions may affect roads.' };
  }
  if (temperature >= 15 && temperature <= 28 && (precipitationProbability || 0) < 40) {
    return { rating: 5, suggestion: 'Perfect time to travel!', reason: 'Ideal temperatures and clear skies.' };
  }

  return { rating: 4, suggestion: 'Good time to travel.', reason: 'Conditions are generally favorable.' };
};

/**
 * Generate crop advisory for farmers.
 */
const getCropAdvisory = ({ temperature, humidity, precipitation, condition }) => {
  const advisory = [];

  if (precipitation > 10) {
    advisory.push('Heavy rainfall expected. Ensure proper field drainage to prevent waterlogging.');
  }
  if (temperature > 35) {
    advisory.push('High temperatures may stress crops. Increase irrigation frequency and provide shade.');
  }
  if (temperature < 5) {
    advisory.push('Low temperatures risk frost damage. Cover sensitive crops with protective sheets.');
  }
  if (humidity > 85) {
    advisory.push('High humidity increases risk of fungal diseases. Apply preventive fungicides.');
  }
  if (condition === 'storm') {
    advisory.push('Storms expected. Secure greenhouse structures and harvest mature crops early.');
  }

  if (advisory.length === 0) {
    advisory.push('Weather conditions are favorable for normal farming operations.');
  }

  return advisory;
};

/**
 * Generate disaster alerts based on weather.
 */
const getDisasterAlert = ({ temperature, condition, windSpeed, precipitation }) => {
  const alerts = [];

  if (condition === 'storm' && windSpeed > 60) {
    alerts.push({ type: 'cyclone', severity: 'severe', message: 'High wind speeds detected. Possible cyclone risk.' });
  }
  if (precipitation > 50) {
    alerts.push({ type: 'flood', severity: 'extreme', message: 'Extreme rainfall. High risk of flooding.' });
  }
  if (temperature > 40) {
    alerts.push({ type: 'heatwave', severity: 'severe', message: 'Extreme heatwave conditions expected.' });
  }
  if (temperature < -5) {
    alerts.push({ type: 'coldwave', severity: 'severe', message: 'Severe cold wave conditions expected.' });
  }

  return alerts;
};

/**
 * Determine best time to visit.
 */
const getBestTimeToVisit = (dailyForecast) => {
  if (!dailyForecast || dailyForecast.length === 0) return null;

  const scored = dailyForecast.map((day) => {
    const avgTemp = (day.tempMax + day.tempMin) / 2;
    let score = 100;

    if (day.condition === 'rain' || day.condition === 'storm') score -= 40;
    if (day.condition === 'snow') score -= 30;
    if (avgTemp > 35) score -= 25;
    if (avgTemp < 0) score -= 20;
    if (day.precipitationSum > 10) score -= 30;
    if (day.uvIndex > 10) score -= 10;

    return { ...day, score: Math.max(score, 0) };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];

  return {
    date: best.date,
    score: best.score,
    condition: best.condition,
    tempMax: best.tempMax,
    tempMin: best.tempMin,
    recommendation: best.score >= 80 ? 'Excellent' : best.score >= 60 ? 'Good' : best.score >= 40 ? 'Fair' : 'Poor',
  };
};

/**
 * Master AI recommendation generator.
 */
const generateRecommendations = (weatherData) => {
  const { current } = weatherData;

  return {
    clothing: getClothingRecommendation(current),
    health: getHealthAdvisory(current),
    activities: getActivitySuggestion(current),
    travel: getTravelSuggestion(current),
    crop: getCropAdvisory(current),
    disaster: getDisasterAlert(current),
    bestTimeToVisit: getBestTimeToVisit(weatherData.daily),
  };
};

module.exports = {
  getClothingRecommendation,
  getHealthAdvisory,
  getActivitySuggestion,
  getTravelSuggestion,
  getCropAdvisory,
  getDisasterAlert,
  getBestTimeToVisit,
  generateRecommendations,
};
