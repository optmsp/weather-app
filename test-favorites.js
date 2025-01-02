// Test script for favorites functionality with real API endpoints
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000';

// Helper function to reset the database
async function resetDatabase() {
  try {
    // Use custom reset endpoint
    await fetch(`${API_URL}/reset`, {
      method: 'POST'
    });
    
    // Verify database is empty
    const response = await fetch(`${API_URL}/favorites`);
    const favorites = await response.json();
    
    if (favorites.length > 0) {
      console.error('Failed to clear database');
      process.exit(1);
    }
    
    console.log('Database reset successful');
  } catch (error) {
    console.error('Failed to reset database:', error);
    process.exit(1);
  }
}
const TEST_USER_ID = 'test-user';
const TEST_AUTH_TOKEN = 'test-token';

const testCities = {
  london: {
    location: 'London',
    coordinates: {
      latitude: 51.5074,
      longitude: -0.1278
    }
  },
  tokyo: {
    location: 'Tokyo',
    coordinates: {
      latitude: 35.6762,
      longitude: 139.6503
    }
  },
  newYork: {
    location: 'New York',
    coordinates: {
      latitude: 40.7128,
      longitude: -74.0060
    }
  }
};

// API helper functions
async function getFavorites() {
  const response = await fetch(`${API_URL}/favorites`, {
    headers: {
      'Authorization': `Bearer ${TEST_AUTH_TOKEN}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch favorites');
  return response.json();
}

async function addFavorite(cityData) {
  const favorite = {
    userId: TEST_USER_ID,
    city: cityData.location,
    coordinates: {
      lat: cityData.coordinates.latitude,
      lon: cityData.coordinates.longitude
    }
  };

  const response = await fetch(`${API_URL}/favorites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TEST_AUTH_TOKEN}`
    },
    body: JSON.stringify(favorite)
  });

  if (response.status === 409) {
    console.log(`Favorite already exists: ${cityData.location}`);
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to add favorite: ${await response.text()}`);
  }

  return response.json();
};

// Test case 1: Adding cities as favorites
async function testAddCities() {
  console.log('\n=== Test Case 1: Adding Cities as Favorites ===');
  
  // Clear existing favorites
  const initialFavorites = await getFavorites();
  console.log('Initial favorites:', initialFavorites);

  // Test adding each city
  for (const [cityName, cityData] of Object.entries(testCities)) {
    console.log(`\nTesting ${cityName}:`);
    console.log('Adding as favorite...');
    const result = await addFavorite(cityData);
    
    if (result) {
      console.log(`✓ Successfully added ${cityName}`);
      console.log('Favorite data:', result);
    } else {
      console.log(`! ${cityName} already exists as favorite`);
    }
  }
}

// Test case 2: Verify no duplicates
async function testNoDuplicates() {
  console.log('\n=== Test Case 2: Verifying No Duplicates ===');
  
  // Try to add the same cities again
  for (const [cityName, cityData] of Object.entries(testCities)) {
    console.log(`\nTesting ${cityName}:`);
    console.log('Attempting to add duplicate...');
    const result = await addFavorite(cityData);
    
    if (!result) {
      console.log(`✓ Correctly prevented duplicate ${cityName}`);
    } else {
      console.log(`✗ Failed: Allowed duplicate ${cityName}`);
      throw new Error(`Duplicate prevention failed for ${cityName}`);
    }
  }
}

// Test case 3: Race conditions
async function testRaceConditions() {
  console.log('\n=== Test Case 3: Testing Race Conditions ===');
  
  // Try to add the same city multiple times simultaneously
  const city = testCities.london;
  console.log(`Attempting concurrent additions of ${city.location}...`);
  
  const results = await Promise.all([
    addFavorite(city),
    addFavorite(city),
    addFavorite(city)
  ]);
  
  const successCount = results.filter(result => result !== null).length;
  console.log(`Concurrent additions resulted in ${successCount} successful adds`);
  
  if (successCount <= 1) {
    console.log('✓ Successfully prevented duplicate additions under load');
  } else {
    console.log('✗ Failed: Multiple concurrent additions succeeded');
    throw new Error('Race condition protection failed');
  }
}

// Run all tests
async function runTests() {
  try {
    console.log('Starting favorites functionality tests...\n');
    
    // Test 1: Adding cities
    await testAddCities();
    
    // Test 2: Verifying no duplicates
    await testNoDuplicates();
    
    // Test 3: Testing race conditions
    await testRaceConditions();
    
    console.log('\n=== All Tests Complete ===');
    console.log('✓ Successfully tested adding London, Tokyo, and New York');
    console.log('✓ Verified duplicate prevention');
    console.log('✓ Verified race condition handling');
  } catch (error) {
    console.error('\n✗ Test failed:', error);
    process.exit(1);
  }
}

// Note: node-fetch is required as a dependency

// Reset database and run tests
resetDatabase()
  .then(() => runTests())
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
