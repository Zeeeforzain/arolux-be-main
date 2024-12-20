import { NextFunction } from 'express';

import { sendResponse } from '../../util/utilities.js';
import User from '../../models/user.js';
import { isValidObjectId } from 'mongoose';
import { saveErrorLog } from '../common/errorLog.middleware.js';

export const isUserBankInfoPending = async (
	req: any,
	res: any,
	next: NextFunction
) => {
	try {
		const { userId } = req.params;
		const { status } = req.body;

		if (!isValidObjectId(userId)) {
			return sendResponse(res, {
				statusCode: 500,
				success: false,
				message: 'Invlaid userId.',
				data: {},
			});
		}

		const userDetails = await User.findOne(
			{
				_id: userId,
			},
			{
				bankInfo: 1,
			}
		);

		if (!userDetails) {
			return sendResponse(res, {
				statusCode: 500,
				success: false,
				message: 'User not found.',
				data: {},
			});
		}

		if (!userDetails.bankInfo || !userDetails.bankInfo.countryId) {
			return sendResponse(res, {
				statusCode: 500,
				success: false,
				message: 'User bank info not found.',
				data: {},
			});
		}

		if (status === 'active' && userDetails.bankInfo.status === 'active') {
			return sendResponse(res, {
				statusCode: 500,
				success: false,
				message: 'User bank info is already approved.',
				data: {},
			});
		}

		if (
			status === 'rejected' &&
			userDetails.bankInfo.status === 'rejected'
		) {
			return sendResponse(res, {
				statusCode: 500,
				success: false,
				message: 'User bank info is already rejected.',
				data: {},
			});
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
			userId: null,
			adminId: req.user ? req.user._id : null,
		});

		return sendResponse(res, {
			statusCode: 500,
			success: false,
			message: 'Error occurred. Please try again later.',
			data: {},
		});
	}
};
