import { Schema, model, ObjectId } from 'mongoose';

interface IConfiguration {
	_id: ObjectId;
	emailVerificationIntervalSecs: number;
	emailVerificationExpiryTimeInMinutes: number;
	passwordRecoveryIntervalSecs: number;
	passwordRecoveryExpiryTimeInMinutes: number;
	phoneVerificationExpiryTimeInMins: number;
	recurringSubscriptionPercentages: number[];
	supportEmail: string;
	paymentProcessingFeesPercentage: number;
}

const configurationSchema = new Schema<IConfiguration>(
	{
		_id: { type: Schema.Types.ObjectId, auto: true },

		// password recovery attributes
		emailVerificationIntervalSecs: {
			type: Number,
			default: 60,
		},
		emailVerificationExpiryTimeInMinutes: { type: Number, default: 60 },

		// password recovery attributes
		passwordRecoveryIntervalSecs: {
			type: Number,
			default: 60,
		},
		passwordRecoveryExpiryTimeInMinutes: { type: Number, default: 60 },

		// password recovery attributes
		phoneVerificationExpiryTimeInMins: {
			type: Number,
			default: 5,
		},
		recurringSubscriptionPercentages: [Number],
		supportEmail: { type: String, default: '' },
		paymentProcessingFeesPercentage: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true }
);

const Configuration = model<IConfiguration>(
	'configurations',
	configurationSchema
);

const createRootConfigurations = async () => {
	const configurations = await Configuration.countDocuments();

	if (!configurations) {
		new Configuration({
			emailVerificationIntervalSecs: 60,
			emailVerificationExpiryTimeInMinutes: 60,
			passwordRecoveryIntervalSecs: 60,
			passwordRecoveryExpiryTimeInMinutes: 60,
			phoneVerificationExpiryTimeInMins: 5,
			recurringSubscriptionPercentages: [35, 25],
			paymentProcessingFeesPercentage: 0,
		}).save();
	}
};

createRootConfigurations();

export default Configuration;
