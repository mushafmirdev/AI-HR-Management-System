const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');

// Load env vars - THIS IS WHERE .env IS USED
dotenv.config({ path: './config.env' });

// Import routes
const authRoutes = require('./routes/authRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Initialize data files
require('./utils/initialize');

// Create Express app
const app = express();

// Enable CORS
app.use(cors());
app.options('*', cors());

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// File upload configuration
const upload = multer({ 
  dest: path.join(__dirname, 'public/uploads/resumes/'),
  limits: { fileSize: 1000000 } // 1MB limit
});

// Make upload available to routes
app.use((req, res, next) => {
  req.upload = upload;
  next();
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/candidates', candidateRoutes);
app.use('/api/v1/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});