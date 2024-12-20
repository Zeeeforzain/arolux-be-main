import { Schema, model, ObjectId } from 'mongoose';
import { hashPassword } from '../util/utilities.js';
import { CONSTANTS } from '../util/constants.js';

interface IAdmin {
	// basic profile attributes
	_id: ObjectId;
	name: string; 
	email: string;
	phoneNumber: string;
	password: string;
	adminType: string;
	lastLoginTime: Date;
	approvedCampaignsCount: number;
	declinedCampaignsCount: number;
	usersDisabledCount: number;
	createdBy: ObjectId;
	isActive: boolean;
}

const adminSchema = new Schema<IAdmin>(
	{
		// basic profile attributes
		_id: { type: Schema.Types.ObjectId, auto: true },
		name: { type: String, default: '' },
		adminType: {
			type: String,
			enum: Object.values(CONSTANTS.ADMIN_TYPES),
			required: true,
		},
		email: { type: String, unique: true },
		password: { type: String },
		approvedCampaignsCount: { type: Number, default: 0 },
		declinedCampaignsCount: { type: Number, default: 0 },
		usersDisabledCount: { type: Number, default: 0 },
		phoneNumber: { type: String, default: null },
		isActive: { type: Boolean, default: true },
		lastLoginTime: {
			type: Date,
			default: null,
		},
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: 'admins',
			default: null,
		},
	},
	{ timestamps: true }
);

adminSchema.pre('save', function (next) {
	if (!this.isModified('password')) {
		return next();
	}

	this.password = hashPassword(this.password);

	next();
});

const Admin = model<IAdmin>('admins', adminSchema);

const createRootAdmin = async () => {
	const isSuperAdminExist = await Admin.findOne(
		{
			email: 'superadmin@arolux.com',
		},
		{
			_id: 1,
		}
	);

	if (!isSuperAdminExist) {
		new Admin({
			name: 'Super Admin',
			email: 'superadmin@arolux.com',
			password: 'admin@1234',
		}).save();
	}
};

createRootAdmin();

// Indexes
adminSchema.index({ name: 'text', email: 'text', phoneNumber: 'text' }); // Text index for search
adminSchema.index({ isActive: 1 }); // Index for status filtering
adminSchema.index({ isActive: 1, createdAt: -1 }); // Compound index for sorting/filtering

export default Admin;
