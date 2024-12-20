import { RequestHandler } from 'express';
import Admin from '../../models/admin.js';
import { sendResponse, decryptText } from '../../util/utilities.js';
import { saveErrorLog } from '../common/errorLog.middleware.js';

export const isEmailAlreadyUsed: RequestHandler = async (
	req: any,
	res,
	next
) => {
	try {
		const { adminId } = req.params;
		const email = req.body.email.trim().toLowerCase();

		const filter = {
			email,
		};

		if (adminId) {
			Object.assign(filter, {
				_id: {
					$ne: adminId,
				},
			});
		}

		const emailRecord: any = await Admin.countDocuments(filter);

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

export const decryptMiddleware: RequestHandler = async (
	req: any,
	res,
	next
) => {
	try {
		const { data } = req.body;
		req.body = JSON.parse(decryptText(data));
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

export const isAdminAllowedToPerformOperation = (permissions: string[]) => {
	return (req: any, res: any, next: any) => {
		try {
			const isRoleFound = permissions.find((permission: string) => {
				return permission === req.user.adminType;
			});

			if (!isRoleFound) {
				return sendResponse(res, {
					statusCode: 403,
					success: false,
					message: 'Not authorized.',
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
};

export const isValidAdminId: RequestHandler = async (req: any, res, next) => {
	try {
		const { adminId } = req.params;

		const adminRecord: any = await Admin.findOne(
			{
				_id: adminId,
			},
			{
				name: 1,
				email: 1,
				phoneNumber: 1,
				adminType: 1,
			}
		);

		if (!adminRecord) {
			return sendResponse(res, {
				statusCode: 409,
				success: false,
				message: 'Invalid adminId',
				data: {},
			});
		}

		Object.assign(req, {
			adminRecord,
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

export const checkUpdatedAttributes: RequestHandler = async (
	req: any,
	res,
	next
) => {
	try {
		const {
			name = '',
			email = '',
			phoneNumber = '',
			adminType = null,
		} = req.body;

		const updatedObj = {};

		if (name !== req.adminRecord?.name) {
			Object.assign(updatedObj, {
				name: {
					label: 'Name',
					prev: req.adminRecord?.name,
					new: name,
				},
			});
		}

		if (email !== req.adminRecord?.email) {
			Object.assign(updatedObj, {
				email: {
					label: 'Email',
					prev: req.adminRecord?.email,
					new: email,
				},
			});
		}

		if (phoneNumber !== req.adminRecord?.phoneNumber) {
			Object.assign(updatedObj, {
				phoneNumber: {
					label: 'Phone Number',
					prev: req.adminRecord?.phoneNumber,
					new: phoneNumber,
				},
			});
		}

		if (adminType !== req.adminRecord?.adminType) {
			Object.assign(updatedObj, {
				adminType: {
					label: 'Admin Type',
					prev: req.adminRecord?.adminType,
					new: adminType,
				},
			});
		}

		if (Object.keys(updatedObj).length) {
			Object.assign(req, {
				updatedObj,
			});
			return next();
		} else {
			return sendResponse(res, {
				statusCode: 200,
				success: true,
				message: 'Success',
				data: {},
			});
		}
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
