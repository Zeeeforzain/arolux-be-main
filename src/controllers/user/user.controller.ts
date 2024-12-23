/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable indent */
import { Response, NextFunction, RequestHandler } from 'express';
import dayjs from 'dayjs';
import { sendEmail } from '../../services/emailNotification/sendgrid.js';

import User from '../../models/userAccounts.js';

import Configuration from '../../models/configuration.js';
import { CONSTANTS } from '../../util/constants.js';

import {
	sendResponse,
	comparePassword,
	generateRandomToken,
	hashPassword,
	fetchAccessAndRefreshToken,
	verifyJWTRefreshToken,
} from '../../util/utilities.js';
import { saveActionLog } from '../../middlewares/common/actionLog.middleware.js';
import { saveErrorLog } from '../../middlewares/common/errorLog.middleware.js';
import { ObjectId } from 'mongoose';

interface IJWTPayload {
	_id: ObjectId;
	email: string;
	type?: string;
	adminId?: ObjectId;
}

export const userSignup = async (
	req: any,
	res: Response,
	next: NextFunction
) => {
	try {
		const { firstName, lastName, email, password } = req.body;

		const configurations = await Configuration.findOne(
			{},
			{
				emailVerificationExpiryTimeInMinutes: 1,
			}
		);

		// create a random token and updates it in user data
		const randomToken = generateRandomToken('Aa0', 32);

		const user = new User({
			firstName,
			lastName,
			email,
			password,
			emailVerificationToken: randomToken,
			recentEmailVerificationRequestedTime: new Date(),
			recentEmailVerificationExpiryTime: dayjs().add(
				configurations?.emailVerificationExpiryTimeInMinutes || 0,
				'minutes'
			),
			lastLoginTime: new Date(),
		});

		const result = await user.save();

		if (!result) {
			return sendResponse(res, {
				statusCode: 500,
				success: false,
				message: 'Error occurred in user sign up.',
				data: {},
			});
		}

		const { accessToken, refreshToken } = await fetchAccessAndRefreshToken({
			_id: result._id,
			email,
		});

		sendEmail({
			to: email,
			from: { email: '' },
			subject: 'Welcome to Arolux.com',
			html: CONSTANTS.EMAIL_TEMPLATES.signup
				.replace('@RANDOM_TOKEN', randomToken)
				.replace('@USER_NAME', `${firstName} ${lastName}`),
			//`Welcome to Arolux.com! We are thrilled to have you on board and appreciate your trust in us. Please click on the following link to verify your email ${process.env.EMAIL_VERIFICATION_REDIRECTION_LINK}?token=${randomToken}`,
		});

		await saveActionLog({
			logType: CONSTANTS.LOG_TYPES.user.signup,
			details: {},
			userId: result._id,
			adminId: null,
			campaignId: null,
		});

		return sendResponse(res, {
			statusCode: 200,
			success: true,
			message: 'Success',
			data: {
				firstName: firstName,
				lastName: lastName,
				accessToken,
				refreshToken,
			},
		});
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

		next(err);
	}
};

export const sendUserEmailVerification = async (
	req: any,
	res: Response,
	next: NextFunction
) => {
	try {
		const configurations = await Configuration.findOne(
			{},
			{
				_id: 1,
				emailVerificationIntervalSecs: 1,
				emailVerificationExpiryTimeInMinutes: 1,
			}
		);

		const allowedTime = dayjs(
			req.user.recentEmailVerificationRequestedTime || null
		).add(configurations?.emailVerificationIntervalSecs || 0, 'seconds');

		if (
			req.user.recentEmailVerificationRequestedTime &&
			allowedTime.isAfter(dayjs())
		) {
			return sendResponse(res, {
				statusCode: 400,
				success: false,
				message:
					'We have already sent the email. Please wait a while to try again.',
				data: {},
			});
		}

		// create a random token and updates it in user data
		const randomToken = generateRandomToken('Aa0', 32);

		const userUpdated = await User.updateOne(
			{
				_id: req.user._id,
			},
			{
				$set: {
					emailVerificationToken: randomToken,
					recentEmailVerificationRequestedTime: new Date(),
					recentEmailVerificationExpiryTime: dayjs().add(
						configurations?.emailVerificationExpiryTimeInMinutes ||
							0,
						'minutes'
					),
				},
			}
		);

		if (!userUpdated) {
			return sendResponse(res, {
				statusCode: 500,
				success: false,
				message: 'Error occurred in sending email verification.',
				data: {},
			});
		}

		sendEmail({
			to: req.user.email,
			from: { email: '' },
			subject: 'Email Verification Required!',
			html: CONSTANTS.EMAIL_TEMPLATES.verifyEmail
				.replace('@RANDOM_TOKEN', randomToken)
				.replace(
					'@USER_NAME',
					`${req.user.firstName} ${req.user.lastName}`
				),
			// html: `Please use following link to verify your email address: ${process.env.EMAIL_VERIFICATION_REDIRECTION_LINK}?token=${randomToken}`,
		});

		return sendResponse(res, {
			statusCode: 200,
			success: true,
			message: 'Success',
			data: {},
		});
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

		next(err);
	}
};

//this will be used when user is logged out
export const sendEmailVerification = async (
	req: any,
	res: Response,
	next: NextFunction
) => {
	try {
		const { email } = req.body;

		const userFound = await User.findOne(
			{
				email,
			},
			{
				firstName: 1,
				lastName: 1,
				recentEmailVerificationRequestedTime: 1,
			}
		);

		if (!userFound) {
			return sendResponse(res, {
				statusCode: 400,
				success: false,
				message: 'Email address does not exist.',
				data: {},
			});
		}

		const configurations = await Configuration.findOne(
			{},
			{
				_id: 1,
				emailVerificationIntervalSecs: 1,
				emailVerificationExpiryTimeInMinutes: 1,
			}
		);

		const allowedTime = dayjs(
			userFound.recentEmailVerificationRequestedTime || null
		).add(configurations?.emailVerificationIntervalSecs || 0, 'seconds');

		if (
			userFound.recentEmailVerificationRequestedTime &&
			allowedTime.isAfter(dayjs())
		) {
			return sendResponse(res, {
				statusCode: 400,
				success: false,
				message:
					'We have already sent the email. Please wait a while to try again.',
				data: {},
			});
		}

		// create a random token and updates it in user data
		const randomToken = generateRandomToken('Aa0', 32);

		const userUpdated = await User.updateOne(
			{
				_id: userFound._id,
			},
			{
				$set: {
					emailVerificationToken: randomToken,
					recentEmailVerificationRequestedTime: new Date(),
					recentEmailVerificationExpiryTime: dayjs().add(
						configurations?.emailVerificationExpiryTimeInMinutes ||
							0,
						'minutes'
					),
				},
			}
		);

		if (!userUpdated) {
			return sendResponse(res, {
				statusCode: 500,
				success: false,
				message: 'Error occurred in sending email verification.',
				data: {},
			});
		}

		sendEmail({
			to: email,
			from: { email: '' },
			subject: 'Email Verification Required!',
			html: CONSTANTS.EMAIL_TEMPLATES.verifyEmail
				.replace('@RANDOM_TOKEN', randomToken)
				.replace(
					'@USER_NAME',
					`${userFound.firstName} ${userFound.lastName}`
				),
			// html: `Please use following link to verify your email address: ${process.env.EMAIL_VERIFICATION_REDIRECTION_LINK}?token=${randomToken}`,
		});

		return sendResponse(res, {
			statusCode: 200,
			success: true,
			message: 'Success',
			data: {},
		});
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

		next(err);
	}
};

export const testPostRequest = async (
	req: any,
	res: Response,
	next: NextFunction
) => {
	try {
		return sendResponse(res, {
			statusCode: 200,
			success: true,
			message: 'Success',
			data: {
				bodyParams: req.body,
			},
		});
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

		next(err);
	}
};

export const verifyEmail = async (
	req: any,
	res: Response,
	next: NextFunction
) => {
	try {
		const { token } = req.body;

		// Fetch user data related to token
		const user = await User.findOne(
			{
				emailVerificationToken: token,
			},
			{
				_id: 1,
				email: 1,
				recentEmailVerificationExpiryTime: 1,
			}
		);

		if (!user) {
			return sendResponse(res, {
				statusCode: 400,
				success: false,
				message: 'Invalid/expired email verification link',
				data: {},
			});
		}

		if (dayjs(user.recentEmailVerificationExpiryTime).isBefore(dayjs())) {
			return sendResponse(res, {
				statusCode: 400,
				success: false,
				message: 'Invalid/expired email verification link',
				data: {},
			});
		}

		const userUpdated = await User.updateOne(
			{
				_id: user._id,
			},
			{
				$set: {
					isEmailVerified: true,
					recentEmailVerificationTime: new Date(),
					emailVerificationToken: '',
					recentEmailVerificationRequestedTime: null,
					recentEmailVerificationExpiryTime: null,
				},
			}
		);

		if (!userUpdated) {
			return sendResponse(res, {
				statusCode: 500,
				success: false,
				message: 'Error occurred in email verification.',
				data: {},
			});
		}

		await saveActionLog({
			logType: CONSTANTS.LOG_TYPES.user.emailAddressVerified,
			details: {
				email: user.email,
			},
			userId: user._id,
			adminId: null,
			campaignId: null,
		});

		return sendResponse(res, {
			statusCode: 200,
			success: true,
			message: 'Email verified successfully',
			data: {},
		});
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

		next(err);
	}
};

export const userLogin = async (
	req: any,
	res: Response,
	next: NextFunction
) => {
	try {
		const { countryCode, phoneNumber, deviceType, deviceToken } = req.body;

		if (req.userRecord) {
			// Already Registered, just create a random code of 4 digits and send to user over phone number and email
		} else {
			// Create new record in user accounts and create a random code of 4 digits and send to user over phone number
		}

		// await saveActionLog({
		// 	logType: CONSTANTS.LOG_TYPES.user.signin,
		// 	details: {},
		// 	userId: user._id,
		// 	adminId: null,
		// 	campaignId: null,
		// });

		return sendResponse(res, {
			statusCode: 200,
			success: true,
			message: 'Success',
			data: {
				// firstName: user.firstName,
				// lastName: user.lastName,
				// accessToken,
				// refreshToken,
			},
		});
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

		next(err);
	}
};

export const userRefreshToken = async (req: any, res: Response) => {
	try {
		const { refreshToken } = req.body;

		const jwtDecoded = verifyJWTRefreshToken(refreshToken) as IJWTPayload;

		const { accessToken, refreshToken: newRefreshToken } =
			await fetchAccessAndRefreshToken({
				_id: jwtDecoded._id,
				email: jwtDecoded.email,
				type: jwtDecoded.type,
				adminId: jwtDecoded.adminId,
			});

		await saveActionLog({
			logType: CONSTANTS.LOG_TYPES.user.refreshToken,
			details: {},
			userId: jwtDecoded._id,
			adminId: null,
			campaignId: null,
		});

		return sendResponse(res, {
			statusCode: 200,
			success: true,
			message: 'Success',
			data: {
				accessToken,
				refreshToken: newRefreshToken,
			},
		});
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
			statusCode: 500,
			success: false,
			message: 'Error occurred. Please try again later.',
			data: {},
		});
	}
};

export const userLogout: RequestHandler = async (req: any, res, next) => {
	try {
		await saveActionLog({
			logType: CONSTANTS.LOG_TYPES.user.logout,
			details: {},
			userId: req.user._id,
			adminId: req.user.adminId || null,
			campaignId: null,
			loginAs: req.user.loginAs,
		});

		return sendResponse(res, {
			statusCode: 200,
			success: true,
			message: 'Success',
			data: {},
		});
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

		next(err);
	}
};

export const userProfile: RequestHandler = async (req: any, res, next) => {
	try {
		return sendResponse(res, {
			statusCode: 200,
			success: true,
			message: 'Success',
			data: req.user,
		});
	} catch (err) {
		next(err);
	}
};

export const userForgotPassword = async (
	req: any,
	res: Response,
	next: NextFunction
) => {
	try {
		const { email } = req.body;
		// First check whether user exists
		const user = await User.findOne(
			{
				email: { $regex: new RegExp(`^${email}$`, 'i') },
			},
			{
				firstName: 1,
				lastName: 1,
				recentPasswordRecoveryRequestedTime: 1,
			}
		);

		if (!user) {
			return sendResponse(res, {
				statusCode: 400,
				success: false,
				message:
					'This email is not registered in the Arolux application',
				data: {},
			});
		}

		// If user exists, then we will check last recovery request time to avoid multiple requests simultaneously
		const configurations = await Configuration.findOne(
			{},
			{
				_id: 1,
				passwordRecoveryIntervalSecs: 1,
				passwordRecoveryExpiryTimeInMinutes: 1,
			}
		);

		const allowedTime = dayjs(user.recentPasswordRecoveryRequestedTime).add(
			configurations?.passwordRecoveryIntervalSecs || 0,
			'seconds'
		);

		if (allowedTime.isAfter(dayjs())) {
			return sendResponse(res, {
				statusCode: 400,
				success: false,
				message:
					'We have already sent the email. Please wait a while to try again.',
				data: {},
			});
		}

		// create a random token and updates it in user data
		const randomToken = generateRandomToken('Aa0', 32);

		const userUpdated = await User.updateOne(
			{
				_id: user._id,
			},
			{
				$set: {
					passwordRecoveryToken: randomToken,
					recentPasswordRecoveryRequestedTime: new Date(),
					recentPasswordRecoveryExpiryTime: dayjs().add(
						configurations?.passwordRecoveryExpiryTimeInMinutes ||
							0,
						'minutes'
					),
				},
			}
		);

		if (!userUpdated) {
			return sendResponse(res, {
				statusCode: 500,
				success: false,
				message: 'Error occurred in password recovery.',
				data: {},
			});
		}

		// Send password recovery email
		sendEmail({
			to: email,
			from: { email: '' },
			subject: 'Reset Password',
			html: CONSTANTS.EMAIL_TEMPLATES.resetPassword
				.replace('@RANDOM_TOKEN', randomToken)
				.replace('@USER_NAME', `${user.firstName} ${user.lastName}`),
			// html: `It seems like you requested for password recovery. Please use following link for password recovery.  ${process.env.FORGOT_PASSWORD_REDIRECTION_LINK}?token=${randomToken}`,
		});

		await saveActionLog({
			logType: CONSTANTS.LOG_TYPES.user.forgotPassword,
			details: {},
			userId: user._id,
			adminId: null,
			campaignId: null,
		});

		return sendResponse(res, {
			statusCode: 200,
			success: true,
			message: 'Password recovery email sent successfully',
			data: {},
		});
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

		next(err);
	}
};

export const validateUserForgotPasswordToken = async (
	req: any,
	res: Response,
	next: NextFunction
) => {
	try {
		const { token } = req.body;

		// Fetch user data related to token
		const user = await User.findOne(
			{
				passwordRecoveryToken: token,
			},
			{
				_id: 1,
				recentPasswordRecoveryExpiryTime: 1,
			}
		);

		if (!user) {
			return sendResponse(res, {
				statusCode: 400,
				success: false,
				message: 'Invalid password recovery link',
				data: {},
			});
		}

		if (dayjs(user.recentPasswordRecoveryExpiryTime).isBefore(dayjs())) {
			return sendResponse(res, {
				statusCode: 400,
				success: false,
				message: 'Password recovery link expired',
				data: {},
			});
		}

		return sendResponse(res, {
			statusCode: 200,
			success: true,
			message: 'Password recovery token verified successfully',
			data: {},
		});
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

		next(err);
	}
};

export const resetUserPassword = async (
	req: any,
	res: Response,
	next: NextFunction
) => {
	try {
		const { token, password } = req.body;

		// Fetch user data related to token
		const user = await User.findOne(
			{
				passwordRecoveryToken: token,
			},
			{
				firstName: 1,
				lastName: 1,
				recentPasswordRecoveryExpiryTime: 1,
				email: 1,
			}
		);

		if (!user) {
			return sendResponse(res, {
				statusCode: 400,
				success: false,
				message: 'Invalid password recovery link',
				data: {},
			});
		}

		if (dayjs(user.recentPasswordRecoveryExpiryTime).isBefore(dayjs())) {
			return sendResponse(res, {
				statusCode: 400,
				success: false,
				message: 'Password recovery link expired',
				data: {},
			});
		}

		const userUpdated = await User.updateOne(
			{
				_id: user._id,
			},
			{
				$set: {
					password: hashPassword(password),
					recentPasswordRecoveryTime: new Date(),
					passwordRecoveryToken: '',
					recentPasswordRecoveryRequestedTime: null,
					recentPasswordRecoveryExpiryTime: null,
				},
			}
		);

		if (!userUpdated) {
			return sendResponse(res, {
				statusCode: 500,
				success: false,
				message: 'Error occurred in password recovery.',
				data: {},
			});
		}

		sendEmail({
			to: user.email,
			from: { email: '' },
			subject: 'Reset Password Successfully',
			html: CONSTANTS.EMAIL_TEMPLATES.resetPasswordSuccessfully.replace(
				'@USER_NAME',
				`${user.firstName} ${user.lastName}`
			),
			// html: 'Your password has been reset. You can now sign in with your new password and continue your journey with us.',
		});

		await saveActionLog({
			logType: CONSTANTS.LOG_TYPES.user.resetPassword,
			details: {},
			userId: user._id,
			adminId: null,
			campaignId: null,
		});

		return sendResponse(res, {
			statusCode: 200,
			success: true,
			message: 'Password reset successfully',
			data: {},
		});
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

		next(err);
	}
};

export const updateUserPassword = async (
	req: any,
	res: Response,
	next: NextFunction
) => {
	try {
		const { currentPassword, newPassword } = req.body;

		const user = await User.findOne(
			{
				_id: req.user._id,
			},
			{
				password: 1,
			}
		);

		if (!user) {
			return sendResponse(res, {
				statusCode: 400,
				success: false,
				message: 'Error occurred in updating password.',
				data: {},
			});
		}

		const isValidPassword = await comparePassword(
			currentPassword,
			user.password
		);

		if (!isValidPassword) {
			return sendResponse(res, {
				statusCode: 400,
				success: false,
				message: 'Old password does not match.',
				data: {},
			});
		}

		const userUpdated = await User.updateOne(
			{
				_id: user._id,
			},
			{
				$set: {
					password: hashPassword(newPassword),
				},
			}
		);

		if (!userUpdated) {
			return sendResponse(res, {
				statusCode: 500,
				success: false,
				message: 'Error occurred in updating password.',
				data: {},
			});
		}

		await saveActionLog({
			logType: CONSTANTS.LOG_TYPES.user.updatedPassword,
			details: {},
			userId: req.user._id,
			adminId: req.user.adminId || null,
			campaignId: null,
			loginAs: req.user.loginAs,
		});

		return sendResponse(res, {
			statusCode: 200,
			success: true,
			message: 'Password updated successfully',
			data: {},
		});
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

		next(err);
	}
};
