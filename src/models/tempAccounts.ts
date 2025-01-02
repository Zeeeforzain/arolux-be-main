import mongoose, { Schema, model } from 'mongoose';

// Define the type for tempAccounts input
export interface ITempAccount {
	countryCode: string;
	phoneNumber: string;
	verificationCode: string;
	verificationCodeExpiryTime: Date;
	isVerified?: boolean; // Optional field for future verification status
	deviceType: string;
	deviceToken: string;
}

// Create the Mongoose schema
const tempAccountsSchema: Schema = new mongoose.Schema(
	{
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
		verificationCode: {
			type: String,
			default: null,
		},
		verificationCodeExpiryTime: {
			type: Date,
			default: null,
		},
		isVerified: {
			type: Boolean,
			default: false, // Indicates if the phone number is verified
		},
		deviceType: {
			type: String,
			default: null,
		},
		deviceToken: {
			type: String,
			default: null,
		},
	},
	{ timestamps: true }
);

// Create the Model
const TempAccounts = model<ITempAccount>('tempAccounts', tempAccountsSchema);

export default TempAccounts;
