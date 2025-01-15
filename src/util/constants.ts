export const CONSTANTS = {
	ADMIN_TYPES: {
		superAdmin: 'super-admin',
		subAdmin:'sub-admin'
	},
	ADMIN_ACCESS: {
		dashboard: 'dashboard',
		rides: 'rides',
		vehicles: 'vehicles',
		customers: 'customers',
		drivers: 'drivers',
		configurations: 'configurations',
		locations: 'locations',
		admins: 'admins',
	},
	LOG_TYPES: {
		user: {
			sendLoginCode: 'send-login-code',
			verifyLoginCode: 'verify-login-code',
			signup: 'sign-up',
		},
		admin: {
			signin: 'sign-in',
			signout: 'sign-out',
			adminAccountCreated: 'admin-account-created',
			adminAccountUpdated: 'admin-account-updated',
			configurationUpdated: 'configuration-updated',
			countryUpdated: 'country-updated',
		},
	},
	VERIFICATION_CODE_EXPIRY_TIME_IN_MINUTES: 60,
	USER_PROFILE_STATUSES: {
		active: 'active',
		blocked: 'blocked',
	},
	S3_FILE_TYPES: {
		profileImage: 'profile-image',
	},
	S3_IMAGE_DIRECTORIES: {
		profileImages: 'profile-images',
	},
};
