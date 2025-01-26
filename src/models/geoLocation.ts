import { Schema, model } from 'mongoose';

interface IGeoLocation {
	_id: Schema.Types.ObjectId;
	name: string;
	boundaries: {
		type: string;
		coordinates: number[][][];
	};
	isActive: boolean;
}

const geoLocationsSchema = new Schema<IGeoLocation>(
	{
		_id: { type: Schema.Types.ObjectId, auto: true },
		name: { type: String, required: true },
		boundaries: {
			type: {
				type: String,
				enum: ['Polygon'], // Ensure it’s only Polygon
				default: 'Polygon',
			},
			coordinates: {
				type: [[[Number]]], // Correct GeoJSON Polygon structure
				required: true,
			},
		},
		isActive: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

// Adding a 2dsphere index for spatial queries
geoLocationsSchema.index({ boundaries: '2dsphere' });

const GeoLocation = model<IGeoLocation>('geoLocations', geoLocationsSchema);

export default GeoLocation;
