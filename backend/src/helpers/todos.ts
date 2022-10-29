import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'

const todoAccess = new TodosAccess()
const logger = createLogger('TodosBusiness')
const attachmentUtils = new AttachmentUtils()

export async function createTodo(
    userId: string,
    createTodoRequest: CreateTodoRequest
): Promise<TodoItem> {
    logger.info('Create todo')

    const itemId = uuid.v4()

    return await todoAccess.createTodo({
        userId: userId,
        todoId: itemId,
        createdAt: new Date().toISOString(),
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false
    })
}

export async function deleteTodo(userId: string, todoId: string): Promise<void> {
    logger.info('Delete todo')
    return todoAccess.deleteTodo(userId, todoId)
}

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    logger.info('Get todos for user ' + userId)
    return todoAccess.getTodosForUser(userId)
}

export async function updateTodo(userId: string, todoId: string, updateRequest: UpdateTodoRequest): Promise<void> {
    logger.info('Update todos')
    return todoAccess.updateTodo(userId, todoId, updateRequest)
}

export async function createAttachmentPresignedUrl(todoId: string): Promise<string> {
    logger.info('Create pre-signed url')
    return await attachmentUtils.createAttachmentPresignedUrl(todoId)
}

export async function todoExists(todoId: string): Promise<Boolean> {
    logger.info('Check todo exist')
    return await todoAccess.todoExists(todoId)
}