import { Request, Response, Router } from 'express';

import userAccountRouter from './user/userAccounts.routes.js';

import adminRouter from './admin/adminAccount.routes.js';
import commonRouter from './common/common.routes.js';

const router = Router();
const baseRoute = '/api/v1';

// Base route
router.get(`${baseRoute}/`, (req: Request, res: Response) => {
	res.json({
		success: true,
		message: 'Api server is running',
		data: {},
	});
});

// User Routes
router.use(`${baseRoute}/user`, userAccountRouter);

// Admin Routes
router.use(`${baseRoute}/admin`, adminRouter);

// Common Routes
router.use(`${baseRoute}`, commonRouter);

export default router;
