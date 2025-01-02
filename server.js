const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Custom duplicate-check middleware
server.use(middlewares);
server.use(jsonServer.bodyParser);

// Reset favorites endpoint for testing
server.post('/reset-favorites', (req, res) => {
  router.db.set('favorites', []).write();
  res.json({ message: 'Favorites reset successfully' });
});

// Custom middleware to prevent duplicate favorites
server.post('/favorites', (req, res, next) => {
  const db = router.db;
  const { userId, city } = req.body;

  if (!userId || !city) {
    return res.status(400).json({ error: 'Missing required fields: userId and city' });
  }

  // Case-insensitive check for existing favorite
  const existingFavorite = db
    .get('favorites')
    .find(fav => 
      fav.userId.toLowerCase() === userId.toLowerCase() && 
      fav.city.toLowerCase() === city.toLowerCase()
    )
    .value();

  if (existingFavorite) {
    return res.status(409).json({ error: 'Favorite already exists' });
  }

  // Let json-server handle creating the new resource
  next();
});

// Use default router
server.use(router);

// Start server
server.listen(3000, () => {
  console.log('JSON Server is running on port 3000');
});
