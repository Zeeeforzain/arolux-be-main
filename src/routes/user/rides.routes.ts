import { Router } from 'express';
import {
	fetchVehicleCategories,
	fetchUserDashboard,
	sendServiceAreaResponse,
} from '../../controllers/user/rides.controller.js';

// import schemaValidator from '../../validators/schemaValidator.js';
import { checkServiceArea } from '../../middlewares/user/rides.middleware.js';
// import { auth } from '../../middlewares/common/auth.middleware.js';

const userRidesRouter = Router();

userRidesRouter.get('/home', checkServiceArea, fetchUserDashboard);
userRidesRouter.get('/service-area', checkServiceArea, sendServiceAreaResponse);

userRidesRouter.get(
	'/vehicle-categories',
	checkServiceArea,
	fetchVehicleCategories
);

// userRidesRouter.post(
// 	'/booking/confirm',
// 	checkServiceArea,
//     saveCardDetails,
// 	fetchVehicleCategories
// );

export default userRidesRouter;
