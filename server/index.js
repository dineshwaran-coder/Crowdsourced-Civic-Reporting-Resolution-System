require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB, getIsFallbackMode } = require('./db');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to Database
connectDB();

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/reports', require('./routes/reports'));

// Standard Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    fallbackMode: getIsFallbackMode(),
    timestamp: new Date()
  });
});

// Port configuration & module export
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 Static files served at http://localhost:${PORT}/uploads`);
    console.log(`⚙️  Running in ${getIsFallbackMode() ? 'FALLBACK LOCAL JSON' : 'MONGODB ATLAS'} database mode.`);
  });
}

module.exports = app;
