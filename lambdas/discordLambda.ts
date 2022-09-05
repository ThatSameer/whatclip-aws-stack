import { SQSEvent } from 'aws-lambda';

export async function handler(event: SQSEvent): Promise<any> {
    const messages = event.Records.map(record => {
        const body = JSON.parse(record.body) as { Subject: string; Message: string };

        return { subject: body.Subject, message: body.Message };
    });

    console.log('messages 👉', JSON.stringify(messages, null, 2));

    return {
        body: JSON.stringify({ messages }),
        statusCode: 200,
    };
}