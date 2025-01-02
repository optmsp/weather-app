// Test script for weather data updates and duplicate prevention
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000';
const TEST_USER = 'test-user';

async function resetDatabase() {
  try {
    await fetch(`${API_URL}/reset`, {
      method: 'POST'
    });
    console.log('Database reset successful');
  } catch (error) {
    console.error('Failed to reset database:', error);
    process.exit(1);
  }
}

async function addFavorite(city, coordinates) {
  const response = await fetch(`${API_URL}/favorites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: TEST_USER,
      city,
      coordinates
    })
  });
  
  if (!response.ok && response.status !== 409) {
    throw new Error(`Failed to add favorite: ${response.statusText}`);
  }
  
  return response;
}

async function getFavorites() {
  const response = await fetch(`${API_URL}/favorites`);
  if (!response.ok) {
    throw new Error('Failed to get favorites');
  }
  return response.json();
}

async function simulateWeatherRefresh() {
  // Get current favorites
  const favorites = await getFavorites();
  console.log('\nCurrent favorites before refresh:', favorites);
  
  // Simulate weather refresh by getting each favorite again
  for (const favorite of favorites) {
    const response = await fetch(`${API_URL}/favorites/${favorite.id}`);
    if (!response.ok) {
      throw new Error(`Failed to refresh favorite ${favorite.city}`);
    }
  }
  
  // Get favorites after refresh
  const afterRefresh = await getFavorites();
  console.log('\nFavorites after refresh:', afterRefresh);
  
  // Verify no duplicates were created
  const cityCount = {};
  afterRefresh.forEach(fav => {
    cityCount[fav.city.toLowerCase()] = (cityCount[fav.city.toLowerCase()] || 0) + 1;
  });
  
  const duplicates = Object.entries(cityCount).filter(([_, count]) => count > 1);
  if (duplicates.length > 0) {
    console.error('Found duplicates:', duplicates);
    process.exit(1);
  }
  
  // Verify each favorite has unique coordinates
  const coordinates = new Set();
  afterRefresh.forEach(fav => {
    const coordStr = `${fav.coordinates.lat},${fav.coordinates.lon}`;
    if (coordinates.has(coordStr)) {
      console.error(`Duplicate coordinates found for ${fav.city}: ${coordStr}`);
      process.exit(1);
    }
    coordinates.add(coordStr);
  });
  
  console.log('\n✓ No duplicates created during refresh');
  console.log('✓ Each favorite has unique coordinates');
  return afterRefresh;
}

async function runTests() {
  console.log('\n=== Testing Weather Data Updates and Duplicate Prevention ===\n');
  
  // Reset database
  await resetDatabase();
  
  // Add test favorites
  const testCities = [
    { city: 'London', coordinates: { lat: 51.5074, lon: -0.1278 } },
    { city: 'Tokyo', coordinates: { lat: 35.6762, lon: 139.6503 } },
    { city: 'New York', coordinates: { lat: 40.7128, lon: -74.006 } }
  ];
  
  for (const city of testCities) {
    console.log(`\nAdding ${city.city}...`);
    await addFavorite(city.city, city.coordinates);
  }
  
  // Simulate multiple weather refreshes
  console.log('\n=== Simulating Multiple Weather Refreshes ===');
  for (let i = 0; i < 3; i++) {
    console.log(`\nRefresh cycle ${i + 1}:`);
    await simulateWeatherRefresh();
  }
  
  console.log('\n=== All Tests Passed ===');
  console.log('✓ Successfully added test cities');
  console.log('✓ Multiple refreshes did not create duplicates');
  console.log('✓ Each favorite maintained unique coordinates');
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
