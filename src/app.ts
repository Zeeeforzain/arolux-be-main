import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import router from './routes/base.routes.js';
import './services/crons/crons.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app: Express = express();

// Middlewares
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// For logging every incoming request
app.use(
	morgan(function (tokens: any, req: Request, res: Response) {
		return [
			tokens.method(req, res),
			tokens.url(req, res),
			tokens.status(req, res),
			tokens.res(req, res, 'content-length'),
			'-',
			tokens['response-time'](req, res),
			'ms',
		].join(' ');
	})
);
app.use('/invoices', express.static(path.join(__dirname, 'invoices')));

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
});

// Apply the rate limiting middleware to all requests.
app.use(limiter);

// Database Connection

// const fixieData = process.env.FIXIE_SOCKS_HOST?.split(
// 	new RegExp('[/(:\\/@/]+')
// );

// if (fixieData) {
// 	mongoose.connect(process.env.MONGO_URI!, {
// 		proxyUsername: fixieData[0],
// 		proxyPassword: fixieData[1],
// 		proxyHost: fixieData[2],
// 		proxyPort: +fixieData[3],
// 	});
// } else {
const mongoDBURI: string = process.env.MONGO_URI!;
await mongoose.connect(mongoDBURI);
// }

app.get('/', (req: Request, res: Response) => {
	res.json({ message: 'App running successfully' });
});

//Routing
app.use(router);

app.use((req, res) => {
	res.status(404).json({
		success: false,
		message: 'Resource not found.',
		data: {},
	});
});

app.use((err: any, req: Request, res: Response) => {
	console.log('Exception error: ', err);

	return res.status(500).json({
		success: false,
		message: 'Error occured. Please try again later.',
		data: {},
	});
});

const port = process.env.PORT || 8000;

app.listen(port, () => {
	console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
