import { Response, RequestHandler } from 'express';

import Admin from '../../models/admin.js';

import {
	sendResponse,
	comparePassword,
	signJWT,
	// fetchCurrencyRates,
	hashPassword,
	capitalFirstLetter,
} from '../../util/utilities.js';
import { CONSTANTS } from '../../util/constants.js';
import { saveActionLog } from '../../middlewares/common/actionLog.middleware.js';
import { saveErrorLog } from '../../middlewares/common/errorLog.middleware.js';

import ActionLog from '../../models/actionLog.js';
import { Types } from 'mongoose';

export const adminLogin = async (req: any, res: Response) => {
	let admin = null;

	try {
		const { email, password } = req.body;

		admin = await Admin.findOne(
			{
				email,
			},
			{
				isActive: 1,
				password: 1,
			}
		);
		
		if (!admin) {
			return sendResponse(res, {
				statusCode: 400,
				success: false,
				message: 'Admin Not Found',
				data: {},
			});
		} else if (!admin.isActive) {
			return sendResponse(res, {
				statusCode: 401,
				success: false,
				message:
					'Your account has been deactivated by the admin. Please contact support.',
				data: {},
			});
		}

		const isValidPassword = await comparePassword(password, admin.password);

		if (!isValidPassword) {
			return sendResponse(res, {
				statusCode: 400,
				success: false,
				message: 'Invalid credentials',
				data: {},
			});
		}

		const accessToken = signJWT({
			_id: admin._id,
			email,
		});

		await Admin.updateOne(
			{
				_id: admin._id,
			},
			{
				$set: {
					lastLoginTime: new Date(),
				},
			}
		);

		await saveActionLog({
			logType: CONSTANTS.LOG_TYPES.admin.signin,
			details: {},
			userId: null,
			adminId: admin._id,
			campaignId: null,
		});

		return sendResponse(res, {
			statusCode: 200,
			success: true,
			message: 'Success',
			data: {
				accessToken,
			},
		});
	} catch (err: any) {
		console.log(err);
		saveErrorLog({
			endpoint: req.originalUrl,
			params: Object.assign({
				urlParams: req.params,
				queryParams: req.query,
				bodyParams: req.body,
			}),
			errDetails: err,
			userId: null,
			adminId: admin ? admin._id : null,
		});

		return sendResponse(res, {
			statusCode: 500,
			success: false,
			message: 'Error occurred. Please try again later.',
			data: {},
		});
	}
};

export const adminLogout: RequestHandler = async (req: any, res) => {
	try {
		await saveActionLog({
			logType: CONSTANTS.LOG_TYPES.admin.logout,
			details: {},
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

export const adminProfile: RequestHandler = async (req: any, res) => {
	try {
		return sendResponse(res, {
			statusCode: 200,
			success: true,
			message: 'Success',
			data: req.user,
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

export const createNewAdminAccount: RequestHandler = async (req: any, res) => {
	try {
		const {
			name = '',
			email = '',
			phoneNumber = '',
			password = '',
			adminType = null,
		} = req.body;

		const adminAccountSaved = await new Admin({
			name,
			email,
			phoneNumber,
			password,
			adminType,
			createdBy: req.user._id,
		}).save();

		if (!adminAccountSaved) {
			return sendResponse(res, {
				statusCode: 500,
				success: false,
				message: 'Error occurred. Please try again later.',
				data: {},
			});
		}

		await saveActionLog({
			logType: CONSTANTS.LOG_TYPES.admin.adminAccountCreated,
			details: {
				adminId: adminAccountSaved._id,
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

export const updateAdminAccount: RequestHandler = async (req: any, res) => {
	try {
		const { adminId = '' } = req.params;
		const {
			name = '',
			email = '',
			phoneNumber = '',
			adminType = null,
		} = req.body;

		const adminAccountUpdated = await Admin.findOneAndUpdate(
			{
				_id: adminId,
			},
			{
				$set: {
					name,
					email,
					phoneNumber,
					adminType,
				},
			},
			{
				new: true,
			}
		);

		if (!adminAccountUpdated) {
			return sendResponse(res, {
				statusCode: 500,
				success: false,
				message: 'Error occurred. Please try again later.',
				data: {},
			});
		}

		let action = '';

		if (Object.keys(req.updatedObj).length) {
			Object.keys(req.updatedObj).forEach((key: any) => {
				if (action !== '') {
					action += ', ';
				}

				action += `${capitalFirstLetter(
					req.updatedObj[key].label
				)} from ${req.updatedObj[key].prev} to ${
					req.updatedObj[key].new
				}`;
			});
		}

		await saveActionLog({
			logType: CONSTANTS.LOG_TYPES.admin.adminAccountUpdated,
			details: {
				adminId: adminAccountUpdated._id,
				action,
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

export const updateAdminAccountPassword: RequestHandler = async (
	req: any,
	res
) => {
	try {
		const { adminId = '' } = req.params;
		const { password = '' } = req.body;

		const adminAccountUpdated = await Admin.findOneAndUpdate(
			{
				_id: adminId,
			},
			{
				$set: {
					password: hashPassword(password),
				},
			},
			{
				new: true,
			}
		);

		if (!adminAccountUpdated) {
			return sendResponse(res, {
				statusCode: 500,
				success: false,
				message: 'Error occurred. Please try again later.',
				data: {},
			});
		}

		await saveActionLog({
			logType: CONSTANTS.LOG_TYPES.admin.adminAccountUpdated,
			details: {
				adminId: adminAccountUpdated._id,
				action: 'password',
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

export const updateAdminAccountStatus: RequestHandler = async (
	req: any,
	res
) => {
	try {
		const { adminId = '' } = req.params;
		const { isActive = false } = req.body;

		const adminAccountUpdated = await Admin.findOneAndUpdate(
			{
				_id: adminId,
			},
			{
				$set: {
					isActive,
				},
			},
			{
				new: true,
			}
		);

		if (!adminAccountUpdated) {
			return sendResponse(res, {
				statusCode: 500,
				success: false,
				message: 'Error occurred. Please try again later.',
				data: {},
			});
		}

		await saveActionLog({
			logType: CONSTANTS.LOG_TYPES.admin.adminAccountUpdated,
			details: {
				adminId: adminAccountUpdated._id,
				action: `status to ${isActive ? 'active' : 'in-active'}`,
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

export const fetchAdminAccounts: RequestHandler = async (req: any, res) => {
	try {
		const {
			limit = 20,
			offset = 0,
			searchText = '',
			status = null, //active, in-active
		} = req.query;

		const filter = {};

		if (searchText && searchText !== '') {
			Object.assign(filter, {
				$or: [
					{
						name: {
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
					{
						phoneNumber: {
							$regex: searchText,
							$options: 'i',
						},
					},
				],
			});
		}

		if (status === 'active' || status === 'in-active') {
			Object.assign(filter, {
				isActive: status === 'active',
			});
		}

		const totalAdminAccountsCount = await Admin.countDocuments(filter);

		const adminAccounts: any[] = await Admin.find(filter, {
			name: 1,
			email: 1,
			phoneNumber: 1,
			isActive: 1,
			lastLoginTime: 1,
			adminType: 1,
		})
			.sort({
				createdAt: -1,
			})
			.limit(limit)
			.skip(offset);

		return sendResponse(res, {
			statusCode: 200,
			success: true,
			message: 'Success',
			data: {
				totalAdminAccountsCount,
				adminAccounts,
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

export const fetchAdminAccountDetails: RequestHandler = async (
	req: any,
	res
) => {
	try {
		const { adminId } = req.params;

		const adminAccount = await Admin.findOne(
			{
				_id: adminId,
			},
			{
				name: 1,
				email: 1,
				phoneNumber: 1,
				isActive: 1,
				lastLoginTime: 1,
				adminType: 1,
				createdAt: 1,
				approvedCampaignsCount: 1,
				declinedCampaignsCount: 1,
				usersDisabledCount: 1,
			}
		);

		if (!adminAccount) {
			return sendResponse(res, {
				statusCode: 400,
				success: false,
				message: 'Invalid adminId',
				data: {},
			});
		}

		const auditLogs = await ActionLog.aggregate([
			{
				$match: {
					adminId: new Types.ObjectId(adminId),
					$or: [
						{
							logType: {
								$in: Object.values(CONSTANTS.LOG_TYPES.admin),
							},
						},
						{
							loginAs: 'admin',
						},
					],
				},
			},
			{
				$lookup: {
					from: 'admins',
					localField: 'adminId',
					foreignField: '_id',
					as: 'adminData',
				},
			},
			{
				$unwind: {
					path: '$adminData',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$lookup: {
					from: 'campaigns',
					localField: 'campaignId',
					foreignField: '_id',
					as: 'campaignData',
				},
			},
			{
				$unwind: {
					path: '$campaignData',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$lookup: {
					from: 'users',
					localField: 'userId',
					foreignField: '_id',
					as: 'userData',
				},
			},
			{
				$unwind: {
					path: '$userData',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$lookup: {
					from: 'charityorganizations',
					localField: 'charityOrganizationId',
					foreignField: '_id',
					as: 'charityOrganizationData',
				},
			},
			{
				$unwind: {
					path: '$charityOrganizationData',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$lookup: {
					from: 'campaigncategories',
					localField: 'categoryId',
					foreignField: '_id',
					as: 'categoryData',
				},
			},
			{
				$unwind: {
					path: '$categoryData',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$lookup: {
					from: 'admins',
					localField: 'details.adminId',
					foreignField: '_id',
					as: 'logDetailsAdminData',
				},
			},
			{
				$unwind: {
					path: '$logDetailsAdminData',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$lookup: {
					from: 'users',
					localField: 'details.userId',
					foreignField: '_id',
					as: 'logDetailsUserData',
				},
			},
			{
				$unwind: {
					path: '$logDetailsUserData',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$project: {
					logType: 1,
					createdAt: 1,
					details: 1,
					logDetailsAdminData: 1,
					logDetailsUserData: 1,
					adminName: '$adminData.name',
					campaignTitle: '$campaignData.title',
					campaignRandomToken: '$campaignData.randomToken',
					charityOrganizationName: '$charityOrganizationData.name',
					categoryName: '$categoryData.name',
					userName: {
						$concat: [
							'$userData.firstName',
							' ',
							'$userData.lastName',
						],
					},
					userEmail: '$userData.email',
					loginAs: 1,
					adminId: 1,
				},
			},
			{
				$sort: {
					createdAt: -1,
				},
			},
		]);

		type AdminLogType =
			| 'admin-campaign-approved'
			| 'admin-campaign-rejected'
			| 'admin-campaign-featured'
			| 'admin-campaign-unfeatured'
			| 'admin-charity-created'
			| 'admin-charity-updated'
			| 'admin-charity-deleted'
			| 'admin-country-updated'
			| 'admin-user-config-updated'
			| 'admin-user-bank-info-updated'
			| 'admin-transfer-created'
			| 'admin-category-created'
			| 'admin-category-updated'
			| 'admin-category-deleted'
			| 'admin-logged-in-as-a-user'
			| 'admin-account-created'
			| 'admin-account-updated';

		type UserLogType =
			| 'user-logged-out'
			| 'user-updated-password'
			| 'user-phone-number-verified'
			| 'user-home-address-updated'
			| 'user-banking-info-updated'
			| 'user-campaign-created'
			| 'user-campaign-details-updated'
			| 'user-campaign-settings-updated'
			| 'user-campaign-deleted'
			| 'user-campaign-giving-level-added'
			| 'user-campaign-giving-level-updated'
			| 'user-campaign-giving-level-deleted'
			| 'user-card-info-updated'
			| 'user-profile-updated'
			| 'user-downloaded-donation-report'
			| 'user-downloaded-statistics-report';

		if (auditLogs && auditLogs.length) {
			auditLogs.forEach((log: any) => {
				log.title = log.logType
					? capitalFirstLetter(log.logType.split('-').join(' '))
					: '';

				let updatedParamsString = '';

				if (log.details && Object.keys(log.details).length) {
					Object.keys(log.details).forEach((key: any) => {
						if (log.details[key] || log.details[key] === false) {
							if (updatedParamsString !== '') {
								updatedParamsString += ', ';
							}

							updatedParamsString += `Changed ${key} to ${log.details[key]}`;
						}
					});
				}

				let description = null;

				if (log.loginAs !== 'admin') {
					description =
						CONSTANTS.PROFILE_AUDIT_TRIALS.admin[
							log.logType as AdminLogType
						];
				} else {
					description =
						CONSTANTS.LOGS_DESCRIPTION.user[
							log.logType as UserLogType
						];
				}

				Object.assign(log, {
					description:
						description
							?.replace('@USER_NAME', log.userName || '')
							.replace('@USER_EMAIL', log.userEmail || '')
							.replace('@UPDATED_PARAMS', updatedParamsString)
							.replace('@CAMPAIGN_TITLE', log.campaignTitle || '')
							.replace(
								'@CAMPAIGN_RANDOM_TOKEN',
								log.campaignRandomToken || ''
							)
							.replace('@STATUS', log.details?.status || '')
							.replace(
								'@CHARITY_ORGANIZATION',
								log.charityOrganizationName || ''
							)
							.replace(
								'@USER_VERIFIED_PHONE_NUMBER',
								log.details?.phoneNumber || ''
							)
							.replace(
								'@LOG_DETAILS_USER_NAME',
								log.details?.name || ''
							)
							.replace(
								'@LOG_DETAILS_USER_EMAIL',
								log.details?.email || ''
							)
							.replace(
								'@LOG_DETAILS_ADMIN_TYPE',
								log.details?.adminType || ''
							)
							.replace('@LINK_NAME', log.details?.linkName || '')
							.replace(
								'@LINK_OWNER',
								log.details?.linkOwner || ''
							)
							.replace(
								'@LOG_DETAILS_ADMIN_NAME',
								log.logDetailsAdminData?.name || ''
							)
							.replace(
								'@LOG_DETAILS_ADMIN_EMAIL',
								log.logDetailsAdminData?.email || ''
							)
							.replace(
								'@LOG_DETAILS_ADMIN_ROLE_TYPE',
								log.logDetailsAdminData?.adminType || ''
							)
							.replace(
								'@LOG_DETAILS_USER_NAME',
								log.logDetailsUserData?.name || ''
							)
							.replace(
								'@LOG_DETAILS_USER_EMAIL',
								log.logDetailsUserData?.email || ''
							)
							.replace(
								'@LOG_DETAILS_ACTION',
								log.details?.action || ''
							) || '',
				});

				delete log.logDetailsAdminData;
				delete log.logDetailsUserData;
				delete log.details;
			});
		}

		return sendResponse(res, {
			statusCode: 200,
			success: true,
			message: 'Success',
			data: {
				adminAccount,
				auditLogs,
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
