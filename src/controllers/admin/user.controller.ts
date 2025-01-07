import { Response } from 'express';

import { sendResponse } from '../../util/utilities.js';
import { Types, isValidObjectId } from 'mongoose';
import User from '../../models/userAccounts.js';
import { saveErrorLog } from '../../middlewares/common/errorLog.middleware.js';

export const fetchUsers = async (req: any, res: Response) => {
	try {
		const {
			searchText = null,
			countryId = null,
			statusFilter = null,
			offset = 0,
			limit = 20,
		} = req.query;

		const piplines: any[] = [];

		const matchFilter = {};

		if (searchText && searchText !== '') {
			piplines.push({
				$addFields: {
					fullName: {
						$concat: ['$firstName', ' ', '$lastName'],
					},
				},
			});

			Object.assign(matchFilter, {
				$or: [
					{
						firstName: {
							$regex: searchText,
							$options: 'i',
						},
					},
					{
						lastName: {
							$regex: searchText,
							$options: 'i',
						},
					},
					{
						fullName: {
							$regex: searchText,
							$options: 'i',
						},
					},
					{
						email: {
							$regex: searchText,
							$options: 'i',
						},
					},
				],
			});
		}

		if (Object.values(['active', 'inActive']).includes(statusFilter)) {
			Object.assign(matchFilter, {
				status: statusFilter,
			});
		}

		if (countryId && isValidObjectId(countryId)) {
			Object.assign(matchFilter, {
				countryId: new Types.ObjectId(countryId),
			});
		}

		if (Object.keys(matchFilter).length) {
			piplines.push({
				$match: matchFilter,
			});
		}

		piplines.push(
			{
				$lookup: {
					from: 'countries',
					localField: 'addressDetails.countryId',
					foreignField: '_id',
					as: 'countryData',
				},
			},
			{
				$unwind: {
					path: '$countryData',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$sort: {
					firstName: 1,
				},
			},

			{
				$project: {
					firstName: 1,
					lastName: 1,
					email: 1,
					lastLoginTime: 1,
					status: 1,
					isAutoApprovalEnabled: 1,
					countryId: '$countryData._id',
					country: '$countryData.name',
				},
			},
			{
				$facet: {
					totalCount: [
						{
							$count: 'count',
						},
					],
					records: [{ $skip: +offset }, { $limit: +limit }],
				},
			}
		);

		const userRecords = await User.aggregate(piplines);

		let totalCount = 0;

		if (
			userRecords &&
			userRecords.length &&
			userRecords[0].totalCount &&
			userRecords[0].totalCount.length &&
			userRecords[0].totalCount[0].count
		) {
			totalCount = userRecords[0].totalCount[0].count;
		}

		const users =
			userRecords && userRecords.length ? userRecords[0].records : [];

		return sendResponse(res, {
			statusCode: 200,
			success: true,
			message: '',
			data: {
				totalCount,
				users,
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

export const fetchUserDetails = async (req: any, res: Response) => {
	try {
		const { userId } = req.params;

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
				firstName: 1,
				lastName: 1,
				email: 1,
				phoneNumber: 1,
				addressDetails: 1,
				lastLoginTime: 1,
				createdAt: 1,
				profileImage: 1,
				isAutoApprovalEnabled: 1,
				status: 1,
				bankInfo: 1,
			}
		);

		return sendResponse(res, {
			statusCode: 200,
			success: true,
			message: '',
			data: {
				userDetails,
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
