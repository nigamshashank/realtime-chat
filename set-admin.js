// Script to set the first admin user
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');

const ADMIN_EMAIL = 'nigamshashank@gmail.com';

async function setAdmin() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 
                     process.env.DATABASE_URL || 
                     process.env.MONGO_URL ||
                     'mongodb://localhost:27017/realtime-chat';
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Find user by email
    const user = await User.findOne({ email: ADMIN_EMAIL });
    
    if (!user) {
      console.log(`❌ User with email ${ADMIN_EMAIL} not found`);
      console.log('Please make sure the user has logged in at least once before running this script');
      process.exit(1);
    }
    
    // Update user role to admin
    user.role = 'admin';
    await user.save();
    
    console.log(`✅ Successfully set ${ADMIN_EMAIL} as admin`);
    console.log(`User: ${user.displayName} (${user.email})`);
    console.log(`Role: ${user.role}`);
    
    // Close connection
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setAdmin(); 