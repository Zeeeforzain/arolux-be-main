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
const createNewAdminAccount: ObjectSchema = Joi.object({
	name: Joi.string().empty().required().messages({
		'string.empty': 'Please Enter Name',
	}),
	email: Joi.string().required().empty().email({ minDomainSegments: 2 }).messages({
		'string.pattern.base': 'Please provide a valid email address in the correct format (e.g., user@example.com)',
		'string.empty': 'Email is required',
		'string.email': 'Please provide a valid email address in the correct format (e.g., user@example.com)',
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
	password: Joi.string()
		.required()
		.empty()
		.messages({
			'string.empty': 'Password is required',
		}),
	confirmPassword: Joi.string()
		.valid(Joi.ref('password'))
		.required()
		.messages({
			'string.empty': 'Confirm Password is required',
			'any.only': 'Passwords do not match',
		}),
	adminType: Joi.string()
		.valid('superAdmin', 'subAdmin') // You can add more roles if needed
		.required()
		.messages({
			'string.empty': 'Admin Type is required',
			'any.only': 'Role must be either "superAdmin" or "subAdmin"',
		}),
	permissions: Joi.object().when('adminType', {
		is: 'subAdmin', // Only validate permissions if the role is subAdmin
		then: Joi.object({
			dashboard: Joi.boolean().required(),
			rides: Joi.boolean().required(),
			vehicles: Joi.boolean().required(),
			locations: Joi.boolean().required(),
			drivers: Joi.boolean().required(),
			customers: Joi.boolean().required(),
			configurations: Joi.boolean().required(),
			admins: Joi.boolean().required(),
		}).messages({
			'object.base': 'Permissions are required for subAdmin role.',
		}),
		otherwise: Joi.forbidden(), // Permissions should not be passed for non-subAdmin roles
	}),
});

export default {
	'/user/send-login-verification': userSendLoginVerificationValidation,
	'/user/verify-login-verification': userVerifyLoginVerificationValidation,
	'/user/sign-up': userSignupValidation,

	'/admin/login': adminLogin,
	'/admin/create-admin-account': createNewAdminAccount,
};
