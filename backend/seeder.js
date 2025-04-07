const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

// Create users
const createUsers = async () => {
  try {
    // First clear the database
    await User.deleteMany();

    console.log('Previous users deleted...');

    // Create admin user
    await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      status: 'active'
    });

    // Create regular user
    await User.create({
      username: 'user',
      email: 'user@example.com',
      password: 'user123',
      role: 'user',
      status: 'active'
    });

    console.log('Users imported...');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Delete users
const deleteUsers = async () => {
  try {
    await User.deleteMany();
    console.log('Users destroyed...');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Check command line arguments
if (process.argv[2] === '-i') {
  createUsers();
} else if (process.argv[2] === '-d') {
  deleteUsers();
} else {
  console.log('Please use correct command: node seeder -i (import) or -d (delete)');
  process.exit();
} 