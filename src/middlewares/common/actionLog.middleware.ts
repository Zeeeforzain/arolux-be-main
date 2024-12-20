import { ObjectId } from 'mongoose';
import ActionLog from '../../models/actionLog.js';

export const saveActionLog = async (payload: {
	logType: string;
	details?: object | null;
	userId?: ObjectId | null;
	adminId?: ObjectId | null;
	campaignId?: ObjectId | null;
	paymentId?: ObjectId | null;
	categoryId?: ObjectId | null;
	charityOrganizationId?: ObjectId | null;
	loginAs?: string | null;
}) => {
	return await new ActionLog({
		logType: payload.logType,
		details: payload.details,
		userId: payload.userId,
		adminId: payload.adminId,
		campaignId: payload.campaignId,
		categoryId: payload.categoryId,
		charityOrganizationId: payload.charityOrganizationId,
		loginAs: payload.loginAs,
	}).save();
};
