import mongoose, { Schema, Model, Document } from 'mongoose';
import { CONSTANTS } from '../util/constants.js';

// Define the interface for User Personal Info
export interface UserPersonalInfo extends Document {
	name: string;
	email: string;
	referralCode?: string;
	countryCode: string;
	phoneNumber: string;
	profileImageURL: string;
	verificationCode: string;
	verificationCodeExpiryTime: Date;
	deviceType: string;
	deviceToken: string;
	status: string;
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
		profileImageURL: {
			type: String,
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
		deviceType: {
			type: String,
			default: null,
		},
		deviceToken: {
			type: String,
			default: null,
		},
		referralCode: {
			type: String,
			trim: true,
			maxlength: 10, // Optional referral code, maximum 10 characters
		},
		status: {
			type: String,
			default: CONSTANTS.USER_PROFILE_STATUSES.active,
			enum: CONSTANTS.USER_PROFILE_STATUSES,
		},
	},
	{ timestamps: true }
);

// Create the Model
const UserPersonalInfoModel: Model<UserPersonalInfo> =
	mongoose.model<UserPersonalInfo>('userAccounts', userAccountsSchema);

export default UserPersonalInfoModel;
