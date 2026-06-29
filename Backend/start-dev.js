#!/usr/bin/env node
/**
 * Development server starter with better error handling
 * Automatically falls back to mock database if MongoDB is unavailable
 */

const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('🚀 Starting SriTech Backend (Development Mode)...\n');

// Set timeout for database connection attempt
process.env.DB_CONNECT_TIMEOUT = '3000';

// Import server after env is loaded
const app = require('./server.js').app || require('./server.js');

// Note: The server should auto-start and the connectDatabase function 
// will handle timeouts and fallback to mock mode
console.log('✅ Backend starter initialized');
