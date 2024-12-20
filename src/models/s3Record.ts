import { Schema, model, ObjectId } from 'mongoose';

interface IS3Record {
	_id: ObjectId;
	url: string;
	type: string;
}

const s3RecordSchema = new Schema<IS3Record>(
	{
		_id: { type: Schema.Types.ObjectId, auto: true },
		url: {
			type: String,
			required: true,
		},
		type: { type: String, required: true },
	},
	{ timestamps: true }
);

s3RecordSchema.index({ type: 1, createdAt: 1 });

const S3Record = model<IS3Record>('s3Records', s3RecordSchema);

export default S3Record;
