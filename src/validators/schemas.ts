import Joi, { ObjectSchema } from 'joi';

const userSendPhoneVerificationValidation: ObjectSchema = Joi.object({
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

/***************************** Admin Validators ***********************/
const adminLogin: ObjectSchema = Joi.object({
	email: Joi.string().required().empty().messages({
		'string.pattern.base':
			'Please provide a valid email address in the correct format (e.g., user@example.com)',
		'string.empty': 'Email is required',
	}),
	password: Joi.string()
		.required()
		.pattern(/^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
		.messages({
			'string.pattern.base':
				'Password must be at least 8 characters long, contain at least one number, and one special character.',
			'string.empty': 'Password is required',
		}),
});

export default {
	'/user/send-phone-verification': userSendPhoneVerificationValidation,
	'/admin/login': adminLogin,
};
