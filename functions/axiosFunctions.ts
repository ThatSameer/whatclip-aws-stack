import axios from 'axios';

export const getToken = async ({ clientId, clientSecret }) => {
	try {
		const token = await axios.post('https://id.twitch.tv/oauth2/token', {
			client_id: clientId,
			client_secret: clientSecret,
			grant_type: 'client_credentials',
		});

		// deconstruct this
		return token;
	}
	catch (error) {
		console.log(error);
		error;
	}
};