import { Response, NextFunction } from 'express';
import { sendResponse, verifyJWTToken } from '../../util/utilities.js';
import User from '../../models/user.js';
import Admin from '../../models/admin.js';
import { saveErrorLog } from './errorLog.middleware.js';

interface IJWTPayload {
	_id: string;
	email: string;
	type?: string;
	adminId?: string;
}

export const auth = async (req: any, res: Response, next: NextFunction) => {
	try {
		const { authorization = '' } = req.headers;

		if (!authorization || authorization === '') {
			return sendResponse(res, {
				statusCode: 401,
				success: false,
				message: 'Access restricted',
				data: {},
			});
		}

		const jwtDecoded = verifyJWTToken(authorization) as IJWTPayload;

		const user = await User.findOne(
			{
				_id: jwtDecoded._id,
				email: jwtDecoded.email,
			},
			{
				email: 1,
				alternateEmail: 1,
				firstName: 1,
				lastName: 1,
				addressDetails: 1,
				dateOfBirth: 1,
				bankInfo: 1,
				recurlyCode: 1,
				profileImage: 1,
				preferredLanguage: 1,
				countryId: 1,
				city: 1,
				state: 1,
				phoneNumber: 1,
				recentEmailVerificationRequestedTime: 1,
				isEmailVerified: 1,
				isPhoneVerified: 1,
				status: 1,
				googleId: 1,
				facebookId: 1,
				appleId: 1,
				isAutoApprovalEnabled: 1,
			}
		).lean();

		if (!user) {
			return sendResponse(res, {
				statusCode: 401,
				success: false,
				message: 'Invalid access',
				data: {},
			});
		} else if (user.status === 'inActive') {
			return sendResponse(res, {
				statusCode: 401,
				success: false,
				message:
					'Your account has been deactivated by the admin. Please contact support.',
				data: {},
			});
		}

		Object.assign(req, {
			user: {
				...user,
				loginAs: jwtDecoded.type === 'admin' ? 'admin' : 'user',
				adminId: jwtDecoded.adminId,
			},
		});

		next();
	} catch (err: any) {
		saveErrorLog({
			endpoint: req.originalUrl,
			params: Object.assign({
				urlParams: req.params,
				queryParams: req.query,
				bodyParams: req.body,
			}),
			errDetails: err,
			userId: req.user ? req.user._id : null,
			adminId: null,
		});

		return sendResponse(res, {
			statusCode: 401,
			success: false,
			message: 'Invalid access',
			data: {},
		});
	}
};

export const optionalUserAuth = async (
	req: any,
	res: Response,
	next: NextFunction
) => {
	try {
		const { authorization = '' } = req.headers;

		if (!authorization || authorization === '') {
			return next();
		}

		const jwtDecoded = verifyJWTToken(authorization) as IJWTPayload;

		const user = await User.findOne(
			{
				_id: jwtDecoded._id,
				email: jwtDecoded.email,
			},
			{
				email: 1,
				alternateEmail: 1,
				firstName: 1,
				lastName: 1,
				addressDetails: 1,
				dateOfBirth: 1,
				bankInfo: 1,
				preferredLanguage: 1,
				countryId: 1,
				city: 1,
				state: 1,
				recurlyCode: 1,
				recentEmailVerificationRequestedTime: 1,
				status: 1,
			}
		).lean();

		if (!user) {
			return sendResponse(res, {
				statusCode: 401,
				success: false,
				message: 'Invalid access',
				data: {},
			});
		} else if (user.status === 'inActive') {
			return sendResponse(res, {
				statusCode: 401,
				success: false,
				message:
					'Your account has been deactivated by the admin. Please contact support.',
				data: {},
			});
		}

		Object.assign(req, {
			user: {
				...user,
				loginAs: jwtDecoded.type === 'admin' ? 'admin' : 'user',
				adminId: jwtDecoded.adminId,
			},
		});

		next();
	} catch (err: any) {
		saveErrorLog({
			endpoint: req.originalUrl,
			params: Object.assign({
				urlParams: req.params,
				queryParams: req.query,
				bodyParams: req.body,
			}),
			errDetails: err,
			userId: req.user ? req.user._id : null,
			adminId: null,
		});

		return sendResponse(res, {
			statusCode: 401,
			success: false,
			message: 'Invalid access',
			data: {},
		});
	}
};

export const adminAuth = async (
	req: any,
	res: Response,
	next: NextFunction
) => {
	try {
		const { authorization = '' } = req.headers;

		if (!authorization || authorization === '') {
			return sendResponse(res, {
				statusCode: 401,
				success: false,
				message: 'Access restricted',
				data: {},
			});
		}

		const jwtDecoded = verifyJWTToken(authorization) as IJWTPayload;

		const user = await Admin.findOne(
			{
				_id: jwtDecoded._id,
				email: jwtDecoded.email,
			},
			{
				email: 1,
				firstName: 1,
				lastName: 1,
				adminType: 1,
				isActive: 1,
			}
		);

		if (!user) {
			return sendResponse(res, {
				statusCode: 401,
				success: false,
				message: 'Invalid access',
				data: {},
			});
		} else if (!user.isActive) {
			return sendResponse(res, {
				statusCode: 401,
				success: false,
				message:
					'Your account has been deactivated by the admin. Please contact support.',
				data: {},
			});
		}

		Object.assign(req, {
			user,
		});
		next();
	} catch (err: any) {
		saveErrorLog({
			endpoint: req.originalUrl,
			params: Object.assign({
				urlParams: req.params,
				queryParams: req.query,
				bodyParams: req.body,
			}),
			errDetails: err,
			userId: null,
			adminId: req.user ? req.user._id : null,
		});

		return sendResponse(res, {
			statusCode: 401,
			success: false,
			message: 'Invalid access',
			data: {},
		});
	}
};

export const commonAuth = async (
	req: any,
	res: Response,
	next: NextFunction
) => {
	try {
		const { authorization = '' } = req.headers;

		if (!authorization || authorization === '') {
			return sendResponse(res, {
				statusCode: 401,
				success: false,
				message: 'Access restricted',
				data: {},
			});
		}

		const jwtDecoded = verifyJWTToken(authorization) as IJWTPayload;

		let user: any = await Admin.findOne(
			{
				_id: jwtDecoded._id,
				email: jwtDecoded.email,
			},
			{
				email: 1,
				firstName: 1,
				lastName: 1,
				isActive: 1,
			}
		);

		if (user && !user.isActive) {
			return sendResponse(res, {
				statusCode: 401,
				success: false,
				message:
					'Your account has been deactivated by the admin. Please contact support.',
				data: {},
			});
		}

		if (!user) {
			user = await User.findOne(
				{
					_id: jwtDecoded._id,
					email: jwtDecoded.email,
				},
				{
					email: 1,
					alternateEmail: 1,
					firstName: 1,
					lastName: 1,
					addressDetails: 1,
					dateOfBirth: 1,
					bankInfo: 1,
					status: 1,
				}
			);
		}

		if (!user) {
			return sendResponse(res, {
				statusCode: 401,
				success: false,
				message: 'Invalid access',
				data: {},
			});
		} else if (user.status === 'inActive') {
			return sendResponse(res, {
				statusCode: 401,
				success: false,
				message:
					'Your account has been deactivated by the admin. Please contact support.',
				data: {},
			});
		}

		Object.assign(req, {
			user,
		});
		next();
	} catch (err: any) {
		saveErrorLog({
			endpoint: req.originalUrl,
			params: Object.assign({
				urlParams: req.params,
				queryParams: req.query,
				bodyParams: req.body,
			}),
			errDetails: err,
			userId: null,
			adminId: null,
		});

		return sendResponse(res, {
			statusCode: 401,
			success: false,
			message: 'Invalid access',
			data: {},
		});
	}
};

export const restrictAdminLoginAsAUserAccess = async (
	req: any,
	res: Response,
	next: NextFunction
) => {
	if (req.user && req.user.loginAs === 'admin') {
		return sendResponse(res, {
			statusCode: 403,
			success: false,
			message: 'You are not allowed to perform this action',
			data: {},
		});
	}
	return next();
};

export const isLoggedInAdminAllowedToPerformOperation = (
	permissions: string[]
) => {
	return async (req: any, res: any, next: any) => {
		try {
			if (req.user.loginAs === 'admin' && req.user.adminId) {
				const adminDetails = await Admin.findOne(
					{
						_id: req.user.adminId,
					},
					{
						adminType: 1,
					}
				);

				if (!adminDetails) {
					return sendResponse(res, {
						statusCode: 403,
						success: false,
						message: 'Not authorized.',
						data: {},
					});
				}

				const isRoleFound = permissions.find((permission: string) => {
					return permission === adminDetails.adminType;
				});

				if (!isRoleFound) {
					return sendResponse(res, {
						statusCode: 403,
						success: false,
						message: 'Not authorized.',
						data: {},
					});
				}
			}

			next();
		} catch (err: any) {
			saveErrorLog({
				endpoint: req.originalUrl,
				params: Object.assign({
					urlParams: req.params,
					queryParams: req.query,
					bodyParams: req.body,
				}),
				errDetails: err,
				userId: req.user ? req.user._id : null,
				adminId: null,
			});

			return sendResponse(res, {
				statusCode: 500,
				success: false,
				message: 'Error occurred. Please try again later.',
				data: {},
			});
		}
	};
};
