import mongoose, { Schema, Model, Document } from 'mongoose';

// Define the interface for User Personal Info
export interface UserPersonalInfo extends Document {
	name: string;
	email: string;
	referralCode?: string;
	countryCode: string;
	phoneNumber: string;
	deviceType: string;
	deviceToken: string;
	isVerified?: boolean;
}

// Create the Mongoose schema
const userAccountsSchema: Schema<UserPersonalInfo> = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			minlength: 2,
			maxlength: 50, // Validates name length
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Validates email format
		},
		countryCode: {
			type: String,
			required: true,
			match: /^\+\d{1,4}$/, // Validates country code (e.g., +1, +91)
			trim: true,
		},
		phoneNumber: {
			type: String,
			required: true,
			match: /^\d{7,15}$/, // Validates phone number (7-15 digits)
			unique: true, // Ensures phone number is unique
			trim: true,
		},
		deviceType: {
			type: String,
			default: null,
		},
		deviceToken: {
			type: String,
			default: null,
		},
		isVerified: {
			type: Boolean,
			default: false, // Indicates if the phone number is verified
		},
		referralCode: {
			type: String,
			trim: true,
			maxlength: 10, // Optional referral code, maximum 10 characters
		},
	},
	{ timestamps: true }
);

// Create the Model
const UserPersonalInfoModel: Model<UserPersonalInfo> =
	mongoose.model<UserPersonalInfo>('userAccounts', userAccountsSchema);

export default UserPersonalInfoModel;
