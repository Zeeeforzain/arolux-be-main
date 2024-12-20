import { Router } from 'express';
import {
	adminLogin,
	adminLogout,
	adminProfile,
	createNewAdminAccount,
	updateAdminAccountPassword,
	updateAdminAccountStatus,
	updateAdminAccount,
	fetchAdminAccounts,
	fetchAdminAccountDetails,
} from '../../controllers/admin/adminAccount.controller.js';
import schemaValidator from '../../validators/schemaValidator.js';
import {
	decryptMiddleware,
	isAdminAllowedToPerformOperation,
	isEmailAlreadyUsed,
	isValidAdminId,
	checkUpdatedAttributes,
} from '../../middlewares/admin/admin.middleware.js';

import { adminAuth } from '../../middlewares/common/auth.middleware.js';
import { CONSTANTS } from '../../util/constants.js';

const adminRouter = Router();
adminRouter.post(
	'/login',
	decryptMiddleware,
	schemaValidator('/admin/login'),
	adminLogin
);
adminRouter.post('/logout', adminAuth, adminLogout);
adminRouter.get('/profile', adminAuth, adminProfile);

adminRouter.post(
	'/account',
	adminAuth,
	decryptMiddleware,
	schemaValidator('/admin/create-admin-account'),
	isAdminAllowedToPerformOperation([CONSTANTS.ADMIN_TYPES.superAdmin]),
	isEmailAlreadyUsed,
	createNewAdminAccount
);

adminRouter.put(
	'/:adminId/account/password',
	adminAuth,
	decryptMiddleware,
	schemaValidator('/admin/update-admin-account-password'),
	isAdminAllowedToPerformOperation([CONSTANTS.ADMIN_TYPES.superAdmin]),
	isValidAdminId,
	updateAdminAccountPassword
);

adminRouter.put(
	'/:adminId/account/status',
	adminAuth,
	schemaValidator('/admin/update-admin-account-status'),
	isAdminAllowedToPerformOperation([CONSTANTS.ADMIN_TYPES.superAdmin]),
	updateAdminAccountStatus
);

adminRouter.put(
	'/:adminId/account',
	adminAuth,
	schemaValidator('/admin/update-admin-account'),
	isAdminAllowedToPerformOperation([CONSTANTS.ADMIN_TYPES.superAdmin]),
	isValidAdminId,
	isEmailAlreadyUsed,
	checkUpdatedAttributes,
	updateAdminAccount
);

adminRouter.get(
	'/accounts',
	adminAuth,
	isAdminAllowedToPerformOperation([CONSTANTS.ADMIN_TYPES.superAdmin]),
	fetchAdminAccounts
);

adminRouter.get(
	'/:adminId/account',
	adminAuth,
	isAdminAllowedToPerformOperation([CONSTANTS.ADMIN_TYPES.superAdmin]),
	fetchAdminAccountDetails
);

export default adminRouter;
