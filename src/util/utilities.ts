import { Response } from 'express';
import { hashSync, compareSync } from 'bcrypt';
import { readFileSync, writeFileSync } from 'fs';
import path, { join } from 'path';
import crypto from 'crypto';
import jsonwebtoken from 'jsonwebtoken';
import { ObjectId, Types } from 'mongoose';
import randomatic from 'randomatic';
import axios from 'axios';
import Joi from 'joi';
import { Parser } from 'json2csv';
import fs from 'fs';
import dayjs from 'dayjs';
import sharp from 'sharp';

interface IResponsePayload {
	statusCode: number;
	success: boolean;
	message: string;
	data: any;
}

interface IJWTPayload {
	_id: ObjectId;
	email: string;
	type?: string;
	adminId?: ObjectId;
}

//utility functions
export const sendResponse = (res: Response, payload: IResponsePayload) => {
	return res.status(payload.statusCode).json({
		success: payload.success,
		message: payload.message,
		data: payload.data,
	});
};

export const hashPassword = (plainText: string) => {
	return hashSync(plainText, 10);
};

export const hashData = (data: any) => {
	return data ? crypto.createHash('sha256').update(data).digest('hex') : null;
};

export const encryptText = (text: string) => {
	const file = readFileSync(join(process.cwd(), 'public_key')).toString();
	return crypto
		.publicEncrypt(
			{
				key: file,
				padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
				oaepHash: 'sha256',
			},
			Buffer.from(text)
		)
		.toString('base64');
};

export const decryptText = (text: any) => {
	return crypto
		.privateDecrypt(
			{
				key:
					Buffer.from(
						process.env.PRIVATE_ENCRYPTION_KEY || '',
						'base64'
					).toString('utf-8') || '',
				padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
				oaepHash: 'sha256',
			},
			Buffer.from(text, 'base64')
		)
		.toString('utf8');
};

export const generateKeyPairs = () => {
	const keyPair = crypto.generateKeyPairSync('rsa', {
		modulusLength: 2048,
		publicKeyEncoding: {
			type: 'pkcs1',
			format: 'pem',
		},
		privateKeyEncoding: {
			type: 'pkcs1',
			format: 'pem',
		},
	});

	writeFileSync('public_key', keyPair.publicKey);
	writeFileSync('private_key', keyPair.privateKey);
};

export const checkPasswordFormat = (password: string) => {
	return new RegExp(
		'^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!.@#$%^&*]){12}'
	).test(password);
};

export const comparePassword = (
	enteredPassword: string,
	actualPassword: string
) => {
	return compareSync(enteredPassword, actualPassword);
};

export const signJWT = (payload: IJWTPayload) => {
	return (
		'Bearer ' +
		jsonwebtoken.sign(payload, process.env.JWT_SECRET || '', {
			expiresIn: process.env.JWT_TOKEN_EXPIRY,
		})
	);
};

export const fetchAccessAndRefreshToken = (payload: IJWTPayload) => {
	return {
		accessToken:
			'Bearer ' +
			jsonwebtoken.sign(payload, process.env.JWT_SECRET || '', {
				expiresIn: process.env.JWT_TOKEN_EXPIRY,
			}),
		refreshToken:
			'Bearer ' +
			jsonwebtoken.sign(payload, process.env.JWT_REFRESH_SECRET || '', {
				expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRY,
			}),
	};
};

export const verifyJWTToken = (token: string) => {
	return jsonwebtoken.verify(
		token.split(' ')[1],
		process.env.JWT_SECRET || ''
	);
};

export const verifyJWTRefreshToken = (token: string) => {
	return jsonwebtoken.verify(
		token.split(' ')[1],
		process.env.JWT_REFRESH_SECRET || ''
	);
};

export const generateRandomToken = (pattern: string, length: number) => {
	return randomatic(pattern, length);
};

export const concatFirstAndLastName = (firstName: string, lastName: string) => {
	const capitalize = (name: string) =>
		name?.charAt(0).toUpperCase() + name?.slice(1).toLowerCase();

	const formattedFirstName = capitalize(firstName?.trim());
	const formattedLastName = lastName?.trim()
		? capitalize(lastName?.trim())
		: '';

	return formattedLastName
		? `${formattedFirstName} ${formattedLastName}`
		: formattedFirstName;
};

export const requestExternalAPI = async (
	type: string,
	url: string,
	payload: any
) => {
	if (type === 'get') {
		return axios.get(url, payload).catch(() => {
			return null;
		});
	} else if (type === 'head') {
		return axios.head(url, payload).catch(() => {
			return null;
		});
	} else {
		return axios.post(url, payload).catch((err: any) => {
			console.log(err?.response?.data);
			return null;
		});
	}
};

export const compressImage = async (buffer: any) => {
	return await sharp(buffer).jpeg({ quality: 80 }).toBuffer();
};

export const resizeImage = async (
	buffer: any,
	width: number,
	height: number
) => {
	return await sharp(buffer)
		.resize(width, height, {
			fit: sharp.fit.contain, // Ensures the image fits within the dimensions, adding padding if necessary
			background: { r: 255, g: 255, b: 255, alpha: 1 }, // White background for padding
		})
		.toBuffer();
};

export const unicodeToChar = (text: string) => {
	return text.replace(/\\u[\dA-F]{4}/gi, (match: string) => {
		return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
	});
};

export const capitalFirstLetter = (text: string) => {
	const arr = text?.split(' ');

	for (let i = 0; i < arr.length; i++) {
		arr[i] =
			arr[i]?.charAt(0)?.toUpperCase() +
			arr[i]?.slice(1)?.toLocaleLowerCase();
	}

	return arr?.join(' ');
};

export const JoiObjectId = (message = 'valid id') =>
	Joi.string().regex(/^[0-9a-fA-F]{24}$/, message);

export const objectsEqual: any = (o1: any, o2: any) => {
	let isEqual = false;

	if (typeof o1 === 'object' && Object.keys(o1).length > 0) {
		if (Object.keys(o1).length === Object.keys(o2).length) {
			isEqual = Object.keys(o1).every((p: any) => {
				if (Array.isArray(o1[p])) {
					return arraysEqual(o1[p], o2[p]);
				} else if (Types.ObjectId.isValid(o1[p])) {
					return new Types.ObjectId(o1[p]).equals(o2[p]);
				} else {
					return o1[p] === o2[p];
				}
			});
		}
	} else {
		isEqual = o1 === o2;
	}

	return isEqual;
};

export const arraysEqual = (a1: any[], a2: any[]) => {
	return (
		a1.length === a2.length && a1.every((o) => a2.find((o2) => o2 === o))
	);
};

export const arrayOfObjectsEqual = (a1: any[], a2: any[]) =>
	a1.length === a2.length && a1.every((o, idx) => objectsEqual(o, a2[idx]));

export const concatNames = (names: string[]) => {
	return names.filter((name) => name && name.trim() !== '').join(' ');
};

export const fetchFrankfurterCurrencyRates = async (
	from: string,
	to: string
) => {
	return requestExternalAPI(
		'get',
		`https://api.frankfurter.dev/v1/latest?from=${from}&to=${to}`,
		null
	);
};

export const fetchExchangeRates = async (from: string) => {
	// {"amount":1.0,"base":"USD","date":"2024-09-26","rates":{"EUR":0.89646}}
	return requestExternalAPI(
		'get',
		`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${from.toLowerCase()}.json`,
		null
	);
};

export const fetchCurrencyRates = async (from: string, to: string) => {
	// try {
	// const response = await fetchExchangeRates(from);

	// if (response?.data) {
	// 	//To match frankfurter api response
	// 	return {
	// 		data: {
	// 			amount: 1.0,
	// 			base: from.toUpperCase(),
	// 			date: response.data.date,
	// 			rates: {
	// 				[to.toUpperCase()]:
	// 					response.data[from.toLowerCase()][to.toLowerCase()],
	// 			},
	// 		},
	// 	};
	// } else {
	return fetchFrankfurterCurrencyRates(from, to);
	// 	}
	// } catch (err) {
	// 	return fetchFrankfurterCurrencyRates(from, to);
	// }
};

export const fetchIPStackDetails = async (ipAddress: string) => {
	return requestExternalAPI(
		'get',
		`http://api.ipstack.com/${ipAddress.split(',')[0]}?access_key=${
			process.env.IPSTACK_API_ACCESS_KEY
		}`,
		null
	);
};

export const sortArrayOfObjectsByNumbers = (
	array: any[],
	key: string,
	order: number
) => {
	// order 1 for asc and -1 for desc
	return array.sort((a: any, b: any) => {
		return order === 1 ? a[key] - b[key] : b[key] - a[key];
	});
};

export const escapeDotsForRegex = (str: string) => {
	return str.replace(/\./g, '\\.');
};

async function ensureDirectoryExistence(filePath: string) {
	const dirname = path.dirname(filePath);

	if (!fs.existsSync(dirname)) {
		await fs.promises.mkdir(dirname, { recursive: true });
	}
}

export const createCSVFile = async (jsonArray: any[], csvPath: string) => {
	try {
		// Convert all values to strings
		const jsonArrayAsStrings = jsonArray.map((row) => {
			const newRow: Record<string, string> = {};
			for (const key in row) {
				if (Object.prototype.hasOwnProperty.call(row, key)) {
					const value =
						row[key] !== undefined ? String(row[key]) : '';
					newRow[key] = value;
				}
			}
			return newRow;
		});

		// Create a new instance of the parser
		const json2csvParser = new Parser();
		const csv = json2csvParser.parse(jsonArrayAsStrings);

		await ensureDirectoryExistence(csvPath);

		// Write the CSV to a file
		await fs.promises.writeFile(csvPath, csv);
		console.log('CSV file written successfully');
	} catch (err) {
		console.error('Error writing CSV file', err);
		throw err;
	}
};

export const parseDateString = (dateStr: string) => {
	const [day, month, year] = dateStr.split('-');
	return new Date(`${year}-${month}-${day}`);
};

export const escapeSpecialCharacters = (str: string) => {
	return str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
};

export const replaceRegexPattern = (str: string) => {
	return str.replace(/\s+/g, '\\s*');
};

export const sanitizeScript = (script: string) => {
	// Remove any script tags or potentially harmful JavaScript functions
	// return script
	// 	.replace(/<script.*?>.*?<\/script>/gi, '')
	// 	.replace(/(eval|alert|document|window)\(.*\)/gi, '');

	// Basic cleanup to remove script tags and common harmful functions
	script = script
		.replace(/<script.?>.?<\/script>/gi, '')
		.replace(
			/(eval|alert|document\.write|window|document|\.innerHTML)/gi,
			''
		);

	// Attempt to detect loops that could potentially run indefinitely
	// This is a very basic and flawed example that looks for loops without obvious exit conditions
	const loopRegex = /\b(for|while)\s*\(([^)])\)\s\{([^}]*)\}/gi;

	let match;

	while ((match = loopRegex.exec(script))) {
		if (!match[2].includes(';')) {
			// Checking for a very simple condition and not a compound one
			console.error('Potentially dangerous loop detected:', match[0]);
			throw new Error('Script contains potentially dangerous loops.');
		}
	}

	return script;
};

export const replaceSpacesWithHyphen = (str: string) => {
	return str.replace(/\s+/g, '-');
};

export const isValidDate = (dateString: string) => {
	return dayjs(dateString, 'YYYY-MM-DD', true).isValid();
};

export const isValidMonthNameAbbrevation = (month: string) => {
	// Create an array of valid month abbreviations
	const validMonths = [
		'jan',
		'feb',
		'mar',
		'apr',
		'may',
		'jun',
		'jul',
		'aug',
		'sep',
		'oct',
		'nov',
		'dec',
	];

	// Check if the provided month is in the validMonths array
	return validMonths.includes(month.toLowerCase());
};

export const sanitizeInput = (str: string) => {
	return str === '' ||
		str === 'null' ||
		str === 'undefined' ||
		str === undefined
		? null
		: str;
};

export const sanitizeBooleanInput = (input: string | boolean) => {
	if (
		input === '' ||
		input === 'null' ||
		input === 'undefined' ||
		input === undefined
	) {
		return null;
	} else if (input === 'true') {
		return true;
	} else if (input === 'false') {
		return false;
	}
	return input;
};

// Function to check if any blacklisted word is present
export const containsBlacklistedWord = (
	text: string,
	blacklistedWords: string[]
) => {
	if (!text) return false;
	return blacklistedWords.some((word) =>
		text.toLowerCase().includes(word.toLowerCase())
	);
};

// Function to check and collect blacklisted words from a text
export const collectBlacklistedWords = (
	text: string,
	blacklistedWords: string[]
) => {
	const detectedBlacklistedWords: string[] = [];

	if (!text) return;

	blacklistedWords.forEach((word) => {
		if (text.toLowerCase().includes(word.toLowerCase())) {
			detectedBlacklistedWords.push(word);
		}
	});

	return detectedBlacklistedWords;
};

export const extractImageUrlsFromText = (text: string): string[] => {
	try {
		const imageUrls: string[] = [];
		const regex = /<img\s[^>]*src="([^"]+\.(?:png|jpe?g|gif))"/gi;

		let match;

		while ((match = regex.exec(text)) !== null) {
			imageUrls.push(match[1]);
		}

		return imageUrls;
	} catch (err) {
		return [];
	}
};

export const isValidURL = (url: string) => {
	const pattern = new RegExp(
		'^(https?:\\/\\/)?' + // protocol
			'((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}|' + // domain name
			'((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
			'(\\:\\d+)?(\\/[-a-zA-Z\\d%_.~+]*)*' + // port and path
			'(\\?[;&a-zA-Z\\d%_.~+=-]*)?' + // query string
			'(\\#[-a-zA-Z\\d_]*)?$',
		'i'
	); // fragment locator
	return !!pattern.test(url);
};
