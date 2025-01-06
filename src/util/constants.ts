export const CONSTANTS = {
	ADMIN_TYPES: {
		superAdmin: 'super-admin',
		financeAdmin: 'finance-admin',
		approverAdmin: 'approver-admin',
		reporterAdmin: 'reporter-admin',
	},
	ADMIN_ACCESS: {
		DASHBOARD: 'dashboard',
		RIDES: 'rides',
		VEHICLES: 'vehicles',
		CUSTOMERS: 'customers',
		DRIVERS: 'drivers',
		CONFIGURATIONS: 'configurations',
		LOCATIONS: 'locations',
		ADMINS: 'admins',
	},
	LOG_TYPES: {
		user: {
			sendLoginCode: 'send-login-code',
			verifyLoginCode: 'verify-login-code',
			signup: 'sign-up',
		},
		admin: {
			signin: 'sign-in',
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
