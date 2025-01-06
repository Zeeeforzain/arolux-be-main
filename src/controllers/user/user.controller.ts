/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable indent */
import { Response, NextFunction, RequestHandler } from 'express';
import dayjs from 'dayjs';

import User from '../../models/userAccounts.js';

import { CONSTANTS } from '../../util/constants.js';

import {
	sendResponse,
	generateRandomToken,
	fetchAccessAndRefreshToken,
} from '../../util/utilities.js';
import { saveActionLog } from '../../middlewares/common/actionLog.middleware.js';
import { saveErrorLog } from '../../middlewares/common/errorLog.middleware.js';
import TempAccounts from '../../models/tempAccounts.js';

export const userSendLoginCode = async (
	req: any,
	res: Response,
	next: NextFunction
) => {
	try {
		const { countryCode, phoneNumber, deviceType, deviceToken } = req.body;
		const verificationCode = generateRandomToken('0', 4);

		let account = null;

		if (req.userRecord) {
			// Already Registered, just create a random code of 4 digits and send to user over phone number and email

			account = await User.updateOne(
				{
					countryCode,
					phoneNumber,
				},
				{
					$set: {
						verificationCode,
						verificationCodeExpiryTime: dayjs().add(
							CONSTANTS.VERIFICATION_CODE_EXPIRY_TIME_IN_MINUTES,
							'minutes'
						),
					},
				}
			);
		} else {
			// Create new record in temp accounts and create a random code of 4 digits and send to user over phone number
			const isTempAccountExist = await TempAccounts.countDocuments({
				countryCode,
				phoneNumber,
			});

			if (isTempAccountExist) {
				account = await TempAccounts.updateOne(
					{
						countryCode,
						phoneNumber,
					},
					{
						$set: {
							verificationCode,
							verificationCodeExpiryTime: dayjs().add(
								CONSTANTS.VERIFICATION_CODE_EXPIRY_TIME_IN_MINUTES,
								'minutes'
							),
							deviceType,
							deviceToken,
						},
					}
				);
			} else {
				account = await new TempAccounts({
					countryCode,
					phoneNumber,
					deviceType,
					deviceToken,
					verificationCode,
					verificationCodeExpiryTime: dayjs().add(
						CONSTANTS.VERIFICATION_CODE_EXPIRY_TIME_IN_MINUTES,
						'minutes'
					),
				}).save();
			}

			if (!account) {
				return sendResponse(res, {
					statusCode: 500,
					success: false,
					message: 'Error occurred in password recovery.',
					data: {},
				});
			}
		}

		await saveActionLog({
			logType: CONSTANTS.LOG_TYPES.user.sendLoginCode,
			details: {
				countryCode,
				phoneNumber,
				deviceType,
				deviceToken,
			},
			userId: null,
			adminId: null,
			campaignId: null,
		});

		return sendResponse(res, {
			statusCode: 200,
			success: true,
			message: 'Success',
			data: {
				code: verificationCode, //
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

export const userLoginCodeVerificationResponse = async (
	req: any,
	res: Response,
	next: NextFunction
) => {
	try {
		const { countryCode, phoneNumber, code, deviceType, deviceToken } =
			req.body;

		let accessToken = null;
		let refreshToken = null;

		if (req.userAccount) {
			const tokens = await fetchAccessAndRefreshToken({
				_id: req.userAccount._id,
				email: req.userAccount.email,
			});
			accessToken = tokens.accessToken;
			refreshToken = tokens.refreshToken;
		}

		await saveActionLog({
			logType: CONSTANTS.LOG_TYPES.user.verifyLoginCode,
			details: {
				countryCode,
				phoneNumber,
				deviceType,
				deviceToken,
				code,
			},
			userId: null,
			adminId: null,
			campaignId: null,
		});

		return sendResponse(res, {
			statusCode: 200,
			success: true,
			message: 'Success',
			data: {
				isNewUser: !req.userAccount,
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

export const userSignup = async (
	req: any,
	res: Response,
	next: NextFunction
) => {
	try {
		const {
			countryCode,
			phoneNumber,
			code,
			deviceType,
			deviceToken,
			name,
			email,
			referralCode,
			profileImageURL,
		} = req.body;

		const userRecord = await new User({
			countryCode,
			phoneNumber,
			deviceType,
			deviceToken,
			name,
			email,
			referralCode,
			profileImageURL,
		}).save();

		if (!userRecord) {
			return sendResponse(res, {
				statusCode: 500,
				success: false,
				message: 'Error occurred. Please try again later.',
				data: {},
			});
		}

		await TempAccounts.deleteOne({
			countryCode,
			phoneNumber,
		});

		const { accessToken, refreshToken } = await fetchAccessAndRefreshToken({
			_id: userRecord._id,
			email: userRecord.email,
		});

		await saveActionLog({
			logType: CONSTANTS.LOG_TYPES.user.signup,
			details: {
				countryCode,
				phoneNumber,
				deviceType,
				deviceToken,
				code,
				name,
				email,
				referralCode,
				profileImageURL,
			},
			userId: null,
			adminId: null,
			campaignId: null,
		});

		return sendResponse(res, {
			statusCode: 200,
			success: true,
			message: 'Success',
			data: {
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

export const fetchUserProfile: RequestHandler = async (req: any, res, next) => {
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
