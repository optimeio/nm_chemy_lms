const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const cors = require('cors');
const authRoutes = require('./routes/auth');
const hackathonRoutes = require('./routes/hackathon');
const courseRoutes = require('./routes/courses');
const announcementRoutes = require('./routes/announcements');
const universityPracticalRoutes = require('./routes/university-practical');

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI is not defined. Please add it to backend/.env');
  process.exit(1);
}

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// mount api routes
console.log('📌 Mounting API routes...');
app.use('/api/auth', authRoutes);
app.use('/api/hackathon', hackathonRoutes);
app.use('/api/lms', courseRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/university-practical', universityPracticalRoutes);
console.log('✅ All API routes mounted\n');

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Catch-all 404 error handler (must be AFTER all routes)
app.use((req, res) => {
  console.error(`❌ [404] No route found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      'POST /api/announcements/feedback/submit',
      'GET /api/announcements/feedback',
      'POST /api/announcements/feedback/:id/reply',
      'DELETE /api/announcements/feedback/:id'
    ]
  });
});

function startServer(portToTry) {
  const server = app.listen(portToTry, () => {
    console.log(`Server running on http://localhost:${portToTry}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      const nextPort = portToTry + 1;
      console.warn(`Port ${portToTry} is busy. Trying ${nextPort}...`);
      server.close(() => startServer(nextPort));
    } else {
      console.error('Server error:', error.message);
      process.exit(1);
    }
  });
}

async function initializeApp() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log('MongoDB connected successfully');
    
    // Initialize University Practical examination records
    const { initializeRecords } = require('./controllers/universityPracticalController');
    await initializeRecords('system');
    console.log('✅ University Practical records initialized');
    
    startServer(PORT);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

initializeApp();
