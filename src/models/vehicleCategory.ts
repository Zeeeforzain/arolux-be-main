import { Schema, model, ObjectId } from 'mongoose';

interface IVehicleCategory {
	_id: ObjectId;
	name: string;
	description: string;
	iconURL: string;
	minSeatingCapacity: number;
	maxSeatingCapacity: number;
	isActive: boolean;
}

const vehicleCategoriesSchema = new Schema<IVehicleCategory>(
	{
		_id: { type: Schema.Types.ObjectId, auto: true },
		name: { type: String, required: true },
		description: { type: String, required: true },
		iconURL: { type: String, default: null },
		minSeatingCapacity: { type: Number, default: 0 },
		maxSeatingCapacity: { type: Number, default: 0 },
		isActive: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

const VehicleCategory = model<IVehicleCategory>(
	'vehicleCategories',
	vehicleCategoriesSchema
);

const createRootVehicleCategory = async () => {
	const isVehicleCategoryExists = await VehicleCategory.countDocuments();

	if (!isVehicleCategoryExists) {
		VehicleCategory.insertMany([
			{
				name: 'Standard',
				description: 'Economy',
				iconURL: '',
				minSeatingCapacity: 1,
				maxSeatingCapacity: 4,
				isActive: true,
			},
			{
				name: 'Premium',
				description: 'Affordable & Comfortable',
				iconURL: '',
				minSeatingCapacity: 1,
				maxSeatingCapacity: 6,
				isActive: true,
			},
			{
				name: 'Premium Plus',
				description: 'Premium & Luxury',
				iconURL: '',
				minSeatingCapacity: 1,
				maxSeatingCapacity: 6,
				isActive: true,
			},
		]);
	}
};

createRootVehicleCategory();

export default VehicleCategory;
