import * as AWS from 'aws-sdk';
import { SQSEvent } from 'aws-lambda';
import { getToken } from '../functions/axiosFunctions';

const CLIENT_ID = process.env.CLIENT_ID || '';
const CLIENT_SECRET = process.env.CLIENT_SECRET || '';

export async function handler(event: SQSEvent): Promise<any> {
	const message = event.Records.forEach(record => {
		const { body } = record;
		return body;
	});

	// parse this
	console.log(message);

	const token = await getToken({
		clientId: CLIENT_ID,
		clientSecret: CLIENT_SECRET,
	});
	console.log(token?.data.access_token);
}