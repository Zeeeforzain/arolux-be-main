import Joi, { ObjectSchema } from 'joi';

const userSendLoginVerificationValidation: ObjectSchema = Joi.object({
	countryCode: Joi.string()
		.required()
		.trim()
		.empty()
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
	deviceType: Joi.string()
		.optional()
		.allow(null, '')
		.trim()
		.valid('android', 'ios')
		.messages({
			'string.base': 'Device type must be a string',
		}),
	deviceToken: Joi.string().optional().allow(null, '').trim().messages({
		'string.base': 'Device token must be a string',
	}),
});

const userVerifyLoginVerificationValidation: ObjectSchema = Joi.object({
	countryCode: Joi.string()
		.required()
		.empty()
		.trim()
		.pattern(/^\+\d{1,4}$/)
		.messages({
			'string.pattern.base':
				'Country code must start with "+" followed by 1-4 digits.',
			'string.empty': 'Country code is required',
		}),
	phoneNumber: Joi.string()
		.required()
		.empty()
		.trim()
		.pattern(/^\d{7,15}$/)
		.messages({
			'string.pattern.base': 'Phone number must contain 7-15 digits.',
			'string.empty': 'Phone number is required',
		}),
	deviceType: Joi.string()
		.optional()
		.allow(null, '')
		.valid('android', 'ios')
		.messages({
			'string.base': 'Device type must be a string',
		}),
	deviceToken: Joi.string().optional().allow(null, '').messages({
		'string.base': 'Device token must be a string',
	}),
	code: Joi.string().required().empty().messages({
		'string.empty': 'Verification code is required',
	}),
});

const userSignupValidation: ObjectSchema = Joi.object({
	countryCode: Joi.string()
		.required()
		.empty()
		.trim()
		.pattern(/^\+\d{1,4}$/)
		.messages({
			'string.pattern.base':
				'Country code must start with "+" followed by 1-4 digits.',
			'string.empty': 'Country code is required',
		}),
	phoneNumber: Joi.string()
		.required()
		.empty()
		.trim()
		.pattern(/^\d{7,15}$/)
		.messages({
			'string.pattern.base': 'Phone number must contain 7-15 digits.',
			'string.empty': 'Phone number is required',
		}),
	deviceType: Joi.string()
		.optional()
		.allow(null, '')
		.valid('android', 'ios')
		.messages({
			'string.base': 'Device type must be a string',
		}),
	deviceToken: Joi.string().optional().allow(null, '').messages({
		'string.base': 'Device token must be a string',
	}),
	code: Joi.string().required().empty().trim().messages({
		'string.empty': 'Verification code is required',
	}),
	name: Joi.string()
		.required()
		.empty()
		.trim()
		.pattern(/^[a-zA-Z\s\-']{3,50}$/)
		.messages({
			'string.pattern.base': 'Name must contain 3-50 characters.',
			'string.empty': 'Name is required',
			'string.required': 'Name is required',
		}),
	email: Joi.string().empty().lowercase().trim().email().required().messages({
		'string.empty': 'Email is required',
	}),
	referralCode: Joi.string().lowercase().trim().optional().allow(null, ''),
	profileImageURL: Joi.string().uri().trim().optional().allow(null, ''),
});

/***************************** Admin Validators ***********************/
const adminLogin: ObjectSchema = Joi.object({
	email: Joi.string().required().email({ minDomainSegments: 2 }).messages({
		'string.pattern.base': 'Please provide a valid email address in the correct format (e.g., user@example.com)',
		'string.empty': 'Email is required',
		'string.email': 'Please provide a valid email address in the correct format (e.g., user@example.com)',
	}),
	password: Joi.string()
		.required()
		.messages({
			'string.empty': 'Password is required',
		}),
});

export default {
	'/user/send-login-verification': userSendLoginVerificationValidation,
	'/user/verify-login-verification': userVerifyLoginVerificationValidation,
	'/user/sign-up': userSignupValidation,

	'/admin/login': adminLogin,
};
