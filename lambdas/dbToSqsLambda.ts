import * as AWS from 'aws-sdk';
import { scanTable, sendSqs } from './functions';

const TABLE_NAME = process.env.TABLE_NAME || '';
const QUEUE_URL = process.env.QUEUE_URL || '';

export const handler = async (): Promise<any> => {

	try {
		const dbItems = await scanTable(TABLE_NAME);
		if (!dbItems) return;

		for (const item in dbItems.Items) {
			await sendSqs({
				messageBody: JSON.stringify(item),
				queueUrl: QUEUE_URL,
			});
		}

	}
	catch (error) {
		return {
			statusCode: 500,
			body: JSON.stringify(error),
		};
	}
};