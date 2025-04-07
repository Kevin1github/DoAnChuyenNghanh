const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
const auth = require('./routes/auth');
const users = require('./routes/users');
const bills = require('./routes/bills');
const userBills = require('./routes/userBills');
const profile = require('./routes/profile');
const reports = require('./routes/reports');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Request logger for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Mount routers
app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/bills', bills);
app.use('/api/user-bills', userBills);
app.use('/api/profile', profile);
app.use('/api/reports', reports);

// Error Handler (after routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 