import mongoose, { Schema, Model, Document } from 'mongoose';
import bcrypt from 'bcrypt';

// Define the interface for User Personal Info
export interface UserPersonalInfo extends Document {
	name: string;
	email: string;
	password: string;
	referralCode?: string;
	countryCode: string;
	phoneNumber: string;
	isVerified?: boolean;
	comparePassword(candidatePassword: string): Promise<boolean>;
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
		password: {
			type: String,
			required: true,
			minlength: 8, // Enforces a minimum password length
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

// Hash the password before saving
userAccountsSchema.pre('save', async function (next) {
	const user = this as UserPersonalInfo;

	if (!user.isModified('password')) {
		return next();
	}

	try {
		const salt = await bcrypt.genSalt(10); // Generate salt
		user.password = await bcrypt.hash(user.password, salt); // Hash the password
		next();
	} catch (error: any) {
		next(error);
	}
});

// Method to compare passwords
userAccountsSchema.methods.comparePassword = async function (
	candidatePassword: string
): Promise<boolean> {
	return await bcrypt.compare(candidatePassword, this.password);
};

// Create the Model
const UserPersonalInfoModel: Model<UserPersonalInfo> =
	mongoose.model<UserPersonalInfo>('userAccounts', userAccountsSchema);

export default UserPersonalInfoModel;
