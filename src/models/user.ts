import mongoose, { Schema, Model, Document } from 'mongoose';
import bcrypt from 'bcrypt';

// Define the interface for User Personal Info
export interface UserPersonalInfo extends Document {
  name: string;
  email: string;
  password: string;
  referralCode?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Create the Mongoose schema
const userPersonalInfoSchema: Schema<UserPersonalInfo> = new mongoose.Schema(
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
    referralCode: {
      type: String,
      trim: true,
      maxlength: 10, // Optional referral code, maximum 10 characters
    },
  },
  { timestamps: true }
);

// Hash the password before saving
userPersonalInfoSchema.pre('save', async function (next) {
  const user = this as UserPersonalInfo;

  if (!user.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10); // Generate salt
    user.password = await bcrypt.hash(user.password, salt); // Hash the password
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userPersonalInfoSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create the Model
const UserPersonalInfoModel: Model<UserPersonalInfo> = mongoose.model<UserPersonalInfo>(
  'UserPersonalInfo',
  userPersonalInfoSchema
);

export default UserPersonalInfoModel;
