// Test script to reproduce favorites duplication issue
const mockWeatherData = {
  id: 'test-id',
  location: 'Tokyo',
  temperature: 20,
  humidity: 65,
  windSpeed: 10,
  description: 'Clear',
  coordinates: {
    latitude: 35.6762,
    longitude: 139.6503
  }
};

const mockFavorites = [
  {
    id: '1b4a',
    userId: 'test',
    city: 'Tokyo',
    coordinates: {
      lat: 35.6762,
      lon: 139.6503
    }
  }
];

// Mock API responses
const mockResponses = {
  getFavorites: () => Promise.resolve(mockFavorites),
  addFavorite: (data) => {
    console.log('Adding favorite:', data);
    return Promise.resolve({
      id: Date.now().toString(),
      userId: 'test',
      city: data.location,
      coordinates: {
        lat: data.coordinates.latitude,
        lon: data.coordinates.longitude
      }
    });
  }
};

// Test case 1: Adding new favorite
async function testAddFavorite() {
  console.log('\n=== Test Case 1: Adding New Favorite ===');
  console.log('Expected: Single API call when adding favorite');
  
  const apiCalls = [];
  const originalAddFavorite = mockResponses.addFavorite;
  mockResponses.addFavorite = async (data) => {
    apiCalls.push(data);
    return originalAddFavorite(data);
  };

  await mockResponses.addFavorite(mockWeatherData);
  console.log(`Result: ${apiCalls.length} API call(s) made`);
  console.log('API calls:', apiCalls);
  
  mockResponses.addFavorite = originalAddFavorite;
}

// Test case 2: Refreshing favorites
async function testRefreshFavorites() {
  console.log('\n=== Test Case 2: Refreshing Favorites ===');
  console.log('Expected: Only update weather data, no re-adding');
  
  const initialFavorites = await mockResponses.getFavorites();
  console.log('Initial favorites:', initialFavorites);

  const addedFavorites = [];
  const originalAddFavorite = mockResponses.addFavorite;
  mockResponses.addFavorite = async (data) => {
    addedFavorites.push(data);
    return originalAddFavorite(data);
  };

  // Simulate refresh
  for (const favorite of initialFavorites) {
    await mockResponses.addFavorite({
      ...mockWeatherData,
      id: favorite.id
    });
  }

  console.log('Result:', addedFavorites.length === initialFavorites.length ? 'Pass' : 'Fail');
  console.log('Added favorites during refresh:', addedFavorites);
  
  mockResponses.addFavorite = originalAddFavorite;
}

// Test case 3: Race conditions
async function testRaceConditions() {
  console.log('\n=== Test Case 3: Race Conditions ===');
  console.log('Expected: No duplicate entries from rapid toggles');
  
  const addedFavorites = new Set();
  const originalAddFavorite = mockResponses.addFavorite;
  mockResponses.addFavorite = async (data) => {
    const result = await originalAddFavorite(data);
    addedFavorites.add(result.city);
    return result;
  };

  // Simulate rapid toggles
  await Promise.all([
    mockResponses.addFavorite(mockWeatherData),
    mockResponses.addFavorite(mockWeatherData),
    mockResponses.addFavorite(mockWeatherData)
  ]);

  console.log('Result:', addedFavorites.size === 1 ? 'Pass' : 'Fail');
  console.log('Unique favorites added:', Array.from(addedFavorites));
  
  mockResponses.addFavorite = originalAddFavorite;
}

// Run all tests
async function runTests() {
  try {
    await testAddFavorite();
    await testRefreshFavorites();
    await testRaceConditions();
    console.log('\n=== All Tests Complete ===');
  } catch (error) {
    console.error('Test error:', error);
  }
}

runTests().catch(console.error);
