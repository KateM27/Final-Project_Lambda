import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

// import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos'
// import { getUserId } from '../utils';
import { getTodo } from '../../helpers/businessLogic';

// TODO: Get all TODO items for a current user
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]
    
    const todos = await getTodo(jwtToken)

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        "items": todos,
      }),
    }
  }
