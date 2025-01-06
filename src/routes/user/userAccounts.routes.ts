import { Router } from 'express';
import {
	userSendLoginCode,
	userVerifyLoginCode,
} from '../../controllers/user/user.controller.js';

import schemaValidator from '../../validators/schemaValidator.js';
import { isPhoneNumberAlreadyRegistered } from '../../middlewares/user/user.middleware.js';

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
	userVerifyLoginCode
);

export default userAccountRouter;
