// Custom json-server middleware to prevent duplicate favorites
import pkg from 'json-server';
const { create, router: _router, defaults, bodyParser } = pkg;
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = create();
const router = _router(join(__dirname, 'db.json'));
const middlewares = defaults();

// Use default middlewares (cors, static, etc)
server.use(middlewares);

// Parse POST, PUT and PATCH JSON bodies
server.use(bodyParser);

// Custom route for resetting favorites (test only)
server.post('/reset', (req, res) => {
  router.db.set('favorites', []).write();
  res.json({ message: 'Database reset successful' });
});

// Custom middleware to prevent duplicate favorites
server.use((req, res, next) => {
  // Reset the database state before each request to ensure fresh data
  router.db.read();
  next();
});

server.post('/favorites', async (req, res, next) => {
  const userId = req.body.userId?.toString().toLowerCase();
  const city = req.body.city?.toString().toLowerCase();

  if (!userId || !city) {
    return res.status(400).json({ error: 'Missing required fields: userId and city' });
  }

  // Force a fresh read of the database
  router.db.read();
  
  // Get current favorites from the database
  const favorites = router.db.get('favorites').value();
  
  // Check for existing favorite with case-insensitive comparison
  const existingFavorite = favorites.find(
    (fav) =>
      fav.userId.toString().toLowerCase() === userId &&
      fav.city.toString().toLowerCase() === city
  );

  if (existingFavorite) {
    // Return a 409 Conflict response with details
    return res.status(409).json({ 
      error: 'Favorite already exists',
      existing: existingFavorite,
      requested: { userId, city }
    });
  }

  // Write the database before proceeding to ensure atomic operation
  router.db.write();
  
  // Otherwise let json-server handle creating new resource
  next();
});

// Use default router
server.use(router);

// Start server
const port = 3000;
server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});
