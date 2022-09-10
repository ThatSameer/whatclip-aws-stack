import axios from 'axios';

export const getToken = async ({ tokenUrl, clientId, clientSecret }) => {
	try {
		const token = await axios.post(tokenUrl, {
			client_id: clientId,
			client_secret: clientSecret,
			grant_type: 'client_credentials',
		});

		const { data: { access_token } } = token;
		return access_token;
	}
	catch (error) {
		throw error;
	}
};

export const getClips = async ({ clipsUrl, token, clientId, broadcasterId, first, end, start }) => {
	try {
		const clips = await axios.get(clipsUrl, {
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
		throw error;
	}
};

export const sendWebhook = async ({ webhookUrl, webhookId, webhookToken, content }) => {
	try {
		const sendMessage = await axios.post(`${webhookUrl}/${webhookId}/${webhookToken}`, {
			content: content,
		});

		return sendMessage;
	}
	catch (error) {
		throw error;
	}
};