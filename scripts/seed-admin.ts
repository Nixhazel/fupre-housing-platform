/**
 * Admin Seeding Script
 *
 * This script creates the initial admin user for the platform.
 * Run with: npm run seed:admin
 *
 * Default Admin Credentials:
 * - Email: admin@fuprehousing.com
 * - Password: 
 *
 * IMPORTANT: Change these credentials after first login!
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Admin credentials (change these in production!)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@fuprehousing.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123456';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Platform Staging Admin';
const ADMIN_PHONE = process.env.ADMIN_PHONE || '+2348123456789';

// MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
	console.error('❌ MONGODB_URI is not defined in .env.local');
	process.exit(1);
}

// User Schema (simplified for seeding)
const UserSchema = new mongoose.Schema(
	{
		email: { type: String, required: true, unique: true, lowercase: true },
		password: { type: String, required: true },
		name: { type: String, required: true },
		phone: { type: String },
		role: {
			type: String,
			enum: ['student', 'agent', 'owner', 'admin'],
			default: 'student'
		},
		isEmailVerified: { type: Boolean, default: false },
		isVerified: { type: Boolean, default: false },
		savedListingIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],
		savedRoommateIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RoommateListing' }],
		unlockedListingIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],
		isDeleted: { type: Boolean, default: false }
	},
	{ timestamps: true }
);

async function seedAdmin() {
	console.log('\n🌱 FUPRE Housing Platform - Admin Seeder\n');
	console.log('=' .repeat(50));

	try {
		// Connect to MongoDB
		console.log('📡 Connecting to MongoDB...');
		await mongoose.connect(MONGODB_URI);
		console.log('✅ Connected to MongoDB\n');

		// Get or create User model
		const User = mongoose.models.User || mongoose.model('User', UserSchema);

		// Check if admin already exists
		const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

		if (existingAdmin) {
			console.log('⚠️  Admin user already exists!');
			console.log(`   Email: ${ADMIN_EMAIL}`);
			console.log(`   Role: ${existingAdmin.role}`);
			console.log(`   Created: ${existingAdmin.createdAt}`);
			console.log('\n💡 If you need to reset the password, delete the user manually and run this script again.');
		} else {
			// Hash password
			console.log('🔐 Hashing password...');
			const salt = await bcrypt.genSalt(12);
			const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

			// Create admin user
			console.log('👤 Creating admin user...');
			const admin = await User.create({
				email: ADMIN_EMAIL,
				password: hashedPassword,
				name: ADMIN_NAME,
				phone: ADMIN_PHONE,
				role: 'admin',
				isEmailVerified: true, // Admin doesn't need email verification
				isVerified: true // Admin is automatically verified
			});

			console.log('\n✅ Admin user created successfully!\n');
			console.log('=' .repeat(50));
			console.log('📋 ADMIN CREDENTIALS');
			console.log('=' .repeat(50));
			console.log(`   Email:    ${ADMIN_EMAIL}`);
			console.log(`   Password: ${ADMIN_PASSWORD}`);
			console.log(`   Name:     ${ADMIN_NAME}`);
			console.log(`   ID:       ${admin._id}`);
			console.log('=' .repeat(50));
			console.log('\n⚠️  IMPORTANT: Change these credentials after first login!');
			console.log('   Go to Profile → Edit Profile to update your information.\n');
		}
	} catch (error) {
		console.error('\n❌ Error seeding admin:', error);
		process.exit(1);
	} finally {
		// Disconnect from MongoDB
		await mongoose.disconnect();
		console.log('📡 Disconnected from MongoDB');
		console.log('\n✨ Seeding complete!\n');
	}
}

// Run the seeder
seedAdmin();

