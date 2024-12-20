import {
	S3Client,
	PutObjectCommand,
	DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import dayjs from 'dayjs';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { readFileSync } from 'fs';
import { CONSTANTS } from '../../util/constants.js';
import mime from 'mime-types'; // Install using npm install mime-types
import { extname } from 'path';

const client = new S3Client({
	region: process.env.S3_REGION,
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
		secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
	},
});

export const fetchS3SignedUrl = async (
	fileKey: string,
	randomKey: string,
	mimeType: string
) => {
	const command = new PutObjectCommand({
		Bucket: process.env.S3_BUCKET,
		Key: `${fileKey}${randomKey}-${dayjs().unix().toString()}.${mimeType}`,
		ContentType: 'image/*',
	});

	return await getSignedUrl(client, command, { expiresIn: 120 });
};

export const deleteFile = async (fileUrls: string[]) => {
	const objects = fileUrls.map((fileUrl) => {
		const directories = fileUrl.split('/');

		let key = '';

		if (directories?.length) {
			if (directories[3] !== CONSTANTS.S3_IMAGE_DIRECTORIES.invoices) {
				key =
					directories[3] +
					'/' +
					directories[4] +
					'/' +
					directories[5];
			} else {
				key = directories[3] + '/' + directories[4];
			}
		}

		return {
			Key: key,
		};
	});

	let result = null;

	if (objects && objects.length) {
		const command = new DeleteObjectsCommand({
			Bucket: process.env.S3_BUCKET,
			Delete: {
				Objects: objects,
			},
		});
		console.log('Deleting AWS S3 objects: ', objects);
		result = await client.send(command);
	}
	return result;
};

export const uploadFileToS3 = async (filePath: string, key: string) => {
	const fileContent = readFileSync(filePath);
	const contentType =
		mime.lookup(extname(filePath)) || 'application/octet-stream';

	const params = {
		Bucket: process.env.S3_BUCKET,
		Key: key,
		Body: fileContent,
		ContentType: contentType,
	};

	const command = new PutObjectCommand(params);
	return client.send(command);
};
