import { ObjectId } from 'mongoose';
import ErrorLog from '../../models/errorLog.js';

export const saveErrorLog = async (payload: {
	endpoint?: string | null;
	ipAddress?: string | null;
	params?: object | null;
	errDetails?: object | null;
	userId?: ObjectId | null;
	adminId?: ObjectId | null;
	paymentId?: ObjectId | null;
}) => {
	return await new ErrorLog({
		endpoint: payload.endpoint,
		ipAddress: payload.ipAddress,
		params: payload.params,
		errDetails: payload.errDetails,
		userId: payload.userId,
		adminId: payload.adminId,
		paymentId: payload.paymentId,
	}).save();
};
