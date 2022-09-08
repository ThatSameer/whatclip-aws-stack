export const getDay = async () => {
	const date = new Date();
	const now = date.toISOString();
	date.setDate(date.getDate() - 1);
	const yesterday = date.toISOString();

	return {
		now,
		yesterday,
	};
};

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));