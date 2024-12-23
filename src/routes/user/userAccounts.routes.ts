import { Router } from 'express';
import {
	userSignup,
	userLogin,
	userLogout,
	userRefreshToken,
} from '../../controllers/user/user.controller.js';

import schemaValidator from '../../validators/schemaValidator.js';
import {
	isEmailAlreadyUsed,
	decryptMiddleware,
} from '../../middlewares/user/user.middleware.js';

import {
	auth,
	isLoggedInAdminAllowedToPerformOperation,
} from '../../middlewares/common/auth.middleware.js';
import { CONSTANTS } from '../../util/constants.js';

const userAccountRouter = Router();
//Signup via email
userAccountRouter.post(
	'/signup',
	decryptMiddleware,
	schemaValidator('/user/signup'),
	isEmailAlreadyUsed,
	userSignup
);

//Login via email
userAccountRouter.post(
	'/login',
	decryptMiddleware,
	schemaValidator('/user/login'),
	userLogin
);

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
