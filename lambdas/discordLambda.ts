import * as AWS from 'aws-sdk';
import { SQSEvent } from 'aws-lambda';
import { getClips, getToken } from '../functions/axiosFunctions';
import { getDay } from '../functions/dateFunctions';

const CLIENT_ID = process.env.CLIENT_ID || '';
const CLIENT_SECRET = process.env.CLIENT_SECRET || '';

export async function handler(event: SQSEvent): Promise<any> {
	const message = event.Records.forEach(record => {
		const { body } = record;
		return body;
	});

	// parse this
	console.log(message);

	const time = await getDay();

	const token = await getToken({
		clientId: CLIENT_ID,
		clientSecret: CLIENT_SECRET,
	});

	const clips = await getClips({
		token: token,
		clientId: CLIENT_ID,
		broadcasterId: '500128827',
		first: 10,
		end: time.now,
		start: time.yesterday,
	});
	console.log(clips);
}