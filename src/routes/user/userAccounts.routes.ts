import { Router } from 'express';
import { userSendLoginCode } from '../../controllers/user/user.controller.js';

import schemaValidator from '../../validators/schemaValidator.js';
import { isPhoneNumberAlreadyRegistered } from '../../middlewares/user/user.middleware.js';

const userAccountRouter = Router();

userAccountRouter.post(
	'/send-phone-verification',
	schemaValidator('/user/send-phone-verification'),
	isPhoneNumberAlreadyRegistered,
	userSendLoginCode
);

export default userAccountRouter;
