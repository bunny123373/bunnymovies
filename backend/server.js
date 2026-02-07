const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const compression = require('compression');

const movieRoutes = require('./routes/movies');
const categoryRoutes = require('./routes/categories');
const notificationRoutes = require('./routes/notifications');

dotenv.config();

const app = express();

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/movie-download-db')
  .then(async () => {
    console.log('MongoDB Connected');
    
    // Drop any problematic text indexes
    try {
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();
      
      for (const collection of collections) {
        if (collection.name === 'movies') {
          const indexes = await db.collection(collection.name).listIndexes().toArray();
          for (const index of indexes) {
            if (index.textIndexVersion) {
              console.log('Dropping text index:', index.name);
              await db.collection(collection.name).dropIndex(index.name);
            }
          }
        }
      }
    } catch (error) {
      console.log('No problematic indexes found or error dropping indexes:', error.message);
    }
  })
  .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/movies', movieRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
