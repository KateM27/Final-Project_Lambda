import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
// import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

import { getDocumentClient } from '@shelf/aws-ddb-with-xray';

const ddb = getDocumentClient({
  ddbParams: {region: 'us-east-1', convertEmptyValues: true},
  ddbClientParams: {region: 'us-east-1'},
});

// const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
    static createToDo(): TodoItem[] | PromiseLike<TodoItem[]> {
        throw new Error('Method not implemented.')
    }
    constructor(
        private readonly TodoTable = process.env.TODOS_TABLE,
        private readonly Attachments3Bucket = process.env.ATTACHMENT_S3_BUCKET,
        private readonly s3Client = new XAWS.S3({signatureVersion: 'v4'}),
        private readonly docClient: DocumentClient = ddb) {
    }
    async getToDo(userId:string): Promise<TodoItem[]> {
        console.log("Getting all todo items")

        const params = {
            TableName: this.TodoTable,
            ExpressionAttributeNames: {
                '#userId': 'userId'
            },
            ExpressionAttributeValues: {
                ':userId': `${userId}`
            },
            KeyConditionExpression: '#userId = :userId'
        };
        const result = await this.docClient.query(params).promise();
        console.log(result);
        const items = result.Items;

        return items as TodoItem[];
    }

    async createToDo(todoItem: TodoItem): Promise<TodoItem> {
        console.log("Creating new todo item");

        const params = {
            TableName: this.TodoTable,
            Item: todoItem,
        };
        const result = await this.docClient.put(params).promise();
        console.log(result);

        return todoItem as TodoItem;
    }

    async deleteToDo(userId: string, todoId: string): Promise<string> {
        console.log("Deleting todo items");

        const params = {
            TableName: this.TodoTable,
            Key: {
                userId,
                todoId
            },
        };
        const result = await this.docClient.delete(params).promise();
        console.log(result);

        return "" as string;
    }

    async updateToDo(todoUpdate: TodoUpdate, userId: string, todoId: string): Promise<TodoUpdate> {
        console.log("Updating todo items");

        const params = {
            TableName: this.TodoTable,
            Key: {
                userId,
                todoId
            },
            UpdateExpression: "set name = :a, dueDate = :b, done = :c",
            ExpressionAttributeValues: {
                ":a": todoUpdate['name'],
                ":b": todoUpdate['dueDate'],
                ":c": todoUpdate['done']
            },
            ReturnValues: "all_new"
        };
        const result = await this.docClient.update(params).promise();
        console.log(result);
        const attributes = result.Attributes;

        return attributes as TodoUpdate;
    }

    async generateUploadUrl(todoId: string): Promise<string> {
        console.log("Generating URL...");

        const url = this.s3Client.getSignedUrl('putObject', {
            Bucket: this.Attachments3Bucket,
            Key: todoId,
            Expires: 3600,
        });
        console.log(url);

        return url as string;
    }
}
