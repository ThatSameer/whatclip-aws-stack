import * as AWS from 'aws-sdk';

const db = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS;

export const scanTable = async (tableName: string) => {
	try {
		const params = {
			TableName: tableName,
			FilterExpression: 'active = :true AND isAutoClipOn = :true AND webhookId <> :null AND webhookToken <> :null AND streamerId <> :null',
			ExpressionAttributeValues: {
				':true': true,
				':null': '',
			},
		};

		const scanResults = [];
		let items;
		do {
			items = await db.scan(params).promise();
			items.Items.forEach((item) => scanResults.push(item));
			params.ExclusiveStartKey = items.LastEvaluatedKey;
		} while (typeof items.LastEvaluatedKey != 'undefined');

		return scanResults;
	}
	catch (error) {
		throw error;
	}
};

export const sendSqs = async ({ messageBody, queueUrl }) => {
	try {
		const params = {
			MessageBody: messageBody,
			QueueUrl: queueUrl,
		};

		return await sqs.sendMessage(params).promise();
	}
	catch (error) {
		throw error;
	}
};