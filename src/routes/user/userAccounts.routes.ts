import { Router } from 'express';
import {
	userSendLoginCode,
	userLoginCodeVerificationResponse,
	userSignup,
	fetchUserProfile,
} from '../../controllers/user/user.controller.js';

import schemaValidator from '../../validators/schemaValidator.js';
import {
	checkPhoneNumberDuplication,
	isPhoneNumberAlreadyRegistered,
	userVerifyLoginCode,
} from '../../middlewares/user/user.middleware.js';
import { auth } from '../../middlewares/common/auth.middleware.js';

const userAccountRouter = Router();

userAccountRouter.post(
	'/send-login-code',
	schemaValidator('/user/send-login-verification'),
	isPhoneNumberAlreadyRegistered,
	userSendLoginCode
);

userAccountRouter.post(
	'/verify-login-code',
	schemaValidator('/user/verify-login-verification'),
	isPhoneNumberAlreadyRegistered,
	userVerifyLoginCode,
	userLoginCodeVerificationResponse
);

userAccountRouter.post(
	'/sign-up',
	schemaValidator('/user/sign-up'),
	isPhoneNumberAlreadyRegistered,
	checkPhoneNumberDuplication,
	userVerifyLoginCode,
	userSignup
);

userAccountRouter.get('/profile', auth, fetchUserProfile);

export default userAccountRouter;
