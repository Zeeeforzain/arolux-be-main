import Twilio from 'twilio';

const client = Twilio(
	process.env.TWILIO_ACCOUNT_SID,
	process.env.TWILIO_AUTH_TOKEN
);

export interface ISMSPayload {
	text: string;
	phoneNumber: string;
}

export async function sendSMS(payload: ISMSPayload) {
	await client.messages
		.create({
			body: payload.text,
			from: process.env.TWILIO_PHONE_NUMBER,
			to: payload.phoneNumber,
		})
		.then((message) => console.log(message.sid));
}
