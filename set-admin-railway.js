// Script to set admin user for Railway deployment
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');

const ADMIN_EMAIL = 'nigamshashank@gmail.com';

async function setAdmin() {
  try {
    // Connect to Railway MongoDB - try different possible env var names
    const mongoUri = process.env.MONGO_PUBLIC_URL || 
                     process.env.MONGO_URL || 
                     process.env.MONGODB_URI ||
                     process.env.DATABASE_URL;
    
    if (!mongoUri) {
      console.log('❌ No MongoDB URI found in environment variables');
      console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('MONGO') || key.includes('DATABASE')));
      console.log('Please set MONGO_PUBLIC_URL, MONGO_URL, MONGODB_URI, or DATABASE_URL');
      process.exit(1);
    }
    
    console.log('🔗 Connecting to Railway MongoDB...');
    console.log('Using URI:', mongoUri.substring(0, 20) + '...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to Railway MongoDB');
    
    // Find user by email
    console.log(`🔍 Looking for user: ${ADMIN_EMAIL}`);
    const user = await User.findOne({ email: ADMIN_EMAIL });
    
    if (!user) {
      console.log('❌ User not found!');
      console.log('Make sure you have logged in at least once with this email on Railway');
      console.log('Available users in database:');
      const allUsers = await User.find({}, 'email role');
      allUsers.forEach(u => console.log(`- ${u.email} (role: ${u.role || 'user'})`));
      process.exit(1);
    }
    
    console.log('✅ User found:', user.displayName);
    console.log('Current role:', user.role || 'user');
    
    if (user.role === 'admin') {
      console.log('✅ User is already admin!');
      process.exit(0);
    }
    
    // Update user to admin
    user.role = 'admin';
    await user.save();
    
    console.log('✅ Successfully set user as admin!');
    console.log('User:', user.displayName);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

setAdmin(); 