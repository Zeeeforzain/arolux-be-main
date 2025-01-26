/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable indent */
import { /*Response, NextFunction,*/ RequestHandler } from 'express';
// import dayjs from 'dayjs';

import { sendResponse } from '../../util/utilities.js';
// import { saveActionLog } from '../../middlewares/common/actionLog.middleware.js';
// import { saveErrorLog } from '../../middlewares/common/errorLog.middleware.js';
import VehicleCategory from '../../models/vehicleCategory.js';
import VehicleCategoryFare from '../../models/vehicleCategoryFare.js';

export const fetchUserDashboard: RequestHandler = async (req: any, res) => {
	try {
		const { latitude = 0, longitude = 0 } = req.query;

		//Todo: add code here

		const vehicles = [
			{
				latitude,
				longitude,
				angle: 45,
			},
		];

		return sendResponse(res, {
			statusCode: 200,
			success: true,
			message: 'Success',
			data: {
				vehicles,
			},
		});
	} catch (err) {
		return sendResponse(res, {
			statusCode: 500,
			success: false,
			message: 'Error occurred. Please try again later.',
			data: {},
		});
	}
};

export const fetchVehicleCategories: RequestHandler = async (req: any, res) => {
	try {
		const vehicleCategories = await VehicleCategory.find(
			{
				isActive: true,
			},
			{
				name: 1,
				iconURL: 1,
				minSeatingCapacity: 1,
				maxSeatingCapacity: 1,
			}
		).lean();

		let fares: any = [];

		if (vehicleCategories?.length && req.location) {
			fares = await VehicleCategoryFare.find(
				{
					geoLocationId: req.location._id,
					vehicleCategoryId: {
						$in: vehicleCategories.map((v: any) => {
							return v._id;
						}),
					},
				},
				{
					vehicleCategoryId: 1,
					baseFare: 1,
					chargesPerMile: 1,
					chargesPerMinute: 1,
					chargesPerHour: 1,
					minimumFare: 1,
					suitedCharges: 1,
					extraCharges: 1,
					currencyCode: 1,
					currencySymbol: 1,
				}
			);

			if (fares?.length) {
				for (const category of vehicleCategories) {
					const categoryFare = fares.find((f: any) => {
						return f.vehicleCategoryId.equals(category._id);
					});

					if (categoryFare) {
						Object.assign(category, {
							fare: categoryFare,
						});
					}
				}
			}
		}

		const categories = vehicleCategories.filter((v: any) => {
			return v.fare;
		});

		return sendResponse(res, {
			statusCode: 200,
			success: true,
			message: 'Success',
			data: {
				categories,
			},
		});
	} catch (err) {
		return sendResponse(res, {
			statusCode: 500,
			success: false,
			message: 'Error occurred. Please try again later.',
			data: {},
		});
	}
};

export const sendServiceAreaResponse: RequestHandler = async (
	req: any,
	res
) => {
	try {
		return sendResponse(res, {
			statusCode: 200,
			success: true,
			message: 'Success',
			data: {},
		});
	} catch (err) {
		return sendResponse(res, {
			statusCode: 500,
			success: false,
			message: 'Error occurred. Please try again later.',
			data: {},
		});
	}
};
