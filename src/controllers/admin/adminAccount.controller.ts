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
				message: 'Invalid credentials',
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
			logType: CONSTANTS.LOG_TYPES.admin.signout,
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

		return sendResponse(res, {
			statusCode: 200,
			success: true,
			message: 'Success',
			data: {
				adminAccount,
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
