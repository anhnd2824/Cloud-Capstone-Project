import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')

import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todoTable = process.env.TODOS_TABLE) {
    }

    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
        logger.info('Create Todo', todoItem)

        await this.docClient.put({
            TableName: this.todoTable,
            Item: todoItem
        }).promise()

        return todoItem
    }

    async deleteTodo(userId: string, todoId: string): Promise<void> {
        logger.info('Delete Todo Id', todoId)

        await this.docClient.delete({
            TableName: this.todoTable,
            Key: {
                todoId,
                userId
            }
        }).promise()

        return
    }

    async getTodosForUser(userId: string): Promise<TodoItem[]> {
        logger.info('Get Todos for user ' + userId)

        const result = await this.docClient.query({
            TableName: this.todoTable,
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ":userId": userId
            }
        }).promise()

        const items = result.Items
        logger.info('Getted todos:' +items)
        return items as TodoItem[]
    }

    async updateTodo(userId: string, todoId: string, updateRequest: UpdateTodoRequest): Promise<void> {
        logger.info('Update Todo for user', userId)
        logger.info('Update Todo id', todoId)
        logger.info('New update Todo info', updateRequest)
        let todoUpdate: TodoUpdate = {
            ...updateRequest
          }
        await this.docClient.update({
            TableName: this.todoTable,
            Key: { 
                userId, 
                todoId 
            },
            UpdateExpression: 'set #N = :updateName, dueDate = :updateDueDate, done = :doneStatus',
            ExpressionAttributeNames: { 
                '#N': 'name'
            },
            ExpressionAttributeValues: {
                ':updateName': todoUpdate.name,
                ':updateDueDate': todoUpdate.dueDate,
                ':doneStatus': todoUpdate.done
            }
        }).promise()

        return
    }

    async todoExists(todoId: string): Promise<Boolean> {
        const result = await this.docClient.get({
            TableName: this.todoTable,
            Key: { todoId }
        }).promise()

        console.log('Todo existed', result)

        return !!result.Item
    }

    async updateAttachmentUrl(userId: string, todoId: string, uploadUrl: string): Promise<string> {
        logger.info('Update attachment'+ uploadUrl);

        await this.docClient.update({
            TableName: this.todoTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': uploadUrl.split("?")[0]
            }
        }, function (err, data) {
            if (err) logger.error(err);
            else logger.info(data);
        }).promise()
        logger.info('Update attachment result: ' + uploadUrl);
        return uploadUrl
    }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        console.log('Creating a local DynamoDB instance')
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new XAWS.DynamoDB.DocumentClient()
}