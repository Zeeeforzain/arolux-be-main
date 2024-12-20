import { Response } from 'express';

import { sendResponse } from '../../util/utilities.js';
import { CONSTANTS } from '../../util/constants.js';
import { saveActionLog } from '../../middlewares/common/actionLog.middleware.js';
import { saveErrorLog } from '../../middlewares/common/errorLog.middleware.js';
import Configuration from '../../models/configuration.js';

export const fetchConfigurations = async (req: any, res: Response) => {
	try {
		const configurations = await Configuration.findOne(
			{},
			{
				paymentProcessingFeesPercentage: 1,
			}
		);

		return sendResponse(res, {
			statusCode: 200,
			success: true,
			message: '',
			data: {
				configurations,
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

export const updateConfigurations = async (req: any, res: Response) => {
	try {
		const { paymentProcessingFeesPercentage } = req.body;

		const configurations: any = await Configuration.findOne(
			{},
			{
				paymentProcessingFeesPercentage: 1,
			}
		);

		if (
			configurations?.paymentProcessingFeesPercentage !==
			paymentProcessingFeesPercentage
		) {
			const record = await Configuration.updateOne(
				{
					_id: configurations._id,
				},
				{
					$set: {
						paymentProcessingFeesPercentage,
					},
				}
			);

			if (!record) {
				return sendResponse(res, {
					statusCode: 500,
					success: false,
					message: 'Error occurred. Please try again later.',
					data: {},
				});
			}

			await saveActionLog({
				logType: CONSTANTS.LOG_TYPES.admin.configurationUpdated,
				details: {
					previousPaymentProcessingFeesPercentage:
						configurations?.paymentProcessingFeesPercentage,
					newPaymentProcessingFeesPercentage:
						paymentProcessingFeesPercentage,
				},
				userId: null,
				adminId: req.user._id,
				campaignId: null,
			});
		}

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
