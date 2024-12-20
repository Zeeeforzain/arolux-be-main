import schedule from 'node-schedule';

const runJobs = async () => {
	if (
		process.env.ENV === 'production' ||
		process.env.ENV === 'localhost' ||
		process.env.ENV === 'development'
	) {
		console.log('Cron running');
	}
};

schedule.scheduleJob('*/30 * * * *', runJobs);
