import { Response } from 'express';

import Country from '../../models/country.js';

import { sendResponse } from '../../util/utilities.js';
import { CONSTANTS } from '../../util/constants.js';
import { saveActionLog } from '../../middlewares/common/actionLog.middleware.js';
import { saveErrorLog } from '../../middlewares/common/errorLog.middleware.js';

export const fetchCountriesList = async (req: any, res: Response) => {
	try {
		const countries = await Country.find(
			{},
			{
				name: 1,
				imageUrl: 1,
				isActive: 1,
				code: 1,
			}
		).sort({
			name: 1,
		});

		return sendResponse(res, {
			statusCode: 200,
			success: true,
			message: '',
			data: {
				countries,
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

export const updateCountry = async (req: any, res: Response) => {
	try {
		const { isActive, imageUrl, countryId } = req.body;

		const record = await Country.updateOne(
			{
				_id: countryId,
			},
			{
				$set: {
					imageUrl,
					isActive,
				},
			}
		);

		if (!record) {
			return sendResponse(res, {
				statusCode: 500,
				success: false,
				message: 'Error occurred in updating the country.',
				data: {},
			});
		}

		await saveActionLog({
			logType: CONSTANTS.LOG_TYPES.admin.countryUpdated,
			details: {
				isActive,
				imageUrl,
				countryId,
			},
			userId: null,
			adminId: req.user._id,
			campaignId: null,
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
