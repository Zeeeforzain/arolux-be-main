import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

interface IPlayload {
	to: string;
	from: {
		name?: string;
		email: string;
	};
	cc?: string;
	subject: string;
	html: string;
}

export const sendEmail = async (payload: IPlayload) => {
	if (
		process.env.ENV === 'production' ||
		process.env.ENV === 'localhost' ||
		process.env.ENV === 'development'
	) {
		payload.from = {
			email: process.env.SENDGRID_SENDER_EMAIL || '',
			name: process.env.SENDGRID_SENDER_NAME || '',
		};

		sgMail
			.send(payload)
			.then(() => {
				console.log('Email sent to: ', payload.to);
			})
			.catch((error: any) => {
				console.error(JSON.stringify(error));
			});
	}
};
