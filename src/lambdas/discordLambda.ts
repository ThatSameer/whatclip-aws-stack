import * as AWS from 'aws-sdk';
import { SQSEvent } from 'aws-lambda';
import { getClips, getToken, sendWebhook } from '../functions/axiosFunctions';
import { getDay, sleep } from '../functions/dateFunctions';

const CLIENT_ID = process.env.CLIENT_ID || '';
const CLIENT_SECRET = process.env.CLIENT_SECRET || '';
const TOKEN_URL = process.env.TOKEN_URL || '';
const CLIPS_URL = process.env.CLIPS_URL || '';
const WEBHOOK_URL = process.env.POST_WEBHOOK_URL || '';

export async function handler(event: SQSEvent): Promise<void> {
	const { body } = event.Records[0];
	const message = JSON.parse(body);

	try {
		const token = await getToken({
			tokenUrl: TOKEN_URL,
			clientId: CLIENT_ID,
			clientSecret: CLIENT_SECRET,
		});

		const time = await getDay();

		const clips = await getClips({
			clipsUrl: CLIPS_URL,
			token: token,
			clientId: CLIENT_ID,
			broadcasterId: message.streamerId,
			first: 10,
			end: time.now,
			start: time.yesterday,
		});

		if (clips.length === 0) {
			console.log(`No clips found for ${message.streamerId}`);
			return;
		}

		for (let index = 0; index < clips.length; index++) {
			try {
				const element = clips[index];

				await sendWebhook({
					webhookUrl: WEBHOOK_URL,
					webhookId: message.webhookId,
					webhookToken: message.webhookToken,
					content: `🎬 **${element.creator_name}** ${element.url}`,
				});

				await sleep(3500);
			}
			catch (error) {
				console.log(error);
				break;
			}
		}
	}
	catch (error) {
		console.log(error);
		return;
	}
}