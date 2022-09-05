import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

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

		const sqsLambda = new NodejsFunction(this, 'whatclip-db-to-sqs', {
			entry: path.join(__dirname, '../lambdas/sqsLambda.ts'),
			timeout: Duration.seconds(60),
			environment: {
				PRIMARY_KEY: 'guildId',
				TABLE_NAME: dynamoTable.tableName,
			},
			...nodeJsFunctionProps,
		});

		dynamoTable.grantReadData(sqsLambda);

		const discordLambda = new NodejsFunction(this, 'whatclip-sqs-to-discord', {
			entry: path.join(__dirname, '../lambdas/discordLambda.ts'),
			timeout: Duration.seconds(90),
			...nodeJsFunctionProps,
		});

		discordLambda.addEventSource(
			new SqsEventSource(sqsQueue, {
				batchSize: 1,
			}),
		);


	}
}
