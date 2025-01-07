import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import router from './routes/base.routes.js';
import './services/crons/crons.js';

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

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
});

// Apply the rate limiting middleware to all requests.
app.use(limiter);

// Database Connection
const mongoDBURI: string = process.env.MONGO_URI!;
await mongoose.connect(mongoDBURI);

app.get('/', (req: Request, res: Response) => {
	res.json({ message: 'App running successfully' });
});

// Routing
app.use(router);

app.use((req, res) => {
	res.status(404).json({
		success: false,
		message: 'Resource not found.',
		data: {},
	});
});

// Global error handler
app.use((err: any, req: Request, res: Response) => {
	console.log('Exception error: ', err);

	return res.status(500).json({
		success: false,
		message: 'Error occured. Please try again later.',
		data: {},
	});
});
// app.use((req, res, next) => {
// 	res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
// 	res.setHeader('Pragma', 'no-cache');
// 	res.setHeader('Expires', '0');
// 	next();
// });

const port = process.env.PORT || 8000;

app.listen(port, () => {
	console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
