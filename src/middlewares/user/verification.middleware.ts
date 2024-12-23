import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import twilio, { MessageInstance } from 'twilio';

// Assuming you have Twilio credentials
const accountSid = 'your_twilio_account_sid';
const authToken = 'your_twilio_auth_token';
const client = twilio(accountSid, authToken);

// Store the verification code temporarily (in production, you should use a database)
interface VerificationCodes {
	[phoneNumber: string]: string;
}

let verificationCodes: VerificationCodes = {};

function generateVerificationCode(): string {
	// Generates a 4-digit code
	return crypto.randomInt(1000, 9999).toString();
}

async function sendVerificationCode(phoneNumber: string): Promise<void> {
	const code = generateVerificationCode();
	verificationCodes[phoneNumber] = code;

	// Send the verification code via SMS (using Twilio as an example)
	try {
		const message: MessageInstance = await client.messages.create({
			body: `Your verification code is: ${code}`,
			from: 'your_twilio_phone_number',
			to: phoneNumber,
		});
		console.log(`Verification code sent to ${phoneNumber}`, message.sid);
	} catch (error) {
		console.error('Error sending verification code:', error);
	}
}

function verifyCodeMiddleware(req: Request, res: Response, next: NextFunction): Response | void {
	const { phoneNumber, verificationCode }: { phoneNumber: string; verificationCode: string } = req.body;

	if (!verificationCodes[phoneNumber]) {
		return res.status(400).json({ error: 'Verification code not generated yet' });
	}

	if (verificationCodes[phoneNumber] === verificationCode) {
		// Code matched, proceed to the next step (e.g., signup)
		delete verificationCodes[phoneNumber]; // Clear the code once used
		return next();
	} else {
		return res.status(400).json({ error: 'Invalid verification code' });
	}
}

// Function to initiate sending the verification code
async function initiateVerification(req: Request, res: Response): Promise<Response> {
	const { phoneNumber }: { phoneNumber: string } = req.body;

	if (!phoneNumber) {
		return res.status(400).json({ error: 'Phone number is required' });
	}

	await sendVerificationCode(phoneNumber);
	return res.status(200).json({ message: 'Verification code sent' });
}

export {
	verifyCodeMiddleware,
	initiateVerification,
};
