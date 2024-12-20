import { Response } from 'express';
import { sendResponse, generateRandomToken } from '../../util/utilities.js';
import { CONSTANTS } from '../../util/constants.js';
import S3Record from '../../models/s3Record.js';
import { fetchS3SignedUrl } from '../../services/s3/s3.js';
import { saveErrorLog } from '../../middlewares/common/errorLog.middleware.js';

export const getUploadFileSignedUrl = async (req: any, res: Response) => {
	try {
		const { fileType, mimeType } = req.query;
		/* profile-image, 
		campaign-cover-image, 
		campaign-story-image, 
		bank-document-image, 
		general-images */
		let fileKey = '';

		if (fileType === CONSTANTS.S3_FILE_TYPES.profileImage) {
			fileKey = `${CONSTANTS.S3_IMAGE_DIRECTORIES.profileImages}/1000X1000/`;
		} else if (fileType === CONSTANTS.S3_FILE_TYPES.campaignCoverImage) {
			fileKey = `${CONSTANTS.S3_IMAGE_DIRECTORIES.campaignCoverImages}/1000X1000/`;
		} else if (fileType === CONSTANTS.S3_FILE_TYPES.campaignStoryImage) {
			fileKey = `${CONSTANTS.S3_IMAGE_DIRECTORIES.campaignStoryImages}/1000X1000/`;
		} else if (fileType === CONSTANTS.S3_FILE_TYPES.bankDocumentImage) {
			fileKey = `${CONSTANTS.S3_IMAGE_DIRECTORIES.bankDocumentImages}/1000X1000/`;
		} else if (fileType === CONSTANTS.S3_FILE_TYPES.generalImage) {
			fileKey = `${CONSTANTS.S3_IMAGE_DIRECTORIES.generalImages}/1000X1000/`;
		} else {
			return sendResponse(res, {
				statusCode: 400,
				success: false,
				message: 'Please provide a valid file type.',
				data: {},
			});
		}

		if (
			mimeType !== 'png' &&
			mimeType !== 'jpg' &&
			mimeType !== 'jpeg' &&
			mimeType !== 'pdf'
		) {
			return sendResponse(res, {
				statusCode: 400,
				success: false,
				message: 'Please provide a valid file mime type.',
				data: {},
			});
		}

		const randomKey = generateRandomToken('Aa0', 6);

		const url: string = await fetchS3SignedUrl(
			fileKey,
			randomKey,
			mimeType
		);

		await new S3Record({
			url: url.split('?')[0],
			type: fileType,
		}).save();

		return sendResponse(res, {
			statusCode: 200,
			success: true,
			message: '',
			data: {
				url,
			},
		});
	} catch (err: any) {
		saveErrorLog({
			endpoint: req.originalUrl,
			params: Object.assign({
				urlParams: req.params,
				queryParams: req.query,
				bodyParams: req.body,
			}),
			errDetails: err,
			userId: req.user && !req.user.adminType ? req.user._id : null, //in user table adminType field doesn't exist
			adminId: req.user && req.user.adminType ? req.user._id : null,
		});

		return sendResponse(res, {
			statusCode: 500,
			success: false,
			message: 'Error occurred. Please try again later.',
			data: {},
		});
	}
};
