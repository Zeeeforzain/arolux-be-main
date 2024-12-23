import Joi, { ObjectSchema } from 'joi';
// import { CONSTANTS } from '../util/constants'; // Assuming you have this import
// import { JoiObjectId } from '../util/utilities'; // Assuming this is used for ObjectId validation if needed

const PASSWORD_REGEX = new RegExp(
	'^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!.@#$%^&*])[A-Za-z0-9!.@#$%^&*]{8,}$' // Minimum 8 characters, with at least one lowercase, one uppercase, one number, and one special character
);

// User signup validation schema
const userSignupValidation: ObjectSchema = Joi.object({
	firstName: Joi.string().required().trim().min(2).max(50).messages({
		'string.base': 'First name must be a string',
		'string.empty': 'First name is required',
		'string.min': 'First name must be at least 2 characters long',
		'string.max': 'First name must not exceed 50 characters',
	}),
	lastName: Joi.string().required().trim().min(2).max(50).messages({
		'string.base': 'Last name must be a string',
		'string.empty': 'Last name is required',
		'string.min': 'Last name must be at least 2 characters long',
		'string.max': 'Last name must not exceed 50 characters',
	}),
	email: Joi.string().required().email().trim().lowercase().messages({
		'string.email': 'Email must be a valid email address',
		'string.required': 'Email is required',
	}),
	password: Joi.string()
		.required()
		.pattern(PASSWORD_REGEX)
		.max(100)
		.messages({
			'string.pattern.base':
				'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
			'string.empty': 'Password is required',
			'string.max': 'Password must not exceed 100 characters',
		}),
	referralCode: Joi.string().trim().max(10).optional().messages({
		'string.base': 'Referral code must be a string',
		'string.max': 'Referral code cannot be longer than 10 characters',
	}),
});

const userLoginValidation: ObjectSchema = Joi.object({
	countryCode: Joi.string()
		.required()
		.pattern(/^\+\d{1,4}$/)
		.messages({
			'string.pattern.base':
				'Country code must start with "+" followed by 1-4 digits.',
			'string.empty': 'Country code is required',
		}),
	phoneNumber: Joi.string()
		.required()
		.pattern(/^\d{7,15}$/)
		.messages({
			'string.pattern.base': 'Phone number must contain 7-15 digits.',
			'string.empty': 'Phone number is required',
		}),
	deviceType: Joi.string().required().messages({
		'string.base': 'Device type must be a string',
		'string.empty': 'Device type is required',
	}),
	deviceToken: Joi.string().required().messages({
		'string.base': 'Device token must be a string',
		'string.empty': 'Device token is required',
	}),
});

// User email verification validation schema
const sendEmailVerificationValidation: ObjectSchema = Joi.object({
	email: Joi.string().required().email().trim().lowercase().messages({
		'string.email': 'Email must be a valid email address',
		'string.required': 'Email is required',
	}),
});

// User email verification confirmation validation schema
const confirmUserEmailVerificationValidation: ObjectSchema = Joi.object({
	token: Joi.string().required().trim().messages({
		'string.empty': 'Token is required',
	}),
});

// Signup schema for country code and phone number validation
const userSignupPhoneValidation: ObjectSchema = Joi.object({
	countryCode: Joi.string()
		.required()
		.pattern(/^\+\d{1,4}$/)
		.messages({
			'string.pattern.base':
				'Country code must start with "+" followed by 1-4 digits.',
			'string.empty': 'Country code is required',
		}),
	phoneNumber: Joi.string()
		.required()
		.pattern(/^\d{7,15}$/)
		.messages({
			'string.pattern.base': 'Phone number must contain 7-15 digits.',
			'string.empty': 'Phone number is required',
		}),
	isVerified: Joi.boolean().optional(),
});

export default {
	'/user/signup': userSignupValidation,
	'/user/login': userLoginValidation,
	'/user/email-verification': sendEmailVerificationValidation,
	'/user/confirm-email-verification': confirmUserEmailVerificationValidation,
	'/user/signup-phone': userSignupPhoneValidation, // This is for the phone and country code validation
};
