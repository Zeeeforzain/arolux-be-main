import { Router } from 'express';
import {
	userLogin,
	userLogout,
} from '../../controllers/user/user.controller.js';

import schemaValidator from '../../validators/schemaValidator.js';
import { isPhoneNumberAlreadyRegistered } from '../../middlewares/user/user.middleware.js';

import {
	auth,
	isLoggedInAdminAllowedToPerformOperation,
} from '../../middlewares/common/auth.middleware.js';
import { CONSTANTS } from '../../util/constants.js';

const userAccountRouter = Router();

userAccountRouter.post(
	'/login',
	schemaValidator('/user/login'),
	isPhoneNumberAlreadyRegistered,
	userLogin
);

// userAccountRouter.post(
// 	'/signup',
// 	decryptMiddleware,
// 	schemaValidator('/user/signup'),
// 	isEmailAlreadyUsed,
// 	userSignup
// );

// userAccountRouter.post(
// 	'/token',
// 	schemaValidator('/user/refresh-token'),
// 	userRefreshToken
// );

userAccountRouter.post(
	'/logout',
	auth,
	isLoggedInAdminAllowedToPerformOperation(
		Object.values(CONSTANTS.ADMIN_TYPES)
	),
	userLogout
);

export default userAccountRouter;
