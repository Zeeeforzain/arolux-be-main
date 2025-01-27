import { Schema, model, ObjectId } from 'mongoose';

interface IVehicleCategoryFare {
	_id: ObjectId;
	vehicleCategoryId: ObjectId;
	geoLocationId: ObjectId;
	baseFare: number;
	chargesPerMile: number;
	chargesPerMinute: number;
	chargesPerHour: number;
	minimumFare: number;
	suitedCharges: number;
	extraCharges: any[];
	currencyCode: string;
	currencySymbol: string;
}

const vehicleCategoryFareSchema = new Schema<IVehicleCategoryFare>(
	{
		_id: { type: Schema.Types.ObjectId, auto: true },
		baseFare: { type: Number, default: 0 },
		chargesPerMile: { type: Number, default: 0 },
		chargesPerMinute: { type: Number, default: 0 },
		chargesPerHour: { type: Number, default: 0 },
		minimumFare: { type: Number, default: 0 },
		suitedCharges: { type: Number, default: 0 },
		extraCharges: [],
		currencyCode: { type: String, required: true },
		currencySymbol: { type: String, required: true },
		vehicleCategoryId: {
			type: Schema.Types.ObjectId,
			ref: 'vehicleCategories',
			default: null,
		},
		geoLocationId: {
			type: Schema.Types.ObjectId,
			ref: 'geoLocations',
			default: null,
		},
	},
	{ timestamps: true }
);

const VehicleCategoryFare = model<IVehicleCategoryFare>(
	'vehicleCategoryFares',
	vehicleCategoryFareSchema
);

export default VehicleCategoryFare;
