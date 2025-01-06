import { RequestHandler } from 'express';
import User from '../../models/userAccounts.js';

import { sendResponse } from '../../util/utilities.js';
// import { CONSTANTS } from '../../util/constants.js';
// import jsonwebtoken from 'jsonwebtoken';
import { saveErrorLog } from '../common/errorLog.middleware.js';

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

		const userRecord: any = await User.findOne(filter, {
			_id: 1,
		});

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

export const isPhoneNumberAlreadyLinked: RequestHandler = async (
	req: any,
	res,
	next
) => {
	try {
		const phoneNumber = req.body.phoneNumber;
		const phoneNumberRecord: any = await User.countDocuments({
			_id: {
				$ne: req.user._id,
			},
			phoneNumber,
		});

		if (phoneNumberRecord) {
			return sendResponse(res, {
				statusCode: 409,
				success: false,
				message: 'An account with same phone number already exists',
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
