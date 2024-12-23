import { RequestHandler } from 'express';
import User from '../../models/userAccounts.js';
import Country from '../../models/country.js';

import {
	sendResponse,
	decryptText,
	requestExternalAPI,
	unicodeToChar,
} from '../../util/utilities.js';
import { CONSTANTS } from '../../util/constants.js';
import jsonwebtoken from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { saveErrorLog } from '../common/errorLog.middleware.js';

const client = jwksClient({
	jwksUri: 'https://appleId.apple.com/auth/keys',
});

export const isEmailAlreadyUsed: RequestHandler = async (
	req: any,
	res,
	next
) => {
	try {
		const email = req.body.email;

		const filter = {
			email,
		};

		if (req.user) {
			Object.assign(filter, {
				_id: {
					$ne: req.user._id,
				},
			});
		}

		const emailRecord: any = await User.countDocuments(filter);

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

export const isPhoneNumberAlreadyLinked: RequestHandler = async (
	req: any,
	res,
	next
) => {
	try {
		const phoneNumber = req.body.phoneNumber;
		const phoneNumberRecord: any = await User.countDocuments({
			_id: {
				$ne: req.user._id,
			},
			phoneNumber,
		});

		if (phoneNumberRecord) {
			return sendResponse(res, {
				statusCode: 409,
				success: false,
				message: 'An account with same phone number already exists',
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

export const decryptMiddleware: RequestHandler = async (
	req: any,
	res,
	next
) => {
	try {
		const data: string = req.body.data;

		if (!data || data === '') {
			return sendResponse(res, {
				statusCode: 400,
				success: false,
				message: 'Required data missing',
				data: {},
			});
		}

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

export const validateAccessToken: RequestHandler = async (
	req: any,
	res,
	next
) => {
	try {
		//socialType can be google/facebook/apple
		const { accessToken, socialType } = req.body;

		let apiResponse = null;

		try {
			if (socialType === CONSTANTS.ACCOUNT_SOCIAL_TYPES.GOOGLE) {
				apiResponse = await requestExternalAPI(
					'get',
					`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`,
					null
				);
			} else if (socialType === CONSTANTS.ACCOUNT_SOCIAL_TYPES.FACEBOOK) {
				apiResponse = await requestExternalAPI(
					'get',
					`https://graph.facebook.com/v13.0/me?fields=email,first_name,last_name&access_token=${accessToken}`,
					null
				);
			} else if (socialType === CONSTANTS.ACCOUNT_SOCIAL_TYPES.APPLE) {
				// First we will decode token returned from apple
				const token = accessToken.data.authorization.id_token;
				const decoded: any = jsonwebtoken.decode(token, {
					complete: true,
				});

				if (decoded) {
					const key = await getAppleSignInKey(
						decoded?.header?.kid || ''
					);

					if (key) {
						const payload: any = jsonwebtoken.verify(token, key);

						if (
							(payload && payload.sub === decoded.payload.sub) ||
							payload.aud === 'com.arolux.service'
						) {
							if (accessToken.data.user) {
								Object.assign(payload, {
									first_name:
										accessToken.data.user.name?.firstName,
									last_name:
										accessToken.data.user.name?.lastName,
									email: payload.email,
									email_verified: payload.email_verified,
								});
							}

							apiResponse = {
								data: payload,
							};
						}
					}
				}
			}

			if (!apiResponse || !apiResponse.data || apiResponse.data.error) {
				return sendResponse(res, {
					statusCode: 400,
					success: false,
					message: `Error occurred while sign in with ${socialType}. Please try again later.`,
					data: {},
				});
			}

			if (apiResponse.data.email && apiResponse.data.email !== '') {
				apiResponse.data.email = unicodeToChar(apiResponse.data.email);
			}

			Object.assign(req, {
				profile: apiResponse.data,
			});

			return next();
		} catch (err) {
			return sendResponse(res, {
				statusCode: 400,
				success: false,
				message: `Error occurred while sign in with ${socialType}. Please try again later.`,
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

const getAppleSignInKey = async (kid: string) => {
	const key = await client.getSigningKey(kid);
	return key.getPublicKey();
};

export const isValidCountryId: RequestHandler = async (req: any, res, next) => {
	try {
		const countryId = req.body.countryId;
		const isCountryExist: any = await Country.findOne(
			{
				_id: countryId,
				isActive: true,
			},
			{
				isoAlpha2: 1,
			}
		);

		if (!isCountryExist) {
			return sendResponse(res, {
				statusCode: 409,
				success: false,
				message: 'Invalid country',
				data: {},
			});
		}

		Object.assign(req, {
			countryDetails: isCountryExist,
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

export const isValidCurrencyId: RequestHandler = async (
	req: any,
	res,
	next
) => {
	try {
		const currencyId = req.body.currencyId;
		const isCountryExist: any = await Country.findOne(
			{
				_id: currencyId,
				isActive: true,
			},
			{
				currency: 1,
			}
		);

		if (!isCountryExist) {
			return sendResponse(res, {
				statusCode: 409,
				success: false,
				message: 'Invalid currency',
				data: {},
			});
		}

		Object.assign(req, {
			currencyDetails: isCountryExist,
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

export const validateCountryBankInfo: RequestHandler = async (
	req: any,
	res,
	next
) => {
	try {
		const {
			payoutMethod,
			swiftCode,
			ibanNumber,
			routingNumber,
			sortCode,
			bankName,
			accountNumber,
			countryId,
			currencyId,
			accountName,
			accountClass,
			accountType,
			bankDocuments,
			instituteNumber,
			transitNumber,
		} = req.body;

		const allowedPayoutMethods = ['wire'];

		const updatedBankInfo = {
			countryId: req.countryDetails ? req.countryDetails._id : countryId,
			currencyId: req.currencyDetails
				? req.currencyDetails._id
				: currencyId,
			bankName,
			accountName,
			accountClass,
			accountType,
			payoutMethod,
			bankDocuments,
			swiftCode: null,
			ibanNumber: null,
			routingNumber: null,
			sortCode: null,
			accountNumber: null,
		};

		if (req.countryDetails) {
			if (req.countryDetails.isoAlpha2 === 'US') {
				// United States/*
				if (!routingNumber || routingNumber === '') {
					return sendResponse(res, {
						statusCode: 400,
						success: false,
						message: 'Routing number required.',
						data: {},
					});
				}

				if (!accountNumber || accountNumber === '') {
					return sendResponse(res, {
						statusCode: 400,
						success: false,
						message: 'Account number required.',
						data: {},
					});
				}

				allowedPayoutMethods.push('ach');

				Object.assign(updatedBankInfo, {
					routingNumber,
					accountNumber,
				});
			} else if (req.countryDetails.isoAlpha2 === 'GB') {
				// United Kingdom

				if (!sortCode || sortCode === '') {
					return sendResponse(res, {
						statusCode: 400,
						success: false,
						message: 'Sort code required.',
						data: {},
					});
				}

				if (!accountNumber || accountNumber === '') {
					return sendResponse(res, {
						statusCode: 400,
						success: false,
						message: 'Account number required.',
						data: {},
					});
				}

				Object.assign(updatedBankInfo, {
					sortCode: sortCode,
					accountNumber: accountNumber,
				});
			} else if (req.countryDetails.isoAlpha2 === 'CA') {
				// Canada
				if (!accountNumber || accountNumber === '') {
					return sendResponse(res, {
						statusCode: 400,
						success: false,
						message: 'Account number required.',
						data: {},
					});
				}

				if (payoutMethod === 'wire') {
					if (!swiftCode || swiftCode === '') {
						return sendResponse(res, {
							statusCode: 400,
							success: false,
							message: 'Swift code required.',
							data: {},
						});
					}
					Object.assign(updatedBankInfo, {
						accountNumber,
						swiftCode,
					});
				} else if (payoutMethod === 'eft') {
					if (!transitNumber || transitNumber === '') {
						return sendResponse(res, {
							statusCode: 400,
							success: false,
							message: 'Transit number required.',
							data: {},
						});
					}

					if (!instituteNumber || instituteNumber === '') {
						return sendResponse(res, {
							statusCode: 400,
							success: false,
							message: 'Institute number required.',
							data: {},
						});
					}

					Object.assign(updatedBankInfo, {
						accountNumber,
						transitNumber,
						instituteNumber,
					});
				}

				allowedPayoutMethods.push('eft');
			} else {
				if (!swiftCode || swiftCode === '') {
					return sendResponse(res, {
						statusCode: 400,
						success: false,
						message: 'Swift code required.',
						data: {},
					});
				}

				if (!ibanNumber || ibanNumber === '') {
					return sendResponse(res, {
						statusCode: 400,
						success: false,
						message: 'IBAN required.',
						data: {},
					});
				}

				Object.assign(updatedBankInfo, {
					ibanNumber: ibanNumber,
					swiftCode: swiftCode,
				});

				allowedPayoutMethods.push('eft');
			}

			if (!allowedPayoutMethods.includes(payoutMethod)) {
				return sendResponse(res, {
					statusCode: 400,
					success: false,
					message: 'Invalid payout method selected.',
					data: {},
				});
			}

			Object.assign(req, {
				updatedBankInfo,
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
