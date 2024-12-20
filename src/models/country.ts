import { Schema, model, ObjectId } from 'mongoose';

interface ICurrency {
	name: string;
	symbol: string;
	code: string;
	isActive: boolean;
}

interface ICountry {
	_id: ObjectId;
	name: string;
	currency: ICurrency;
	isoAlpha2: string;
	isoAlpha3: string;
	isoNumeric: number;
	imageUrl: string;
	flag: string;
	phoneCode: string;
	postalCodeFormat: string;
	postalCodeValidator: string;
	mask: string;
	isActive: boolean;
}

const countrySchema = new Schema<ICountry>(
	{
		_id: { type: Schema.Types.ObjectId, auto: true },
		name: { type: String, required: true },
		isoAlpha2: { type: String, default: '' },
		isoAlpha3: { type: String, default: '' },
		isoNumeric: { type: Number },
		currency: {
			name: { type: String, default: '' },
			symbol: { type: String, default: '' },
			code: { type: String, default: '' },
			isActive: { type: Boolean, default: false },
		},
		phoneCode: { type: String, default: '' },
		postalCodeFormat: { type: String, default: '' },
		imageUrl: { type: String, default: '' },
		postalCodeValidator: { type: String, default: '' },
		flag: { type: String, default: '' },
		mask: { type: String, default: '' },
		isActive: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

// Indexes
countrySchema.index({ isoAlpha2: 1 }, { unique: true });
countrySchema.index({ isoAlpha3: 1 }, { unique: true });
countrySchema.index({ name: 1 });
countrySchema.index({ isActive: 1, 'currency.isActive': 1 });

const Country = model<ICountry>('countries', countrySchema);

export default Country;
