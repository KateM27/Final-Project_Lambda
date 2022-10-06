import { TodosAccess } from './dataLayer'
// import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import { createLogger } from '../utils/logger'
import { v4 as uuid}  from 'uuid';
// import * as createError from 'http-errors'
import { parseUserId } from '../auth/utils';
import { TodoUpdate } from '../models/TodoUpdate';
// import { getNamespace } from 'aws-xray-sdk';

// TODO: Implement businessLogic
const todosAcess = new TodosAccess

export async function getTodo(jwtToken:string): Promise<TodoItem[]> {
    const userId = parseUserId(jwtToken);
    return todosAcess.getToDo(userId);  
}

export async function createToDo(CreateTodoRequest: CreateTodoRequest, jwtToken:string): Promise<TodoItem> {
    const userId = parseUserId(jwtToken);
    const todoId = uuid();
    const Attachments3Bucket = process.env.ATTACHMENT_S3_BUCKET

    return todosAcess.createToDo({
        userId: userId,
        todoId: todoId,
        createdAt: new Date().getTime().toString(),
        done: false,
        attachmentUrl: `http://${Attachments3Bucket}.s3.amazonaws.com/${todoId}`,
        ...CreateTodoRequest
    });
}

export function updateToDo(updateTodoRequest: UpdateTodoRequest, todoId: string, jwtToken: string): Promise<TodoUpdate> {
    const userId = parseUserId(jwtToken);
    
    return todosAcess.updateToDo(updateTodoRequest, todoId, userId);
}

export function deleteToDo(todoId: string, jwtToken: string): Promise<string> {
    const userId = parseUserId(jwtToken);
    
    return todosAcess.deleteToDo(userId, todoId);
}

export function generateUploadUrl(todoId: string): Promise<string> {
    return todosAcess.generateUploadUrl(todoId);
}