import mongoose, { Schema, model } from 'mongoose';

// Define the type for tempAccounts input
export interface tempAccounts {
	countryCode: string;
	phoneNumber: string;
	isVerified?: boolean; // Optional field for future verification status
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
		isVerified: {
			type: Boolean,
			default: false, // Indicates if the phone number is verified
		},
	},
	{ timestamps: true }
);

// Create the Model
const tempAccounts = model<tempAccounts>('tempAccounts', tempAccountsSchema);

export default tempAccounts;
