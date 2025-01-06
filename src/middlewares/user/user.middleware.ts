import { RequestHandler } from 'express';
import User from '../../models/userAccounts.js';

import { sendResponse } from '../../util/utilities.js';
// import { CONSTANTS } from '../../util/constants.js';
// import jsonwebtoken from 'jsonwebtoken';
import { saveErrorLog } from '../common/errorLog.middleware.js';
import dayjs from 'dayjs';
import TempAccounts from '../../models/tempAccounts.js';

export const isPhoneNumberAlreadyRegistered: RequestHandler = async (
	req: any,
	res,
	next
) => {
	try {
		const { countryCode, phoneNumber } = req.body;

		const filter = {
			countryCode,
			phoneNumber,
		};

		if (req.user) {
			Object.assign(filter, {
				_id: {
					$ne: req.user._id,
				},
			});
		}

		const userRecord: any = await User.countDocuments(filter);

		if (userRecord) {
			Object.assign(req, {
				userRecord,
			});
		}

		return next();
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

export const checkPhoneNumberDuplication: RequestHandler = async (
	req: any,
	res,
	next
) => {
	try {
		if (req.userRecord) {
			return sendResponse(res, {
				statusCode: 409,
				success: false,
				message: 'Phone number already registered.',
				data: {},
			});
		}

		return next();
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

export const userVerifyLoginCode: RequestHandler = async (
	req: any,
	res,
	next
) => {
	try {
		const { countryCode, phoneNumber, code } = req.body;

		let account: any = null;

		if (req.userRecord) {
			account = await User.findOne(
				{
					countryCode,
					phoneNumber,
				},
				{
					verificationCode: 1,
					verificationCodeExpiryTime: 1,
					email: 1,
				}
			);

			Object.assign(req, {
				userAccount: account,
			});
		} else {
			// Create new record in temp accounts and create a random code of 4 digits and send to user over phone number
			account = await TempAccounts.findOne(
				{
					countryCode,
					phoneNumber,
				},
				{
					verificationCode: 1,
					verificationCodeExpiryTime: 1,
				}
			);
		}

		if (!account) {
			return sendResponse(res, {
				statusCode: 400,
				success: false,
				message: 'Phone number not registered.',
				data: {},
			});
		}

		if (account.verificationCode !== code) {
			return sendResponse(res, {
				statusCode: 400,
				success: false,
				message: 'Invalid verification code.',
				data: {},
			});
		}

		if (dayjs().isAfter(dayjs(account.verificationCodeExpiryTime))) {
			return sendResponse(res, {
				statusCode: 400,
				success: false,
				message: 'Verification code expired.',
				data: {},
			});
		}

		return next();
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

export const isEmailAlreadyUsed: RequestHandler = async (
	req: any,
	res,
	next
) => {
	try {
		const email = req.body.email;

		const filter = {
			email,
		};

		if (req.user) {
			Object.assign(filter, {
				_id: {
					$ne: req.user._id,
				},
			});
		}

		const emailRecord: any = await User.countDocuments(filter);

		if (emailRecord) {
			return sendResponse(res, {
				statusCode: 409,
				success: false,
				message: 'An account with same email already exists',
				data: {},
			});
		}
		return next();
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
