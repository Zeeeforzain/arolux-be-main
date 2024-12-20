import { Response } from 'express';

import {
	fetchAccessAndRefreshToken,
	sendResponse,
} from '../../util/utilities.js';
import { Types, isValidObjectId } from 'mongoose';
import User from '../../models/user.js';
import { saveActionLog } from '../../middlewares/common/actionLog.middleware.js';
import { CONSTANTS } from '../../util/constants.js';
import { saveErrorLog } from '../../middlewares/common/errorLog.middleware.js';
import Admin from '../../models/admin.js';

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

export const updateUserConfigs = async (req: any, res: Response) => {
	try {
		const { userId } = req.params;
		const { status = null, isAutoApprovalEnabled = null } = req.body;

		if (!isValidObjectId(userId)) {
			return sendResponse(res, {
				statusCode: 500,
				success: false,
				message: 'Invlaid userId.',
				data: {},
			});
		}

		const updateObj = {};

		if (status && status !== '') {
			Object.assign(updateObj, {
				status,
			});
		}

		if (typeof isAutoApprovalEnabled === 'boolean') {
			Object.assign(updateObj, {
				isAutoApprovalEnabled,
			});
		}

		const userUpdated = await User.updateOne(
			{
				_id: userId,
			},
			{
				$set: updateObj,
			}
		);

		if (!userUpdated) {
			return sendResponse(res, {
				statusCode: 500,
				success: false,
				message: 'Error occured. Please try again later.',
				data: {},
			});
		}

		if (status && status === 'inActive') {
			await Admin.updateOne(
				{
					_id: req.user._id,
				},
				{
					$inc: {
						usersDisabledCount: 1,
					},
				}
			);
		}

		await saveActionLog({
			logType: CONSTANTS.LOG_TYPES.admin.userConfigUpdated,
			details: {
				status,
				isCampaignAutoApprovalEnabled: isAutoApprovalEnabled,
			},
			userId,
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

export const updateUserBankInfoStatus = async (req: any, res: Response) => {
	try {
		const { userId } = req.params;
		const { status = null } = req.body;

		const userUpdated = await User.updateOne(
			{
				_id: userId,
			},
			{
				$set: {
					'bankInfo.status': status,
					'bankInfo.lastReviewedByAdminId': req.user._id,
					'bankInfo.lastReviewedByAdminAt': new Date(),
				},
			}
		);

		if (!userUpdated) {
			return sendResponse(res, {
				statusCode: 500,
				success: false,
				message: 'Error occured. Please try again later.',
				data: {},
			});
		}

		await saveActionLog({
			logType: CONSTANTS.LOG_TYPES.admin.userBankInfoUpdated,
			details: {
				status,
			},
			userId,
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

export const fetchUserLoginToken = async (req: any, res: Response) => {
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

		const user = await User.findOne(
			{
				_id: userId,
			},
			{
				email: 1,
			}
		);

		if (!user) {
			return sendResponse(res, {
				statusCode: 500,
				success: false,
				message: 'User not found.',
				data: {},
			});
		}

		const { accessToken, refreshToken } = await fetchAccessAndRefreshToken({
			_id: user._id,
			email: user.email,
			type: 'admin',
			adminId: req.user._id,
		});

		await saveActionLog({
			logType: CONSTANTS.LOG_TYPES.admin.loggedInAsAUser,
			details: {},
			userId,
			adminId: req.user._id,
			campaignId: null,
		});

		return sendResponse(res, {
			statusCode: 200,
			success: true,
			message: '',
			data: {
				token: accessToken,
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
