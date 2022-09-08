import axios from 'axios';

export const getToken = async ({ clientId, clientSecret }) => {
	try {
		const token = await axios.post('https://id.twitch.tv/oauth2/token', {
			client_id: clientId,
			client_secret: clientSecret,
			grant_type: 'client_credentials',
		});

		const { data: { access_token } } = token;
		return access_token;
	}
	catch (error) {
		console.log(error);
		throw error;
	}
};

export const getClips = async ({ token, clientId, broadcasterId, first, end, start }) => {
	try {
		const clips = await axios.get('https://api.twitch.tv/helix/clips', {
			headers: {
				'Authorization': `Bearer ${token}`,
				'Client-Id': clientId,
			},
			params: {
				broadcaster_id: broadcasterId,
				first: first,
				ended_at: end,
				started_at: start,
			},
		});

		const { data: { data } } = clips;
		return data;
	}
	catch (error) {
		console.log(error);
		throw error;
	}
};

export const sendWebhook = async ({ webhookId, webhookToken, content }) => {
	try {
		const sendMessage = await axios.post(`https://discord.com/api/v10/webhooks/${webhookId}/${webhookToken}`, {
			content: content,
		});

		return sendMessage;
	}
	catch (error) {
		console.log(error);
		throw error;
	}
};