import { Schema, model, ObjectId } from 'mongoose';
import { CONSTANTS } from '../util/constants.js';

interface IActionLog {
	_id: ObjectId;
	logType: string;
	details: object;
	userId: ObjectId;
	adminId: ObjectId;
	campaignId: ObjectId;
	paymentId: ObjectId;
	categoryId: ObjectId;
	charityOrganizationId: ObjectId;
	loginAs: string;
}

const actionLogsSchema = new Schema<IActionLog>(
	{
		_id: { type: Schema.Types.ObjectId, auto: true },
		logType: {
			type: String,
			enum: Object.values(CONSTANTS.LOG_TYPES.user).concat(
				Object.values(CONSTANTS.LOG_TYPES.admin)
			),
			required: true,
		},
		details: { type: Object },
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'users',
			default: null,
		},
		adminId: {
			type: Schema.Types.ObjectId,
			ref: 'admins',
			default: null,
		},
		campaignId: {
			type: Schema.Types.ObjectId,
			ref: 'campaigns',
			default: null,
		},
		paymentId: {
			type: Schema.Types.ObjectId,
			ref: 'payments',
			default: null,
		},
		categoryId: {
			type: Schema.Types.ObjectId,
			ref: 'campaignCategories',
			default: null,
		},
		charityOrganizationId: {
			type: Schema.Types.ObjectId,
			ref: 'charityOrganizations',
			default: null,
		},
		loginAs: {
			type: String,
			default: null,
		},
	},
	{ timestamps: true }
);

actionLogsSchema.index({ adminId: 1, logType: 1, loginAs: 1 }); // Compound index for match queries
actionLogsSchema.index({ createdAt: 1 }); // Index for date range filtering

const ActionLog = model<IActionLog>('actionLogs', actionLogsSchema);

export default ActionLog;
