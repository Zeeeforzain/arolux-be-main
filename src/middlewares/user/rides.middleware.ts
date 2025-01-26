import { RequestHandler } from 'express';

import { sendResponse } from '../../util/utilities.js';
import { saveErrorLog } from '../common/errorLog.middleware.js';
import GeoLocation from '../../models/geoLocation.js';

export const checkServiceArea: RequestHandler = async (req: any, res, next) => {
	try {
		const { latitude = 0, longitude = 0 } = req.query;

		const point = {
			type: 'Point',
			coordinates: [parseFloat(longitude), parseFloat(latitude)],
		};

		// Find the document where the point is inside the polygon
		const location = await GeoLocation.findOne(
			{
				boundaries: {
					$geoIntersects: {
						$geometry: point,
					},
				},
				isActive: true,
			},
			{
				_id: 1,
			}
		);

		if (!location) {
			return sendResponse(res, {
				statusCode: 400,
				success: false,
				message: 'Service not available in your requested area.',
				data: {
					isServiceUnavailable: true,
				},
			});
		}

		Object.assign(req, {
			location,
		});

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
