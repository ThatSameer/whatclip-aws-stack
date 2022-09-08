import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import events = require('aws-cdk-lib/aws-events');
import targets = require('aws-cdk-lib/aws-events-targets');
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { config } from 'dotenv';
config();

export class WhatclipAwsAppStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		const dynamoTable = new Table(this, 'whatclip-db', {
			partitionKey: {
				name: 'guildId',
				type: AttributeType.STRING,
			},
			tableName: 'whatclip-db',
		});

		const sqsQueue = new sqs.Queue(this, 'whatclip-sqs', {
			queueName: 'whatclip-sqs',
			deliveryDelay: Duration.seconds(10),
			visibilityTimeout: Duration.seconds(120),
			retentionPeriod: Duration.days(1),
		});

		const nodeJsFunctionProps: NodejsFunctionProps = {
			bundling: {
				externalModules: [
					'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime
				],
			},
			retryAttempts: 0,
			runtime: lambda.Runtime.NODEJS_16_X,
		};

		const dbToSqsLambda = new NodejsFunction(this, 'whatclip-db-to-sqs', {
			entry: path.join(__dirname, '../lambdas/dbToSqsLambda.ts'),
			timeout: Duration.seconds(60),
			environment: {
				PRIMARY_KEY: 'guildId',
				TABLE_NAME: dynamoTable.tableName,
				QUEUE_URL: sqsQueue.queueUrl,
			},
			...nodeJsFunctionProps,
		});

		dynamoTable.grantReadData(dbToSqsLambda);
		sqsQueue.grantSendMessages(dbToSqsLambda);

		const discordLambda = new NodejsFunction(this, 'whatclip-sqs-to-discord', {
			entry: path.join(__dirname, '../lambdas/discordLambda.ts'),
			timeout: Duration.seconds(90),
			environment: {
				CLIENT_ID: process.env.TWITCH_CLIENT_ID!,
				CLIENT_SECRET: process.env.TWITCH_CLIENT_SECRET!,
			},
			...nodeJsFunctionProps,
		});

		discordLambda.addEventSource(
			new SqsEventSource(sqsQueue, {
				batchSize: 1,
			}),
		);

		const rule = new events.Rule(this, 'whatclip-rule', {
			schedule: events.Schedule.cron({ minute: '0', hour: '22' }),
		});
		rule.addTarget(new targets.LambdaFunction(dbToSqsLambda));
	}
}
