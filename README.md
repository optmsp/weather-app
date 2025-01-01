# Weather App

A modern weather tracking application built with Vue.js 3.5, TypeScript, and Pinia. This application allows users to track weather conditions for their favorite locations using the Open-Meteo.com API.

## Features

### User Authentication & Profile Management
- User registration with email and password
- Secure login system
- Two-factor authentication (2FA) support using Google Authenticator/Authy
- Profile management (update name, email)

### Weather Tracking
- City-based weather lookup
- Browser geolocation support for automatic local weather
- Favorite locations management
- Detailed weather information from Open-Meteo.com API

### User Interface
- Responsive design supporting Chrome, Edge, and Firefox
- Homepage dashboard showing weather for favorite locations
- History page tracking:
  - Search history
  - Favorites management (additions/removals)
  - Login activity

## Technical Stack

### Frontend
- Vue.js 3.5
- TypeScript for type safety
- Pinia for state management
- Tailwind CSS with daisyUI for UI components
- Vue Router for navigation

### Development & Testing
- Mock data server (json-server) for development
- ESLint for code linting
- Prettier for code formatting
- Volar for Vue.js/TypeScript support

### API Integration
- Open-Meteo.com API for weather data
- Browser Geolocation API for location detection

## Project Structure
```
src/
├── assets/          # Static assets
├── components/      # Reusable Vue components
├── views/           # Page components
├── stores/          # Pinia stores
├── services/        # API and authentication services
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── router/          # Vue Router configuration
```

## Development Plan

### Phase 1: Project Setup & Authentication ✓
1. Initialize project structure ✓
2. Implement user registration ✓
3. Implement login system ✓
4. Add 2FA integration ✓
5. Create profile management ✓

### Phase 2: Weather Features ✓
1. Integrate Open-Meteo.com API ✓
2. Implement city search ✓
3. Add geolocation support ✓
4. Create favorites system ✓
5. Develop weather display components ✓

### Phase 3: User Interface ✓
1. Design and implement responsive layouts ✓
2. Create homepage dashboard ✓
3. Develop history page ✓
4. Add favorites management UI ✓
5. Implement cross-browser compatibility (Pending browser testing)

### Phase 4: Testing & Deployment (In Progress)
1. Setup mock data server ✓
2. API Testing ✓
   - Authentication endpoints verified
   - Weather API integration verified
   - History tracking verified
   - Favorites management verified
3. UI Testing (Pending)
   - Chrome compatibility check needed
   - Edge compatibility check needed
   - Firefox compatibility check needed
4. Configure CI/CD pipeline
5. Prepare for production deployment

## Testing Results

### API Integration Tests
1. Authentication System
   - Registration: ✓ Verified
   - Login: ✓ Verified
   - 2FA: ✓ Verified (TOTP implementation)
   - Profile Updates: ✓ Verified

2. Weather Features
   - Open-Meteo API: ✓ Verified
     - Current weather data
     - Hourly forecasts
     - Coordinate-based queries
   - City Search: ✓ Verified
   - Geolocation: ✓ Verified
   - Favorites: ✓ Verified

3. History Tracking
   - Search History: ✓ Verified
   - Login Events: ✓ Verified
   - Favorites Management: ✓ Verified

### Mock API Status
- Server: Running on port 3000
- Endpoints:
  - `/users`: User management ✓
  - `/sessions`: Authentication ✓
  - `/favorites`: Location management ✓
  - `/history`: Activity tracking ✓

### Development Server
- Status: Running on port 4000
- Features:
  - API Proxy Configuration ✓
  - HMR Support ✓
  - TypeScript Integration ✓

## Getting Started

### Prerequisites
- Node.js 18+
- npm 8+

### Installation and Setup
```sh
# Install dependencies
npm install
```

### Running the Application
You'll need to run both the mock API server and the Vue development server:

1. Start the Mock API Server (Terminal 1):
```sh
# Start json-server on port 3000
npm run mock-api
```
This starts the mock API server with endpoints for:
- Authentication (http://localhost:3000/users)
- Sessions (http://localhost:3000/sessions)
- Favorites (http://localhost:3000/favorites)
- History (http://localhost:3000/history)

2. Start the Vue Development Server (Terminal 2):
```sh
# Start Vite dev server on port 4000
npm run dev
```

The application will be available at http://localhost:4000

### Development Scripts
```sh
# Start mock API server (json-server)
npm run mock-api

# Start Vue development server
npm run dev

# Type checking
npm run type-check

# Lint and fix files
npm run lint

# Format code with Prettier
npm run format

# Build for production
npm run build
```

### Testing the Application
1. Ensure both servers are running (mock-api and dev)
2. Register a new account using the registration form
3. Test 2FA setup during first login
4. Try the weather search functionality
5. Add locations to favorites
6. Check the history page for activity tracking

### Common Issues
- If port 3000 is in use, stop other services using that port before starting mock-api
- If you see authentication errors, ensure the mock API server is running
- For weather data issues, check the browser console for API errors

## Browser Support
- Chrome (latest)
- Edge (latest)
- Firefox (latest)

## Contributing
Please read our contributing guidelines before submitting pull requests.

## License
This project is licensed under the MIT License - see the LICENSE file for details.
