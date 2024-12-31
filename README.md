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

### Phase 1: Project Setup & Authentication
1. Initialize project structure ✓
2. Implement user registration
3. Implement login system
4. Add 2FA integration
5. Create profile management

### Phase 2: Weather Features
1. Integrate Open-Meteo.com API
2. Implement city search
3. Add geolocation support
4. Create favorites system
5. Develop weather display components

### Phase 3: User Interface
1. Design and implement responsive layouts
2. Create homepage dashboard
3. Develop history page
4. Add favorites management UI
5. Implement cross-browser compatibility

### Phase 4: Testing & Deployment
1. Setup mock data server
2. Implement unit tests
3. Add E2E tests
4. Configure CI/CD pipeline
5. Prepare for production deployment

## Getting Started

### Prerequisites
- Node.js 18+
- npm 8+

### Installation
```sh
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Lint and fix files
npm run lint
```

## Browser Support
- Chrome (latest)
- Edge (latest)
- Firefox (latest)

## Contributing
Please read our contributing guidelines before submitting pull requests.

## License
This project is licensed under the MIT License - see the LICENSE file for details.
