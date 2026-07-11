const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const cors = require('cors');
const authRoutes = require('./routes/auth');
const hackathonRoutes = require('./routes/hackathon');
const courseRoutes = require('./routes/courses');

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
app.use('/api/auth', authRoutes);
app.use('/api/hackathon', hackathonRoutes);
app.use('/api/lms', courseRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
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
    startServer(PORT);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

initializeApp();
