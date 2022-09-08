import * as AWS from 'aws-sdk';
import { SQSEvent } from 'aws-lambda';
import { getClips, getToken, sendWebhook } from '../functions/axiosFunctions';
import { getDay, sleep } from '../functions/dateFunctions';

const CLIENT_ID = process.env.CLIENT_ID || '';
const CLIENT_SECRET = process.env.CLIENT_SECRET || '';

export async function handler(event: SQSEvent): Promise<any> {
	const { body } = event.Records[0];
	const message = JSON.parse(body);

	try {
		const token = await getToken({
			clientId: CLIENT_ID,
			clientSecret: CLIENT_SECRET,
		});

		const time = await getDay();

		const clips = await getClips({
			token: token,
			clientId: CLIENT_ID,
			broadcasterId: message.streamerId,
			first: 10,
			end: time.now,
			start: time.yesterday,
		});

		if (clips.length === 0) {
			console.log(`no clips found for ${message.streamerId}`);
			return;
		}

		for (let index = 0; index < clips.length; index++) {
			try {
				const element = clips[index];

				await sendWebhook({
					webhookId: message.webhookId,
					webhookToken: message.webhookToken,
					content: `🎬 **${element.creator_name}** ${element.url}`,
				});

				await sleep(3500);
			}
			catch (error) {
				break;
			}
		}
	}
	catch (error) {
		return;
	}
}